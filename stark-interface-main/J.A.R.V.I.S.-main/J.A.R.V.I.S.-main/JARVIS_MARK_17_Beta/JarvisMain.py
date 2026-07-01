from GUI import init_gui
from core.utils import ensure_data_files, ensure_gemini_api_key

if __name__ == "__main__":
    ensure_data_files()
    ensure_gemini_api_key()
    init_gui()
