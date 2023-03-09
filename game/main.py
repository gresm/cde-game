from document import getElementById

import game_interface as game
import hstt_runner

gameDiv = getElementById(game.gameDiv())


class GameRunner:
    def __init__(self, story) -> None:
        self.story = story
        self.runner = hstt_runner.HSTTRunner(hstt_runner.Story.parse(story))


game_runner = GameRunner(game.get_story())
gameDiv.innerText = "Hello from python!"
state = -1

getElementById("to-remove-on-load").remove()

def step(selected, text):
    global state

    selected = int(selected)
    typed = str(text)
