import { createSubscription } from 'create-subscription'

import {
    getAPI,
    calculateClaimableMgnAndDeposits,
    calculateDxMgnPoolState,
    fillDefaultAccount,
} from '../api'
import { fromWei, mapTS, poolStateIdToName, cleanDataFromWei, cleanDataNative } from '../api/utils'

import createStatefulSub, { createMultiSub } from './genericSub'

import { DATA_LOAD_STRING, FIXED_DECIMAL_AMOUNT } from '../globals'

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

const fetchETHBalance = async (account) => {
    account = await fillDefaultAccount(account)
    const { Web3 } = await getAPI()
    const balance = Number(fromWei((await Web3.getCurrentBalance(account)))).toFixed(FIXED_DECIMAL_AMOUNT)

    return { balance }
}

const fetchBlockTimestamp = async (hashOrNumber = 'pending') => {
    const { Web3 } = await getAPI()
    const block = await Web3.getBlockInfo(hashOrNumber)

    if (!block) return {}

    return { timestamp: block.timestamp }
}

const fetchMGNBalances = async () => {
    const {
        mgnLockedBalance,
        mgnUnlockedBalance,
        mgnBalance,
    } = await calculateDxMgnPoolState()

    const [
        mgnLockedBalanceWEI,
        mgnUnlockedBalanceWEI,
        mgnBalanceWEI,
    ] = mapTS([mgnLockedBalance, mgnUnlockedBalance, mgnBalance], 'fromWei') // .map(i => cleanDataFromWei(i))

    return {
        MGN_BALANCE: mgnBalanceWEI,
        LOCKED_MGN_BALANCE: mgnLockedBalanceWEI,
        UNLOCKED_MGN_BALANCE: mgnUnlockedBalanceWEI,
    }
}

const fetchMgnPoolData = async () => {
    try {
        const [
            {
                totalShare1,
                totalShare2,
                totalContribution1,
                totalContribution2,
                pool1State,
                pool2State,
                depositTokenObj: { balance, decimals },
                secondaryTokenObj: { balance: balance2, decimals: decimals2 },
                currentPoolingEndTime1,
                currentPoolingEndTime2,
            },
            {
                totalClaimableMgn,
                totalClaimableMgn2,
                totalClaimableDeposit,
                totalClaimableDeposit2,
            },
        ] = await Promise.all([
            calculateDxMgnPoolState(),
            calculateClaimableMgnAndDeposits(),
        ])

        const [
            ts1,
            ts2,
            tc1,
            tc2,
            tcMgnEth,
            tcMgnEth2,
        ] = [
            totalShare1,
            totalShare2,
            totalContribution1,
            totalContribution2,
            totalClaimableMgn,
            totalClaimableMgn2,
        ].map(i => cleanDataFromWei(i))
        
        return {
            POOL1: {
                CURRENT_STATE: poolStateIdToName(pool1State.toString()),
                POOLING_PERIOD_END: currentPoolingEndTime1.toString(),
                TOTAL_SHARE: ts1,
                YOUR_SHARE: tc1,
                TOTAL_CLAIMABLE_MGN: tcMgnEth,
                TOTAL_CLAIMABLE_DEPOSIT: cleanDataNative(totalClaimableDeposit, decimals), // (totalClaimableDeposit.toString() / (10 ** decimals)),
                TOKEN_BALANCE: cleanDataNative(balance, decimals), // (balance.toString() / (10 ** decimals)),
            },
            POOL2: {
                CURRENT_STATE: poolStateIdToName(pool2State.toString()),
                POOLING_PERIOD_END: currentPoolingEndTime2.toString(),
                TOTAL_SHARE: ts2,
                YOUR_SHARE: tc2,
                TOTAL_CLAIMABLE_MGN: tcMgnEth2,
                TOTAL_CLAIMABLE_DEPOSIT: cleanDataNative(totalClaimableDeposit2, decimals2), // (totalClaimableDeposit2.toString() / (10 ** decimals2)),
                TOKEN_BALANCE: cleanDataNative(balance2, decimals2), // (balance2.toString() / (10 ** decimals2)),
            },
        }
    } catch (error) {
        console.error(error)
    }
}

export const AccountSub = createStatefulSub(fetchAccountData, { account: DATA_LOAD_STRING })

export const NetworkSub = createStatefulSub(fetchNetwork, { network: DATA_LOAD_STRING })

export const ETHbalanceSub = createStatefulSub(fetchETHBalance, { balance: '0' })
export const BlockSub = createStatefulSub(fetchBlockTimestamp, { blockInfo: DATA_LOAD_STRING })

export const MGNBalancesSub = createStatefulSub(fetchMGNBalances, {
    MGN_BALANCE: DATA_LOAD_STRING,
    LOCKED_MGN_BALANCE: DATA_LOAD_STRING,
    UNLOCKED_MGN_BALANCE: DATA_LOAD_STRING,
})

