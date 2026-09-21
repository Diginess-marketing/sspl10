from PIL import Image, ImageDraw, ImageFont
import os

# Configuration
FONT_PATH = "/home/ubuntu/RussoOne-Regular.ttf"
INPUT_DIR = "/home/ubuntu/ssplt10_blogs/client/public/images/social"
OUTPUT_DIR = "/home/ubuntu/ssplt10_blogs/client/public/images/social_with_text"

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Map images to their text
image_text_map = {
    "insta-power-hitting.jpg": "POWER\nHITTING",
    "insta-bowling.jpg": "MYSTERY\nSPIN",
    "insta-fielding.jpg": "FLYING\nCATCH",
    "insta-launch.jpg": "SEASON\nLAUNCH",
    "insta-gear.jpg": "PRO GEAR\nGUIDE",
    "insta-fitness.jpg": "SPEED &\nAGILITY",
    "insta-tactics.jpg": "MATCH\nTACTICS",
    "insta-spotlight.jpg": "RISING\nSTARS",
    "insta-trials.jpg": "YOU ARE\nSELECTED"
}

def add_text_overlay(image_path, text, output_path):
    try:
        img = Image.open(image_path).convert("RGBA")
        width, height = img.size
        draw = ImageDraw.Draw(img)

        # Calculate font size (approx 15% of image width)
        font_size = int(width * 0.15)
        font = ImageFont.truetype(FONT_PATH, font_size)

        # Calculate text size and position
        # Using textbbox for better accuracy in newer Pillow versions
        left, top, right, bottom = draw.textbbox((0, 0), text, font=font, align="center")
        text_width = right - left
        text_height = bottom - top
        
        # Position: Center horizontally, slightly below center vertically
        x = (width - text_width) / 2
        y = (height - text_height) / 2

        # Draw shadow/outline for better visibility
        shadow_color = (0, 0, 0, 200)
        offset = int(font_size * 0.05)
        
        # Draw multiple offsets for a thick outline effect
        for ox in range(-offset, offset + 1, offset):
            for oy in range(-offset, offset + 1, offset):
                draw.multiline_text((x + ox, y + oy), text, font=font, fill=shadow_color, align="center")

        # Draw main text in Volt Green / Electric Blue style (White with slight tint)
        text_color = (255, 255, 255, 255) # White
        draw.multiline_text((x, y), text, font=font, fill=text_color, align="center")

        # Convert back to RGB and save
        img = img.convert("RGB")
        img.save(output_path, "JPEG", quality=95)
        print(f"Processed: {os.path.basename(image_path)}")

    except Exception as e:
        print(f"Error processing {image_path}: {e}")

# Process all images
for filename, text in image_text_map.items():
    input_path = os.path.join(INPUT_DIR, filename)
    output_path = os.path.join(OUTPUT_DIR, filename)
    
    if os.path.exists(input_path):
        add_text_overlay(input_path, text, output_path)
    else:
        print(f"Warning: Image not found: {input_path}")

print("All images processed.")
