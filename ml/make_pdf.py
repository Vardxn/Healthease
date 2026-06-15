"""
make_pdf.py — generates HealthEase_Presentation.pdf (24 pages, clean, simple).
Mirrors the slide deck with crisp arrows, embedded screenshots and clean graphs.
Run: venv/bin/python make_pdf.py
"""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Wedge
from matplotlib.backends.backend_pdf import PdfPages

HERE = os.path.dirname(os.path.abspath(__file__))
CLEAN = os.path.join(HERE, "figures_clean")
SHOTS = os.path.join(HERE, "screenshots")
OUT = os.path.join(HERE, "..", "HealthEase_Presentation.pdf")

TEAL = "#0D9488"; BLUE = "#2563EB"; HI = "#14B8A6"; GREEN = "#22C55E"
AMBER = "#F59E0B"; SLATE = "#1E293B"; GRAY = "#64748B"; LGRAY = "#94A3B8"
BG = "#F8FAFC"; CARD = "#F1F5F9"; WHITE = "#FFFFFF"; BORDER = "#E2E8F0"

W, H = 13.333, 7.5
FONT = "DejaVu Sans"
plt.rcParams["font.family"] = FONT

pdf = PdfPages(OUT)
_page = [0]


def fx(x): return x / W
def fyt(y): return 1 - y / H   # y from top (inches) -> figure fraction


def newpage(bg=BG):
    fig = plt.figure(figsize=(W, H), dpi=150)
    ax = fig.add_axes([0, 0, 1, 1]); ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis("off")
    ax.add_patch(plt.Rectangle((0, 0), 1, 1, color=bg, zorder=-10))
    return fig, ax


def footer(ax, dark=False):
    _page[0] += 1
    ax.add_patch(plt.Rectangle((0, 0), 1, fyt(7.18), color=TEAL, zorder=5))
    ax.text(fx(0.4), fyt(7.30), "HealthEase — AI Healthcare Platform",
            color=WHITE, fontsize=8, va="center", zorder=6)
    ax.text(fx(12.9), fyt(7.30), str(_page[0]), color=WHITE, fontsize=8,
            va="center", ha="right", weight="bold", zorder=6)


def box(ax, x, y, w, h, fc, ec="none", lw=1, rounded=0.02, z=1):
    p = FancyBboxPatch((fx(x), fyt(y + h)), fx(w), h / H,
                       boxstyle=f"round,pad=0,rounding_size={rounded}",
                       fc=fc, ec=ec, lw=lw, zorder=z, mutation_aspect=1)
    ax.add_patch(p); return p


def text(ax, x, y, s, size=12, color=SLATE, weight="normal",
         ha="left", va="top", z=3):
    ax.text(fx(x), fyt(y), s, fontsize=size, color=color, weight=weight,
            ha=ha, va=va, zorder=z, wrap=True)


def btext(ax, x, y, w, h, fc, s, size=12, color=WHITE, weight="bold",
          ec="none", lw=1, rounded=0.02, z=2, ha="center"):
    box(ax, x, y, w, h, fc, ec, lw, rounded, z)
    ax.text(fx(x + w/2) if ha == "center" else fx(x + 0.15),
            fyt(y + h/2), s, fontsize=size, color=color, weight=weight,
            ha=ha, va="center", zorder=z + 1)


def arrow(ax, x1, y1, x2, y2, color=BLUE, lw=2):
    ax.add_patch(FancyArrowPatch((fx(x1), fyt(y1)), (fx(x2), fyt(y2)),
                 arrowstyle="-|>", mutation_scale=16, color=color, lw=lw, zorder=4))


def header(ax, title, kicker=None):
    ax.add_patch(plt.Rectangle((fx(0.4), fyt(1.0)), fx(0.14), 0.55/H,
                 color=TEAL, zorder=3))
    if kicker:
        text(ax, 0.72, 0.55, kicker.upper(), 11, HI, "bold")
        text(ax, 0.72, 0.78, title, 25, SLATE, "bold")
    else:
        text(ax, 0.72, 0.7, title, 25, SLATE, "bold")


def image(ax, path, x, y, w, h):
    if not os.path.exists(path):
        box(ax, x, y, w, h, CARD, BORDER, 1); return
    im = plt.imread(path)
    ih, iw = im.shape[0], im.shape[1]
    ar = iw / ih
    boxar = (w) / (h)
    # fit within box, preserve aspect
    if ar > boxar:
        dw = w; dh = w / ar
    else:
        dh = h; dw = h * ar
    ox = x + (w - dw) / 2; oy = y + (h - dh) / 2
    iax = ax.figure.add_axes([fx(ox), fyt(oy + dh), fx(dw), dh / H], zorder=2)
    iax.imshow(im); iax.axis("off")


