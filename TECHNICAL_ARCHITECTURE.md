# HealthEase Technical Architecture

## 1. Objective
This document explains the technical architecture of HealthEase for engineering reviews, interviews, and technical presentations.

## 2. System Overview
HealthEase is a full-stack web platform with:
- React frontend for user interaction.
- Express backend API for auth, prescriptions, OCR, and chat.
- MongoDB for user and prescription persistence.
- Python FastAPI OCR microservice with OpenCV preprocessing and Tesseract extraction.
- OpenAI integrations for prescription structuring and assistant responses.

## 3. High-Level Architecture
```mermaid
flowchart LR
  U[User Browser] --> FE[React + Vite Frontend]
  FE --> API[Node.js + Express API]
  API --> DB[(MongoDB)]
  API --> PYOCR[Python FastAPI OCR Service]
  PYOCR --> TESS[Tesseract + OpenCV]
  API --> OPENAI[OpenAI API]
  API --> STT[Sarvam or Bhashini STT]
```

## 4. Deployment Topology
- Frontend is built with Vite and served as static assets.
- Backend is an Express app that can run as:
  - Local Node server.
  - Vercel serverless function via server/api/index.js.
- Vercel routing sends /api/* traffic to backend and everything else to frontend index route.

## 5. Backend Module Architecture
```mermaid
flowchart TD
  S[server.js] --> R1[routes/authRoutes.js]
  S --> R2[routes/prescriptionRoutes.js]
  S --> R3[routes/chatRoutes.js]
  S --> R4[routes/voiceChatRoutes.js]
  S --> R5[routes/ocrRoutes.js]

  R1 --> C1[controllers/authController.js]
  R2 --> C2[controllers/prescriptionController.js]
  R3 --> C3[controllers/chatController.js]
  R4 --> C4[controllers/voiceChatController.js]
  R5 --> C5[controllers/ocrController.js]

  C2 --> SV1[services/ocrService.js]
  SV1 --> PY[python-service/main.py /ocr]
  C3 --> SV2[services/chatService.js]
  C4 --> SV3[services/indicSttService.js]

  C1 --> M1[models/User.js]
  C2 --> M2[models/Prescription.js]
  C3 --> M1
  C3 --> M2

  R1 --> MW1[middleware/auth.js]
  R2 --> MW1
  R2 --> MW2[middleware/upload.js]
  R4 --> MW1
  R4 --> MW3[middleware/uploadAudio.js]
```

## 6. Frontend Composition
- App shell: router, navbar, page container, chatbot widget.
- Pages:
  - Dashboard
  - Login
  - Register
  - Upload Prescription
  - Prescription List
  - Profile
- Cross-cutting state: AuthContext (token + user profile + auth actions).
- API layer: Axios instance with interceptor for Authorization bearer token.

## 7. API Surface
### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (private)
- PUT /api/auth/profile (private)

### Prescriptions
- POST /api/prescriptions/upload (private, multipart image)
- GET /api/prescriptions (private)
- GET /api/prescriptions/:id (private)
- PUT /api/prescriptions/:id (private)
- DELETE /api/prescriptions/:id (private)

### AI Chat
- POST /api/chat/ask (private)
- GET /api/chat/context (private)

### Voice Chat
- POST /api/voice-chat (private, multipart audio)

### OCR (public utility)
- POST /api/ocr/handwriting (multipart image)

### Health
- GET /health
- GET /api/health

## 8. Data Model
### User
- name, email, passwordHash
- role (patient, doctor, admin)
- profile:
  - age
  - bloodGroup
  - chronicConditions[]
  - allergies[]

### Prescription
- patientId (ref User)
- imageUrl
- uploadDate
- medications[]:
  - name
  - dosage
  - frequency
  - duration
- doctorName
- ocrRawText
- isVerified
- notes

## 9. Core Request Flows
### 9.1 Auth Flow
```mermaid
sequenceDiagram
  participant UI as Frontend
  participant API as Auth API
  participant DB as MongoDB

  UI->>API: POST /api/auth/login
  API->>DB: Find user by email
  API->>API: Compare bcrypt hash
  API-->>UI: JWT + user payload
  UI->>UI: Store token and set auth state
```

### 9.2 Prescription Upload + OCR Flow
```mermaid
sequenceDiagram
  participant UI as Frontend
  participant API as Prescription API
  participant OCR as OCR Service (Node)
  participant PY as FastAPI OCR Service
  participant T as Tesseract
  participant O as OpenAI
  participant DB as MongoDB

  UI->>API: POST /api/prescriptions/upload (image)
  API->>OCR: digitizePrescription(imageBuffer)
  OCR->>PY: POST /ocr (multipart image)
  PY->>PY: OpenCV preprocessing
  PY->>T: OCR text extraction
  PY-->>OCR: text
  OCR->>O: Structured medicine parsing
  OCR-->>API: rawText + medications + metadata
  API->>DB: Save prescription document
  API-->>UI: Success + extracted data
```

### 9.3 Chat and Voice Flow
```mermaid
sequenceDiagram
  participant UI as Frontend
  participant API as Chat/Voice API
  participant STT as Indic STT
  participant CS as Chat Service
  participant O as OpenAI

  UI->>API: POST /api/voice-chat (audio)
  API->>STT: transcribeIndicAudio
  STT-->>API: transcript
  API->>O: chat completion with medical prompt
  O-->>API: assistant reply
  API-->>UI: transcript + reply

  UI->>API: POST /api/chat/ask (text)
  API->>CS: processMessage
  CS->>O: contextual response generation
  O-->>CS: reply
  CS-->>API: reply
  API-->>UI: assistant text
```

## 10. Security and Middleware Design
- JWT auth middleware validates bearer token and injects req.user.
- Upload middleware validates media MIME and file size constraints.
- Error handling maps upload validation errors to clear API messages.
- Secrets are sourced from environment variables, not hardcoded in logic.

## 11. Reliability and Fallback Strategy
- Node OCR service calls Python OCR over HTTP with timeout handling.
- OCR service supports demo and fallback modes if Python OCR or OpenAI output is unavailable.
- Chat service also supports demo response mode when OpenAI key is absent.
- Health endpoints provide quick operational checks.

## 12. Key Engineering Talking Points (Interview-Friendly)
- Clear separation of concerns: routes, controllers, services, models, middleware.
- Context-aware assistant design using user profile and recent prescriptions.
- Multi-modal assistant support: text + voice + prescription image pathways.
- Progressive resilience with fallback logic for external API dependency failures.
- Scalable extension points for reminders, role-based workflows, and analytics.

## 13. Known Improvement Opportunities
- Add request validation library (Joi/Zod/express-validator) for strict payload contracts.
- Add structured logging and distributed trace IDs.
- Add automated tests (unit + integration + API contract tests).
- Move image storage from placeholder URL to durable object storage (S3/Cloudinary).
- Introduce role-based authorization enforcement beyond basic role field presence.
