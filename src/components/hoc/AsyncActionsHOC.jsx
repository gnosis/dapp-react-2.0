import React, { /* useEffect, */ useState } from 'react'

const AsyncActionsHOC = Component => ({
    asyncAction,
    buttonText = 'Submit',
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
        console.debug(value)
        
        const validValue = !!(+value)
        if (!validValue || !value) {
            return setError('Please enter a valid amount')
        }
        
        setInputAmount(value)
    }
    
    const handleClick = async () => {
        try {
            // disable button
            setButtonBlocked(true)

            // fire action
            const res = await asyncAction(inputAmount)
            console.debug('ASYNC RES = ', res)

            // re-enable button
            setButtonBlocked(false)   
        } catch (err) {
            setError(err)
            setButtonBlocked(false)
        }
    }

    return (
        <div className="asyncActionContainer">  
            <h5>{title}</h5>
            <Component
                disabled={buttonBlocked}
                onChange={handleChange}
                value={inputAmount}
                {...rest} 
            />
            <button
                className="ctaButton"
                disabled={error || buttonBlocked || !inputAmount}
                onClick={handleClick}
            >
                {buttonText}
            </button>
            {error && <pre className="data-pre-error">{error}</pre>}
        </div>
    )
}

export default AsyncActionsHOC
