#main.py

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.params import File
from pydantic import BaseModel
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))
import joblib
import numpy as np
import xgboost as xgb
from ai_chatbot import ai_chatbot_response
from PIL import Image
from weather import get_weather
from optimizer import optimize_yield, get_fertilizer_names
from crop_recommender import recommend_crop
from market import get_best_market
from plant import analyze_with_plant_id, analyze_leaf_health, _read_plantnet_key
from fastapi.responses import RedirectResponse
import pathlib
import base64
import requests
import mimetypes
import streamlit as st
import requests
from database import get_db, init_db
import pandas as pd
app = FastAPI(title="Krishi Saarthi Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5174",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "https://krishi-saarthi1.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

MODEL_PATH = os.path.join(os.path.dirname(__file__), "xgb_multi_crop.pkl")
model_data = joblib.load(MODEL_PATH)
model = model_data["model"]
crop_encoder = model_data["label_encoder"]
FEATURES = model_data["features"]

print("Loaded crops:", list(crop_encoder.classes_))

PLANT_BIOLOGY_INFO = {
    "plant_pathology": "Plant pathology is the study of plant diseases caused by pathogens such as fungi, bacteria, viruses, and nematodes. Early detection of leaf symptoms helps prevent yield loss.",
    "nutrient_roles": {
        "Nitrogen": "Supports leaf growth and chlorophyll production, making plants greener and healthier.",
        "Phosphorus": "Helps root development and energy transfer through ATP, supporting flowering and fruiting.",
        "Potassium": "Improves water regulation, disease resistance, and enzyme activity inside plant cells."
    },
    "disease_detection": "Biology-based disease detection uses image analysis and symptom patterns to identify pathogens before the infection spreads.",
}


class InputData(BaseModel):
    crop: str
    location: str
    fertilizer_kg_per_ha: float = 100
    irrigation_mm: float = 200

    nitrogen_ppm: float = 40
    phosphorus_ppm: float = 30
    potassium_ppm: float = 30
    soil_ph: float = 6.5

    latitude: float = 0.0
    longitude: float = 0.0
# ---------------------------
# Simple Auth Models
# ---------------------------
class LoginRequest(BaseModel):
    username: str
    password: str

class SignupRequest(BaseModel):
    name: str
    username: str
    phone: str
    password: str
    location: str

def dummy_transcribe_audio(audio_bytes: bytes) -> str:
    return "Voice transcription feature is not fully configured yet."


USERS_DB = {}
@app.post("/login")
def login(data: dict):
    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT * FROM farmers WHERE username=? AND password=?", 
                (data["username"], data["password"]))
    user = cur.fetchone()

    if not user:
        return {"detail": "Invalid username or password"}

    return {
        "username": user["username"],
        "name": user["name"],
        "phone": user["phone"],
        "location": user["location"]
    }

@app.post("/signup")
def signup(data: dict):
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute(
            "INSERT INTO farmers (name, phone, location, username, password) VALUES (?, ?, ?, ?, ?)",
            (data["name"], data["phone"], data["location"], data["username"], data["password"])
        )
        db.commit()
        return {"message": "Account created successfully"}
    except:
        return {"detail": "Username already exists"}

# ---------------------------
# Root Endpoint
# ---------------------------
@app.get("/")
def root():
    return {"message": "Krishi Saarthi Backend is running!"}

@app.post("/admin_login")
def admin_login(data: dict):
    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT * FROM admins WHERE username=? AND password=?", 
                (data["username"], data["password"]))
    admin = cur.fetchone()

    if not admin:
        return {"detail": "Invalid admin credentials"}

    return {"message": "Admin login successful"}
@app.get("/admin/farmers")
def get_farmers():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name, phone, location, username FROM farmers")
    farmers = cur.fetchall()
    return [dict(row) for row in farmers]

@app.delete("/admin/farmer/{farmer_id}")
def delete_farmer(farmer_id: int):
    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM farmers WHERE id=?", (farmer_id,))
    db.commit()
    return {"message": "Farmer deleted successfully"}

# ---------------------------
# Predict Yield Endpoint
# ---------------------------
@app.post("/predict")
def predict(req: InputData):
    try:
        weather_data = get_weather(req.location)

        if req.crop not in crop_encoder.classes_:
            raise ValueError(f"Unknown crop: {req.crop}")

        crop = req.crop
        fert = req.fertilizer_kg_per_ha
        irr = req.irrigation_mm
        X = pd.DataFrame([[
            weather_data["rainfall_mm"],
            weather_data["avg_temp_c"],
            req.soil_ph,
            req.nitrogen_ppm,
            req.phosphorus_ppm,
            req.potassium_ppm,
            fert,
            irr,
            int(crop_encoder.transform([crop])[0])
        ]], columns=FEATURES)
        pred = float(model.predict(xgb.DMatrix(X))[0])

        return {
            "crop": req.crop,
            "location": req.location,
            "predicted_yield_t_per_ha": round(pred, 3),
            "weather_used": weather_data
        }
    except Exception as e:
        return {"error": str(e)}


