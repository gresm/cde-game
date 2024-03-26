"use strict";

import React, { Component, createContext } from "react";
import PropTypes from "prop-types";

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
 * @type {object}
 */
let Sk = undefined;

/**
 *
 * @param {String} text
 * @param {String[]} names
 * @returns {Number}
 */
function validateUserInput(text, names) {
    if (isNaN(parseInt(text))) {
        return names.indexOf(text);
    }
    let parsed = parseInt(text);
    if (1 <= parsed <= names.length) {
        return parsed;
    }
    return -1;
}

/**
 * @typedef { {getValue: (key: string) => Object, setValue: (key: string, value: Object) => void, resetState: () => void, onFinishedTyping: (func: (text: string) => void) => void, triggerFinishedTyping: (text: string) => void, names: string[]} } TypingContextData
 * @type {import("react").Context<TypingContextData>}
 */

var typingContext = createContext({
    resetState: () => {},
    getValue: () => {},
    setValue: () => {},
    onFinishedTyping: () => {},
    triggerFinishedTyping: () => {},
    names: [],
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

TypingContextProvider.propTypes = { children: PropTypes.any };

class GameInteractveSelection extends InteractveSelection {
    static contextType = typingContext;

    onKeyPressed(ev) {
        if (!this.context.awaitingInput) {
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
        var userInput = validateUserInput(text, this.context.names);
        if (userInput === -1) {
            return;
        }
        this.updateState("text", "");
        this.context.triggerFinishedTyping(userInput);
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
        this.output = "";
        this.state = {
            showLoadPrompt: true,
            userInput: -1,
            toPrint: [],
        };

        /**
         * @type {TypingContextData}
         */
        this.context;
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
        this.output = this.output.concat(text);
        console.log(text);
    }

    displayTextWorker() {
        document.getElementById(this.divid).innerText += this.output.charAt(0);
        this.output = this.output.slice(1);
    }

    skulptError(text) {
        console.error(text);
    }

    skulptLoaded() {
        Sk = globalThis.Sk;
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
            read: builtinRead,
            runner: this,
        };
    }

    progressGame() {
        /*this.setupInput(*/
        Sk.gameInterface.hook("step");
        /*);*/
    }

    setupInput(names) {
        // TODO: fill it.
        if (names.length < 1) {
            this.context.setValue("awaitingInput", false);
            return;
        }
        if (names.length == 1) {
            this.progressGame();
            return;
        }
        this.context.setValue("awaitingInput", true);
        this.context.setValue("names", generateNames(names));
    }

    onFinishedTyping(userInput) {
        this.setState({ ...this.state, userInput: userInput });
    }

    *iterLines() {
        if (this.state["toPrint"].length - 1 == 0) return;

        for (let i = 0; i < this.state["toPrint"].length - 1; i++)
            yield (
                <>
                    {this.state["toPrint"][i]}
                    <br />
                </>
            );

        yield (
            <InlineDiv key="lastLine">
                {this.state["toPrint"][this.state["toPrint"].length - 1]}
                <GameInteractveSelection />
                <Cursor />
            </InlineDiv>
        );
    }

    appendLine(text) {
        this.state["toPrint"].push(text);
        this.forceUpdate();
    }

    onAfterFullLoad() {
        try {
            var code = Sk.importMainWithBody(
                "__main__",
                false,
                this.code,
                true,
            );
            Sk.gameInterface.stepFunc = code.tp$getattr(Sk.builtin.str("step"));
            this.context.onFinishedTyping(this.onFinishedTyping.bind(this));
            this.progressGame();
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
                    Sk.gameInterface.err(err.toString() + codePeek);
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
                {this.state.showLoadPrompt ? (
                    <ConsoleLine id="to-remove-on-load">
                        {this.isValid
                            ? "Loading..."
                            : `Story: ${this.props.name} not found.`}
                    </ConsoleLine>
                ) : (
                    [...this.iterLines()]
                )}
            </>
        );
    }
}

SkulptRunner.propTypes = { name: PropTypes.string, story: PropTypes.any };

export function Game({ name, story }) {
    return (
        <Container id="game-wrappper">
            <ConsoleLine isInput={true}>./run {name}</ConsoleLine>
            <TypingContextProvider>
                <SkulptRunner story={story} name={name} />
            </TypingContextProvider>
        </Container>
    );
}

Game.propTypes = { name: PropTypes.string, story: PropTypes.any };
