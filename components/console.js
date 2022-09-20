export function ConsoleLine({ text, isInput = false, children = undefined }) {
    if (isInput) {
        return <div className="inline-div">
            <div className='special-green-color'>cde@cde-game-web</div>
            <div className='normal-text'>:</div>
            <div className='special-blue-color'>~</div>
            <div className='normal-text'>$ </div>
            <div className='normal-text'>{text}</div>
            <div className='normal-text'>{children}</div>
        </div>
    }
    else {
        return <div className="inline-div">
            <div className='special-blue-color'>{text}</div>
            <div className='normal-text'>{children}</div>
        </div>
    }
}

export function Cursor() {
    return <div className='cursor'></div>
}

export function Container({ children }) {
    return <div className="game-container">
        {children}
    </div>
}