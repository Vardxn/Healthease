"""
make_clean_graphs.py — simple, presentation-friendly graphs (points + arcs/curves,
NO bar charts). Easy for a presenter to explain. Output: ml/figures_clean/*.png
Run: venv/bin/python make_clean_graphs.py
"""
import json
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Wedge, Circle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, learning_curve
from sklearn.pipeline import Pipeline

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "figures_clean")
os.makedirs(OUT, exist_ok=True)

TEAL = "#0D9488"
BLUE = "#2563EB"
GREEN = "#22C55E"
AMBER = "#F59E0B"
SLATE = "#1E293B"
GRAY = "#94A3B8"
LIGHT = "#E2E8F0"

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "axes.edgecolor": "#CBD5E1",
    "axes.linewidth": 1.0,
    "axes.grid": True,
    "grid.color": "#EEF2F6",
    "grid.linewidth": 1.0,
    "figure.facecolor": "white",
    "axes.facecolor": "white",
})


def style(ax):
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.tick_params(colors=SLATE, labelsize=11)
    for s in ("left", "bottom"):
        ax.spines[s].set_color("#CBD5E1")


# ---------- 1. Learning curve: points + smooth arc ----------
def learning_curve_graph():
    df = pd.read_csv(os.path.join(HERE, "data", "medicine_indications.csv"))
    df["medicine_name"] = df["medicine_name"].str.strip()
    X, y = df["medicine_name"].values, df["therapeutic_class"].values
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4), sublinear_tf=True)),
        ("clf", LogisticRegression(max_iter=2000, C=10)),
    ])
    cv = StratifiedKFold(5, shuffle=True, random_state=42)
    sizes, _, val = learning_curve(pipe, X, y, cv=cv, scoring="accuracy",
                                   train_sizes=np.linspace(0.2, 1.0, 8),
                                   shuffle=True, random_state=42)
    val_mean = val.mean(1) * 100

    # smooth arc through points
    xs = np.linspace(sizes.min(), sizes.max(), 300)
    coef = np.polyfit(sizes, val_mean, 3)
    ys = np.polyval(coef, xs)

    fig, ax = plt.subplots(figsize=(7.2, 4.6))
    ax.plot(xs, ys, color=TEAL, lw=3, zorder=1)
    ax.scatter(sizes, val_mean, s=90, color=BLUE, edgecolor="white",
               linewidth=2, zorder=3)
    for sx, sy in zip(sizes, val_mean):
        ax.annotate(f"{sy:.0f}%", (sx, sy), textcoords="offset points",
                    xytext=(0, 12), ha="center", fontsize=9, color=SLATE)
    style(ax)
    ax.set_xlabel("Number of training medicines", fontsize=12, color=SLATE)
    ax.set_ylabel("Validation accuracy (%)", fontsize=12, color=SLATE)
    ax.set_title("Accuracy improves as we add more training data",
                 fontsize=13.5, color=SLATE, fontweight="bold", pad=12)
    ax.set_ylim(50, 100)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "g1_learning_curve.png"), dpi=150)
    plt.close(fig)


# ---------- 2. Model comparison: dot (lollipop) plot, no bars ----------
def model_comparison_graph():
    metrics = json.load(open(os.path.join(HERE, "results", "metrics.json")))
    comp = metrics["model_comparison_cv"]
    names = list(comp.keys())
    vals = [comp[n] * 100 for n in names]
    order = np.argsort(vals)
    names = [names[i] for i in order]
    vals = [vals[i] for i in order]
    y = np.arange(len(names))

    fig, ax = plt.subplots(figsize=(7.2, 4.6))
    colors = [GREEN if v == max(vals) else BLUE for v in vals]
    for yi, v, c in zip(y, vals, colors):
        ax.plot([70, v], [yi, yi], color=LIGHT, lw=3, zorder=1)
        ax.scatter(v, yi, s=240, color=c, edgecolor="white", linewidth=2, zorder=3)
        ax.annotate(f"{v:.1f}%", (v, yi), textcoords="offset points",
                    xytext=(16, 0), va="center", fontsize=11,
                    color=SLATE, fontweight="bold")
    ax.set_yticks(y); ax.set_yticklabels(names, fontsize=11, color=SLATE)
    ax.set_xlim(70, 100)
    style(ax); ax.grid(axis="y", visible=False)
    ax.set_xlabel("Cross-validated accuracy (%)", fontsize=12, color=SLATE)
    ax.set_title("Model comparison — Logistic Regression wins",
                 fontsize=13.5, color=SLATE, fontweight="bold", pad=12)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "g2_model_comparison.png"), dpi=150)
    plt.close(fig)