# ---------------------------
# Recommend Best Crop
# ---------------------------
@app.post("/recommend_crop")
def recommend_crop_api(req: InputData):
    try:
        # ✅ Get weather
        weather_data = get_weather(req.location)

        best_crop = None
        best_yield = -1
        best_fert = 0
        best_irr = 0

        # ✅ Try all crops & find the one with max predicted yield
        for crop_name in crop_encoder.classes_:
            crop_encoded = int(crop_encoder.transform([crop_name])[0])

            row = {
                "rainfall_mm": weather_data["rainfall_mm"],
                "avg_temp_c": weather_data["avg_temp_c"],
                "humidity_pct": weather_data["humidity_pct"],
                "fertilizer_kg_per_ha": req.fertilizer_kg_per_ha,
                "irrigation_mm": req.irrigation_mm,
                "crop_encoded": crop_encoded
            }

            x_input = np.array([[row[f] for f in FEATURES]])
            dmat = xgb.DMatrix(x_input, feature_names=FEATURES)
            pred_yield = float(model.predict(dmat)[0])

            if pred_yield > best_yield:
                best_yield = pred_yield
                best_crop = crop_name
                best_fert = req.fertilizer_kg_per_ha
                best_irr = req.irrigation_mm

        fert_names = get_fertilizer_names(best_crop)

        return {
            "recommended_crop": best_crop,
            "expected_yield_t_per_ha": round(best_yield, 3),
            "best_fertilizer_kg_per_ha": best_fert,
            "best_irrigation_mm": best_irr,
            "recommended_fertilizer_names": fert_names,
            "weather_used": weather_data
        }

    except Exception as e:
        return {"error": str(e)}

# ---------------------------
# Optimize Yield
# ---------------------------
@app.post("/optimize_yield")
def optimize_yield_api(req: InputData):
    try:
        # ✅ Get weather
        weather_data = get_weather(req.location)

        # ✅ Validate crop
        if req.crop not in crop_encoder.classes_:
            raise ValueError(f"Unknown crop: {req.crop}")

        crop_encoded = int(crop_encoder.transform([req.crop])[0])

        best_yield = -1
        best_fert = 0
        best_irr = 0

        # ✅ Search best fertilizer & irrigation
        for fert in range(0, 501, 25):     # 0 → 500 kg/ha
            for irr in range(0, 1001, 50): # 0 → 1000 mm

                row = {
                    "rainfall_mm": weather_data["rainfall_mm"],
                    "avg_temp_c": weather_data["avg_temp_c"],
                    "humidity_pct": weather_data["humidity_pct"],
                    "fertilizer_kg_per_ha": fert,
                    "irrigation_mm": irr,
                    "crop_encoded": crop_encoded,
                }

                x_input = np.array([[row[f] for f in FEATURES]])
                dmat = xgb.DMatrix(x_input, feature_names=FEATURES)
                pred_yield = float(model.predict(dmat)[0])

                if pred_yield > best_yield:
                    best_yield = pred_yield
                    best_fert = fert
                    best_irr = irr

        fert_names = get_fertilizer_names(req.crop)

        return {
            "crop": req.crop,
            "optimized_yield_t_per_ha": round(best_yield, 3),
            "best_fertilizer_kg_per_ha": best_fert,
            "best_irrigation_mm": best_irr,
            "recommended_fertilizer_names": fert_names,
            "weather_used": weather_data,
        }

    except Exception as e:
        return {"error": str(e)}

# ---------------------------
# BEST MARKET ENDPOINT
# ---------------------------
@app.post("/best_market")
def best_market_api(req: InputData):
    try:
        weather_data = get_weather(req.location)

        crop = req.crop.lower()
        if crop not in crop_encoder.classes_:
            raise ValueError(f"Unknown crop: {req.crop}")

        crop_encoded = int(crop_encoder.transform([crop])[0])

        row = {
            "nitrogen_ppm": req.nitrogen_ppm,
            "phosphorus_ppm": req.phosphorus_ppm,
            "potassium_ppm": req.potassium_ppm,
            "soil_ph": req.soil_ph,
            "fertilizer_kg_per_ha": req.fertilizer_kg_per_ha,
            "irrigation_mm": req.irrigation_mm,
            "crop_encoded": crop_encoded,
            "avg_temp_c": weather_data["avg_temp_c"],
            "humidity_pct": weather_data["humidity_pct"],
            "rainfall_mm": weather_data["rainfall_mm"],
        }

        x_input = np.array([[row[f] for f in FEATURES]])
        d = xgb.DMatrix(x_input, feature_names=FEATURES)
        predicted_yield = float(model.predict(d)[0])  # in tons

        best_market, all_markets = get_best_market(
            crop, req.latitude, req.longitude, predicted_yield
        )

        return {
            "crop": crop,
            "predicted_yield_tons": round(predicted_yield, 3),
            "best_market": best_market,
            "all_market_comparisons": all_markets,
            "weather_used": weather_data
        }

    except Exception as e:
        return {"error": str(e)}


