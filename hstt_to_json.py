"""
This file utility converts HSTT files to JSON files that can be used by the game.
HSTT files are text files containing dialogue trees.
Format of such file looks like this:

This is an entry node, the name of it is empty.
!node_name
#node_name
Text to be displayed,
That has multiline support.
// It also supports comments.
@next_node Option 1
@other_next_node Option 2
#next_node
This text is displayed if the player selects the first option.
#other_next_node
This text is displayed if the player selects the second option.
// Text nodes have more functionalities than just text.
*
For example text between stars, will be shown as an alert.
*
!node_name
When person is forced to be sent to different node, instead of # use !.

The text above converts into this json file:

    {
        "": {
            "text": [
                {"type": "text", "text": "This is an entry node, the name of it is empty."}
            ],
            "goto": "node_name"
        },
        "node_name": {
            "text": [
                    {"type": "text", "text": "Text to be displayed,\nThat has multiline support."}
            ],
            "options": {
                    "next_node": "Option 1",
                    "other_next_node": "Option 2"
            }
        },
        "next_node": {
            "text": [
                    {"type": "text", "text": "This text is displayed if the player selects the first option."},
                    {"type": "alert", "text": "For example text between stars, will be shown as an alert."},
                    {
                        "type": "goto", "destination": "next_node",
                        "text": "When person is forced to be sent to different node, instead of # use !"
                    },
                    {"type": "text", "text": "When person is forced to be sent to different node, instead of # use !"}
            ],
            "goto": "destination": "next_node"
        },
        "other_next_node": {
            "text": [
                    {"type": "text", "text": "This text is displayed if the player selects the second option."}
            ]
        }
    }

"""
from enum import Enum


class HSTTParserException(Exception):
    pass


class LineType(Enum):
    COMMENT = "comment"
    HEADER = "header"

    TEXT = "text"
    GOTO = "goto"
    ALERT = "alert"
    OPTION = "option"


class HSTTParserState:
    def __init__(self):
        self.current_node_name = ""
        self.searching_alert = False
        self.node_text = []
        self.node_goto = ""
        self.node_options = {}

    def add_text(self, text: str):
        self.node_text.append({"type": LineType.TEXT.value, "text": text})

    def add_alert(self, alert: str):
        self.node_text.append({"type": LineType.ALERT.value, "text": alert})

    def add_option(self, destination: str, description: str):
        self.node_options[destination] = description

    def set_goto(self, goto: str):
        self.node_goto = goto

    def get_node(self):
        ret = dict()

        ret["text"] = self.node_text
        if self.node_goto:
            ret["goto"] = self.node_goto
        if self.node_options:
            ret["options"] = self.node_options

        return {self.current_node_name: ret}

    def clear_current_node(self):
        self.node_text = []
        self.node_goto = ""
        self.node_options = {}
        # This is a hack to make sure that if something goes wrong, we don't override entry node (with empty name).
        self.current_node_name = " "


class HSTTToJSON:
    def __init__(self, text: str):
        self.text = text
        self.lines = text.split("\n")
        self.state = HSTTParserState()
        self.nodes = {}

    @staticmethod
    def get_line_type(line: str) -> LineType:
        if line.startswith("#"):
            return LineType.HEADER
        elif line.startswith("!"):
            return LineType.GOTO
        elif line.startswith("@"):
            return LineType.OPTION
        elif line.startswith("*"):
            return LineType.ALERT
        elif line.startswith("//"):
            return LineType.COMMENT
        return LineType.TEXT

    def convert(self):
        for line in self.lines:
            self.parse_line(line)
        return self.nodes

    def parse_line(self, line: str):
        line_type = self.get_line_type(line)
        if line_type == LineType.HEADER:
            self.state.current_node = line[1:]
        elif line_type == LineType.GOTO:
            self.state.current_node = line[1:]
