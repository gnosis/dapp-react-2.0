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
    const {
        mgnLockedBalance,
        mgnUnlockedBalance,
        mgnBalance,
     } = await calculateDxMgnPoolState()

    const [mgnLockedBalanceWEI, mgnUnlockedBalanceWEI, mgnBalanceWEI] = mapTS([mgnLockedBalance, mgnUnlockedBalance, mgnBalance], 'fromWei')

    return {
        MGN_BALANCE: mgnBalanceWEI,
        LOCKED_MGN_BALANCE: mgnLockedBalanceWEI,
        UNLOCKED_MGN_BALANCE: mgnUnlockedBalanceWEI,
    }
}

const fetchMgnPoolData = async () => {
    const {
        totalShare1,
        totalShare2,
        totalContribution1,
        totalContribution2,
        pool1State,
        pool2State,
        depositTokenObj: { balance },
        secondaryTokenObj: { balance: balance2 },       
     } = await calculateDxMgnPoolState()

    const [ts1, ts2, tc1, tc2] = mapTS([totalShare1, totalShare2, totalContribution1, totalContribution2, pool1State, pool2State], 'fromWei')

    return {
        POOL1: {
            CURRENT_STATE: poolStateIdToName(pool1State.toString()),
            TOTAL_SHARE: ts1,
            YOUR_SHARE: tc1,
            TOKEN_BALANCE: balance,
        },
        POOL2: {
            CURRENT_STATE: poolStateIdToName(pool2State.toString()),
            TOTAL_SHARE: ts2,
            YOUR_SHARE: tc2,
            TOKEN_BALANCE: balance2,
        },
    }
}

export const AccountSub = createStatefulSub(fetchAccountData, { account: 'loading...' })

export const NetworkSub = createStatefulSub(fetchNetwork, { network: 'loading...' })

export const ETHbalanceSub = createStatefulSub(fetchETHBalance, { balance: '0' })
export const BlockSub = createStatefulSub(fetchBlockTimestamp, { blockInfo: 'loading...' })

export const MGNBalancesSub = createStatefulSub(fetchMGNBalances, {
    MGN_BALANCE: 'loading...',
    LOCKED_MGN_BALANCE: 'loading...',
    UNLOCKED_MGN_BALANCE: 'loading...',
})

export const MGNPoolDataSub = createStatefulSub(fetchMgnPoolData, {
    POOL1: {
        CURRENT_STATE: 'loading...',
        TOTAL_SHARE: 'loading...',
        YOUR_SHARE: 'loading...',
        TOKEN_BALANCE: 'loading...',
    },
    POOL2: {
        CURRENT_STATE: 'loading...',
        TOTAL_SHARE: 'loading...',
        YOUR_SHARE: 'loading...',
        TOKEN_BALANCE: 'loading...',
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
    // BlockSub.update()

    // create filter listening for latest new blocks
    const subscription = Web3.web3WS.eth.subscribe('newBlockHeaders')

    subscription.on('data', (blockHeader) => {
        console.debug('New block header - updating AccountSub, BlockSub + subscribers', blockHeader.timestamp)
        AccountSub.update()
        // BlockSub.update()
    })

    subscription.on('error', (err) => {
        console.error('An error in newBlockHeaders WS subscription occurred - unsubscribing.', err.message || err)
        subscription.unsubscribe()
    })

    return () => subscription && subscription.unsubscribe()
}
