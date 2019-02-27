import React from 'react'

import PoolData from './PoolData'
import UserStateDisplay from './UserStateDisplay'
import Footer from './Footer'

const Home = () => (
  <section>
    {/* Show User's State */}
    <UserStateDisplay />
    
    {/* DxMgnPool Data */}
    <PoolData />

    {/* Footer */}
    <Footer />
  </section>
)

export default Home
