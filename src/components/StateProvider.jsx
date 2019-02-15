import React from 'react'
// import { getTokensAPI } from '../api/Tokens'
import { getDxPoolAPI } from '../api/DxPool'
import { getWeb3API } from '../api/ProviderWeb3'
import { 
  getTotalPoolShares, 
  getMGNTokenAddress, 
  getMGNTokenBalance,
  calculateUserParticipation,
} from '../api'
import { mapTS } from '../api/utils'

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
}

const { Provider, Consumer } = React.createContext(defaultState)

const setToContext = new WeakMap()
const memoizedContextValue = ({
  state,
  // Dispatchers
  appLoading,
  grabDXState,
  grabUserState,
  registerProviders,
  saveContract,
  setActiveProvider,
  saveTotalPoolShares,
  saveMGNAddressAndBalance,
  setUserParticipation,
}) => {
  if (setToContext.has(state)) return setToContext.get(state)

  const contextValue = { 
    state, 
    appLoading, 
    grabUserState, 
    grabDXState, 
    registerProviders, 
    setActiveProvider, 
    saveTotalPoolShares, 
    saveContract, 
    saveMGNAddressAndBalance, 
    setUserParticipation,
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

  // CONTRACT DISPATCHERS
  saveContract = ({ name, contract }) =>
    this.setState(prevState => ({
      ...prevState,
      CONTRACTS: {
        ...prevState.CONTRACTS,
        [name]: contract,
      },
    }))

  // DX DISPATCHERS
  saveTotalPoolShares = async () => {
    const [totalShare1, totalShare2] = mapTS(await getTotalPoolShares())

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
		console.log('TCL: AppProvider -> saveMGNAddressAndBalance -> address', address)
		console.log('TCL: AppProvider -> saveMGNAddressAndBalance -> balance', balance)

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
    console.log('TCL: AppProvider -> setUserParticipation -> totalContribution1, totalContribution2', mapTS(totalContribution1), mapTS(totalContribution2))
    
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

  grabDXState = async () => {
    const { getFRTAddress, getOWLAddress, getPriceFeedAddress } = await getDxPoolAPI()
    const [frtTokenAddress, owlTokenAddress, priceFeedAddress] = await Promise.all([
      getFRTAddress(),
      getOWLAddress(),
      getPriceFeedAddress(),
    ])
    return this.setState(prevState => ({
      ...prevState,
      DX_MGN_POOL: {
        ...prevState.DX_MGN_POOL,
        tokenFRT: {
          address: frtTokenAddress,
          ...prevState.DX_MGN_POOL.tokenFRT,
        },
        tokenOWL: {
          address: owlTokenAddress,
          ...prevState.DX_MGN_POOL.tokenOWL,
        },
        priceFeed: priceFeedAddress,
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
