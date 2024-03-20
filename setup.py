from __future__ import annotations

import os
import sys
import time
from argparse import ArgumentParser
from dataclasses import dataclass
from pathlib import Path
from shutil import copyfile, copytree
from subprocess import PIPE, STDOUT, Popen
from typing import Callable

if sys.version_info < (3, 11):
    from typing_extensions import TypedDict
else:
    from typing import TypedDict

import psutil

from hstt_to_json import convert_file


class ListenerInfo(TypedDict):
    path: Path
    path_to_copy: Path
    callback: Callable | None


@dataclass
class ListenerFileData:
    index: int
    change_time: float


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

gamepy = Path("game/game.py")
gamepy_dest = Path("skulpt-modules/game.py")


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
        ["node", "skulpt-modules/bundling/compress.mjs"],
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


files_to_listen: list[ListenerInfo] = []


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

    files_to_listen.append(
        {"callback": callback, "path": path, "path_to_copy": new_path}
    )


register_listener(mainpy, mainpy_static)
register_listener(hstt_runner, hstt_dest, compress_skulpt_modules)
register_listener(hstt_to_json, hstt_json_dest, generate_stories)
register_listener(setup_file, callback=restart_listener)
register_listener(skulpt_modules, callback=compress_skulpt_modules)
register_listener(gamepy, gamepy_dest)


def listen(pid: int):
    print("Spawning a listener for changes in files.")
    file_modified_times: dict[str, ListenerFileData] = {
        str(val["path"]): ListenerFileData(idx, val["path"].stat().st_mtime)
        for idx, val in enumerate(files_to_listen)
    }

    try:
        while psutil.pid_exists(pid):
            time.sleep(1)

            for name, val in file_modified_times.items():
                if files_to_listen[val.index]["path"].stat().st_mtime > val.change_time:
                    if (
                        files_to_listen[val.index]["path"]
                        == files_to_listen[val.index]["path_to_copy"]
                    ):
                        print(f"File {name} changed.")
                    else:
                        print(
                            f"File {name} changed. Updating {str(files_to_listen[val.index]['path_to_copy'])}"
                        )

                        copyfile(
                            files_to_listen[val.index]["path"],
                            files_to_listen[val.index]["path_to_copy"],
                        )

                    val.change_time = (
                        files_to_listen[val.index]["path_to_copy"].stat().st_mtime
                    )

                    callback = files_to_listen[val.index]["callback"]
                    if callback is not None:
                        callback()
        print("Parent process ended, exiting from listener...")
    except KeyboardInterrupt:
        print("Exiting from listener...")
        sys.exit(0)


def dev():
    dev_server = Popen(["npm", "run", "dev-dev"])
    time.sleep(0.1)
    # try:
    setup_script = Popen(["python3", "setup.py", "-l", str(dev_server.pid)])
    time.sleep(0.1)
    # except ZeroDivisionError as err: # (OSError, SubprocessError) as err:
    #     dev_server.kill()
    #     raise err from None

    try:
        while True:
            if dev_server.poll() is not None:
                setup_script.kill()
                break
            if setup_script.poll() is not None:
                dev_server.kill()
                break
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("Terminating.")
        dev_server.kill()
        setup_script.kill()
        sys.exit(0)


parser = ArgumentParser()
parser.add_argument("-l", dest="listen", type=int, required=False, default=0)
parser.add_argument("--dev", dest="dev", action="store_true")
args = parser.parse_args()
if args.dev:
    if args.listen != 0:
        print("WARNING: setup.py was ran with both --dev and -l=PID, which is unsupported, ignoring -l=PID.")
    dev()
elif args.listen == 0:
    main()
else:
    listen(args.listen)
