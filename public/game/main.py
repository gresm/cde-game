from document2 import currentDiv, getElementById

import game_interface as game
import hstt_runner

gameDiv = getElementById(currentDiv())


class GameRunner:
    def __init__(self, story) -> None:
        self.story = story


game_runner = GameRunner(game.get_story())
gameDiv.innerText = "Hello from python!"
state = -1

getElementById("to-remove-on-load").remove()

def step(selected, text):
    global state

    selected = int(selected)
    text = str(text)
    gameDiv.innerText += text

    if selected == -1:
        state = 0
        gameDiv.innerText += "\nFirst step"
        return 2
    
    if state == 0:
        if selected == 0:
            gameDiv.innerText += "\nOption a"
        else:
            gameDiv.innerText += "\nOption b"
        return 2
