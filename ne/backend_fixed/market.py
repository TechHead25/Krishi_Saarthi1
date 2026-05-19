
import math
MANDI_DB = [
    {"name":"Pune","lat":18.5,"lon":73.8,"prices":{"wheat":2100}},
    {"name":"Bangalore","lat":12.9,"lon":77.5,"prices":{"wheat":2300}}
]
TRANSPORT_COST_PER_KM_PER_TON = 25

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2-lat1)
    dlon = math.radians(lat2-lat1)
    return R*2*math.asin(math.sqrt(math.sin(dlat/2)**2))

def get_best_market(crop, lat, lon, yield_t):
    results = []
    for m in MANDI_DB:
        if crop not in m["prices"]: continue
        dist = haversine(lat,lon,m["lat"],m["lon"])
        rev = m["prices"][crop]*yield_t*100
        cost = dist*yield_t*TRANSPORT_COST_PER_KM_PER_TON
        profit = rev-cost
        results.append({"market":m["name"],"net_profit":round(profit,2)})
    return max(results,key=lambda x:x["net_profit"]), results
