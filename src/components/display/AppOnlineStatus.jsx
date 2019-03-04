import React from 'react'
import { useAppOnlineStatus } from '../../api/hooks'

const statusBar = {
  position: 'absolute',
  top: 0, 
  right: 0,
  borderRadius: '0 0 0 25px',
  fontFamily: 'Permanent Marker',
}

const AppOnlineStatusBar = () => {
  const isOnline = useAppOnlineStatus()
  return (
    <div style={{ ...statusBar, background: isOnline ? '#aaffaa' : '#ff7a7a' }}>
      <pre style={{ fontFamily: 'inherit', margin: 5, fontSize: '0.5em', lineHeight: 0.4 }}>APP STATUS: {isOnline ? 'ONLINE' : 'OFFLINE'}</pre>
    </div>
  )
}

export default AppOnlineStatusBar
