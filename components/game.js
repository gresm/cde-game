"use strict";

import { Component, createContext } from "react";
import { ConsoleLine, Cursor, Container, InteractveSelection } from "./console";
import { loadScriptsInQueue } from "../utils/scriptLoader";
import skulptModules from "../generated/skulpt-extra";


/**
 * @typedef { {typing: string, setState: (key: string, value: Object) => {}, onFinishedTyping: (func: () => {}), triggerFinishedTyping: () => {}} } TypingContextData
 * @type {import("react").Context<TypingContextData>}
 */

var typingContext = createContext({
    typing: "",
    setState: (key, value) => { },
    onFinishedTyping: (func) => { },
    triggerFinishedTyping: () => { }
})

class TypingContextProvider extends Component {
    constructor(props) {
        super(props);

        this.defaultState = {
            triggerFinishedTyping: this.callOnFinishedTyping.bind(this),
            onFinishedTyping: this.bindOnFinishedTyping.bind(this),
            resetState: this.resetState.bind(this),
            setValue: this.setValue.bind(this),
            typing: ""
        }

        /**
         * @type {TypingContextData}
        */
        this.state = {
            ...this.defaultState
        }

        this.triggersOnFinishedTyping = []
    }

    bindOnFinishedTyping(func) {
        this.triggersOnFinishedTyping.push(func)
    }

    callOnFinishedTyping() {
        this.triggersOnFinishedTyping.forEach(element => {
            element();
        });
    }

    setValue(key, value) {
        this.setState({ ...this.state, [key]: value });
    }

    resetState() {
        this.setState(this.defaultState);
    }

    render() {
        return (
            <typingContext.Provider value={this.state}>
                {this.props.children}
            </typingContext.Provider>
        )
    }
}

class SkulptRunner extends Component {
    skulpt = "../skulpt.min.js";
    skulptSdt = "../skulpt-stdlib.js";

    constructor(props) {
        super(props);

        this.isValid = this.props.story !== null;
        this.mainLoaded = false;
        this.libLoaded = false;
        this.code = "";
        this.wasMounted = false;
        this.divid = "game-text"
    }

    skulptMainLoaded = () => {
        this.mainLoaded = true;

        if (this.mainLoaded && this.libLoaded) {
            this.skulptLoaded();
        }
    }

    skulptStdlibLoaded = () => {
        this.libLoaded = true;

        if (this.mainLoaded && this.libLoaded && this.code !== "") {
            this.skulptLoaded();
            this.onAfterFullLoad();
        }
    }

    skulptLoaded() {
        function builtinRead(x) {
            if (Sk.builtinFiles !== undefined && Sk.builtinFiles["files"][x] !== undefined) {
                return Sk.builtinFiles["files"][x];
            }

            if (skulptModules[x] !== undefined) {
                return skulptModules[x];
            }
        }

        Sk.configure({
            __future__: Sk.python3,
            read: builtinRead
        });

        Sk.divid = this.divid;
        Sk.gameInterface = {};
        Sk.gameInterface.story = this.props.story;
    }

    progressGame(feedback) {
        this.setupInput(Sk.ffi.remapToJs(Sk.gameInterface.stepFunc.tp$call([feedback])));
    }

    setupInput(number) {
        // TODO: fill it.
    }

    onAfterFullLoad() {
        var code = Sk.importMainWithBody("__main__", false, this.code, true);
        Sk.gameInterface.stepFunc = code.tp$getattr(Sk.builtin.str("step"));
        this.progressGame(0);
    }

    loadSkulpt() {
        loadScriptsInQueue([this.skulpt, this.skulptSdt], [this.skulptMainLoaded, this.skulptStdlibLoaded])
    }

    componentDidMount() {
        if (!this.wasMounted) {
            this.loadSkulpt();

            if (this.code === "") {
                fetch("../game/main.py").then((value) => {
                    value.text().then((value) => {
                        this.code = value;
                        if (this.mainLoaded && this.libLoaded) {
                            this.onAfterFullLoad();
                        }
                    })
                })
            }
        }

        this.wasMounted = true;
    }

    render() {
        return <>
            <ConsoleLine id={this.divid} >{this.isValid ? "Loading..." : `Story: ${this.props.name} not found.`}</ConsoleLine>
            <InteractveSelection /><Cursor />
        </>
    }
}

export class Game extends Component {
    render() {
        return (
            <Container id="game-wrappper">
                <ConsoleLine isInput={true}>./run {this.props.name}</ConsoleLine><TypingContextProvider>
                    <SkulptRunner story={this.props.story} name={this.props.name} />
                </TypingContextProvider>
            </Container>
        )
    }
}