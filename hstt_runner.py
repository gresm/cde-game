"""
Utility script to run HSTT formatted json files.
"""
import sys

if sys.version == "3.7(ish) [Skulpt]":
    class _getitem:
        def __getitem__(self, name):
            return name
    
    Optional = _getitem()
    Union = _getitem()
else:
    from typing import Optional, Union


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
    def parse(cls, data: dict[str, str]):
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
    def parse(cls, data: list[dict[str, str]]):
        """
        Parses text from list of dictionaries.
        """
        return cls([TextLine.parse(line) for line in data])


class OptionElement:
    """
    Class to represent option element.
    """
    def __init__(self, text: str, goto: str):
        self.text = text
        self.goto = goto

    def __repr__(self):
        return f'{self.text} -> {self.goto}'

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
    def parse(cls, data: dict[str, str]):
        """
        Parses options from list of dictionaries.
        """
        return cls([OptionElement.parse(option) for option in data.items()])


class StoryNode:
    def __init__(self, name: str, text: NodeText, options: NodeOptions, goto: Optional[str] = None):
        self.name = name
        self.text = text
        self.goto = goto
        self.options = options

    def __repr__(self):
        return f'{self.name}:\n{self.text}\n{self.options}'

    @classmethod
    def parse(cls, data: Union[dict[str, list[dict[str, str]], dict[str, str]], str]):
        """
        Parses story node from dictionary.
        """
        return cls(
            data["name"],
            NodeText.parse(data["text"]),
            NodeOptions.parse(data.get("options", {})),
            data.get("goto")
        )


class Story:
    def __init__(self, nodes: dict[str, StoryNode]):
        self.nodes = nodes

    def __repr__(self):
        return f'{self.nodes}'

    def __iter__(self):
        return HSTTRunner(self)

    @classmethod
    def parse(cls, data: Union[dict[str, dict[str, list[dict[str, str]], dict[str, str]], str]]):
        """
        Parses story from dictionary.
        """
        ret = cls({
            name: StoryNode.parse(data[name]) for name in data
        })
        ret.validate()
        return ret

    def validate(self):
        """
        Validates story.
        """
        for node_name in self.nodes:
            node = self.nodes[node_name]
            if node.goto and node_name not in self.nodes:
                raise HSTTParserException(f"Node {node_name} has goto {node.goto} but there is not such location.")

            if node.options:
                for option in node.options.options:
                    if option not in self.nodes:
                        raise HSTTParserException(f"Node {node_name} has option {option.text} -> {option.goto} but "
                                                  f"there is not such location.")

            if node.goto and node.options:
                raise HSTTParserException(f"Collision in: {node_name}. The node has both goto and options. "
                                          f"This behaviour is not supported.")

        if "" not in self.nodes:
            raise HSTTParserException("There is no start node.")


class HSTTRunnerCurrentNode:
    def __init__(self, runner: "HSTTRunner", text: NodeText, options: NodeOptions):
        self.runner = runner
        self.text = text
        self.options = options
        self.selected = None

    def select(self, option: str):
        """
        Selects option.
        """
        if option not in self.options.options:
            raise HSTTParserException(f"Option {option} is not available.")
        self.selected = option


class HSTTRunner:
    """
    Runner class, an iterator utility for HSTT.
    """
    def __init__(self, story: Story):
        self.story = story
        self.current_node = self.story.nodes[""]
        self.selected_option: Union[str, None] = None

    def __iter__(self):
        return self

    def __next__(self):
        if self.current_node.goto:
            self.current_node = self.story.nodes[self.current_node.goto]
