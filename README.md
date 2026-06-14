# Healthease 🩺

> **AI-Powered Healthcare Management Platform**  
> An intelligent, full-stack patient compliance, telemetry monitoring, and telemedicine scheduling application designed to streamline modern patient care workflows.

---

## ⚡ Tech Stack & Badges

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFDF00)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![JSON Web Tokens](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

---

## 🌟 Key Capabilities & Features

### 🧠 Smart Health Score Engine
Calculates a real-time healthcare index (0 - 100) combining **Medication Adherence (25%)**, **Consultation Compliance (20%)**, **Blood Pressure Stability (15%)**, **Blood Sugar Stability (15%)**, **Weight Consistency (10%)**, and **Logging Consistency (15%)** to provide personalized clinical insights.

### 📄 OCR Prescription Reader
Streamlines drug scheduling. Users upload image or PDF prescriptions, and an isolated Python OCR service extracts medicine metadata (name, dose, frequency, duration) to automatically seed compliance trackers.

### 🤖 AI Health Assistant
An interactive companion that checks the user's active medication schedules, monitors vitals trends, summarizes history documents, and answers standard healthcare queries.

### 🏥 Telemedicine Marketplace
A portal matching patients with specialists. Search and book sessions based on department, track consultation status (queued, active, completed), and review digital prescriptions.

### 📈 Vitals Dashboard & Trends
Generates interactive 30-day analytics charts tracking systolic/diastolic Blood Pressure, Blood Sugar, SpO2, Body Weight, and the overall Health Score Trend over time.

### 🔔 Centralized Notification Center
Sends notifications regarding prescription upload states, appointment bookings, stock refills, and changes in the user's health score.

---

## 🏗️ Technical Architecture

Healthease uses a decoupled client-server structure, communicating via RESTful APIs and real-time WebSockets.

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

### Flow Highlights
- **Auth Flow**: Secure password hashing with `bcrypt` and token signing via `jsonwebtoken`.
- **OCR Flow**: Streams uploaded image data directly to a Python service running `pytesseract` and extracts clinical parameters.
- **Consultation Flow**: Coordinates real-time appointment signals between doctor and patient using custom Socket.IO events.

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
└── docs/                   # System architecture and screenshots
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URL)
- Python 3.8+ (for OCR parsing)

### 1. Clone the repository
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

### 3. Install Dependencies & Seed Database
```bash
# Install Server Dependencies
cd server && npm install

# Seed Admin & Patient accounts
npm run seed

# Install Client Dependencies
cd ../client && npm install
```

### 4. Run the Application
You can run the full MERN stack in development mode:
```bash
# In the root package directory or server directory:
npm run dev:all
```

---

## 🔑 Demo Credentials

Test the platform with preconfigured test accounts:

* **Patient Account**
  * **Email**: `user@healthease.demo`
  * **Password**: `User@123`
* **Admin Account**
  * **Email**: `admin@healthease.demo`
  * **Password**: `Admin@123`

---

## 🛠️ Engineering Highlights
- **Context API Architecture**: Centralized application state management using contexts for session management, WebSocket connections, and live notifications.
- **Responsive Layout System**: Custom styling system supporting light and dark modes.
- **OCR Parser Middleware**: Node.js file streams piping image data to a Flask backend, parsing medical prescription guidelines.
- **Dynamic Chart Rendering**: Implements responsive Recharts configurations showing health trend lines.

---

## 📝 Resume Ready Highlights (ATS-Friendly)
- **Developed a full-stack healthcare management platform** using React, Node.js, Express, and MongoDB, handling secure medical workflows for patient telemetry tracking and telemedicine scheduling.
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
