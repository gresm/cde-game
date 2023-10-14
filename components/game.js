"use strict";

import { Component, createContext } from "react";
import {
    ConsoleLine,
    Cursor,
    Container,
    InteractveSelection,
    InlineDiv,
} from "./console";
import { loadScriptsInQueue } from "../utils/scriptLoader";
import skulptModules from "../generated/skulpt-extra";

function generateNames(num) {
    var ret = [];
    for (const v of Array(num).keys()) {
        ret.push(String.fromCharCode(97 + v));
    }
    return ret;
}

/**
 *
 * @param {String} char
 * @returns {Number}
 */
function reverseName(char) {
    return char.charCodeAt(0) - 97;
}

/**
 *
 * @param {String} text
 * @param {Number} range
 * @returns {Boolean}
 */
function validateUserInput(text, range) {
    if (text.length != 1) {
        return false;
    }
    return 0 <= reverseName(text) < range;
}

/**
 * @typedef { {getValue: (key: string) => Object, setValue: (key: string, value: Object) => void, resetState: () => void, onFinishedTyping: (func: (text: string) => void) => void, triggerFinishedTyping: (text: string) => void} } TypingContextData
 * @type {import("react").Context<TypingContextData>}
 */

var typingContext = createContext({
    resetState: () => {},
    getValue: (key) => {},
    setValue: (key, value) => {},
    onFinishedTyping: (func) => {},
    triggerFinishedTyping: (text) => {},
});

class TypingContextProvider extends Component {
    constructor(props) {
        super(props);

        this.defaultState = {
            triggerFinishedTyping: this.callOnFinishedTyping.bind(this),
            onFinishedTyping: this.bindOnFinishedTyping.bind(this),
            resetState: this.resetState.bind(this),
            setValue: this.setValue.bind(this),
            getValue: this.getValue.bind(this),
        };

        /**
         * @type {TypingContextData}
         */
        this.state = {
            ...this.defaultState,
        };

        this.userState = {};

        this.triggersOnFinishedTyping = [];
    }

    refreshState() {
        this.setState({
            ...this.defaultState,
            ...this.userState,
        });
    }

    bindOnFinishedTyping(func) {
        this.triggersOnFinishedTyping.push(func);
    }

    callOnFinishedTyping(text) {
        this.triggersOnFinishedTyping.forEach((element) => {
            element(text);
        });
    }

    setValue(key, value) {
        this.userState[key] = value;
        this.refreshState();
    }

    getValue(key) {
        return this.state[key];
    }

    resetState() {
        this.setState(this.defaultState);
    }

    render() {
        return (
            <typingContext.Provider value={this.state}>
                {this.props.children}
            </typingContext.Provider>
        );
    }
}

class GameInteractveSelection extends InteractveSelection {
    static contextType = typingContext;

    onKeyPressed(ev) {
        if (!this.context.awaitingInput) {
            console.log("not wanted");
            return;
        }
        if (ev.key.length === 1) {
            this.updateState("text", this.state.text + ev.key);
        } else if (ev.key === "Backspace") {
            this.updateState(
                "text",
                this.state.text.substring(0, this.state.text.length - 1),
            );
        } else if (ev.key === "Enter") {
            this.onSubmit();
        } else if (ev.key == "ArrowUp" || ev.key == "ArrowLeft") {
            this.upSelection();
        } else if (ev.key == "ArrowDown" || ev.key == "ArrowRight") {
            this.downSelection();
        }
    }

    onSubmit() {
        var text = this.state.text;
        if (!validateUserInput(text, this.context.inputRange)) {
            return;
        }
        this.updateState("text", "");
        this.context.triggerFinishedTyping(text);
    }

    componentDidMount() {
        if (!this.mounted) {
            document.addEventListener("keydown", this.onKeyPressed.bind(this));
        }
        this.mounted = true;
    }
}

class SkulptRunner extends Component {
    skulpt = "../skulpt.min.js";
    skulptSdt = "../skulpt-stdlib.js";

    static contextType = typingContext;

    constructor(props) {
        super(props);

        this.isValid = this.props.story !== null;
        this.mainLoaded = false;
        this.libLoaded = false;
        this.code = "";
        this.wasMounted = false;
        this.divid = "game-text";

        /**
         * @type {TypingContextData}
         */
        this.context = this.context;
    }

