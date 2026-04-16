# HealthEase — AI-Powered Healthcare Platform

## Overview
HealthEase is an AI-powered healthcare platform that helps users digitize prescriptions, manage medications, and track treatment trends.
It combines OCR, reminders, analytics, and assistant features into one workflow for patients.
The platform is built as a full-stack system with React, Node.js, MongoDB, and a FastAPI AI service.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB
- AI Service: Python FastAPI + Groq Vision OCR (meta-llama/llama-4-scout-17b-16e-instruct)
- Email: Gmail SMTP (Nodemailer)

## Features
- Prescription OCR upload (Groq Vision AI)
- Medication management
- Medication reminders via Gmail
- Health Analytics Dashboard
- PDF Export (prescriptions + analytics report)

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB running locally
- Groq API key (free at console.groq.com)
- Gmail App Password

### Installation
1. Clone repository
```bash
git clone <your-repo-url>
cd health-ease
```
2. Install server dependencies
```bash
cd server
npm install
cd ..
```
3. Install client dependencies
```bash
cd client
npm install
cd ..
```
4. Install python dependencies
```bash
cd python-service
python3 -m pip install -r requirements.txt
cd ..
```
5. Copy environment files
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
cp python-service/.env.example python-service/.env
```
6. Start all 3 services
```bash
npm run dev:all
```

### MongoDB Atlas Setup
1. Go to https://mongodb.com/atlas and create a free account
2. Create a new project called "HealthEase"
3. Create a free M0 cluster (choose any region closest to you)
4. Under Security > Database Access:
	Create a user with username: healthease-admin
	Set a strong password and save it
5. Under Security > Network Access:
	Click "Add IP Address" → "Allow Access From Anywhere" (0.0.0.0/0)
6. Under Deployment > Database:
	Click "Connect" → "Drivers" → copy the connection string
	It will look like:
	mongodb+srv://healthease-admin:<password>@cluster0.xxxxx.mongodb.net/healthease?retryWrites=true&w=majority
7. Replace <password> with your actual password
8. Use this full string as your MONGO_URI environment variable
	in both Railway services (Node + Python)

## Environment Variables

| Service | Variable | Description |
|---|---|---|
| server | PORT | Node.js API port |
| server | MONGO_URI | MongoDB connection string |
| server | JWT_SECRET | JWT signing secret |
| server | PYTHON_SERVICE_URL | Base URL for python service |
| server | GMAIL_USER | Gmail address used for reminders |
| server | GMAIL_APP_PASSWORD | Gmail app password for SMTP |
| server | CLIENT_URL | Allowed frontend origin |
| python-service | GROQ_API_KEY | Groq API key for OCR extraction |
| python-service | MONGO_URI | MongoDB connection string |
| python-service | DEBUG | Enables raw OCR debug prints when true |
| python-service | PORT | FastAPI service port |
| client | VITE_API_URL | Backend API base URL |
| client | VITE_PYTHON_URL | Python service base URL |

## Deployment

### Vercel (Frontend)
- Go to vercel.com → New Project → Import from GitHub → Vardxn/Healthease
- Set Root Directory to: client
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist
- Add these environment variables on Vercel dashboard:
	- VITE_API_URL = https://your-railway-node-url.up.railway.app
	- VITE_PYTHON_URL = https://your-railway-python-url.up.railway.app
- Click Deploy

### Railway (Node Backend)
- Go to railway.app → New Project → Deploy from GitHub → Vardxn/Healthease
- Set Root Directory to: server
- Add these environment variables in Railway dashboard:
	- PORT = 5001
	- MONGO_URI = your_atlas_connection_string
	- JWT_SECRET = generate a random 32 char string
	- PYTHON_SERVICE_URL = https://your-railway-python-url.up.railway.app
	- GMAIL_USER = your_gmail@gmail.com
	- GMAIL_APP_PASSWORD = your_gmail_app_password
	- CLIENT_URL = https://your-vercel-url.vercel.app
- Railway auto-detects Node.js and deploys

### Railway (Python OCR Service)
- Go to railway.app → same project → New Service → GitHub repo → Vardxn/Healthease
- Set Root Directory to: python-service
- Add these environment variables in Railway dashboard:
	- PORT = 8000
	- GROQ_API_KEY = your_groq_api_key
	- MONGO_URI = your_atlas_connection_string
	- DEBUG = false
- Railway auto-detects Python and deploys

## Project Structure

```text
health-ease/
├── client/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── server.js
│   └── package.json
├── python-service/
│   ├── analytics/
│   ├── reminders/
│   ├── main.py
│   └── requirements.txt
├── package.json
└── README.md
```
