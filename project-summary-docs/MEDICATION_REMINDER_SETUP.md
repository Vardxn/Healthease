================================================================================
                 MEDICATION REMINDER SYSTEM - SETUP GUIDE
================================================================================

Complete implementation of a medication reminder system across your MERN + 
Python stack. Reminders are sent via email at scheduled times daily.

================================================================================
FILES CREATED / MODIFIED
================================================================================

PYTHON SERVICE (/python-service)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ NEW: reminders/scheduler.py
   - APScheduler-based background job that runs every minute
   - Queries MongoDB for prescriptions with enabled reminders
   - Checks if current time matches scheduled reminder times
   - Tracks last sent timestamp to prevent duplicate daily sends
   - Calls email_sender.send_reminder_email()

✨ NEW: reminders/email_sender.py
   - Sends styled HTML reminder emails via SMTP
   - Displays medication name, dosage, frequency
   - Configuration via .env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)
   - Includes HealthEase branding

📝 MODIFIED: main.py
   - Added POST /reminders/set endpoint for setting reminders
   - Accepts: { prescriptionId, reminderTimes: ["08:00", "14:00"], enabled: true }
   - Initializes scheduler on app startup (lifespan context)
   - Validates reminder time format (HH:MM)
   - Stores reminder config directly in MongoDB

✅ UPDATED: requirements.txt
   - Added: apscheduler, pymongo, python-dotenv

NODE.JS BACKEND (/server)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ NEW: routes/reminderRoutes.js
   - POST /api/reminders/set (Protected)
     → Validates user authorization
     → Proxies to Python service at PYTHON_OCR_URL/reminders/set
     → Returns success confirmation
   
   - GET /api/reminders/:prescriptionId (Protected)
     → Fetches current reminder config for a prescription
     → Returns reminder enabled status and times array

📝 MODIFIED: server.js
   - Registered reminder routes: app.use('/api/reminders', reminderRoutes)

📝 MODIFIED: models/Prescription.js
   - Added reminder object with fields:
     * enabled: Boolean (default: false)
     * times: [String] - HH:MM format reminder times
     * lastSentAt: Date - tracks last daily send

REACT FRONTEND (/client)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ NEW: src/components/ReminderModal.jsx
   - Beautiful modal component with:
     ✓ Enable/Disable toggle
     ✓ Time picker for up to 4 reminder times
     ✓ Add/Remove time slots
     ✓ Success/Error notifications
     ✓ Medication list display
     ✓ Tailored error validation

📝 MODIFIED: src/pages/PrescriptionList.jsx
   - Added 🔔 Reminders button to each prescription card
   - Integrated ReminderModal component
   - Handlers for modal open/close

📝 MODIFIED: src/services/api.js
   - Added reminderAPI with:
     * setReminder(data) - POST /api/reminders/set
     * getReminder(prescriptionId) - GET /api/reminders/:prescriptionId

================================================================================
ENVIRONMENT SETUP
================================================================================

1. UPDATE /python-service/.env
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   MONGO_URI=mongodb://localhost:27017/healthease
   
   # SMTP Configuration for email reminders
   SMTP_HOST=smtp.gmail.com              # E.g., Gmail, AWS SES, Mailgun
   SMTP_PORT=587                          # Usually 587 (TLS) or 465 (SSL)
   SMTP_USER=your-email@gmail.com         # Your email account
   SMTP_PASS=your-app-password            # Gmail: use App Password, not regular password
   SMTP_FROM=noreply@healthease.com       # Sender email address

2. UPDATE /server/.env (already has PYTHON_OCR_URL)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   PYTHON_OCR_URL=http://localhost:8000/ocr     # Ensure this is set

3. INSTALL PYTHON DEPENDENCIES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   cd /Users/vardxn/Developer/personal/health-ease/python-service
   python3 -m pip install -r requirements.txt

================================================================================
SMTP CONFIGURATION EXAMPLES
================================================================================

GMAIL (Recommended for testing)
───────────────────────────────────────────────────────────────────────────────
1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use in .env:

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=youremail@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM=youremail@gmail.com


