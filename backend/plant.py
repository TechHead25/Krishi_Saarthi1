import base64
import requests
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

KEY_FILE = os.path.join(os.path.dirname(__file__), ".plantnet_key")

# PlantNet API key is loaded from environment by default.
PLANTNET_API_KEY = os.environ.get("PLANTNET_API_KEY", "").strip()


def _read_plantnet_key() -> Optional[str]:
    # priority: environment variable -> stored key file -> legacy env variable
    if PLANTNET_API_KEY:
        return PLANTNET_API_KEY

    if os.path.exists(KEY_FILE):
        try:
            with open(KEY_FILE, "r", encoding="utf-8") as f:
                key = f.read().strip()
                if key:
                    return key
        except Exception:
            pass

    return os.environ.get("PLANT_ID_API_KEY")


def analyze_with_plant_id(image_bytes: bytes):
    """
    Identify plant/species using PlantNet API (demo). Expects an API key set via /plantnet/key
    or PLANT_ID_API_KEY environment variable.
    """

    api_key = _read_plantnet_key()
    if not api_key:
        raise ValueError("PLANTNET API key is missing. Set it using the /plantnet/key endpoint or PLANT_ID_API_KEY env var.")

    # PlantNet identify endpoint (v2) - use multipart/form-data file upload
    url = f"https://my-api.plantnet.org/v2/identify/all?api-key={api_key}"

    # Guess a mime-type; default to jpeg
    mime_type = "image/jpeg"

    files = {"images": ("image.jpg", image_bytes, mime_type)}
    data = {"organs": "leaf"}

    try:
        response = requests.post(url, files=files, data=data, timeout=60)
    except Exception as e:
        raise ValueError(f"PlantNet request failed: {e}")

    print("PLANTNET STATUS:", response.status_code)
    print("PLANTNET RAW TEXT:", response.text[:500])

    try:
        data = response.json()
    except Exception:
        raise ValueError("PlantNet returned non-JSON (likely invalid key or HTML error)")

    if response.status_code != 200:
        # return the error body for debugging purposes
        raise ValueError(data)

    # PlantNet returns a list of suggestions; we will pick the top suggestion
    # Example structure: { "results": [ { "score": 0.9, "species": {"scientificName":...}, ... } ] }
    results = data.get("results") or data.get("suggestions") or []

    if not results:
        return {
            "infected": None,
            "health_status": "unknown",
            "severity": "unknown",
            "disease_name": "No identification",
            "advice": "No confident identification from PlantNet.",
            "prevention": "Try a clearer image focusing on leaf or flower.",
            "confidence": 0
        }

    top = results[0]
    score = top.get("score") or top.get("probability") or 0
    species = top.get("species") or top.get("plant") or top.get("taxonomy") or {}
    common_names = species.get("commonNames") if isinstance(species, dict) else None
    sci_name = species.get("scientificNameWithoutAuthor") if isinstance(species, dict) else None

    name = None
    if common_names:
        name = common_names[0]
    if not name and sci_name:
        name = sci_name
    if not name:
        name = top.get("species", {}).get("scientificName", "Unknown") if isinstance(top.get("species"), dict) else "Unknown"

    return {
        "infected": None,
        "health_status": "unknown",
        "severity": "unknown",
        "disease_name": name,
        "advice": "Identification from PlantNet (species match).",
        "prevention": "N/A",
        "confidence": round(float(score) * 100, 2),
        "raw": top
    }