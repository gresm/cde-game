import os
import subprocess
import sys
from pathlib import Path
from types import SimpleNamespace
from venv import EnvBuilder

VENV_PATH = Path("venv")
CREATE_VENV = not VENV_PATH.exists()
REQUIREMENTS_PATH = Path("requirements.txt")


class MyEnvBuilder(EnvBuilder):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.context: None | SimpleNamespace = None

    def post_setup(self, context: SimpleNamespace) -> None:
        self.context = context
        return super().post_setup(context)


_builder = MyEnvBuilder(symlinks=True)
_builder.create(VENV_PATH)
_context = _builder.context
assert isinstance(_context, SimpleNamespace)
VENV_CONTEXT = _context


def setup_venv():
    builder = MyEnvBuilder(symlinks=True, with_pip=True)
    builder.create(VENV_PATH)

    if CREATE_VENV:
        subprocess.call(
            [
                VENV_CONTEXT.env_exe,
                "-m",
                "pip",
                "-qqq",
                "install",
                "-r",
                REQUIREMENTS_PATH,
            ],
            stderr=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL
        )


def main():
    setup_venv()
    print(VENV_CONTEXT.env_exe)


def activate_venv():
    print(VENV_CONTEXT)

    os.environ["PATH"] = os.pathsep.join(
        [VENV_CONTEXT.bin_path] + os.environ.get("PATH", "").split(os.pathsep)
    )
    os.environ["VIRTUAL_ENV"] = VENV_CONTEXT.env_dir
    sys.prefix = VENV_CONTEXT.env_dir


if __name__ == "__main__":
    main()