AWS SES (Production)
───────────────────────────────────────────────────────────────────────────────
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=AKIA...
   SMTP_PASS=your-smtp-password
   SMTP_FROM=noreply@yourdomain.com

   Create SMTP credentials in AWS SES → Account Dashboard → SMTP settings


Mailgun
───────────────────────────────────────────────────────────────────────────────
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=postmaster@yourdomain.mailgun.org
   SMTP_PASS=your-mailgun-smtp-password
   SMTP_FROM=noreply@yourdomain.mailgun.org


Sendgrid
───────────────────────────────────────────────────────────────────────────────
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   SMTP_FROM=noreply@yourdomain.com

================================================================================
HOW IT WORKS
================================================================================

USER FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. User views prescription in PrescriptionList
2. Clicks 🔔 Reminders button
3. ReminderModal opens showing:
   - Medications in prescription
   - Toggle to enable/disable reminders
   - Time picker (up to 4 times daily)
4. User selects reminder times and clicks "Save Reminders"
5. Frontend calls POST /api/reminders/set with data
6. Backend validates and proxies to Python /reminders/set endpoint
7. Python service updates MongoDB prescription document with reminder config
8. From then on, scheduler sends email reminders daily at scheduled times


BACKGROUND PROCESS (Python Service)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Python service starts on port 8000
2. FastAPI lifespan initializes APScheduler
3. Scheduler job runs every 1 minute:
   - Query: prescriptions where reminder.enabled = true
   - For each prescription:
     - Check if current time (HH:MM) matches any reminder time
     - If match found:
       * Check if already sent today (via lastSentAt)
       * If not sent:
         - Fetch user email from MongoDB
         - Send styled HTML email with meds info
         - Update prescription.reminder.lastSentAt
     - Run once per day due to date-based tracking

EXAMPLE TIMELINE:
   - 08:00 AM: Patient searches for prescriptions, sets reminders at 08:00, 14:00, 21:00
   - 08:01 AM: Scheduler runs, finds match for 08:00, sends first email
   - 08:02 AM: lastSentAt updated to today
   - 08:03 AM: Scheduler runs again, sees lastSentAt is today, skips send
   - 14:00 PM: Scheduler runs, finds match for 14:00, sends email (lastSentAt NOT reset)
   - 21:00 PM: Scheduler runs, finds match for 21:00, sends email
   - 11:59 PM: lastSentAt still shows today
   - 12:01 AM (next day): lastSentAt now <> today, reset occurs
   - 08:00 AM (next day): Cycle repeats


