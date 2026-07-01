
from PIL import Image, ImageTk, ImageSequence

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
