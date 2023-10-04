from __future__ import annotations

import os
import sys
import time
from argparse import ArgumentParser
from pathlib import Path
from shutil import copyfile, copytree
from subprocess import PIPE, STDOUT, Popen
from typing import Callable

import psutil

from hstt_to_json import convert_file

game_dir = Path("game")
game_dest = Path("public/game")
hstt_runner = Path("hstt_runner.py")
skulpt_modules = Path("skulpt-modules")
hstt_dest = skulpt_modules / "hstt_runner.py"
hstt_to_json = Path("hstt_to_json.py")
hstt_json_dest = Path("stories/hstt_to_json.py")
generated_lib = Path("generated/skulpt-extra.js")
mainpy = Path("game/main.py")
mainpy_static = Path("public/game/main.py")
setup_file = Path(__file__)

test_hstt = Path("test.hstt")
test_json = Path("test.hstt.json")


def generate_stories():
    if "hstt_to_json" in sys.modules:
        del sys.modules["hstt_to_json"]

    from stories.generate import main as _generate_stories

    print("Generating story trees...")
    _generate_stories()
    convert_file(str(test_hstt), str(test_json))


def main():
    # Copy game/ folder to public/
    print("Copying game/ -> public/")
    copytree(game_dir, game_dest, dirs_exist_ok=True)

    # Copy hstt_runner.py -> skulpt-modules/hstt_runner.py
    print("Copying hstt_runner.py -> skulpt-modules/hstt_runner.py")
    copyfile(hstt_runner, hstt_dest)

    copyfile(hstt_to_json, hstt_json_dest)

    # Generate story trees.
    generate_stories()

    # Compress skulpt additional modules.
    compress_skulpt_modules()


def compress_skulpt_modules():
    print("Compressing additional skulpt libraries.")

    process = Popen(
        ["node", "skulpt-modules/bundling/compress.js"],
        stdin=PIPE,
        stdout=PIPE,
        stderr=STDOUT,
    )
    error_code = process.wait()

    if error_code != 0:
        print(process.stdout.read().decode("utf-8"))
        print(f"Subprocess ended with non-zero {error_code} error code. Aborting.")
        raise SystemExit

    code = process.stdout.read().decode("utf-8")[:-1]
    print("Exporting compressed libraries.")
    generated_lib.touch()

    with generated_lib.open("w") as _writer:
        _writer.write(code)


def restart_listener():
    print("Setup file changed, restarting...")
    try:
        os.execl(sys.executable, "python", *sys.argv)
    except Exception as e:
        print("exception curred", e, " Quitting...")
        sys.exit()


files_to_listen: list[tuple[Callable | None, Path, Path]] = []


def register_listener(
    path: Path, new_path: Path | None = None, callback: Callable | None = None
):
    if new_path is None:
        new_path = path

    if path.is_dir():
        for subpath in path.iterdir():
            if subpath.is_file():
                register_listener(
                    subpath, new_path / subpath.relative_to(path), callback
                )
        return

    files_to_listen.append((callback, path, new_path))


register_listener(mainpy, mainpy_static)
register_listener(hstt_runner, hstt_dest, compress_skulpt_modules)
register_listener(hstt_to_json, hstt_json_dest, generate_stories)
register_listener(setup_file, callback=restart_listener)
register_listener(skulpt_modules, callback=compress_skulpt_modules)


def listen(pid: int):
    print("Spawning a listener for changes in files.")
    file_modified_times: dict[str, list[int, float]] = {
        str(val[1]): [idx, val[1].stat().st_mtime]
        for idx, val in enumerate(files_to_listen)
    }

    try:
        while psutil.pid_exists(pid):
            time.sleep(5)

            if not psutil.pid_exists(pid):
                break

            for name, val in file_modified_times.items():
                if files_to_listen[val[0]][1].stat().st_mtime > val[1]:
                    if files_to_listen[val[0]][1] == files_to_listen[val[0]][2]:
                        print(f"File {name} changed.")
                    else:
                        print(
                            f"File {name} changed. Updating {str(files_to_listen[val[0]][2])}"
                        )

                        copyfile(files_to_listen[val[0]][1], files_to_listen[val[0]][2])

                    val[1] = files_to_listen[val[0]][1].stat().st_mtime

                    if files_to_listen[val[0]][0] is not None:
                        files_to_listen[val[0]][0]()
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
