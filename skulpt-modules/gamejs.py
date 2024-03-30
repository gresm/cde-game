from typing import List, cast

import game_interface as gi

import hstt_runner


_current_options = []

class RunnerAbstr:
    def appendLine(self, text):
        pass

    def forceUpdate(self):
        pass

    def clearText(self):
        pass

    def endStep(self):
        pass


_sk_runner = cast(RunnerAbstr, gi.get_runner())


def setup():
    gi.set_value("showLoadPrompt", False, True)
    gi.set_value("names", [])
    _sk_runner.forceUpdate()


def hook(name: str):
    def inner(func):
        gi.set_hook(name, func)
        return func

    return inner


def print_line(text: str):
    _sk_runner.appendLine(text)


def print_option(text: str, _goto: str):
    # TODO: implement
    print_line(text)


def set_options(options: List[str]):
    global _current_options
    _current_options = options


def get_user_input() -> int:
    return cast(int, gi.get_value("userInput", True))


def just_step():
    set_options([""])


def stop():
    set_options([])


def end_step():
    gi.set_value("names", _current_options, False, _sk_runner.endStep)


@hook("reset")
def reset():
    global runner
    runner = hstt_runner.HSTTRunner(hstt_runner.Story.parse(gi.get_story()))
    _sk_runner.clearText()


step_hook = hook("step")
after_input_hook = hook("after_input")
runner = hstt_runner.HSTTRunner(hstt_runner.Story.parse(gi.get_story()))
