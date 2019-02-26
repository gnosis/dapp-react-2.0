import React, { /* useEffect, */ useState } from 'react'

const AsyncActionsHOC = Component => ({
    asyncAction,
    buttonText = 'Submit',
    forceDisable,
    inputChangeDispatch,
    globalInput,
    title,
    ...rest
}) => {
    // State - button blocked disables use of butotn
    // e.g on blockchain action - released on receipt
    const [buttonBlocked, setButtonBlocked] = useState(false)
    const [inputAmount, setInputAmount] = useState(null)
    const [error, setError] = useState(null)

    // useEffect()

    const handleChange = ({ target }) => {
        setError(null)
        let { value } = target
        
        // replace commas w/periods
        value = value.replace(/[,]/g, '.')
        
        const validValue = !!(+value)
        if (!validValue && value) {
            return setError('Please enter a valid amount')
        }
        
        return inputChangeDispatch ? inputChangeDispatch(value) : setInputAmount(value)
    }
    
    const handleClick = async () => {
        try {
            if (!globalInput && !inputAmount) throw new Error('Please enter a valid amount')
            // disable button
            setButtonBlocked(true)

            // fire action
            await asyncAction()
        } catch (err) {
			console.error('AsyncActionsHOC ERROR: ', err)
            setError(err.message || err)
        } finally {
            inputChangeDispatch && inputChangeDispatch(null)
            setInputAmount(null)  
            // reEnable button
            setButtonBlocked(false)
        }
    }

    return (
        <div className="asyncActionContainer">  
            <h5>{title}</h5>
            {Component && 
                <Component
                    disabled={forceDisable || buttonBlocked}
                    onChange={handleChange}
                    value={inputAmount}
                    {...rest} 
                />}
            <button
                className="ctaButton"
                disabled={forceDisable || error || buttonBlocked}
                onClick={handleClick}
            >
                {buttonText}
            </button>
            {error && <pre className="data-pre-error">{error}</pre>}
        </div>
    )
}

export default AsyncActionsHOC
