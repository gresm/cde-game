import json
from pathlib import Path

try:
    from .hstt_to_json import parse
except ImportError:
    from hstt_to_json import parse

output_file_template = """// This file was automatically generated. Don't change it.
export default JSON.parse(String.raw`{}`);
"""

current_file = Path(__file__)
cwd = current_file.parent
proj = cwd.parent

out_file = proj / "generated" / "stories-json.js"
input_dir = cwd / "stories"


def main():
    stories = {}
    visible = {}

    for file in input_dir.iterdir():
        if file.suffix not in {".json", ".hstt"}:
            continue

        is_hstt = file.suffix == ".hstt"
        name = file.name.split(".")[0]
        is_hidden = name.startswith("_")
        real_name = name[1:] if is_hidden else name
        content = file.read_text()

        if is_hstt:
            parsed = parse(content)
        else:
            parsed = json.loads(content)

        if not is_hidden:
            visible[real_name] = parsed["title"]

        stories[real_name] = parsed

    out = {"index": visible, "stories": stories}
    out_text = json.dumps(out)
    out_file.touch()
    out_file.write_text(output_file_template.format(out_text))


if __name__ == "__main__":
    main()
