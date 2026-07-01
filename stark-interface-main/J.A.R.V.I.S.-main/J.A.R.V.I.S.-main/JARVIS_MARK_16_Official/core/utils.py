import os
from tkinter import Tk, simpledialog, messagebox

def ensure_gemini_api_key():
    if not os.path.exists(".env") or "GEMINI_API_KEY" not in open(".env").read():
        root_temp = Tk()
        root_temp.withdraw()  # Hide the root window for the prompt
        user_key = simpledialog.askstring("Gemini API Key Required", "Please enter your Gemini API Key:")

        if user_key:
            with open(".env", "w") as env_file:
                env_file.write(f"GEMINI_API_KEY={user_key}")
            messagebox.showinfo("Saved", "Your API key has been saved. Starting Jarvis...")
        else:
            messagebox.showerror("Missing Key", "No API key entered. Exiting program.")
            exit()
            
            