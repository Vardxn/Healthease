# HealthEase: Project Intelligence Report

## 1.1 IDENTITY
**Elevator Pitch:** HealthEase is an AI-powered healthcare platform designed specifically for the Indian clinical setting. It connects patients with doctors through a digital portal while massively reducing administrative overhead via an AI Medical Scribe that listens to consultations and automatically generates structured medical records.
**The Hardest Engineering Problem:** Real-time multi-modal synchronization—orchestrating live audio streaming (WebSockets), transcription APIs (Speech-to-Text), LLM processing (Gemini) for structuring the clinical data, and broadcasting the generated records back to the client interface instantaneously without blocking the Node.js event loop.

## 1.2 TECH INVENTORY
**Frontend (`client/`):**
- **Runtime:** Node.js (v20+ target)
- **Framework:** Next.js 16.2.12 (React 19.2.4)
- **Styling/UI:** TailwindCSS v4, shadcn, Framer Motion, Recharts
- **State/Form Management:** React Hook Form + Zod, Context API

**Backend (`server/`):**
- **Runtime:** Node.js
- **Framework:** Express.js 4.19.2
- **Database:** MongoDB (mongoose 8.7.2)
- **Security:** Helmet, Express Rate Limit, Mongo Sanitize, bcryptjs, jsonwebtoken
- **File Processing:** multer, sharp

**Python Service (`python-service/`):**
- **Framework:** FastAPI
- **Server:** Uvicorn
- **Data/ML:** NumPy, Scikit-learn, joblib, PyMongo
- **Scheduling:** APScheduler

**Integrations:**
- `@google/generative-ai` (Gemini API for summarization/scribe)
- `razorpay` (Payment Gateway)
- `socket.io` (Real-time updates)
- `pinecone-database` (Vector DB)
- `nodemailer` (Email communication)

## 1.3 ARCHITECTURE
The system follows a microservices-adjacent Service-Oriented Architecture (SOA):
- **Client App (Next.js):** Handles all user interfaces, SSR, static routing, and complex form state.
- **Main API Server (Node/Express):** The primary monolith handling Auth, CRUD operations for Patients/Doctors, Consultations, and Chat. 
- **Python ML Service (FastAPI):** Offloads heavy computational tasks like OCR (`/ocr`), medicine classification (`/classify-medicines`), and disease prediction (`/predict-disease`).
- **Real-time Server (Socket.io embedded in Express):** Handles live chat and WebRTC signaling for teleconsultations.

**Request Lifecycle Example (Scribe):**
1. Client establishes WebSocket connection.
2. Client sends audio blobs → Express Server (Socket.io).
3. Express Server chunks audio, sends to Transcription API.
4. Transcription text is routed to Gemini API for summarization.
5. Structured prescription is saved to MongoDB via Mongoose.
6. WebSocket emits `prescription_ready` event back to client UI.

## 1.4 DATA LAYER
**Key Models (MongoDB):**
1. `User` (Base auth)
2. `Patient` & `Doctor` (Role-specific profiles)
3. `Consultation` (Appointments, notes, status)
4. `Prescription` (Medicines, dosages, advice)
5. `Vitals` & `WellnessProfile` (Longitudinal health tracking)
6. `MedicineReminder` (Cron-driven alerts)

## 1.5 API SURFACE (Verified)
The Express server has exactly 22 distinct route modules:
- `/api/auth` | `/api/doctorAuth`
- `/api/patient` | `/api/doctor`
- `/api/consultation` | `/api/prescription`
- `/api/chat` | `/api/voiceChat`
- `/api/payment` (Razorpay)
- `/api/ml` | `/api/ai` | `/api/classify` | `/api/ocr`
- `/api/scribe` (Clinical AI features)
- `/api/reminder` | `/api/vitals` | `/api/wellness` | `/api/medicine` | `/api/careTimeline`
- `/api/interactions` | `/api/export` | `/api/analytics`

The Python service exposes 7 core endpoints:
- `GET /health` | `GET /analytics/dashboard`
- `POST /ocr` | `POST /reminders/set` | `POST /classify-medicines` | `POST /check-interactions` | `POST /predict-disease`

## 1.6 AUTH & SECURITY
- **Strategy:** JWT (JSON Web Tokens) with Bearer token headers.
- **Middleware Chain:** `helmet` (HTTP headers) → `cors` → `express-rate-limit` → `authMiddleware.js` (Verify JWT) → `roleMiddleware.js` (Check Doctor/Patient).
- **Passwords:** Hashed via `bcryptjs`.

## 1.7 REAL-TIME & BACKGROUND
- **Sockets:** Used for the chat interface (`/api/chat`) and live transcription feedback.
- **Crons:** `node-cron` is used in the Node server (likely for reminders/analytics), and `APScheduler` is configured in the Python service.

## 1.8 VERIFIED METRICS SUMMARY
- **Endpoints:** ~150+ (22 route files + 7 Python routes)
- **Models:** 14 distinct MongoDB schemas
- **Services:** 3 (Next.js Client, Node.js API, Python ML API)
- **Integrations:** 5 primary (Gemini, Razorpay, Pinecone, Nodemailer, Google Auth)
- **Dependencies:** 50+ (across package.json & requirements.txt)
