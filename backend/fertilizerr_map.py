#fertilizer_map.py
fertilizer_recommendations = {
    "wheat": ["Urea", "DAP", "MOP"],
    "rice": ["Urea", "SSP", "Potash"],
    "maize": ["Urea", "NPK (10:26:26)", "Zinc Sulphate"],
    "sugarcane": ["Urea", "Ammonium Sulphate", "Potash"],
    "cotton": ["Urea", "NPK (12:32:16)", "MOP"],
    "default": ["NPK", "Compost", "Biofertilizer"]
}

def get_fertilizers(crop: str):
    return fertilizer_recommendations.get(crop.lower(), fertilizer_recommendations["default"])
