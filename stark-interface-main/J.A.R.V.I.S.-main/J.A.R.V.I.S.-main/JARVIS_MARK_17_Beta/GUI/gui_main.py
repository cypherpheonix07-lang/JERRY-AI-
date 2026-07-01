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
from voice.stt import start_wake_word_listener, stop_wake_word_listener








# Initialize global variables
wake_word_mode = False #shutsdown trigger if false




# Initialize customtkinter appearance
def launch_gui():
    ctk.set_appearance_mode("dark")  # Options: "light", "dark", "system"
    ctk.set_default_color_theme("green")  # Optional: "blue", "green", etc.
    app = ctk.CTk()
    root = app
    app.title("Jarvis - A.I. Assistant")
    app.geometry("700x700")
    app.configure(bg="#00ffff")

    # Avatar GIF
    avatar_label = tk.Label(root, bg="#1d8d99")
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
    
    # Wake Word Mode Switch 
    def toggle_wake_word():
        global wake_word_mode
        wake_word_mode = not wake_word_mode
        state = "enabled" if wake_word_mode else "disabled"
        speak(f"Wake Word mode {state}")

    wake_switch = ctk.CTkSwitch(root, text="🗣️ Wake Word: Hey Jarvis", command=toggle_wake_word) 
    wake_switch.pack(pady=5)


    # Talk button
    talk_button = ctk.CTkButton(root, text="🎙️ Talk to Jarvis", command=lambda: threaded_listen_and_respond(output_text),
                                font=("Arial", 14), corner_radius=50,text_color="black",fg_color="#00ffff",hover_color="#ead915")#you can also use "transparent"
    talk_button.pack(pady=10, padx=5)

    # Output Console
    output_text = scrolledtext.ScrolledText(app, wrap=tk.WORD, width=50, height=15,
                                        font=("Consolas", 12), bg="#032e0b", fg="yellow", insertbackground="yellow")
    output_text.pack(padx=20, pady=10)
    output_text.insert(tk.END, "🤖 JARVIS: Hello, What can I help with? \n\n")
    output_text.see(tk.END)
    
    
    # View Reminders Button
    from features.reminders import load_reminders

    def view_reminders():
        reminders = load_reminders()
        if not reminders:
            output_text.insert("end", "📋 No reminders found.\n")
        else:
            output_text.insert("end", "📋 Reminders List:\n")
            for reminder in reminders:
                output_text.insert("end", f" - {reminder['text']} at {reminder['time']}\n")
        output_text.see("end")

    view_reminders_button = ctk.CTkButton(root, text="📋 View Reminders", command=view_reminders,
                                      font=("Arial", 12), corner_radius=50,text_color="black",fg_color="#1e90ff",hover_color="#ead915")
    view_reminders_button.pack(pady=10)


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
                            corner_radius=50, font=("Arial", 12),text_color="black",fg_color="#00e5ff",hover_color="green")
    send_button.pack(side=tk.LEFT, padx=5, pady=5)
    
    
    # Clear Button
    def clear_output():
        output_text.delete(1.0, tk.END)  # Clear the text area 
    clear_output_button = ctk.CTkButton(input_frame, text="Clear", command=clear_output,
                                        corner_radius=50, font=("Arial", 12),text_color="black",fg_color="#1e90ff",hover_color="red")
    clear_output_button.pack(side=tk.LEFT, padx=5, pady=5)








    # Temporary placeholder: Greeting only
    from voice.tts import speak
    speak("Initializing Jarvis...")

    # Reminder Checker- constantly check if any reminder is due
    from features.reminders import start_reminder_checker
    start_reminder_checker(output_text)

    #Save Memory on Exit (When closing GUI)
    def on_closing():
        save_conversation_history()
        stop_wake_word_listener()  # Stop background listener if running
        root.destroy()
    root.protocol("WM_DELETE_WINDOW", on_closing)

    
    start_wake_word_listener(output_text, lambda: wake_word_mode) #starts the wake word listner in a separate thread

    
    app.mainloop() # Start the GUI loop


# Animate GIF Avatar
def animate_gif(label, gif_path): #calls the animate_gif function to animate the gif avatar
    try:
        gif = Image.open(gif_path)
        if getattr(gif, "is_animated", False):
            frames = [ImageTk.PhotoImage(frame.resize((150, 150))) for frame in ImageSequence.Iterator(gif)] # resize the gif to 150x150

         
            def update(index):# # Update the label with the next frame
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



