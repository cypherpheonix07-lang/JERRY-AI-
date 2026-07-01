import customtkinter as ctk
import tkinter as tk
from tkinter import ttk
from tkinter import scrolledtext,END
from PIL import Image, ImageTk, ImageSequence  # Only for avatar file check
#from voice.tts import speak
from voice.stt import threaded_listen_and_respond
import threading
from core.commands import process_command
from core.memory import load_memory,conversation_history, load_conversation_history, save_conversation_history
from voice.stt import start_wake_word_listener, stop_wake_word_listener
from tkinter import Menu , font # for menu bar
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





#for Building a theme setting window
from core.theme_manager import * #save_theme_choice , load_current_theme,apply_theme
from GUI.themes.themes import THEMES



def open_theme_settings():
    theme_window = ctk.CTkToplevel()
    theme_window.title("Choose Theme")
    theme_window.geometry("300x700")

    label = ctk.CTkLabel(theme_window, text="Select a Theme", font=("Arial", 14, "bold"))
    label.pack(pady=10)

    for theme_name in THEMES:
        def select_theme(t=theme_name):
            save_theme_choice(t)              # Save to config
            apply_theme(THEMES[t])            # Apply live
            tk.messagebox.showinfo("Applied", f"Theme '{t}' applied successfully!\nRestart Jarvis to see All the changes.")

        btn = ctk.CTkButton(theme_window, text=theme_name, command=select_theme)
        btn.pack(pady=5)














def sync_tts_switch(tts_switch):
    from core.config import is_tts_enabled
    tts_switch.select() if is_tts_enabled() else tts_switch.deselect()
    tts_switch.configure(text="ON" if is_tts_enabled() else "OFF")



def show_toast(root, message, color="cyan"):
    toast = ctk.CTkLabel(root, text=message, font=("Arial", 14),
                         text_color="white", fg_color=color,
                         corner_radius=10, width=180, height=35)

    # 🧭 Position it bottom right
    toast.place(relx=1.0, rely=1.0, x=-200, y=-60, anchor="se")

    # 🕒 Remove after 2 seconds
    toast.after(2000, toast.destroy)





from api.news import get_newsapi_articles, get_hackernews_articles

def create_news_frame(parent):
    theme = load_current_theme()
    frame = ctk.CTkFrame(parent, fg_color=theme["sidebar_bg"], corner_radius=10, border_width=1.5, border_color=theme["border_glow"])
    frame.pack(side="top", pady=5)

    title = ctk.CTkLabel(frame, text="📰 Tech News", font=("Consolas", 14, "bold"), text_color=theme["text_color"])
    title.pack(pady=(5, 2))

    news_text = ctk.CTkTextbox(frame, height=130, width=280, wrap="word", fg_color=theme["sidebar_bg"], text_color=theme["output_text"])
    news_text.pack(padx=10, pady=5)
    news_text.insert("end", "Loading news...")
    news_text.configure(state="disabled")
    theme_widgets["frames"].append(frame)  # Store the news frame in theme_widgets
    theme_widgets["textboxes"].append(news_text)
    theme_widgets["labels"].append(title)# Store the news text box in theme_widgets

    def refresh_news():
        try:
            articles = get_newsapi_articles()
        except:
            articles = get_hackernews_articles()

        news_text.configure(state="normal")
        news_text.delete("1.0", "end")
        for article in articles:
            news_text.insert("end", article + "\n\n")
        news_text.configure(state="disabled")

        frame.after(60000, refresh_news)  # Auto-refresh every 60 seconds

    refresh_news()
    return frame




#############################################################################################################################

