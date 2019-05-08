import React, { useReducer, useEffect } from 'react'
import { 
  getAPI,
} from '../api'

import { toWei, cleanDataNative, checkLoadingOrNonZero } from '../api/utils'

const defaultState = {
  USER: {
    ACCOUNT: 'CONNECTION ERROR',
    BALANCE: undefined,
  },
  PROVIDER: {
    ACTIVE_PROVIDER: undefined,
    PROVIDERS: [],
    NETWORK: 'NETWORK NOT SUPPORTED',
    BLOCK_TIMESTAMP: undefined,
  },
  CONTRACTS: {},
  SHOW_MODAL: undefined,
  LOADING: false,
}

const { Provider, Consumer } = React.createContext(defaultState)

const setToContext = new WeakMap()
const memoizedContextValue = ({
  state,
  // Dispatchers
  appLoading,
  setUserState,
  registerProviders,
  saveContract,
  setActiveProvider,
  showModal,
}) => {
  if (setToContext.has(state)) return setToContext.get(state)

  const contextValue = { 
    state, 
    appLoading, 
    setUserState, 
    registerProviders, 
    setActiveProvider, 
    saveContract, 
    showModal,
  }

  setToContext.set(state, contextValue)
  return contextValue
}

// CONSTANTS
const SET_ACTIVE_PROVIDER = 'SET_ACTIVE_PROVIDER'
const REGISTER_PROVIDERS = 'REGISTER_PROVIDERS'
const SET_APP_LOADING = 'SET_APP_LOADING'
const SHOW_MODAL = 'SHOW_MODAL'
const SET_USER_STATE = 'SET_USER_STATE'

function reducer(state, action) {
  switch (action.type) {
    /*
     * USER STATE SPECIFIC REDUCERS 
     */

    case SET_USER_ACCOUNT:
      return {
        ...state,
        USER: {
          ...state.USER,
          ACCOUNT: action.payload,
        },
      }

    case SET_USER_BALANCE:
      return {
        ...state,
        USER: {
          ...state.USER,
          BALANCE: action.payload,
        },
      }

    case SET_USER_STATE:
      return {
        ...state,
        USER: {
          ...state.USER,
          ...action.payload.USER,
        },
        PROVIDER: {
          ...state.PROVIDER,
          ...action.payload.PROVIDER,
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
    subState: [
      { account }, 
      { timestamp }, 
      { balance: etherBalance }, 
      { network },
    ],
  } = props

  const [state, dispatch] = useReducer(reducer, defaultState)
  
  // useEffect - only update State when subscriber user Account changes
  useEffect(() => {
    dispatch({ 
      type: SET_USER_STATE,
      payload: {
        USER: {
          ACCOUNT: account,
          BALANCE: etherBalance,
        },
        PROVIDER: {
          NETWORK: network,
          BLOCK_TIMESTAMP: timestamp,
        },
      },
    }) 
  }, [account, etherBalance, network, timestamp])

  const dispatchers = {
    // USER STATE SPECIFIC DISPATCHERS
    setUserState: async () => {
      const { Web3: { getCurrentAccount, getNetwork, getCurrentBalance } } = await getAPI()
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
