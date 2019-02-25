import React from 'react'

import DataDisplayVisualContainer from './DataDisplay'
import AsyncActionsHOC from '../hoc/AsyncActionsHOC'

import {
  lockAllMgn,
} from '../../api'

import { connect } from '../StateProvider'

const LockMGN = AsyncActionsHOC()

const UserStateDisplay = ({ state, NETWORK, USER, MGN_BALANCES }) =>
  <DataDisplayVisualContainer
    title="Connected Wallet"
    colour="violet"
  >
    {() =>
    <>
      <h5>Account + netWoRk</h5>
      <p>ACCOUNT: {USER.ACCOUNT}</p>
      <p>[ETH] BALANCE: {USER.BALANCE && USER.BALANCE}</p>
      <p>NETWORK: {NETWORK}</p>

      <hr />

      <h5>mgn bAlances</h5>
      {Object.keys(MGN_BALANCES).map(key => <p key={key + Math.random()}>{key.toUpperCase().split('_').join(' ')}: {MGN_BALANCES[key]}</p>)}
      
      <LockMGN 
        asyncAction={lockAllMgn}
        buttonText="Lock"
        title="Lock Mgn Tokens"
      />
      {JSON.stringify({ ...state.USER, ...state.DX_MGN_POOL, ...{ PROVIDER: { ACTIVE_PROVIDER: state.PROVIDER.ACTIVE_PROVIDER, NETWORK: state.PROVIDER.NETWORK } } }, undefined, 2)}
    </>
    }
  </DataDisplayVisualContainer>

const mapState = ({ 
  state,
  state: { 
    USER, 
    PROVIDER: { NETWORK }, 
    TOKEN_MGN: {
      MGN_BALANCE,
      LOCKED_MGN_BALANCE,
      UNLOCKED_MGN_BALANCE,
    },
  }, 
}) => ({
  state,
  NETWORK,
  USER,
  MGN_BALANCES: {
    BALANCE: MGN_BALANCE,
    LOCKED_BALANCE: LOCKED_MGN_BALANCE,
    UNLOCKED_BALANCE: UNLOCKED_MGN_BALANCE,
  },
})

export default connect(mapState)(UserStateDisplay)
