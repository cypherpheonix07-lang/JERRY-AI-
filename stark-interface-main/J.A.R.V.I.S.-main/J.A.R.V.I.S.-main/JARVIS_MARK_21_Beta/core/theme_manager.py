import json, os
from GUI.themes.themes import THEMES

CONFIG_FILE = os.path.join("DATA", "config.json")

def load_current_theme():
    if not os.path.exists(CONFIG_FILE):
        return THEMES["Jarvis Neon"]
    with open(CONFIG_FILE, "r") as f:
        data = json.load(f)
    theme_name = data.get("theme", "Jarvis Neon")
    return THEMES.get(theme_name, THEMES["Jarvis Neon"])

def save_theme_choice(theme_name):
    with open(CONFIG_FILE, "w") as f:
        json.dump({"theme": theme_name}, f, indent=2)
        

theme_widgets = {   #global dictionary to store widgets for each time the theme changes live
    "root": None,
    "frames": [],
    "labels": [],
    "buttons": [],
    "textboxes": [],
    "switches": [],
    "center_frame":[],
    "rightsidebar_frame": [],
    "leftsidebar_frame": []
}


def apply_theme(theme):
    for frame in theme_widgets["frames"]:
        frame.configure(fg_color=theme["sidebar_bg"])
    
    for label in theme_widgets["labels"]:
        #label.configure(text_color=theme["text_color"])
        try:
            label.configure(text_color=theme["text_color"])
        except Exception as e:
            print(f"Skipping label update: {e}")
    
    for button in theme_widgets["buttons"]:
        button.configure(text_color=theme["text_color"], border_color=theme["border_glow"])
    
    for textbox in theme_widgets["textboxes"]:
        textbox.configure(fg_color=theme["output_bg"], text_color=theme["output_text"])
        
    for switches in theme_widgets["switches"]:
        switches.configure(button_color=theme["button_color"], text_color=theme["text_color"])
        
    for leftsidebar_frame in theme_widgets["leftsidebar_frame"]:
        leftsidebar_frame.configure(fg_color=theme["sidebar_bg"], border_color=theme["border_glow"])
        
    for rightsidebar_frame in theme_widgets["rightsidebar_frame"]:
        rightsidebar_frame.configure(fg_color=theme["sidebar_bg"])
        
    for center_frame in theme_widgets["center_frame"]:
        center_frame.configure(fg_color=theme["BG"], border_color=theme["border_glow"])  