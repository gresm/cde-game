import React, { Component } from "react";
import PropTypes from "prop-types";

export function ConsoleLine({
    text,
    isInput = false,
    children = undefined,
    color = "inherit",
    style,
    ...extra
}) {
    var text_style = { color: color, ...style };

    if (isInput) {
        return (
            <InlineDiv {...extra}>
                <div className="special-green-color">cde@cde-game-web</div>
                <div className="normal-text">:</div>
                <div className="special-blue-color">~</div>
                <div className="normal-text">$ </div>
                <div className="normal-text" style={text_style}>
                    {text}
                </div>
                <div className="normal-text" style={text_style}>
                    {children}
                </div>
            </InlineDiv>
        );
    } else {
        return (
            <InlineDiv {...extra}>
                <div className="normal-text" style={text_style}>
                    {text}
                </div>
                <div className="normal-text" style={text_style}>
                    {children}
                </div>
            </InlineDiv>
        );
    }
}

ConsoleLine.propTypes = {
    text: PropTypes.any,
    isInput: PropTypes.bool,
    children: PropTypes.any,
    color: PropTypes.string,
    style: PropTypes.object,
};

export function InlineDiv({ children = undefined, ...extra }) {
    return (
        <div className="inline-div" {...extra}>
            {children}
        </div>
    );
}

InlineDiv.propTypes = { children: PropTypes.any };

export function Cursor() {
    return <div className="cursor"></div>;
}

export function Container({ children, ...props }) {
    return (
        <div className="background fullscreen">
            <div className="game-container" {...props}>
                {children}
            </div>
        </div>
    );
}

Container.propTypes = { children: PropTypes.any };

export class InteractveSelection extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: "",
            currentlySelecting: 0,
        };

        this.mounted = false;
    }

    updateState(name, value) {
        var state = this.state;
        state[name] = value;
        if (this.mounted) {
            this.setState(state);
        }
    }

    componentDidMount() {
        this.mounted = true;
    }

    /**
     * @param {KeyboardEvent} ev
     */

    moveSelection(by) {
        if (this.context === undefined || this.context.names.length === 0) {
            return;
        }

        var newIdx = (this.state.currentlySelecting + by) % this.context.names.length;

        if (newIdx <= -1) {
            newIdx = this.context.names.length - 1;
        }

        this.updateState("currentlySelecting", newIdx);
        this.updateState("text", this.context.names[newIdx]);
    }

    upSelection() {
        this.moveSelection(-1);
    }

    downSelection() {
        this.moveSelection(1);
    }

    render() {
        return <>{this.state.text}</>;
    }

    onKeyPressed() {}

    onSubmit() {}
}
