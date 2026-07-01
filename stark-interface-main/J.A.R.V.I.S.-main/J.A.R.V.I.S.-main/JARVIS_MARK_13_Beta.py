import tkinter as tk
from tkinter import scrolledtext
from PIL import Image, ImageTk, ImageSequence
import threading
import speech_recognition as sr
import pyttsx3
import webbrowser
import os
import pygame
import random
import google.generativeai as genai
from dotenv import load_dotenv



load_dotenv()  # 🔄 Load environment variables



# 🧠 Gemini API Setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # 🔑 Safely get your API key in the variable
genai.configure(api_key=GEMINI_API_KEY)  # 🔑 configure your Gemini API key from e-variable
model = genai.GenerativeModel("gemini-2.0-flash")

# 🎧 Voice Setup
recognizer = sr.Recognizer()
tts_engine = pyttsx3.init()

# 📂 Memory
memo = {}
conversation_history = [] # 🧠 Stores the entire conversation in memory & 🧠 Initialize the Memory for Context
# 🧠 Load Previous Conversations from 'chat_log.txt' (if exists)
if os.path.exists("chat_log.txt"):
    with open("chat_log.txt", "r", encoding="utf-8") as file:
        lines = file.readlines()

    user, jarvis = "", ""
    for line in lines:
        if line.startswith("You:"):
            user = line.replace("You:", "").strip()
        elif line.startswith("Jarvis:"):
            jarvis = line.replace("Jarvis:", "").strip()
            if user and jarvis:
                conversation_history.append({"user": user, "jarvis": jarvis})
                user, jarvis = "", ""


# 🎧 Music
music_files = []
MUSIC_FOLDER = r"C:\Users\akhil\Music"

# 🎤 Speak Function
def speak(text):
    tts_engine.say(text)
    tts_engine.runAndWait()

# 🎵 Music Controls
def load_music_from(folder):
    global music_files
    if not os.path.exists(folder):
        return False
    pygame.mixer.init()
    music_files.clear()
    for file in os.listdir(folder):
        if file.endswith(".mp3"):
            music_files.append(os.path.join(folder, file))
    return bool(music_files)

def play_music():
    if music_files:
        pygame.mixer.music.load(music_files[0])
        pygame.mixer.music.play()

def pause_music():
    pygame.mixer.music.pause()

def resume_music():
    pygame.mixer.music.unpause()

def stop_music():
    pygame.mixer.music.stop()

def next_song():
    if music_files:
        current = music_files.pop(0)
        music_files.append(current)
        pygame.mixer.music.load(music_files[0])
        pygame.mixer.music.play()

def shuffle_music():
    random.shuffle(music_files)
    play_music()

# 🧠 Process Command
def process_command(command):
    command = command.lower()
    global conversation_history
    
    # Add user command to conversation history
    conversation_history.append({"user": command, "jarvis": ""})
    # Limit memory to last 20
    if len(conversation_history) > 20:
        conversation_history = conversation_history[-20:]

    
    # Build context (last 5 interactions)
    context = ""
    for chat in conversation_history[-5:]:  # Limit context to last 5 exchanges
        context += f"User: {chat['user']}\nJarvis: {chat['jarvis']}\n"

    # Build full prompt
    full_prompt = context + f"User: {command}\nJarvis:"

    """try:
        # Generate a response from Gemini
        response = model.generate_content(full_prompt)
        reply = response.text.strip()

        # Add Jarvis's reply to memory
        conversation_history[-1]["jarvis"] = reply

        # Add the new conversation to the log file
        with open("chat_log.txt", "a", encoding="utf-8") as file:
            file.write(f"You: {command}\nJarvis: {reply}\n\n")

        return reply  # Return the generated reply

    except Exception as e:
        print("Gemini Error:", e)
        return "Sorry, I couldn't think of a response."
"""
    ## Display user command in GUI
    output_text.insert(tk.END, f"🗣 You said: {command}\n")
    output_text.see(tk.END)

    if "open youtube" in command:
        reply = "Opening YouTube..."
        webbrowser.open("https://www.youtube.com")

    elif "open google" in command:
        reply = "Opening Google..."
        webbrowser.open("https://www.google.com")

    elif "stop" in command or "exit" in command:
        with open("chat_log.txt", "w", encoding="utf-8") as file:
            for item in conversation_history:
                file.write(f"You: {item['user']}\nJarvis: {item['jarvis']}\n\n")

        reply = "Goodbye!"
        output_text.insert(tk.END, f"🤖 Jarvis: {reply}\n")
        speak(reply)
        root.quit()
        return

    elif "remember that" in command:
        key = command.replace("remember that", "").strip()
        memo["note"] = key
        reply = f"I'll remember that: {key}"

    elif "what did i tell you" in command or "what do you remember" in command:
        reply = memo.get("note", "You haven't told me anything to remember yet.")

    elif "play music" in command:
        if load_music_from(MUSIC_FOLDER):
            play_music()
            reply = "Playing your music!"
        else:
            reply = "No songs found in your music folder."

    elif "next song" in command:
        next_song()
        reply = "Skipping to the next song."

    elif "pause music" in command:
        pause_music()
        reply = "Music paused."

    elif "resume music" in command:
        resume_music()
        reply = "Resuming music."

    elif "stop music" in command:
        stop_music()
        reply = "Music stopped."

    elif "shuffle music" in command:
        shuffle_music()
        reply = "Shuffling and playing music."

    elif "show chat history" in command:
        if conversation_history:
            reply = "\n".join([f"You: {item['user']}\nJarvis: {item['jarvis']}" for item in conversation_history])
        else:
            reply = "No chat history yet."

    elif "save chat" in command:
        with open("chat_log.txt", "w", encoding="utf-8") as file:
            for item in conversation_history:
                file.write(f"You: {item['user']}\nJarvis: {item['jarvis']}\n\n")
        reply = "Chat history saved to chat_log.txt."


    else:
        try:
            response = model.generate_content(command)
            reply = response.text.strip()
        except Exception as e:
            print("Gemini Error:", e)
            reply = "Sorry, I couldn't think of a response."

    #save conversation history in memory
    
    conversation_history.append({
        "user":command,
        "jarvis":reply
    })
    # Limit memory to last 20
    if len(conversation_history) > 20:
        conversation_history = conversation_history[-20:]


    output_text.insert(tk.END, f"🤖 Jarvis: {reply}\n\n")
    output_text.see(tk.END)
    """update_chat_window()"""
    speak(reply)

