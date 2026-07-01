import requests

def get_city_by_ip():
    try:
        response = requests.get("http://ip-api.com/json/")
        data = response.json()
        return data.get("city", "Jabalpur")  # fallback city
    except:
        return "Jabalpur"