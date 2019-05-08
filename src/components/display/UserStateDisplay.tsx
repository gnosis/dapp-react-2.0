import React from 'react'
import { connect } from 'components/StateProvider'

import DataDisplayVisualContainer from './DataDisplay'

import { splitAddress } from 'utils'

import { DATA_LOAD_STRING } from 'globals'
import { ETHEREUM_NETWORKS, State, AppStore } from 'types'

const userStateDisplayHeader = {
  backgroundColor: '#b7ebfd',
}

const UserStateDisplay = ({ NETWORK, USER }: { NETWORK: ETHEREUM_NETWORKS, USER: State['USER'] }) =>
  <DataDisplayVisualContainer
    title="Connected Wallet"
    colour="blue"
    height='265px'
    startOpen
    transition
  >
    {() =>
      <>
        <h5 style={userStateDisplayHeader}>Account + Network</h5>
        <p><span className="data-title">ACCOUNT:</span> <span title={USER.ACCOUNT}>{USER.ACCOUNT === DATA_LOAD_STRING ? DATA_LOAD_STRING : splitAddress(USER.ACCOUNT)}</span></p>
        <p><span className="data-title">NETWORK:</span> <strong>{NETWORK.toUpperCase()}</strong></p>
        <p><span className="data-title">[ETH] BALANCE:</span> {USER.BALANCE && USER.BALANCE}</p>
      </>
    }
  </DataDisplayVisualContainer>

const mapState = ({ 
  state,
  state: { 
    USER, 
    PROVIDER: { NETWORK }, 
  }, 
}: AppStore) => ({
  state,
  NETWORK,
  USER,
})

export default connect(mapState)(UserStateDisplay)
