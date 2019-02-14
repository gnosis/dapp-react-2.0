import React from 'react'

import PoolData from './PoolData'
import DataDisplay from './UserStateDisplay'

const Home = () => (
  <section>
    {/* DxMgnPool Data */}
    <PoolData />
    {/* Show User's State */}
    <DataDisplay 
      colour="violet" 
      startOpen={false}
      title="Your Data" 
    />
  </section>
)

export default Home
