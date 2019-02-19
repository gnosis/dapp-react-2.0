import React from 'react'
import { getWeb3API } from '../api/ProviderWeb3'
import { 
  getTotalPoolShares, 
  getMGNTokenAddress, 
  getMGNTokenBalance,
  calculateUserParticipation,
  calculateDxMgnPoolState,
  approveAndDepositIntoDxMgnPool,
} from '../api'

import { toBN, toWei } from '../api/utils'

const defaultState = {
  USER: {
    account: 'CONNECTION ERROR',
    balance: undefined,
  },
  PROVIDER: {
    activeProvider: undefined,
    network: 'NETWORK NOT SUPPORTED',
    providers: [],
  },
  DX_MGN_POOL: {
    POOL1: {
      YOUR_SHARE: 0,
      TOTAL_SHARE: 0,
      DEPOSIT_AMOUNT: 0,
    },
    POOL2: {
      YOUR_SHARE: 0,
      TOTAL_SHARE: 0,
      DEPOSIT_AMOUNT: 0,
    },
  },
  TOKEN_MGN: {
    address: undefined,
    balance: undefined,
  },
  CONTRACTS: {},
  SHOW_MODAL: undefined,
  loading: false,
  INPUT_AMOUNT: 0,
}

const { Provider, Consumer } = React.createContext(defaultState)

const setToContext = new WeakMap()
const memoizedContextValue = ({
  state,
  // Dispatchers
  appLoading,
  setDxMgnPoolState,
  grabUserState,
  registerProviders,
  saveContract,
  setActiveProvider,
  saveTotalPoolShares,
  saveMGNAddressAndBalance,
  setUserParticipation,
  showModal,
  setDepositAmount,
  setInputAmount,
}) => {
  if (setToContext.has(state)) return setToContext.get(state)

  const contextValue = { 
    state, 
    appLoading, 
    grabUserState, 
    setDxMgnPoolState, 
    registerProviders, 
    setActiveProvider, 
    saveTotalPoolShares, 
    saveContract, 
    saveMGNAddressAndBalance, 
    setUserParticipation,
    showModal,
    setDepositAmount,
    setInputAmount,
  }

  setToContext.set(state, contextValue)
  return contextValue
}

class AppProvider extends React.Component {
  state = {
    ...defaultState,
  }
  // GENERIC DISPATCHERS
  appLoading = loadingState => this.setState(({ loading: loadingState }))
  showModal = message => this.setState(({ SHOW_MODAL: message }))
  
  // CONTRACT DISPATCHERS
  saveContract = ({ name, contract }) =>
    this.setState(prevState => ({
      ...prevState,
      CONTRACTS: {
        ...prevState.CONTRACTS,
        [name]: contract,
      },
    }))

  // DX-MGN DISPATCHERS
  setInputAmount = (INPUT_AMOUNT) => {
    this.setState(prevState => ({
      ...prevState,
      INPUT_AMOUNT,
    }))
  }

  saveMGNAddressAndBalance = async () => {
    const address = await getMGNTokenAddress()
    const balance = await getMGNTokenBalance(this.state.USER.account)

    this.setState(prevState => ({
      ...prevState,
      TOKEN_MGN: {
        address,
        balance,
      },
    }))
  }

  saveTotalPoolShares = async () => {
    const [totalShare1, totalShare2] = await getTotalPoolShares()

    return this.setState(prevState => ({
      ...prevState,
      DX_MGN_POOL: {
        ...prevState.DX_MGN_POOL,
        POOL1: {
          TOTAL_SHARE: totalShare1,
        },
        POOL2: {
          TOTAL_SHARE: totalShare2,
        },
      },
    }))
  }

  setUserParticipation = async () => {
    const { USER: { account } } = this.state
    const [totalContribution1, totalContribution2] = await calculateUserParticipation(account)
    
    this.setState(prevState => ({
      ...prevState,
      DX_MGN_POOL: {
        ...prevState.DX_MGN_POOL,
        POOL1: {
          ...prevState.DX_MGN_POOL.POOL1,
          YOUR_SHARE: totalContribution1,
        },
        POOL2: {
          ...prevState.DX_MGN_POOL.POOL2,
          YOUR_SHARE: totalContribution2,
        },
      },
    }))
  }

  setDepositAmount = async (poolNumber) => {
    const { 
      USER: { account },
      INPUT_AMOUNT,
    } = this.state

    const receipt = await approveAndDepositIntoDxMgnPool(poolNumber, toBN(toWei(INPUT_AMOUNT)), account)
		console.debug('TCL: AppProvider -> setDepositAmount -> RECEIPT= ', receipt)
  }

  setDxMgnPoolState = async () => {
    const [
      mgnAddress,
      mgnBalance,
      totalShare1,
      totalShare2,
      totalContribution1,
      totalContribution2,
      // Deposit Token
      { name: name1, symbol: symbol1, decimals: decimals1 },
      // Secondary Token
      { name: name2, symbol: symbol2, decimals: decimals2 },
     ] = await calculateDxMgnPoolState(this.state.USER.account)
    
     return this.setState(prevState => ({
      ...prevState,
      DX_MGN_POOL: {
        ...prevState.DX_MGN_POOL,
        POOL1: {
          ...prevState.DX_MGN_POOL.POOL1,
          YOUR_SHARE: totalContribution1,
          TOTAL_SHARE: totalShare1,
          DEPOSIT_TOKEN: name1,
          DEPOSIT_SYMBOL: symbol1,
          DEPOSIT_DECIMALS: decimals1,
          SECONDARY_TOKEN: name2,
          SECONDARY_SYMBOL: symbol2,
          SECONDARY_DECIMALS: decimals2,
        },
        POOL2: {
          ...prevState.DX_MGN_POOL.POOL2,
          YOUR_SHARE: totalContribution2,
          TOTAL_SHARE: totalShare2,
          DEPOSIT_TOKEN: name2,
          DEPOSIT_SYMBOL: symbol2,
          // dtDecimals: decimals2,
          SECONDARY_TOKEN: name1,
          // stSymbol: symbol1,
          // stDecimals: decimals1,
        },
      },
      TOKEN_MGN: {
        address: mgnAddress,
        balance: mgnBalance,
      },
    }))
  }

  // PROVIDER DISPATCHERS
  setActiveProvider = providerName =>
    this.setState(prevState =>
      ({
        ...prevState,
        PROVIDER: {
          ...prevState.PROVIDER,
          activeProvider: providerName,
        },
      }))
  registerProviders = provider =>
    this.setState(prevState =>
      ({
        ...prevState,
        PROVIDER: {
          providers: [...provider, ...prevState.PROVIDER.providers],
        },
      }))

  // USER STATE DISPATCHERS
  grabUserState = async () => {
    const { getCurrentAccount, getNetwork, getCurrentBalance } = await getWeb3API()
    const [account, balance, network] = await Promise.all([
      getCurrentAccount(),
      getCurrentBalance(),
      getNetwork(),
    ])

    return this.setState(prevState =>
      ({
        ...prevState,
        USER: {
          account,
          balance,
        },
        PROVIDER: {
          ...prevState.PROVIDER,
          network,
        },
      }))
  }

  render() {
    return (
      <Provider value={memoizedContextValue(this)}>
        {this.props.children}
      </Provider>
    )
  }
}

export const connect = (mapContextToProps = ctx => ctx) => WrapComponent =>
  props => (
    <Consumer>
      {context => <WrapComponent {...props} {...mapContextToProps(context)} />}
    </Consumer>
  )

export default AppProvider
