import game

# game_div.innerText = game_runner.runner.story.title + "\n"
game.setup()


@game.step_hook
def step():
    pass

game.gi.set_hook("step", step)


def reset():
    global game_runner