def save(fig):
    pdf.savefig(fig); plt.close(fig)


# ===================================================== PAGE 1 — TITLE
fig, ax = newpage(SLATE)
ax.add_patch(plt.Rectangle((0, fyt(0.25)), 1, 0.25/H, color=TEAL))
ax.add_patch(plt.Rectangle((0, 0), 1, 0.25/H, color=TEAL))
c = Circle((0.5, fyt(1.7)), 0.055, color=TEAL, zorder=3); ax.add_patch(c)
ax.text(0.5, fyt(1.7), "+", fontsize=40, color=WHITE, ha="center", va="center", weight="bold", zorder=4)
text(ax, W/2, 3.1, "HealthEase", 54, WHITE, "bold", ha="center")
text(ax, W/2, 3.9, "AI-Powered Healthcare Management Platform", 22, HI, "bold", ha="center")
text(ax, W/2, 4.5, "Final Year B.Tech Project", 15, "#CBD5E1", ha="center")
box(ax, W-5.1, 5.3, 4.6, 1.7, "#334155", rounded=0.02)
text(ax, W-4.9, 5.6, "Presented by", 11, "#94A3B8", "bold")
text(ax, W-4.9, 6.05, "2022BITE018  —  Vardan Pal", 12.5, WHITE, "bold")
text(ax, W-4.9, 6.42, "2022BITE037  —  U Rajeshwar", 12.5, WHITE, "bold")
text(ax, W-4.9, 6.79, "2022BITE007  —  Karan Kharadi", 12.5, WHITE, "bold")
_page[0] += 1
save(fig)

# ===================================================== PAGE 2 — AGENDA
fig, ax = newpage(); footer(ax); header(ax, "Agenda", "Outline")
secs = ["Introduction", "Background & Literature", "System Design",
        "Implementation", "Results & Testing", "Conclusion"]
for i, name in enumerate(secs):
    col = i // 3; row = i % 3
    x = 0.9 + col * 6.2; y = 1.8 + row * 1.5
    c = Circle((fx(x + 0.4), fyt(y + 0.4)), 0.035, color=TEAL, zorder=3); ax.add_patch(c)
    ax.text(fx(x + 0.4), fyt(y + 0.4), str(i+1), fontsize=18, color=WHITE,
            ha="center", va="center", weight="bold", zorder=4)
    btext(ax, x + 1.0, y, 4.6, 0.8, CARD, name, 15, SLATE, "bold", ha="left")
save(fig)

# ===================================================== PAGE 3 — ABSTRACT
fig, ax = newpage(); footer(ax); header(ax, "Abstract", "Overview")
box(ax, 1.0, 1.9, 11.3, 3.7, CARD, rounded=0.015)
abst = ("HealthEase is a full-stack MERN platform that digitises paper and\n"
        "handwritten prescriptions using an AI vision-language OCR engine, then\n"
        "applies a custom-trained machine-learning classifier to map each prescribed\n"
        "medicine to the disease it treats.\n\n"
        "It tracks patient vitals and medication compliance, computes a Smart Health\n"
        "Score (0–100), checks drug interactions, and connects patients to doctors\n"
        "through telemedicine — unifying fragmented healthcare workflows into one\n"
        "secure system.")
ax.text(fx(1.4), fyt(3.75), abst, fontsize=15, color=SLATE, va="center", linespacing=1.5)
save(fig)

# ===================================================== PAGE 4 — PROBLEM
fig, ax = newpage(); footer(ax); header(ax, "Problem Statement", "Why HealthEase")
probs = [("Hard-to-read prescriptions", "Paper and handwritten scripts are difficult to digitise."),
         ("Unclear medicines", "Patients don't understand what each medicine is for."),
         ("Poor compliance", "Missed doses and refills lead to worse outcomes."),
         ("Fragmented data", "Vitals, prescriptions and consults live in silos.")]
for i, (t, d) in enumerate(probs):
    col = i % 2; row = i // 2
    x = 0.9 + col * 6.0; y = 1.9 + row * 2.25
    box(ax, x, y, 5.5, 1.95, CARD, rounded=0.02)
    c = Circle((fx(x + 0.65), fyt(y + 0.7)), 0.032, color=AMBER, zorder=3); ax.add_patch(c)
    ax.text(fx(x + 0.65), fyt(y + 0.7), str(i+1), fontsize=16, color=WHITE,
            ha="center", va="center", weight="bold", zorder=4)
    text(ax, x + 1.25, y + 0.45, t, 15, SLATE, "bold")
    text(ax, x + 1.25, y + 0.95, d, 11, GRAY)
