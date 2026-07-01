from PIL import Image, ImageTk, ImageEnhance
from customtkinter import CTkImage

def get_faded_image(path, size=(800, 600), opacity=0.5):
    """Loads a JPG image, resizes it, and applies transparency."""
    img = Image.open(path).convert("RGBA").resize(size)

    # Extract and dim the alpha channel
    # Adjust transparency
    alpha = img.split()[3]
    alpha = ImageEnhance.Brightness(alpha).enhance(opacity)
    img.putalpha(alpha)


    return CTkImage(dark_image=img, size=size)




