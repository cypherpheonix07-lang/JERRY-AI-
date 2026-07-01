'''import pyttsx3
import threading
import queue

from core.config import is_tts_enabled
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

def speak(text, lang ="en"):
    if not is_tts_enabled():
        return  # 🔇 Don't speak if tts is disabled

    speak_queue.put(text)'''
   
import threading
import queue
from gtts import gTTS
import tempfile
import os
import playsound
import pyttsx3
import uuid

from core.config import is_tts_enabled

# Create a queue to manage TTS tasks
speak_queue = queue.Queue()

# Initialize pyttsx3 engineonce
fallback_engine = pyttsx3.init()

def use_pyttsx3(text):
    try:
        fallback_engine.say(text)
        fallback_engine.runAndWait()
    except Exception as e:
        print("pyTTSx3 Error:", e)
        
# TTS speaking function using gTTS and pyttsx3 falback
def voice_worker():
    while True:
        item = speak_queue.get()
        if item is None:
            break  # Stop thread
        text, lang = item

        if lang == "hi":
            try:
                tts = gTTS(text=text, lang="hi")
                #with tempfile.NamedTemporaryFile(delete=True, suffix=".mp3") as fp:
                #    tts.save(fp.name)
                #    playsound.playsound(fp.name)
                
                # Create unique temporary file
                filename = os.path.join(tempfile.gettempdir(), f"tts_{uuid.uuid4()}.mp3")
                tts.save(filename)

                # Play with default OS player
                from playsound import playsound
                playsound(filename)

                os.remove(filename)  # Cleanup   
                    
            except Exception as e:
                print("gTTS Failed, trying falling back to pyttsx3. Error:", e)
                use_pyttsx3(text)
        else:
            use_pyttsx3(text)  # Use pyttsx3 for other languages
        
        speak_queue.task_done()
        
        
        

# Start the speaking thread
voice_thread = threading.Thread(target=voice_worker, daemon=True)
voice_thread.start()

# Main speak() function
def speak(text, lang="en"):
    if not is_tts_enabled():
        return  # Don't speak if TTS is off
    
    
    speak_queue.put((text, lang))  # Add (text, language) tuple to queue
