import gamejs

gamejs.setup()


@gamejs.step_hook
def step():
    # gamejs.runner.location.
    # gamejs.print_line("Hello World!")
    location = gamejs.runner.step()

    if location.is_node_text(location):
        gamejs.print_line(location.value.text)
        gamejs.just_step()
    elif location.is_node_options(location):
        for idx, op in enumerate(location.value.options):
            gamejs.print_option(f"{idx + 1}. {op.text} ({op.goto})", op.goto)

        gamejs.print_line(" -> ")
        gamejs.set_options([op.goto for op in location.value.options])
    elif location.is_finnish(location):
        gamejs.stop()
    else:
        gamejs.just_step()
    gamejs.gi._debug(location)
    gamejs.end_step()
