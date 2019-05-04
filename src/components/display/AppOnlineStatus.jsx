import React from 'react'
import { useAppOnlineStatus } from '../../api/hooks'

import { CONTENT_URLS } from '../../globals'

const statusBar = {
  display: 'flex',
  flexFlow: 'column nowrap',
  fontFamily: 'Permanent Marker',
}

const AppOnlineStatusBar = () => {
  const isOnline = useAppOnlineStatus()
  return (
    <div style={{ ...statusBar }}>
      <pre 
        style={{ 
          backgroundColor: '#f6f784', 
          borderRadius: '0px 0px 0px 25px', 
          fontFamily: 'Major Mono Display', 
          fontSize: '0.7em',
          fontWeight: '800',
          letterSpacing: '-0.2px', 
          lineHeight: 1, 
          margin: 0, 
          textAlign: 'center', 
        }}
      >
        see how the dutchx mgn pooling app works <a href={CONTENT_URLS.HOW_IT_WORKS}>here</a>
      </pre>
      <pre 
        style={{ 
          background: isOnline ? '#aaffaa' : '#ff7a7a', 
          borderRadius: '0px 0px 0px 25px', 
          display: 'inline-flex',
          fontFamily: 'inherit', 
          fontSize: '0.5em', 
          lineHeight: 0.4, 
          margin: '0px 0px 0px auto', 
        }}
      >
        APP STATUS: {isOnline ? 'ONLINE' : 'OFFLINE'}
      </pre>
    </div>
  )
}

export default AppOnlineStatusBar
