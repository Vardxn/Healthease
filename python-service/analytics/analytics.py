import os
from datetime import datetime

from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()


def _get_db():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/healthease")
    client = MongoClient(mongo_uri)
    db = client.healthease
    return client, db


def _safe_object_id(user_id: str):
    try:
        return ObjectId(user_id)
    except Exception:
        return None


def get_prescription_timeline(user_id: str):
    """Return monthly prescription counts for the last 6 months."""
    oid = _safe_object_id(user_id)
    if not oid:
        return []

    client, db = _get_db()
    try:
        now = datetime.utcnow()
        current_month_start = datetime(now.year, now.month, 1)

        month_starts = []
        for i in range(5, -1, -1):
            y = current_month_start.year
            m = current_month_start.month - i
            while m <= 0:
                y -= 1
                m += 12
            month_starts.append(datetime(y, m, 1))

        first_month_start = month_starts[0]

        pipeline = [
            {
                "$match": {
                    "patientId": oid,
                    "uploadDate": {"$gte": first_month_start},
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$uploadDate"},
                        "month": {"$month": "$uploadDate"},
                    },
                    "count": {"$sum": 1},
                }
            },
        ]

        results = list(db.prescriptions.aggregate(pipeline))
        counts_map = {
            (row["_id"]["year"], row["_id"]["month"]): row["count"] for row in results
        }

        timeline = []
        for dt in month_starts:
            timeline.append(
                {
                    "month": dt.strftime("%b %Y"),
                    "count": counts_map.get((dt.year, dt.month), 0),
                }
            )

        return timeline
    finally:
        client.close()


def get_top_medications(user_id: str):
    """Return top 5 medication names by count for the user."""
    oid = _safe_object_id(user_id)
    if not oid:
        return []

    client, db = _get_db()
    try:
        pipeline = [
            {"$match": {"patientId": oid}},
            {"$unwind": "$medications"},
            {
                "$project": {
                    "name": {
                        "$trim": {
                            "input": {
                                "$ifNull": ["$medications.name", ""]
                            }
                        }
                    }
                }
            },
            {"$match": {"name": {"$ne": ""}}},
            {"$group": {"_id": "$name", "count": {"$sum": 1}}},
            {"$sort": {"count": -1, "_id": 1}},
            {"$limit": 5},
        ]

        results = list(db.prescriptions.aggregate(pipeline))
        return [{"name": row["_id"], "count": row["count"]} for row in results]
    finally:
        client.close()


def get_medication_frequency(user_id: str):
    """Return medication frequency distribution for the user."""
    oid = _safe_object_id(user_id)
    if not oid:
        return []

    client, db = _get_db()
    try:
        pipeline = [
            {"$match": {"patientId": oid}},
            {"$unwind": "$medications"},
            {
                "$project": {
                    "frequency": {
                        "$trim": {
                            "input": {
                                "$ifNull": ["$medications.frequency", "Unknown"]
                            }
                        }
                    }
                }
            },
            {
                "$project": {
                    "frequency": {
                        "$cond": [
                            {"$eq": ["$frequency", ""]},
                            "Unknown",
                            "$frequency",
                        ]
                    }
                }
            },
            {"$group": {"_id": "$frequency", "count": {"$sum": 1}}},
            {"$sort": {"count": -1, "_id": 1}},
        ]

        results = list(db.prescriptions.aggregate(pipeline))
        return [{"frequency": row["_id"], "count": row["count"]} for row in results]
    finally:
        client.close()


def get_health_summary(user_id: str):
    """Return high-level summary stats for analytics dashboard."""
    oid = _safe_object_id(user_id)
    if not oid:
        return {
            "total_prescriptions": 0,
            "active_medications": 0,
            "reminders_set": 0,
            "last_upload": None,
        }

    client, db = _get_db()
    try:
        total_prescriptions = db.prescriptions.count_documents({"patientId": oid})

        latest_rx = db.prescriptions.find_one(
            {"patientId": oid},
            sort=[("uploadDate", -1)],
            projection={"medications": 1, "uploadDate": 1},
        )

        active_medications = 0
        last_upload = None
        if latest_rx:
            meds = latest_rx.get("medications", [])
            active_medications = len(meds) if isinstance(meds, list) else 0
            upload_date = latest_rx.get("uploadDate")
            if upload_date:
                last_upload = upload_date.isoformat()

        reminders_set = db.prescriptions.count_documents(
            {
                "patientId": oid,
                "reminder.enabled": True,
            }
        )

        adherence_rate = 0.0
        if total_prescriptions > 0:
            adherence_rate = round((reminders_set / total_prescriptions) * 100, 1)

        return {
            "total_prescriptions": total_prescriptions,
            "active_medications": active_medications,
            "reminders_set": reminders_set,
            "adherence_rate": adherence_rate,
            "last_upload": last_upload,
        }
    finally:
        client.close()


def get_top_diagnoses(user_id: str):
    """Return top 5 diagnosis labels for the user, excluding unclear/empty values."""
    oid = _safe_object_id(user_id)
    if not oid:
        return []

    client, db = _get_db()
    try:
        pipeline = [
            {"$match": {"patientId": oid}},
            {
                "$project": {
                    "diagnosis": {
                        "$trim": {
                            "input": {
                                "$ifNull": ["$diagnosis", ""]
                            }
                        }
                    }
                }
            },
            {
                "$match": {
                    "diagnosis": {
                        "$nin": ["", "UNCLEAR", "NONE", "N/A", "unclear", "none", "n/a"]
                    }
                }
            },
            {"$group": {"_id": "$diagnosis", "count": {"$sum": 1}}},
            {"$sort": {"count": -1, "_id": 1}},
            {"$limit": 5},
        ]

        results = list(db.prescriptions.aggregate(pipeline))
        return [{"diagnosis": row["_id"], "count": row["count"]} for row in results]
    finally:
        client.close()


def get_recent_prescriptions(user_id: str):
    """Return the latest 5 prescriptions for activity feed UI."""
    oid = _safe_object_id(user_id)
    if not oid:
        return []

    client, db = _get_db()
    try:
        rows = list(
            db.prescriptions.find(
                {"patientId": oid},
                projection={
                    "uploadDate": 1,
                    "doctorName": 1,
                    "isVerified": 1,
                    "medications": 1,
                },
                sort=[("uploadDate", -1)],
                limit=5,
            )
        )

        activity = []
        for row in rows:
            meds = row.get("medications", [])
            med_count = len(meds) if isinstance(meds, list) else 0
            upload_date = row.get("uploadDate")

            activity.append(
                {
                    "id": str(row.get("_id")),
                    "date": upload_date.isoformat() if upload_date else None,
                    "doctor_name": row.get("doctorName") or "UNCLEAR",
                    "medication_count": med_count,
                    "is_verified": bool(row.get("isVerified")),
                }
            )

        return activity
    finally:
        client.close()
