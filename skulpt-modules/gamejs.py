import game_interface as gi
import hstt_runner
from typing import cast


class RunnerAbstr:
    def appendLine(self, text):
        pass

    def forceReload():
        pass


runner = cast(RunnerAbstr, gi.get_runner())


def setup():
    gi.set_value("showLoadPrompt", False, True)
    gi.set_value("names", [])
    runner.forceReload()


def hook(name: str):
    def inner(func):
        gi.set_hook(name, func)
        return func
    return inner


def print_line(text: str):
    runner.appendLine(text)


step_hook = hook("step")
story = hstt_runner.Story.parse(gi.get_story())
