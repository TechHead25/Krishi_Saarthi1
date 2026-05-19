#optimizer.py
import pandas as pd
import xgboost as xgb

def optimize_yield(model, features, payload, budget_fert=200, budget_irr=500):
   
    best_yield = -1
    best_fert, best_irr = 0, 0
    crop = payload.get("crop", "wheat").lower()

    for fert in range(0, budget_fert + 1, 10):
        for irr in range(0, budget_irr + 1, 50):
            trial = payload.copy()
            trial["fertilizer_kg_per_ha"] = fert
            trial["irrigation_mm"] = irr

            X = pd.DataFrame([[trial.get(f, 0) for f in features]], columns=features)
            pred = float(model.predict(xgb.DMatrix(X))[0])


            if crop == "wheat":
                pred += min(fert, 180) * 0.002
                pred += min(irr, 300) * 0.0003
            elif crop == "rice":
                pred += min(fert, 150) * 0.0015
                pred += min(irr, 500) * 0.0008
            elif crop == "maize":
                pred += min(fert, 200) * 0.0022
                pred += min(irr, 400) * 0.0004
            else:
                pred += min(fert, 150) * 0.002
                pred += min(irr, 400) * 0.0005

            if pred > best_yield:
                best_yield = pred
                best_fert, best_irr = fert, irr


    fert_npk = get_fertilizer_npk(crop, best_fert)

    return {
        "best_fertilizer_kg_per_ha": best_fert,
        "best_irrigation_mm": best_irr,
        "expected_yield_t_per_ha": best_yield,
        "fertilizer_npk": fert_npk
    }


def get_fertilizer_npk(crop: str, total_fert: float):
   
    crop = crop.lower()
    if crop == "wheat":
        ratios = {"N": 0.5, "P": 0.3, "K": 0.2}
    elif crop == "rice":
        ratios = {"N": 0.4, "P": 0.35, "K": 0.25}
    elif crop == "maize":
        ratios = {"N": 0.45, "P": 0.35, "K": 0.2}
    else:
        ratios = {"N": 0.4, "P": 0.3, "K": 0.3}

    return {k: round(total_fert * v, 1) for k, v in ratios.items()}


def get_fertilizer_names(crop: str):
 
    crop = crop.lower()
    fertilizers = {
        "wheat": ["Urea", "DAP", "MOP"],
        "rice": ["Urea", "SSP", "Potash"],
        "maize": ["Urea", "DAP", "Zinc Sulphate"],
        "default": ["Urea", "DAP", "MOP"]
    }
    return fertilizers.get(crop, fertilizers["default"])
