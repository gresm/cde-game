import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { React, Component } from 'react';

class Home extends Component {
    componentDidMount() {
        document.location.pathname = "/app.html"
    }

    render() {
        return <a>Redirecting....</a>
    }
}


export default Home
