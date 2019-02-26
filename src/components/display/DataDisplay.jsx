import React, { useState } from 'react'

export const DataDisplay = props =>
  Object.keys(props)
    .filter(key => props[key] && props[key])
    .map(key =>
      <p 
        key={key.toString() + Math.random()}
        style={{ textAlign: 'left' }}
      >
        {key.toString().toUpperCase()}: {typeof props[key] !== 'object' ? props[key] : JSON.stringify(props[key], undefined, 2)}
      </p>)


const DataDisplayVisualContainer = (props) => {
    const { 
      title, 
      colour = 'gray', 
      startOpen = true,
      transition,
      children,
      ...rest 
    } = props

    const [open, setOpen] = useState(startOpen)
    
    return (
      <>
        {title && <h3 className="clickableHeader" onClick={() => setOpen(!open)}>{title} (show/hide)</h3>}
        <pre className={`data-pre-${colour} word-wrap${!open ? ' hideContent' : ''}${transition ? ' transition' : ''}`}>
          {children && children()}
          {<DataDisplay {...rest} />}
        </pre>
      </>
    )
  }

  export default DataDisplayVisualContainer
