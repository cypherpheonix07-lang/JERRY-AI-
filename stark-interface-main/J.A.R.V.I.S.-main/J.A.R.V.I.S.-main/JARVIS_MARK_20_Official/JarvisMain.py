from GUI import init_gui
from GUI.gui_main import launch_gui
from core.utils import ensure_data_files, ensure_gemini_api_key
import time
from video_intro import play_intro_video, stop_intro_video


if __name__ == "__main__":

    play_intro_video()
    ensure_data_files()
    ensure_gemini_api_key()
    
    root=launch_gui()
    #time.sleep(6) # Wait for seconds before starting the GUI
    stop_intro_video() # Stop the intro video before gui screen
    root.mainloop() # Start the GUI main loop



