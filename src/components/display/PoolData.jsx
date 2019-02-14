import React from 'react'

const Pool = (props) => {
	console.log('TCL: Pool -> props', props)
    return (
        <div className="poolContainer">
            <h1>Pool Data here</h1>
            {JSON.stringify(props, undefined, 2)}
        </div>
    )
}

export default Pool
