import React from 'react'
import { hot } from 'react-hot-loader'
import { DutchXVerificationHOC } from '@gnosis.pm/dutchx-verification-react'

import AppOnlineStatusBar from './components/display/AppOnlineStatus'
import Home from './components/display/Home'
import StateProvider from './components/StateProvider'
import WalletIntegration from './components/controls/WalletIntegration'
import withErrorBoundary from './components/hoc/withErrorBoundary'

import { LOCALFORAGE_KEYS } from './globals'

import { 
  GlobalSubscription,
  GlobalSub,
} from './subscriptions'

const SubscribedApp = () => (
  <GlobalSubscription source={GlobalSub}>
    {subState =>
      <StateProvider subState={subState}>       
        <AppOnlineStatusBar />
        <WalletIntegration>
          <Home />
        </WalletIntegration>
      </StateProvider>
    }
  </GlobalSubscription>
)

const VerificationWrappedApp = DutchXVerificationHOC(SubscribedApp)(LOCALFORAGE_KEYS.VERIFICATION_SETTINGS, LOCALFORAGE_KEYS.COOKIE_SETTINGS)

const App = ({
  disabledReason,
}) =>
  disabledReason
    ?
  <div><h1>BLOCKED</h1></div>
    :
  <VerificationWrappedApp />

export default hot(module)(withErrorBoundary(App))
