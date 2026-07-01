# video_intro.py
'''import cv2
import threading
import time
import numpy as np

play_video = False
video_thread = None
fade_out = None

def play_intro_video(path="assets/intro.mp4"):
    print("Loading intro video...")
    global play_video, video_thread
    if play_video:
        return

    play_video = True
    fade_out = False

    def _play():
        cap = cv2.VideoCapture(path)
        if not cap.isOpened():
            print("❌ Could not open intro video.")
            return

        #cv2.namedWindow("Intro", cv2.WND_PROP_FULLSCREEN)
        #cv2.setWindowProperty("Intro", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
        # No fullscreen
        cv2.namedWindow("Intro", cv2.WINDOW_NORMAL)
        cv2.resizeWindow("Intro", 1280, 720)  # Manually resize

        fps = cap.get(cv2.CAP_PROP_FPS)
        delay = 0.5 / fps

        while play_video:
            ret, frame = cap.read()
            if not ret:
                break
            
            # 🔥 If fade-out requested, perform fade-out frames
            if fade_out:
                for alpha in np.linspace(1, 0, int(fps * 1.2)):  # ~1.2 sec fade
                    black = np.zeros_like(frame)
                    faded = cv2.addWeighted(frame, alpha, black, 1 - alpha, 0)
                    cv2.imshow("Intro", faded)
                    if cv2.waitKey(delay) == 27:
                        break
                break  # Exit after fade
            
            cv2.imshow("Intro", frame)
            if cv2.waitKey(int(1000 / fps)) == 27:
                break
            #if cv2.waitKey(1) == 27:
             #   break
            #time.sleep(delay)

        cap.release()
        cv2.destroyAllWindows()

    video_thread = threading.Thread(target=_play)
    video_thread.daemon = True # Make sure it exits with main program
    video_thread.start()

def stop_intro_video():
    global play_video, video_thread, fade_out
    if play_video:
        play_video = False
        fade_out = True
        if video_thread and video_thread.is_alive():
            video_thread.join()
    print(f"intro stopped at {time.ctime()}")'''
    
    
    

# video_intro.py

import cv2
import threading
import time
import numpy as np
import ctypes

play_video = False
fade_out = False
video_thread = None

def play_intro_video(path="assets/intro.mp4"):
    global play_video, video_thread, fade_out
    print(f"🔄 Loading intro video...at {time.ctime()}")

    if play_video:
        return

    play_video = True
    fade_out = False

    def _play():
        cap = cv2.VideoCapture(path)
        if not cap.isOpened():
            print("❌ Could not open intro video.")
            return

        fps = cap.get(cv2.CAP_PROP_FPS)
        delay = int(1000 / fps)

        width = int( int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) /1.0 )
        height =int( int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) /1.0 )

        # Create centered, borderless window
        cv2.namedWindow("Intro", cv2.WINDOW_NORMAL)
        cv2.resizeWindow("Intro", width, height)

        screen_width = ctypes.windll.user32.GetSystemMetrics(0)
        screen_height = ctypes.windll.user32.GetSystemMetrics(1)
        x = (screen_width - width) // 2
        y = (screen_height - height) // 2
        cv2.moveWindow("Intro", x, y)

        # Remove borders/title bar
        hwnd = ctypes.windll.user32.FindWindowW(None, "Intro")
        GWL_STYLE = -16
        WS_POPUP = 0x80000000
        ctypes.windll.user32.SetWindowLongW(hwnd, GWL_STYLE, WS_POPUP)
        ctypes.windll.user32.SetWindowPos(hwnd, None, x, y, width, height, 0x0040)

        overlay_text = "Press ESC to close"
        start_time = time.time()

        while play_video:
            ret, frame = cap.read()
            if not ret:
                break

            elapsed = time.time() - start_time

            # 🖋️ Only show overlay in first 3 seconds
            if elapsed < 5:
                text_size, _ = cv2.getTextSize(overlay_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
                text_x = frame.shape[1] - text_size[0] - 20
                text_y = frame.shape[0] - 20

                overlay = frame.copy()
                cv2.putText(
                    overlay,
                    overlay_text,
                    (text_x, text_y),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 255, 255),
                    1,
                    cv2.LINE_AA
                )
                frame = cv2.addWeighted(overlay, 0.4, frame, 0.6, 0)

            if fade_out:
                for alpha in np.linspace(1, 0, int(fps * 1.2)):
                    black = np.zeros_like(frame)
                    faded = cv2.addWeighted(frame, alpha, black, 1 - alpha, 0)
                    cv2.imshow("Intro", faded)
                    if cv2.waitKey(delay) == 27:
                        break
                break

            cv2.imshow("Intro", frame)
            key = cv2.waitKey(delay)
            if key == 27:
                print("⏩ Intro skipped by user.")
                break

        cap.release()
        cv2.destroyAllWindows()

    video_thread = threading.Thread(target=_play)
    video_thread.daemon = True
    video_thread.start()

def stop_intro_video():
    global play_video, video_thread, fade_out
    if play_video:
        fade_out = True
        play_video = False
        if video_thread and video_thread.is_alive():
            video_thread.join()
    print(f"🛑 Intro stopped at {time.ctime()}")