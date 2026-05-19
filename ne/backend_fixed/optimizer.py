
import pandas as pd
import xgboost as xgb

def optimize_yield(model, features, payload):
    fert = payload["fertilizer_kg_per_ha"]
    irr = payload["irrigation_mm"]

    best_yield = -1
    best_f, best_i = 0, 0

    for f in range(0, 500, 10):
        for i in range(0, 1000, 50):
            X = pd.DataFrame([[120, 28, 6.5, 90, 45, 40, f, i, 0]], columns=features)
            pred = float(model.predict(xgb.DMatrix(X))[0])
            if pred > best_yield:
                best_yield = pred
                best_f, best_i = f, i

    return {
        "optimized_yield_t_per_ha": round(best_yield,2),
        "best_fertilizer_kg_per_ha": best_f,
        "best_irrigation_mm": best_i,
        "fertilizer_npk_kg_per_ha": {"N": best_f*0.4, "P": best_f*0.3, "K": best_f*0.3}
    }
