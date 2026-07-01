'''
from PIL import Image, ImageTk, ImageSequence
import os



frames = []

def animate_gif(label, gif_path, root):
    global frames

    try:
        gif = Image.open(gif_path)

        if getattr(gif, "is_animated", False):
            if not frames:
                frames = [ImageTk.PhotoImage(frame.copy().resize((150, 150))) for frame in ImageSequence.Iterator(gif)]

            def update(index=0):
                frame_image = frames[index]
                label.configure(image=frame_image)
                label.image = frame_image  # Prevent GC
                next_index = (index + 1) % len(frames)
                root.after(100, update, next_index)

            update(0)

        else:
            img = ImageTk.PhotoImage(gif.resize((150, 150)))
            label.configure(image=img)
            label.image = img

    except Exception as e:
        print(f"⚠️ Avatar load error: {e}")
        label.configure(text="No Avatar 😢")

'''

from PIL import Image, ImageTk, ImageSequence
import os

def show_avatar(label, avatar_path):
    ext = os.path.splitext(avatar_path)[-1].lower()

    # ---- If it's a GIF (animated) ----
    if ext == ".gif":
        try:
            gif = Image.open(avatar_path)
            frames = [ImageTk.PhotoImage(frame.resize((150, 150))) for frame in ImageSequence.Iterator(gif)]

            def update(index):
                frame_image = frames[index]
                label.configure(image=frame_image)
                label.image = frame_image
                label.after(100, update, (index + 1) % len(frames))

            update(0)
        except Exception as e:
            print("⚠️ Error loading GIF avatar:", e)
            label.configure(text="GIF error")

    # ---- Else if it's a PNG or JPG (static image) ----
    elif ext in [".png", ".jpg", ".jpeg"]:
        try:
            img = Image.open(avatar_path).resize((200, 200))
            tk_img = ImageTk.PhotoImage(img)
            label.configure(image=tk_img)
            label.image = tk_img
        except Exception as e:
            print("⚠️ Error loading image avatar:", e)
            label.configure(text="Image error")

    else:
        label.configure(text="Unsupported format")