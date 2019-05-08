import React from 'react'

import DataDisplayVisualContainer from './DataDisplay'
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
      <DataDisplayVisualContainer
        title="Fake Data"
        colour="salmon"
        height='15em'
        startOpen
        transition
      >
        {() =>
          <>
            <h5>Data</h5>
            <p>Some fake ass data here</p>
          </>
        }
      </DataDisplayVisualContainer>
      {/* Footer */}
      <Footer />
    </section>
  </section>
)

export default Home
