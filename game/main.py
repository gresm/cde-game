from document import currentDiv, getElementById

import game_interface as game

gameDiv = getElementById(currentDiv())


class GameRunner:
    def __init__(self, story) -> None:
        self.story = story


game_runner = GameRunner(game.get_story())

def step(selected):
    pass
