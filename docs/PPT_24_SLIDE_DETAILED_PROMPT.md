# HealthEase — Detailed 24-Slide PPT Generation Prompt

> Paste the block below into an AI presentation maker (Gamma, Beautiful.ai, Tome,
> SlidesAI, Canva). It specifies sections, per-slide content, text placement,
> flowcharts, diagrams, and the exact color palette. All facts are real.

---

## COLOR PALETTE (tell the tool to use these everywhere)

| Role | Color | Hex |
|------|-------|-----|
| Primary (titles, headers, key accents) | Teal | `#0D9488` |
| Secondary (links, sub-accents) | Blue | `#2563EB` |
| Highlight / call-outs | Bright teal | `#14B8A6` |
| Success / positive metrics | Green | `#22C55E` |
| Alert / attention | Amber | `#F59E0B` |
| Body text | Slate dark | `#1E293B` |
| Background | White / off-white | `#FFFFFF` / `#F8FAFC` |
| Cards & panels | Light slate | `#F1F5F9` |

Font: clean sans-serif (Inter / Poppins / Montserrat). Headings bold, body
regular. Use teal section dividers and rounded cards with soft shadows.

---

## THE PROMPT (copy everything below)

Create a polished, professional 24-slide final-year B.Tech project presentation
titled **"HealthEase — AI-Powered Healthcare Management Platform"**. Use a modern
medical theme. COLOR PALETTE: primary teal `#0D9488`, secondary blue `#2563EB`,
highlight `#14B8A6`, success green `#22C55E`, alert amber `#F59E0B`, body text
slate `#1E293B`, white/`#F8FAFC` backgrounds, light cards `#F1F5F9`. Use Inter or
Poppins font, bold teal headings, ≤6 bullets per slide, rounded cards with soft
shadows, consistent line icons, and a thin teal footer with slide number on every
slide. Organize into 6 sections with a teal section-divider style. Generate exactly
these 24 slides:

=== SECTION 1: INTRODUCTION ===

SLIDE 1 — TITLE.
Layout: centered. Large bold title "HealthEase" in teal, subtitle below in slate:
"AI-Powered Healthcare Management Platform". Smaller line: "Final Year B.Tech
Project". Bottom-right block (small text) for: Student Name, Roll No., Guide Name,
Department, Institution, Year. Add a subtle medical icon (stethoscope/heartbeat)
top-center.

SLIDE 2 — AGENDA / OUTLINE.
Layout: two columns of numbered items. List the 6 sections: 1. Introduction,
2. Background & Literature, 3. System Design, 4. Implementation, 5. Results &
Testing, 6. Conclusion. Use teal numbers in circles.

SLIDE 3 — ABSTRACT.
Layout: single centered paragraph card on light background. Text: "HealthEase is a
full-stack MERN platform that digitises paper and handwritten prescriptions using
an AI vision-language OCR engine, then applies a custom-trained machine-learning
classifier to map each prescribed medicine to the disease it treats. It tracks
patient vitals and medication compliance, computes a Smart Health Score (0–100),
checks drug interactions, and connects patients to doctors through telemedicine —
unifying fragmented healthcare workflows into one secure system."

SLIDE 4 — PROBLEM STATEMENT.
Layout: 4 icon cards in a 2×2 grid. Each card = one problem:
(1) Paper/handwritten prescriptions are hard to read and digitise.
(2) Patients don't understand what each medicine is for.
(3) Poor medication compliance and missed refills.
(4) Fragmented data — vitals, prescriptions, and consultations live in silos.
Use amber accent on the card icons.

=== SECTION 2: BACKGROUND & LITERATURE ===

SLIDE 5 — MOTIVATION.
Layout: left text bullets, right supporting illustration. Points: rising chronic
disease burden in India; need to make prescriptions understandable; active
(not passive) compliance tracking; one unified patient-centric platform; leverage
modern AI (vision models + ML) for real clinical value.

SLIDE 6 — OBJECTIVES.
Layout: vertical numbered list with teal markers. Objectives:
1. Automatically extract data from prescription images (OCR).
2. Map medicines to their indication using a trained ML model.
3. Track vitals and medication compliance with analytics.
4. Quantify patient health as a single Smart Health Score.
5. Enable secure multi-role telemedicine (Patient/Doctor/Admin).
6. Deliver everything in one responsive, secure web app.

SLIDE 7 — LITERATURE SURVEY / EXISTING SYSTEMS.
Layout: comparison table. Columns: Feature | HealthEase | Practo | 1mg | Generic
EHR. Rows: OCR prescription reading, AI medicine→disease mapping, Smart Health
Score, compliance tracking, vitals analytics, drug-interaction check, real-time
notifications. Use ✓ in green and ✗ in slate. Highlight the HealthEase column with
a teal background to show the research gap it fills.

