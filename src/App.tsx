import React from 'react'
import { hot } from 'react-hot-loader'

// @ts-ignore
import { DutchXVerificationHOC } from '@gnosis.pm/dutchx-verification-react'

import AppOnlineStatusBar from 'components/display/AppOnlineStatus'
import Blocked from 'components/display/Modals/Blocked'
import Home from 'components/display/Home'
import StateProvider from 'components/StateProvider'
import WalletIntegration from 'components/controls/WalletIntegration'
import withErrorBoundary from 'components/hoc/withErrorBoundary'

import { LOCALFORAGE_KEYS } from 'globals'

import { 
  GlobalSubscription,
  GlobalSub,
} from './subscriptions'

import { SubscriptionStateInterface } from 'types'

interface AppProps {
  disabledReason?: string;
}

const SubscribedApp = () =>
  <GlobalSubscription source={GlobalSub}>
    {(subState: SubscriptionStateInterface) =>
      <StateProvider subState={subState}>       
        <AppOnlineStatusBar />
        <WalletIntegration>
          <Home />
        </WalletIntegration>
      </StateProvider>
    }
  </GlobalSubscription>

const VerificationWrappedApp = process.env.FE_CONDITIONAL_ENV === 'production' ? SubscribedApp : DutchXVerificationHOC(SubscribedApp)(LOCALFORAGE_KEYS.VERIFICATION_SETTINGS, LOCALFORAGE_KEYS.COOKIE_SETTINGS)

const App = ({
  disabledReason,
}: AppProps) => (
  disabledReason 
    ?
  // App is blocked 
  <Blocked /> 
    :
  <VerificationWrappedApp />
)

export default hot(module)(withErrorBoundary(App))
