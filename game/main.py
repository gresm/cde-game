import game_interface as game
from document import getElementById

import hstt_runner

game_div = getElementById(game.game_div())


class GameRunner:
    def __init__(self, story) -> None:
        self.story = story
        self.runner = hstt_runner.HSTTRunner(hstt_runner.Story.parse(story))


game_runner = GameRunner(game.get_story())
game_div.innerText = game_runner.runner.story.title + "\n"
state = -1

getElementById("to-remove-on-load").remove()


def step(selected, text):
    global state

    selected = int(selected)
    typed = str(text)
