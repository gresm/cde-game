from pathlib import Path
import json

from hstt_to_json import parse

output_file_template = """// This file was automatically generated. Don't change it.
export var data = JSON.parse(String.raw`{}`)
"""

current_file = Path(__file__)
cwd = current_file.parent

out_file = cwd / "stories_json.js"
input_dir = cwd / "stories"


def main():
    stories = {}
    visible = []

    for file in input_dir.iterdir():
        if file.suffix not in {'.json', ".hstt"}:
            continue

        is_hstt = file.suffix == ".hstt"
        name = file.name.split(".")[0]
        is_hidden = name.startswith("_")
        real_name = name[1:] if is_hidden else name

        if not is_hidden:
            visible.append(real_name)
        
        content = file.read_text()
        stories[real_name] = parse(content) if is_hstt else json.loads(content)
    
    out = {"index": visible, "stories": stories}
    out_text = json.dumps(out)
    out_file.write_text(output_file_template.format(out_text))


if __name__ == "__main__":
    main()
