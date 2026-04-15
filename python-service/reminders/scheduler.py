"""
Medication Reminder Scheduler
Runs periodic jobs every minute to check and send medication reminders
"""

import os
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from pymongo import MongoClient
from .email_sender import send_reminder_email

scheduler = BackgroundScheduler()

def get_mongo_client():
    """Create MongoDB connection from .env"""
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/healthease')
    return MongoClient(mongo_uri)

def check_and_send_reminders():
    """
    Check MongoDB for prescriptions with enabled reminders
    whose scheduled time matches current time (within 1 min window)
    and send email notifications
    """
    try:
        client = get_mongo_client()
        db = client.healthease
        prescriptions_col = db.prescriptions
        users_col = db.users
        
        # Get current time in HH:MM format
        now = datetime.now()
        current_time = now.strftime("%H:%M")
        today = now.date()
        
        # Query: prescriptions with enabled reminders
        query = {
            "reminder.enabled": True,
            "reminder.times": {"$exists": True, "$ne": []}
        }
        
        reminders_to_send = prescriptions_col.find(query)
        
        for prescription in reminders_to_send:
            reminder_config = prescription.get("reminder", {})
            reminder_times = reminder_config.get("times", [])
            last_sent_at = reminder_config.get("lastSentAt")
            
            # Check if any scheduled time matches current time
            for scheduled_time in reminder_times:
                # Match if within 1 minute window: scheduled_time <= current_time < next_minute
                if scheduled_time == current_time:
                    # Check if reminder was already sent today for this time slot
                    should_send = True
                    
                    if last_sent_at:
                        last_sent_date = last_sent_at.date() if isinstance(last_sent_at, datetime) else last_sent_at
                        # Reset lastSentAt daily at midnight
                        if last_sent_date == today:
                            # Already sent today, skip
                            should_send = False
                    
                    if should_send:
                        # Fetch user email
                        user = users_col.find_one({"_id": prescription.get("patientId")})
                        if user and user.get("email"):
                            # Send email
                            medications = prescription.get("medications", [])
                            success = send_reminder_email(
                                user_email=user["email"],
                                user_name=user.get("name", "Patient"),
                                medications=medications,
                                reminder_time=scheduled_time
                            )
                            
                            if success:
                                # Update lastSentAt timestamp
                                prescriptions_col.update_one(
                                    {"_id": prescription["_id"]},
                                    {
                                        "$set": {
                                            "reminder.lastSentAt": datetime.now()
                                        }
                                    }
                                )
        
        client.close()
        
    except Exception as e:
        print(f"Error in check_and_send_reminders: {str(e)}")

def start_scheduler():
    """
    Start the background scheduler
    Runs check_and_send_reminders every minute
    """
    if not scheduler.running:
        # Add job to run every minute
        scheduler.add_job(
            check_and_send_reminders,
            'interval',
            minutes=1,
            id='medication_reminder_job',
            name='Check and Send Medication Reminders',
            replace_existing=True,
            max_instances=1
        )
        scheduler.start()
        print("✅ Medication Reminder Scheduler started")

def stop_scheduler():
    """Stop the background scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        print("⏹️ Medication Reminder Scheduler stopped")
