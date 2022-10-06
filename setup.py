from shutil import copytree
from pathlib import Path
from stories.generate import main as generate_stories

import os

# Copy game/ folder to public/
print("Copying game/ -> public/")
game_dir = Path("game")
dest = Path("public/game")
copytree(game_dir, dest, dirs_exist_ok=True)

# Generate story trees.
print("Generating story trees.")
generate_stories()
