# HealthEase — Project Report: Tables & Graphs Reference

> Copy these tables and graph references straight into your B.Tech final-year
> report. All content reflects the **actual** project. Tables are ready to paste;
> graphs list **where the image already exists** in the repo or how to produce it.
>
> ⚠️ Honesty note: present the **OCR** as using a *pre-trained vision-language
> model (Groq Llama-4)* and the **Medicine-Indication Classifier** as the model
> *you trained* (`/ml`). Do not claim you trained the OCR itself.

---

# PART A — TABLES

## Table 1. Software & Hardware Requirements
| Component | Requirement |
|-----------|-------------|
| Operating System | Windows / macOS / Linux |
| Runtime | Node.js v18+, Python 3.11 |
| Database | MongoDB 6+ (local or Atlas) |
| RAM | 8 GB minimum |
| Frontend build | Vite |
| Browser | Chrome / Edge / Firefox (latest) |

## Table 2. Technology Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | Single-page user interface |
| Styling | Tailwind CSS | Responsive design, dark mode |
| State | React Context API | Auth, WebSocket, Notifications |
| Backend | Node.js + Express | REST API gateway |
| Real-time | Socket.IO | Live notifications |
| Database | MongoDB + Mongoose | Document data store |
| OCR Service | Python + FastAPI | Prescription image processing |
| OCR Engine | Groq Llama-4 Vision (pre-trained) | Text extraction from images |
| ML Module | scikit-learn | Medicine-indication classification (trained) |
| Auth | JWT + bcrypt | Secure sessions |
| PDF Export | jsPDF + html2canvas | Clinical document generation |

## Table 3. Comparison with Existing Systems
| Feature | HealthEase | Practo | 1mg | Generic EHR |
|---------|:---------:|:------:|:---:|:-----------:|
| OCR prescription reading | ✓ | ✗ | ✗ | ✗ |
| AI medicine → disease mapping | ✓ | ✗ | Partial | ✗ |
| Smart Health Score engine | ✓ | ✗ | ✗ | ✗ |
| Medication compliance tracking | ✓ | ✗ | ✓ | Partial |
| Vitals analytics & charts | ✓ | Partial | ✗ | ✓ |
| Drug-interaction checker | ✓ | ✗ | ✓ | Partial |
| Real-time notifications | ✓ | ✓ | ✓ | ✗ |
| Multi-role (Patient/Doctor/Admin) | ✓ | ✓ | ✓ | ✓ |

## Table 4. User Roles & Permissions
| Action | Patient | Doctor | Admin |
|--------|:------:|:-----:|:-----:|
| Upload / view prescriptions | ✓ | ✓ | ✗ |
| Log & view vitals | ✓ | View | ✗ |
| Book consultation | ✓ | ✗ | ✗ |
| Add diagnosis / notes | ✗ | ✓ | ✗ |
| View Health Score | ✓ | ✓ | ✗ |
| Approve doctor registrations | ✗ | ✗ | ✓ |
| Manage platform users | ✗ | ✗ | ✓ |

## Table 5. Database Schema (MongoDB Collections)
| Collection | Key Fields | Description |
|-----------|-----------|-------------|
| User | name, email, passwordHash, role | Base auth & identity |
| Patient | userId, age, gender, contact | Patient profile |
| Doctor | userId, specialty, approved | Doctor profile + approval state |
| Prescription | patientId, doctorName, medications[], ocrMode, reminder | Digitised prescription |
| Medicine | name, dosage, frequency, duration, stock | Medication entry |
| MedicineReminder | prescriptionId, times[], enabled | Reminder schedule |
| Vitals / HealthProfile | patientId, bp, glucose, spo2, weight, date | Telemetry logs |
| Consultation | patientId, doctorId, date, status, notes | Telemedicine session |
| WellnessProfile | userId, score, factors | Health Score data |

## Table 6. API Endpoints (Express REST routes)
| Method | Route | Auth | Description |
|--------|-------|:----:|-------------|
| POST | /api/auth/register | ✗ | Register user |
| POST | /api/auth/login | ✗ | Login, issue JWT |
| GET/POST | /api/prescriptions | ✓ | List / create prescriptions |
| POST | /api/ocr/handwriting | ✓ | OCR a prescription image |
| POST | /api/classify/medicines | ✗ | Predict drug class + indication (ML) |
| POST | /api/interactions/check | ✓ | Drug-interaction check |
| GET/POST | /api/medicines | ✓ | Medicine tracker CRUD |
| POST | /api/reminders | ✓ | Set medication reminders |
| GET | /api/analytics/dashboard | ✓ | Analytics aggregates |
| GET/POST | /api/consultations | ✓ | Telemedicine bookings |
| GET/POST | /api/vitals (patient) | ✓ | Vitals logging |
| POST | /api/ai , /api/chat | ✓ | AI health assistant |

## Table 7. WHO INN Stem → Therapeutic Class (ML basis)
| Stem | Therapeutic Class | Example |
|------|------------------|---------|
| -pril | ACE Inhibitor | Lisinopril |
| -sartan | ARB | Losartan |
| -olol | Beta Blocker | Metoprolol |
| -dipine | Calcium Channel Blocker | Amlodipine |
| -statin | Statin | Atorvastatin |
| -prazole | Proton Pump Inhibitor | Omeprazole |
| -cillin | Penicillin Antibiotic | Amoxicillin |
| -floxacin | Fluoroquinolone | Ciprofloxacin |
| -cycline | Tetracycline | Doxycycline |
| -azole | Antifungal | Fluconazole |
| -vir | Antiviral | Acyclovir |
| -xaban | Anticoagulant | Rivaroxaban |

