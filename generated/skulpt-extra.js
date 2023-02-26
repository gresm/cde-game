// This file was automatically generated. Don't change it.
export default JSON.parse(String.raw`{"./game_interface.js":"var $builtinmodule=function(name){var mod={};return mod.__name__=new Sk.builtin.str(\"game_interface\"),mod.get_story=new Sk.builtin.func(function(){return Sk.builtin.pyCheckArgsLen(\"get_story\",arguments.length,0,0),Sk.ffi.remapToPy(Sk.gameInterface.story)}),mod};","./hello.py":"def hello(person):\n    return f\"Hello {person}!\"","./hstt_runner.py":"\"\"\"\nUtility script to run HSTT formatted json files.\n\"\"\"\n\n\nclass HSTTParserException(Exception):\n    pass\n\n\nclass TextLine:\n    \"\"\"\n    Class for text lines.\n    \"\"\"\n    def __init__(self, text: str, text_type: str):\n        self.text = text\n        self.type = text_type\n\n    def __repr__(self):\n        return f\"{self.type}: {self.text}\"\n\n    @classmethod\n    def parse(cls, data: dict[str, str]):\n        \"\"\"\n        Parses text line from dictionary.\n        \"\"\"\n        return cls(data[\"text\"], data[\"type\"])\n\n\nclass NodeText:\n    \"\"\"\n    Class to represent text in a node.\n    \"\"\"\n    def __init__(self, text: list[TextLine]):\n        self.text = text\n\n    def __repr__(self):\n        return f'[{\", \".join([str(line) for line in self.text])}]'\n\n    @classmethod\n    def parse(cls, data: list[dict[str, str]]):\n        \"\"\"\n        Parses text from list of dictionaries.\n        \"\"\"\n        return cls([TextLine.parse(line) for line in data])\n\n\nclass OptionElement:\n    \"\"\"\n    Class to represent option element.\n    \"\"\"\n    def __init__(self, text: str, goto: str):\n        self.text = text\n        self.goto = goto\n\n    def __repr__(self):\n        return f'{self.text} -> {self.goto}'\n\n    @classmethod\n    def parse(cls, data: tuple[str, str]):\n        \"\"\"\n        Parses option element from tuple.\n        \"\"\"\n        return cls(data[0], data[1])\n\n\nclass NodeOptions:\n    \"\"\"\n    Class to represent options in a node.\n    \"\"\"\n    def __init__(self, options: list[OptionElement]):\n        self.options = options\n\n    def __bool__(self):\n        return len(self.options) > 0\n\n    def __repr__(self):\n        return f'[{\", \".join([str(option) for option in self.options])}]'\n\n    @classmethod\n    def parse(cls, data: dict[str, str]):\n        \"\"\"\n        Parses options from list of dictionaries.\n        \"\"\"\n        return cls([OptionElement.parse(option) for option in data.items()])\n\n\nclass StoryNode:\n    def __init__(self, name: str, text: NodeText, options: NodeOptions, goto: str | None = None):\n        self.name = name\n        self.text = text\n        self.goto = goto\n        self.options = options\n\n    def __repr__(self):\n        return f'{self.name}:\\n{self.text}\\n{self.options}'\n\n    @classmethod\n    def parse(cls, data: dict[str, list[dict[str, str]] | dict[str, str]] | str):\n        \"\"\"\n        Parses story node from dictionary.\n        \"\"\"\n        return cls(\n            data[\"name\"],\n            NodeText.parse(data[\"text\"]),\n            NodeOptions.parse(data.get(\"options\", {})),\n            data.get(\"goto\")\n        )\n\n\nclass Story:\n    def __init__(self, nodes: dict[str, StoryNode]):\n        self.nodes = nodes\n\n    def __repr__(self):\n        return f'{self.nodes}'\n\n    def __iter__(self):\n        return HSTTRunner(self)\n\n    @classmethod\n    def parse(cls, data: dict[str, dict[str, list[dict[str, str]] | dict[str, str]] | str]):\n        \"\"\"\n        Parses story from dictionary.\n        \"\"\"\n        ret = cls({\n            name: StoryNode.parse(data[name]) for name in data\n        })\n        ret.validate()\n        return ret\n\n    def validate(self):\n        \"\"\"\n        Validates story.\n        \"\"\"\n        for node_name in self.nodes:\n            node = self.nodes[node_name]\n            if node.goto and node_name not in self.nodes:\n                raise HSTTParserException(f\"Node {node_name} has goto {node.goto} but there is not such location.\")\n\n            if node.options:\n                for option in node.options.options:\n                    if option not in self.nodes:\n                        raise HSTTParserException(f\"Node {node_name} has option {option.text} -> {option.goto} but \"\n                                                  f\"there is not such location.\")\n\n            if node.goto and node.options:\n                raise HSTTParserException(f\"Collision in: {node_name}. The node has both goto and options. \"\n                                          f\"This behaviour is not supported.\")\n\n        if \"\" not in self.nodes:\n            raise HSTTParserException(\"There is no start node.\")\n\n\nclass HSTTRunnerCurrentNode:\n    def __init__(self, runner: HSTTRunner, text: NodeText, options: NodeOptions):\n        self.runner = runner\n        self.text = text\n        self.options = options\n        self.selected = None\n\n    def select(self, option: str):\n        \"\"\"\n        Selects option.\n        \"\"\"\n        if option not in self.options.options:\n            raise HSTTParserException(f\"Option {option} is not available.\")\n        self.selected = option\n\n\nclass HSTTRunner:\n    \"\"\"\n    Runner class, an iterator utility for HSTT.\n    \"\"\"\n    def __init__(self, story: Story):\n        self.story = story\n        self.current_node = self.story.nodes[\"\"]\n        self.selected_option: str | None = None\n\n    def __iter__(self):\n        return self\n\n    def __next__(self):\n        if self.current_node.goto:\n            self.current_node = self.story.nodes[self.current_node.goto]\n","./test.js":"console.log(\"This is a test\");"}`)
