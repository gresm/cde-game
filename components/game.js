"use strict";

import React, { Component, createContext, useContext, StrictMode } from "react";
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
        return parsed - 1;
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
            names: [],
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

    refreshState(callback) {
        this.setState(
            {
                ...this.defaultState,
                ...this.userState,
            },
            callback,
        );
    }

    bindOnFinishedTyping(func) {
        this.triggersOnFinishedTyping.push(func);
    }

    callOnFinishedTyping(text, realText) {
        this.triggersOnFinishedTyping.forEach((element) => {
            element(text, realText);
        });
    }

    setValue(key, value, callback) {
        this.userState[key] = value;
        this.refreshState(callback);
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
            super.onKeyPressed();
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
        this.context.triggerFinishedTyping(userInput, text);
    }

    componentDidMount() {
        if (!this.mounted) {
            document.addEventListener("keydown", this.onKeyPressed.bind(this));
        }
        this.mounted = true;
    }
}

function Line({ text, textType, moveTo }) {
    const context = useContext(typingContext);

    if (textType === 0) {
        return <a>{text}</a>;
    } else if (textType === 1) {
        return (
            <a>
                <span style={{ backgroundColor: "orangered" }}>{text}</span>
            </a>
        );
    } else if (textType === 2) {
        return (
            <a
                style={{ textDecorationLine: "underline" }}
                onClick={() => {
                    if (context.names.indexOf(moveTo) !== -1) {
                        context.triggerFinishedTyping(
                            context.names.indexOf(moveTo),
                            moveTo,
                        );
                    }
                }}
            >
                {text}
            </a>
        );
    }
}

Line.propTypes = {
    text: PropTypes.string,
    textType: PropTypes.number,
    moveTo: PropTypes.string,
};

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
        Sk.gameInterface.hook("step");
    }

    endStep() {
        if (this.context.names.length == 0) {
            this.context.setValue("awaitingInput", false);
            return;
        }

        if (this.context.names.length == 1) {
            this.context.setValue("awaitingInput", false);
            setTimeout(this.progressGame.bind(this), 500);
            return;
        }

        this.context.setValue("awaitingInput", true);
    }

    onFinishedTyping(userInput, realInput) {
        this.setState(
            {
                ...this.state,
                userInput: userInput,
                toPrint: this.state.toPrint.slice(0, -1).concat([
                    {
                        ...this.state.toPrint.at(-1),
                        text: this.state.toPrint.at(-1).text + realInput,
                    },
                ]),
            },
            () => {
                Sk.gameInterface.hook("after_input");
                this.progressGame();
            },
        );
    }

    *iterLines() {
        if (this.state["toPrint"].length == 0) return;

        for (let i = 0; i < this.state["toPrint"].length - 1; i++) {
            let line = this.state["toPrint"][i];
            yield (
                <div key={i}>
                    <Line
                        text={line.text}
                        textType={line.textType}
                        moveTo={line.moveTo}
                    />
                    <br />
                </div>
            );
        }
        let line = this.state["toPrint"][this.state["toPrint"].length - 1];

        yield (
            <InlineDiv key="lastLine">
                <Line
                    text={line.text}
                    textType={line.textType}
                    moveTo={line.moveTo}
                />
                <GameInteractveSelection />
                <Cursor />
            </InlineDiv>
        );
    }

    appendLine(line) {
        this.state["toPrint"].push({
            text: line[0],
            textType: line[1],
            moveTo: line[2],
        });
        this.forceUpdate(() => {
            if (line[1] === 1) {
                setTimeout(() => globalThis.alert(line[0]), 100);
            }
        });
    }

    clearText() {
        this.setState({ ...this.state, toPrint: [] });
    }

    onAfterFullLoad() {
        try {
            globalThis.codeRan = Sk.importMainWithBody(
                "__main__",
                false,
                this.code,
                true,
            );
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
        <StrictMode>
            <Container id="game-wrappper">
                <ConsoleLine isInput={true}>./run {name}</ConsoleLine>
                <TypingContextProvider>
                    <SkulptRunner story={story} name={name} />
                </TypingContextProvider>
            </Container>
        </StrictMode>
    );
}

Game.propTypes = { name: PropTypes.string, story: PropTypes.any };
