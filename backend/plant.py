import base64
import requests
import os
from typing import Optional
from dotenv import load_dotenv
from PIL import Image
import numpy as np

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
    Identify plant/species using PlantNet API (demo).
    This is a species identification helper only, not a plant disease classifier.
    Expects an API key set via /plantnet/key or PLANT_ID_API_KEY environment variable.
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
            "disease_name": None,
            "species_name": None,
            "advice": "No confident identification from PlantNet.",
            "prevention": "Try a clearer image focusing on leaf or flower.",
            "confidence": 0,
            "mode": "plantnet_species",
            "diagnosis_type": "species",
            "plantnet": data,
            "raw": data
        }

    top = results[0]
    score = top.get("score") or top.get("probability") or 0
    species = top.get("species") or top.get("plant") or top.get("taxonomy") or {}
    common_names = species.get("commonNames") if isinstance(species, dict) else []
    sci_name = species.get("scientificNameWithoutAuthor") if isinstance(species, dict) else species.get("scientificName") if isinstance(species, dict) else None

    # Prefer a human-friendly common name when available
    species_common = common_names[0] if common_names else None
    species_scientific = sci_name or None
    species_family = species.get("family") if isinstance(species, dict) else None

    return {
        # keep legacy keys for compatibility but separate species vs disease
        "infected": None,
        "health_status": "unknown",
        "severity": "unknown",
        "disease_name": None,
        "species_name": species_common or species_scientific or None,
        "species": {
            "commonNames": common_names,
            "scientificName": species_scientific,
            "family": species_family
        },
        "top_score": float(score),
        "confidence": round(float(score) * 100, 2),
        "mode": "plantnet_species",
        "diagnosis_type": "species",
        "advice": "Species identified by PlantNet (this is NOT a disease diagnosis).",
        "prevention": "N/A",
        "plantnet": data,
        "raw": data,
        "top_result": top
    }


def analyze_leaf_health(image_bytes: bytes):
    """Analyze a leaf image for visual disease symptoms using color and discoloration heuristics."""
    from io import BytesIO

    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return {
            "infected": None,
            "health_status": "unknown",
            "severity": "unknown",
            "disease_name": None,
            "confidence": 0,
            "advice": "Unable to read image for disease analysis.",
            "prevention": "Please upload a clearer leaf photo.",
            "mode": "heuristic_health",
            "diagnosis_type": "health"
        }

    image = image.resize((256, 256), Image.LANCZOS)
    arr = np.asarray(image).astype("float32") / 255.0
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    maxc = np.maximum(np.maximum(r, g), b)
    minc = np.minimum(np.minimum(r, g), b)
    diff = maxc - minc
    v = maxc
    s = np.where(maxc > 0, diff / maxc, 0.0)

    h = np.zeros_like(maxc)
    mask = diff > 1e-6
    idx = mask & (maxc == r)
    h[idx] = (60.0 * ((g[idx] - b[idx]) / diff[idx]) + 360.0) % 360.0
    idx = mask & (maxc == g)
    h[idx] = (60.0 * ((b[idx] - r[idx]) / diff[idx]) + 120.0) % 360.0
    idx = mask & (maxc == b)
    h[idx] = (60.0 * ((r[idx] - g[idx]) / diff[idx]) + 240.0) % 360.0

    leaf_mask = (diff > 0.08) & (v > 0.15)
    leaf_pixels = int(np.count_nonzero(leaf_mask))
    if leaf_pixels == 0:
        return {
            "infected": None,
            "health_status": "unknown",
            "severity": "unknown",
            "disease_name": None,
            "confidence": 0,
            "advice": "Could not detect leaf area clearly.",
            "prevention": "Try a closer, better-lit leaf image.",
            "mode": "heuristic_health",
            "diagnosis_type": "health"
        }

    green_mask = leaf_mask & (h >= 60) & (h <= 170) & (s > 0.25) & (v > 0.2)
    yellow_mask = leaf_mask & (h >= 15) & (h <= 60) & (s > 0.22) & (v > 0.35)
    brown_mask = leaf_mask & (h >= 5) & (h <= 40) & (s > 0.25) & (v < 0.6)
    white_mask = leaf_mask & (s < 0.18) & (v > 0.75)

    yellow_count = int(np.count_nonzero(yellow_mask))
    brown_count = int(np.count_nonzero(brown_mask))
    white_count = int(np.count_nonzero(white_mask))
    green_count = int(np.count_nonzero(green_mask))
    disease_count = int(np.count_nonzero((yellow_mask | brown_mask | white_mask) & ~green_mask))

    disease_ratio = disease_count / leaf_pixels
    green_ratio = green_count / leaf_pixels

    if disease_ratio < 0.10 or green_ratio > 0.75:
        infected = False
        health_status = "healthy"
        severity = "low"
        advice = "Leaf appears healthy. Continue regular monitoring and crop care."
        prevention = "Maintain proper watering, nutrition, and pest scouting."
        disease_name = "Healthy leaf"
    else:
        infected = True
        if disease_ratio < 0.20:
            severity = "mild"
        elif disease_ratio < 0.35:
            severity = "moderate"
        else:
            severity = "severe"

        if brown_count >= yellow_count and brown_count >= white_count:
            disease_name = "Suspected leaf spot / blight"
            advice = "Leaf discoloration matches common spot/blight symptoms. Inspect lesions and remove damaged tissue."
        elif yellow_count > brown_count:
            disease_name = "Suspected chlorosis or nutrient stress"
            advice = "Yellowing suggests nutrient imbalance or early infection. Check soil nutrition and irrigation."
        else:
            disease_name = "Suspected leaf disease"
            advice = "Leaf symptoms indicate a possible plant disease. Consult an agronomist for a precise diagnosis."

        prevention = "Improve leaf hygiene, remove affected foliage, and use targeted treatment if needed."

    confidence = round(min(1.0, disease_ratio * 3.0) * 100.0, 1)

    return {
        "infected": infected,
        "health_status": "infected" if infected else "healthy",
        "severity": severity,
        "disease_name": disease_name,
        "confidence": confidence,
        "advice": advice,
        "prevention": prevention,
        "mode": "heuristic_health",
        "diagnosis_type": "health"
    }
