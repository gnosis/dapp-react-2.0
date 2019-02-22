import React from 'react'

import DataDisplayVisualContainer, { DataDisplay } from './DataDisplay'
import AsyncActionsHOC from '../hoc/AsyncActionsHOC'

import {
  lockAllMgn,
} from '../../api'

import { 
  AccountSubscription, 
  AccountSub, 
  ETHbalanceSubscription, 
  ETHbalanceSub, 
  MGNBalancesSubscription, 
  MGNBalancesSub,
} from '../../subscriptions'

import Provider, { connect } from '../StateProvider'

const LockMGN = AsyncActionsHOC()

const UserStateDisplay = ({ NETWORK }) =>
  <DataDisplayVisualContainer
    title="Connected Wallet"
    colour="violet"
  >
    {otherProps =>
    <>
      <h5>Account + netWoRk</h5>

      <AccountSubscription source={AccountSub}>
        {subValue => <DataDisplay {...subValue} {...otherProps} />}
      </AccountSubscription>
      <AccountSubscription source={AccountSub}>
        {value => <Provider {...value} />}
      </AccountSubscription>

      <p>NETWORK: {NETWORK}</p>

      <hr />

      <h5>bAlances</h5>

      <ETHbalanceSubscription source={ETHbalanceSub}>
        {subValue => <DataDisplay {...subValue} {...otherProps} />}
      </ETHbalanceSubscription>
      
      <MGNBalancesSubscription source={MGNBalancesSub}>
        {subValue => <DataDisplay {...subValue} {...otherProps} />}
      </MGNBalancesSubscription>
      
      <LockMGN 
        asyncAction={lockAllMgn}
        buttonText="Lock"
        title="Lock Mgn Tokens"
      />
    </>
    }
  </DataDisplayVisualContainer>

const mapState = ({ state: { PROVIDER: { NETWORK } } }) => ({
  NETWORK,
})

export default connect(mapState)(UserStateDisplay)
