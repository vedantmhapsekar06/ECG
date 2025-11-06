# predict_new.py
# ------------------------------------------------------------
# Predict ECG class on a NEW dataset using the trained model
# ------------------------------------------------------------

import os
import joblib
import pandas as pd

# ---------- 1. AUTO-FIND PROJECT ROOT ----------
def get_root():
    cur = os.path.abspath(os.path.dirname(__file__))
    while cur != os.path.dirname(cur):
        if all(os.path.isdir(os.path.join(cur, d)) for d in ["data", "models", "src"]):
            return cur
        cur = os.path.dirname(cur)
    return os.path.abspath(os.path.dirname(__file__))

ROOT = get_root()
MODEL_DIR = os.path.join(ROOT, "models")
DATA_DIR  = os.path.join(ROOT, "data")

# ---------- 2. LOAD MODEL, SCALER, ENCODER ----------
try:
    model   = joblib.load(os.path.join(MODEL_DIR, "ecg_model.pkl"))
    scaler  = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
    encoder = joblib.load(os.path.join(MODEL_DIR, "encoder.pkl"))
    print(f"Loaded artefacts from: {MODEL_DIR}")
except FileNotFoundError as e:
    print(f"ERROR: {e}")
    print("Run `python src/train_ecg.py` from the ECG root folder first!")
    exit(1)

# ---------- 3. INPUT FILE ----------
# Change this to any CSV you want to predict on
INPUT_CSV = os.path.join(DATA_DIR, "new_ecg_data_matched.csv")   # <-- your file

if not os.path.exists(INPUT_CSV):
    print(f"Input file not found: {INPUT_CSV}")
    exit(1)

df_new = pd.read_csv(INPUT_CSV)
print(f"Loaded {len(df_new)} rows from {INPUT_CSV}")

# ---------- 4. PRE-PROCESS ----------
FEATURES = ["Heart_Rate", "RR_Mean", "QRS_Duration", "P_Amplitude", "T_Amplitude"]

if not all(col in df_new.columns for col in FEATURES):
    print("ERROR: Input CSV must contain columns:", FEATURES)
    exit(1)

X = df_new[FEATURES]
X_scaled = scaler.transform(X)

# ---------- 5. PREDICT ----------
pred_encoded = model.predict(X_scaled)
pred_prob    = model.predict_proba(X_scaled)

# Decode labels
pred_labels = encoder.inverse_transform(pred_encoded)

# Add to dataframe
df_new["Prediction"] = pred_labels
df_new["Confidence"] = pred_prob.max(axis=1)   # highest class probability

# ---------- 6. SAVE RESULT ----------
OUTPUT_CSV = os.path.join(DATA_DIR, "prediction_results.csv")
df_new.to_csv(OUTPUT_CSV, index=False)
print(f"Predictions saved to: {OUTPUT_CSV}")

# ---------- 7. SHOW SAMPLE ----------
print("\nFirst 5 predictions:")
print(df_new[["Heart_Rate", "RR_Mean", "QRS_Duration", "P_Amplitude", "T_Amplitude",
              "Prediction", "Confidence"]].head())

print("\nDone!")