"""
train_classifier.py
-------------------
Trains the HealthEase Medicine-Indication Classifier.

Task        : Given a medicine NAME (string), predict its therapeutic class and,
              from that, the disease / condition it is indicated for.
Why it works: Drug names follow WHO INN stem conventions (-pril, -statin,
              -cillin, cef-, -floxacin ...). We extract character n-gram features
              (TF-IDF, char_wb, n=2..5) so the model learns these morphological
              patterns and generalises to UNSEEN drug names.

Pipeline    : TfidfVectorizer(char) -> Linear classifier
Evaluation  : stratified train/test split, 5-fold cross-validation, learning
              curve, confusion matrix, per-class P/R/F1, model comparison.

Outputs (all real, generated from the data):
  models/medicine_classifier.joblib   - trained model
  results/metrics.json                 - headline numbers
  results/classification_report.txt    - per-class report
  figures/*.png                        - graphs for the report / PPT

Run: python train_classifier.py
"""

import json
import os

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import (
    StratifiedKFold,
    cross_val_score,
    learning_curve,
    train_test_split,
)
from sklearn.naive_bayes import ComplementNB
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data", "medicine_indications.csv")
FIG = os.path.join(HERE, "figures")
MODELS = os.path.join(HERE, "models")
RESULTS = os.path.join(HERE, "results")
RANDOM_STATE = 42

for d in (FIG, MODELS, RESULTS):
    os.makedirs(d, exist_ok=True)

sns.set_theme(style="whitegrid")
PALETTE = "viridis"


def make_pipeline(estimator):
    """Char n-gram TF-IDF features + a linear classifier."""
    return Pipeline([
        ("tfidf", TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(2, 4),
            min_df=1,
            sublinear_tf=True,
        )),
        ("clf", estimator),
    ])


def plot_class_distribution(df):
    counts = df["therapeutic_class"].value_counts().sort_values()
    plt.figure(figsize=(10, 7))
    sns.barplot(x=counts.values, y=counts.index, hue=counts.index,
                palette=PALETTE, legend=False)
    plt.xlabel("Number of medicines")
    plt.ylabel("")
    plt.title("Dataset Composition — Medicines per Therapeutic Class")
    plt.tight_layout()
    plt.savefig(os.path.join(FIG, "01_class_distribution.png"), dpi=150)
    plt.close()


def plot_model_comparison(X_train, y_train):
    """5-fold CV accuracy for several models -> model-selection graph."""
    candidates = {
        "Logistic Regression": LogisticRegression(max_iter=2000, C=10),
        "Linear SVM": LinearSVC(C=1.0),
        "Complement NB": ComplementNB(),
    }
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    names, means, stds = [], [], []
    for name, est in candidates.items():
        scores = cross_val_score(make_pipeline(est), X_train, y_train,
                                 cv=cv, scoring="accuracy")
        names.append(name)
        means.append(scores.mean())
        stds.append(scores.std())
        print(f"  {name:<22} CV accuracy = {scores.mean():.3f} +/- {scores.std():.3f}")

    plt.figure(figsize=(8, 5))
    bars = plt.bar(names, means, yerr=stds, capsize=6,
                   color=sns.color_palette(PALETTE, len(names)))
    for bar, m in zip(bars, means):
        plt.text(bar.get_x() + bar.get_width() / 2, m + 0.01,
                 f"{m:.2%}", ha="center", fontweight="bold")
    plt.ylim(0, 1.05)
    plt.ylabel("5-Fold CV Accuracy")
    plt.title("Model Selection — Cross-Validated Accuracy")
    plt.tight_layout()
    plt.savefig(os.path.join(FIG, "02_model_comparison.png"), dpi=150)
    plt.close()
    return dict(zip(names, means))


def plot_learning_curve(pipeline, X, y):
    """THE training graph: accuracy vs amount of training data."""
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    sizes, train_scores, val_scores = learning_curve(
        pipeline, X, y, cv=cv, scoring="accuracy",
        train_sizes=np.linspace(0.2, 1.0, 8), shuffle=True,
        random_state=RANDOM_STATE,
    )
    train_mean, train_std = train_scores.mean(1), train_scores.std(1)
    val_mean, val_std = val_scores.mean(1), val_scores.std(1)

    plt.figure(figsize=(8, 5))
    plt.plot(sizes, train_mean, "o-", color="#2a9d8f", label="Training accuracy")
    plt.fill_between(sizes, train_mean - train_std, train_mean + train_std,
                     alpha=0.15, color="#2a9d8f")
    plt.plot(sizes, val_mean, "o-", color="#e76f51", label="Validation accuracy")
    plt.fill_between(sizes, val_mean - val_std, val_mean + val_std,
                     alpha=0.15, color="#e76f51")
    plt.xlabel("Number of training samples")
    plt.ylabel("Accuracy")
    plt.title("Learning Curve — Model Accuracy vs Training Data Size")
    plt.legend(loc="lower right")
    plt.ylim(0, 1.05)
    plt.tight_layout()
    plt.savefig(os.path.join(FIG, "03_learning_curve.png"), dpi=150)
    plt.close()
    return sizes, train_mean, val_mean


def plot_confusion(y_test, y_pred, labels):
    cm = confusion_matrix(y_test, y_pred, labels=labels)
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=labels, yticklabels=labels, cbar=False)
    plt.xlabel("Predicted class")
    plt.ylabel("True class")
    plt.title("Confusion Matrix — Held-out Test Set")
    plt.xticks(rotation=45, ha="right")
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.savefig(os.path.join(FIG, "04_confusion_matrix.png"), dpi=150)
    plt.close()


