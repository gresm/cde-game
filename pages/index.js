import Head from "next/head";
import { React, Component, createContext } from "react";
import {
    ConsoleLine,
    Cursor,
    Container,
    InteractveSelection,
} from "../components/console";
import PropTypes from "prop-types";

const gameEndpoint = "/play/";
const apiEndpoint = "/api/";
const apiListStories = apiEndpoint + "list-stories";

var storyListContext = createContext({
    vals: {},
    names: [],
    updateNames: () => {},
});

export class SlContextProvider extends Component {
    constructor(props) {
        super(props);

        this.updateNames = (val) => {
            var st = this.state;
            st.vals = val;
            st.names = Object.keys(val);
            this.setState(st);
        };

        this.state = {
            vals: {},
            names: [],
            updateNames: this.updateNames.bind(this),
        };
    }

    render() {
        return (
            <storyListContext.Provider value={this.state}>
                {this.props.children}
            </storyListContext.Provider>
        );
    }
}

SlContextProvider.propTypes = { children: PropTypes.any };

class StoryEntry extends Component {
    constructor({ name, gameID, ...props }) {
        super(props);
        this.state = {
            name: name,
            gameID: gameID,
            url: gameEndpoint + gameID,
        };
    }

    render() {
        return (
            <ConsoleLine>
                <a href={this.state.url}>{this.state.name}</a> - (
                {this.state.gameID})
            </ConsoleLine>
        );
    }
}

StoryEntry.propTypes = { name: PropTypes.string, gameID: PropTypes.string };

class StoriesList extends Component {
    static contextType = storyListContext;

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            failed: false,
        };
    }

    setNames(names) {
        this.setState({
            loaded: true,
            failed: false,
        });
        this.context.updateNames(names);
    }

    getNames() {
        return this.context.vals;
    }

    fetchFailed() {
        this.setState({
            loaded: false,
            failed: true,
        });
    }

    didFail() {
        return this.state.failed;
    }

    didLoad() {
        return this.state.loaded;
    }

    inProcess() {
        return !this.didLoad() && !this.didFail();
    }

    componentDidMount() {
        fetch(apiListStories)
            .then((value) => {
                if (value.ok) {
                    value
                        .json()
                        .then((value) => {
                            this.setNames(value);
                        })
                        .catch(() => {
                            this.fetchFailed();
                        });
                } else {
                    this.fetchFailed();
                }
            })
            .catch(() => {
                this.fetchFailed();
            });
    }

    render() {
        if (this.inProcess()) {
            return <ConsoleLine>Loading...</ConsoleLine>;
        } else if (this.didFail()) {
            return <ConsoleLine color="red">Failed to load data.</ConsoleLine>;
        } else if (this.didLoad()) {
            var games = this.getNames();

            return (
                <div>
                    <ConsoleLine>
                        Select an option (Click the name or type the option):
                    </ConsoleLine>
                    {Object.keys(games).map((value, key) => {
                        return (
                            <StoryEntry
                                name={games[value]}
                                key={key}
                                gameID={value}
                            />
                        );
                    })}
                </div>
            );
        }
        return <a>Unknown error ocurred</a>;
    }
}

class MainMenuInteractiveSelection extends InteractveSelection {
    static contextType = storyListContext;

    constructor(props) {
        super(props);

        props.bindListener(this, this.onKeyPressed);
    }

    onKeyPressed(ev) {
        if (ev.key.length === 1) {
            this.updateState("text", this.state.text + ev.key);
        } else if (ev.key === "Backspace") {
            this.updateState(
                "text",
                this.state.text.substring(0, this.state.text.length - 1),
            );
        } else if (ev.key === "Enter") {
            this.onSubmit();
        } else if (ev.key == "ArrowUp" || ev.key == "ArrowLeft") {
            this.upSelection();
        } else if (ev.key == "ArrowDown" || ev.key == "ArrowRight") {
            this.downSelection();
        }
    }

    onSubmit() {
        if (this.mounted) {
            window.location.pathname = gameEndpoint + this.state.text;
        }
    }
}

class Home extends Component {
    constructor(props) {
        super(props);
        /**
         * @type { [{(ev: KeyboardEvent) => undefined}] }
         */
        this.listeners = [];

        this.bindedKeydownListener = this.handleKeyDown.bind(this);
    }

    /**
     *
     * @param {*} obj Listening object
     * @param {{(ev: KeyboardEvent) => undefined}} func Event listener
     */
    bindListener(obj, func) {
        this.listeners.push(func.bind(obj));
    }

    handleKeyDown(ev) {
        this.listeners.forEach((lst) => {
            lst(ev);
        });
    }

    componentDidMount() {
        document.removeEventListener("keydown", this.bindedKeydownListener);
        document.addEventListener("keydown", this.bindedKeydownListener);
    }

    render() {
        return (
            <>
                <Head>
                    <title>CDE game hub</title>
                </Head>
                <SlContextProvider>
                    <Container>
                        <ConsoleLine text="ls --games" isInput={true} />
                        <StoriesList />
                        <ConsoleLine isInput={true}>
                            <MainMenuInteractiveSelection
                                bindListener={this.bindListener.bind(this)}
                            />
                            <Cursor />
                        </ConsoleLine>
                    </Container>
                </SlContextProvider>
            </>
        );
    }
}

export default Home;
