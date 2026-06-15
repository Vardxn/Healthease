"""
predict.py
----------
Loads the trained Medicine-Indication Classifier and predicts the therapeutic
class + likely indication for any medicine name -- including names the model was
never trained on (demonstrates generalisation from learned name morphology).

Usage:
  python predict.py Amoxicillin Telmisartan Rosuvastatin
  python predict.py            # runs a built-in demo incl. UNSEEN drug names
"""

import os
import sys

import joblib

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(HERE, "models", "medicine_classifier.joblib")


def load():
    bundle = joblib.load(MODEL_PATH)
    return bundle["pipeline"], bundle["class_to_indication"]


def predict(names):
    pipeline, class_to_indication = load()
    probs = None
    if hasattr(pipeline.named_steps["clf"], "predict_proba"):
        probs = pipeline.predict_proba(names)
    preds = pipeline.predict(names)
    classes = list(pipeline.named_steps["clf"].classes_)

    results = []
    for i, (name, cls) in enumerate(zip(names, preds)):
        conf = None
        if probs is not None:
            conf = float(probs[i][classes.index(cls)])
        results.append({
            "medicine": name,
            "predicted_class": cls,
            "indication": class_to_indication.get(cls, "Unknown"),
            "confidence": conf,
        })
    return results


def main():
    if len(sys.argv) > 1:
        names = sys.argv[1:]
    else:
        # mix of in-dataset and deliberately UNSEEN names (not in training data)
        names = ["Amoxicillin", "Telmisartan", "Rosuvastatin", "Clonazepam",
                 "Enalkiren", "Rosoxacin", "Edoxaban", "Dorzolamide"]
        print("(demo) including unseen names to show generalisation:\n")

    for r in predict(names):
        conf = f"{r['confidence']:.0%}" if r["confidence"] is not None else "n/a"
        print(f"  {r['medicine']:<16} -> {r['predicted_class']:<26} "
              f"| {r['indication']:<32} (conf {conf})")


if __name__ == "__main__":
    main()
