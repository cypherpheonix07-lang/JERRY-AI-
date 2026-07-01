import os
import webbrowser
from datetime import datetime, timedelta
import json
import tkinter as tk

from features.notes import add_note, delete_note, load_notes
from features.reminders import add_reminder, load_reminders, save_reminders
from features.music import load_music_from, play_music, pause_music, resume_music, stop_music, next_song, shuffle_music
from voice.tts import speak
from api.gemini import model
from core.memory import conversation_history, memo
from core.utils import type_and_speak_text

# define Path to chat log
CHAT_LOG_FILE = os.path.join("DATA", "chat_log.txt")


def process_command(command, output_text):
    command = command.lower()

    # Add user command to conversation history
    conversation_history.append({"user": command, "jarvis": ""})
    # Limit memory to last 20
    if len(conversation_history) > 20:
        conversation_history[:] = conversation_history[-20:]

    # Create context(last 5 interactions)
    context = ""
    for chat in conversation_history[-5:]:  #limit context to last 5 exchanges
        context += f"User: {chat['user']}\nJarvis: {chat['jarvis']}\n"
    #Build Full Prompt
    full_prompt = context + f"User: {command}\nJarvis:"
    #Display user command to GUI
    output_text.insert("end", f"🗣 You said: {command}\n")
    output_text.see("end")

    # Process Known Commands
    if "open youtube" in command:
        reply = "Opening YouTube..."
        webbrowser.open("https://www.youtube.com")

    elif "open google" in command:
        reply = "Opening Google..."
        webbrowser.open("https://www.google.com")

    elif "stop" in command or "exit" in command:
        with open(CHAT_LOG_FILE, "w", encoding="utf-8") as file:
            for item in conversation_history:
                file.write(f"You: {item['user']}\nJarvis: {item['jarvis']}\n\n")
        reply = "Goodbye!"
        output_text.insert("end", f"🤖 Jarvis: {reply}\n")
        speak(reply)
        exit()

    elif "remember that" in command:
        memo["note"] = command.replace("remember that", "").strip()
        reply = f"I'll remember that: {memo['note']}"

    elif "what do you remember" in command or "what did i tell you" in command:
        reply = memo.get("note", "You haven't told me anything to remember yet.")

    elif "play music" in command:
        reply = "Playing your music!" if load_music_from() else "No songs found in your music folder."
        play_music()

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
        with open(CHAT_LOG_FILE, "w", encoding="utf-8") as file:
            for item in conversation_history:
                file.write(f"You: {item['user']}\nJarvis: {item['jarvis']}\n\n")
        reply = "Chat history saved to chat_log.txt."

    elif "add note" in command or "remember this note" in command:
        note = command.replace("add note", "").replace("remember this note", "").strip()
        reply = f"Note added: {note}" if note else "What would you like me to note down?"
        if note:
            add_note(note)

    elif "show notes" in command or "view notes" in command:
        notes = load_notes()
        reply = "Here are your notes:\n" + "\n".join([f"- {n}" for n in notes]) if notes else "No notes found."

    elif "delete note" in command or "remove note" in command:
        note = command.replace("delete note", "").replace("remove note", "").strip()
        reply = f"Deleted note: {note}" if delete_note(note) else "Couldn't find that note to delete."

    elif "remind me to" in command and "in" in command:#reminder handling
        try:
            parts = command.split("remind me to")[1].strip()
            task, time_part = parts.rsplit(" in ", 1)
            delay = int(''.join(filter(str.isdigit, time_part)))    #extract numbers
            add_reminder(task, delay)
            reply = f"Okay, I'll remind you to {task} in {delay} minute(s)."
        except Exception:
            reply = "Sorry, I couldn't understand the reminder format."
    
    elif "view reminders" in command or "show reminders" in command or "list reminders" in command:# view reminders
        reminders = load_reminders()
        if not reminders:
            reply = "You have no reminders set."
        else:
            reply = "Here are your reminders:\n" + "\n".join([f"- {rem['text']} at {rem['time']}" for rem in reminders])

    else:
        try:
            response = model.generate_content(full_prompt)
            reply = response.text.strip()
        except Exception as e:
            print("Gemini Error:", e)
            reply = "Sorry, I couldn't think of a response."

    # Save reply/conversation history in memory
    conversation_history[-1]["jarvis"] = reply
    # add new conversation to log file
    with open(CHAT_LOG_FILE, "a", encoding="utf-8") as file:
        file.write(f"You: {command}\nJarvis: {reply}\n\n")

    # Display reply in GUI
    type_and_speak_text(output_text, reply) ## Step 1:types and speaks the reply in GUI

