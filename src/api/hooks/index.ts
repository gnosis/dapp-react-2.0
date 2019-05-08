import { useEffect, useState } from 'react'

export const useAppOnlineStatus = () => {
    const [online, setOnline] = useState(window.navigator.onLine)
  
    useEffect(() => {
      const interval = setInterval(() => setOnline(window.navigator.onLine), 4000)
  
      return () => clearInterval(interval)
    }, [window.navigator.onLine])
  
    return online
  }
