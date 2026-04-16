import os
import base64
import io
from contextlib import asynccontextmanager
from typing import Optional

import PIL.Image
from PIL.Image import Resampling
import groq
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient

from reminders.scheduler import start_scheduler, stop_scheduler
from analytics.analytics import (
    get_health_summary,
    get_medication_frequency,
    get_prescription_timeline,
    get_top_medications,
    get_top_diagnoses,
    get_recent_prescriptions,
)

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client: Optional[groq.Groq] = groq.Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'

OCR_PROMPT = """
You are a medical OCR expert. Extract ALL text from this prescription image carefully.

This may be any prescription format - handwritten, printed, Indian, Western, or military.

Return EXACTLY in this format:
DOCTOR: [name or UNCLEAR]
PATIENT: [name or UNCLEAR]
AGE: [age or UNCLEAR]
DATE: [date or UNCLEAR]
DIAGNOSIS: [diagnosis or UNCLEAR]
MEDICATIONS:
- [med name] | [dosage] | [frequency] | [duration]
INVESTIGATIONS: [tests ordered or NONE]
OTHER: [other instructions or NONE]

IMPORTANT RULES:
- For MEDICATIONS: map any instruction line (Signa, Sig, directions) to frequency/duration
- Extract EVERY drug/medicine name visible, even if format is unusual
- If dosage is written as volume (e.g. 5ml), keep it as-is
- Never return empty MEDICATIONS if drug names are visible
- Read every handwritten word carefully
- Return only the structured text, no explanations.
"""


# ============ Startup & Shutdown ============
@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan context manager for startup and shutdown events"""
    if GROQ_API_KEY:
        print("Groq Vision OCR service ready ✅")

    # Startup
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()


app = FastAPI(
    title="HealthEase OCR Service",
    version="1.0.0",
    lifespan=lifespan
)

allowed_origins = [
    "http://localhost:3000",
    os.getenv("CLIENT_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in allowed_origins if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "python-groq-ocr"}


@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        if not GROQ_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="GROQ_API_KEY is missing. Please set it in python-service/.env"
            )

        try:
            image = PIL.Image.open(io.BytesIO(content))
            image = image.convert("RGB")

            # Resize to max 2000px for faster processing
            max_size = 2000
            ratio = min(max_size / image.width, max_size / image.height, 1)
            new_size = (int(image.width * ratio), int(image.height * ratio))
            image = image.resize(new_size, Resampling.LANCZOS)

            # Convert to base64
            jpeg_buffer = io.BytesIO()
            image.save(jpeg_buffer, format="JPEG", quality=85)
            image_bytes = jpeg_buffer.getvalue()
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")

            assert groq_client is not None
            response = groq_client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_b64}"
                                }
                            },
                            {"type": "text", "text": OCR_PROMPT}
                        ]
                    }
                ],
                max_tokens=1000
            )
            extracted_text = response.choices[0].message.content
            if DEBUG:
                print("=" * 50)
                print("GROQ RAW RESPONSE:")
                print(extracted_text)
                print("TEXT LENGTH:", len(extracted_text or ""))
                print("=" * 50)
            return {"text": extracted_text}
        except Exception as exc:
            return {"text": "", "error": str(exc)}
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(exc)}") from exc


# ============ Reminder Models ============
class SetReminderRequest(BaseModel):
    """Request model for setting medication reminders"""
    prescriptionId: str
    reminderTimes: list[str]  # List of times in HH:MM format
    enabled: bool = True


# ============ Reminder Endpoints ============
@app.post("/reminders/set")
async def set_reminder(request: SetReminderRequest):
    """
    Set medication reminders for a prescription
    
    Args:
        prescriptionId: MongoDB ObjectId of the prescription
        reminderTimes: List of reminder times in HH:MM format (e.g., ["08:00", "14:00", "21:00"])
        enabled: Whether reminders are enabled
    
    Returns:
        {"success": true, "message": "Reminder configured"}
    """
    try:
        # Connect to MongoDB
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/healthease')
        client = MongoClient(mongo_uri)
        db = client.healthease
        prescriptions_col = db.prescriptions
        
        # Convert string ID to ObjectId
        from bson import ObjectId
        try:
            prescription_id = ObjectId(request.prescriptionId)
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid prescriptionId format"
            )
        
        # Validate reminder times format (HH:MM)
        for time_str in request.reminderTimes:
            try:
                parts = time_str.split(':')
                if len(parts) != 2:
                    raise ValueError()
                hour, minute = int(parts[0]), int(parts[1])
                if not (0 <= hour <= 23 and 0 <= minute <= 59):
                    raise ValueError()
            except (ValueError, IndexError):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid time format: {time_str}. Use HH:MM (e.g., 08:00)"
                )
        
        # Update prescription with reminder config
        result = prescriptions_col.update_one(
            {"_id": prescription_id},
            {
                "$set": {
                    "reminder": {
                        "enabled": request.enabled,
                        "times": request.reminderTimes,
                        "lastSentAt": None
                    }
                }
            }
        )
        
        client.close()
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Prescription not found"
            )
        
        return {
            "success": True,
            "message": "Reminder configured successfully",
            "prescriptionId": request.prescriptionId,
            "reminderTimes": request.reminderTimes,
            "enabled": request.enabled
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error setting reminder: {str(e)}"
        )


@app.get("/analytics/dashboard")
async def analytics_dashboard(user_id: str):
    """Return analytics dashboard data for a user."""
    try:
        timeline = get_prescription_timeline(user_id)
        top_medications = get_top_medications(user_id)
        medication_frequency = get_medication_frequency(user_id)
        top_diagnoses = get_top_diagnoses(user_id)
        recent_prescriptions = get_recent_prescriptions(user_id)
        summary = get_health_summary(user_id)

        return {
            "timeline": timeline,
            "top_medications": top_medications,
            "medication_frequency": medication_frequency,
            "top_diagnoses": top_diagnoses,
            "recent_prescriptions": recent_prescriptions,
            "summary": summary,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(exc)}") from exc
