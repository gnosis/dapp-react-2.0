import React from 'react'
import { connect } from '../StateProvider'

import { mapTS, fromWei } from '../../api/utils'

const Home = ({ account, balance: userBalance, network }) => (
  <div>
    <h1>Provider state:</h1>

    <h3>Network: {network}</h3>
    <h3>Account: {account}</h3>
    <h3>Balance: {mapTS(fromWei(userBalance))}</h3>
  </div>
)

const mapProps = ({
  state: {
    USER: {
      account,
      balance,
    },
    PROVIDER: { network },
    DX: { tokens, tokenFRT, tokenOWL, priceFeed },
    CONTRACTS: { dx },
  },
}) => ({
  account,
  balance,
  dx,
  network,
  priceFeed,
  tokens,
  tokenFRT,
  tokenOWL,
})

export default connect(mapProps)(Home)
