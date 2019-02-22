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

const LockMGN = AsyncActionsHOC()

const UserStateDisplay = () =>
  <DataDisplayVisualContainer
    title="Connected Wallet"
    colour="violet"
  >
    {props =>
    <>
      <AccountSubscription source={AccountSub}>
        {subInfo => <DataDisplay {...subInfo} {...props} />}
      </AccountSubscription>
      <ETHbalanceSubscription source={ETHbalanceSub}>
        {subInfo => <DataDisplay {...subInfo} {...props} />}
      </ETHbalanceSubscription>
      <MGNBalancesSubscription source={MGNBalancesSub}>
        {subInfo => <DataDisplay {...subInfo} {...props} />}
      </MGNBalancesSubscription>
      <LockMGN 
        asyncAction={lockAllMgn}
        buttonText="Lock"
        title="Lock Mgn Tokens"
      />
    </>
    }
  </DataDisplayVisualContainer>

export default UserStateDisplay
