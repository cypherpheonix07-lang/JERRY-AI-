import speech_recognition as sr
import threading
from core.commands import process_command
from voice.tts import speak
import time

recognizer = sr.Recognizer()
wake_word = "hey jarvis"  # Set your wake word here
wake_word_active = False # Global variable to control wake word mode


# normal talk button usage
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


# 🧠 Wake word mode
wake_word_active = False
def start_wake_word_listener(output_text, mode_flag_func):
    def listen_loop():
        global wake_word_active
        wake_word_active = True
        while wake_word_active:
            if not mode_flag_func():  # Check if wake word mode is on
                time.sleep(1)
                continue

            try:
                with sr.Microphone() as source:
                    recognizer.adjust_for_ambient_noise(source)
                    print("👂 Listening for wake word...")
                    audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)

                said = recognizer.recognize_google(audio).lower()
                print("Heard:", said)

                if wake_word in said:
                    speak("Yes?")
                    with sr.Microphone() as source:
                        output_text.insert("end", "🎤 Awaiting your command...\n")
                        output_text.see("end")
                        command_audio = recognizer.listen(source, timeout=5)
                        command = recognizer.recognize_google(command_audio)
                        process_command(command, output_text)

            except Exception as e:
                print("Wake listener error:", e)
                time.sleep(2)

    threading.Thread(target=listen_loop, daemon=True).start()
    
    
def stop_wake_word_listener():
    global wake_word_active
    wake_word_active = False
    '''print("Wake word listener stopped.")'''