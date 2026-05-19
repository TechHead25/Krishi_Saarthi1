from optimizer import optimize_yield, get_fertilizer_npk
import xgboost as xgb
import numpy as np


def recommend_crop(model, FEATURES, le, soil, weather, budget_fert=200, budget_irr=500):

    best_score = -1e9
    best_crop = None
    best_fert = 0
    best_irr = 0
    best_yield = 0

    for crop in le.classes_:

        crop_encoded = int(le.transform([crop])[0])

        row = {
            "nitrogen_ppm": soil["nitrogen_ppm"],
            "phosphorus_ppm": soil["phosphorus_ppm"],
            "potassium_ppm": soil["potassium_ppm"],
            "soil_ph": soil["soil_ph"],
            "fertilizer_kg_per_ha": soil["fertilizer_kg_per_ha"],
            "irrigation_mm": soil["irrigation_mm"],
            "crop_encoded": crop_encoded,
            "avg_temp_c": weather["avg_temp_c"],
            "humidity_pct": weather["humidity_pct"],
            "rainfall_mm": weather["rainfall_mm"],
        }

        x_input = np.array([[row[f] for f in FEATURES]])
        dmat = xgb.DMatrix(x_input, feature_names=FEATURES)

        pred_yield = float(model.predict(dmat)[0])

        crop_scale = {
            "wheat": 4,
            "rice": 5,
            "maize": 6,
            "cotton": 3,
            "soybean": 3,
            "groundnut": 3,
            "sugarcane": 75
        }.get(crop, 5)

        normalized_yield = pred_yield / crop_scale

        soil_penalty = abs(6.5 - soil["soil_ph"]) * 0.2

        score = normalized_yield - soil_penalty

        if score > best_score:
            best_score = score
            best_crop = crop
            best_yield = pred_yield
            best_fert = soil["fertilizer_kg_per_ha"]
            best_irr = soil["irrigation_mm"]

    return {
        "best_crop": best_crop,
        "expected_yield_t_per_ha": best_yield,
        "best_fertilizer_kg_per_ha": best_fert,
        "best_irrigation_mm": best_irr,
        "fertilizer_npk": {
            "N": soil["nitrogen_ppm"],
            "P": soil["phosphorus_ppm"],
            "K": soil["potassium_ppm"]
        }
    }