import React from 'react'
import { useAppOnlineStatus } from 'api/hooks'
import { ExampleAppBanners } from 'appBanners'

const statusBarStyle = {
  display: 'flex',
  flexFlow: 'column nowrap',
  fontFamily: 'Permanent Marker',
}

const preStyle = { 
  backgroundColor: '#f6f784', 
  borderRadius: 0, 
  fontSize: '0.7em',
  fontWeight: 800,
  letterSpacing: -0.2, 
  lineHeight: 1, 
  margin: 0, 
  textAlign: 'center', 
}

const AppOnlineStatusBar = () => {
  const isOnline = useAppOnlineStatus()
  return (
    <div style={{ ...statusBarStyle }}>
      {ExampleAppBanners.map(({ content, customStyle, key }) => <pre key={key} style={{ ...preStyle, ...customStyle } as React.CSSProperties}>{typeof content === 'function' ? content() : content}</pre>)}
      <pre
        style={{ 
          background: isOnline ? '#aaffaa' : '#ff7a7a', 
          borderRadius: '0px 0px 0px 25px', 
          display: 'inline-flex',
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
