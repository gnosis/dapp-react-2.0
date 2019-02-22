import React from 'react'

import PoolData from './PoolData'
import UserStateDisplay from './UserStateDisplay'

const Home = () => (
  <section>
    {/* Show User's State */}
    <UserStateDisplay />
    
    {/* DxMgnPool Data */}
    <PoolData />
  </section>
)

export default Home
