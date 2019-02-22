import React, { useReducer, useEffect } from 'react'
import { getWeb3API } from '../api/ProviderWeb3'
import { 
  getPoolTokensInfo, 
  approveAndDepositIntoDxMgnPool,
} from '../api'

import { toBN, toWei } from '../api/utils'

const defaultState = {
  USER: {
    ACCOUNT: 'CONNECTION ERROR',
    BALANCE: undefined,
  },
  PROVIDER: {
    ACTIVE_PROVIDER: null,
    NETWORK: 'NETWORK NOT SUPPORTED',
    PROVIDERS: [],
  },
  DX_MGN_POOL: {
    POOL1: {
      YOUR_SHARE: 0,
      TOTAL_SHARE: 0,
      DEPOSIT_TOKEN: '...',
      DEPOSIT_SYMBOL: '...',
      DEPOSIT_DECIMALS: '...',
      SECONDARY_TOKEN: '...',
      SECONDARY_SYMBOL: '...',
      SECONDARY_DECIMALS: '...',
      TOKEN_BALANCE: '...',
    },
    POOL2: {
      YOUR_SHARE: 0,
      TOTAL_SHARE: 0,
      POSIT_TOKEN: '...',
      DEPOSIT_SYMBOL: '...',
      DEPOSIT_DECIMALS: '...',
      SECONDARY_TOKEN: '...',
      SECONDARY_SYMBOL: '...',
      SECONDARY_DECIMALS: '...',
      TOKEN_BALANCE: '...',
    },
  },
  TOKEN_MGN: {
    ADDRESS: undefined,
    BALANCE: undefined,
    LOCKED_BALANCE: undefined,
    UNLOCKED_BALANCE: undefined,
  },
  CONTRACTS: {},
  SHOW_MODAL: undefined,
  LOADING: false,
  INPUT_AMOUNT: 0,
}

const { Provider, Consumer } = React.createContext(defaultState)

const setToContext = new WeakMap()
const memoizedContextValue = ({
  state,
  // Dispatchers
  appLoading,
  setDxMgnPoolState,
  setUserState,
  registerProviders,
  saveContract,
  setActiveProvider,
  saveTotalPoolShares,
  saveMGNAddressAndBalance,
  setUserParticipation,
  showModal,
  setDepositAmount,
  setInputAmount,
  setPoolTokenInfo,
}) => {
  // console.error(state)
  if (setToContext.has(state)) return setToContext.get(state)

  const contextValue = { 
    state, 
    appLoading, 
    setUserState, 
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
    setPoolTokenInfo,
  }

  setToContext.set(state, contextValue)
  return contextValue
}

/* class AppProvider extends React.Component {
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
    const { 
      getMGNTokenAddress, 
      getMGNTokenLockedBalance, 
      getMGNTokenUnlockedBalance, 
      getMGNTokenBalance, 
    } = await getDxPoolAPI()

    const [ADDRESS, LOCKED_BALANCE, UNLOCKED_BALANCE, BALANCE] = await Promise.all([
      getMGNTokenAddress(),
      getMGNTokenLockedBalance(this.state.USER.account),
      getMGNTokenUnlockedBalance(this.state.USER.account),
      getMGNTokenBalance(this.state.USER.account),
    ])

    this.setState(prevState => ({
      ...prevState,
      TOKEN_MGN: {
        ADDRESS,
        LOCKED_BALANCE,
        UNLOCKED_BALANCE,
        BALANCE,
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
      INPUT_AMOUNT,
    } = this.state

    console.debug('toBN(toWei(INPUT_AMOUNT)) ', toBN(toWei(INPUT_AMOUNT)))

    const receipt = await approveAndDepositIntoDxMgnPool(poolNumber, toBN(toWei(INPUT_AMOUNT)), this.state.USER.account)
		console.debug('TCL: AppProvider -> setDepositAmount -> RECEIPT= ', receipt)
  }

  setDxMgnPoolState = async () => {
    const [
      mgnAddress,
      mgnLockedBalance,
      mgnUnlockedBalance,
      mgnBalance,
      totalShare1,
      totalShare2,
      totalContribution1,
      totalContribution2,
      // TODO: can be cleaned up to used derived object names instead of duping logic
      // Deposit Token
      { name: name1, symbol: symbol1, decimals: decimals1, balance: balance1 },
      // Secondary Token
      { name: name2, symbol: symbol2, decimals: decimals2, balance: balance2 },
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
          TOKEN_BALANCE: balance1,
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
          TOKEN_BALANCE: balance2,
        },
      },
      TOKEN_MGN: {
        ADDRESS: mgnAddress,
        LOCKED_BALANCE: mgnLockedBalance,
        UNLOCKED_BALANCE: mgnUnlockedBalance,
        BALANCE: mgnBalance,
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
  setUserState = async () => {
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
} */

// CONSTANTS
const SET_ACTIVE_PROVIDER = 'SET_ACTIVE_PROVIDER'
const REGISTER_PROVIDERS = 'REGISTER_PROVIDERS'
const SET_APP_LOADING = 'SET_APP_LOADING'
const SHOW_MODAL = 'SHOW_MODAL'
const SET_INPUT_AMOUNT = 'SET_INPUT_AMOUNT'
const SET_USER_STATE = 'SET_USER_STATE'
const SET_POOL_TOKEN_INFO = 'SET_POOL_TOKEN_INFO'

