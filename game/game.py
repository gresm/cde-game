import game_interface as gi
import hstt_runner


def setup():
    gi.set_value("showLoadPrompt", False, True)
    gi.set_value("names", [])


def hook(name: str):
    def inner(func):
        gi.set_hook(name, func)
        return func
    return inner


step_hook = hook("step")
story = hstt_runner.Story.parse(gi.get_story())
