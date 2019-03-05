import React from 'react'

import PoolData from './PoolData'
import UserStateDisplay from './UserStateDisplay'
import Footer from './Footer'

const Home = () => (
  <section className="Home">
    {/* Show User's State */}
    <section className="UserState">
      <UserStateDisplay />
    </section>
    
    {/* DxMgnPool Data */}
    <section className="PoolData">
      <PoolData />
      {/* Footer */}
      <Footer />
    </section>

  </section>
)

export default Home
