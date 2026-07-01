from dotenv import load_dotenv
import os
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

# Get the API key from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("❌ Gemini API key not found. Please check your .env file.")
else:
    print("✅ Gemini API key loaded successfully.")

    # Configure Gemini with the loaded key
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content("Hello Gemini, how are you?")
        print("🤖 Gemini says:", response.text.strip())
    except Exception as e:
        print("⚠️ Error while connecting to Gemini API:", e)

