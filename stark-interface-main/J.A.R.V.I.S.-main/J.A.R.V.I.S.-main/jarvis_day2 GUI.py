import tkinter as tk
from tkinter import scrolledtext
import speech_recognition as sr
import pyttsx3
import webbrowser
import threading  # Import the threading module

recognizer = sr.Recognizer()
tts_engine = pyttsx3.init()

def speak(text):
    tts_engine.say(text)
    tts_engine.runAndWait()

def listen_and_respond():
    try: # Added try-except to handle errors gracefully.
        with sr.Microphone() as source:
            recognizer.adjust_for_ambient_noise(source)
            output_text.insert(tk.END, "Listening...\n")
            output_text.see(tk.END)  # Autoscroll
            root.update()  # Force Tkinter to update the display
            audio = recognizer.listen(source)

        try:
            command = recognizer.recognize_google(audio)
            output_text.insert(tk.END, f"You said: {command}\n")
            output_text.see(tk.END)  # Autoscroll
            root.update()  # Force Tkinter to update the display
            command = command.lower()
        except sr.UnknownValueError:
            speak("Sorry, I didn't catch that.")
            output_text.insert(tk.END, "Couldn't recognize speech.\n")
            output_text.see(tk.END)  # Autoscroll
            root.update()  # Force Tkinter to update the display
            return
        except sr.RequestError as e:
            speak("Could not request results from Google Speech Recognition service; {0}".format(e))
            output_text.insert(tk.END, "Error contacting speech recognition service.\n")
            output_text.see(tk.END)  # Autoscroll
            root.update()  # Force Tkinter to update the display
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
            root.after(0, root.destroy) # Use root.destroy instead of root.quit and use root.after to avoid thread issues
            return
        else:
            response = "I didn't understand that."

        output_text.insert(tk.END, f"Jarvis: {response}\n")
        output_text.see(tk.END)  # Autoscroll
        root.update()  # Force Tkinter to update the display
        speak(response)
    except Exception as e:
        print(f"An error occurred: {e}")
        output_text.insert(tk.END, f"An error occurred: {e}\n")
        output_text.see(tk.END) #Autoscroll
        root.update()

def start_listening():
    threading.Thread(target=listen_and_respond).start()  # Create and start a new thread

# GUI Setup
root = tk.Tk()
root.title("Jarvis AI Assistant")

talk_button = tk.Button(root, text="Talk to Jarvis", command=start_listening, font=("Arial", 14), bg="skyblue")  # Use start_listening
talk_button.pack(pady=10)

output_text = scrolledtext.ScrolledText(root, wrap=tk.WORD, width=50, height=15, font=("Consolas", 12))
output_text.pack(padx=10, pady=10)
output_text.see(tk.END) #Autoscroll

root.mainloop()

