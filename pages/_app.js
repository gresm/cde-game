import React from "react";
import PropTypes from "prop-types";
import "../styles/globals.css";
import "../styles/console.css";

function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />;
}

MyApp.propTypes = { Component: PropTypes.any, pageProps: PropTypes.any };

export default MyApp;
