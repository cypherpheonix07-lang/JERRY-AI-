# GUI/themes/themes.py

THEMES = {
    "Cyber Blue": {
        "sidebar_bg": "#0F111A",
        "BG": "#0F111A",
        "text_color": "#B2F5EA",
        "button_color": "#00CFFF",
        "output_bg": "#121212",
        "output_text": "#00FFFF",
        "time_display_color": "#66FFFF",# For clock/uptime text
        "toggle_on_color": "#00D9FF",   # Toggle active
        "border_glow": "#00EFFF",
        "input_bg": "#07212b"
    },

    "Hacker Green": {
        "sidebar_bg": "#000000",
        "BG": "#000000",
        "text_color": "#00FF00",
        "button_color": "#1EFF00",
        "output_bg": "#0A0A0A",
        "output_text": "#00FF00",
        "time_display_color": "#66FFFF",# For clock/uptime text
        "toggle_on_color": "#00D9FF",   # Toggle active
        "border_glow": "#00FF00",
        "input_bg": "#041f02"       # Input background color
    },

    "Plasma Dark": {
        "sidebar_bg": "#1B0A2A",
        "BG": "#1B0A2A",
        "text_color": "#E1E1FF",
        "button_color": "#BB86FC",
        "output_bg": "#101820",
        "output_text": "#F5F5F5",
        "time_display_color": "#66FFFF",
        "toggle_on_color": "#00D9FF",   # Toggle active
        "border_glow": "#E1E1FF",
        "input_bg": "white"
    },

    "Neon": {
        "sidebar_bg": "#0D1117",        # Background Dark Theme
        "BG": "#0D1117",        # Background Dark Theme
        "text_color": "#00F0FF",        # Neon Blue for labels and icons
        "button_color": "#00B4CC",      # Glow Button
        "output_bg": "#0B0C10",         # Slightly different dark background
        "output_text": "#00FF66",       # Console Output Green
        "time_display_color": "#66FFFF",# For clock/uptime text
        "toggle_on_color": "#00D9FF",   # Toggle active
        "border_glow": "#00EFFF",        # Optional glowing border effect
        "input_bg": "#07212b"
    },
    
    "Jarvis Neon": {
        "sidebar_bg": "#061115",        # side Background Dark Theme.
        "BG": "#09171C",                # full Background Dark Theme.
        "text_color": "#5BF7FD",        # Neon Blue for labels and icons.
        "button_color": "#00B6FB",      # Glow Button.
        "output_bg": "#020E11",         # Slightly different dark background.
        "output_text": "#72F140",       # Console Output Green.
        "time_display_color": "#00EFFF",# For clock/uptime text.
        "toggle_on_color": "#00D9FF",   # Toggle active
        "border_glow": "#56F6FF" ,       # Optional glowing and border effect.
        "input_bg": "#07212b"
    },

    "Cyberpunk": {
        "sidebar_bg": "#2C3E50",           # Dark Grey-Blue
        "BG": "#1A1D23",                   # Dark Grey
        "text_color": "#FF69B4",           # Hot Pink
        "button_color": "#34A8FF",         # Bright Blue
        "output_bg": "#1A1D23",            # Dark Grey
        "output_text": "#F7DC6F",          # Bright Yellow
        "time_display_color": "#8BC34A",   # Light Green
        "toggle_on_color": "#FFC107",      # Warm Orange
        "border_glow": "#FF69B4",          # Hot Pink
        "input_bg": "#2C3E50"              # Dark Grey-Blue
    },

    "Aurora": {
        "sidebar_bg": "#3B3F54",           # Dark Purple-Grey
        "BG": "#232635",                   # Dark Blue-Grey
        "text_color": "#64D9F7",           # Soft Aqua
        "button_color": "#7A288A",         # Deep Purple
        "output_bg": "#232635",            # Dark Blue-Grey
        "output_text": "#C9E4CA",          # Pale Green
        "time_display_color": "#64D9F7",   # Soft Aqua
        "toggle_on_color": "#7A288A",      # Deep Purple
        "border_glow": "#64D9F7",          # Soft Aqua
        "input_bg": "#3B3F54"              # Dark Purple-Grey
    },

    "Matrix": {
        "sidebar_bg": "#0B610B",           # Dark Green
        "BG": "#032B44",                   # Dark Navy Blue
        "text_color": "#33CC33",           # Bright Green
        "button_color": "#008000",         # Green
        "output_bg": "#032B44",            # Dark Navy Blue
        "output_text": "#33CC33",          # Bright Green
        "time_display_color": "#66D9EF",   # Pale Green-Blue
        "toggle_on_color": "#008000",      # Green
        "border_glow": "#33CC33",          # Bright Green
        "input_bg": "#0B610B"              # Dark Green
    },

    "Jarvis Circuit": {
        "sidebar_bg": "#1A1D23",           # Dark Grey
        "BG": "#232635",                   # Dark Blue-Grey
        "text_color": "#FF3737",           # Neon Red
        "button_color": "#34C759",         # Bright Green
        "output_bg": "#1A1D23",            # Dark Grey
        "output_text": "#8BC34A",          # Light Green
        "time_display_color": "#FFC107",   # Warm Orange
        "toggle_on_color": "#34C759",      # Bright Green
        "border_glow": "#FF3737",          # Neon Red
        "input_bg": "#232635"              # Dark Blue-Grey
    },

    "Jarvis Neon Circuit": {
        "sidebar_bg": "#061115",           # Dark Navy Blue
        "BG": "#09171C",                   # Dark Teal Blue
        "text_color": "#5BF7FD",           # Neon Blue
        "button_color": "#FF3737",         # Neon Red
        "output_bg": "#020E11",            # Very Dark Navy Blue
        "output_text": "#72F140",          # Bright Green
        "time_display_color": "#00EFFF",   # Bright Cyan
        "toggle_on_color": "#34C759",      # Bright Green
        "border_glow": "#FF3737",          # Neon Red
        "input_bg": "#07212b"              # Dark Blue-Grey
    },
    "Jarvis Neon Red": {
        "sidebar_bg": "#061115",           # Sidebar Background: Dark Navy Blue (unchanged)
        "BG": "#09171C",                   # Full Background: Dark Teal Blue (unchanged)
        "text_color": "#FF3737",           # Neon Red for labels and icons (changed from Neon Blue)
        "button_color": "#FF1F1F",         # Bright Neon Red Button (stronger red)
        "output_bg": "#020E11",            # Output Background: Very Dark Navy Blue (unchanged)
        "output_text": "#FF6B6B",          # Output Text: Soft Neon Red/Coral
        "time_display_color": "#FF4C4C",   # Time Display Color: Bright Red-Cyan blend
        "toggle_on_color": "#FF3737",      # Toggle On Color: Neon Red (strong)
        "border_glow": "#FF3737",          # Border Glow: Neon Red (glowing effect)
        "input_bg": "#07212b"              # Input Background: Dark Blue-Grey (unchanged)
    },
    "Jarvis CyberCore": {
        "sidebar_bg": "#01060A",           # Ultra-dark sidebar
        "BG": "#0B0F0F",                   # Deep black background with tech glow
        "text_color": "#1EF07A",           # Bright neon green for text/icons
        "button_color": "#FF4500",         # Bold orange-red buttons
        "output_bg": "#00070B",            # Slightly dimmed black for console
        "output_text": "#F84C4C",          # Orange-red output text
        "time_display_color": "#00FFB3",   # Cyan glow for clock/uptime
        "toggle_on_color": "#FF6B00",      # Neon orange toggle
        "border_glow": "#FF3C00",          # Intense glow orange for outlines
        "input_bg": "#031013"              # Muted dark teal input field
    },
    "Jarvis Red Circuit" : {
        "sidebar_bg": "#1a0000",           # Deep red-black for side background
        "BG": "#0d0000",                   # Very dark red-black main background
        "text_color": "#FF4C4C",           # Bright neon red text for labels/icons
        "button_color": "#FF0000",         # Glowing red for buttons
        "output_bg": "#140000",            # Slightly brighter dark red for output
        "output_text": "#FF5F5F",          # Soft red for output text
        "time_display_color": "#FF3D3D",   # Time & clock neon red
        "toggle_on_color": "#FF1A1A",      # Toggle active color in red
        "border_glow": "#FF6666",          # Soft glowing red borders
        "input_bg": "#240000"              # Dark red for input box
    },
    "Visar Edge": {
        "sidebar_bg": "#040709",             # Ultra-dark sidebar background (near black-blue)
        "BG": "#010305",                     # Full background, deep cyber black
        "text_color": "#00F0FF",             # Cyan neon for text/icons
        "button_color": "#FF4E2A",           # Orange-red for active buttons
        "output_bg": "#060A0E",              # Console output darker shade
        "output_text": "#FF625B",            # Soft neon orange for Jarvis replies
        "time_display_color": "#00FFE6",     # Bright cyan for clocks/uptime
        "toggle_on_color": "#FF4D2E",        # Toggle active (glow red-orange)
        "border_glow": "#00E6FF",            # Cyan glow for outlines/borders
        "input_bg": "#071216"               # Input field (subtle dark teal)
    },
    "JarvisModernUI": {
        "sidebar_bg": "#1A1C21",           # Dark graphite side panel
        "BG": "#121318",                   # Main background (deep blackish gray)
        "text_color": "#C6CCF7",           # Soft lavender for text/icons
        "button_color": "#C98DFF",         # Light purple-pink glowing buttons
        "output_bg": "#191B22",           # Slight contrast from BG for console/chat
        "output_text": "#A9F1F7",          # Cool cyan for output text
        "time_display_color": "#EFAEFF",   # Clock/uptime in soft violet-pink
        "toggle_on_color": "#D77DFE",      # Toggle active: pastel purple
        "border_glow": "#605DFF",          # Elegant neon indigo-blue for borders
        "input_bg": "#20242B"              # Muted deep blue-gray for entry/input
    },
    "JarvisGlassOS": {
        "sidebar_bg": "#1F1F1F80",         # Semi-transparent dark for sidebar
        "BG": "#0D0D0DCC",                 # Almost black glass background with opacity
        "text_color": "#FFFFFFCC",        # Slightly transparent white text
        "button_color": "#98C1FF",        # Soft blue button, icy feel
        "output_bg": "#26262680",         # Console with frosted overlay effect
        "output_text": "#D3F8FF",         # Light cyan for output
        "time_display_color": "#B6F0FF",  # Cool bluish neon for time/clock
        "toggle_on_color": "#66E0FFFF",     # Frosted toggle blue
        "border_glow": "#00FFFF99",       # Glass glow cyan tint
        "input_bg": "#1A1A1A99"           # Slightly transparent input box
    }
            
    
}
        
    