save(fig)

# ===================================================== PAGE 5 — MOTIVATION
fig, ax = newpage(); footer(ax); header(ax, "Motivation", "Background")
pts = ["Rising chronic-disease burden demands better tracking.",
       "Prescriptions must be made understandable to patients.",
       "Compliance monitoring should be active, not passive.",
       "Healthcare data needs a single, unified platform.",
       "Modern AI (vision + ML) enables real clinical value."]
for i, p in enumerate(pts):
    text(ax, 0.9, 2.0 + i*0.75, "●", 13, TEAL, "bold")
    text(ax, 1.25, 2.0 + i*0.75, p, 15, SLATE)
box(ax, 8.5, 2.0, 4.0, 3.6, TEAL, rounded=0.02)
text(ax, 10.5, 3.4, "Patient-centric,", 16, WHITE, "bold", ha="center")
text(ax, 10.5, 3.9, "AI-driven care", 16, WHITE, "bold", ha="center")
save(fig)

# ===================================================== PAGE 6 — OBJECTIVES
fig, ax = newpage(); footer(ax); header(ax, "Objectives", "Goals")
objs = ["Automatically extract data from prescription images (OCR).",
        "Map medicines to their indication using a trained ML model.",
        "Track vitals and medication compliance with analytics.",
        "Quantify patient health as a single Smart Health Score.",
        "Enable secure multi-role telemedicine (Patient/Doctor/Admin).",
        "Deliver everything in one responsive, secure web app."]
for i, o in enumerate(objs):
    y = 1.7 + i*0.85
    c = Circle((fx(1.2), fyt(y + 0.31)), 0.026, color=(BLUE if i % 2 else TEAL), zorder=3)
    ax.add_patch(c)
    ax.text(fx(1.2), fyt(y + 0.31), str(i+1), fontsize=14, color=WHITE,
            ha="center", va="center", weight="bold", zorder=4)
    btext(ax, 1.7, y, 10.7, 0.62, CARD, o, 14, SLATE, "normal", ha="left")
save(fig)

# ===================================================== PAGE 7 — LITERATURE
fig, ax = newpage(); footer(ax); header(ax, "Literature Survey", "Existing Systems")
rows = [["Feature", "HealthEase", "Practo", "1mg", "EHR"],
        ["OCR prescription reading", "✓", "✗", "✗", "✗"],
        ["AI medicine → disease mapping", "✓", "✗", "~", "✗"],
        ["Smart Health Score", "✓", "✗", "✗", "✗"],
        ["Compliance tracking", "✓", "✗", "✓", "~"],
        ["Vitals analytics", "✓", "~", "✗", "✓"],
        ["Drug-interaction check", "✓", "✗", "✓", "~"],
        ["Real-time notifications", "✓", "✓", "✓", "✗"]]
cw = [4.6, 1.9, 1.9, 1.9, 1.9]; x0 = 0.7; y0 = 1.7; rh = 0.62
for ri, row in enumerate(rows):
    x = x0
    for ci, val in enumerate(row):
        if ri == 0:
            fc = TEAL if ci == 1 else SLATE
            box(ax, x, y0, cw[ci], rh, fc, rounded=0.0)
            ax.text(fx(x + (0.12 if ci == 0 else cw[ci]/2)), fyt(y0 + rh/2), val,
                    fontsize=12, color=WHITE, weight="bold",
                    ha=("left" if ci == 0 else "center"), va="center", zorder=3)
        else:
            fc = "#E2F5F2" if ci == 1 else (WHITE if ri % 2 else CARD)
            box(ax, x, y0 + ri*rh, cw[ci], rh, fc, BORDER, 0.5, rounded=0.0)
            col = GREEN if val == "✓" else (AMBER if val == "~" else (LGRAY if val == "✗" else SLATE))
            wt = "bold" if val in ("✓", "~") or ci == 0 else "normal"
            ax.text(fx(x + (0.12 if ci == 0 else cw[ci]/2)), fyt(y0 + ri*rh + rh/2),
                    val, fontsize=12, color=col, weight=wt,
                    ha=("left" if ci == 0 else "center"), va="center", zorder=3)
        x += cw[ci]
save(fig)

