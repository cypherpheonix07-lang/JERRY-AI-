import tkinter as tk
from tkinter import scrolledtext
import speech_recognition as sr
import pyttsx3
import webbrowser

recognizer = sr.Recognizer()
tts_engine = pyttsx3.init()

def speak(text):
    tts_engine.say(text)
    tts_engine.runAndWait()

def listen_and_respond():
    with sr.Microphone() as source:
        recognizer.adjust_for_ambient_noise(source)
        output_text.insert(tk.END, "Listening...\n")
        audio = recognizer.listen(source)

    try:
        command = recognizer.recognize_google(audio)
        output_text.insert(tk.END, f"You said: {command}\n")
        command = command.lower()
    except:
        speak("Sorry, I didn't catch that.")
        output_text.insert(tk.END, "Couldn't recognize speech.\n")
        return

    if "hello" in command:
        response = "Hello! How can I assist?"
    elif "your name" in command:
        response = "I am Jarvis, your assistant."
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

    output_text.insert(tk.END, f"Jarvis: {response}\n")
    speak(response)

# GUI Setup
root = tk.Tk()
root.title("Jarvis AI Assistant")

talk_button = tk.Button(root, text="🎙️ Talk to Jarvis", command=listen_and_respond, font=("Arial", 14), bg="skyblue")
talk_button.pack(pady=10)

output_text = scrolledtext.ScrolledText(root, wrap=tk.WORD, width=50, height=15, font=("Consolas", 12))
output_text.pack(padx=10, pady=10)

root.mainloop()
