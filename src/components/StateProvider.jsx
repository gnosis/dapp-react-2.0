import React from 'react'
import { getWeb3API } from '../api/ProviderWeb3'
import { 
  getTotalPoolShares, 
  getMGNTokenAddress, 
  getMGNTokenBalance,
  calculateUserParticipation,
  calculateDxMgnPoolState,
} from '../api'

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
    pool1: {
      totalShare: 0,
      totalUserParticipation: 0,
    },
    pool2: {
      totalShare: 0,
      totalUserParticipation: 0,
    },
  },
  TOKEN_MGN: {
    address: undefined,
    balance: undefined,
  },
  CONTRACTS: {},
  loading: false,
  SHOW_MODAL: undefined,
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
  saveTotalPoolShares = async () => {
    const [totalShare1, totalShare2] = await getTotalPoolShares()

    return this.setState(prevState => ({
      ...prevState,
      DX_MGN_POOL: {
        ...prevState.DX_MGN_POOL,
        pool1: {
          totalShare: totalShare1,
        },
        pool2: {
          totalShare: totalShare2,
        },
      },
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

  setUserParticipation = async () => {
    const { USER: { account } } = this.state
    const [totalContribution1, totalContribution2] = await calculateUserParticipation(account)
    
    this.setState(prevState => ({
      ...prevState,
      DX_MGN_POOL: {
        ...prevState.DX_MGN_POOL,
        pool1: {
          ...prevState.DX_MGN_POOL.pool1,
          totalUserParticipation: totalContribution1,
        },
        pool2: {
          ...prevState.DX_MGN_POOL.pool2,
          totalUserParticipation: totalContribution2,
        },
      },
    }))
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
        pool1: {
          ...prevState.DX_MGN_POOL.pool1,
          totalShare: totalShare1,
          totalUserParticipation: totalContribution1,
          dtName: name1,
          dtSymbol: symbol1,
          dtDecimals: decimals1,
          stName: name2,
          stSymbol: symbol2,
          stDecimals: decimals2,
        },
        pool2: {
          ...prevState.DX_MGN_POOL.pool2,
          totalShare: totalShare2,
          totalUserParticipation: totalContribution2,
          dtName: name2,
          dtSymbol: symbol2,
          dtDecimals: decimals2,
          stName: name1,
          stSymbol: symbol1,
          stDecimals: decimals1,
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
