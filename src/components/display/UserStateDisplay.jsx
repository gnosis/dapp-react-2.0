import React from 'react'
import { connect } from '../StateProvider'

import DataDisplayVisualContainer from './DataDisplay'
import AsyncActionsHOC from '../hoc/AsyncActionsHOC'

import {
  lockAllMgn,
} from '../../api'

import { splitAddress } from '../../api/utils'

import { DATA_LOAD_STRING, FIXED_DECIMAL_AMOUNT } from '../../globals'

const userStateDisplayHeader = {
  backgroundColor: '#fbcaca',
}

const LockMGN = AsyncActionsHOC()

const UserStateDisplay = ({ NETWORK, USER, MGN_BALANCES }) =>
  <DataDisplayVisualContainer
    title="Connected Wallet"
    colour="salmon"
    height={!(+MGN_BALANCES.BALANCE) ? '21.8em' : '27.8em'}
    startOpen
    transition
  >
    {() =>
      <>
        <h5 style={userStateDisplayHeader}>account & netWork</h5>
        <p><span className="data-title">ACCOUNT:</span> <span title={USER.ACCOUNT}>{USER.ACCOUNT === DATA_LOAD_STRING ? DATA_LOAD_STRING : splitAddress(USER.ACCOUNT)}</span></p>
        <p><span className="data-title">NETWORK:</span> <strong>{NETWORK.toUpperCase()}</strong></p>
        <p><span className="data-title">[ETH] BALANCE:</span> {USER.BALANCE && USER.BALANCE}</p>
        <hr />

        <h5 style={userStateDisplayHeader}>mgn bAlances</h5>
        {Object.keys(MGN_BALANCES).map(key => <p key={key + Math.random()}><span className="data-title">{key.toUpperCase().split('_').join(' ')}:</span> {(MGN_BALANCES[key] && MGN_BALANCES[key] !== DATA_LOAD_STRING) && Number(MGN_BALANCES[key]).toFixed(FIXED_DECIMAL_AMOUNT)}</p>)}
        {!!(+MGN_BALANCES.BALANCE) && 
        <>
          <hr />
          <LockMGN 
            asyncAction={lockAllMgn}
            buttonText="lock"
            buttonOnly
            forceDisable={MGN_BALANCES.BALANCE === DATA_LOAD_STRING || MGN_BALANCES.BALANCE <= 0}
            info="Lock your MGN"
            title={`lock ${MGN_BALANCES.BALANCE} mgn`}
          />
        </>}
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