def plot_per_class_f1(report_dict):
    rows = {k: v for k, v in report_dict.items()
            if k not in ("accuracy", "macro avg", "weighted avg")}
    classes = list(rows.keys())
    f1s = [rows[c]["f1-score"] for c in classes]
    order = np.argsort(f1s)
    classes = [classes[i] for i in order]
    f1s = [f1s[i] for i in order]
    plt.figure(figsize=(10, 7))
    sns.barplot(x=f1s, y=classes, hue=classes, palette=PALETTE, legend=False)
    plt.xlabel("F1-score")
    plt.ylabel("")
    plt.xlim(0, 1.05)
    plt.title("Per-Class F1-Score on Test Set")
    plt.tight_layout()
    plt.savefig(os.path.join(FIG, "05_per_class_f1.png"), dpi=150)
    plt.close()


def plot_top_ngrams(pipeline, top_n=6):
    """Show which name-fragments the model learned per class (great for viva)."""
    vec = pipeline.named_steps["tfidf"]
    clf = pipeline.named_steps["clf"]
    if not hasattr(clf, "coef_"):
        return
    feature_names = np.array(vec.get_feature_names_out())
    classes = clf.classes_
    # pick a representative subset so the figure stays readable
    subset = ["ACE Inhibitor", "Statin", "Penicillin Antibiotic",
              "Fluoroquinolone Antibiotic", "Proton Pump Inhibitor",
              "Calcium Channel Blocker"]
    subset = [c for c in subset if c in list(classes)]
    fig, axes = plt.subplots(2, 3, figsize=(15, 9))
    for ax, cls in zip(axes.ravel(), subset):
        idx = list(classes).index(cls)
        coefs = clf.coef_[idx]
        top = np.argsort(coefs)[-top_n:]
        frags = [repr(feature_names[i]) for i in top]
        vals = coefs[top]
        ax.barh(range(len(top)), vals,
                color=sns.color_palette(PALETTE, len(top)))
        ax.set_yticks(range(len(top)))
        ax.set_yticklabels(frags)
        ax.set_title(cls, fontsize=11)
        ax.set_xlabel("learned weight")
    fig.suptitle("Most Predictive Name-Fragments Learned per Class "
                 "(character n-grams)", fontsize=14)
    fig.tight_layout(rect=[0, 0, 1, 0.97])
    fig.savefig(os.path.join(FIG, "06_learned_ngrams.png"), dpi=150)
    plt.close(fig)


def main():
    print("Loading dataset ...")
    df = pd.read_csv(DATA)
    df["medicine_name"] = df["medicine_name"].str.strip()
    print(f"  {len(df)} medicines, {df['therapeutic_class'].nunique()} classes")

    X = df["medicine_name"].values
    y = df["therapeutic_class"].values
    class_to_indication = (
        df.drop_duplicates("therapeutic_class")
          .set_index("therapeutic_class")["indication"].to_dict()
    )

    plot_class_distribution(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, stratify=y, random_state=RANDOM_STATE
    )
    print(f"  train={len(X_train)}  test={len(X_test)}")

    print("\nModel selection (5-fold CV) ...")
    cv_results = plot_model_comparison(X_train, y_train)

    print("\nTraining final model (Logistic Regression) ...")
    pipeline = make_pipeline(LogisticRegression(max_iter=2000, C=10))
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    test_acc = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average="macro")
    print(f"  Test accuracy = {test_acc:.3f}")
    print(f"  Macro F1      = {macro_f1:.3f}")

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    full_cv = cross_val_score(pipeline, X, y, cv=cv, scoring="accuracy")
    print(f"  Full-data 5-fold CV accuracy = {full_cv.mean():.3f} "
          f"+/- {full_cv.std():.3f}")

    labels = sorted(np.unique(y))
    report_dict = classification_report(
        y_test, y_pred, labels=labels, output_dict=True, zero_division=0
    )
    report_txt = classification_report(
        y_test, y_pred, labels=labels, zero_division=0
    )

    print("\nGenerating figures ...")
    plot_learning_curve(pipeline, X, y)
    plot_confusion(y_test, y_pred, labels)
    plot_per_class_f1(report_dict)
    plot_top_ngrams(pipeline)

    # Retrain on ALL data for the deployable model
    final = make_pipeline(LogisticRegression(max_iter=2000, C=10))
    final.fit(X, y)
    joblib.dump(
        {"pipeline": final, "class_to_indication": class_to_indication},
        os.path.join(MODELS, "medicine_classifier.joblib"),
    )

    metrics = {
        "dataset": {
            "n_medicines": int(len(df)),
            "n_classes": int(df["therapeutic_class"].nunique()),
            "train_size": int(len(X_train)),
            "test_size": int(len(X_test)),
        },
        "test_accuracy": round(float(test_acc), 4),
        "macro_f1": round(float(macro_f1), 4),
        "cross_val_accuracy_mean": round(float(full_cv.mean()), 4),
        "cross_val_accuracy_std": round(float(full_cv.std()), 4),
        "model_comparison_cv": {k: round(float(v), 4) for k, v in cv_results.items()},
        "final_model": "TF-IDF(char 2-4) + Logistic Regression",
    }
    with open(os.path.join(RESULTS, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
    with open(os.path.join(RESULTS, "classification_report.txt"), "w") as f:
        f.write(report_txt)

    print("\nSaved:")
    print(f"  model   -> models/medicine_classifier.joblib")
    print(f"  metrics -> results/metrics.json")
    print(f"  report  -> results/classification_report.txt")
    print(f"  figures -> figures/*.png  (6 graphs)")
    print(f"\nHeadline: {test_acc:.1%} test accuracy, "
          f"{full_cv.mean():.1%} cross-validated accuracy.")


if __name__ == "__main__":
    main()
