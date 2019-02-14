import React from 'react'

import PoolData from './PoolData'
import DataDisplay from './UserStateDisplay'

const Home = () => (
  <div>
    {/* DxMgnPool Data */}
    <PoolData />
    {/* Show User's State */}
    <DataDisplay title="Your Data" colour="violet" />
  </div>
)

export default Home