# ===================================================== PAGE 8 — TECH STACK
fig, ax = newpage(); footer(ax); header(ax, "Technology Stack", "System Design")
bands = [("Frontend", "React + Vite · Tailwind CSS · Context API", TEAL),
         ("Backend", "Node.js + Express · JWT · bcrypt", "#0E7A9B"),
         ("Database", "MongoDB + Mongoose", "#1565C0"),
         ("Real-time", "Socket.IO live notifications", BLUE),
         ("OCR Service", "Python + FastAPI", "#0D9488"),
         ("OCR Engine", "Groq Llama-4 Vision (pre-trained)", HI),
         ("Machine Learning", "scikit-learn (custom-trained)", GREEN),
         ("PDF Export", "jsPDF + html2canvas", "#64748B")]
for i, (n, d, c) in enumerate(bands):
    y = 1.62 + i*0.66
    btext(ax, 0.9, y, 3.4, 0.58, c, n, 13, WHITE, "bold", ha="left")
    btext(ax, 4.4, y, 8.0, 0.58, CARD, d, 12, SLATE, "normal", ha="left")
save(fig)

# ===================================================== PAGE 9 — ARCHITECTURE
fig, ax = newpage(); footer(ax); header(ax, "System Architecture", "System Design")
btext(ax, 4.4, 1.55, 4.5, 0.8, TEAL, "React + Vite Client", 14)
btext(ax, 4.4, 3.0, 4.5, 0.8, BLUE, "Node.js + Express API Gateway", 13)
btext(ax, 1.5, 4.6, 4.0, 0.8, SLATE, "MongoDB Database", 13)
btext(ax, 7.9, 4.6, 4.0, 0.8, GREEN, "Python FastAPI Service", 13)
btext(ax, 6.9, 6.0, 2.7, 0.7, HI, "Groq Vision OCR", 11)
btext(ax, 10.0, 6.0, 2.7, 0.7, "#16A34A", "ML Classifier", 11)
arrow(ax, 6.65, 2.35, 6.65, 3.0, BLUE)
arrow(ax, 3.5, 3.8, 3.5, 4.6, TEAL)
arrow(ax, 9.9, 3.8, 9.9, 4.6, GREEN)
arrow(ax, 8.35, 5.4, 8.35, 6.0, HI)
arrow(ax, 11.3, 5.4, 11.3, 6.0, "#16A34A")
text(ax, 6.8, 2.62, "REST + WebSockets", 9, GRAY, "bold")
text(ax, 2.55, 4.3, "Mongoose ODM", 9, GRAY, "bold")
text(ax, 9.95, 4.3, "HTTP REST", 9, GRAY, "bold")
save(fig)

# ===================================================== PAGE 10 — DFD
fig, ax = newpage(); footer(ax); header(ax, "Data Flow Diagram (Level 1)", "System Design")
btext(ax, 0.6, 2.0, 1.9, 0.8, SLATE, "Patient", 13, rounded=0.0)
btext(ax, 0.6, 5.0, 1.9, 0.8, SLATE, "Doctor", 13, rounded=0.0)
procs = [("1.0 Upload\nPrescription", 3.1, 1.7, TEAL),
         ("2.0 OCR\nExtraction", 5.6, 1.7, TEAL),
         ("3.0 Medicine\nClassification", 8.1, 1.7, BLUE),
         ("4.0 Vitals\nLogging", 3.1, 4.0, TEAL),
         ("5.0 Health\nScore", 5.6, 4.0, GREEN),
         ("6.0 Tele-\nmedicine", 8.1, 4.0, BLUE)]
for t, x, y, c in procs:
    cc = Circle((fx(x + 1.0), fyt(y + 0.6)), 0.075, color=c, zorder=3); ax.add_patch(cc)
    ax.text(fx(x + 1.0), fyt(y + 0.6), t, fontsize=10, color=WHITE,
            ha="center", va="center", weight="bold", zorder=4)
for t, x, y in [("Prescriptions", 10.7, 1.9), ("Medicines", 10.7, 3.0), ("Vitals", 10.7, 4.3)]:
    btext(ax, x, y, 2.2, 0.55, CARD, t, 11, SLATE, "bold", ec=TEAL, lw=1.2, rounded=0.0)
arrow(ax, 2.5, 2.3, 3.1, 2.3, TEAL); arrow(ax, 5.1, 2.3, 5.6, 2.3, TEAL)
arrow(ax, 7.6, 2.3, 8.1, 2.3, BLUE)
arrow(ax, 2.5, 5.1, 3.1, 4.7, TEAL); arrow(ax, 5.1, 4.6, 5.6, 4.6, GREEN)
arrow(ax, 7.6, 4.6, 8.1, 4.6, BLUE)
arrow(ax, 10.1, 2.2, 10.7, 2.15, GRAY, 1.5)
arrow(ax, 10.1, 2.4, 10.7, 3.25, GRAY, 1.5)
save(fig)

