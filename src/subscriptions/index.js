import { createSubscription } from 'create-subscription'

import { getAPI, calculateDxMgnPoolState, fillDefaultAccount } from '../api'
import { fromWei, mapTS, poolStateIdToName } from '../api/utils'

import createStatefulSub, { createMultiSub } from './genericSub'

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
    const balance = fromWei((await Web3.getCurrentBalance(account)))

    return { balance }
}

const fetchBlockTimestamp = async (hashOrNumber = 'latest') => {
    const { Web3 } = await getAPI()
    const { timestamp } = await Web3.getBlockInfo(hashOrNumber)

    return { timestamp }
}

const fetchMGNBalances = async () => {
    const [
        ,
        mgnLockedBalance,
        mgnUnlockedBalance,
        mgnBalance,
    ] = mapTS(await calculateDxMgnPoolState(), 'fromWei')

    return {
        MGN_BALANCE: mgnBalance,
        LOCKED_MGN_BALANCE: mgnLockedBalance,
        UNLOCKED_MGN_BALANCE: mgnUnlockedBalance,
    }
}

const fetchMgnPoolData = async () => {
    const [,,,,
        totalShare1,
        totalShare2,
        totalContribution1,
        totalContribution2,
        ,,
        pool1State,
        pool2State,       
      ] = mapTS(await calculateDxMgnPoolState(), 'fromWei')

    return {
        POOL1: {
            'CURRENT STATE': poolStateIdToName(pool1State),
            'TOTAL SHARE': totalShare1,
            'YOUR SHARE': totalContribution1,
        },
        POOL2: {
            'CURRENT STATE': poolStateIdToName(pool2State),
            'TOTAL SHARE': totalShare2,
            'YOUR SHARE': totalContribution2,
        },
    }
}

export const AccountSub = createStatefulSub(fetchAccountData, { account: 'loading...' })

export const NetworkSub = createStatefulSub(fetchNetwork, { network: 'loading...' })

export const ETHbalanceSub = createStatefulSub(fetchETHBalance, { balance: '0' })
window.ETHbalanceSub = ETHbalanceSub
export const BlockSub = createStatefulSub(fetchBlockTimestamp, { blockInfo: 'loading...' })

export const MGNBalancesSub = createStatefulSub(fetchMGNBalances, {
    MGN_BALANCE: 'loading...',
    LOCKED_MGN_BALANCE: 'loading...',
    UNLOCKED_MGN_BALANCE: 'loading...',
})

export const MGNPoolDataSub = createStatefulSub(fetchMgnPoolData, {
    POOL1: {
        'Current State': 'loading...',
        'Total Share': 'loading...',
        'Your Contribution': 'loading...',
    },
    POOL2: {
        'Current State': 'loading...',
        'Total Share': 'loading...',
        'Your Contribution': 'loading...',
    },
}, {
    _shouldUpdate(prevState, nextState) {
        if (!prevState) return true

        return prevState.POOL1['TOTAL SHARE'] !== (nextState.POOL1['TOTAL SHARE'])
            || prevState.POOL2['TOTAL SHARE'] !== (nextState.POOL2['TOTAL SHARE'])
            || prevState.POOL1['CURRENT STATE'] !== (nextState.POOL1['CURRENT STATE'])
            || prevState.POOL2['CURRENT STATE'] !== (nextState.POOL2['CURRENT STATE'])
    },
})

export const GlobalSub = createMultiSub(AccountSub, BlockSub, ETHbalanceSub, MGNBalancesSub, MGNPoolDataSub, NetworkSub)
// AccountSub.subscribe((accountState) => { console.error('ACCOUNT SUB LOG', accountState) })
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

    // create filter listening for latest new blocks
    const subscription = Web3.web3WS.eth.subscribe('newBlockHeaders')

    subscription.on('data', (blockHeader) => {
        console.debug('New block header - updating AccountSub, BlockSub + subscribers', blockHeader.timestamp)
        AccountSub.update()
        BlockSub.update()
    })

    subscription.on('error', (err) => {
        console.error('An error in newBlockHeaders WS subscription occurred - unsubscribing.', err.message || err)
        subscription.unsubscribe()
    })

    return () => subscription && subscription.unsubscribe()
}