    skulptMainLoaded = () => {
        this.mainLoaded = true;

        if (this.mainLoaded && this.libLoaded) {
            this.skulptLoaded();
        }
    };

    skulptStdlibLoaded = () => {
        this.libLoaded = true;

        if (this.mainLoaded && this.libLoaded && this.code !== "") {
            this.skulptLoaded();
            this.onAfterFullLoad();
        }
    };

    skulptPrint(text) {
        console.log(text);
    }

    skulptError(text) {
        console.error(text);
    }

    skulptLoaded() {
        function builtinRead(x) {
            if (
                Sk.builtinFiles !== undefined &&
                Sk.builtinFiles["files"][x] !== undefined
            ) {
                return Sk.builtinFiles["files"][x];
            }

            if (skulptModules[x] !== undefined) {
                return skulptModules[x];
            }
        }

        Sk.configure({
            __future__: Sk.python3,
            read: builtinRead,
        });

        Sk.divid = this.divid;
        Sk.gameInterface = {
            story: this.props.story,
            out: this.skulptPrint.bind(this),
            err: this.skulptError.bind(this),
            read: builtinRead
        };
    }

    progressGame(feedback) {
        /*this.setupInput(*/
        globalThis.ret = Sk.ffi.remapToJs(
            Sk.misceval.callsimArray(Sk.gameInterface.stepFunc, [
                Sk.builtin.int_(feedback),
            ]),
        );
        /*);*/
    }

    setupInput(number) {
        // TODO: fill it.
        if (number < 1) {
            return;
        }
        if (number == 1) {
            this.progressGame(0);
            return;
        }
        this.context.setValue("awaitingInput", true);
        this.context.setValue("names", generateNames(number));
        this.context.setValue("inputRange", number);
    }

    onFinishedTyping(text) {
        this.progressGame(reverseName(text));
    }

    onAfterFullLoad() {
        try {
            console.log(this.props.story);
            var code = Sk.importMainWithBody(
                "__main__",
                false,
                this.code,
                true,
            );
            Sk.gameInterface.stepFunc = code.tp$getattr(Sk.builtin.str("step"));
            this.context.onFinishedTyping(this.onFinishedTyping.bind(this));
            this.progressGame(-1);
        } catch (err) {
            if (err.toString !== undefined) {
                let codePeek = "";
                if (err.traceback !== undefined) {
                    err.traceback.forEach((value) => {
                        codePeek += `\nIn file: ${value.filename} on line ${value.lineno}\n`;
                        codePeek += String(
                            value.filename === "__main__.py"
                                ? this.code
                                : Sk.gameInterface.read(value.filename),
                        )
                            .split("\n", Number(value.lineno))
                            .pop();
                    });
                }
                console.error(err.toString() + codePeek);
                globalThis["skulptError"] = err;
                if (Sk?.gameInterface?.err !== undefined) {
                    Sk.gameInterface.err(err.toString() + codePeek)
                }
            }
            throw err;
        }
    }

    loadSkulpt() {
        loadScriptsInQueue(
            [this.skulpt, this.skulptSdt],
            [this.skulptMainLoaded, this.skulptStdlibLoaded],
        );
    }

    componentDidMount() {
        if (!this.wasMounted) {
            this.context.setValue("awaitingInput", false);

            this.loadSkulpt();

            if (this.code === "") {
                fetch("../game/main.py").then((value) => {
                    value.text().then((value) => {
                        this.code = value;
                        if (this.mainLoaded && this.libLoaded) {
                            this.onAfterFullLoad();
                        }
                    });
                });
            }
        }

        this.wasMounted = true;
    }

    render() {
        return (
            <>
                <ConsoleLine id="to-remove-on-load">
                    {this.isValid
                        ? "Loading..."
                        : `Story: ${this.props.name} not found.`}
                </ConsoleLine>
                <InlineDiv>
                    <div id={this.divid} />
                    <GameInteractveSelection />
                    <Cursor />
                </InlineDiv>
            </>
        );
    }
}

export class Game extends Component {
    render() {
        return (
            <Container id="game-wrappper">
                <ConsoleLine isInput={true}>
                    ./run {this.props.name}
                </ConsoleLine>
                <TypingContextProvider>
                    <SkulptRunner
                        story={this.props.story}
                        name={this.props.name}
                    />
                </TypingContextProvider>
            </Container>
        );
    }
}
