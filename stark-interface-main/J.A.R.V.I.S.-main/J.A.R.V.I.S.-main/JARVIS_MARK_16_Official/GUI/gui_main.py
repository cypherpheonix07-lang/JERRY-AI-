import customtkinter as ctk
import tkinter as tk
from tkinter import ttk
from tkinter import scrolledtext
from PIL import Image, ImageTk, ImageSequence  # Only for avatar file check
#from voice.tts import speak
from voice.stt import threaded_listen_and_respond
from .avatar import animate_gif
import threading
from core.commands import process_command
from core.memory import conversation_history, load_conversation_history, save_conversation_history



'''from datetime import datetime, timedelta 
import time
from tkinter import simpledialog, messagebox
'''







'''
# Thread Wrapper
def threaded_listen_and_respond():
    threading.Thread(target=listen_and_respond).start()'''


# Initialize customtkinter appearance
def launch_gui():
    ctk.set_appearance_mode("dark")  # Options: "light", "dark", "system"
    ctk.set_default_color_theme("green")  # Optional: "blue", "green", etc.
    app = ctk.CTk()
    root = app
    app.title("Jarvis - A.I. Assistant")
    app.geometry("550x560")
    app.configure(bg="#00ffff")

    # Avatar GIF
    avatar_label = tk.Label(root, bg="#1e1e2f")
    avatar_label.pack(pady=10)
    animate_gif(avatar_label, "avatar.gif")

    # Theme toggle
    def toggle_theme():
        current_mode = ctk.get_appearance_mode()
        if current_mode == "Dark":
            ctk.set_appearance_mode("light")
            theme_switch.configure(text="Light Mode")
        else:
            ctk.set_appearance_mode("dark")
            theme_switch.configure(text="Dark Mode")

    # Theme toggle switch
    theme_switch = ctk.CTkSwitch(app, text="Dark Mode", command=toggle_theme)
    theme_switch.select()   # Start in Dark Mode
    theme_switch.pack(pady=10)

    # Talk button
    talk_button = ctk.CTkButton(root, text="🎙️ Talk to Jarvis", command=lambda: threaded_listen_and_respond(output_text),
                                font=("Arial", 14), corner_radius=50)
    talk_button.pack(pady=10, padx=5)

    # Output Console
    output_text = scrolledtext.ScrolledText(app, wrap=tk.WORD, width=50, height=15,
                                        font=("Consolas", 12), bg="#282c34", fg="white", insertbackground="white")
    output_text.pack(padx=20, pady=10)
    output_text.insert(tk.END, "🤖 JARVIS: Hello, What can I help with? \n\n")
    output_text.see(tk.END)

    # Load chat memory
    load_conversation_history()

    if conversation_history:
        output_text.insert("end", "📜 Previous Chat History:\n")
        for chat in conversation_history:
            output_text.insert("end", f"You: {chat['user']}\nJarvis: {chat['jarvis']}\n\n")
        output_text.see("end")

    # User Input Frame
    input_frame = ctk.CTkFrame(master=root, fg_color="#3e3057", corner_radius=50)#adjust radius as needed
    input_frame.pack(padx=20, pady=20)

    user_entry = ctk.CTkEntry(input_frame, width=300, height=30, corner_radius=50,
                          font=("Consolas", 14), placeholder_text="Type your command...")
    user_entry.pack(side=tk.LEFT, padx=5, pady=5)

    # Send Button
    def handle_user_input():
        user_text = user_entry.get().strip()
        if user_text:
            user_entry.delete(0, tk.END)
            process_command(user_text, output_text)##################check#####################

    send_button = ctk.CTkButton(input_frame, text="Send", command=handle_user_input,
                            corner_radius=50, font=("Arial", 12))
    send_button.pack(side=tk.LEFT, padx=5, pady=5)






    # Temporary placeholder: Greeting only
    from voice.tts import speak
    speak("Initializing Jarvis...")

    # Reminder Checker- constantly check if any reminder is due
    from features.reminders import start_reminder_checker
    start_reminder_checker(output_text)

    #Save Memory on Exit (When closing GUI)
    def on_closing():
        save_conversation_history()
        root.destroy()
    root.protocol("WM_DELETE_WINDOW", on_closing)

    
    app.mainloop()


# Animate GIF Avatar
def animate_gif(label, gif_path):
    try:
        gif = Image.open(gif_path)
        if getattr(gif, "is_animated", False):
            frames = [ImageTk.PhotoImage(frame.resize((150, 150))) for frame in ImageSequence.Iterator(gif)]

         
            def update(index):
                app = ctk.CTk()
                frame_image = frames[index]
                label.configure(image=frame_image)
                label.image = frame_image
                index = (index + 1) % len(frames)
                app.after(100, update, index)  # Schedule next frame update after 100ms

            update(0)
        else:
            img = ImageTk.PhotoImage(gif.resize((150, 150)))
            label.configure(image=img)
            label.image = img
            
    except Exception as e:
        print(f"⚠️ Avatar load error: {e}")
        label.configure(text="No Avatar 😢")


