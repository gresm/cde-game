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
        return <div className='special-blue-color'>{text}</div>
    }
}

export function Cursor() {
    return <div className='cursor'></div>
}