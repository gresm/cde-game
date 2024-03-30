"""
Utility script to run HSTT formatted json files.
"""

from typing import Literal, Optional, Union

from typing_extensions import NotRequired, TypeAlias, TypedDict, TypeGuard


class RawTextLine(TypedDict):
    text: str
    type: Literal["text", "alert"]


RawNodeText: TypeAlias = "list[RawTextLine]"
RawNodeOptions: TypeAlias = "list[list[str]]"


class RawStoryNode(TypedDict):
    text: RawNodeText
    options: NotRequired[RawNodeOptions]
    goto: NotRequired[str]


class RawStory(TypedDict):
    title: str
    nodes: dict[str, RawStoryNode]


class HSTTParserException(Exception):
    pass


class TextLine:
    """
    Class for text lines.
    """

    def __init__(self, text: str, text_type: str):
        self.text = text
        self.type = text_type

    def __repr__(self):
        return f"{self.type}: {self.text}"

    @classmethod
    def parse(cls, data: RawTextLine):
        """
        Parses text line from dictionary.
        """
        return cls(data["text"], data["type"])


class NodeText:
    """
    Class to represent text in a node.
    """

    def __init__(self, text: list[TextLine]):
        self.text = text

    def __repr__(self):
        return f'[{", ".join([str(line) for line in self.text])}]'

    def __len__(self):
        return len(self.text)

    @classmethod
    def parse(cls, data: list[RawTextLine]):
        """
        Parses text from list of dictionaries.
        """
        return cls([TextLine.parse(line) for line in data])


class OptionElement:
    """
    Class to represent option element.
    """

    def __init__(self, goto: str, text: str):
        self.text = text
        self.goto = goto

    def __repr__(self):
        return f"{self.text} -> {self.goto}"

    @classmethod
    def parse(cls, data: tuple[str, str]):
        """
        Parses option element from tuple.
        """
        return cls(data[0], data[1])


class NodeOptions:
    """
    Class to represent options in a node.
    """

    def __init__(self, options: list[OptionElement]):
        self.options = options

    def __len__(self):
        return len(self.options)

    def __repr__(self):
        return f'[{", ".join([str(option) for option in self.options])}]'

    @classmethod
    def parse(cls, data: RawNodeOptions):
        """
        Parses options from list of dictionaries.
        """
        return cls([OptionElement.parse((option[0], option[1])) for option in data])


class StoryNode:
    def __init__(
        self,
        name: str,
        text: NodeText,
        options: NodeOptions,
        goto: Optional[str] = None,
    ):
        self.name = name
        self.text = text
        self.goto = goto
        self.options = options

    def __repr__(self):
        return f"{self.name}:\n{self.text}\n{self.options}"

    @classmethod
    def parse(cls, name: str, data: RawStoryNode):
        """
        Parses story node from dictionary.
        """
        return cls(
            name,
            NodeText.parse(data["text"]),
            NodeOptions.parse(data.get("options", [])),
            data.get("goto", None),
        )


class Story:
    def __init__(self, title: str, nodes: dict[str, StoryNode]):
        self.title = title
        self.nodes = nodes
        self.entry_point = nodes[""]

    def __repr__(self):
        return f"{self.nodes}"

    def __iter__(self):
        return HSTTRunner(self)

    @classmethod
    def parse(
        cls,
        data: RawStory,
    ):
        """
        Parses story from dictionary.
        """
        ret = cls(
            data["title"],
            {
                name: StoryNode.parse(name, value)
                for name, value in data["nodes"].items()
            },
        )
        ret.validate()
        return ret

    def validate(self):
        """
        Validates story.
        """
        for node_name in self.nodes:
            node = self.nodes[node_name]
            if node.goto is not None and node.goto not in self.nodes:
                raise HSTTParserException(
                    f"Node {node_name} has goto {node.goto} but there is not such location."
                )

            if len(node.options):
                for option in node.options.options:
                    if option.goto not in self.nodes:
                        raise HSTTParserException(
                            f"Node {node_name} has option {option.text} -> {option.goto} but "
                            f"there is not such location."
                        )

            if node.goto and len(node.options):
                raise HSTTParserException(
                    f"Collision in: {node_name}. The node has both goto and options. "
                    f"This behaviour is not supported."
                )

        if "" not in self.nodes:
            raise HSTTParserException("There is no start node.")


LOCATION_END: Literal[-1] = -1
LOCATION_NODE: Literal[0] = 0
LOCATION_TEXT: Literal[1] = 1
LOCATION_OPTION: Literal[2] = 2
_LOCATION_TYPE: TypeAlias = Union[Literal[-1], Literal[0], Literal[1], Literal[2]]
_VALID_LOCATION = Union[None, StoryNode, TextLine, NodeOptions]


