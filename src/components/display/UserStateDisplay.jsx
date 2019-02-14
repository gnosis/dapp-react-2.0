import React from 'react'

import { connect } from '../StateProvider'

import { fromWei, mapTS } from '../../api/utils'

const UserStateDisplay = ({
    account,
    balance,
    network,
}) =>
  <>
    <h2>Your Data:</h2>
    <pre className="data-pre-violet">
        <h3>Network: {network}</h3>
        <h3>Account: {account}</h3>
        <h3>Balance: {mapTS(fromWei(balance))}</h3>
    </pre>
  </>

const mapProps = ({
    state: {
      USER: {
        account,
        balance,
      },
      PROVIDER: { network },
      DX_MGN_POOL: { tokens, tokenFRT, tokenOWL, priceFeed },
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
  
  export default connect(mapProps)(UserStateDisplay)
