from dotenv import load_dotenv
from groq import Groq
import os

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ai_chatbot_response(user_query, context=None):

    context_text = ""
    if context:
        context_text = f"""
        Crop: {context.get('crop')}
        Nitrogen: {context.get('nitrogen_ppm')}
        Phosphorus: {context.get('phosphorus_ppm')}
        Potassium: {context.get('potassium_ppm')}
        Soil pH: {context.get('soil_ph')}
        Temperature: {context.get('avg_temp_c')}
        Humidity: {context.get('humidity_pct')}
        Rainfall: {context.get('rainfall_mm')}
        """

    prompt = f"""
    You are an Indian smart agriculture assistant.
    Give clear, short answers.
    {context_text}

    Question: {user_query}
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )

    return response.choices[0].message.content
