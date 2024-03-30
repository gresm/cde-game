from typing import List, Optional, cast

import game_interface as gi

import hstt_runner

_NAMES: List[str] = []


class RunnerAbstr:
    def appendLine(self, text):
        pass

    def forceUpdate(self):
        pass


runner = cast(RunnerAbstr, gi.get_runner())


def setup():
    gi.set_value("showLoadPrompt", False, True)
    gi.set_value("names", [])
    runner.forceUpdate()


def hook(name: str):
    def inner(func):
        gi.set_hook(name, func)
        return func

    return inner


def print_line(text: str):
    runner.appendLine(text)


def _set_options(options: List[str]):
    gi.set_value("names", options)


def _get_user_input():
    return gi.get_value("userInput", True)


def set_options(options: List[str]):
    global _NAMES
    _set_options(options)
    _NAMES = options


def get_user_input() -> Optional[str]:
    ret = _get_user_input()
    if ret == -1:
        return None
    return _NAMES[ret]


step_hook = hook("step")
story = hstt_runner.Story.parse(gi.get_story())
