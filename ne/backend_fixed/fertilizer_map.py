
fertilizer_recommendations = {
    "wheat": ["Urea", "DAP", "MOP"],
    "rice": ["Urea", "SSP", "Potash"],
    "maize": ["Urea", "NPK", "Zinc Sulphate"],
    "default": ["NPK"]
}

def get_fertilizers(crop):
    return fertilizer_recommendations.get(crop.lower(), fertilizer_recommendations["default"])
