import imageio_ffmpeg
import subprocess
import sys
import os

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

input_file = r"C:\Users\ADMIN\Downloads\Initial_Scene_-_2026-06-10_202606101728.mp4"
output_file = r"C:\Users\ADMIN\Downloads\Initial_Scene_-_2026-06-10_202606101728_captioned.mp4"

# Use textfile to avoid escaping issues in ffmpeg command string
text_file = "caption.txt"
with open(text_file, "w", encoding="utf-8") as f:
    f.write("Every Kid's Cricket Dream Journey")

# Ensure text_file path is formatted correctly for ffmpeg
text_file_ffmpeg = text_file.replace("\\", "/")

# Font file path for Windows
font_file = "C:/Windows/Fonts/arial.ttf"

# FFmpeg command
# We use drawtext filter
# escape backslashes and colons in windows paths for drawtext
font_file_escaped = font_file.replace(":", "\\:")
text_file_escaped = text_file_ffmpeg.replace(":", "\\:")

vf_filter = f"drawtext=fontfile='{font_file_escaped}':textfile='{text_file_escaped}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.5:boxborderw=10:x=(w-text_w)/2:y=h-th-50"

cmd = [
    ffmpeg_exe,
    "-y",
    "-i", input_file,
    "-vf", vf_filter,
    "-codec:a", "copy",
    output_file
]

print("Running command:", " ".join(cmd))
result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode != 0:
    print("Error running ffmpeg:")
    print(result.stderr)
    sys.exit(1)
else:
    print(f"Successfully generated {output_file}")
    if os.path.exists(text_file):
        os.remove(text_file)
