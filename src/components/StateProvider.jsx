import React, { useReducer, useEffect } from 'react'
import { 
  getAPI,
  getPoolTokensInfo, 
  approveAndDepositIntoDxMgnPool,
  calculateDxMgnPoolState,
  withdrawMGNandDepositsFromSinglePool,
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
  DX_MGN_POOL: {
    POOL1: {
      YOUR_SHARE: 0,
      TOTAL_SHARE: 0,
      TOTAL_CLAIMABLE_DEPOSIT: '...',
      TOTAL_CLAIMABLE_MGN: '...',
      TOKEN_BALANCE: '...',
      DEPOSIT_TOKEN: '...',
      DEPOSIT_SYMBOL: '...',
      DEPOSIT_DECIMALS: '...',
      SECONDARY_TOKEN: '...',
      SECONDARY_SYMBOL: '...',
      SECONDARY_DECIMALS: '...',
    },
    POOL2: {
      YOUR_SHARE: 0,
      TOTAL_SHARE: 0,
      TOTAL_CLAIMABLE_DEPOSIT: '...',
      TOTAL_CLAIMABLE_MGN: '...',
      TOKEN_BALANCE: '...',
      DEPOSIT_TOKEN: '...',
      DEPOSIT_SYMBOL: '...',
      DEPOSIT_DECIMALS: '...',
      SECONDARY_TOKEN: '...',
      SECONDARY_SYMBOL: '...',
      SECONDARY_DECIMALS: '...',
    },
  },
  TOKEN_MGN: {
    ADDRESS: '...',
    BALANCE: '...',
    LOCKED_BALANCE: '...',
    UNLOCKED_BALANCE: '...',
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
  withdrawDepositAndMGN,
}) => {
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
    withdrawDepositAndMGN,
  }

  setToContext.set(state, contextValue)
  return contextValue
}

