# api/weather.py

from .location import get_city_by_ip

import os,requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("WEATHER_API_KEY")

def get_weather():
    city = get_city_by_ip()
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
        res = requests.get(url).json()
        
        if res.get("cod") != 200:
            return "Weather unavailable"
        
        temp = res["main"]["temp"]
        feels= res["main"]["feels_like"]
        hum = res["main"]["humidity"]
        desc = res["weather"][0]["description"].title()
        
        if "rain" in desc.lower():
            desc = "🌧️ " + desc
        elif "cloud" in desc.lower():
            desc = "☁️ " + desc
        elif "sun" in desc.lower():
            desc = "☀️ " + desc
        else:
            desc = "🌤️ " + desc
            
        return f"🌡️{city}: {temp}°C \n {f"Feel:{feels}"}, {f"Humid:{hum}"} \n {desc}"
    except Exception as e:
        print(f"⚠️ Weather API error: {e}")
        return "Weather unavailable"