'''
import json
import os

# Create the base container for each box
def toggle_box(content_frame, arrow_label, box_name, state_dict):
    """Toggle the visibility of the content frame with smooth animation."""
    current_state = content_frame.winfo_ismapped()

    if current_state:  # Already visible, collapse it
        content_frame.pack_forget()  # Collapse
        arrow_label.config(text="↓")  # Change arrow to down
        state_dict[box_name] = False  # Save collapsed state
    else:  # Collapsed, expand it
        content_frame.pack(fill="x", pady=5)  # Expand
        arrow_label.config(text="↑")  # Change arrow to up
        state_dict[box_name] = True  # Save expanded state

    # Save state to the config file
    save_state(state_dict)

# Save state in a config file
def save_state(state_dict):
    with open("DATA/state.json", "w") as f:
        json.dump(state_dict, f)

# Load state from file
def load_state():
    if os.path.exists("DATA/state.json"):
        with open("DATA/state.json", "r") as f:
            return json.load(f)
    return {}





def create_collapsible_box(parent, box_name, content_frame):
    """Creates a collapsible box with an arrow for expanding/collapsing."""
    # Frame for each box
    box_frame = tk.Frame(parent, bd=2, relief="solid", padx=10, pady=5)

    # Title bar with collapsible arrow
    title_frame = tk.Frame(box_frame)
    title_frame.pack(fill="x")

    # Add the name/title of the box
    box_title = tk.Label(title_frame, text=box_name, font=("Arial", 14))
    box_title.pack(side="left", anchor="w")

    # Create arrow button to collapse/expand
    arrow_label = tk.Label(title_frame, text="↓", font=("Arial", 12))
    arrow_label.pack(side="right", anchor="e")

    # On-click toggle function for collapse/expand
    arrow_label.bind("<Button-1>", lambda event: toggle_box(content_frame, arrow_label))

    # Add box title to main box
    box_frame.pack(fill="x", pady=5)

    # Return the full box_frame and the content_frame that we want to collapse/expand
    return box_frame, content_frame





# Example of how to use for Tech News Box
def create_tech_news_box(parent, state_dict):
    # Frame for content
    content_frame = tk.Frame(parent)
    tech_news_content = tk.Label(content_frame, text="Tech News will be shown here.", font=("Arial", 12))
    tech_news_content.pack()

    # Create the collapsible box
    box_frame, content_frame = create_collapsible_box(parent, "Tech News", content_frame, state_dict)

    return box_frame, content_frame



def create_stock_update_box(parent, state_dict):
    # Frame for content
    content_frame = tk.Frame(parent)
    stock_content = tk.Label(content_frame, text="Stock Market Updates will be shown here.", font=("Arial", 12))
    stock_content.pack()

    # Create the collapsible box
    box_frame, content_frame = create_collapsible_box(parent, "Stock Market Update", content_frame, state_dict)

    return box_frame, content_frame




'''







