# ===================================================== PAGE 11 — USE CASE
fig, ax = newpage(); footer(ax); header(ax, "Use-Case Diagram", "System Design")
box(ax, 3.4, 1.55, 6.5, 5.1, WHITE, TEAL, 1.5, rounded=0.01)
text(ax, 6.65, 1.85, "HealthEase System", 13, TEAL, "bold", ha="center")
for t, x, y in [("Patient", 0.7, 3.3), ("Doctor", 11.4, 3.3), ("Admin", 6.0, 6.75)]:
    btext(ax, x, y, 1.4, 0.6, SLATE, t, 12, rounded=0.0)
uc = [("Upload Prescription", 3.7, 2.15), ("Log Vitals", 3.7, 2.9),
      ("View Health Score", 3.7, 3.65), ("Book Consultation", 3.7, 4.4),
      ("Set Reminders", 3.7, 5.15), ("View Records", 7.3, 2.15),
      ("Add Diagnosis", 7.3, 2.9), ("Conduct Consult", 7.3, 3.65),
      ("Approve Doctors", 5.4, 5.5), ("Manage Users", 7.6, 5.5)]
for t, x, y in uc:
    e = FancyBboxPatch((fx(x), fyt(y + 0.55)), fx(2.5), 0.55/H,
                       boxstyle="round,pad=0,rounding_size=0.27", fc=TEAL, ec="none", zorder=2)
    ax.add_patch(e)
    ax.text(fx(x + 1.25), fyt(y + 0.275), t, fontsize=10, color=WHITE,
            ha="center", va="center", weight="bold", zorder=3)
save(fig)

# ===================================================== PAGE 12 — ER
fig, ax = newpage(); footer(ax); header(ax, "Database Design (ER Diagram)", "System Design")
ent = [("User", "email · role · passwordHash", 5.3, 1.55, TEAL),
       ("Patient", "age · gender · contact", 1.2, 3.1, BLUE),
       ("Doctor", "specialty · approved", 9.4, 3.1, BLUE),
       ("Prescription", "doctorName · medications[]", 1.2, 5.0, GREEN),
       ("Medicine", "dosage · frequency · stock", 5.3, 5.0, GREEN),
       ("Consultation", "date · status · notes", 9.4, 5.0, GREEN)]
for n, f, x, y, c in ent:
    btext(ax, x, y, 2.9, 0.5, c, n, 13, rounded=0.0)
    btext(ax, x, y + 0.5, 2.9, 0.7, CARD, f, 9.5, SLATE, "normal", ec=c, lw=1, rounded=0.0)
arrow(ax, 5.9, 2.25, 2.6, 3.1, GRAY, 1.5)
arrow(ax, 7.1, 2.25, 10.5, 3.1, GRAY, 1.5)
arrow(ax, 2.6, 3.8, 2.6, 5.0, GRAY, 1.5)
arrow(ax, 4.1, 5.35, 5.3, 5.35, GRAY, 1.5)
arrow(ax, 10.5, 3.8, 10.5, 5.0, GRAY, 1.5)
text(ax, 4.0, 2.55, "1:1", 9, GRAY, "bold")
text(ax, 2.7, 4.45, "1:N", 9, GRAY, "bold")
save(fig)

# ===================================================== PAGE 13 — SEQUENCE
fig, ax = newpage(); footer(ax); header(ax, "Sequence Diagram — Prescription Flow", "System Design")
lifes = ["Patient", "Client", "API", "OCR Svc", "ML Model", "Database"]
xs = [1.2, 3.1, 5.0, 7.0, 9.0, 11.0]
for n, x in zip(lifes, xs):
    btext(ax, x - 0.6, 1.55, 1.7, 0.55, TEAL, n, 11)
    ax.plot([fx(x + 0.25), fx(x + 0.25)], [fyt(6.7), fyt(2.1)],
            color="#CBD5E1", lw=1, zorder=1)
msgs = [(0, 1, "upload image"), (1, 2, "POST /api/ocr"), (2, 3, "forward image"),
        (3, 3, "vision request → Groq"), (3, 2, "extracted text"),
        (2, 4, "POST /classify-medicines"), (4, 2, "class + indication"),
        (2, 5, "save prescription"), (2, 1, "result"), (1, 0, "display")]
