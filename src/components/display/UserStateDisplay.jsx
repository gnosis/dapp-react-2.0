import React from 'react'
import { connect } from '../StateProvider'

import DataDisplayVisualContainer from './DataDisplay'
import AsyncActionsHOC from '../hoc/AsyncActionsHOC'

import {
  lockAllMgn,
} from '../../api'

import { cleanDataFromWei } from '../../api/utils'

import { DATA_LOAD_STRING } from '../../globals'

const LockMGN = AsyncActionsHOC()

const UserStateDisplay = ({ BLOCK_TIMESTAMP, NETWORK, USER, MGN_BALANCES }) =>
  <DataDisplayVisualContainer
    title="Connected Wallet"
    colour="salmon"
    height={540}
    transition
  >
    {() =>
    <>
      <h5>- Account + netWoRk -</h5>
      <p>ACCOUNT: {USER.ACCOUNT}</p>
      <p>[ETH] BALANCE: {USER.BALANCE && USER.BALANCE}</p>
      <p>NETWORK: {NETWORK}</p>
      <p>BLOCKCHAIN TIME: {BLOCK_TIMESTAMP && new Date(BLOCK_TIMESTAMP * 1000).toString()}</p>
      <hr />

      <h5>- mgn bAlances -</h5>
      {Object.keys(MGN_BALANCES).map(key => <p key={key + Math.random()}>{key.toUpperCase().split('_').join(' ')}: {cleanDataFromWei(MGN_BALANCES[key])}</p>)}
      
      <LockMGN 
        asyncAction={lockAllMgn}
        forceDisable={MGN_BALANCES.BALANCE === DATA_LOAD_STRING || MGN_BALANCES.BALANCE <= 0}
        buttonText="Lock"
        title="Lock Mgn Tokens"
      />
    </>
    }
  </DataDisplayVisualContainer>

const mapState = ({ 
  state,
  state: { 
    USER, 
    PROVIDER: { BLOCK_TIMESTAMP, NETWORK }, 
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
  BLOCK_TIMESTAMP,
  MGN_BALANCES: {
    BALANCE: MGN_BALANCE,
    LOCKED_BALANCE: LOCKED_MGN_BALANCE,
    UNLOCKED_BALANCE: UNLOCKED_MGN_BALANCE,
  },
})

export default connect(mapState)(UserStateDisplay)
