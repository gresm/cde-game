import { Component } from "react";
import { ConsoleLine, Cursor, Container } from "./console";
import { loadScriptsInQueue } from "../utils/scriptLoader";

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
        this.code = props.code
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

        if (this.mainLoaded && this.libLoaded) {
            this.skulptLoaded();
        }
    }

    skulptLoaded() {
        function builtinRead(x) {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
                throw "File not found: '" + x + "'";
            }
            return Sk.builtinFiles["files"][x];
        }

        Sk.configure({
            __future__: Sk.python3,
            read: builtinRead
        })

        Sk.importMainWithBody("__main__", false, "print('hello world')", true)
    }

    loadSkulpt() {
        loadScriptsInQueue([this.skulpt, this.skulptSdt], [this.skulptMainLoaded, this.skulptStdlibLoaded])
    }

    componentDidMount() {
        if (!this.wasMounted) {
            this.loadSkulpt();
        }

        this.wasMounted = true;
    }

    render() {
        return <>
            <Container>
                <ConsoleLine isInput={true}>./run {this.name}</ConsoleLine>
                <ConsoleLine id='loading-screen' >{this.isValid ? "Loading..." : `Story: ${this.name} not found.`}</ConsoleLine>
                <Cursor />
            </Container>
        </>
    }
}