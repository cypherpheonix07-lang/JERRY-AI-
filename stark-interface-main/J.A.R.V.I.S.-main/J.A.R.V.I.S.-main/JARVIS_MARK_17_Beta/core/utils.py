import os
from tkinter import Tk, simpledialog, messagebox

def ensure_gemini_api_key(): #asks for gemini api key if not found in .env file
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
            
def ensure_data_files():# This function ensures that the necessary data files and directories exist.
    # Create DATA directory if it doesn't exist
    if not os.path.exists("DATA"):
        os.makedirs("DATA")

    chat_log_path = os.path.join("DATA", "chat_log.txt")
    if not os.path.exists(chat_log_path):
        with open(chat_log_path, "w") as f:
            f.write("")

    notes_path = os.path.join("DATA", "notes.json")
    if not os.path.exists(notes_path):
        with open(notes_path, "w") as f:
            f.write("[]")

    reminders_path = os.path.join("DATA", "reminders.json")
    if not os.path.exists(reminders_path):
        with open(reminders_path, "w") as f:
            f.write("[]")
    
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
    

import time
import random
import threading
from voice.tts import speak

def type_and_speak_text(output_widget, text, min_delay=0.005, max_delay=0.05):# This function types out text in a GUI widget and speaks it using TTS.
    def speak_in_background():
        speak(text)

    # Start speaking immediately in a new thread
    threading.Thread(target=speak_in_background, daemon=True).start()

    # Begin typing animation
    output_widget.insert("end", "🤖 Jarvis: ")
    output_widget.update()
    
    for char in text:
        output_widget.insert("end", char)
        output_widget.see("end")
        output_widget.update()
        time.sleep(random.uniform(min_delay, max_delay))

    output_widget.insert("end", "\n\n")
    output_widget.see("end")
    output_widget.update()




'''
import time
import random
import threading
from voice.tts import speak, stop_speaking  # Import your speak and stop functions

typing_active = False  # 💬 Global flag to track if typing is happening

def type_and_speak_text(output_widget, text, min_delay=0.005, max_delay=0.05):
    global typing_active

    def speak_in_background():
        speak(text)

    # Start speaking immediately (in a background thread)
    threading.Thread(target=speak_in_background, daemon=True).start()

    # Start typing animation
    typing_active = True
    output_widget.insert("end", "🤖 Jarvis: ")
    output_widget.update()
    
    for char in text:
        if not typing_active:
            return  # 🛑 Stop typing immediately if flagged
        output_widget.insert("end", char)
        output_widget.see("end")
        output_widget.update()
        time.sleep(random.uniform(min_delay, max_delay))

    output_widget.insert("end", "\n\n")
    output_widget.see("end")
    output_widget.update()

def stop_typing():
    global typing_active
    typing_active = False
'''






'''
import time
import random
import threading
from voice.tts import speak, stop_speaking

typing_active = False

def type_and_speak_text(output_widget, text, min_delay=0.005, max_delay=0.05):
    global typing_active

    def typing_task():
        global typing_active
        typing_active = True
        output_widget.insert("end", "🤖 Jarvis: ")
        output_widget.update()
        
        for char in text:
            if not typing_active:
                return  # Instantly stop typing
            output_widget.insert("end", char)
            output_widget.see("end")
            output_widget.update()
            time.sleep(random.uniform(min_delay, max_delay))

        output_widget.insert("end", "\n\n")
        output_widget.see("end")
        output_widget.update()

    # Start speaking immediately
    threading.Thread(target=lambda: speak(text), daemon=True).start()''''''
    # Speak instantly in a separate process now!
    threading.Thread(target=speak, args=(text,), daemon=True).start()

    # Start typing
    threading.Thread(target=typing_task, daemon=True).start()

def stop_typing():
    global typing_active
    typing_active = False'''


















'''
import time
import random
import threading
from voice.tts import speak

def type_and_speak_text(output_widget, text, min_delay=0.01, max_delay=0.05):
    def speak_in_background():
        speak(text)

    # Start speaking immediately in a new thread
    threading.Thread(target=speak_in_background, daemon=True).start()

    # Begin typing animation
    output_widget.insert("end", "🤖 Jarvis: ")
    output_widget.update()
    
    for char in text:
        output_widget.insert("end", char)
        output_widget.see("end")
        output_widget.update()
        time.sleep(random.uniform(min_delay, max_delay))

    output_widget.insert("end", "\n\n")
    output_widget.see("end")
    output_widget.update()'''
    

