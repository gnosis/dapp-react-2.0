import { createSubscription } from 'create-subscription'

import {
    getAPI,
    fillDefaultAccount,
} from 'api'

import { fromWei } from 'utils'

import createStatefulSub, { createMultiSub, StatefulSubBaseInterface } from './genericSub'

import { DATA_LOAD_STRING, FIXED_DECIMAL_AMOUNT } from 'globals'
import { Account, WalletProvider } from 'types'

const fetchAccountData = async () => {
    const { Web3 } = await getAPI()
    const account = await Web3.getCurrentAccount()

    return { account }
}

const fetchNetwork = async () => {
    const { Web3 } = await getAPI()
    const network = await Web3.getNetwork()

    return { network }
}

const fetchETHBalance = async (account: Account) => {
    account = await fillDefaultAccount(account)
    const { Web3 } = await getAPI()
    const balance = Number(fromWei((await Web3.getCurrentBalance()))).toFixed(FIXED_DECIMAL_AMOUNT)

    return { balance }
}

const fetchBlockTimestamp = async (hashOrNumber = 'pending') => {
    const { Web3 } = await getAPI()
    const block = await Web3.getBlockInfo(hashOrNumber)

    if (!block) return {}

    return { timestamp: block.timestamp }
}

export const AccountSub = createStatefulSub(fetchAccountData, { account: DATA_LOAD_STRING })

export const NetworkSub = createStatefulSub(fetchNetwork, { network: DATA_LOAD_STRING })

export const ETHbalanceSub = createStatefulSub(fetchETHBalance, { balance: '0' })
export const BlockSub = createStatefulSub(fetchBlockTimestamp, { blockInfo: DATA_LOAD_STRING })

export const GlobalSub = createMultiSub(AccountSub, BlockSub, ETHbalanceSub, NetworkSub)

GlobalSub.subscribe(() => {
    ETHbalanceSub.update()
    return NetworkSub.update()
})

export const AccountSubscription = createSubscription({
    getCurrentValue(source: StatefulSubBaseInterface) {
        // Return the current value of the subscription (source),
        // or `undefined` if the value can't be read synchronously (e.g. native Promises).
        return source.getState()
    },
    subscribe(source, callback) {
        // Subscribe (e.g. add an event listener) to the subscription (source).
        // Call callback(newValue) whenever a subscription changes.
        // Return an unsubscribe method,
        // Or a no-op if unsubscribe is not supported (e.g. native Promises).

        return source.subscribe(callback)
    },
})

export const GlobalSubscription = createSubscription({
    getCurrentValue(source: StatefulSubBaseInterface) {
        return source.getState()
    },
    subscribe(source, callback) {
        return source.subscribe(callback)
    },
})

export const ETHbalanceSubscription = createSubscription({
    getCurrentValue(source: StatefulSubBaseInterface) {
        return source.getState()
    },
    subscribe(source, callback) {
        return source.subscribe(callback)
    },
})
export const BlockSubscription = createSubscription({
    getCurrentValue(source: StatefulSubBaseInterface) {
        return source.getState()
    },
    subscribe(source, callback) {
        return source.subscribe(callback)
    },
})

export default async function startSubscriptions() {
  const { Web3 } = await getAPI()

  // get initial state populated
  AccountSub.update()
  BlockSub.update()
  NetworkSub.update()

    // create filter listening for latest new blocks
  const subscription = Web3.web3WS.eth.subscribe("newBlockHeaders")

  subscription.on("data", (blockHeader: { timestamp: string }) => {
    console.debug(
      "New block header - updating AccountSub, BlockSub + subscribers",
      blockHeader.timestamp,
    )
    // AccountSub.update()
        BlockSub.update()
    })

  subscription.on("error", (err: Error) => {
    console.error(
      "An error in newBlockHeaders WS subscription occurred - unsubscribing.",
      err.message || err,
    )
        subscription.unsubscribe()
    })

  const unsubAcc = watchMMaskFor(Web3.web3.currentProvider, 'accountsChanged', () => AccountSub.update())
  const unsubNetwork = watchMMaskFor(Web3.web3.currentProvider, 'networkChanged', () => NetworkSub.update())

  return () => {
    subscription && subscription.unsubscribe()
    unsubAcc()
    unsubNetwork()
  }
}

function watchMMaskFor(provider: WalletProvider & { on: Function, off: Function }, event: string, cb: Function) {
 if (typeof provider.on === 'function') {
  provider.on(event, cb)
  return () => provider.off(event, console.info)
 }
// noop
 return () => {}
}

if (process.env.NODE_ENV === 'development') {
  const withDevTools = typeof window !== "undefined" && (window as any).__REDUX_DEVTOOLS_EXTENSION__

  if (withDevTools) {
    const subs = {
      AccountSub,
      BlockSub,
      ETHbalanceSub,
      NetworkSub,
    }

    // @ts-ignore
    window.subs = subs
  
    const globalTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect({ name: 'Global' })
    const globalState = {}
    
    for (const name of Object.keys(subs)) {
      const sub = subs[name]
      const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect({ name })

      const state = sub.getState()
      globalState[name] = state
      
      devTools.init(state)
      
      sub.subscribe((newState: {}) => {
        devTools.send('UPDATE', newState)

        globalState[name] = newState
        globalTools.send(name, globalState)
      })
    }

    globalTools.init(globalState)
  }
}
