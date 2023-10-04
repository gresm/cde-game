"""
Utility script to run HSTT formatted json files.
"""
from typing import Literal, Optional, TypeAlias

from typing_extensions import NotRequired, TypedDict


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

    def __bool__(self):
        return len(self.options) > 0

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

            if node.options:
                for option in node.options.options:
                    if option.goto not in self.nodes:
                        raise HSTTParserException(
                            f"Node {node_name} has option {option.text} -> {option.goto} but "
                            f"there is not such location."
                        )

            if node.goto and node.options:
                raise HSTTParserException(
                    f"Collision in: {node_name}. The node has both goto and options. "
                    f"This behaviour is not supported."
                )

        if "" not in self.nodes:
            raise HSTTParserException("There is no start node.")


class Progress:
    def __init__(self, requires_input: bool, to_show: str, is_alert: bool) -> None:
        self.requires_input = requires_input
        self.to_show = to_show
        self.is_alert = is_alert


class HSTTRunner:
    """
    Runner class, an iterator utility for HSTT.
    """

    def __init__(self, story: Story):
        self.story = story
        self.location = self.story.entry_point
        self.progress = Progress(
            bool(self.location.options) and not len(self.location.text.text),
            self.story.title,
            False,
        )

    def step(self):
        pass
