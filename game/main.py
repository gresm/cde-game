import game_interface as game
from document import getElementById

import hstt_runner

game_div = getElementById(game.game_div())
if game_div is None:
    raise RuntimeError(f"No game div found with id '{game.game_div()}'.")


class GameRunner:
    def __init__(self, story) -> None:
        self.story = story
        self.runner = hstt_runner.HSTTRunner(hstt_runner.Story.parse(story))


game_runner = GameRunner(game.get_story())
game_div.innerText = game_runner.runner.story.title + "\n"

to_remove = getElementById("to-remove-on-load")
if to_remove:
    to_remove.remove()


def step(selected):
    selected = int(selected)
    game_div.innerText += str(selected)
    return 1
