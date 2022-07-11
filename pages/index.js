import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { React, Component } from 'react';


function GameRunner({ story, lib }) {
    return (<>
        <div hidden={true} dangerouslySetInnerHTML={{ "__html": lib }} />
        <div className={styles.fullscreen} id="game-div" />
        <div story={story} id="story" />
    </>)
}


class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            story: "",
            lib: "",
            loaded: false
        }
    }

    getStory = async () => {
        fetch(window.location.origin + "/story.json")
            .then((response) => response.text())
            .then((text) => this.setState({ story: text }))
            .catch((reason) => { console.log(reason) })
    }

    getLibSrc = async () => {
        fetch(window.location.origin + "/app.html")
            .then((response) => response.text())
            .then((text) => this.setState({ lib: text }))
            .catch((reason) => { console.log(reason) })
    }

    componentDidMount() {
        if (!this.state.loaded) {
            console.log("Reloading...")
            this.getStory()
            this.getLibSrc()
        }
    }

    render() {
        return <div className={styles.fullscreen}><GameRunner story={this.state.story} lib={this.state.lib} /></div>;
    }
}


export default Home
