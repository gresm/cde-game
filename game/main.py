import gamejs

gamejs.setup()


@gamejs.step_hook
def step():
    # gamejs.runner.location.
    # gamejs.print_line("Hello World!")
    location = gamejs.runner.step()

    if location.is_node_text(location):
        if location.value.type == "alert":
            gamejs.print_alert(location.value.text)
        else:
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
    gamejs.end_step()


@gamejs.after_input_hook
def after_input():
    gamejs.runner.location.selected_option = gamejs.get_user_input()
