
from fastapi import FastAPI
import pandas as pd
import joblib
import xgboost as xgb
from optimizer import optimize_yield
from crop_recommender import recommend_crop
from market import get_best_market
from fertilizer_map import get_fertilizers

app = FastAPI()

model_data = joblib.load("xgb_multi_crop.pkl")
model = model_data["model"]
features = model_data["features"]
crop_encoder = model_data["label_encoder"]

@app.post("/predict")
def predict(payload: dict):
    crop = payload["crop"]
    fert = payload["fertilizer_kg_per_ha"]
    irr = payload["irrigation_mm"]

    X = pd.DataFrame([[
        120, 28, 6.5, 90, 45, 40, fert, irr,
        crop_encoder.transform([crop])[0]
    ]], columns=features)

    pred = float(model.predict(xgb.DMatrix(X))[0])
    return {"predicted_yield_t_per_ha": round(pred, 2)}

@app.post("/recommend_crop")
def rec(payload: dict):
    return recommend_crop(payload)

@app.post("/optimize_yield")
def opt(payload: dict):
    return optimize_yield(model, features, payload)

@app.post("/best_market")
def best_market(payload: dict):
    crop = payload["crop"]
    lat, lon = 12.9716, 77.5946
    yield_t = 5
    best, allm = get_best_market(crop, lat, lon, yield_t)
    return {"best_market": best, "all_market_comparisons": allm}

@app.post("/disease_detect")
def disease():
    return {"infected": False, "disease_name": "None", "advice": "Healthy", "prevention": "N/A"}
