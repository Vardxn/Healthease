# HEALTHEASE System Architecture

This document outlines the software architecture, data pipelines, and interaction models that power the Healthease AI-driven healthcare management platform.

---

## 🏗️ High-Level System Architecture

Healthease is designed around a three-tier architecture utilizing the MERN stack (MongoDB, Express, React, Node.js) paired with an isolated Python service for OCR tasks.

```
       +---------------------------------------------+
       |               Frontend Client               |
       |                (React + Vite)               |
       +-------+-----------------------------+-------+
               |                             |
     HTTPS     | REST APIs                   | WebSockets
     & JSON    |                             | (Socket.IO)
               v                             v
       +-------+-----------------------------+-------+
       |             Backend API Gateway             |
       |             (Node.js + Express)             |
       +-------+-----------------------------+-------+
               |                             |
      Mongoose | ORM                 HTTP    | REST
      Queries  |                     Request | JSON
               v                             v
       +-------+---------+           +-------+---------+
       |   Data Store    |           |   OCR Service   |
       |    (MongoDB)    |           |    (Python)     |
       +-----------------+           +-----------------+
```

---

## 🔐 1. Authentication Flow

Healthease uses secure JWT (JSON Web Tokens) stateless authentication.

```
[ Patient/Doctor ]              [ React Client ]             [ Express Server ]            [ MongoDB ]
        |                              |                             |                          |
        |--- Enter Credentials ------->|                             |                          |
        |    (Email/Password)          |--- POST /api/auth/login --->|                          |
        |                              |                            |--- Fetch User Record --->|
        |                              |                            |<-- User document --------|
        |                              |                            |                          |
        |                              |                            |--- Verify Password ------|
        |                              |                            |    (bcrypt comparison)   |
        |                              |                            |                          |
        |                              |                            |--- Generate JWT ---------|
        |                              |                            |    (Signed Token)        |
        |                              |<-- 200 OK + JWT -----------|                          |
        |                              |    + User Info              |                          |
        |<-- Route to Dashboard -------|                             |                          |
        |                              |                             |                          |
```

---

## 📄 2. OCR Prescription Reader Pipeline

The OCR pipeline extracts medication schedules and dosages from uploaded doctor prescription PDFs or images.

```
[ Patient ]              [ React Client ]            [ Express Server ]          [ Python OCR Service ]
     |                          |                            |                             |
     |-- Drag & Drop Doc ------>|                            |                             |
     |   (PDF/PNG/JPG)          |-- POST /api/prescription ->|                             |
     |                          |   (Multipart File Upload)  |-- POST /ocr/extract ------->|
     |                          |                            |   (Pipe file stream)        |-- Parse Image
     |                          |                            |                             |-- Extract Texts
     |                          |                            |                             |-- Structure JSON
     |                          |                            |<-- Parsed structured JSON --|
     |                          |<-- Return formatted JSON --|                             |
     |                          |    (Meds, dosage, timing)  |                             |
     |                          |                            |                             |
     |-- Edit/Confirm Schedule -|                            |                             |
     |-- Click "Confirm" ------>|-- POST /api/medicine/save -|                             |
     |                          |   (Save active records)    |-- Write to DB ------------->| [MongoDB]
     |<-- Success Notification -|<-- 201 Created ------------|                             |
```

---

## 📅 3. Consultation Booking & Active Telemedicine Call Flow

Telemedicine events run on a real-time event pipeline driven by Socket.IO.

```
[ Patient ]              [ React Client ]            [ Express Server ]          [ Specialist/Doctor ]
     |                          |                            |                             |
     |-- Select Specialist ---->|                            |                             |
     |-- Book Appointment ----->|-- POST /api/consultation ->|                             |
     |                          |   (Create queued state)    |-- Update Database --------->| [MongoDB]
     |                          |                            |--- Emit "new_consultation" -|--> [Notify Doctor]
     |                          |                            |                             |
     |                          |                            |     (Time of appointment)   |
     |                          |                            |<-- Emit "consultation:start"|-- Click "Start Call"
     |                          |<-- Route to call room -----|                             |
     |                          |    (/consultation/:id)     |                             |
     |<-- Renders Video/Chat ---|<========================================================>|<-- Join room & chat
```

---

## 🔔 4. Notification Engine architecture

Healthease tracks patient compliance and triggers alerts utilizing a centralized WebSocket notifications system.

```
[ Context Provider ]            [ Express Server ]           [ React Client ]             [ Notification Panel ]
         |                              |                           |                              |
         |                              |-- Trigger Action -------->|                              |
         |                              |   (e.g., Vitals Change)   |                              |
         |                              |                           |-- Dispatch addNotification ->|
         |<-- State updated ------------|                           |                              |-- Slide-in toast
         |                              |                           |<-- Play Alert Sound ---------|-- Increment count
```
