# HEALTHEASE Technical Architecture & Flows

This document details the systems design, layered architecture, database models, and critical logic flows within Healthease.

---

## 🏗️ Layered Architecture Overview

Healthease is built on a standard decoupled client-server architecture model.

```mermaid
graph TD
    subgraph Frontend [Client SPA Layer]
        A[React SPA / Vite] --> B[Context Providers]
        B --> C[Page Views / UI Components]
        B --> D[Recharts Engine]
    end

    subgraph Backend [REST API & Real-Time Gateway]
        E[Express Server / Node.js] --> F[JSON Web Token Auth Middleware]
        E --> G[Socket.io Gateway]
        E --> H[OCR Integration Layer]
    end

    subgraph Database [Persistence Layer]
        I[(MongoDB Database)]
    end

    subgraph PythonServices [Vision Layer]
        J[Python Flask OCR Service]
    end

    A -- REST API HTTPs --> E
    A -- WebSocket connection --> G
    E -- Mongoose ODM --> I
    E -- REST API call --> J
```

---

## 🔐 Authentication Flow

Secure session management is handled via stateless JWT (JSON Web Tokens).

```mermaid
sequenceDiagram
    autonumber
    actor User as Patient/Doctor
    participant Client as React Client (SPA)
    participant Server as Express Server
    participant DB as MongoDB

    User->>Client: Enter Email & Password
    Client->>Server: POST /api/auth/login
    Server->>DB: Query User model by Email
    DB-->>Server: Return User Document (Password hashed)
    Server->>Server: Verify Password (bcrypt.compare)
    Server->>Server: Sign JWT containing User payload
    Server-->>Client: Return Token & User Profile
    Client->>Client: Save Token in LocalStorage & update AuthContext
    Client-->>User: Route to Dashboard
```

---

## 📄 OCR Prescription Reader Flow

Automated ingestion processes images and structures schedule parameters.

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant Client as React Client
    participant Server as Express Server
    participant Python as Flask OCR Service
    participant DB as MongoDB

    Patient->>Client: Upload Prescription File (PDF/Image)
    Client->>Server: POST /api/prescription (Multipart Upload)
    Server->>Python: POST /ocr/extract (Forward image buffer)
    Python->>Python: Run Pytesseract OCR extraction
    Python->>Python: Parse dosage & frequency patterns
    Python-->>Server: Return structured JSON payload
    Server-->>Client: Return extracted meds array
    Patient->>Client: Review details and click Confirm
    Client->>Server: POST /api/medicine/save
    Server->>DB: Save Medication schedule & generate reminders
    DB-->>Server: Saved success
    Server-->>Client: 201 Created
    Client-->>Patient: Display active schedule logs
```

---

## 🔔 Notification Flow

Centralized real-time notifications triggered by in-app actions.

```mermaid
sequenceDiagram
    autonumber
    participant Engine as Event Source (Action / Script)
    participant Server as Express Server (Socket.io)
    participant Client as React Client (WebSocket)
    participant Context as NotificationContext

    Engine->>Server: Trigger notification action
    Server->>Client: Emit socket event "notification:new"
    Client->>Context: Call addNotification(title, message, type)
    Context->>Context: Update React State & play alert audio
    Context-->>Client: Render slide-in Toast alert
```

---

## 📈 Health Score Calculation Flow

Combines telemetry indexes and clinical actions dynamically inside the Health Score Engine.

```mermaid
graph TD
    A[Inputs] --> B[calculateHealthScore]
    A1[Medicines Array] -->|calculateMedicineScore 25%| B
    A2[Consultations Array] -->|calculateConsultationScore 20%| B
    A3[Vitals Log Array] -->|calculateVitalsScore 55%| B
    
    subgraph Vitals Breakdown
        A3 -->|BP Stability 15%| V1[Sys/Dia Check]
        A3 -->|Glucose Stability 15%| V2[Sugar Range Check]
        A3 -->|Weight Logging 10%| V3[Weight Check]
        A3 -->|Logging Consistency 15%| V4[Volume Check]
    end

    B --> C[Compute Overall Sum 0 - 100]
    C --> D[Determine Status Label]
    D --> D1[90-100: Excellent]
    D --> D2[75-89: Good]
    D --> D3[60-74: Average]
    D --> D4[0-59: Needs Attention]
    C --> E[Generate Top 3 Clinical Suggestions]
```
