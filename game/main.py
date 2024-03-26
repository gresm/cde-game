import gamejs

# game_div.innerText = game_runner.runner.story.title + "\n"
gamejs.setup()


@gamejs.step_hook
def step():
    gamejs.print_line("Hello World!")


def reset():
    global game_runner
