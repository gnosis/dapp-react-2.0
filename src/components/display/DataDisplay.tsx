import React, { useState } from 'react'
import { PreColours } from 'types'

export const DataDisplay = (props: any) =>
  <>
    {Object.keys(props)
      .filter(key => props[key] && props[key])
      .map(key =>
        <p 
          key={key.toString() + Math.random()}
          style={{ textAlign: 'left' }}
        >
          {key.toString().toUpperCase()}: {typeof props[key] !== 'object' ? props[key] : JSON.stringify(props[key], undefined, 2)}
        </p>)}
  </>
interface DataDisplayVisualContainerProps {
  children?: any;
  colour?: PreColours;
  height?: string | number;
  startOpen?: boolean;
  title?: string;
  transition?: boolean;
  state?: any;
}

const DataDisplayVisualContainer = ({ 
  children,
  colour = 'gray', 
  height = 'auto',
  startOpen = true,
  title, 
  transition,
  ...rest 
}: DataDisplayVisualContainerProps) => {
    const [open, setOpen] = useState<boolean>(startOpen)
    
    return (
      <>
        {title && <h2 className="clickableHeader" onClick={() => setOpen(!open)}>{title} <small>(show/hide)</small></h2>}
        <pre className={`data-pre-${colour} word-wrap${!open ? ' hideContent' : ''}${transition ? ' transition' : ''}`} style={{ height }}>
          {children && children()}
          <DataDisplay {...rest} />
        </pre>
      </>
    )
  }

  export default DataDisplayVisualContainer
