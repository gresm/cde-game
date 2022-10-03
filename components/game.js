import { Component } from 'react';
import { ConsoleLine, Cursor, Container } from "./console"
import { loadScriptsInQueue } from "../utils/scriptLoader"

export class Game extends Component {
    constructor(props) {
        super(props)
        this.story = props.story
        this.name = props.name
        this.isValid = this.story !== null
        this.mainLoaded = false
        this.libLoaded = false
        this.sk = null
        this.code = props.code
    }

    skulptMainLoaded = () => {
        this.sk = Sk
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
            if (this.sk.builtinFiles === undefined || this.sk.builtinFiles["files"][x] === undefined)
                    throw "File not found: '" + x + "'";
            return this.sk.builtinFiles["files"][x];
        }

        this.sk.configure({
            __future__: this.sk.python3,
            read: builtinRead
        })
    }

    componentDidMount() {
        loadScriptsInQueue(["../skulpt.min.js", "../skulpt-stdlib.js"], [this.skulptMainLoaded, this.skulptStdlibLoaded])
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