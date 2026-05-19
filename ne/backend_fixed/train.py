import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib

# Load CSV
df = pd.read_csv("crop_training_data.csv")

# Select features (NO NPK)
X = df[[
    "rainfall_mm",
    "avg_temp_c",
    "humidity_pct",
    "fertilizer_kg_per_ha",
    "irrigation_mm",
    "crop"
]].copy()

# Encode crop labels
le = LabelEncoder()
X["crop_encoded"] = le.fit_transform(X["crop"])
X.drop(columns=["crop"], inplace=True)

y = df["yield_t_per_ha"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# FAST MODEL (no GPU, fast CPU training)
model = RandomForestRegressor(
    n_estimators=220,
    max_depth=12,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# Save model + label encoder
joblib.dump(model, "xgb_no_npk.pkl")
joblib.dump(le, "label_encoder.pkl")

print("Training completed!")
print("Saved: xgb_no_npk.pkl and label_encoder.pkl")