y = 2.5
for a, b, t in msgs:
    xa, xb = xs[a] + 0.25, xs[b] + 0.25
    if a == b:
        text(ax, xa + 0.05, y - 0.12, "↻ " + t, 9, BLUE, "bold")
    else:
        arrow(ax, xa, y, xb, y, (BLUE if xb > xa else GREEN), 1.5)
        text(ax, min(xa, xb) + 0.05, y - 0.18, t, 9, SLATE)
    y += 0.42
save(fig)

# ===================================================== PAGE 14 — OCR
fig, ax = newpage(); footer(ax); header(ax, "OCR Prescription Reader", "Implementation")
ocrpts = ["Type: AI Vision-Language OCR (not Tesseract).",
          "Engine: Groq Llama-4 Scout vision model (pre-trained).",
          "Handles printed AND handwritten prescriptions.",
          "Returns structured fields ready for the database."]
for i, p in enumerate(ocrpts):
    text(ax, 0.9, 2.0 + i*0.7, "●", 12, TEAL, "bold")
    text(ax, 1.25, 2.0 + i*0.7, p, 13.5, SLATE)
steps = ["Image Upload", "Preprocess (resize + RGB)", "Base64 Encode",
         "Vision Model + Prompt", "Structured Output"]
y = 1.9
for i, st in enumerate(steps):
    btext(ax, 7.0, y, 5.2, 0.66, (TEAL if i % 2 == 0 else BLUE), st, 12.5)
    if i < len(steps) - 1:
        arrow(ax, 9.6, y + 0.66, 9.6, y + 0.92, BLUE)
    y += 0.94
save(fig)

# ===================================================== PAGE 15 — ML OVERVIEW
fig, ax = newpage(); footer(ax); header(ax, "Medicine-Indication Classifier", "Implementation · ML")
mlpts = ["Predicts therapeutic class + disease from the medicine NAME.",
         "Generalises to drug names never seen in training.",
         "Built on WHO INN naming stems (e.g. -pril, -statin).",
         "Custom-trained — reproducible from our dataset."]
for i, p in enumerate(mlpts):
    text(ax, 0.9, 2.0 + i*0.72, "●", 12, TEAL, "bold")
    text(ax, 1.25, 2.0 + i*0.72, p, 13, SLATE)
stem = [["Stem", "Class", "Example"], ["-pril", "ACE Inhibitor", "Lisinopril"],
        ["-statin", "Statin", "Atorvastatin"], ["-cillin", "Penicillin", "Amoxicillin"],
        ["-floxacin", "Fluoroquinolone", "Ciprofloxacin"], ["-prazole", "PPI", "Omeprazole"],
        ["-dipine", "Ca-Channel Blocker", "Amlodipine"]]
cw = [1.5, 2.6, 2.0]; x0 = 6.8; y0 = 1.9; rh = 0.6
for ri, row in enumerate(stem):
    x = x0
    for ci, v in enumerate(row):
        fc = TEAL if ri == 0 else (WHITE if ri % 2 else CARD)
        box(ax, x, y0 + ri*rh, cw[ci], rh, fc, BORDER, 0.5, rounded=0.0)
        col = WHITE if ri == 0 else (BLUE if ci == 0 else SLATE)
        ax.text(fx(x + 0.12), fyt(y0 + ri*rh + rh/2), v, fontsize=11.5,
                color=col, weight="bold" if (ri == 0 or ci == 0) else "normal",
                va="center", zorder=3)
        x += cw[ci]
save(fig)

# ===================================================== PAGE 16 — ML METHOD
fig, ax = newpage(); footer(ax); header(ax, "ML Methodology", "Implementation · ML")
stages = ["Curated Dataset — 321 medicines · 27 classes",
          "Feature Extraction — Character n-gram TF-IDF (n = 2–4)",
          "Train / Test Split — 75% / 25% stratified",
          "Model Training — Logistic Regression",
          "5-Fold Cross-Validation",
          "Evaluation — Accuracy · F1 · Confusion Matrix",
          "Deployed Model — medicine_classifier.joblib"]
y = 1.55
for i, st in enumerate(stages):
    btext(ax, 3.0, y, 7.3, 0.58, (TEAL if i % 2 == 0 else BLUE), st, 12.5)
    if i < len(stages) - 1:
        arrow(ax, 6.65, y + 0.58, 6.65, y + 0.72, BLUE, 2)
    y += 0.72
save(fig)

