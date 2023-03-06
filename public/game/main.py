from document import currentDiv, getElementById

import game_interface as game
import hstt_runner

gameDiv = getElementById(currentDiv())


class GameRunner:
    def __init__(self, story) -> None:
        self.story = story


game_runner = GameRunner(game.get_story())
gameDiv.innerText = "Hello from python!"


def step(selected):
    selected = int(selected)
    gameDiv.innerText += f"\nSomething happended {selected}"
    if selected == -1:  # Start
        gameDiv.innerText += "\nFirst step"
        return 0  # Finish
