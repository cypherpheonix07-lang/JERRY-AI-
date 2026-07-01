import speech_recognition as sr
import pyttsx3
import webbrowser

recognizer = sr.Recognizer()
tts_engine = pyttsx3.init()

def speak(text):
    print("Jarvis:", text)
    tts_engine.say(text)
    tts_engine.runAndWait()

def listen():
    with sr.Microphone() as source:
        print("Listening...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        command = recognizer.recognize_google(audio)
        print("You said:", command)
        return command.lower()
    except:
        speak("Sorry, I didn't catch that.")
        return ""

def respond_to_command(command):
    if "hello" in command:
        speak("Hello! How can I assist?")
    elif "your name" in command:
        speak("I am Jarvis, your assistant.")
    elif "open youtube" in command:
        speak("Opening YouTube.")
        webbrowser.open("https://www.youtube.com")
    elif "open google" in command:
        speak("Opening Google.")
        webbrowser.open("https://www.google.com")
    elif "stop" in command or "bye" in command:
        speak("Goodbye!")
        exit()
    else:
        speak("I didn't understand that.")

if __name__ == "__main__":
    speak("Jarvis online.")
    while True:
        user_command = listen()
        if user_command:
            respond_to_command(user_command)
