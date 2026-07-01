'''def speak(text):
    tts_engine.say(text)
    tts_engine.runAndWait()
''''''
import pyttsx3
import threading
import queue

# Initialize engine
tts_engine = pyttsx3.init()# This initializes the TTS engine
speak_queue = queue.Queue()

# Queue for texts to speak
#speak_queue = queue.Queue()# This queue will hold the texts to be spoken

# Global flag to stop speaking
stop_signal = False
voice_thread = None'''

'''
def voice_worker():# This function runs in a separate thread to handle TTS
    global stop_signal
    while True:
        text = speak_queue.get()
        if text is None:
            break  # Exit thread
        if not stop_signal:
            try:
                tts_engine.say(text)  # Speak the text
                tts_engine.runAndWait() # Wait for the engine to finish speaking
            except:
                pass
            
        speak_queue.task_done()

voice_thread = threading.Thread(target=voice_worker, daemon=True)# This makes the thread a daemon thread
voice_thread.start()

def speak(text):# This function is called to speak the text
    global stop_signal
    stop_signal = False
    speak_queue.put(text)

def stop_speaking():# This function stops the TTS engine
    global stop_signal
    stop_signal = True
    try:
        while not speak_queue.empty():
            speak_queue.get_nowait()
            speak_queue.task_done()
        tts_engine.stop()
    except:
        pass'''
'''   
def init_voice_engine():
    global tts_engine, speak_queue, voice_thread, stop_signal

    tts_engine = pyttsx3.init()
    speak_queue = queue.Queue()
    stop_signal = False

    def voice_worker():
        global stop_signal
        while True:
            text = speak_queue.get()
            if text is None:
                break
            if not stop_signal:
                try:
                    tts_engine.say(text)
                    tts_engine.runAndWait()
                except:
                    pass
            speak_queue.task_done()

    voice_thread = threading.Thread(target=voice_worker, daemon=True)
    voice_thread.start()
# Start engine once
init_voice_engine()

def speak(text):
    global stop_signal
    stop_signal = False
    speak_queue.put(text)

def stop_speaking():
    global stop_signal
    stop_signal = True

    # Stop current speaking
    try:
        tts_engine.stop()
    except:
        pass

    # Clear queue
    while not speak_queue.empty():
        try:
            speak_queue.get_nowait()
            speak_queue.task_done()
        except:
            pass

    # Full re-init the TTS engine fresh
    init_voice_engine()
    
    
    '''
    
    
    
'''import pyttsx3
import multiprocessing

# Global process
speak_process = None

def speak_worker(text):
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()

def speak(text):
    global speak_process

    # Stop old speaking if any
    stop_speaking()

    # Start new speaking process
    speak_process = multiprocessing.Process(target=speak_worker, args=(text,))
    speak_process.start()

def stop_speaking():
    global speak_process
    if speak_process and speak_process.is_alive():
        speak_process.terminate()
        speak_process.join()
    speak_process = None'''
    
    
'''   
import pyttsx3
import threading

tts_engine = pyttsx3.init()
speak_thread = None
stop_signal = False

def speak(text):
    global speak_thread, stop_signal

    stop_speaking()  # Always kill old speech

    def worker():
        global stop_signal
        stop_signal = False
        try:
            tts_engine.say(text)
            tts_engine.runAndWait()
        except:
            pass

    speak_thread = threading.Thread(target=worker, daemon=True)
    speak_thread.start()

def stop_speaking():
    global stop_signal, speak_thread
    stop_signal = True
    try:
        tts_engine.stop()
    except:
        pass
    if speak_thread and speak_thread.is_alive():
        speak_thread.join(timeout=0.5)
    speak_thread = None'''
    
    
    
    
    
    
    
    
    
    
    
'''
import pyttsx3
import threading

tts_engine = pyttsx3.init()
speak_thread = None
stop_signal = threading.Event()

def speak(text):
    global speak_thread
    stop_speaking()  # always stop old speech safely first

    def worker():
        stop_signal.clear()
        try:
            for word in text.split():
                if stop_signal.is_set():
                    break
                tts_engine.say(word)
                tts_engine.runAndWait()
        except:
            pass

    speak_thread = threading.Thread(target=worker, daemon=True)
    speak_thread.start()

def stop_speaking():
    global speak_thread
    stop_signal.set()
    try:
        tts_engine.stop()
    except:
        pass
    if speak_thread and speak_thread.is_alive():
        speak_thread.join(timeout=0.5)
    speak_thread = None'''
    
    
    
'''  
import pyttsx3

tts_engine = pyttsx3.init()

def speak(text):
    try:
        tts_engine.say(text)
        tts_engine.runAndWait()
    except Exception as e:
        print("Error in speaking:", e)
'''
 
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
   