# Initialize customtkinter appearance
def launch_gui():
    #ctk.set_appearance_mode("dark")  # Options: "light", "dark", "system"
    #ctk.set_default_color_theme("green")  # Optional: "blue", "green", etc.
    theme = load_current_theme()
    app = ctk.CTk(fg_color=theme["BG"])# Set the main window background color
    theme_widgets["frames"].append(app)  # Store the main app window in theme_widgets
    app.iconbitmap("assets/jarvis.ico")  # Set the icon for the main window
    root = app
    app.title("J.A.R.V.I.S.  Mark 20 - MADE BY DEVANSH")
    app.geometry("1400x780")
    #app.configure(bg=theme["BG"])#"#0ef028") "#0e8ef0")
    app.configure(fg_color=theme["BG"])



    # Use theme values like:
    # theme["sidebar_bg"], theme["button_color"], etc.

    #sidebar_frame = ctk.CTkFrame(root, fg_color=theme["sidebar_bg"], ...)
    #output_text = ctk.CTkTextbox(root, fg_color=theme["output_bg"], text_color=theme["output_text"], ...)



    # Create a menu bar
    menu_bar = tk.Menu(root)

    # Personal Info Menu
    personal_menu = tk.Menu(menu_bar, tearoff=0,fg="green") # Create a dropdown menu
    personal_menu.add_command(label="Developer: Devansh Sharma", state="disabled")  # Just text, not clickable
    personal_menu.add_separator()
    personal_menu.add_command(label="Our Website", command=lambda: webbrowser.open("https://rootdeveloperds.odoo.com"))
    personal_menu.add_command(label="GitHub", command=lambda: webbrowser.open("https://github.com/RootDeveloperDS"))
    personal_menu.add_command(label="LinkedIn", command=lambda: webbrowser.open("https://www.linkedin.com/in/devanshsharma987"))
    personal_menu.add_command(label="X", command=lambda: webbrowser.open("https://x.com/devanshsha6563"))
    #personal_menu.add_command(label="Instagram", command=lambda: webbrowser.open("https://www.instagram.com/devansh_sharma_987/"))
    personal_menu.add_command(label="Contact Us", command=lambda: webbrowser.open("mailto:developersofroot@gmail.com"))
    menu_bar.add_cascade(label="About Developer", menu=personal_menu)# Add the personal menu to the menu bar
    menu_bar.add_command(label="Theme Settings", command=open_theme_settings)  # Add theme settings option

    # === Jarvis Info Menu ===
    about_menu = tk.Menu(menu_bar, tearoff=0)
    #about_menu.add_command(label="About Jarvis", command=lambda: webbrowser.open("https://yourwebsite.com/about-jarvis"))
    about_menu.add_command(label="Get Source Code", command=lambda: webbrowser.open("https://rootdeveloperds.odoo.com/shop/jarvis-pro-2"))
    about_menu.add_command(label="Version: Mark 20 - Beta", state="disabled")
    menu_bar.add_cascade(label="Jarvis Info", menu=about_menu)


    # Attach the menu bar to the root window
    root.config(menu=menu_bar)

    ##################
    layout_frame = ctk.CTkFrame(root,fg_color=theme["BG"],corner_radius=10,border_width=2,border_color=theme["border_glow"])
    layout_frame.pack(fill="both", expand=True)
    theme_widgets["frames"].append(layout_frame)  # Store the layout frame in theme_widgets
    #####################
    
    #Add a sidebar CTkFrame on the left side of the window
    sidebar_frame = ctk.CTkFrame(layout_frame, width=600,height=200, corner_radius=10,fg_color=theme["sidebar_bg"], # "#0C0F0A"
                                 border_width=2,
                                 border_color=theme["border_glow"]# this will update live
                                 )
    theme_widgets["leftsidebar_frame"].append(sidebar_frame)  # Store the sidebar frame in theme_widgets
    
    sidebar_frame.pack(side="left", fill="y", padx=5, pady=5)
    sidebar_frame.configure(width=400)  # Set the width of the sidebar frame

    '''
    center_frame = ctk.CTkFrame(layout_frame,fg_color=theme["BG"],corner_radius=10,border_width=2,border_color=theme["border_glow"])
    center_frame.pack(side="left", fill="both", expand=True)
    theme_widgets["center_frame"].append(center_frame)  # Store the center frame in theme_widgets

    right_sidebar = ctk.CTkFrame(layout_frame, width=300,height=9, fg_color=theme["sidebar_bg"])
    right_sidebar.pack(side="right", fill="y", padx=5, pady=5,anchor="n")  # Anchor to the top
    right_sidebar.pack_propagate(False)
    theme_widgets["rightsidebar_frame"].append(right_sidebar)  # Store the right sidebar frame in theme_widgets
    '''
    
    
    #################################
    center_frame = ctk.CTkFrame(layout_frame,fg_color="transparent",corner_radius=10,border_width=2,border_color=theme["border_glow"])
    center_frame.pack(side="left", fill="both", expand=True)
    
    # Load faded image if there
    from .helper import get_faded_image
    try:
        bg_image = get_faded_image("assets/backgrounds/jarvis_bg.jpg", size=(1100, 800), opacity=0.5)
    
        # Place image as background using a CTkLabel
        bg_label = ctk.CTkLabel(center_frame, image=bg_image, text="")
        bg_label.place(x=0, y=0, relwidth=1, relheight=1)
    
    except Exception:
        pass
    
    theme_widgets["center_frame"].append(center_frame)  # Store the center frame in theme_widgets
    ###########################




    right_sidebar = ctk.CTkFrame(layout_frame, width=300,height=9, fg_color=theme["sidebar_bg"],
                                 corner_radius=10,border_width=2,border_color=theme["border_glow"])
    right_sidebar.pack(side="right", fill="y", padx=5, pady=5,anchor="n")  # Anchor to the top
    right_sidebar.pack_propagate(False)
    theme_widgets["rightsidebar_frame"].append(right_sidebar)  # Store the right sidebar frame in theme_widgets

    #######################


    # Fill it with dashboard information
    dashboard_title = ctk.CTkLabel(sidebar_frame, text="  Jarvis Dashboard 📊  ", font=("justify", 17, "bold","underline"),text_color=theme["text_color"])
    dashboard_title.pack(pady=(10, 10))
    theme_widgets["labels"].append(dashboard_title)  # Store the title label in theme_widgets

    
    # Mode Display
    current_mode = "Productive"  # You can update this dynamically if you have modes
    mode_label = ctk.CTkLabel(sidebar_frame, text=f"Mode: {current_mode}", font=("Arial", 12),text_color=theme["text_color"])
    mode_label.pack(pady=5)
    theme_widgets["labels"].append(mode_label)  # Store the mode label in theme_widgets

    #tasks done 
    task_count = 0
    task_count_label = ctk.CTkLabel(sidebar_frame, text=f"✅ Tasks Done: {task_count}", font=("Arial", 12),text_color=theme["text_color"])
    task_count_label.pack(pady=5)
    theme_widgets["labels"].append(task_count_label)  # Store the task count label in theme_widgets

    # Active Reminders
    reminders =load_reminders()
    reminder_count_label = ctk.CTkLabel(sidebar_frame, text=f"⏰ Active Reminders: {len(reminders)}", font=("Arial", 12),text_color=theme["text_color"])
    reminder_count_label.pack(pady=5)
    theme_widgets["labels"].append(reminder_count_label)  # Store the reminder count label in theme_widgets

    # Memory Items
    memory = load_memory()
    memory_count_label = ctk.CTkLabel(sidebar_frame, text=f"🧠 Memory Items: {len(memory)}", font=("Arial", 12),text_color=theme["text_color"])
    memory_count_label.pack(pady=5)
    theme_widgets["labels"].append(memory_count_label)  # Store the memory count label in theme_widgets
    
    
    ###############################

    from core.config import is_tts_enabled, toggle_tts

    # 💠 Frame for grouping (optional but clean)
    tts_toggle_frame = ctk.CTkFrame(sidebar_frame, fg_color="transparent")
    #tts_toggle_frame.pack(side="bottom",pady=10,padx=5)
    tts_toggle_frame.place(relx=0.5, rely=1.0, anchor="s", y=-120)  # Place it at the bottom of the sidebar

    # 🔊 Label
    tts_label = ctk.CTkLabel(tts_toggle_frame, text="TTS Voice", font=("Arial", 11))
    tts_label.pack(side="left", padx=5,pady=5)
    theme_widgets["labels"].append(tts_label)  # Store the tts label in theme_widgets

    # 🟢 TTS Switch
    def on_tts_toggle():
        new_state = toggle_tts()
        tts_switch.configure(text="ON" if new_state else "OFF")
        toast_msg = "✅ Voice Enabled 🔊" if new_state else "🔇 Voice Disabled"
        show_toast(root, toast_msg, color="#1e90ff" if new_state else "#444444")

    tts_switch = ctk.CTkSwitch(
        tts_toggle_frame,
        text="ON" if is_tts_enabled() else "OFF",
        command=on_tts_toggle,font=("Arial", 10),
        switch_width=30,
        switch_height=15
    )
    tts_switch.select() if is_tts_enabled() else tts_switch.deselect()
    tts_switch.pack(side="right",padx=5)
    theme_widgets["switches"].append(tts_switch)  # Store the tts switch in theme_widgets
    
    sync_tts_switch(tts_switch)
    
    
    
    
    ###########################
    











    clock_frame = ctk.CTkFrame(
        sidebar_frame,fg_color=theme["sidebar_bg"], 
        border_width=2,border_color=theme["border_glow"], 
        corner_radius=12,width=180,height=60)
    clock_frame.place(relx=0.5, rely=1.0, anchor="s", y=-5)  # bottom-center with small padding,anchor="s" = stick to bottom,y=-5 = lift it 5px up from bottom
    theme_widgets["frames"].append(clock_frame)

    clock_label = ctk.CTkLabel(clock_frame,text="",  # will be filled dynamically,
                               font=("Consolas", 12,"bold"),text_color=theme["text_color"]
                               )
    clock_label.place(relx=0.5, rely=0.5, anchor="center")
    theme_widgets["labels"].append(clock_label)  # Store the clock label in theme_widgets
    
    ########################
    #add a frame for uptime
    uptime_frame = ctk.CTkFrame(
        sidebar_frame,fg_color=theme["sidebar_bg"],border_width=2,border_color="#00FFAA",  # minty green glow
        corner_radius=12,width=180,height=40)
    uptime_frame.place(relx=0.5, rely=1.0, anchor="s", y=-75)  # 15px above clock
    theme_widgets["frames"].append(uptime_frame)

    # add a label for uptime
    uptime_label = ctk.CTkLabel(
        uptime_frame,text="Uptime: 00:00:00",font=("Consolas", 12),text_color="#00FFAA")
    uptime_label.place(relx=0.5, rely=0.5, anchor="center")
    theme_widgets["labels"].append(uptime_label)  # Store the uptime label in theme_widgets

    ##########################
    
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
        fg_color="transparent", hover_color="#00bfff",
        text_color=theme["text_color"], command=refresh_dashboard,
        border_color=theme["text_color"], border_width=1
    )
    refresh_button.pack(pady=10)
    theme_widgets["buttons"].append(refresh_button)  # Store the refresh button in theme_widgets

    # Avatar GIF
    from .avatar import show_avatar #animate_gif
    avatar_label = tk.Label(center_frame, bg=theme["BG"])
    avatar_label.pack(pady=10,side="top")
    #animate_gif(avatar_label, "avatar.gif",root)
    show_avatar(avatar_label, "avatar.gif")      # animated  
    show_avatar(avatar_label, "face.png")        # static image  
    show_avatar(avatar_label, "ai-avatar.jpg")   # jpg supported too
    show_avatar(avatar_label, "ai-avatar.jpeg")  # jpeg supported too
    '''
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
    '''
    # Wake Word Mode Switch 
    def toggle_wake_word():
        global wake_word_mode
        wake_word_mode = not wake_word_mode
        state = "enabled" if wake_word_mode else "disabled"
        speak(f"Wake Word mode {state}")

    #wake_switch = ctk.CTkSwitch(root, text="🗣️ Wake Word: Hey Jarvis", command=toggle_wake_word)
    wake_switch = ctk.CTkSwitch(center_frame,text="🗣️ Wake Word: Jarvis",command=toggle_wake_word,
    #progress_color=theme["toggle_on_color"],fg_color=theme["button_color"],
    button_color=theme["button_color"],text_color=theme["text_color"]
    ) 
    wake_switch.pack(pady=5)
    theme_widgets["switches"].append(wake_switch)  # Store the wake switch in theme_widgets


    # Talk button
    '''talk_button = ctk.CTkButton(root, text="🎙️ Talk to Jarvis", command=lambda: threaded_listen_and_respond(output_text),
                                font=("Arial", 14), corner_radius=50,
                                text_color="black",fg_color="#00ffff",hover_color="#ead915")#you can also use "transparent"'''
    talk_button = ctk.CTkButton(center_frame,text="🎙️ Talk to Jarvis",command=lambda: threaded_listen_and_respond(output_text),font=("Arial", 14),
    corner_radius=50,
    text_color=theme["text_color"],
    fg_color="transparent",     # Transparent background
    hover_color="#002b2b",      # Optional: subtle hover
    border_color=theme["text_color"], # Border color to match theme
    border_width=2              # Border thickness
    )
    talk_button.pack(pady=10, padx=5)
    theme_widgets["buttons"].append(talk_button)  # Store the talk button in theme_widgets



    # Create News Frame       
    news_frame = create_news_frame(right_sidebar)
    news_frame.pack(side="top",anchor="n",pady=0)
    theme_widgets["frames"].append(news_frame)  # Store the news frame in theme_widgets

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    # Outer rounded frame (border)
    output_frame = ctk.CTkFrame(
        center_frame,
        corner_radius=25,
        border_width=2,
        border_color=theme["border_glow"],
        fg_color=theme["output_bg"]  # Set the background color to match the output area
    )
    output_frame.pack(padx=5, pady=5) 
    theme_widgets["frames"].append(output_frame)  # Store the output frame in theme_widgets
    # Configure grid inside frame
    output_frame.grid_rowconfigure(0, weight=1)
    output_frame.grid_columnconfigure(0, weight=1)
    
    # Text widget (replaces ScrolledText)
    output_text =tk.Text(
        output_frame,
        wrap=tk.WORD,
        width=70,
        height=18,
        font= ("Segoe UI", 13), # | "Trebuchet MS", 13 | Cosmic Sans MS", 11
        #font=("Cosmic Sans MS", 11),  # Use a monospaced font for better alignment
        bg=theme["output_bg"],
        fg=theme["output_text"],
        insertbackground=theme["text_color"],
        borderwidth=0,  # No internal border
        highlightthickness=2,# No highlight border
        relief=tk.FLAT,  # No border
        highlightbackground=theme["output_bg"],  # Match background color when not focused
        highlightcolor=theme["output_bg"],  # Match background color when focused
        padx=10,
        pady=10
        )
    output_text.grid(row=0, column=0, sticky="nsew", padx=(10, 0), pady=10)
    #theme_widgets["labels"].append(output_text)  # Store the output text in theme_widgets
    
    
    '''bold_font = font.Font(output_text, output_text.cget("font"))
    bold_font.configure(weight="bold")
    output_text.tag_configure("bold", font=bold_font)'''
    
    
    
    # CustomTkinter Scrollbar
    scrollbar = ctk.CTkScrollbar(output_frame, command=output_text.yview,fg_color=theme["output_bg"],width=10)
    scrollbar.grid(row=0, column=1, sticky="ns", padx=(0, 10), pady=10)
    output_text.configure(yscrollcommand=scrollbar.set)
   
   
    # Margin styling
    output_text.tag_configure("margin", lmargin1=10, lmargin2=10, spacing1=5, spacing3=5,background=theme["output_bg"])
    output_text.insert(END, "🤖 JARVIS: Hello, What can I help with?\n\n", "margin")
    output_text.see(END)
    output_text.update()
    theme_widgets["frames"].append(scrollbar)  # Store the scrollbar in theme_widgets
    
    
    
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

    view_reminders_button = ctk.CTkButton(center_frame, text="📋 View All Reminders", command=view_reminders,
                                      font=("Arial", 12),height=27,width=130, corner_radius=50,text_color=theme["text_color"],fg_color="transparent",hover_color="#002b2b",
                                      border_color=theme["text_color"],border_width=1 
                                      )
    view_reminders_button.pack(pady=10)
    theme_widgets["buttons"].append(view_reminders_button)  # Store the view reminders button in theme_widgets


    # Load chat memory
    load_conversation_history()

    if conversation_history:
        output_text.insert("end", "📜 Previous Chat History:\n")
        for chat in conversation_history:
            output_text.insert("end", f"You: {chat['user']}\nJarvis: {chat['jarvis']}\n\n")
        output_text.see("end")

    # User Input Frame
    input_frame = ctk.CTkFrame(master=center_frame, fg_color=theme["input_bg"], corner_radius=50)#adjust radius as needed
    input_frame.pack(padx=10, pady=10)
    theme_widgets["frames"].append(input_frame)  # Store the input frame in theme_widgets
    
    user_entry = ctk.CTkEntry(input_frame, width=380, height=30, corner_radius=50,
                          font=("Consolas", 14), placeholder_text="Type your command...",
                          text_color="white",#text color while typing
                          fg_color=theme["input_bg"],#background color of entry
                          placeholder_text_color="#4b8897",#placeholder text color
                          border_color="#2E7A9A",#border color of entry
                          border_width=1)  # Adjust width as needed
    user_entry.pack(side=tk.LEFT, padx=6, pady=5)
    theme_widgets["textboxes"].append(user_entry)  # Store the user entry in theme_widgets
    
    # Bind Enter key to trigger the same function as Send button
    def on_enter_pressed(event):
        handle_user_input()

    user_entry.bind("<Return>", on_enter_pressed)
    
    
    # Send Button
    def handle_user_input():
        from voice.stt import detect_language_smart
        user_text = user_entry.get().strip()
        lang = detect_language_smart(user_text)
        if user_text:
            user_entry.delete(0, tk.END)
            process_command(user_text, output_text,language=lang)

    send_button = ctk.CTkButton(input_frame, text="↑ Send ↑", command=handle_user_input,
                            corner_radius=50, width=50, font=("Arial", 12),
                            text_color=theme["text_color"],fg_color="transparent",hover_color="green",
                            border_color=theme["text_color"],border_width=2)  # Adjust width as needed
    send_button.pack(side=tk.LEFT,padx=1, pady=5)
    theme_widgets["buttons"].append(send_button)  # Store the send button in theme_widgets
    
    # Clear Button
    def clear_output():
        output_text.delete(1.0, tk.END)  # Clear the text area 
    clear_output_button = ctk.CTkButton(input_frame, text="Clear", command=clear_output,
                                        corner_radius=50, width=30, font=("Arial", 12),
                                        text_color="black",fg_color=theme["text_color"],hover_color="red")
    clear_output_button.pack(side=tk.LEFT, padx=6, pady=5)
    theme_widgets["buttons"].append(clear_output_button)  # Store the clear button in theme_widgets
    
    
    from api.weather import get_weather

    def create_weather_frame(parent):  
        weather_frame = ctk.CTkFrame(parent, fg_color=theme["sidebar_bg"], corner_radius=10,
                                     border_color=theme["border_glow"], border_width=1.5)
        weather_frame.pack(pady=(10, 10))

        weather_label = ctk.CTkLabel(weather_frame, text="☁️ Loading weather...", font=("Consolas", 12,"bold"),
                                     text_color=theme["text_color"])
        theme_widgets["labels"].append(weather_label)  # Store the weather label in theme_widgets
        weather_label.pack(padx=10, pady=5)

        def update_weather():
            weather_label.configure(text=get_weather())
            weather_frame.after(60000, update_weather)  # Refresh every 60 sec

        update_weather()

        return weather_frame
    
    # Create Weather Frame
    weather_frame = create_weather_frame(sidebar_frame)
    theme_widgets["frames"].append(weather_frame)  # Store the weather frame in theme_widgets
    
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
    speak("Initializing Jarvis")

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
    print("GUI Started")
    return root
    #app.mainloop() # Start the GUI loop
