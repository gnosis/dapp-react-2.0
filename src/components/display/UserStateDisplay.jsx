import React from 'react'
import { connect } from '../StateProvider'

import DataDisplayVisualContainer from './DataDisplay'
import AsyncActionsHOC from '../hoc/AsyncActionsHOC'

import {
  lockAllMgn,
} from '../../api'

import { cleanDataFromWei, splitAddress } from '../../api/utils'

import { DATA_LOAD_STRING } from '../../globals'

const LockMGN = AsyncActionsHOC()

const UserStateDisplay = ({ NETWORK, USER, MGN_BALANCES }) =>
  <DataDisplayVisualContainer
    title="Connected Wallet"
    colour="salmon"
    height="27.2em"
    startOpen={false}
    transition
  >
    {() =>
      <>
        <h5>account & netWork</h5>
        <p><span className="data-title">ACCOUNT:</span> <span title={USER.ACCOUNT}>{USER.ACCOUNT === DATA_LOAD_STRING ? DATA_LOAD_STRING : splitAddress(USER.ACCOUNT)}</span></p>
        <p><span className="data-title">NETWORK:</span> <strong>{NETWORK.toUpperCase()}</strong></p>
        <p><span className="data-title">[ETH] BALANCE:</span> {USER.BALANCE && USER.BALANCE}</p>
        <hr />

        <h5>mgn bAlances</h5>
        {Object.keys(MGN_BALANCES).map(key => <p key={key + Math.random()}><span className="data-title">{key.toUpperCase().split('_').join(' ')}:</span> {cleanDataFromWei(MGN_BALANCES[key])}</p>)}
        <hr />
        <LockMGN 
          asyncAction={lockAllMgn}
          buttonText="lock"
          forceDisable={MGN_BALANCES.BALANCE === DATA_LOAD_STRING || MGN_BALANCES.BALANCE <= 0}
          info="Lock all your MGN at the end of the Pooling period - button will automatically enable itself"
          title="lock mgn tokens"
        />
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