=== SECTION 3: SYSTEM DESIGN ===

SLIDE 8 — TECHNOLOGY STACK.
Layout: layered table / stacked bands, each band a color shade of teal→blue.
Bands: Frontend (React + Vite, Tailwind CSS, Context API) | Backend (Node.js +
Express, JWT, bcrypt) | Database (MongoDB + Mongoose) | Real-time (Socket.IO) |
OCR Microservice (Python + FastAPI) | OCR Engine (Groq Llama-4 Vision —
pre-trained) | Machine Learning (scikit-learn — custom-trained) | PDF (jsPDF +
html2canvas). Put purpose text next to each.

SLIDE 9 — SYSTEM ARCHITECTURE (DIAGRAM).
Create a block architecture diagram, top-to-bottom, boxes connected by labeled
arrows:
[ React + Vite Client ]
   | HTTPS / REST (JSON)        \\ WebSockets (Socket.IO)
   v                              v
[ Node.js + Express API Gateway ]
   | Mongoose ODM         | HTTP REST
   v                      v
[ MongoDB Database ]    [ Python FastAPI Service ]
                              |              |
                              v              v
                        [ Groq Vision OCR ]  [ ML Classifier (scikit-learn) ]
Color the client teal, gateway blue, database slate, Python service green. Label
all arrows.

SLIDE 10 — DATA FLOW DIAGRAM (DFD LEVEL 1).
Create a DFD: external entity "Patient" and "Doctor" → process "1.0 Upload
Prescription" → data store "Prescriptions" ; process "2.0 OCR Extraction" →
process "3.0 Medicine Classification" → data store "Medicines"; process "4.0
Vitals Logging" → data store "Vitals" → process "5.0 Health Score"; process "6.0
Telemedicine" linking Patient and Doctor. Use circles for processes, open
rectangles for data stores, squares for entities, teal arrows.

SLIDE 11 — USE-CASE DIAGRAM.
Create a UML use-case diagram. Actors on sides: Patient (left), Doctor (right),
Admin (bottom). Use-case ovals inside a system boundary box "HealthEase":
Patient → Upload Prescription, Log Vitals, View Health Score, Book Consultation,
Set Reminders. Doctor → View Patient Records, Add Diagnosis, Conduct Consultation.
Admin → Approve Doctors, Manage Users. Teal ovals, slate actor stick figures.

SLIDE 12 — DATABASE DESIGN (ER DIAGRAM).
Create an ER diagram of MongoDB collections as entity boxes with key fields and
relationship lines: User (1)→(1) Patient/Doctor; Patient (1)→(many) Prescription;
Prescription (1)→(many) Medicine; Medicine (1)→(1) MedicineReminder; Patient
(1)→(many) Vitals/HealthProfile; Patient (1)→(many) Consultation (many)→(1)
Doctor; User (1)→(1) WellnessProfile. Show cardinality (1, N) on lines. Teal entity
headers, light field rows.

SLIDE 13 — SEQUENCE DIAGRAM (PRESCRIPTION FLOW).
Create a UML sequence diagram with lifelines: Patient, Client, API Server, OCR
Service, ML Model, Database. Messages in order: Patient→Client: upload image;
Client→API: POST /api/ocr; API→OCR Service: forward image; OCR Service→Groq:
vision request; Groq→OCR Service: extracted text; OCR Service→API: structured
fields; API→ML Model: POST /classify-medicines; ML Model→API: class + indication;
API→Database: save prescription; API→Client: result; Client→Patient: display.
Use teal activation bars.

=== SECTION 4: IMPLEMENTATION ===

SLIDE 14 — OCR PRESCRIPTION READER.
Layout: left = bullet explanation, right = mini horizontal flowchart.
Bullets: Type = AI Vision-Language OCR (NOT classic Tesseract); engine = Groq
Llama-4 Scout vision model (pre-trained); handles printed AND handwritten scripts;
returns structured fields. Flowchart (left→right boxes with arrows):
[Image Upload] → [Preprocess: resize + RGB (Pillow)] → [Base64 encode] →
[Vision Model + Medical Prompt] → [Structured Output: Doctor / Diagnosis /
Medicines]. Color boxes teal, arrows blue.

SLIDE 15 — MACHINE LEARNING MODULE (OVERVIEW).
Title: "Medicine-Indication Classifier (Custom-Trained)". Layout: left insight,
right stem table.
Insight bullets: predicts therapeutic class + disease from the medicine NAME;
generalises to unseen drug names; based on WHO INN naming stems.
Stem table (right): -pril→ACE Inhibitor (Lisinopril); -statin→Statin
(Atorvastatin); -cillin→Penicillin (Amoxicillin); -floxacin→Fluoroquinolone
(Ciprofloxacin); -prazole→PPI (Omeprazole); -dipine→Calcium Channel Blocker
(Amlodipine). Teal table header.

