import { Component } from "react";
import { ConsoleLine, Cursor, Container } from "./console";
import { loadScriptsInQueue } from "../utils/scriptLoader";
import skulptModules from "../generated/skulpt-extra"

export class Game extends Component {
    skulpt = "../skulpt.min.js"
    skulptSdt = "../skulpt-stdlib.js"

    constructor(props) {
        super(props)
        this.story = props.story
        this.name = props.name
        this.isValid = this.story !== null
        this.mainLoaded = false
        this.libLoaded = false
        this.code = ""
        this.wasMounted = false
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
        })

        Sk.divid = "game"

        Sk.gameInterface = {}
        Sk.gameInterface.story = this.story
    }

    progressGame(feedback) {
        setupInput(Sk.ffi.remapToJs(Sk.gameInterface.stepFunc.tp$call([feedback])));
    }

    setupInput(number) {
        // TODO: fill it.
    }

    onAfterFullLoad() {
        var code = Sk.importMainWithBody("__main__", false, this.code, true);
        Sk.gameInterface.stepFunc = code.tp$getattr(Sk.builtin.str("step"));
        this.progressGame(0)
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
                        this.code = value
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
        return <Container id="game">
            <ConsoleLine isInput={true}>./run {this.name}</ConsoleLine>
            <ConsoleLine id='loading-screen' >{this.isValid ? "Loading..." : `Story: ${this.name} not found.`}</ConsoleLine>
            <Cursor />
        </Container>
    }
}