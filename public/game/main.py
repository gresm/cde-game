from document import currentDiv, getElementById

import game_interface as game

gameDiv = getElementById(currentDiv())

if gameDiv:
    gameDiv.innerHTML = str(game.get_story())
