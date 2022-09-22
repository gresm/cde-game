export function ConsoleLine({ text, isInput = false, children = undefined, color = "inherit", style, newLine = true }) {
    var text_style = { color: color, ...style }
    var br = (newLine) ? <br /> : undefined

    if (isInput) {
        return <><div className="inline-div">
            <div className='special-green-color'>cde@cde-game-web</div>
            <div className='normal-text'>:</div>
            <div className='special-blue-color'>~</div>
            <div className='normal-text'>$ </div>
            <div className='normal-text' style={text_style}>{text}</div>
            <div className='normal-text' style={text_style}>{children}</div>
        </div>{br}</>
    }
    else {
        return <><div className="inline-div">
            <div className='normal-text' style={text_style}>{text}</div>
            <div className='normal-text' style={text_style}>{children}</div>
        </div>{br}</>
    }
}

export function Cursor() {
    return <div className='cursor'></div>
}

export function Container({ children }) {
    return <div className="background fullscreen">
        <div className="game-container">{children}</div>
    </div>
}