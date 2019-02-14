import React from 'react'

import PoolData from './PoolData'
import DataDisplay from './UserStateDisplay'

const Home = () => (
  <div>
    {/* Show User's State */}
    <DataDisplay title="Your Data" colour="violet" />
    {/* DxMgnPool Data */}
    <PoolData />
  </div>
)

export default Home
