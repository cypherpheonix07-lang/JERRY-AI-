from PIL import Image, ImageTk, ImageSequence

def animate_gif(label, gif_path, root):
    gif = Image.open(gif_path)
    frames = [ImageTk.PhotoImage(frame.resize((150, 150))) for frame in ImageSequence.Iterator(gif)]

    def update(index):
        frame_image = frames[index]
        label.configure(image=frame_image)
        label.image = frame_image
        index = (index + 1) % len(frames)
        root.after(100, update, index)# Schedule next frame update after 100ms

    update(0)
