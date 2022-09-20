import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';
import { React, Component } from 'react';
import { ConsoleLine, Cursor } from '../components/console'


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
            return <a>Loading...</a>
        } else if (this.didFail()) {
            return <a>Failed to fetch data.</a>
        }
        else if (this.didLoad()) {
            var games = this.getNames()

            return <div>
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
    }


    render() {
        return <></>
    }
}

class Home extends Component {
    render() {
        return <div className='background fullscreen' onKeyDown={this.onKeyDown}>
            <Head>
                <title>CDE game hub</title>
            </Head>
            <ConsoleLine text="ls --games" isInput={true} />
            <StoriesList />
            <ConsoleLine isInput={true}><Cursor /></ConsoleLine>
        </div>
    }
}


export default Home
