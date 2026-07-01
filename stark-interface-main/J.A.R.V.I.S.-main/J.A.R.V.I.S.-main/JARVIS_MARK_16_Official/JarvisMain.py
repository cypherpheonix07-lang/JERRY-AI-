from core.utils import ensure_gemini_api_key
from GUI import init_gui

if __name__ == "__main__":
    ensure_gemini_api_key()
    init_gui()