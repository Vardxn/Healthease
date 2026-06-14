# HealthEase — Local Setup & Showcase Guide

Project Overview
----------------

HealthEase is an AI-powered healthcare platform that integrates a React frontend, a Node.js/Express API, and a Python OCR microservice to parse medical documents (prescriptions, reports) and extract structured health data.

This document lists the basic steps to install dependencies, run the project locally (including via Docker), push changes to GitHub, and common tasks when showcasing the project to others.

Prerequisites
- Node.js (v16+ recommended) and `npm` installed
- Python 3.10+ and `python3 -m venv` available (for the OCR service)
- MongoDB or other DB if required by the server (see `server/.env.example`)
- Git configured with your GitHub account

Install dependencies
1. From the project root, install server and client dependencies:

```bash
cd health-ease
npm run install:all
```

2. Create Python virtual environment and install Python deps:

```bash
cd python-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Environment variables
- Copy example env files and update secrets (API keys, DB URIs):

```bash
cp server/.env.example server/.env
cp python-service/.env.example python-service/.env || true
cp client/.env.example client/.env || true
# Edit the .env files to add DB connections, OpenAI keys, SMTP, Razorpay keys, etc.
```


Run the app locally (all services)

Option A — Docker (recommended for demos)

1. From the project root, build and start all services with Docker Compose:

```bash
cd health-ease
docker-compose up --build
```

2. Open the app in your browser: http://localhost:3000/

Quick Start Demo (Docker)

1. Run `docker-compose up`.
2. Access the dashboard at `http://localhost:3000`.
3. Upload a medical document (PDF/PNG) to the OCR module.
4. View the parsed health metrics in the results tab.

Option B — Local (no Docker)

The project includes a launcher script that starts the Python OCR, Node API, and Vite frontend and waits for health checks.

```bash
cd health-ease
bash scripts/start-all.sh
```

If you prefer to run parts individually:

```bash
# API
cd health-ease/server
npm run dev

# Frontend
cd health-ease/client
npm run dev

# Python OCR
cd health-ease/python-service
./start_service.sh
```

Access URLs
- Frontend: http://localhost:3000/
- API health: http://localhost:5001/health (or proxied at http://localhost:3000/api/health)
- Python OCR: http://localhost:8000/health

Build for production (frontend)

```bash
cd health-ease/client
npm run build
```

Git / GitHub basics for showcasing
1. Create a remote repository on GitHub and add it as `origin` if not already set.

```bash
# from project root
git remote add origin git@github.com:YOUR_USERNAME/health-ease.git
git branch -M main
git push -u origin main
```

2. Common workflow when making changes:

```bash
git status
git add -A
git commit -m "feat: short description"
git pull --rebase origin main   # sync remote first
git push origin main
```

Showcase checklist (what to demonstrate)
- Start all services with `bash scripts/start-all.sh` and point the interviewer to the frontend URL.
- Explain architecture: frontend (Vite + React), backend (Express + MongoDB), Python OCR microservice.
- Show a feature end-to-end (e.g., upload prescription -> OCR -> view parsed data).
- Show API health endpoints.
- Tail logs to demonstrate live behavior:

```bash
# In separate terminals
# Server logs
cd health-ease/server
# If using nodemon (dev):
npm run dev

# Python service logs (venv activated)
cd health-ease/python-service
venv/bin/python -m uvicorn main:app --reload

# Frontend logs
cd health-ease/client
npm run dev
```

Troubleshooting & tips
- Ports in use: if a port (3000, 5001, 8000) is occupied, stop the occupying process or change ports in `scripts/start-all.sh` and `.env`.
- Virtual environment: ensure `venv` exists under `python-service/venv`. If not, create it and install requirements.
- Missing env vars: many features (OpenAI, email, payments) require keys; either set them or mock those features when demonstrating.
- Rebuilding client: run `npm run build` and serve `client/dist` if you need a static preview.

Security note
- Do not commit secrets to Git. Add any real keys to your machine environment or use a secrets manager. Add `.env` to `.gitignore` (already present in repo).

Further resources
- Project docs: [README.md](README.md) and [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) in this repo.

That's it — this guide should get you ready to run and demo `health-ease` locally. Good luck!
