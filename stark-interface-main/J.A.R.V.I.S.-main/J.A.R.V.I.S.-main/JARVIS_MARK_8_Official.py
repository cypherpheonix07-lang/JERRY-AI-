import tkinter as tk
from tkinter import scrolledtext
from PIL import Image, ImageTk, ImageSequence
import threading
import speech_recognition as sr
import pyttsx3
import webbrowser
import os
import pygame
import random
import google.generativeai as genai
from dotenv import load_dotenv



load_dotenv()  # 🔄 Load environment variables




# 🧠 Gemini API Setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # 🔑 Safely get your API key in the variable
genai.configure(api_key="GEMINI_API_KEY")  # 🔑 fetches your Gemini API key from e-variable
model = genai.GenerativeModel("gemini-2.0-flash")

# 🎧 Voice Setup
recognizer = sr.Recognizer()
tts_engine = pyttsx3.init()

# 📂 Memory & Music
memo = {}
music_files = []
MUSIC_FOLDER = r"C:\Users\akhil\Music"

# 🎤 Speak Function
def speak(text):
    tts_engine.say(text)
    tts_engine.runAndWait()

# 🎵 Music Controls
def load_music_from(folder):
    global music_files
    if not os.path.exists(folder):
        return False
    pygame.mixer.init()
    music_files.clear()
    for file in os.listdir(folder):
        if file.endswith(".mp3"):
            music_files.append(os.path.join(folder, file))
    return bool(music_files)

def play_music():
    if music_files:
        pygame.mixer.music.load(music_files[0])
        pygame.mixer.music.play()

def pause_music():
    pygame.mixer.music.pause()

def resume_music():
    pygame.mixer.music.unpause()

def stop_music():
    pygame.mixer.music.stop()

def next_song():
    if music_files:
        current = music_files.pop(0)
        music_files.append(current)
        pygame.mixer.music.load(music_files[0])
        pygame.mixer.music.play()

def shuffle_music():
    random.shuffle(music_files)
    play_music()

# 🧠 Process Command
def process_command(command):
    command = command.lower()
    output_text.insert(tk.END, f"🗣 You said: {command}\n")
    output_text.see(tk.END)

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

    elif "play music" in command:
        if load_music_from(MUSIC_FOLDER):
            play_music()
            reply = "Playing your music!"
        else:
            reply = "No songs found in your music folder."

    elif "next song" in command:
        next_song()
        reply = "Skipping to the next song."

    elif "pause music" in command:
        pause_music()
        reply = "Music paused."

    elif "resume music" in command:
        resume_music()
        reply = "Resuming music."

    elif "stop music" in command:
        stop_music()
        reply = "Music stopped."

    elif "shuffle music" in command:
        shuffle_music()
        reply = "Shuffling and playing music."

    else:
        try:
            response = model.generate_content(command)
            reply = response.text.strip()
        except Exception as e:
            print("Gemini Error:", e)
            reply = "Sorry, I couldn't think of a response."

    output_text.insert(tk.END, f"🤖 Jarvis: {reply}\n\n")
    output_text.see(tk.END)
    speak(reply)

# 🎙️ Listen to Mic
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
        print("Error:", e)
        speak(error_msg)

# 🧵 Thread Wrapper
def threaded_listen_and_respond():
    threading.Thread(target=listen_and_respond).start()

# 🎞️ Animate GIF Avatar
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
gif = Image.open("avatar.gif")  # Make sure this file exists in the same folder
avatar_label = tk.Label(root, bg="#1e1e2f")
avatar_label.pack(pady=10)
animate_gif(avatar_label, gif)

# 🎙️ Talk Button
talk_button = tk.Button(root, text="🎙️ Talk to Jarvis", command=threaded_listen_and_respond,
                        font=("Arial", 14), bg="#00b4d8", fg="white", relief="flat", padx=10, pady=5)
talk_button.pack(pady=10)

# 💬 Output Console
output_text = scrolledtext.ScrolledText(root, wrap=tk.WORD, width=50, height=15,
                                        font=("Consolas", 12), bg="#282c34", fg="white", insertbackground="white")
output_text.pack(padx=20, pady=10)

# 🏁 Start App
root.mainloop()
