import requests

API_KEY = "8f443d8a53c296060876638ef2d9203c" 
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

def get_weather(location: str):
   
    params = {
        "q": location,
        "appid": API_KEY,
        "units": "metric"
    }
    response = requests.get(BASE_URL, params=params)
    data = response.json()

    if response.status_code != 200:
        msg = data.get("message", "Unknown error")
        raise ValueError(f"Weather API error ({response.status_code}): {msg}")

    main = data.get("main", {})
    temp = main.get("temp", None)
    humidity = main.get("humidity", None)
    rainfall = data.get("rain", {}).get("1h", 0.0)

    return {
        "avg_temp_c": temp,
        "humidity_pct": humidity,
        "rainfall_mm": rainfall,
        "city": data.get("name"),
        "country": data.get("sys", {}).get("country")
    }
