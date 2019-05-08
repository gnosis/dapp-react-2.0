import React from 'react'

import Footer from './Footer'
import UserStateDisplay from './UserStateDisplay'

const Home = () => (
  <section className="Home">
    {/* Show User's State */}
    <section className="UserState">
      <UserStateDisplay />
    </section>
    {/* App Section */}
    <section className="PoolData">
      {/* Data */}
      <div>
        <code>Fake Data here...</code>
      </div>
      {/* Footer */}
      <Footer />
    </section>
  </section>
)

export default Home