# ---------- 3. Accuracy gauge: an ARC ----------
def gauge_graph():
    metrics = json.load(open(os.path.join(HERE, "results", "metrics.json")))
    acc = metrics["cross_val_accuracy_mean"] * 100

    fig, ax = plt.subplots(figsize=(7.2, 4.6))
    ax.set_aspect("equal"); ax.axis("off")
    cx, cy, r, w = 0.5, 0.42, 0.40, 0.13
    # background arc 180 -> 0
    ax.add_patch(Wedge((cx, cy), r, 0, 180, width=w, facecolor=LIGHT))
    # filled arc proportional to accuracy (left=180 to right=0)
    ang = 180 - (acc / 100.0) * 180
    ax.add_patch(Wedge((cx, cy), r, ang, 180, width=w, facecolor=TEAL))
    ax.text(cx, cy + 0.02, f"{acc:.1f}%", ha="center", va="center",
            fontsize=34, color=SLATE, fontweight="bold")
    ax.text(cx, cy - 0.12, "Cross-Validated Accuracy", ha="center",
            va="center", fontsize=12, color=GRAY)
    ax.text(cx - r + w/2, cy - 0.06, "0%", ha="center", fontsize=10, color=GRAY)
    ax.text(cx + r - w/2, cy - 0.06, "100%", ha="center", fontsize=10, color=GRAY)
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.set_title("Overall model accuracy", fontsize=13.5, color=SLATE,
                 fontweight="bold", pad=4)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "g3_accuracy_gauge.png"), dpi=150)
    plt.close(fig)


# ---------- 4. Confidence on sample drugs: points ----------
def confidence_graph():
    drugs = [("Ciprofloxacin", 86), ("Amoxicillin", 87), ("Omeprazole", 85),
             ("Telmisartan", 83), ("Doxycycline", 83), ("Atorvastatin", 82),
             ("Metformin", 64)]
    drugs = sorted(drugs, key=lambda d: d[1])
    names = [d[0] for d in drugs]
    vals = [d[1] for d in drugs]
    y = np.arange(len(names))

    fig, ax = plt.subplots(figsize=(7.2, 4.6))
    for yi, v in zip(y, vals):
        c = GREEN if v >= 80 else AMBER
        ax.plot([0, v], [yi, yi], color=LIGHT, lw=3, zorder=1)
        ax.scatter(v, yi, s=200, color=c, edgecolor="white", linewidth=2, zorder=3)
        ax.annotate(f"{v}%", (v, yi), textcoords="offset points",
                    xytext=(14, 0), va="center", fontsize=10.5,
                    color=SLATE, fontweight="bold")
    ax.set_yticks(y); ax.set_yticklabels(names, fontsize=11, color=SLATE)
    ax.set_xlim(0, 100)
    style(ax); ax.grid(axis="y", visible=False)
    ax.set_xlabel("Prediction confidence (%)", fontsize=12, color=SLATE)
    ax.set_title("Model is confident on real medicines",
                 fontsize=13.5, color=SLATE, fontweight="bold", pad=12)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "g4_confidence.png"), dpi=150)
    plt.close(fig)


if __name__ == "__main__":
    learning_curve_graph(); print("g1 learning curve")
    model_comparison_graph(); print("g2 model comparison")
    gauge_graph(); print("g3 accuracy gauge")
    confidence_graph(); print("g4 confidence")
    print("Saved clean graphs ->", OUT)
