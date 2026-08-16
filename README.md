<div align="center">

# HEALTHEASE 🩺
### AI-Powered Healthcare Platform for India

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Python FastAPI](https://img.shields.io/badge/Python-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Gemini API](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)

*A comprehensive digital health ecosystem that eliminates administrative burnout through AI-driven clinical documentation (Scribe), intelligent symptom triage, and seamless teleconsultations.*

</div>

<br>

## 🚀 Architecture Overview

HealthEase uses a robust Service-Oriented Architecture (SOA) split across a Next.js SSR frontend, an Express API Gateway, and a dedicated Python FastAPI service for heavy ML tasks.

```mermaid
graph TD
    Client[Next.js Client UI] -->|REST / WebSocket| Gateway[Express API Gateway & Server]
    Gateway -->|CRUD & Auth| MongoDB[(MongoDB)]
    Gateway -->|Heavy ML tasks| MLService[FastAPI ML Service]
    Gateway -->|Telemed & Summaries| Gemini[Gemini API]
    Gateway -->|Payments| Razorpay[Razorpay API]
    Gateway -->|Emails| NodeMailer[Nodemailer]
    
    MLService -->|OCR & Triage| MLModels[Scikit-learn / Custom Models]
    MLService -->|Vector Search| Pinecone[(Pinecone Vector DB)]
```

## ✨ Core Features

| Feature | Description | Tech Stack |
|---------|-------------|------------|
| **AI Medical Scribe (Hinglish Support)** | Live audio transcription of doctor-patient consultations, intelligently structured into prescriptions via LLMs. Supports code-mixed Hindi & English. | Socket.io, Gemini API, Next.js |
| **Intelligent Symptom Triage** | AI-driven patient symptom analysis that automatically flags severe cases for urgent escalation. | FastAPI, Scikit-learn, Express |
| **FHIR-Compliant Exports** | Medical records can be exported in the enterprise-standard FHIR JSON format for interoperability. | Node.js, MongoDB |
| **Teleconsultation Suite** | WebRTC-powered video/audio rooms with integrated payment gateways and live chat. | Razorpay, WebRTC |
| **Predictive Analytics** | Disease prediction and medicine classification powered by custom ML models. | Python, Pandas, Joblib |

## 🛠 Verified System Metrics
- **Endpoints:** ~150+
- **Database Models:** 14 (MongoDB)
- **Microservices:** 3
- **Third-Party Integrations:** 5+
