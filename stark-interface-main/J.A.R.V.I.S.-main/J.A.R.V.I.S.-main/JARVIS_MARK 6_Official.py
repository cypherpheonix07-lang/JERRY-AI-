"""🧠 DAY 6 – Add:
Memory (memo system) – Jarvis can remember things you tell it

Typing input box – If you don’t wanna use the mic

Still speaks every reply – Whether it's typed or spoken

🔁 Upgrades We’ll Do:
Add memo = {} to store memory

Add a new command: "remember that ..."

Add a text entry field for manual typing

Unify Gemini replies for both voice & typing

Here’s your upgraded version of the same code:
✅ Typing input
✅ Memory
✅ Speaks Gemini replies"""

import tkinter as tk
from tkinter import scrolledtext
from PIL import Image, ImageTk, ImageSequence
import threading
import speech_recognition as sr
import pyttsx3
import webbrowser
import google.generativeai as genai

# 🧠 Configure Gemini
genai.configure(api_key="AIzaSyANVvoqGuhR5_YFHOi5-4Jze26KmYHWXY4")  # <- Replace this
model = genai.GenerativeModel("gemini-2.0-flash")

# 🔊 Voice & Recognition Setup
recognizer = sr.Recognizer()
tts_engine = pyttsx3.init()

# 🧠 Memory storage
memo = {}

def speak(text):
    tts_engine.say(text)
    tts_engine.runAndWait()

def process_command(command):
    command = command.lower()
    output_text.insert(tk.END, f"🗣 You said: {command}\n")
    output_text.see(tk.END)

    # 🔍 Simple commands
    if "open youtube" in command:
        reply = "Opening YouTube..."
        webbrowser.open("https://www.youtube.com")
    elif "open google" in command:
        reply = "Opening Google..."
        webbrowser.open("https://www.google.com")
    elif "stop" in command or "exit" in command:
        reply = "Goodbye!"
        output_text.insert(tk.END, f"🤖 Jarvis: {reply}\n")
        speak(reply)
        root.quit()
        return
    elif "remember that" in command:
        key = command.replace("remember that", "").strip()
        memo["note"] = key
        reply = f"I'll remember that: {key}"
    elif "what did i tell you" in command or "what do you remember" in command:
        reply = memo.get("note", "You haven't told me anything to remember yet.")
    else:
        # 🧠 Gemini for smart replies
        try:
            response = model.generate_content(command)
            reply = response.text.strip()
        except:
            reply = "Sorry, I couldn't think of a response."

    output_text.insert(tk.END, f"🤖 Jarvis: {reply}\n\n")
    speak(reply)

# 🎙️ Mic + Gemini Response
def listen_and_respond():
    try:
        with sr.Microphone() as source:
            recognizer.adjust_for_ambient_noise(source)
            output_text.insert(tk.END, "🎤 Listening...\n")
            output_text.see(tk.END)
            audio = recognizer.listen(source)

        command = recognizer.recognize_google(audio)
        process_command(command)

    except Exception as e:
        error_msg = "⚠️ Sorry, I couldn't process that."
        output_text.insert(tk.END, f"{error_msg}\n")
        speak(error_msg)
        print("Error:", e)

# 🧵 Thread Wrapper
def threaded_listen_and_respond():
    threading.Thread(target=listen_and_respond).start()

# 💬 Typed Input Handler
def handle_text_input(event=None):
    command = input_box.get()
    input_box.delete(0, tk.END)
    process_command(command)

# 🎞️ Avatar Animation
def animate_gif(label, gif):
    def run():
        while True:
            for frame in ImageSequence.Iterator(gif):
                frame_image = ImageTk.PhotoImage(frame.resize((150, 150)))
                label.configure(image=frame_image)
                label.image = frame_image
                label.update()
    threading.Thread(target=run, daemon=True).start()

# 🖥️ GUI Setup
root = tk.Tk()
root.title("Jarvis - AI Assistant")
root.configure(bg="#1e1e2f")

# 👤 Avatar
gif = Image.open("avatar.gif")
avatar_label = tk.Label(root, bg="#1e1e2f")
avatar_label.pack(pady=10)
animate_gif(avatar_label, gif)

# 🎙️ Talk Button
talk_button = tk.Button(root, text="🎙️ Talk to Jarvis", command=threaded_listen_and_respond,
                        font=("Arial", 14), bg="#00b4d8", fg="white", relief="flat", padx=10, pady=5)
talk_button.pack(pady=10)

# 📥 Typing Input Box
input_box = tk.Entry(root, font=("Arial", 14), bg="#2c2f3a", fg="white", insertbackground="white", width=40)
input_box.pack(pady=5)
input_box.bind("<Return>", handle_text_input)

# 💬 Output Box
output_text = scrolledtext.ScrolledText(root, wrap=tk.WORD, width=50, height=15,
                                        font=("Consolas", 12), bg="#282c34", fg="white", insertbackground="white")
output_text.pack(padx=20, pady=10)

root.mainloop()
