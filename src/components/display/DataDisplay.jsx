import React, { useState } from 'react'

const DataDisplay = (props) => {
    const { 
      title = 'Untitled Data', 
      colour = 'gray', 
      startOpen = true,
      ...rest 
    } = props
    
    const [open, setOpen] = useState(startOpen)
    return (
      <>
        <h2 className="clickableHeader" onClick={() => setOpen(!open)}>{title} (show/hide)</h2>
        <pre className={`data-pre-${colour} word-wrap${!open ? ' hideContent' : ''}`}>
          
          {
            Object.keys(rest)
            .filter(key => rest[key] && rest[key])
            .map(key => 
              <p key={key.toString() + Math.random()}>
                {key.toString().toUpperCase()}: {typeof rest[key] !== 'object' ? rest[key] : JSON.stringify(rest[key], undefined, 2)}
              </p>)
          }
        </pre>
      </>
    )
  }

  export default DataDisplay
