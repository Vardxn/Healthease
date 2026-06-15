# HealthEase — 5-Minute Presentation Script (Crisp)

> Short, to-the-point. ~5 minutes. Speak naturally, don't read word-for-word.
> Split: **Vardan Pal** (1–8), **U Rajeshwar** (9–16), **Karan Kharadi** (17–24).

---

## ▶ Vardan Pal (Slides 1–8)

**S1 · Title** — "Good morning. We are Vardan, Rajeshwar, and Karan, presenting
**HealthEase — an AI-Powered Healthcare Management Platform**."

**S2 · Agenda** — "Our talk covers six parts: introduction, background, design,
implementation, results, and conclusion."

**S3 · Abstract** — "HealthEase is a full-stack **MERN** web app — *MongoDB,
Express, React, Node.* It digitises prescriptions with AI, maps each medicine to the
disease it treats, tracks vitals, and connects patients to doctors."

**S4 · Problem** — "Four problems: prescriptions are hard to read, patients don't
know what medicines are for, compliance is poor, and health data is scattered."

**S5 · Motivation** — "We wanted to make prescriptions understandable and bring all
healthcare data into one AI-driven platform."

**S6 · Objectives** — "Our goals: read prescriptions automatically, map medicines to
diseases with ML, track vitals, give a Smart Health Score, and enable telemedicine."

**S7 · Literature** — "Apps like Practo and 1mg don't combine OCR, AI disease
mapping, and a health score. That gap is what we fill."

**S8 · Tech Stack** — "Frontend React, backend Node and Express secured with **JWT**
*— secure login tokens —* database MongoDB, and a separate Python service for AI."

---

## ▶ U Rajeshwar (Slides 9–16)

**S9 · Architecture** — "The React app talks to the Node API, which connects to
MongoDB and to our Python AI service. Keeping AI separate is a **microservice
design**."

**S10 · DFD** — "This Data Flow Diagram shows how data moves — from upload, to OCR,
to classification, into the database."

**S11 · Use-Case** — "It shows each role: patients upload and track, doctors
diagnose, and admin approves doctors."

**S12 · ER Diagram** — "Our database design — one user links to a patient, a patient
has many prescriptions, each prescription has many medicines."

**S13 · Sequence** — "This shows the order of steps when a prescription is uploaded —
client to API, to OCR, to ML model, then saved and shown."

**S14 · OCR** — "**OCR turns an image into digital text.** We use a modern
**vision-language model**, Groq Llama-4 — *AI that reads an image like a human* — so
it even handles handwriting, and returns structured medicine data."

**S15 · ML Module** — "This is the model we trained. It predicts a medicine's class
and disease from its name, using **WHO drug-name stems** — like '-pril' for blood
pressure or '-cillin' for antibiotics."

**S16 · Methodology** — "We built a dataset of 321 medicines, turned names into
**character n-gram features**, trained a **Logistic Regression** model, and validated
it with **cross-validation** — *testing on multiple data splits for reliability.*"

---

## ▶ Karan Kharadi (Slides 17–24)

**S17 · Results** — "Our model reached **85.4% accuracy**. As the graph shows,
accuracy improves with more data — and it learned the medical naming patterns on its
own."

**S18 · Features** — "Twelve features: secure login, AI OCR, medicine-to-disease
mapping, interaction checks, vitals, health score, reminders, telemedicine, and more."

**S19 · Workflow** — "The full flow: upload, OCR, classify, check interactions, set
reminders, log vitals, update the score, and doctor review."

**S20 · Screenshots** — "These are real screenshots of our working app — dashboard,
prescriptions, the AI digitizer, doctors, medicine tracker, and vitals."

**S21 · Graphs** — "Simple graphs proving the model works — the accuracy gauge, the
learning curve, and high confidence on real medicines."

**S22 · Testing** — "We tested every module — login, OCR, ML, interactions, reminders
— and all test cases passed."

**S23 · Future Scope** — "Next: live video consults, wearable sync, predictive AI,
more drug classes, and a mobile app."

**S24 · Thank You** — "In short, HealthEase makes prescriptions understandable and
care continuous. Thank you — we welcome your questions."

---

**Key viva answer:** *"Did you train the OCR?"* → "No — the OCR uses a pre-trained
vision model. The medicine-to-disease classifier is the model **we trained**, and we
can re-run it live."