SLIDE 16 — ML METHODOLOGY (FLOWCHART).
Create a vertical pipeline flowchart:
[Curated Dataset: 321 medicines, 27 classes] →
[Feature Extraction: Character n-gram TF-IDF (n=2–4)] →
[Train/Test Split: 75% / 25% stratified] →
[Model Training: Logistic Regression] →
[5-Fold Cross-Validation] →
[Evaluation: Accuracy, F1, Confusion Matrix] →
[Deployed Model: medicine_classifier.joblib].
Each stage a rounded teal box, downward blue arrows, small caption per stage.

SLIDE 17 — ML RESULTS.
Layout: 3 big metric cards on top (green numbers): "85.4% Cross-Validated
Accuracy", "76.5% Test Accuracy", "0.78 Macro F1". Below: a model-comparison
mini-table (Logistic Regression 82.9% | Linear SVM 81.7% | Naive Bayes 77.9%).
Note line: "The model independently rediscovered medical naming conventions from
data." Leave a placeholder for the learning-curve graph on the right.

SLIDE 18 — KEY FEATURES.
Layout: 3×4 grid of 12 icon cards (teal icons): Multi-role Auth (JWT+bcrypt);
AI OCR Digitiser; AI Medicine→Disease Mapping; Drug-Interaction Checker; Vitals
Analytics (BP/glucose/SpO2/weight); Smart Health Score; Medicine Tracker +
Reminders; Real-time Notifications; Telemedicine Marketplace; Admin Dashboard;
PDF Export; Dark Mode + Responsive UI.

SLIDE 19 — END-TO-END WORKFLOW (FLOWCHART).
Create a horizontal numbered workflow flowchart with 8 connected steps:
1. Upload prescription image → 2. OCR vision model extracts medicines →
3. ML classifier tags each with its indication → 4. Drug-interaction check →
5. Reminders scheduled → 6. Vitals logged → 7. Smart Health Score updated →
8. Doctor reviews via telemedicine / PDF exported. Alternate teal and blue step
circles, connected by arrows.

=== SECTION 5: RESULTS & TESTING ===

SLIDE 20 — APPLICATION RESULTS (SCREENSHOTS).
Layout: 2×3 grid of placeholders labeled: Landing Page, Patient Dashboard,
Prescription Digitizer, Vitals Analytics, Health Score Page, Doctor Marketplace.
Caption: "Live screenshots of the running platform." Thin teal borders.

SLIDE 21 — ML GRAPHS & ANALYTICS.
Layout: 2×3 grid of chart placeholders labeled: Class Distribution, Model
Comparison, Learning Curve, Confusion Matrix, Per-Class F1, Learned Name-Fragments.
Caption: "Generated by the training pipeline (ml/figures)."

SLIDE 22 — TESTING.
Layout: test-case table. Columns: ID | Module | Input | Expected | Result. Rows:
T01 Auth/valid login/JWT/Pass; T02 Auth/wrong password/401/Pass; T03 OCR/
prescription image/structured fields/Pass; T04 ML/"Amoxicillin"/Bacterial
Infection/Pass; T05 Interactions/2 drugs/interaction list/Pass; T06 Reminder/
set time/saved/Pass; T07 Health Score/vitals/score 0–100/Pass. "Pass" in green.

=== SECTION 6: CONCLUSION ===

SLIDE 23 — FUTURE SCOPE.
Layout: roadmap-style horizontal arrow with milestones: WebRTC live video
consults → Wearable integration (Apple Health / Google Fit) → Predictive ML for
vitals trends → Expand ML model to 50+ drug classes & ATC codes → Mobile app.
Teal milestone dots.

SLIDE 24 — CONCLUSION & THANK YOU.
Layout: centered. Short conclusion: "HealthEase unifies AI vision OCR, a
custom-trained ML model, real-time tracking, and telemedicine into one platform
that makes prescriptions understandable and care continuous." Below in large teal
text: "Thank You". Smaller: "Questions & Discussion". Add guide/team credit line.

DESIGN RECAP: keep the teal/blue medical palette throughout, one idea per slide,
prefer diagrams over paragraphs, real metrics on ML slides (321 medicines, 27
classes, 85.4% CV accuracy), and a consistent footer with slide numbers.

---

## After generating
Replace the diagram/graph/screenshot placeholders (slides 9–13, 16, 17, 19, 20, 21)
with: the 6 real images in `ml/figures/`, your app screenshots, and the
flowcharts (you can draw them in draw.io using the descriptions above). Keep OCR
described as a *pre-trained vision model* and the classifier as the model *you
trained* — both true and viva-safe.