export const MGNPoolDataSub = createStatefulSub(fetchMgnPoolData, {
    POOL1: {
        CURRENT_STATE: DATA_LOAD_STRING,
        POOLING_PERIOD_END: null,
        TOTAL_SHARE: DATA_LOAD_STRING,
        YOUR_SHARE: DATA_LOAD_STRING,
        TOTAL_CLAIMABLE_MGN: DATA_LOAD_STRING,
        TOTAL_CLAIMABLE_DEPOSIT: DATA_LOAD_STRING,
        TOKEN_BALANCE: DATA_LOAD_STRING,
    },
    POOL2: {
        CURRENT_STATE: DATA_LOAD_STRING,
        POOLING_PERIOD_END: null,
        TOTAL_SHARE: DATA_LOAD_STRING,
        YOUR_SHARE: DATA_LOAD_STRING,
        TOTAL_CLAIMABLE_MGN: DATA_LOAD_STRING,
        TOTAL_CLAIMABLE_DEPOSIT: DATA_LOAD_STRING,
        TOKEN_BALANCE: DATA_LOAD_STRING,
    },
}, {
        _shouldUpdate(prevState, nextState) {
            if (!prevState) return true

            return prevState.POOL1.YOUR_SHARE !== (nextState.POOL1.YOUR_SHARE)
                || prevState.POOL2.YOUR_SHARE !== (nextState.POOL2.YOUR_SHARE)
                || prevState.POOL1.TOTAL_SHARE !== (nextState.POOL1.TOTAL_SHARE)
                || prevState.POOL2.TOTAL_SHARE !== (nextState.POOL2.TOTAL_SHARE)
                || prevState.POOL1.CURRENT_STATE !== (nextState.POOL1.CURRENT_STATE)
                || prevState.POOL2.CURRENT_STATE !== (nextState.POOL2.CURRENT_STATE)
                || prevState.POOL1.POOLING_PERIOD_END !== (nextState.POOL1.POOLING_PERIOD_END)
                || prevState.POOL2.POOLING_PERIOD_END !== (nextState.POOL2.POOLING_PERIOD_END)
                || prevState.POOL1.TOTAL_CLAIMABLE_MGN !== (nextState.POOL1.TOTAL_CLAIMABLE_MGN)
                || prevState.POOL2.TOTAL_CLAIMABLE_MGN !== (nextState.POOL2.TOTAL_CLAIMABLE_MGN)
                || prevState.POOL1.TOTAL_CLAIMABLE_DEPOSIT !== (nextState.POOL1.TOTAL_CLAIMABLE_DEPOSIT)
                || prevState.POOL2.TOTAL_CLAIMABLE_DEPOSIT !== (nextState.POOL2.TOTAL_CLAIMABLE_DEPOSIT)
        },
    })

export const GlobalSub = createMultiSub(AccountSub, BlockSub, ETHbalanceSub, MGNBalancesSub, MGNPoolDataSub, NetworkSub)

GlobalSub.subscribe(() => {
    ETHbalanceSub.update()
    MGNPoolDataSub.update()
    MGNBalancesSub.update()
    return NetworkSub.update()
})

export const AccountSubscription = createSubscription({
    getCurrentValue(source) {
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
    getCurrentValue(source) {
        return source.getState()
    },
    subscribe(source, callback) {
        return source.subscribe(callback)
    },
})

export const ETHbalanceSubscription = createSubscription({
    getCurrentValue(source) {
        return source.getState()
    },
    subscribe(source, callback) {
        return source.subscribe(callback)
    },
})
export const BlockSubscription = createSubscription({
    getCurrentValue(source) {
        return source.getState()
    },
    subscribe(source, callback) {
        return source.subscribe(callback)
    },
})

export const MGNBalancesSubscription = createSubscription({
    getCurrentValue(source) {
        return source.getState()
    },
    subscribe(source, callback) {
        return source.subscribe(callback)
    },
})

export const MGNPoolDataSubscription = createSubscription({
    getCurrentValue(source) {
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

  subscription.on("data", (blockHeader) => {
    console.debug(
      "New block header - updating AccountSub, BlockSub + subscribers",
      blockHeader.timestamp,
    )
    // AccountSub.update()
        BlockSub.update()
    })

  subscription.on("error", (err) => {
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

function watchMMaskFor(provider, event, cb) {
 if (typeof provider.on === 'function') {
  provider.on(event, cb)
  return () => provider.off(event, console.info)
 }
// noop
 return () => {}
}

if (process.env.NODE_ENV === 'development') {
  const withDevTools = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__

  if (withDevTools) {
    const subs = {
      AccountSub,
      BlockSub,
      ETHbalanceSub,
      MGNBalancesSub,
      MGNPoolDataSub,
      NetworkSub,
    }

    window.subs = subs
  

    const globalTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name: 'Global' })
    const globalState = {}
    
    for (const name of Object.keys(subs)) {
      const sub = subs[name]
      const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name })

      const state = sub.getState()
      globalState[name] = state
      
      devTools.init(state)
      
      sub.subscribe((newState) => {
        devTools.send('UPDATE', newState)

        globalState[name] = newState
        globalTools.send(name, globalState)
      })
    }

    globalTools.init(globalState)
  }
}