class Location:
    value: _VALID_LOCATION
    loc_type: _LOCATION_TYPE
    parent_node: Optional[StoryNode]

    def __init__(self, value: _VALID_LOCATION, loc_type: _LOCATION_TYPE) -> None:
        self.value = value
        self.loc_type = loc_type
        self.parent_node = None
        self.text_line: int = -1
        self.selected_option: int = -1

    def is_node_text(self, _self) -> TypeGuard["_TextLocation"]:
        return (
            self.loc_type == LOCATION_TEXT
            and isinstance(self.value, TextLine)
            and bool(self.parent_node)
        )

    def is_node_options(self, _self) -> TypeGuard["_OptionsLocation"]:
        return (
            self.loc_type == LOCATION_OPTION
            and isinstance(self.value, NodeOptions)
            and bool(len(self.value))
        )

    def is_finnish(self, _self) -> TypeGuard["_EndLocation"]:
        return self.loc_type == LOCATION_END

    def enter_node_text(self, _self) -> TypeGuard["_TextLocation"]:
        if self.loc_type != LOCATION_NODE or not isinstance(self.value, StoryNode):
            return False

        self.parent_node = self.value
        self.loc_type = LOCATION_TEXT
        self.text_line = -1
        # self.value = self.parent_node.text.text[self.text_line]
        return True

    def advance_text(self, _self) -> TypeGuard["_TextLocation"]:
        if self.loc_type != LOCATION_TEXT or not self.parent_node:
            return False

        self.text_line += 1
        if self.text_line >= len(self.parent_node.text):
            self.exit_node_text(self)
            return False
        self.value = self.parent_node.text.text[self.text_line]
        return True

    def exit_node_text(self, _self) -> TypeGuard["_NodeLocation"]:
        if (
            self.loc_type != LOCATION_TEXT
            or not isinstance(self.value, TextLine)
            or not self.parent_node
        ):
            return False

        self.text_line = -1
        self.loc_type = LOCATION_NODE
        self.value = self.parent_node
        self.parent_node = None

        return True

    def enter_node_options(self, _self) -> TypeGuard["_OptionsLocation"]:
        if (
            self.loc_type != LOCATION_NODE
            or not isinstance(self.value, StoryNode)
            or not len(self.value.options)
        ):
            return False

        self.parent_node = self.value
        self.value = self.value.options
        self.loc_type = LOCATION_OPTION
        self.selected_option = -1

        return True

    def select_option(self, option: int):
        if (
            self.loc_type != LOCATION_OPTION
            or not isinstance(self.value, NodeOptions)
            or not len(self.value)
        ):
            return False

        if not 0 <= option < len(self.value):
            return False

        self.selected_option = option
        return True

    def leave_node_options(self, _self) -> TypeGuard["_NodeLocation"]:
        if (
            self.loc_type != LOCATION_OPTION
            or not isinstance(self.value, NodeOptions)
            or not len(self.value)
        ):
            return False

        self.value = self.parent_node
        self.loc_type = LOCATION_NODE
        return True

    def set_node(self, node: StoryNode) -> TypeGuard["_NodeLocation"]:
        self.value = node
        self.parent_node = None
        self.selected_option = -1
        self.text_line = -1
        self.loc_type = LOCATION_NODE
        return True

    def has_goto(self, _self) -> TypeGuard["_NodeLocation"]:
        return (
            self.loc_type == LOCATION_NODE
            and isinstance(self.value, StoryNode)
            and self.value.goto is not None
        )

    def finnish(self) -> TypeGuard["_EndLocation"]:
        self.value = None
        self.loc_type = LOCATION_END
        return True


class _EndLocation(Location):
    value: None
    loc_type: Literal[-1]
    parent_node: None


class _NodeLocation(Location):
    value: StoryNode
    loc_type: Literal[0]
    parent_node: None


class _TextLocation(Location):
    value: TextLine
    loc_type: Literal[1]
    parent_node: StoryNode


class _OptionsLocation(Location):
    value: NodeOptions
    loc_type: Literal[2]
    parent_node: StoryNode


class HSTTRunner:
    """
    Runner class for HSTT game format.
    """

    def __init__(self, story: Story):
        self.story = story
        self.location = Location(self.story.entry_point, LOCATION_NODE)
        self._first_step = True

    def goto(self, to: str):
        if to in self.story.nodes:
            self.location.set_node(self.story.nodes[to])

    def step(self):
        location = self.location
        if self._first_step:
            self._first_step = False
            return location

        if location.is_node_text(location) or location.enter_node_text(location):
            if not location.advance_text(location):
                location.exit_node_text(location)
                location.enter_node_options(location)
                if not location.is_node_options(self):
                    if location.has_goto(location):
                        self.goto(location.value.goto or " ")
                    else:
                        location.finnish()
        elif location.is_node_options(location):
            self.goto(location.value.options[location.selected_option].goto)
        return location
