import { Component } from 'react';
import { ConsoleLine, Cursor, Container } from "./console"


export class Game extends Component {
    constructor(props) {
        super(props)
        this.story = props.story
        this.name = props.name
        this.isValid = typeof this.story !== "undefined"
    }

    render() {
        return <Container>
            <ConsoleLine isInput={true}>./run {this.name}</ConsoleLine>
            <ConsoleLine>{this.isValid ? "Loading..." : `Story: ${this.name} not found.`}</ConsoleLine>
            <Cursor />
        </Container>
    }
}