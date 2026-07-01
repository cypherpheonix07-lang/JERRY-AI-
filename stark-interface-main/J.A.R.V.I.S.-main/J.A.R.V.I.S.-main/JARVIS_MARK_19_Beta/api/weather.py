# api/weather.py

import requests
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("WEATHER_API_KEY")

def get_weather(city="Jabalpur"):
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
        res = requests.get(url).json()
        if res.get("cod") != 200:
            return "Weather unavailable"
        temp = res["main"]["temp"]
        feels= res["main"]["feels_like"]
        humidity = res["main"]["humidity"]
        desc = res["weather"][0]["description"].title()
        return f"🌡️{city}: {temp}°C \n {f"Feel:{feels}"}, {f"Humid:{humidity}"} \n {desc}"
    except Exception as e:
        print(f"⚠️ Weather API error: {e}")
        return "Weather unavailable"