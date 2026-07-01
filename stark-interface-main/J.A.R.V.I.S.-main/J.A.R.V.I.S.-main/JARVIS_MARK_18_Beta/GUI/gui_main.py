import customtkinter as ctk
import tkinter as tk
from tkinter import ttk
from tkinter import scrolledtext
from PIL import Image, ImageTk, ImageSequence  # Only for avatar file check
#from voice.tts import speak
from voice.stt import threaded_listen_and_respond
import threading
from core.commands import process_command
from core.memory import load_memory,conversation_history, load_conversation_history, save_conversation_history
from voice.stt import start_wake_word_listener, stop_wake_word_listener
from tkinter import Menu # for menu bar
import webbrowser #to open links in browser
from features.reminders import load_reminders, start_reminder_checker
from datetime import datetime


import time
start_time = time.time()#Define the Start Time for Uptime
# Uptime function to calculate the time since the program started

import colorsys
hue = 0  # Global hue value for color cycling in border color
    
    




# Initialize global variables
wake_word_mode = False #shutsdown trigger if false




# Initialize customtkinter appearance
def launch_gui():
    ctk.set_appearance_mode("dark")  # Options: "light", "dark", "system"
    ctk.set_default_color_theme("green")  # Optional: "blue", "green", etc.
    app = ctk.CTk()
    root = app
    app.title("J.A.R.V.I.S.  Mark 18 - MADE BY DEVANSH")
    app.geometry("800x700")
    app.configure(bg="#11161A")
    

    # Create a menu bar
    menu_bar = tk.Menu(root)

    # Personal Info Menu
    personal_menu = tk.Menu(menu_bar, tearoff=0) # Create a dropdown menu
    personal_menu.add_command(label="Developer: Devansh Sharma", state="disabled")  # Just text, not clickable
    personal_menu.add_separator()
    personal_menu.add_command(label="GitHub", command=lambda: webbrowser.open("https://github.com/RootDeveloperDS"))
    personal_menu.add_command(label="LinkedIn", command=lambda: webbrowser.open("https://www.linkedin.com/in/devanshsharma987"))
    #personal_menu.add_command(label="YouTube", command=lambda: webbrowser.open("https://youtube.com/@yourchannel"))
    #personal_menu.add_command(label="Instagram", command=lambda: webbrowser.open("https://www.instagram.com/devansh_sharma_987/"))
    personal_menu.add_command(label="X", command=lambda: webbrowser.open("https://x.com/devanshsha6563"))
    personal_menu.add_command(label="Contact Us", command=lambda: webbrowser.open("developersofroot@gmail.com"))
    menu_bar.add_cascade(label="About Developer", menu=personal_menu)# Add the personal menu to the menu bar

    # === Jarvis Info Menu ===
    about_menu = tk.Menu(menu_bar, tearoff=0)
    #about_menu.add_command(label="About Jarvis", command=lambda: webbrowser.open("https://yourwebsite.com/about-jarvis"))
    about_menu.add_command(label="Version: Mark 18 - Beta", state="disabled")
    menu_bar.add_cascade(label="Jarvis Info", menu=about_menu)


    # Attach the menu bar to the root window
    root.config(menu=menu_bar)

    ##################
    #Add a sidebar CTkFrame on the left side of the window
    sidebar_frame = ctk.CTkFrame(root, width=900,height=200, corner_radius=10,fg_color="#0C0F0A",border_width=2,
                                 border_color="#00FFFF"# this will update live
                                 )
    sidebar_frame.pack(side="left", fill="y", padx=5, pady=5)
    #sidebar_frame.place(x=0, y=0)
    sidebar_frame.configure(width=400)  # Set the width of the sidebar frame
    #sidebar_frame.configure(bg="#11161A")  # Set the background color to match the main window


    # Fill it with dashboard information
    dashboard_title = ctk.CTkLabel(sidebar_frame, text="  Jarvis Dashboard 📊  ", font=("justify", 17, "bold","underline"))
    dashboard_title.pack(pady=(10, 10))

    
    # Mode Display
    current_mode = "Productive"  # You can update this dynamically if you have modes
    mode_label = ctk.CTkLabel(sidebar_frame, text=f"Mode: {current_mode}", font=("Arial", 12))
    mode_label.pack(pady=5)

    #tasks done 
    task_count = 0
    task_count_label = ctk.CTkLabel(sidebar_frame, text=f"✅ Tasks Done: {task_count}", font=("Arial", 12))
    task_count_label.pack(pady=5)

    # Active Reminders
    reminders =load_reminders()
    reminder_count_label = ctk.CTkLabel(sidebar_frame, text=f"⏰ Active Reminders: {len(reminders)}", font=("Arial", 12))
    reminder_count_label.pack(pady=5)

    # Memory Items
    memory = load_memory()
    memory_count_label = ctk.CTkLabel(sidebar_frame, text=f"🧠 Memory Items: {len(memory)}", font=("Arial", 12))
    memory_count_label.pack(pady=5)

    clock_frame = ctk.CTkFrame(
        sidebar_frame,fg_color="#121212",  # dark background for contrast
        border_width=2,border_color="#00FFFF",  # cyan glow border
        corner_radius=12,width=180,height=60)
    clock_frame.place(relx=0.5, rely=1.0, anchor="s", y=-5)  # bottom-center with small padding,anchor="s" = stick to bottom,y=-5 = lift it 5px up from bottom


    clock_label = ctk.CTkLabel(clock_frame,text="",  # will be filled dynamically,
                               font=("Consolas", 12,"bold"),text_color="#00FFFF"  # Cyan glows!
                               )
    clock_label.place(relx=0.5, rely=0.5, anchor="center")

    #add a frame for uptime
    uptime_frame = ctk.CTkFrame(
        sidebar_frame,fg_color="#121212",border_width=2,border_color="#00FFAA",  # minty green glow
        corner_radius=12,width=180,height=40)
    uptime_frame.place(relx=0.5, rely=1.0, anchor="s", y=-75)  # 15px above clock

    # add a label for uptime
    uptime_label = ctk.CTkLabel(
        uptime_frame,text="Uptime: 00:00:00",font=("Consolas", 12),text_color="#00FFAA")
    uptime_label.place(relx=0.5, rely=0.5, anchor="center")

    
    # Optional: Refresh Button
    def refresh_dashboard():
        reminder_count_label.configure(text=f"⏰ Active Reminders: {len(load_reminders())}")
        memory_count_label.configure(text=f"🧠 Memory Items: {len(load_memory())}")
        # Call again after 5,000 ms (5 seconds)
        root.after(5000, refresh_dashboard)  # you can change interval here
    refresh_dashboard()  # starts the loop to refresh dashboard every 5 seconds
    
    # Refresh Button
    refresh_button = ctk.CTkButton(
        sidebar_frame, text="🔁 Refresh", font=("Arial", 11),
        height=28, width=120, corner_radius=20,
        fg_color="#1e90ff", hover_color="#00bfff",
        text_color="white", command=refresh_dashboard
    )
    refresh_button.pack(pady=10)

    # Avatar GIF
    from .avatar import animate_gif
    avatar_label = tk.Label(root, bg="#1d8d99")
    avatar_label.pack(pady=10)
    animate_gif(avatar_label, "avatar.gif",root)

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
    output_text.pack(padx=10, pady=10)
    output_text.insert(tk.END, "🤖 JARVIS: Hello, What can I help with? \n\n")
    output_text.see(tk.END)
    
    
    # View Reminders Button

    def view_reminders():
        reminders = load_reminders()
        if not reminders:
            output_text.insert("end", "📋 No reminders found.\n")
        else:
            output_text.insert("end", "📋 Reminders List:\n")
            for reminder in reminders:
                output_text.insert("end", f" - {reminder.get('task') or reminder.get('text')} at {reminder['time']}\n")
        output_text.insert("end", "\n")# Add a newline after the reminders list
        output_text.see("end")# Scroll to the end of the text area

    view_reminders_button = ctk.CTkButton(root, text="📋 View All Reminders", command=view_reminders,
                                      font=("Arial", 12),height=25,width=130, corner_radius=50,text_color="black",fg_color="#1e90ff",hover_color="#ead915")
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
    input_frame.pack(padx=10, pady=10)

    user_entry = ctk.CTkEntry(input_frame, width=380, height=30, corner_radius=50,
                          font=("Consolas", 14), placeholder_text="Type your command...")
    user_entry.pack(side=tk.LEFT, padx=6, pady=5)

    # Send Button
    def handle_user_input():
        user_text = user_entry.get().strip()
        if user_text:
            user_entry.delete(0, tk.END)
            process_command(user_text, output_text)

    send_button = ctk.CTkButton(input_frame, text="↑ Send ↑", command=handle_user_input,
                            corner_radius=50, width=70, font=("Arial", 12),text_color="black",fg_color="#00e5ff",hover_color="green")
    send_button.pack(side=tk.LEFT,padx=1, pady=5)
    
    
    # Clear Button
    def clear_output():
        output_text.delete(1.0, tk.END)  # Clear the text area 
    clear_output_button = ctk.CTkButton(input_frame, text="Clear", command=clear_output,
                                        corner_radius=50, width=20, font=("Arial", 12),text_color="black",fg_color="#1e90ff",hover_color="red")
    clear_output_button.pack(side=tk.LEFT, padx=6, pady=5)

    # for sidebar clock 
    def update_clock():
        now = datetime.now()
        time_str = now.strftime("%I:%M:%S %p\n %A, %B %d, %Y")
        clock_label.configure(text=time_str)
        root.after(1000, update_clock)  # update every second
    update_clock()

    #Create the function to update uptime
    def update_uptime():
        elapsed = int(time.time() - start_time)
        hours = elapsed // 3600
        minutes = (elapsed % 3600) // 60
        seconds = elapsed % 60
        uptime_label.configure(text=f"Uptime: {hours:02}:{minutes:02}:{seconds:02}")
        root.after(1000, update_uptime)
        
    # RGB animation function to your code
    def rgb_cycle():
        global hue
        hue += 0.005
        if hue > 1:
            hue = 0
        # Convert HSV to RGB
        r, g, b = colorsys.hsv_to_rgb(hue, 1, 1)
        hex_color = '#%02x%02x%02x' % (int(r*255), int(g*255), int(b*255))

        sidebar_frame.configure(border_color=hex_color)
        root.after(100, rgb_cycle)  # update every 50ms for smooth RGB





    # Temporary placeholder: Greeting only
    from voice.tts import speak
    speak("Initializing Jarvis...")

    # Reminder Checker- constantly check if any reminder is due
    start_reminder_checker(output_text)

    #Save Memory on Exit (When closing GUI)
    def on_closing():
        save_conversation_history()
        stop_wake_word_listener()  # Stop background listener if running
        root.destroy()
    root.protocol("WM_DELETE_WINDOW", on_closing)

    
    start_wake_word_listener(output_text, lambda: wake_word_mode) #starts the wake word listner in a separate thread
    rgb_cycle()# Start the RGB animation loop

    update_uptime()# Start the uptime update loop
    app.mainloop() # Start the GUI loop



