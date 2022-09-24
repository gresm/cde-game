import { Component } from 'react';
import { ConsoleLine, Cursor, Container } from "./console"


export class Game extends Component {
    constructor(props) {
        super(props)
        this.story = props.story
        this.name = props.name
        this.isValid = this.story !== null
    }

    render() {
        return <Container>
            <ConsoleLine isInput={true}>./run {this.name}</ConsoleLine>
            <ConsoleLine id='loading-screen' >{this.isValid ? "Loading..." : `Story: ${this.name} not found.`}</ConsoleLine>
            <Cursor />
        </Container>
    }
}