# 🎙️ Listen to Mic
def listen_and_respond():
    try:
        with sr.Microphone() as source:
            recognizer.adjust_for_ambient_noise(source)
            output_text.insert(tk.END, "🎤 Listening...\n")
            output_text.see(tk.END)
            audio = recognizer.listen(source)

        command = recognizer.recognize_google(audio)
        process_command(command)

    except Exception as e:
        error_msg = "⚠️ Sorry, I couldn't process that."
        output_text.insert(tk.END, f"{error_msg}\n")
        print("Error:", e)
        speak(error_msg)

# 🧵 Thread Wrapper
def threaded_listen_and_respond():
    threading.Thread(target=listen_and_respond).start()

# 🎞️ Animate GIF Avatar

def animate_gif(label, gif):
    frames = [ImageTk.PhotoImage(frame.resize((150, 150))) for frame in ImageSequence.Iterator(gif)]

    def update(index):
        frame_image = frames[index]
        label.configure(image=frame_image)
        label.image = frame_image
        index = (index + 1) % len(frames)
        root.after(100, update, index)  # Schedule next frame update after 100ms (adjust speed here)

    update(0)



# 🖥️ GUI Setup
root = tk.Tk()
root.title("Jarvis - A.I. Assistant")
root.configure(bg="#1e1e2f")

# 👤 Avatar
gif = Image.open("avatar.gif")  # Make sure this file exists in the same folder
avatar_label = tk.Label(root, bg="#1e1e2f")
avatar_label.pack(pady=10)
animate_gif(avatar_label, gif)

# 🎙️ Talk Button
talk_button = tk.Button(root, text="🎙️ Talk to Jarvis", command=threaded_listen_and_respond,
                        font=("Arial", 14), bg="#00b4d8", fg="white", relief="flat", padx=10, pady=5)
talk_button.pack(pady=10)

# 💬 Output Console
output_text = scrolledtext.ScrolledText(root, wrap=tk.WORD, width=50, height=15,
                                        font=("Consolas", 12), bg="#282c34", fg="white", insertbackground="white")
output_text.pack(padx=20, pady=10)
output_text.insert(tk.END, "🤖 JARVIS: Hello, What can I help with? \n\n")
output_text.see(tk.END)

#✍️ User Input Feild
input_frame = tk.Frame(root,bg="#1e1e2f")
input_frame.pack(pady=5)

user_entry = tk.Entry(input_frame,font=("Consolas", 12), width=40, bg="#2c2f3a", fg="white", insertbackground="white")
user_entry.pack(side=tk.LEFT, padx=5)

# 📤 Send Button
send_button = tk.Button(input_frame, text="Send", command=lambda: handle_user_input(), bg="#00b4d8", fg="white", font=("Arial", 12), relief="flat")
send_button.pack(side=tk.LEFT, padx=5)
#Define the handle_user_input() function to get the text and pass it to your A.I.
def handle_user_input():
    """global conversation_history"""
    user_text = user_entry.get().strip()
    if user_text:
        user_entry.delete(0, tk.END)
        process_command(user_text)



# 🔊 Startup Greeting
tts_engine.say("Hello SIR, PA Jarvis in service.")
tts_engine.runAndWait()


# 📜 Load previous chat history
if os.path.exists("chat_log.txt"):
    with open("chat_log.txt", "r", encoding="utf-8") as file:
        past_chat = file.read()
    output_text.insert(tk.END, "📜 Previous Chat History:\n" + past_chat + "\n\n")
    output_text.see(tk.END)


# 🚀 Start GUI Loop
root.mainloop()




"""
✅ What's New:
🧠 Key Features:
Memory: Remembers the last 20 (or more) user-Jarvis exchanges and sends them as context.

Persistence: Automatically saves conversations in a chat_log.txt file and loads them when the app starts.

"""
