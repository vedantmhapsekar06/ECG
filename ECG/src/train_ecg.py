# ==============================================
# train_ecg.py — ECG Signal Classification Model (Unequal Dataset)
# ==============================================

# ---- 1. Import Libraries ----
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib
import os

# ---- 2. Load Dataset ----
data_path = "data/unequal_ecg_dataset.csv"  # updated dataset path
df = pd.read_csv(data_path)

print("✅ Dataset Loaded Successfully!")
print("Shape:", df.shape)
print("Columns:", df.columns.tolist())
print("\nSample Data:\n", df.head())

# ---- 3. Basic Info & Check for Missing Values ----
print("\nChecking for missing values:\n", df.isnull().sum())

# ---- 4. Split Features and Labels ----
X = df.drop("Label", axis=1)
y = df["Label"]

# ---- 5. Encode Labels ----
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# ---- 6. Split Train-Test Data ----
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# ---- 7. Feature Scaling ----
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ---- 8. Train Model ----
model = RandomForestClassifier(
    n_estimators=200, random_state=42, max_depth=8, min_samples_split=3
)
model.fit(X_train_scaled, y_train)

# ---- 9. Evaluate Model ----
y_pred = model.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred)

print("\n✅ Model Training Completed!")
print("Accuracy:", round(acc * 100, 2), "%")

print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=encoder.classes_))

# ---- 10. Confusion Matrix ----
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(6, 4))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=encoder.classes_, yticklabels=encoder.classes_)
plt.title("Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.tight_layout()
plt.show()

# ---- 11. Save Model, Scaler & Encoder ----
base_dir = os.path.dirname(os.path.abspath(__file__))  # Get current script dir
model_dir = os.path.join(base_dir, "..", "models")
os.makedirs(model_dir, exist_ok=True)

joblib.dump(model, os.path.join(model_dir, "ecg_model.pkl"))
joblib.dump(scaler, os.path.join(model_dir, "scaler.pkl"))
joblib.dump(encoder, os.path.join(model_dir, "encoder.pkl"))

print(f"\n✅ Model, Scaler, and Encoder saved successfully in: {model_dir}")
