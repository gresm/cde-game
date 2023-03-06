import { Component } from "react";


export function ConsoleLine({ text, isInput = false, children = undefined, color = "inherit", style, ...extra }) {
    var text_style = { color: color, ...style }

    if (isInput) {
        return <><div className="inline-div" {...extra}>
            <div className='special-green-color'>cde@cde-game-web</div>
            <div className='normal-text'>:</div>
            <div className='special-blue-color'>~</div>
            <div className='normal-text'>$ </div>
            <div className='normal-text' style={text_style}>{text}</div>
            <div className='normal-text' style={text_style}>{children}</div>
        </div></>
    }
    else {
        return <><div className="inline-div" {...extra}>
            <div className='normal-text' style={text_style}>{text}</div>
            <div className='normal-text' style={text_style}>{children}</div>
        </div></>
    }
}

export function Cursor() {
    return <div className='cursor'></div>
}

export function Container({ children, ...props }) {
    return <div className="background fullscreen">
        <div className="game-container" {...props}>{children}</div>
    </div>
}

export class InteractveSelection extends Component {
    constructor(props) {
        super(props)

        this.state = {
            text: "",
            currentlySelecting: -1
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

    moveSelection(by) {
        if (typeof this.context === "undefined") {
            return
        }

        var newIdx = this.state.currentlySelecting

        if (newIdx === -1) {
            newIdx = 0
        } else {
            newIdx = (newIdx + by) % this.context.names.length
        }

        this.updateState("currentlySelecting", newIdx)
        this.updateState("text", this.context.names[newIdx])
    }

    upSelection() {
        this.moveSelection(-1)
    }

    downSelection() {
        this.moveSelection(1)
    }

    render() {
        return <>{this.state.text}</>
    }

    onKeyPressed(ev) {

    }

    onSubmit() {
        
    }
}