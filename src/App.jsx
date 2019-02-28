import React from 'react'
import { hot } from 'react-hot-loader'

import StateProvider from './components/StateProvider'
import WalletIntegration from './components/controls/WalletIntegration'
import Home from './components/display/Home'
import AppOnlineStatusBar from './components/display/AppOnlineStatus'

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

export default hot(module)(App)
