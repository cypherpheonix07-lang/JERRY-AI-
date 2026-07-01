import speech_recognition as sr
import threading
from core.commands import process_command
from voice.tts import speak

recognizer = sr.Recognizer()

def listen_and_respond(output_text):
    try:
        with sr.Microphone() as source:
            recognizer.adjust_for_ambient_noise(source)
            output_text.insert("end", "🎤 Listening...\n")
            output_text.see("end")
            audio = recognizer.listen(source)

            command = recognizer.recognize_google(audio)
            process_command(command, output_text)

    except Exception as e:
        error_msg = "⚠️ Sorry, I couldn't process that."
        output_text.insert("end", f"{error_msg}\n")
        output_text.see("end")
        print("Error:", e)
        speak(error_msg)

# Thread wrapper
def threaded_listen_and_respond(output_text):
    thread = threading.Thread(target=listen_and_respond, args=(output_text,))
    thread.start()
