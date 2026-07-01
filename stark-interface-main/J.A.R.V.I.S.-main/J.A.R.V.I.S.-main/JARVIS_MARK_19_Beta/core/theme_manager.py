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
    "textboxes": []
}


def apply_theme(theme):
    for frame in theme_widgets["frames"]:
        frame.configure(fg_color=theme["sidebar_bg"])
    
    for label in theme_widgets["labels"]:
        label.configure(text_color=theme["text_color"])
    
    for button in theme_widgets["buttons"]:
        button.configure(fg_color=theme["button_color"], hover_color=theme["button_color"])
    
    for textbox in theme_widgets["textboxes"]:
        textbox.configure(fg_color=theme["output_bg"], text_color=theme["output_text"])