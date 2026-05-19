#market.py

import math


MANDI_DB = [
    {"name": "Pune APMC", "lat": 18.5204, "lon": 73.8567,
     "prices": {"wheat": 2150, "rice": 1980, "maize": 1850, "soybean": 4120}},

    {"name": "Mumbai Vashi APMC", "lat": 19.033, "lon": 73.0169,
     "prices": {"wheat": 2200, "rice": 2020, "maize": 1880, "soybean": 4180}},

    {"name": "Nashik APMC", "lat": 19.9975, "lon": 73.7898,
     "prices": {"wheat": 2120, "rice": 1960, "maize": 1820, "soybean": 3900}},

    {"name": "Nagpur APMC", "lat": 21.1458, "lon": 79.0882,
     "prices": {"wheat": 2230, "rice": 2100, "maize": 1920, "soybean": 4050}},

    {"name": "Solapur APMC", "lat": 17.6599, "lon": 75.9064,
     "prices": {"wheat": 2100, "rice": 2020, "maize": 1880, "soybean": 3850}},

    {"name": "Kolhapur APMC", "lat": 16.705, "lon": 74.2433,
     "prices": {"wheat": 2080, "rice": 1990, "maize": 1800, "soybean": 3750}},

    {"name": "Ahmednagar APMC", "lat": 19.0952, "lon": 74.7496,
     "prices": {"wheat": 2140, "rice": 1880, "maize": 1780, "soybean": 3980}},

    {"name": "Indore APMC", "lat": 22.7196, "lon": 75.8577,
     "prices": {"wheat": 2300, "rice": 2150, "maize": 1980, "soybean": 4200}},

    {"name": "Bhopal APMC", "lat": 23.2599, "lon": 77.4126,
     "prices": {"wheat": 2280, "rice": 2100, "maize": 1960, "soybean": 4100}},

    {"name": "Jaipur APMC", "lat": 26.9124, "lon": 75.7873,
     "prices": {"wheat": 2400, "rice": 2250, "maize": 2050, "soybean": 4300}},

    {"name": "Delhi Azadpur Mandi", "lat": 28.7041, "lon": 77.1025,
     "prices": {"wheat": 2450, "rice": 2300, "maize": 2100, "soybean": 4450}},

    {"name": "Kolkata APMC", "lat": 22.5726, "lon": 88.3639,
     "prices": {"wheat": 2200, "rice": 2500, "maize": 1900, "soybean": 4000}},

    {"name": "Guwahati APMC", "lat": 26.1445, "lon": 91.7362,
     "prices": {"wheat": 2250, "rice": 2600, "maize": 2000, "soybean": 3900}},

    {"name": "Hyderabad APMC", "lat": 17.385, "lon": 78.4867,
     "prices": {"wheat": 2180, "rice": 2400, "maize": 2050, "soybean": 4150}},

    {"name": "Chennai Koyambedu", "lat": 13.0827, "lon": 80.2707,
     "prices": {"wheat": 2100, "rice": 2500, "maize": 1950, "soybean": 4050}},

    {"name": "Bengaluru Yeshwanthpur", "lat": 12.9716, "lon": 77.5946,
     "prices": {"wheat": 2150, "rice": 2450, "maize": 2000, "soybean": 4200}},

    {"name": "Mysuru APMC", "lat": 12.2958, "lon": 76.6394,
     "prices": {"wheat": 2000, "rice": 2350, "maize": 1850, "soybean": 3800}},

    {"name": "Coimbatore APMC", "lat": 11.0168, "lon": 76.9558,
     "prices": {"wheat": 2050, "rice": 2400, "maize": 1900, "soybean": 3950}},

    {"name": "Ahmedabad APMC", "lat": 23.0225, "lon": 72.5714,
     "prices": {"wheat": 2350, "rice": 2200, "maize": 1980, "soybean": 4100}},

    {"name": "Surat APMC", "lat": 21.1702, "lon": 72.8311,
     "prices": {"wheat": 2320, "rice": 2180, "maize": 1940, "soybean": 4050}},

    {"name": "Rajkot APMC", "lat": 22.3039, "lon": 70.8022,
     "prices": {"wheat": 2400, "rice": 2150, "maize": 2020, "soybean": 4250}},

    {"name": "Lucknow APMC", "lat": 26.8467, "lon": 80.9462,
     "prices": {"wheat": 2500, "rice": 2400, "maize": 2120, "soybean": 4400}},

    {"name": "Kanpur APMC", "lat": 26.4499, "lon": 80.3319,
     "prices": {"wheat": 2480, "rice": 2360, "maize": 2100, "soybean": 4380}},

    {"name": "Patna APMC", "lat": 25.5941, "lon": 85.1376,
     "prices": {"wheat": 2350, "rice": 2550, "maize": 2050, "soybean": 4100}},

    {"name": "Varanasi APMC", "lat": 25.3176, "lon": 82.9739,
     "prices": {"wheat": 2380, "rice": 2500, "maize": 2080, "soybean": 4150}},

    {"name": "Ranchi APMC", "lat": 23.3441, "lon": 85.3096,
     "prices": {"wheat": 2200, "rice": 2450, "maize": 1900, "soybean": 3950}},

    {"name": "Chandigarh APMC", "lat": 30.7333, "lon": 76.7794,
     "prices": {"wheat": 2600, "rice": 2400, "maize": 2150, "soybean": 4500}},

    {"name": "Ludhiana APMC", "lat": 30.9, "lon": 75.85,
     "prices": {"wheat": 2700, "rice": 2500, "maize": 2200, "soybean": 4600}},

    {"name": "Amritsar APMC", "lat": 31.634, "lon": 74.8723,
     "prices": {"wheat": 2680, "rice": 2480, "maize": 2180, "soybean": 4550}}
]

TRANSPORT_COST_PER_KM_PER_TON = 25


# -----------------------------------
# Utility: Haversine Distance (km)
# -----------------------------------
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


# -----------------------------------
# Main Function: Find Best Mandi
# -----------------------------------
def get_best_market(crop, farmer_lat, farmer_lon, yield_tons):
    results = []

    for mandi in MANDI_DB:
        if crop not in mandi["prices"]:
            continue

        distance_km = haversine(farmer_lat, farmer_lon, mandi["lat"], mandi["lon"])
        transport_cost = distance_km * yield_tons * TRANSPORT_COST_PER_KM_PER_TON

        price_per_quintal = mandi["prices"][crop]
        revenue = price_per_quintal * yield_tons * 100 
        net_profit = revenue - transport_cost

        results.append({
            "market": mandi["name"],
            "price_per_quintal": price_per_quintal,
            "distance_km": round(distance_km, 1),
            "transport_cost": round(transport_cost, 2),
            "expected_revenue": round(revenue, 2),
            "net_profit": round(net_profit, 2)
        })

    if not results:
        return (
            {
                "market": "No market data available",
                "price_per_quintal": 0,
                "distance_km": 0,
                "transport_cost": 0,
                "expected_revenue": 0,
                "net_profit": 0,
                "note": f"No mandi prices available for crop: {crop}"
            },
            []
        )

    best = max(results, key=lambda x: x["net_profit"])
    return best, results
