import React from 'react'
import { createSubscription } from 'create-subscription'

import { calculateDxMgnPoolState, fillDefaultAccount } from '../api'
import { getWeb3API } from '../api/ProviderWeb3'
import { fromWei, mapTS } from '../api/utils'

import createStatefulSub from './genericSub'


const fetchAccountData = async () => {
    const { getCurrentAccount } = await getWeb3API()
    const account = await getCurrentAccount()

    return { account }
}

const fetchETHBalance = async (account) => {
    account = await fillDefaultAccount(account)
    const { getCurrentBalance } = await getWeb3API()
    const balance = fromWei((await getCurrentBalance(account)))

    return { '[ETH] Balance': balance }
}

const fetchBlockTimestamp = async (hashOrNumber = 'latest') => {
    const { getBlockInfo } = await getWeb3API()
    const { timestamp } = await getBlockInfo(hashOrNumber)

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
        '[Wallet] MGN Balance': mgnBalance,
        '[Locked] MGN Balance': mgnLockedBalance,
        '[Unlocked] MGN Balance': mgnUnlockedBalance,
    }
}

const fetchMgnPoolData = async () => {
    const [,,,,
        totalShare1,
        totalShare2,
        totalContribution1,
        totalContribution2,        
      ] = mapTS(await calculateDxMgnPoolState(), 'fromWei')

    return {
        POOL1: {
            'TOTAL SHARE': totalShare1,
            'YOUR SHARE': totalContribution1,
        },
        POOL2: {
            'TOTAL SHARE': totalShare2,
            'YOUR SHARE': totalContribution2,
        },
    }
}

export const AccountSub = createStatefulSub(fetchAccountData, { account: 'loading...' })

export const ETHbalanceSub = createStatefulSub(fetchETHBalance, { balance: 'loading...' }, {
    _shouldUpdate(prevState, nextState) {
        if (!prevState || !prevState['[ETH] Balance'] || !prevState.account) return true
        return prevState.account !== nextState.account
            || !prevState['[ETH] Balance'].equals(nextState['[ETH] Balance'])
    },
})

export const BlockSub = createStatefulSub(fetchBlockTimestamp, { blockInfo: 'loading...' })

export const MGNBalancesSub = createStatefulSub(fetchMGNBalances, {
    '[Wallet] MGN Balance': 'loading...',
    '[Locked] MGN Balance': 'loading...',
    '[Unlocked] MGN Balance': 'loading...',
})

export const MGNPoolDataSub = createStatefulSub(fetchMgnPoolData, {
    POOL1: {
        'Total Share': 'loading...',
        'Your Contribution': 'loading...',
    },
    POOL2: {
        'Total Share': 'loading...',
        'Your Contribution': 'loading...',
    },
}, {
    _shouldUpdate(prevState, nextState) {
        if (!prevState) return true

        return prevState.POOL1['TOTAL SHARE'] !== (nextState.POOL1['TOTAL SHARE'])
            || prevState.POOL2['TOTAL SHARE'] !== (nextState.POOL2['TOTAL SHARE']) 
    },
})

// Subsribe Balances to changes in Accounts.
// Any change in account will fire an update in ETH balance
AccountSub.subscribe((accountState) => {
    ETHbalanceSub.update(accountState.account)
    MGNPoolDataSub.update()
    return MGNBalancesSub.update()
})

BlockSub.subscribe(() => {
    ETHbalanceSub.update()
    MGNPoolDataSub.update()
    return MGNBalancesSub.update()
})

export default async function startSubscriptions() {
    const { web3WS } = await getWeb3API()

    // get initial state populated
    AccountSub.update()
    BlockSub.update()

    // create filter listening for latest new blocks
    const subscription = web3WS.eth.subscribe('newBlockHeaders')

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

const VisualComp = props => (
    <pre>
        {JSON.stringify(props, null, 2)}
    </pre>
)

export const PropsDisplay = value => <VisualComp {...value} />

export const AllSubs = () => (
    <div>
        <p>Account Subscription</p>
        <AccountSubscription source={AccountSub}>
            {PropsDisplay}
        </AccountSubscription>
        <p>Account Balance</p>
        <ETHbalanceSubscription source={ETHbalanceSub}>
            {PropsDisplay}
        </ETHbalanceSubscription>
        {/* <p>Current Network Subscription</p>
         <NetworkSubscription source={NetworkAndTokensSub}>
            {PropsDisplay}
        </NetworkSubscription> */}
        <p>Current Block Subscription</p>
        <BlockSubscription source={BlockSub}>
            {PropsDisplay}
        </BlockSubscription>
    </div>
)
