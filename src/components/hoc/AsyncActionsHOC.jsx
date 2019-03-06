import React, { useState } from 'react'

import DataDisplayVisualContainer from '../display/DataDisplay'

import { delay } from '../../api/utils'

const AsyncActionsHOC = Component => ({
    asyncAction,
    buttonText = 'subMit',
    buttonOnly,
    forceDisable,
    info,
    title,
    ...rest,
}) => {
    // State - button blocked disables use of butotn
    // e.g on blockchain action - released on receipt
    const [buttonBlocked, setButtonBlocked] = useState(false)
    const [inputAmount, setInputAmount] = useState(undefined)
    const [viewInfoStatus, setViewInfoStatus] = useState(false)
    const [error, setError] = useState(undefined)

    const handleInfoButtonClick = () => setViewInfoStatus(!viewInfoStatus)

    const handleChange = ({ target }) => {
        setError(undefined)
        let { value } = target
        
        // replace commas w/periods
        value = value.replace(/[,]/g, '.')
        
        const validValue = !!(+value)
        if (!validValue && value) {
            setError('Please enter a valid amount')
        }
        
        return setInputAmount(value)
    }

    const handleClick = async () => {
        try {
            if (!buttonOnly && !inputAmount) throw new Error('Please enter a valid amount')
            // disable button
            setButtonBlocked(true)

            // fire action
            const asyncRec = !buttonOnly ? await asyncAction({ amount: inputAmount }) : await asyncAction()
            console.debug('Async Action successful: ', asyncRec)
            
            // For blockchain MM delay
            await delay(10000)
        } catch (err) {
			console.error('AsyncActionsHOC ERROR: ', err)
            setError(err.message || err)

            await delay(4000)
        } finally {
            setError(undefined)
            setInputAmount('0')
            // reEnable button
            setButtonBlocked(false)
        }
    }

    return (
        <div className="asyncActionContainer">  
            <h5>{title} {info && <span className="info" title="Click for more info" onClick={handleInfoButtonClick}>info</span>} </h5>
            {info && viewInfoStatus && 
                <DataDisplayVisualContainer
                    colour="info"
                >
                    {() => <span>{info}</span>}
                </DataDisplayVisualContainer>
            }
            {Component && 
                <Component
                    disabled={forceDisable || buttonBlocked}
                    onChange={handleChange}
                    value={inputAmount}
                />}
            {error 
                ? 
                <pre className="data-pre-error">{error}</pre> 
                :
                <button
                    className="ctaButton"
                    disabled={forceDisable || error || buttonBlocked}
                    onClick={handleClick}
                >
                    {buttonText}
                </button>
            }
        </div>
    )
}

export default AsyncActionsHOC
