import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, {useState, useEffect } from 'react';

function Home() {
    const [story, setStory] = useState();

    const getApiData = async () => {
        const response = await fetch("/test.json").then(
            (response) => response.json()
        );
        setStory(response);
    };

    useEffect(() => {
        console.log(document)
        getApiData();
    }, []);

    return <iframe className={styles.fullscreen} src='https://www.example.com' />;
}

export default Home