# ---------------------------
# Simple Chat Endpoint
# ---------------------------


@app.post("/chat")
def chat(req: dict):
    try:
        user_msg = str(req.get("message", "")).replace("\n", " ").strip()

        if not user_msg:
            return {"reply": "Please enter a farming question."}

        try:
            reply = ai_chatbot_response(user_msg, req)
        except Exception as ai_err:
            print("AI ERROR:", ai_err)
            reply = "AI service is currently unavailable. Please try again."

        return {"reply": reply}

    except Exception as e:
        print("CHAT ENDPOINT ERROR:", e)
        return {"error": str(e)}
    

@app.post("/voice_chat")
async def voice_chat(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        text_question = dummy_transcribe_audio(audio_bytes)

        reply = f"I understood your voice question as: '{text_question}'. Please integrate real STT for production."

        return {
            "question": text_question,
            "reply": reply
        }

    except Exception as e:
        return {"error": str(e)}
    
@app.post("/disease_detect")
async def disease_detect(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Please upload a valid image.")

        img_bytes = await file.read()
        health_result = analyze_leaf_health(img_bytes)
        try:
            species_result = analyze_with_plant_id(img_bytes)
        except Exception:
            species_result = {
                "species_name": None,
                "species": None,
                "top_score": 0,
                "confidence": 0,
                "plantnet": None,
                "raw": None,
                "top_result": None,
                "mode": "plantnet_error",
                "diagnosis_type": "species",
                "advice": "Species identification unavailable. Leaf health analysis completed.",
                "prevention": "Try again later or configure PlantNet API key.",
                "infected": None,
                "health_status": "unknown",
                "severity": "unknown",
                "disease_name": None
            }

        # Merge species and leaf health analysis; health analysis takes precedence for diagnosis.
        merged = {**species_result, **health_result}
        merged["filename"] = file.filename

        return merged

    except Exception as e:
        print("DISEASE API ERROR:", e)
        return {
            "infected": None,
            "severity": "unknown",
            "disease_name": "API Error",
            "advice": "Disease detection service is temporarily unavailable.",
            "prevention": "Please try again later.",
            "confidence": 0,
            "mode": "error",
            "diagnosis_type": "error"
        }

@app.get("/biology_info")
def biology_info():
    return {
        "biology_info": PLANT_BIOLOGY_INFO
    }

@app.get("/plant_test")
def plant_test():
    return {
        "api_key_loaded": bool(_read_plantnet_key()),
        "api_key_length": len(_read_plantnet_key() or "")
    }



@app.get("/plantnet_signup")
def plantnet_signup():
    """Redirect user to PlantNet signup/docs page where they can obtain an API key."""
    return RedirectResponse("https://my.plantnet.org/")


KEY_FILE = pathlib.Path(os.path.dirname(__file__)) / ".plantnet_key"


@app.get("/plantnet/key")
def get_plantnet_key():
    """Return whether a PlantNet API key is stored on the server."""
    exists = KEY_FILE.exists()
    key = None
    if exists:
        try:
            key = KEY_FILE.read_text(encoding="utf-8").strip()
        except Exception:
            key = None

    return {"key_loaded": bool(key), "key_length": len(key) if key else 0}


@app.post("/plantnet/key")
def set_plantnet_key(data: dict):
    """Set and persist the PlantNet API key. POST JSON: {"api_key": "..."}
    Warning: this stores the key in plaintext in the backend folder for demo purposes only.
    """
    api_key = data.get("api_key") if isinstance(data, dict) else None
    if not api_key:
        return {"error": "api_key missing"}

    try:
        KEY_FILE.write_text(api_key.strip(), encoding="utf-8")
        return {"message": "PlantNet API key saved"}
    except Exception as e:
        return {"error": str(e)}



@app.post("/plantnet/debug")
async def plantnet_debug(file: UploadFile = File(...)):
    """Debug endpoint: forwards the uploaded image to PlantNet and returns the raw response."""
    try:
        api_key = _read_plantnet_key()
        if not api_key:
            return {"error": "PlantNet API key not configured"}

        contents = await file.read()
        url = f"https://my-api.plantnet.org/v2/identify/all?api-key={api_key}"

        # Send as multipart/form-data with the binary file (PlantNet expects file upload)
        mime_type, _ = mimetypes.guess_type(file.filename)
        if not mime_type:
            mime_type = "image/jpeg"

        files = {
            "images": (file.filename or "image.jpg", contents, mime_type)
        }
        data = {"organs": "leaf"}

        resp = requests.post(url, files=files, data=data, timeout=60)

        # try to return JSON body if possible
        try:
            data = resp.json()
            return {"status": resp.status_code, "body": data}
        except Exception:
            return {"status": resp.status_code, "text": resp.text}

    except Exception as e:
        return {"error": str(e)}