# ===================================================== PAGE 17 — ML RESULTS
fig, ax = newpage(); footer(ax); header(ax, "ML Results", "Implementation · ML")
cards = [("85.4%", "Cross-Validated"), ("76.5%", "Test Accuracy"), ("0.78", "Macro F1")]
for i, (b, l) in enumerate(cards):
    x = 0.8 + i*2.1
    box(ax, x, 1.7, 1.9, 1.4, CARD, rounded=0.02)
    text(ax, x + 0.95, 2.25, b, 27, GREEN, "bold", ha="center")
    text(ax, x + 0.95, 2.8, l, 10.5, SLATE, "bold", ha="center")
text(ax, 0.8, 3.5, "Model comparison (5-fold CV):", 13, SLATE, "bold")
comp = [("Logistic Regression", "82.9%"), ("Linear SVM", "81.7%"), ("Naive Bayes", "77.9%")]
for i, (m, v) in enumerate(comp):
    y = 4.0 + i*0.6
    btext(ax, 0.8, y, 4.2, 0.5, CARD, m, 12, SLATE, "bold", ha="left")
    btext(ax, 5.1, y, 1.7, 0.5, TEAL, v, 12)
text(ax, 0.8, 6.15, "The model independently rediscovered medical naming\nconventions from data.",
     12, BLUE, "bold")
image(ax, os.path.join(CLEAN, "g1_learning_curve.png"), 7.2, 1.7, 5.7, 4.0)
save(fig)

# ===================================================== PAGE 18 — FEATURES
fig, ax = newpage(); footer(ax); header(ax, "Key Features", "Implementation")
feats = ["Multi-role Auth", "AI OCR Digitiser", "Medicine→Disease", "Interaction Check",
         "Vitals Analytics", "Smart Health Score", "Tracker + Reminders", "Notifications",
         "Telemedicine", "Admin Dashboard", "PDF Export", "Dark Mode / UI"]
for i, t in enumerate(feats):
    col = i % 4; row = i // 4
    x = 0.7 + col*3.1; y = 1.75 + row*1.55
    box(ax, x, y, 2.85, 1.35, CARD, rounded=0.02)
    c = Circle((fx(x + 0.55), fyt(y + 0.67)), 0.03, color=TEAL, zorder=3); ax.add_patch(c)
    ax.text(fx(x + 0.55), fyt(y + 0.67), str(i+1), fontsize=12, color=WHITE,
            ha="center", va="center", weight="bold", zorder=4)
    text(ax, x + 1.0, y + 0.6, t, 12, SLATE, "bold")
save(fig)

# ===================================================== PAGE 19 — WORKFLOW
fig, ax = newpage(); footer(ax); header(ax, "End-to-End Workflow", "Implementation")
flow = ["Upload\nPrescription", "OCR\nExtraction", "ML\nClassification", "Interaction\nCheck",
        "Schedule\nReminders", "Log\nVitals", "Update Health\nScore", "Doctor Review\n/ PDF"]
for i, st in enumerate(flow):
    col = i % 4; row = i // 4
    x = 0.8 + col*3.15; y = 2.1 + row*2.2
    cc = Circle((fx(x + 1.1), fyt(y + 0.7)), 0.085, color=(TEAL if i % 2 == 0 else BLUE), zorder=3)
    ax.add_patch(cc)
    ax.text(fx(x + 1.1), fyt(y + 0.5), str(i+1), fontsize=15, color=WHITE,
            ha="center", va="center", weight="bold", zorder=4)
    ax.text(fx(x + 1.1), fyt(y + 0.85), st, fontsize=10, color=WHITE,
            ha="center", va="center", weight="bold", zorder=4)
    if col < 3:
        arrow(ax, x + 2.0, y + 0.7, x + 3.15, y + 0.7, GRAY, 2)
    elif row == 0:
        arrow(ax, x + 1.1, y + 1.45, x + 1.1, y + 2.15, GRAY, 2)
save(fig)

# ===================================================== PAGE 20 — SCREENSHOTS
fig, ax = newpage(); footer(ax); header(ax, "Application Results", "Results & Testing")
shots = [("Patient Dashboard", "dashboard.png"), ("Prescription Records", "prescriptions.png"),
         ("Prescription Digitizer", "upload.png"), ("Doctor Marketplace", "doctors.png"),
         ("Medicine Tracker", "medicine_tracker.png"), ("Vitals Analytics", "vitals.png")]
for i, (lab, fn) in enumerate(shots):
    col = i % 3; row = i // 3
    x = 0.55 + col*4.25; y = 1.6 + row*2.6
    box(ax, x - 0.04, y - 0.04, 4.0, 2.28, WHITE, TEAL, 1.0, rounded=0.005)
    image(ax, os.path.join(SHOTS, fn), x, y, 3.92, 1.85)
    text(ax, x + 1.96, y + 2.05, lab, 11, SLATE, "bold", ha="center")
