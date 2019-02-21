import React from 'react'

import PoolData from './PoolData'
import DataDisplay from './UserStateDisplay'

const Home = () => (
  <section>
    {/* Show User's State */}
    <DataDisplay 
      colour="violet" 
      // startOpen={true}
      title="Your Data" 
    />
    {/* DxMgnPool Data */}
    <PoolData />
  </section>
)

export default Home
