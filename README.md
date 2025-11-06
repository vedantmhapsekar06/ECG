# 🫀 ECG Arrhythmia Stress Classifier

### 🔍 Project Overview
This project aims to classify ECG signals into three categories — **Normal**, **Stress**, and **Arrhythmia** — using a **Random Forest Machine Learning model**.  
It helps analyze cardiac activity under different physiological conditions and detect early signs of arrhythmia or stress-induced abnormalities.

---

### 🧠 Model Used
- **Algorithm:** Random Forest Classifier  
- **Frameworks/Libraries:** Scikit-learn, Pandas, NumPy, Matplotlib  
- **Purpose:** Classify ECG feature data into three distinct classes.

---

### 📊 Dataset Description
The dataset used contains ECG-related features extracted from signal recordings.

| Feature | Description |
|----------|--------------|
| Heart_Rate | Average heart rate in beats per minute |
| RR_Mean | Mean RR interval (time between two heartbeats) |
| QRS_Duration | Duration of QRS complex (ventricular depolarization) |
| P_Amplitude | Amplitude of P-wave (atrial depolarization) |
| T_Amplitude | Amplitude of T-wave (ventricular repolarization) |
| Label | Target class — Normal / Stress / Arrhythmia |

**Total Records:** 900  
**Classes:**  
- Normal → 378  
- Stress → 245  
- Arrhythmia → 277  

---