## Table 8. ML Dataset Summary
| Property | Value |
|----------|-------|
| Total medicines | 321 |
| Therapeutic classes | 27 |
| Distinct indications | 19 |
| Train / Test split | 240 / 81 (75% / 25%, stratified) |
| Feature type | Character n-gram TF-IDF (n = 2–4) |
| Source | Curated from WHO INN stems (`ml/build_dataset.py`) |

## Table 9. Model Comparison (5-fold Cross-Validation)
| Model | CV Accuracy |
|-------|:-----------:|
| Logistic Regression (selected) | 82.9% |
| Linear SVM | 81.7% |
| Complement Naive Bayes | 77.9% |

## Table 10. Final Model Performance
| Metric | Value |
|--------|:-----:|
| Test accuracy (held-out 25%) | 76.5% |
| 5-fold cross-validated accuracy | 85.4% ± 3.6% |
| Macro F1-score | 0.78 |
| Classes with F1 = 1.00 | 14 / 27 |

*(Full per-class precision/recall/F1: `ml/results/classification_report.txt`)*

## Table 11. Sample Predictions (incl. confidence)
| Medicine | Predicted Class | Indication | Confidence |
|----------|----------------|-----------|:----------:|
| Amoxicillin | Penicillin Antibiotic | Bacterial Infection | 87% |
| Telmisartan | ARB | Hypertension | 83% |
| Atorvastatin | Statin | High Cholesterol | 82% |
| Omeprazole | Proton Pump Inhibitor | Acid Reflux / GERD | 85% |
| Ciprofloxacin | Fluoroquinolone | Bacterial Infection | 86% |
| Doxycycline | Tetracycline | Bacterial Infection | 83% |

## Table 12. Sample Test Cases
| ID | Module | Input | Expected | Result |
|----|--------|-------|----------|:------:|
| T01 | Auth | Valid login | JWT returned | Pass |
| T02 | Auth | Wrong password | 401 error | Pass |
| T03 | OCR | Prescription image | Structured fields | Pass |
| T04 | ML Classify | "Amoxicillin" | Bacterial Infection | Pass |
| T05 | Interactions | 2 drugs | Interaction list | Pass |
| T06 | Reminder | Set 08:00 | Reminder saved | Pass |
| T07 | Health Score | Vitals logged | Score 0–100 | Pass |

## Table 13. OCR Evaluation (fill from your own test run)
| Field | Prescriptions tested | Correctly extracted | Accuracy |
|-------|:-:|:-:|:-:|
| Doctor name | N | … | …% |
| Medications | N | … | …% |
| Dosage | N | … | …% |
| Diagnosis | N | … | …% |

---

# PART B — GRAPHS / FIGURES

## B.1 Machine-Learning graphs (already generated — `ml/figures/`)
| Fig | File | Caption for report |
|-----|------|--------------------|
| 1 | 01_class_distribution.png | Dataset composition — medicines per therapeutic class |
| 2 | 02_model_comparison.png | Model selection — cross-validated accuracy of 3 models |
| 3 | 03_learning_curve.png | **Learning curve — accuracy improves with training data** ⭐ |
| 4 | 04_confusion_matrix.png | Confusion matrix on held-out test set |
| 5 | 05_per_class_f1.png | Per-class F1-score |
| 6 | 06_learned_ngrams.png | **Name-fragments the model learned (INN stems)** ⭐ |

## B.2 Application analytics graphs (screenshot from the running app)
| Graph | Where in app | Type |
|-------|-------------|------|
| Health Score trend (30-day) | Health Score page | Line |
| Blood Pressure over time | Vitals dashboard | Line |
| Glucose / SpO2 / Weight trends | Vitals dashboard | Line |
| Medication compliance % | Medicine tracker | Donut / gauge |
| Top diagnoses | Analytics dashboard | Bar |
| Top medications | Analytics dashboard | Bar |
| Prescription timeline | Analytics dashboard | Bar / area |

## B.3 Architecture & UML diagrams (draw in draw.io / included in repo)
| Diagram | Purpose | Source |
|---------|---------|--------|
| System Architecture | High-level component flow | `README.md` (ASCII version) |
| ER Diagram | MongoDB collections + relations | from Table 5 |
| Use-Case Diagram | Actors (Patient/Doctor/Admin) → use cases | from Table 4 |
| DFD Level 0 & 1 | Data flow through the system | — |
| Sequence Diagram | OCR upload → extract → classify → display | — |
| Component / Deployment | Client / Server / OCR / DB tiers | — |

---

# Suggested mapping to report chapters
- **Ch. Introduction / Literature** → Table 3 (comparison)
- **Ch. Requirement Analysis** → Tables 1, 2, 4
- **Ch. System Design** → Tables 5, 6 + ER / Use-Case / DFD / Sequence diagrams
- **Ch. Implementation** → Table 7 + Architecture diagram
- **Ch. ML Module (research contribution)** → Tables 8–11 + Figures 1–6 ⭐
- **Ch. Application Results** → B.2 analytics graphs
- **Ch. Testing** → Tables 12, 13

> To regenerate the ML figures/numbers live: `cd ml && venv/bin/python train_classifier.py`
