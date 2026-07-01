import pyttsx3
import threading
import queue

# Initialize engine
tts_engine = pyttsx3.init()

# Queue for texts to speak
speak_queue = queue.Queue()

def voice_worker():
    while True:
        text = speak_queue.get()
        if text is None:
            break  # Exit
        tts_engine.say(text)
        tts_engine.runAndWait()
        speak_queue.task_done()

# Start the background speaking thread
voice_thread = threading.Thread(target=voice_worker, daemon=True)
voice_thread.start()

def speak(text):
    speak_queue.put(text)
   