DATA FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend                    Node Backend           Python Service           MongoDB
   │                             │                       │                    │
   ├─ 🔔 Reminders click ────────┤                       │                    │
   │                             │                       │                    │
   │  POST /api/reminders/set    │                       │                    │
   │ {"prescriptionId": "...",   │                       │                    │
   │  "reminderTimes": [...]     │                       │                    │
   │ ├─ Validate JWT ────────────┤                       │                    │
   │ ├─ Verify ownership ────────┤                       │                    │
   │ │                           │                       │                    │
   │ │  POST /reminders/set      │                       │                    │
   │ │ ─────────────────────────────► Connect MongoDB   │                    │
   │ │                           │     Update reminder    │                    │
   │ │                           │ ────────────────────────────────────────┐   │
   │ │                           │                       │                 │   │
   │ │                           │◄─ Success response ─────────────────────┘   │
   │ │                           │                       │                    │
   │ │◄─ Return response ────────│                       │                    │
   │ │                           │                       │                    │
   └─ Show toast ™           │                       │                    │

================================================================================
TESTING REMINDERS
================================================================================

1. START ALL SERVICES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   Terminal 1: Python OCR + Reminders
     cd /Users/vardxn/Developer/personal/health-ease/python-service
     python3 -m uvicorn main:app --reload --port 8000
   
   Terminal 2: Node Backend
     cd /Users/vardxn/Developer/personal/health-ease/server
     npm run dev
   
   Terminal 3: React Frontend
     cd /Users/vardxn/Developer/personal/health-ease/client
     npm run dev
     → Open http://localhost:3000

2. TEST UI
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   - Login/Register account
   - Upload a prescription (OCR will create medications)
   - Go to prescriptions list
   - Click 🔔 Reminders on any prescription
   - Set reminder times (e.g., "10:00", "15:00")
   - Click "Save Reminders"
   - Verify success toast appears

3. DEBUG LOGS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   Python service logs (Terminal 1):
   - ✅ Medication Reminder Scheduler started
   - INFO: 127.0.0.1:xxx - "POST /reminders/set HTTP/1.1" 200 OK
   
   Backend logs (Terminal 2):
   - Should show proxy activity to Python service
   
   To manually test email sending:
     python3 -c "from reminders.email_sender import send_reminder_email; \
     send_reminder_email('your-email@gmail.com', 'Test User', \
     [{'name': 'Aspirin', 'dosage': '500mg', 'frequency': 'twice daily'}], '14:30')"

================================================================================
KEY FEATURES
================================================================================

✅ Scheduled Email Reminders
   - One-minute interval check for prescriptions
   - Time-based matching with daily deduplication
   - Beautiful HTML email templates

✅ User-Friendly UI
   - Modal component for easy reminder setup
   - Visual time picker with add/remove slots
   - Shows medications in the prescription
   - Real-time validation feedback

✅ Database Integration
   - MongoDB schema with reminder sub-document
   - Tracks enabled status, times, and last send
   - Prescription ownership verified

✅ Security
   - JWT authentication on all endpoints
   - User authorization checks
   - Protected routes via middleware

✅ Flexible SMTP
   - Works with Gmail, AWS SES, Mailgun, Sendgrid
   - Configurable via .env
   - Handles auth failures gracefully

✅ Scalability
   - Background scheduler independent of HTTP requests
   - No blocking operations
   - Optimized MongoDB queries

================================================================================
TROUBLESHOOTING
================================================================================

SCHEDULER NOT STARTING?
───────────────────────────────────────────────────────────────────────────────
Check Python service logs:
  ✅ Medication Reminder Scheduler started  ← Should appear on startup

If missing:
  - Ensure apscheduler is installed: pip install apscheduler
  - Check .env file is loaded correctly
  - Verify no exceptions in FastAPI startup

EMAILS NOT BEING SENT?
───────────────────────────────────────────────────────────────────────────────
1. Check Python service logs for:
   - "❌ SMTP Authentication failed" → Wrong email/password
   - "❌ SMTP error" → Connection issues
   - "⚠️ SMTP config incomplete" → Missing .env vars

2. Verify .env is configured:
   cat /Users/vardxn/Developer/personal/health-ease/python-service/.env

3. Test SMTP manually:
   python3 -c "
   import smtplib
   try:
       server = smtplib.SMTP('smtp.gmail.com', 587)
       server.starttls()
       server.login('your-email@gmail.com', 'your-app-password')
       print('✅ SMTP connection successful')
       server.quit()
   except Exception as e:
       print(f'❌ SMTP error: {e}')
   "

4. For Gmail, ensure App Password is used (not account password)

REMINDERS NOT SHOWING IN DATABASE?
───────────────────────────────────────────────────────────────────────────────
Check MongoDB:
  mongosh
  > use healthease
  > db.prescriptions.findOne({_id: ObjectId("...")})
  > // Look for "reminder" field

If missing, set reminder test:
  python3 -c "
  import os
  from pymongo import MongoClient
  mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/healthease')
  client = MongoClient(mongo_uri)
  db = client.healthease
  # Find a prescription and check
  prescription = db.prescriptions.find_one()
  print(prescription.get('reminder'))
  "

MODAL NOT OPENING?
───────────────────────────────────────────────────────────────────────────────
- Check browser console for JS errors (F12)
- Verify prescriptionID is valid
- Check if fetch calls are working (Network tab)
- Ensure ReminderModal component is imported

================================================================================
DEPLOYMENT NOTES
================================================================================

For production:
1. Use managed email service (AWS SES, Mailgun, SendGrid)
2. Store .env securely (e.g., environment variables)
3. Monitor scheduler health
4. Set up logging to track email sends
5. Consider rate limiting on /reminders/set endpoint
6. Test email delivery before going live

================================================================================

Questions? Check the logs, verify .env config, and ensure all services are 
running. The reminder system is now fully integrated! 💊📧
