# HEALTHEASE 🩺

> **AI-Powered Healthcare Management Platform**  
> An intelligent, full-stack compliance-tracking, vital-telemetry, and telemedicine platform designed to optimize patient health habits and unify clinical data workflows.

---

## ⚡ Technology Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFDF00)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![JWT Auth](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Tesseract OCR](https://img.shields.io/badge/Tesseract_OCR-blue?style=for-the-badge)
![AI Assistant](https://img.shields.io/badge/AI_Assistant-green?style=for-the-badge)
![Responsive UI](https://img.shields.io/badge/Responsive_Design-orange?style=for-the-badge)
![Dark Mode](https://img.shields.io/badge/Dark_Mode-darkblue?style=for-the-badge)

---

## 📖 Project Overview

### Problem Statement
Modern healthcare suffers from fragmented communication, poor medication compliance, and passive telemetry monitoring. Patients struggle to interpret paper prescriptions, fail to log daily vitals consistently, and frequently miss scheduled clinical sessions, leading to compromised treatment outcomes and increased emergency hospitalizations.

### Solution
**HEALTHEASE** resolves these compliance gaps by introducing an active, intelligence-driven workflow. The application features an **automated OCR Prescription Reader** that parses paper guidelines into calendar alerts, a **Smart Health Score Engine** translating telemetry values (BP, glucose, weight) and compliance rates into a single coefficient (0 - 100), an **AI Health Assistant** delivering personalized suggestions, and a **Telemedicine Marketplace** linking patients directly to specialists.

---

## 🌟 Key Features

- **🔐 Secure Authentication**: Multi-role portal (Patient, Doctor, Admin) leveraging JWT session tokens and `bcrypt` password encryption.
- **📄 OCR Prescription Reader**: Automated PDF/Image scanner extracting medicine name, dosages, frequencies, and durations.
- **📈 Vitals Analytics & Charts**: Real-time 30-day interactive graphing of Blood Pressure, blood glucose, SpO2, and weight.
- **🧠 Smart Health Score Engine**: Clinical algorithm weighing medication compliance, consultation attendance, and vitals stability.
- **🤖 AI Health Assistant**: Conversational assistant referencing user records, current medication levels, and vitals logs.
- **🏥 Doctor Directory & Marketplace**: Search portal to find specialists, book consultations, and view clinical diagnosis notes.
- **📅 Medicine Tracker**: Log daily schedules, monitor stock counts, and receive refill reminders.
- **🔔 Live Notifications**: Real-time push alert system powered by WebSockets to broadcast compliance changes.
- **🛡️ Admin Dashboard**: Dedicated portal to approve clinical specialist registrations.
- **📊 PDF Export Engine**: Export certified clinical summaries and prescriptions.
- **🌗 Dark Mode**: Fully responsive, design-system-aligned high-contrast theme switcher.

---

## 🏗️ Technical Architecture

Detailed sequence flows, endpoints, and layered diagrams can be accessed in the [Architecture Guide](docs/architecture/architecture.md).

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

## 📸 Application Screenshots

*Actual screenshots of the running application can be viewed in the [Screenshot Checklist Guide](docs/screenshots/README.md).*

| View Description | Screenshot Reference |
| :--- | :--- |
| **Landing Page** | ![Landing Page](docs/screenshots/landing-page.png) |
| **Patient Dashboard** | ![Patient Dashboard](docs/screenshots/dashboard.png) |
| **Doctor Marketplace** | ![Doctor Marketplace](docs/screenshots/doctor-directory.png) |
| **Prescription Digitizer** | ![Prescription Digitizer](docs/screenshots/upload-prescription.png) |
| **Medication Tracker** | ![Medication Tracker](docs/screenshots/medicine-tracker.png) |
| **Vitals Analytics** | ![Vitals Dashboard](docs/screenshots/vitals-dashboard.png) |
| **Health Score Analytics** | ![Health Score Page](docs/screenshots/health-score.png) |
| **Notifications Center** | ![Notifications Tray](docs/screenshots/notifications.png) |
| **Admin Control Dashboard** | ![Admin Portal](docs/screenshots/admin-dashboard.png) |
| **AI Conversations** | ![AI Assistant](docs/screenshots/assistant.png) |

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URL)
- Python 3.8+ (for OCR service)

### 1. Clone the Repository
```bash
git clone https://github.com/Vardxn/Healthease.git
cd Healthease
```

### 2. Configure Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/healthease
JWT_SECRET=supersecrettoken
PYTHON_SERVICE_URL=http://localhost:8000
```

### 3. Install Backend & Seed Database
```bash
cd server
npm install
npm run seed  # Generates test patient, doctor, and admin profiles
```

### 4. Install Frontend Client
```bash
cd ../client
npm install
```

### 5. Launch the Application
Start the development server for the entire stack (Express API server and Vite client):
```bash
# In the root package directory or server directory:
npm run dev:all
```

---

## 🔑 Test Demo Credentials

Review the platform utilizing these pre-seeded roles:

* **Patient Profile**
  * **Email**: `user@healthease.demo`
  * **Password**: `User@123`
* **Admin Profile**
  * **Email**: `admin@healthease.demo`
  * **Password**: `Admin@123`

---

## 📂 Project Structure

```
Healthease/
├── client/                 # React SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/     # Reusable layout and UI elements
│   │   ├── context/        # Auth, WebSockets, and Notification contexts
│   │   ├── pages/          # Dashboard, Vitals, Consultations, AI Assistant
│   │   └── utils/          # Health Score engine calculations
├── server/                 # Node.js + Express backend
│   ├── controllers/        # Route controllers (Auth, Vitals, Meds)
│   ├── models/             # Mongoose Schemas (User, Vitals, Consultation)
│   └── routes/             # Express API Endpoints
├── python-service/         # Flask + Tesseract OCR service
└── docs/                   # Systems design and screenshots index
```

---

## 🛠️ Engineering Highlights

- **Reusable UI System**: Implemented a modular styling system aligned around premium custom tokens (`rounded-custom`, consistent color scales) supporting dynamic light/dark mode triggers.
- **Context API Architecture**: Utilizes decoupled contexts (`AuthContext`, `WebSocketContext`, `NotificationContext`) to handle session state, WebSocket signals, and push triggers without rendering bottlenecks.
- **OCR Processing Pipeline**: Configured file-stream piping to transmit binary prescription images to a separate Flask server, structuring extraction parameters.
- **Health Score Metric Engine**: Computes a dynamic coefficient using in-memory calculations over patient vitals databases, mitigating heavy lookup queries.
- **PDF Export Engine**: Implements on-the-fly client-side PDF document compilation using `html2canvas` and `jspdf`.

---

## 📝 Resume Ready Highlights (ATS-Friendly)

- **Developed a full-stack healthcare management platform** using React, Node.js, Express, and MongoDB, handling secure medical workflows for patient compliance and telemedicine scheduling.
- **Implemented an intelligent Health Score Engine** that dynamically computes patient compliance indexes (0 - 100) based on weighted factors (Adherence, Vitals Stability, Consultation Attendance).
- **Designed an automated OCR Prescription parsing pipeline** using Node.js stream piping and Python vision libraries, reducing manual input errors in scheduling medications.
- **Integrated real-time notification alerts and messaging components** utilizing Socket.IO, improving response times for patient stock refills and health coefficient changes.
- **Engineered modular React state structures and Context wrappers** for authentication and WebSockets, reducing page re-renders and improving client-side responsiveness.
- **Built and documented a professional admin portal and audit dashboard** to approve medical specialist profiles and analyze telemetry parameters across user networks.

---

## 🔮 Future Scope
1. **Real-time Video Calls**: Implement WebRTC signaling for live video telemedicine consults.
2. **Wearable Integrations**: Synchronize Apple Health / Google Fit telemetry streams directly.
3. **Predictive AI Insights**: Integrate ML-based diagnostic models predicting blood pressure trends.

---

## 👥 Contributors & Author
- **Author**: Vardan Pal  
- **GitHub**: [https://github.com/Vardxn](https://github.com/Vardxn)

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE details.
