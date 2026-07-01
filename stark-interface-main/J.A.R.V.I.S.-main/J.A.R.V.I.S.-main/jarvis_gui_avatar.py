import tkinter as tk
from tkinter import scrolledtext
from PIL import Image, ImageTk, ImageSequence
import threading
import speech_recognition as sr
import pyttsx3
import webbrowser
import google.generativeai as genai




#
genai.configure(api_key="YOUR_GEMINI_API_KEY")
model = genai.GenerativeModel("gemini-pro")
#







recognizer = sr.Recognizer()
tts_engine = pyttsx3.init()

def speak(text):
    tts_engine.say(text)
    tts_engine.runAndWait()

def listen_and_respond():
    with sr.Microphone() as source:
        recognizer.adjust_for_ambient_noise(source)
        output_text.insert(tk.END, "🎤 Listening...\n")
        audio = recognizer.listen(source)

    try:
        command = recognizer.recognize_google(audio)
        output_text.insert(tk.END, f"🗣 You said: {command}\n")
        command = command.lower()
    except:
        speak("Sorry, I didn't catch that.")
        output_text.insert(tk.END, "⚠️ Couldn't recognize speech.\n")
        return

    if "hello" in command:
        response = "Hello! How can I assist you?"
    elif "your name" in command:
        response = "I am Jarvis, your AI assistant."
    elif "open youtube" in command:
        response = "Opening YouTube."
        webbrowser.open("https://www.youtube.com")
    elif "open google" in command:
        response = "Opening Google."
        webbrowser.open("https://www.google.com")
    elif "stop" in command or "bye" in command:
        response = "Goodbye!"
        speak(response)
        root.quit()
        return
    else:
        response = "I didn't understand that."

    output_text.insert(tk.END, f"🤖 Jarvis: {response}\n\n")
    speak(response)


# 🔁 Animate GIF
def animate_gif(label, gif):
    def run():
        while True:
            for frame in ImageSequence.Iterator(gif):
                frame_image = ImageTk.PhotoImage(frame.resize((150, 150)))
                label.configure(image=frame_image)
                label.image = frame_image
                label.update()
    threading.Thread(target=run, daemon=True).start()

# 🌌 GUI Theme + Layout
root = tk.Tk()
root.title("Jarvis - AI Assistant")
root.configure(bg="#1e1e2f")  # Dark mode

# Avatar Display
gif = Image.open("avatar.gif")  # make sure avatar.gif is in the same folder
avatar_label = tk.Label(root, bg="#1e1e2f")
avatar_label.pack(pady=10)
animate_gif(avatar_label, gif)

# Talk Button
talk_button = tk.Button(root, text="🎙️ Talk to Jarvis", command=listen_and_respond,
                        font=("Arial", 14), bg="#00b4d8", fg="white", relief="flat", padx=10, pady=5)
talk_button.pack(pady=10)

# Output Display
output_text = scrolledtext.ScrolledText(root, wrap=tk.WORD, width=50, height=15,
                                        font=("Consolas", 12), bg="#282c34", fg="#ffffff", insertbackground="white")
output_text.pack(padx=20, pady=10)

root.mainloop()
