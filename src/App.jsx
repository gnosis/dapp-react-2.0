import React from 'react'
import { hot } from 'react-hot-loader'
import { DutchXVerificationHOC } from '@gnosis.pm/dutchx-verification-react'

import AppOnlineStatusBar from './components/display/AppOnlineStatus'
import Home from './components/display/Home'
import StateProvider from './components/StateProvider'
import WalletIntegration from './components/controls/WalletIntegration'

import { LOCALFORAGE_KEYS } from './globals'

import { 
  GlobalSubscription,
  GlobalSub,
} from './subscriptions'

const App = () => (
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

export default hot(module)(DutchXVerificationHOC(App)(LOCALFORAGE_KEYS.VERIFICATION_SETTINGS, LOCALFORAGE_KEYS.COOKIE_SETTINGS))
