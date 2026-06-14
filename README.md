# HEALTHEASE — AI-Powered Healthcare SaaS Platform

[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18.0-green?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey?logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blueviolet?logo=tailwindcss)](https://tailwindcss.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?logo=socket.io)](https://socket.io)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-teal?logo=fastapi)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

HEALTHEASE is a modern clinical SaaS workspace and patient compliance hub. It enables users to digitize handwritten prescriptions using advanced AI OCR extraction pipelines, log vitals, track daily medication schedules with compliance adherence meters, and connect with clinical doctor consults in real-time.

---

## 🏗️ Technical Architecture Diagram

```mermaid
graph TD
    User([Patient/Doctor Client]) --> |HTTP/WS| FE[React Vite Client]
    FE --> |JSON API| BE[Node.js Express Server]
    FE --> |Real-time Sync| WS[Socket.io Hub]
    BE --> |Data Storage| DB[(MongoDB Atlas)]
    BE --> |Extract OCR Requests| PY[FastAPI AI OCR Service]
    PY --> |OCR Extraction| Groq[Groq LLM/Llama Vision API]
    BE --> |Medicine Reminders| SMTP[Gmail SMTP Server]
```

---

## 🌟 Key Features

1. **AI Prescription OCR Scanner**
   - Upload handwritten doctor scripts and parse medicines, dosages, and schedules using advanced Groq Vision pipelines.
2. **Interactive Medication Adherence Tracker**
   - Daily calendars tracking taken/skipped doses with dynamic stock reminder warnings.
3. **Smart Health Score Engine**
   - Dynamic patient scoring (0-100) based on compliance stats, vitals logs consistency, and clinical consultation attendance.
4. **Telemedicine Marketplace**
   - Find clinical specialists, consult modes (video, audio, chat), verified ratings, and direct scheduling.
5. **PDF Report Engine**
   - Generate, preview, and download branded clinical reports for print and doctor reviews.
6. **Admin Dashboard**
   - Comprehensive metrics, audit feeds, and doctor licensing verifications.
7. **Real-time Updates**
   - Websocket synchronization tracking status changes, live doctor availabilities, and reminder warnings.

---

## 📁 Repository Directory Structure

```text
healthease/
├── client/                 # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI Cards, Modals, Forms
│   │   ├── context/        # Theme, Auth, Toast, WebSocket Contexts
│   │   ├── pages/          # Dashboard, HealthAssistant, ExportEngine, etc.
│   │   └── index.css       # Core design tokens configuration
├── server/                 # Express REST API Server
│   ├── controllers/        # Route business logic handlers
│   ├── models/             # Mongoose schemas (User, Prescription, Vitals)
│   └── index.js            # Node app entry point
├── python-service/         # FastAPI OCR Extractor Service
│   ├── main.py             # Groq Vision processing pipeline
│   └── requirements.txt
└── scripts/                # Start scripts for local MERN setup
```

---

## ⚙️ Environment Configuration

### Server (`/server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/healthease
JWT_SECRET=super_secret_jwt_sign_key
PYTHON_SERVICE_URL=http://localhost:8000
GMAIL_USER=smtp.reminders@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
CLIENT_URL=http://localhost:5173
```

### AI Python Service (`/python-service/.env`)
```env
PORT=8000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/healthease
GROQ_API_KEY=gsk_xxxxxxxxx
```

### Client (`/client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

---

## 🚀 Installation & Local Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Vardxn/Healthease.git
   cd healthease
   ```

2. **Install all Dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure Environment variables**
   - Create `.env` files in `client/`, `server/`, and `python-service/` matching the environment blueprints above.

4. **Launch Application Workspace**
   ```bash
   npm run dev
   ```
   *Note: Runs frontend dev server at `http://localhost:5173` and Node API at `http://localhost:5000`.*

---

## 🌍 Production Deployment Guides

### Frontend (Vercel)
1. Import the project on Vercel.
2. Select the root folder or override build directory to `client`.
3. Set environment variable: `VITE_API_URL` and `VITE_WS_URL`.
4. Deploy.

### Backend (Render)
1. Create a Web Service linked to the repository.
2. Build command: `cd server && npm install`.
3. Start command: `cd server && npm start`.
4. Define environment configs (`MONGO_URI`, `JWT_SECRET`, etc.).

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