// CONSTANTS
const SET_ACTIVE_PROVIDER = 'SET_ACTIVE_PROVIDER'
const REGISTER_PROVIDERS = 'REGISTER_PROVIDERS'
const SET_APP_LOADING = 'SET_APP_LOADING'
const SHOW_MODAL = 'SHOW_MODAL'
const SET_INPUT_AMOUNT = 'SET_INPUT_AMOUNT'
const SET_USER_STATE = 'SET_USER_STATE'
const SET_POOL_TOKEN_INFO = 'SET_POOL_TOKEN_INFO'
const SET_USER_ACCOUNT = 'SET_USER_ACCOUNT'
const SET_USER_BALANCE = 'SET_USER_BALANCE'
const SET_MGN_BALANCES = 'SET_MGN_BALANCES'
const SET_ALL_DX_POOL_STATES = 'SET_ALL_DX_POOL_STATES'
const SET_DX_POOL_STATE = 'SET_DX_POOL_STATE'

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

    case SET_MGN_BALANCES:
      return {
        ...state,
        TOKEN_MGN: {
          ...state.TOKEN_MGN,
          ...action.payload,
        },
      }

    case SET_POOL_TOKEN_INFO:
      return {
        ...state,
        DX_MGN_POOL: {
          ...state.DX_MGN_POOL,
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

    case SET_DX_POOL_STATE:
      return {
        ...state,
        DX_MGN_POOL: {
          ...state.DX_MGN_POOL,
          [action.pool]: {
            ...state.DX_MGN_POOL[action.pool],
            ...action.payload,
          },
        },
      }

    case SET_ALL_DX_POOL_STATES:
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
        DX_MGN_POOL: {
          ...state.DX_MGN_POOL,
          POOL1: {
            ...state.DX_MGN_POOL.POOL1,
            ...action.payload.POOL1,
          },
          POOL2: {
            ...state.DX_MGN_POOL.POOL2,
            ...action.payload.POOL2,
          },
        },
        TOKEN_MGN: {
          ...state.TOKEN_MGN,
          ...action.payload.TOKEN_MGN,
        },
      }

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
      { balance: ETHBalance }, 
      { MGN_BALANCE, LOCKED_MGN_BALANCE, UNLOCKED_MGN_BALANCE }, 
      { 
        POOL1: { 
          CURRENT_STATE,
          POOLING_PERIOD_END,
          TOTAL_SHARE, 
          YOUR_SHARE, 
          TOKEN_BALANCE, 
          TOTAL_CLAIMABLE_MGN, 
          TOTAL_CLAIMABLE_DEPOSIT, 
        }, 
        POOL2: { 
          CURRENT_STATE: CURRENT_STATE2,
          POOLING_PERIOD_END: POOLING_PERIOD_END2,
          TOTAL_SHARE: TOTAL_SHARE2, 
          YOUR_SHARE: YOUR_SHARE2, 
          TOKEN_BALANCE: TOKEN_BALANCE2, 
          TOTAL_CLAIMABLE_MGN: TOTAL_CLAIMABLE_MGN2, 
          TOTAL_CLAIMABLE_DEPOSIT: TOTAL_CLAIMABLE_DEPOSIT2, 
        },
      }, 
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
          BALANCE: ETHBalance,
        },
        PROVIDER: {
          NETWORK: network,
          BLOCK_TIMESTAMP: timestamp,
        },
      },
    }) 
  }, [account, ETHBalance, network, timestamp])

  // useEffect - only update State when subscriber user Account changes
  useEffect(() => {
    dispatch({ 
      type: SET_MGN_BALANCES,
      payload: {
        MGN_BALANCE,
        LOCKED_MGN_BALANCE,
        UNLOCKED_MGN_BALANCE,
      },
    }) 
  }, [MGN_BALANCE, LOCKED_MGN_BALANCE, UNLOCKED_MGN_BALANCE])

  // useEffect - only update State when subscriber user Account changes
  useEffect(() => {
    dispatch({ 
      type: SET_DX_POOL_STATE,
      pool: 'POOL1',
      payload: {
        CURRENT_STATE,
        POOLING_PERIOD_END,
        TOTAL_SHARE,
        YOUR_SHARE,
        TOTAL_CLAIMABLE_MGN,
        TOTAL_CLAIMABLE_DEPOSIT,
        TOKEN_BALANCE,
      },
    }) 
  }, [CURRENT_STATE, POOLING_PERIOD_END, TOTAL_SHARE, YOUR_SHARE, TOKEN_BALANCE, TOTAL_CLAIMABLE_MGN, TOTAL_CLAIMABLE_DEPOSIT])

  // useEffect - only update State when subscriber user Account changes
  useEffect(() => {
    dispatch({ 
      type: SET_DX_POOL_STATE,
      pool: 'POOL2',
      payload: {
        CURRENT_STATE: CURRENT_STATE2,
        POOLING_PERIOD_END: POOLING_PERIOD_END2,
        TOTAL_SHARE: TOTAL_SHARE2,
        YOUR_SHARE: YOUR_SHARE2,
        TOTAL_CLAIMABLE_MGN: TOTAL_CLAIMABLE_MGN2,
        TOTAL_CLAIMABLE_DEPOSIT: TOTAL_CLAIMABLE_DEPOSIT2,
        TOKEN_BALANCE: TOKEN_BALANCE2,
      },
    }) 
  }, [CURRENT_STATE2, POOLING_PERIOD_END2, TOTAL_SHARE2, YOUR_SHARE2, TOKEN_BALANCE2, TOTAL_CLAIMABLE_MGN2, TOTAL_CLAIMABLE_DEPOSIT2])

  const dispatchers = {
    // DX-MGN DISPATCHERS
    setInputAmount: INPUT_AMOUNT =>
      dispatch({
        type: SET_INPUT_AMOUNT,
        payload: INPUT_AMOUNT,
      }),

    setDepositAmount: async ({
      poolNumber,
      amount = state.INPUT_AMOUNT,
      userAccount = state.USER.ACCOUNT,
    }) => {
      const receipt = await approveAndDepositIntoDxMgnPool(poolNumber, toWei(amount), userAccount)
			console.debug('APPROVE and DEPOSIT into DX-MGN-POOL TX RECEIPT: ', receipt)
    },

    setDxMgnPoolState: async () => {
      const {
        mgnLockedBalance,
        mgnUnlockedBalance, 
        mgnBalance,
        totalShare1,
        totalShare2,
        totalContribution1,
        totalContribution2,
        depositTokenObj: { name: name1, symbol: symbol1, decimals: decimals1, balance: balance1 },
        secondaryTokenObj: { name: name2, symbol: symbol2, decimals: decimals2, balance: balance2 },
        pool1State, 
        pool2State,
       } = await calculateDxMgnPoolState(state.USER.account)
      
       return dispatch({
        type: SET_ALL_DX_POOL_STATES,
        payload: {
          TOKEN_MGN: {
            BALANCE: mgnBalance,
            LOCKED_BALANCE: mgnLockedBalance,
            UNLOCKED_BALANCE: mgnUnlockedBalance,
          },
          POOL1: {
            CURRENT_STATE: pool1State,
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
            CURRENT_STATE: pool2State,
            YOUR_SHARE: totalContribution2,
            TOTAL_SHARE: totalShare2,
            TOKEN_BALANCE: balance2,
          },
        },
      })
    },

    setPoolTokenInfo: async () => {
      const [
        {
          name,
          symbol,
          balance,
          decimals,
        },
        {
          name: name2,
          symbol: symbol2,
          balance: balance2,
          decimals: decimals2,
        },
      ] = await getPoolTokensInfo()
      
      return dispatch({
        type: SET_POOL_TOKEN_INFO,
        payload: {
          name,
          symbol,
          balance: cleanDataNative(balance, decimals), // balance && (balance.toString() / 10 ** decimals),
          name2,
          symbol2,
          balance2: cleanDataNative(balance2, decimals2), // balance2 && (balance2.toString() / 10 ** decimals2),
        },
      })
    },

    withdrawDepositAndMGN: async (pool) => {
      if (!pool) throw new Error('No pool specified')

      const { 
        USER: { ACCOUNT },
        DX_MGN_POOL: {
          [pool]: {
            TOTAL_CLAIMABLE_DEPOSIT: tcd,
            TOTAL_CLAIMABLE_MGN: tcm,
          },
          /* POOL2: {
            TOTAL_CLAIMABLE_DEPOSIT: tcd2,
            TOTAL_CLAIMABLE_MGN: tcm2,
          }, */
        },
      } = state

			console.debug('TCL: AppProvider -> tcd, tcm', tcd, tcm)
      // PoolData.jsx checks that values are nonZero AND not 'LOADING...'
      // before showing button - so no need to check here as well
      if (!checkLoadingOrNonZero(tcd, tcm)) throw new Error('Nothing claimable!')

      return withdrawMGNandDepositsFromSinglePool(ACCOUNT, pool)
    },

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
