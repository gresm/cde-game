import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';
import { React, Component } from 'react';
import { ConsoleLine, Cursor, Container } from '../components/console'


const gameEndpoint = "/play/"
const apiEndpoint = "/api/"
const apiListStories = apiEndpoint + "list-stories"

class StoryEntry extends Component {
    constructor({ name, gameID, ...props }) {
        props.name = name; props.gameID = gameID
        super()
        this.state = {
            name: name,
            gameID: gameID,
            url: gameEndpoint + gameID
        }
    }

    render() {
        return <ConsoleLine><a href={this.state.url}>{this.state.name}</a> - ({this.state.gameID})</ConsoleLine>
    }
}

class StoriesList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            names: {},
            loaded: false,
            failed: false
        }
    }

    setNames(names) {
        this.setState({
            names: names,
            loaded: true,
            failed: false
        })
    }

    getNames() {
        return this.state.names
    }

    fetchFailed() {
        this.setState({
            names: {},
            loaded: false,
            failed: true
        })
    }

    didFail() {
        return this.state.failed
    }

    didLoad() {
        return this.state.loaded
    }

    inProcess() {
        return !this.didLoad() && !this.didFail()
    }

    componentDidMount() {
        fetch(apiListStories).then((value) => {
            if (value.ok) {
                value.json()
                    .then((value) => { this.setNames(value) })
                    .catch((_) => { this.fetchFailed() })
            }
            else {
                this.fetchFailed()
            }
        }).catch((_) => { this.fetchFailed() })
    }

    render() {
        if (this.inProcess()) {
            return <ConsoleLine>Loading...</ConsoleLine>
        } else if (this.didFail()) {
            return <ConsoleLine color='red'>Failed to load data.</ConsoleLine>
        }
        else if (this.didLoad()) {
            var games = this.getNames()

            return <div>
                <ConsoleLine>Select an option:</ConsoleLine>
                {Object.keys(games).map((value, key) => {
                    return <StoryEntry name={games[value]} key={key} gameID={value} />
                })}
            </div>
        }
        return <a>Unknown error ocurred</a>
    }
}

class InteractveSelection extends Component {
    constructor(props) {
        super(props)

        props.bindListener(this, this.onKeyPressed)
        this.state = {
            text: ""
        }

        this.mounted = false
    }

    updateState(name, value) {
        var state = this.state
        state[name] = value
        if (this.mounted) {
            this.setState(state)
        }
    }

    componentDidMount() {
        this.mounted = true
    }

    /**
     * @param {KeyboardEvent} ev 
     */
    onKeyPressed(ev) {
        if (ev.key.length === 1) {
            this.updateState("text", this.state.text + ev.key)
        }
        else if (ev.key === "Backspace") {
            this.updateState("text", this.state.text.substring(0, this.state.text.length - 1))
        }
    }

    render() {
        return <ConsoleLine newLine={false}>{this.state.text}</ConsoleLine>
    }
}

class Home extends Component {

    constructor(props) {
        super(props)
        /**
         * @type { [{(ev: KeyboardEvent) => undefined}] }
         */
        this.listeners = []

        var that = this
        this.bindedKeydownListener = (ev) => {that.handleKeyDown(ev)}
    }

    /**
     * 
     * @param {*} obj Listening object
     * @param {{(ev: KeyboardEvent) => undefined}} func Event listener
     */
    bindListener(obj, func) {
        this.listeners.push(func.bind(obj))
    }

    handleKeyDown(ev) {
        this.listeners.forEach(lst => {
            lst(ev)
        });
    }

    componentDidMount() {
        document.removeEventListener("keydown", this.bindedKeydownListener)
        document.addEventListener("keydown", this.bindedKeydownListener)
    }

    render() {
        return <div className='background fullscreen'>
            <Head>
                <title>CDE game hub</title>
            </Head>
            <Container>
                <ConsoleLine text="ls --games" isInput={true} />
                <StoriesList />
                <ConsoleLine isInput={true}><InteractveSelection bindListener={this.bindListener.bind(this)} /><Cursor /></ConsoleLine>
            </Container>
        </div>
    }
}


export default Home