function reducer(state, action) {
  switch (action.type) {
    /* 
     * DX-MGN-POOL SPECIFIC REDUCERS
     */

    case SET_INPUT_AMOUNT:
      return {
        ...state,
        INPUT_AMOUNT: action.payload,
      }

    case SET_POOL_TOKEN_INFO:
      return {
        ...state,
        DX_MGN_POOL: {
          POOL1: {
            ...state.DX_MGN_POOL.POOL1,
            DEPOSIT_TOKEN: action.payload.name,
            DEPOSIT_SYMBOL: action.payload.symbol,
            SECONDARY_TOKEN: action.payload.name2,
            SECONDARY_SYMBOL: action.payload.symbol2,
            TOKEN_BALANCE: action.payload.balance,
          },
          POOL2: {
            ...state.DX_MGN_POOL.POOL2,
            DEPOSIT_TOKEN: action.payload.name2,
            DEPOSIT_SYMBOL: action.payload.symbol2,
            SECONDARY_TOKEN: action.payload.name,
            SECONDARY_SYMBOL: action.payload.symbol,
            TOKEN_BALANCE: action.payload.balance2,
          },
        },
      }

    /*
     * USER STATE SPECIFIC REDUCERS 
     */

    case SET_USER_STATE:
      return {
        ...state,
        USER: {
          ACCOUNT: action.payload.ACCOUNT,
          BALANCE: action.payload.BALANCE,
        },
        PROVIDER: {
          ...state.PROVIDER,
          NETWORK: action.payload.NETWORK,
        },
      }

    /* 
     * PROVIDER SPECIFIC REDUCERS
     */

    case SET_ACTIVE_PROVIDER:
      return {
        ...state,
        PROVIDER: {
          ...state.PROVIDER,
          ACTIVE_PROVIDER: action.payload,
        },
       }

    case REGISTER_PROVIDERS:
       return { 
        ...state,
         PROVIDER: {
           ...state.PROVIDER,
           PROVIDERS: [action.payload, ...state.PROVIDER.PROVIDERS],
         },
        }

    /* 
     * APP SPECIFIC REDUCERS
     */
      
    case SET_APP_LOADING:
      return {
        ...state,
        LOADING: action.payload,
      }

    case SHOW_MODAL:
      return {
        ...state,
        SHOW_MODAL: action.payload,
      }

    default:
       return state
  }
}

function AppProvider(props) {
  const {
    children,
  } = props

  const [state, dispatch] = useReducer(reducer, defaultState)
  
  // useEffect - only update State when subscriber user Account changes
  useEffect(() => {
    console.debug('USE EFFECT IN ACTION', props.account)
    dispatch({ 
      type: SET_USER_STATE,
      payload: {
        ACCOUNT: props.account,
      },
    }) 
  }, [props.account])

  const dispatchers = {
    // DX-MGN DISPATCHERS
    setInputAmount: INPUT_AMOUNT =>
      dispatch({
        type: SET_INPUT_AMOUNT,
        payload: INPUT_AMOUNT,
      }),

    setDepositAmount: async (poolNumber) => {
      const { 
        USER: { ACCOUNT },
        INPUT_AMOUNT,
      } = state

      const receipt = await approveAndDepositIntoDxMgnPool(poolNumber, toBN(toWei(INPUT_AMOUNT)), ACCOUNT)
      console.debug('TCL: AppProvider -> setDepositAmount -> RECEIPT= ', receipt)
    },

    setPoolTokenInfo: async () => {
      const [
        {
          name,
          symbol,
          balance,
        },
        {
          name: name2,
          symbol: symbol2,
          balance: balance2,
        },
      ] = await getPoolTokensInfo()
      
      return dispatch({
        type: SET_POOL_TOKEN_INFO,
        payload: {
          name,
          symbol,
          balance,
          name2,
          symbol2,
          balance2,
        },
      })
    },

    // USER STATE SPECIFIC DISPATCHERS
    setUserState: async () => {
      const { getCurrentAccount, getNetwork, getCurrentBalance } = await getWeb3API()
      const [ACCOUNT, BALANCE, NETWORK] = await Promise.all([
        getCurrentAccount(),
        getCurrentBalance(),
        getNetwork(),
      ])
      return dispatch({
        type: SET_USER_STATE,
        payload: { 
          ACCOUNT,
          BALANCE,
          NETWORK,
        },
      })
    },
    
    // APP SPECIFIC DISPATCHERS
    appLoading: loadingState => dispatch({
      type: SET_APP_LOADING,
      payload: loadingState, 
    }),
    showModal: message => dispatch({ 
      type: SHOW_MODAL,
      payload: message, 
    }),

    // PROVIDER DISPATCHERS
    setActiveProvider: providerName =>
      dispatch({
        type: SET_ACTIVE_PROVIDER,
        payload: providerName,
      }),

    registerProviders: provider =>
      dispatch({
        type: REGISTER_PROVIDERS,
        payload: provider,
      }),
  }
  
  console.debug({ ...state, ...dispatchers })
  return (
    <Provider value={memoizedContextValue({ state, ...dispatchers })}>
        {children}
    </Provider>
  )
}

export const connect = (mapContextToProps = ctx => ctx) => WrapComponent =>
  props => (
    <Consumer>
      {context => <WrapComponent {...props} {...mapContextToProps(context)} />}
    </Consumer>
  )

export default AppProvider
