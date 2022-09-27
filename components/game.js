import { Component } from 'react';
import { ConsoleLine, Cursor, Container } from "./console"
import Script from "next/script"

export class Game extends Component {
    constructor(props) {
        super(props)
        this.story = props.story
        this.name = props.name
        this.isValid = this.story !== null
        this.mainLoaded = false
        this.libLoaded = false
        this.sk = null
    }

    skulptMainLoaded() {
        this.sk = Sk
        this.mainLoaded = true;
        
        if (this.mainLoaded && this.libLoaded) {
            this.skulptLoaded();
        }
    }

    skulptStdlibLoaded() {
        this.libLoaded = true;
        
        if (this.mainLoaded && this.libLoaded) {
            this.skulptLoaded();
        }
    }

    skulptLoaded() {
        
    }

    render() {
        return <>
            <Script src='../skulpt.js' onLoad={this.skulptMainLoaded}></Script>
            <Script src='../skulpt-stdlib.js' onLoad={this.skulptStdlibLoaded}></Script>
            <Container>
                <ConsoleLine isInput={true}>./run {this.name}</ConsoleLine>
                <ConsoleLine id='loading-screen' >{this.isValid ? "Loading..." : `Story: ${this.name} not found.`}</ConsoleLine>
                <Cursor />
            </Container>
        </>
    }
}