"""
This file utility converts HSTT files to JSON files that can be used by the game.
HSTT files are text files containing dialogue trees.
Format of such file looks like this:

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
                    }
            ]
        },
        "other_next_node": {
            "text": [
                    {"type": "text", "text": "This text is displayed if the player selects the second option."}
            ]
        }
    }

"""


class _ParserState:
    def __init__(self):
        pass


def parse_string(text: str):
    """
    Parse HSTT format valid string to json-like object.
    :param text:
    :return:
    """
    pass
