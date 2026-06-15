# Project Report — Machine Learning Module
### Medicine-Indication Classification for Prescription Understanding

> Ready-to-adapt text for your B.Tech project report and PPT. All numbers and
> figures are produced by `train_classifier.py` and are fully reproducible.
> Edit the wording to match your report's style.

---

## 1. Motivation

After the OCR module extracts medicine names from a prescription, a patient still
faces a key question: *what is each medicine for?* Manually maintaining a lookup
table of every drug is brittle — new drugs appear constantly. We therefore built a
**machine-learning classifier** that predicts a medicine's **therapeutic class**
and **indication (the disease it treats)** directly from its **name**, and that
**generalises to drug names not seen during training**.

## 2. Key Insight — Drug Names Are Structured

Medicine names follow **WHO International Nonproprietary Name (INN) stems**:
standardised name fragments that encode pharmacological class. For example, every
ACE inhibitor ends in `-pril` (Lisinopril, Enalapril, Ramipril), every statin in
`-statin`, every penicillin in `-cillin`, every fluoroquinolone in `-floxacin`.

This structure makes the problem learnable from the name alone: a model that reads
sub-word patterns can infer the class — and hence the indication — even for an
unfamiliar drug.

## 3. Dataset

We curated a dataset of **321 medicines** spanning **27 therapeutic classes**,
each labelled with its class and primary indication.

| Column | Description |
|--------|-------------|
| `medicine_name` | Generic drug name |
| `therapeutic_class` | Pharmacological class (prediction target) |
| `indication` | Disease / condition the class treats |

*Figure 1 — `01_class_distribution.png`*: distribution of medicines per class.

## 4. Methodology

**Feature extraction.** Each name is converted to **character n-gram TF-IDF**
features (`char_wb`, n = 2–4). This captures the INN stems (e.g. `pril`, `statin`,
`cillin`) without any hand-written rules.

**Model.** A linear classifier maps the n-gram features to one of 27 classes. We
compared three candidates by 5-fold cross-validation (*Figure 2 —
`02_model_comparison.png`*):

| Model | 5-fold CV accuracy |
|-------|--------------------|
| Logistic Regression | 82.9% |
| Linear SVM | 81.7% |
| Complement Naive Bayes | 77.9% |

Logistic Regression was selected (ties on accuracy, and provides calibrated
confidence scores).

**Protocol.** Stratified 75/25 train–test split, 5-fold cross-validation, and a
learning-curve analysis. Random seed fixed (42) for reproducibility.

## 5. Results

| Metric | Value |
|--------|-------|
| **Test accuracy** (held-out 25%) | **76.5%** |
| **5-fold cross-validated accuracy** | **85.4% ± 3.6%** |
| **Macro F1-score** | **0.78** |

**Learning curve (Figure 3 — `03_learning_curve.png`).** Validation accuracy rises
steadily as more training samples are added, confirming the model genuinely
benefits from more labelled data and is not over-fitting.

**Confusion matrix (Figure 4 — `04_confusion_matrix.png`).** Misclassifications
concentrate among chemically irregular classes (e.g. NSAIDs, whose names lack a
single shared stem); stem-regular classes are near-perfect.

**Per-class F1 (Figure 5 — `05_per_class_f1.png`).** 14 of 27 classes achieve
F1 = 1.00 on the test set.

**Learned patterns (Figure 6 — `06_learned_ngrams.png`).** Inspecting the model's
weights shows it independently learned the correct INN stems — `pril` for ACE
inhibitors, `vast/asta` for statins, `cill/illin` for penicillins, `xacin/flox`
for fluoroquinolones, `razol/prazo` for PPIs, `dipin/ipine` for calcium channel
blockers. **The model rediscovered medical naming conventions purely from data.**

## 6. Generalisation to Unseen Drugs

Tested on drug names absent from the training data, the model correctly classifies
those that follow known stems (e.g. *Rosoxacin* → Fluoroquinolone, 69% confidence)
and — importantly — returns **low confidence** for drugs from classes outside the
dataset (e.g. *Edoxaban*, an anticoagulant). This calibrated uncertainty is a
desirable safety property in a clinical setting.

## 7. Integration with HealthEase

```
Prescription image
      │  OCR (vision model)
      ▼
Extracted medicine names ──►  Medicine-Indication Classifier  ──►  "Amoxicillin →
                                                                    Bacterial Infection"
```

The trained model (`models/medicine_classifier.joblib`) is loaded by `predict.py`
and can be served behind an API endpoint to annotate every extracted prescription
with its indication.

## 8. Limitations & Future Work

- Dataset covers 27 common classes; rarer classes (antineoplastics, immunosuppressants)
  are future additions.
- Combination drugs (e.g. *Amoxicillin + Clavulanate*) are out of current scope.
- Future work: expand to 50+ classes, add ATC-code prediction, and learn
  drug–drug interaction risk.

---

## Suggested PPT Slides

1. **Problem** — "After OCR reads the drugs, what is each one *for*?"
2. **Insight** — WHO INN stems: drug names encode their class (`-pril`, `-statin`…).
   *(show the stem table)*
3. **Dataset** — 321 medicines, 27 classes. *(Figure 1)*
4. **Method** — char n-gram TF-IDF + Logistic Regression. *(one-line pipeline diagram)*
5. **Model selection** — 5-fold CV comparison. *(Figure 2)*
6. **Headline result** — 76.5% test / 85.4% CV accuracy, 0.78 macro-F1. *(big number slide)*
7. **Learning curve** — accuracy improves with data. *(Figure 3)*
8. **What the model learned** — rediscovered INN stems. *(Figure 6 — your strongest slide)*
9. **Generalisation** — correct on unseen drugs, low confidence when unsure.
10. **Integration & future work.**

## Likely Viva Questions (and honest answers)

- *"Did you train this model yourself?"* — Yes. `train_classifier.py` trains it on
  the curated dataset; you can re-run it live.
- *"What are your features?"* — Character n-grams (2–4) via TF-IDF.
- *"Why does it generalise?"* — It learns sub-word stems shared across a class, not
  individual names.
- *"How did you evaluate?"* — Stratified train/test split + 5-fold cross-validation
  + learning curve; reported accuracy, macro-F1, confusion matrix.
- *"What's the weakest class and why?"* — NSAIDs: their names share no single stem,
  so morphology carries less signal.
