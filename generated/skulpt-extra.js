// This file was automatically generated. Don't change it.
const val = {"./game.py":"import game_interface as gi\nimport hstt_runner\nfrom typing import cast\n\n\nclass RunnerAbstr:\n    def appendLine(self, text):\n        pass\n\n\nrunner = cast(RunnerAbstr, gi.get_runner())\n\n\ndef setup():\n    gi.set_value(\"showLoadPrompt\", False, True)\n    gi.set_value(\"names\", [])\n\n\ndef hook(name: str):\n    def inner(func):\n        gi.set_hook(name, func)\n        return func\n    return inner\n\n\ndef print_line(text: str):\n    runner.appendLine(text)\n\n\nstep_hook = hook(\"step\")\nstory = hstt_runner.Story.parse(gi.get_story())\n","./game_interface.js":"var $builtinmodule=function(){let Sk=globalThis.Sk;Sk.gameInterface.hooks={},Sk.gameInterface.hook=function(name){void 0!==Sk.gameInterface.hooks[name]&&Sk.misceval.callsimArray(Sk.gameInterface.hooks[name],[])};var mod={};return mod.__name__=new Sk.builtin.str(\"game_interface\"),mod.get_story=new Sk.builtin.func(function(){return Sk.abstr.checkArgsLen(\"get_story\",arguments.length,0,0),Sk.ffi.remapToPy(Sk.gameInterface.story)}),mod.get_runner=new Sk.builtin.func(function(){return Sk.abstr.checkArgsLen(\"get_runner\",arguments.length,0,0),Sk.ffi.proxy(Sk.gameInterface.runner)}),mod._debug=new Sk.builtin.func(function(value){Sk.abstr.checkArgsLen(\"_debug\",arguments.length,1,1),console.log(value)}),mod.set_hook=new Sk.builtin.func(function(name,hook){Sk.abstr.checkArgsLen(\"set_hook\",arguments.length,2,2),Sk.gameInterface.hooks[Sk.ffi.toJsString(name)]=hook}),mod.set_value=new Sk.builtin.func(function(name,value,use_state){Sk.abstr.checkArgsLen(\"set_value\",arguments.length,2,3),void 0!==use_state&&Sk.ffi.isTrue(use_state)?(Sk.gameInterface.runner.state[Sk.ffi.toJsString(name)]=Sk.ffi.remapToJs(value),Sk.gameInterface.runner.setState(Sk.gameInterface.runner.state)):Sk.gameInterface.runner.context.setValue(Sk.ffi.toJsString(name),Sk.ffi.remapToJs(value))}),mod.get_value=new Sk.builtin.func(function(name,use_state){return Sk.abstr.checkArgsLen(\"set_value\",arguments.length,1,2),void 0!==use_state&&Sk.ffi.isTrue(use_state)?Sk.ffi.remapToPy(Sk.gameInterface.runner.state[Sk.ffi.toJsString(name)]):Sk.ffi.remapToPy(Sk.gameInterface.runner.context.getValue(Sk.ffi.toJsString(name)))}),mod};","./gamejs.py":"import game_interface as gi\nimport hstt_runner\nfrom typing import cast\n\n\nclass RunnerAbstr:\n    def appendLine(self, text):\n        pass\n\n    def forceUpdate(self):\n        pass\n\n\nrunner = cast(RunnerAbstr, gi.get_runner())\n\n\ndef setup():\n    gi.set_value(\"showLoadPrompt\", False, True)\n    gi.set_value(\"names\", [])\n    runner.forceUpdate()\n\n\ndef hook(name: str):\n    def inner(func):\n        gi.set_hook(name, func)\n        return func\n    return inner\n\n\ndef print_line(text: str):\n    runner.appendLine(text)\n\n\nstep_hook = hook(\"step\")\nstory = hstt_runner.Story.parse(gi.get_story())\n","./hello.py":"def hello(person):\n    return f\"Hello {person}!\"\n","./hstt_runner.py":"\"\"\"\nUtility script to run HSTT formatted json files.\n\"\"\"\nfrom typing import Literal, Optional, Union\n\nfrom typing_extensions import NotRequired, TypeAlias, TypedDict, TypeGuard\n\n\nclass RawTextLine(TypedDict):\n    text: str\n    type: Literal[\"text\", \"alert\"]\n\n\nRawNodeText: TypeAlias = \"list[RawTextLine]\"\nRawNodeOptions: TypeAlias = \"list[list[str]]\"\n\n\nclass RawStoryNode(TypedDict):\n    text: RawNodeText\n    options: NotRequired[RawNodeOptions]\n    goto: NotRequired[str]\n\n\nclass RawStory(TypedDict):\n    title: str\n    nodes: dict[str, RawStoryNode]\n\n\nclass HSTTParserException(Exception):\n    pass\n\n\nclass TextLine:\n    \"\"\"\n    Class for text lines.\n    \"\"\"\n\n    def __init__(self, text: str, text_type: str):\n        self.text = text\n        self.type = text_type\n\n    def __repr__(self):\n        return f\"{self.type}: {self.text}\"\n\n    @classmethod\n    def parse(cls, data: RawTextLine):\n        \"\"\"\n        Parses text line from dictionary.\n        \"\"\"\n        return cls(data[\"text\"], data[\"type\"])\n\n\nclass NodeText:\n    \"\"\"\n    Class to represent text in a node.\n    \"\"\"\n\n    def __init__(self, text: list[TextLine]):\n        self.text = text\n\n    def __repr__(self):\n        return f'[{\", \".join([str(line) for line in self.text])}]'\n\n    def __len__(self):\n        return len(self.text)\n\n    @classmethod\n    def parse(cls, data: list[RawTextLine]):\n        \"\"\"\n        Parses text from list of dictionaries.\n        \"\"\"\n        return cls([TextLine.parse(line) for line in data])\n\n\nclass OptionElement:\n    \"\"\"\n    Class to represent option element.\n    \"\"\"\n\n    def __init__(self, goto: str, text: str):\n        self.text = text\n        self.goto = goto\n\n    def __repr__(self):\n        return f\"{self.text} -> {self.goto}\"\n\n    @classmethod\n    def parse(cls, data: tuple[str, str]):\n        \"\"\"\n        Parses option element from tuple.\n        \"\"\"\n        return cls(data[0], data[1])\n\n\nclass NodeOptions:\n    \"\"\"\n    Class to represent options in a node.\n    \"\"\"\n\n    def __init__(self, options: list[OptionElement]):\n        self.options = options\n\n    def __len__(self):\n        return len(self.options)\n\n    def __repr__(self):\n        return f'[{\", \".join([str(option) for option in self.options])}]'\n\n    @classmethod\n    def parse(cls, data: RawNodeOptions):\n        \"\"\"\n        Parses options from list of dictionaries.\n        \"\"\"\n        return cls([OptionElement.parse((option[0], option[1])) for option in data])\n\n\nclass StoryNode:\n    def __init__(\n        self,\n        name: str,\n        text: NodeText,\n        options: NodeOptions,\n        goto: Optional[str] = None,\n    ):\n        self.name = name\n        self.text = text\n        self.goto = goto\n        self.options = options\n\n    def __repr__(self):\n        return f\"{self.name}:\\n{self.text}\\n{self.options}\"\n\n    @classmethod\n    def parse(cls, name: str, data: RawStoryNode):\n        \"\"\"\n        Parses story node from dictionary.\n        \"\"\"\n        return cls(\n            name,\n            NodeText.parse(data[\"text\"]),\n            NodeOptions.parse(data.get(\"options\", [])),\n            data.get(\"goto\", None),\n        )\n\n\nclass Story:\n    def __init__(self, title: str, nodes: dict[str, StoryNode]):\n        self.title = title\n        self.nodes = nodes\n        self.entry_point = nodes[\"\"]\n\n    def __repr__(self):\n        return f\"{self.nodes}\"\n\n    def __iter__(self):\n        return HSTTRunner(self)\n\n    @classmethod\n    def parse(\n        cls,\n        data: RawStory,\n    ):\n        \"\"\"\n        Parses story from dictionary.\n        \"\"\"\n        ret = cls(\n            data[\"title\"],\n            {\n                name: StoryNode.parse(name, value)\n                for name, value in data[\"nodes\"].items()\n            },\n        )\n        ret.validate()\n        return ret\n\n    def validate(self):\n        \"\"\"\n        Validates story.\n        \"\"\"\n        for node_name in self.nodes:\n            node = self.nodes[node_name]\n            if node.goto is not None and node.goto not in self.nodes:\n                raise HSTTParserException(\n                    f\"Node {node_name} has goto {node.goto} but there is not such location.\"\n                )\n\n            if len(node.options):\n                for option in node.options.options:\n                    if option.goto not in self.nodes:\n                        raise HSTTParserException(\n                            f\"Node {node_name} has option {option.text} -> {option.goto} but \"\n                            f\"there is not such location.\"\n                        )\n\n            if node.goto and len(node.options):\n                raise HSTTParserException(\n                    f\"Collision in: {node_name}. The node has both goto and options. \"\n                    f\"This behaviour is not supported.\"\n                )\n\n        if \"\" not in self.nodes:\n            raise HSTTParserException(\"There is no start node.\")\n\n\nLOCATION_END: Literal[-1] = -1\nLOCATION_NODE: Literal[0] = 0\nLOCATION_TEXT: Literal[1] = 1\nLOCATION_OPTION: Literal[2] = 2\n_LOCATION_TYPE: TypeAlias = Union[Literal[-1], Literal[0], Literal[1], Literal[2]]\n_VALID_LOCATION = Union[None, StoryNode, TextLine, NodeOptions]\n\n\nclass Location:\n    value: _VALID_LOCATION\n    loc_type: _LOCATION_TYPE\n    parent_node: Optional[StoryNode]\n\n    def __init__(self, value: _VALID_LOCATION, loc_type: _LOCATION_TYPE) -> None:\n        self.value = value\n        self.loc_type = loc_type\n        self.parent_node = None\n        self.text_line: int = -1\n        self.selected_option: int = -1\n\n    def enter_node_text(self) -> TypeGuard[\"_TextLocation\"]:\n        if (\n            self.loc_type != LOCATION_NODE\n            or not isinstance(self.value, StoryNode)\n            or not len(self.value.text)\n        ):\n            return False\n\n        self.parent_node = self.value\n        self.loc_type = LOCATION_TEXT\n        self.text_line = 0\n        self.value = self.parent_node.text.text[self.text_line]\n        return True\n\n    def advance_text(self) -> TypeGuard[\"_TextLocation\"]:\n        if (\n            self.loc_type != LOCATION_TEXT\n            or not isinstance(self.value, TextLine)\n            or not self.parent_node\n        ):\n            return False\n\n        self.text_line += 1\n        if self.text_line >= len(self.parent_node.text):\n            return False\n        self.value = self.parent_node.text.text[self.text_line]\n        return True\n\n    def exit_node_text(self) -> TypeGuard[\"_NodeLocation\"]:\n        if (\n            self.loc_type != LOCATION_TEXT\n            or not isinstance(self.value, TextLine)\n            or not self.parent_node\n        ):\n            return False\n\n        self.text_line = -1\n        self.loc_type = LOCATION_NODE\n        self.value = self.parent_node\n        self.parent_node = None\n\n        return True\n\n    def enter_node_options(self) -> TypeGuard[\"_OptionsLocation\"]:\n        if (\n            self.loc_type != LOCATION_NODE\n            or not isinstance(self.value, StoryNode)\n            or not len(self.value.options)\n        ):\n            return False\n\n        self.parent_node = self.value\n        self.loc_type = LOCATION_OPTION\n        self.selected_option = -1\n\n        return True\n\n    def select_option(self, option: int) -> TypeGuard[\"_OptionsLocation\"]:\n        if (\n            self.loc_type != LOCATION_OPTION\n            or not isinstance(self.value, NodeOptions)\n            or not len(self.value)\n        ):\n            return False\n\n        if not 0 <= option < len(self.value):\n            return False\n\n        self.selected_option = option\n        return True\n\n    def leave_node_options(self) -> TypeGuard[\"_NodeLocation\"]:\n        if (\n            self.loc_type != LOCATION_OPTION\n            or not isinstance(self.value, NodeOptions)\n            or not len(self.value)\n        ):\n            return False\n\n        self.value = self.parent_node\n        self.loc_type = LOCATION_NODE\n        return True\n\n    def set_node(self, node: StoryNode) -> TypeGuard[\"_NodeLocation\"]:\n        self.value = node\n        self.loc_type = LOCATION_NODE\n        return True\n\n    def has_goto(self) -> TypeGuard[\"_NodeLocation\"]:\n        return (\n            self.loc_type == LOCATION_NODE\n            and isinstance(self.value, StoryNode)\n            and self.value.goto is not None\n        )\n\n    def finnish(self) -> TypeGuard[\"_EndLocation\"]:\n        self.value = None\n        self.loc_type = LOCATION_END\n        return True\n\n\nclass _EndLocation(Location):\n    value: None\n    loc_type: Literal[-1]\n    parent_node: None\n\n\nclass _NodeLocation(Location):\n    value: StoryNode\n    loc_type: Literal[0]\n    parent_node: None\n\n\nclass _TextLocation(Location):\n    value: TextLine\n    loc_type: Literal[1]\n    parent_node: StoryNode\n\n\nclass _OptionsLocation(Location):\n    value: NodeOptions\n    loc_type: Literal[2]\n    parent_node: StoryNode\n\n\nclass HSTTRunner:\n    \"\"\"\n    Runner class for HSTT game format.\n    \"\"\"\n\n    def __init__(self, story: Story):\n        self.story = story\n        self.location = Location(self.story.entry_point, LOCATION_NODE)\n\n    def step(self):\n        location = self.location\n        # TODO: other cases than LOCATION_NODE\n        if location.loc_type == LOCATION_NODE:\n            if not location.enter_node_text():\n                if (\n                    location.has_goto()\n                    and isinstance(location.value, StoryNode)\n                    and location.value.goto is not None\n                ):\n                    location.set_node(self.story.nodes[location.value.goto])\n                    return location\n                elif location.enter_node_options():\n                    # TODO: what to do if there is no more text to show and there is no more goto? (choices and end).\n                    pass\n","./test.js":"console.log(\"This is a test\");","./typing.py":"class _getitem:\n    def __getitem__(self, name):\n        return name\n\n\nOptional = _getitem()\nUnion = _getitem()\nLiteral = _getitem()\n\n\ndef cast(_typ, val):\n    return val\n","./typing_extensions.py":"class _getitem:\n    def __getitem__(self, name):\n        return name\n\n\nNotRequired = _getitem()\nTypeAlias = _getitem()\nTypeGuard = _getitem()\n\n\nclass TypedDict(dict):\n    pass\n"};
export default val;