from PIL import Image, ImageDraw, ImageFont
import os

# Configuration
FONT_PATH = "/home/ubuntu/RussoOne-Regular.ttf"
INPUT_IMAGE = "/home/ubuntu/ssplt10_blogs/client/public/images/social/insta-power-hitting.jpg"
OUTPUT_IMAGE = "/home/ubuntu/ssplt10_blogs/client/public/images/social_with_text/specific-power-hitting.jpg"
TEXT = "UNLOCK YOUR\nPOWER HITTING"

def create_post():
    try:
        img = Image.open(INPUT_IMAGE).convert("RGBA")
        width, height = img.size
        draw = ImageDraw.Draw(img)

        # Calculate font size (approx 12% of image width for longer text)
        font_size = int(width * 0.12)
        font = ImageFont.truetype(FONT_PATH, font_size)

        # Calculate text size and position
        left, top, right, bottom = draw.textbbox((0, 0), TEXT, font=font, align="center")
        text_width = right - left
        text_height = bottom - top
        
        # Position: Center horizontally, slightly below center vertically
        x = (width - text_width) / 2
        y = (height - text_height) / 2

        # Draw shadow/outline
        shadow_color = (0, 0, 0, 200)
        offset = int(font_size * 0.05)
        
        for ox in range(-offset, offset + 1, offset):
            for oy in range(-offset, offset + 1, offset):
                draw.multiline_text((x + ox, y + oy), TEXT, font=font, fill=shadow_color, align="center")

        # Draw main text in White
        text_color = (255, 255, 255, 255)
        draw.multiline_text((x, y), TEXT, font=font, fill=text_color, align="center")

        # Convert back to RGB and save
        img = img.convert("RGB")
        img.save(OUTPUT_IMAGE, "JPEG", quality=95)
        print(f"Created: {OUTPUT_IMAGE}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_post()
