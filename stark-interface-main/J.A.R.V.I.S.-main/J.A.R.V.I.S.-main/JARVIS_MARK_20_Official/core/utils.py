import os
from tkinter import Tk, simpledialog, messagebox
import json

def ensure_gemini_api_key(): #asks for gemini api key if not found in .env file
    if not os.path.exists(".env") or "GEMINI_API_KEY" not in open(".env").read():
        root_temp = Tk()
        root_temp.withdraw()  # Hide the root window for the prompt
        user_key = simpledialog.askstring("Gemini API Key Required", "Please enter your Gemini API Key:")

        if user_key:
            with open(".env", "w") as env_file:
                env_file.write(f"""GEMINI_API_KEY={user_key}
WEATHER_API_KEY=
NEWS_API_KEY=
ALPHA_VANTAGE_KEY=
FINNHUB_API_KEY=
                               """)
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
            
    # Ensure memory.json exists
    memory_path = os.path.join("DATA", "memory.json")
    if not os.path.exists(memory_path):
        with open(memory_path, "w") as mem_file:
            json.dump({}, mem_file)
            
    # Ensure custom_commands.json exists  
    custom = os.path.join("DATA", "custom_commands.json")
    if not os.path.exists(custom):
        with open(custom, "w") as f:
            json.dump({}, f, indent=2) #indent is uded for better readability
    # Ensure unknown_commands.txt exists
    unknown = os.path.join("DATA", "unknown_commands.txt")
    if not os.path.exists(unknown):
        with open(unknown, "w") as f:
            f.write("")
    
    
    
  
  
  
    

'''import time
import random
import threading,re
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
    output_widget.update()'''


import threading
import time
import random
import re
from voice.tts import speak  # or your custom speak function
from tkinter import font
import tkinter as tk

def type_and_speak_text(output_widget, text, language = "en" , min_delay=0.005, max_delay=0.05):
    # Step 1: Clean version for TTS
    spoken_text = re.sub(r"\*(.*?)\*", r"\1", text)
    # re.sub(pattern, replacement, string) Replaces all occurrences of the pattern in string with replacement.
    threading.Thread(target=lambda: speak(spoken_text, lang = language), daemon=True).start()

    # Step 2: Prepare bold font tag (do this once if not done already)
    try:
        # Check if bold tag exists
        output_widget.tag_cget("bold", "font")
    except tk.TclError:
        # If not, define it
        bold_font = font.Font(output_widget, output_widget.cget("font"))
        bold_font.configure(weight="bold")
        output_widget.tag_configure("bold", font=bold_font)
    
    
    
    '''if not output_widget.tag_cget("bold", "font"):
        bold_font = font.Font(output_widget, output_widget.cget("font"))
        bold_font.configure(weight="bold")
        output_widget.tag_configure("bold", font=bold_font)'''

    # Step 3: Typing animation with bold logic
    output_widget.configure(state="normal")
    output_widget.insert("end", "🤖 Jarvis: ")
    output_widget.update()

    index = 0
    while index < len(text):
        if text[index] == "*":
            end_index = text.find("*", index + 1)
            if end_index != -1:
                bold_text = text[index + 1:end_index]
                for char in bold_text:
                    output_widget.insert("end", char, "bold")
                    output_widget.see("end")
                    output_widget.update()
                    time.sleep(random.uniform(min_delay, max_delay))
                index = end_index + 1
                continue

        output_widget.insert("end", text[index])
        output_widget.see("end")
        output_widget.update()
        time.sleep(random.uniform(min_delay, max_delay))#to inc typing speed,then change value of 
        index += 1

    output_widget.insert("end", "\n\n")
    output_widget.see("end")
    output_widget.configure(state="disabled")










# 🌀 JARVIS SPINNER SYSTEM
spinner_running = False
spinner_index = 0
spinner_chars = ["/", "-", "\\", "|"]

def start_spinner(output_text):
    global spinner_running, spinner_index
    spinner_running = True
    spinner_index = 0
    # Start with a line where spinner will run
    output_text.insert("end", "🤖Jarvis:🤔/")
    output_text.see("end")
    update_spinner(output_text)

def update_spinner(output_text):
    global spinner_index
    if not spinner_running:
        return
    new_char = spinner_chars[spinner_index % len(spinner_chars)]
    spinner_index += 1

    # Delete the last spinner char and insert new one
    output_text.delete("end-2c", "end-1c")
    output_text.insert("end", new_char)
    output_text.see("end")

    output_text.after(150, lambda: update_spinner(output_text))  # Keep spinning

def stop_spinner(output_text, final_reply):
    global spinner_running
    spinner_running = False
    # Replace the spinner with real Jarvis reply
    output_text.delete("end-5c", "end")
    #output_text.insert("end", f" {final_reply}\n\n")
    output_text.see("end")