save(fig)

# ===================================================== PAGE 21 — CLEAN GRAPHS
fig, ax = newpage(); footer(ax); header(ax, "ML Graphs & Analytics", "Results & Testing")
imgs = ["g1_learning_curve.png", "g3_accuracy_gauge.png",
        "g2_model_comparison.png", "g4_confidence.png"]
for i, fn in enumerate(imgs):
    col = i % 2; row = i // 2
    x = 0.7 + col*6.2; y = 1.55 + row*2.7
    box(ax, x - 0.05, y - 0.05, 5.9, 2.6, WHITE, BORDER, 1, rounded=0.005)
    image(ax, os.path.join(CLEAN, fn), x, y, 5.8, 2.5)
save(fig)

# ===================================================== PAGE 22 — TESTING
fig, ax = newpage(); footer(ax); header(ax, "Testing", "Results & Testing")
tests = [["ID", "Module", "Input", "Expected", "Result"],
         ["T01", "Auth", "Valid login", "JWT returned", "Pass"],
         ["T02", "Auth", "Wrong password", "401 error", "Pass"],
         ["T03", "OCR", "Prescription image", "Structured fields", "Pass"],
         ["T04", "ML Classify", "\"Amoxicillin\"", "Bacterial Infection", "Pass"],
         ["T05", "Interactions", "2 drugs", "Interaction list", "Pass"],
         ["T06", "Reminder", "Set 08:00", "Reminder saved", "Pass"],
         ["T07", "Health Score", "Vitals logged", "Score 0–100", "Pass"]]
cw = [1.1, 2.2, 3.0, 3.4, 2.2]; x0 = 0.7; y0 = 1.7; rh = 0.62
for ri, row in enumerate(tests):
    x = x0
    for ci, v in enumerate(row):
        if ri == 0:
            box(ax, x, y0, cw[ci], rh, SLATE, rounded=0.0)
            ax.text(fx(x + (cw[ci]/2 if ci in (0, 4) else 0.12)), fyt(y0 + rh/2), v,
                    fontsize=12, color=WHITE, weight="bold",
                    ha=("center" if ci in (0, 4) else "left"), va="center", zorder=3)
        else:
            box(ax, x, y0 + ri*rh, cw[ci], rh, (WHITE if ri % 2 else CARD), BORDER, 0.5, rounded=0.0)
            col = GREEN if v == "Pass" else SLATE
            ax.text(fx(x + (cw[ci]/2 if ci in (0, 4) else 0.12)), fyt(y0 + ri*rh + rh/2), v,
                    fontsize=11.5, color=col, weight="bold" if v == "Pass" else "normal",
                    ha=("center" if ci in (0, 4) else "left"), va="center", zorder=3)
        x += cw[ci]
save(fig)

# ===================================================== PAGE 23 — FUTURE
fig, ax = newpage(); footer(ax); header(ax, "Future Scope", "Conclusion")
ax.plot([fx(1.0), fx(12.3)], [fyt(4.0), fyt(4.0)], color=TEAL, lw=3, zorder=1)
ms = ["WebRTC live\nvideo consults", "Wearable sync\n(Apple/Google Fit)",
      "Predictive ML\nfor vitals", "Expand to 50+\ndrug classes", "Mobile\napp"]
for i, m in enumerate(ms):
    x = 1.1 + i*2.45
    c = Circle((fx(x + 0.3), fyt(4.0)), 0.028, color=(BLUE if i % 2 else TEAL), zorder=3)
    ax.add_patch(c)
    ax.text(fx(x + 0.3), fyt(4.0), str(i+1), fontsize=14, color=WHITE,
            ha="center", va="center", weight="bold", zorder=4)
    yy = 2.4 if i % 2 == 0 else 4.7
    btext(ax, x - 0.6, yy, 1.9, 1.0, CARD, m, 11.5, SLATE, "bold")
save(fig)

# ===================================================== PAGE 24 — THANK YOU
fig, ax = newpage(SLATE)
ax.add_patch(plt.Rectangle((0, fyt(0.25)), 1, 0.25/H, color=TEAL))
ax.add_patch(plt.Rectangle((0, 0), 1, 0.25/H, color=TEAL))
ax.text(0.5, 0.5, "Thank You", fontsize=60, color=HI, ha="center", va="center", weight="bold")
_page[0] += 1
save(fig)

pdf.close()
print("Saved:", os.path.abspath(OUT), "| pages:", _page[0])
