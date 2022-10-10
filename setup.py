from shutil import copytree
from pathlib import Path
from stories.generate import main as generate_stories
from subprocess import Popen, PIPE, STDOUT

# Copy game/ folder to public/
print("Copying game/ -> public/")
game_dir = Path("game")
dest = Path("public/game")
copytree(game_dir, dest, dirs_exist_ok=True)

# Generate story trees.
print("Generating story trees.")
generate_stories()

# Compress skulpt additional modules.
print("Compressing additional skulpt libraries.")
process = Popen(["node", "skulpt-modules/bundling/compress.js"], stdin=PIPE, stdout=PIPE, stderr=STDOUT)
error_code = process.wait()

if error_code != 0:
    print(process.stdout.read().decode("utf-8"))
    print(f"Subprocess ended with non-zero {error_code} error code. Aborting.")
    raise SystemExit

code = process.stdout.read().decode("utf-8")[:-1]
print("Exporting compressed libraries.")
out_file = Path("generated/skulpt-extra.js")
out_file.touch()

code_template = f"""// This file was automatically generated. Don't change it.
export default JSON.parse(String.raw`{code}`)
"""

with out_file.open("w") as _writer:
    _writer.write(code_template)
