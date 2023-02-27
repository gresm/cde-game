import os, time, sys
from shutil import copytree, copyfile
from pathlib import Path
from stories.generate import main as generate_stories
from subprocess import Popen, PIPE, STDOUT
from argparse import ArgumentParser


def main():
    # Copy game/ folder to public/
    print("Copying game/ -> public/")
    game_dir = Path("game")
    dest = Path("public/game")
    copytree(game_dir, dest, dirs_exist_ok=True)

    # Copy hstt_runner.py -> skulpt-modules/hstt_runner.py
    print("Copying hstt_runner.py -> skulpt-modules/hstt_runner.py")
    hstt_runner = Path("hstt_runner.py")
    dest = Path("skulpt-modules/hstt_runner.py")
    copyfile(hstt_runner, dest)

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

    with out_file.open("w") as _writer:
        _writer.write(code)


def listen(pid: int):
    try:
        import psutil
    except ImportError:
        os.system("python -m pip install psutil")
        import importlib as _iplib
        psutil = _iplib.import_module("psutil")
    
    print("Spawning a listener for changes in game/main.py...")
    mainpy = Path("game/main.py")
    mainpy_static = Path("public/game/main.py")

    try:
        while psutil.pid_exists(pid):
            time.sleep(5)

            # print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(mainpy.stat().st_mtime)))
            # print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(mainpy_static.stat().st_mtime)))

            if mainpy.stat().st_mtime > mainpy_static.stat().st_mtime:
                print("File game/main.py changed. Updating public/game/main.py")
                copyfile(mainpy, mainpy_static)
        print("Parent process ended, exiting from listener...")
    except KeyboardInterrupt:
        print("Exiting from listener...")
        sys.exit(0)


parser = ArgumentParser()
parser.add_argument("-l", dest="listen", type=int, required=False, default=0)
args = parser.parse_args()

if args.listen == 0:
    main()
else:
    listen(args.listen)
