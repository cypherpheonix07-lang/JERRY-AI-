import speech_recognition as sr
import pyttsx3

# Initialize the recognizer and the TTS engine
recognizer = sr.Recognizer()
tts_engine = pyttsx3.init()

# Function to speak text
def speak(text):
    print("Jarvis:", text)
    tts_engine.say(text)
    tts_engine.runAndWait()

# Function to listen to microphone and convert to text
def listen():
    with sr.Microphone() as source:
        print("Listening...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        print("Recognizing...")
        command = recognizer.recognize_google(audio)
        print("You said:", command)
        return command.lower()
    except sr.UnknownValueError:
        speak("Sorry, I didn't catch that.")
        return ""
    except sr.RequestError:
        speak("Sorry, there was a problem with the speech service.")
        return ""

# Function to respond to specific commands
def respond_to_command(command):
    if "hello" in command:
        speak("Hello! How can I help you?")
    elif "your name" in command:
        speak("I am Jarvis, your personal assistant.")
    elif "stop" in command:
        speak("Goodbye!")
        exit()
    else:
        speak("I didn't understand that. Please say it again.")

# Main program loop
if __name__ == "__main__":
    speak("Jarvis activated. I am ready.")
    while True:
        user_command = listen()
        if user_command:
            respond_to_command(user_command)
