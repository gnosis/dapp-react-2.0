import React, { useEffect, useState } from 'react'

import Providers from '../../api/providers'

import { connect } from '../StateProvider'
import { getAPI } from '../../api'
import { getAppContracts } from '../../api/Contracts'
import { cleanData } from '../../api/utils'

import ConfigDisplayerHOC from '../hoc/ConfigDisplayHOC'
import ModalHOC from '../hoc/ModalHOC'

import startSubscriptions from '../../subscriptions'

function WalletIntegration({ 
  dispatchers: { 
    registerProviders, 
    setActiveProvider,
    showModal,
    setPoolTokenInfo,
  }, 
  state: { ACTIVE_PROVIDER }, 
  children,
}) {
  const [error, _setError] = useState(undefined)
  const [initialising, _setInitialising] = useState(false)
  const [activeProviderSet, _setActiveProviderState] = useState(undefined)

  // Fire once on load
  useEffect(() => {
    // returns [ Provider{}, ... ]
    const providersArray = Object.values(Providers)
    // register each providerObject into state
    providersArray.forEach(() => { registerProviders(providersArray) })
  }, [])

  useEffect(() => {
    let sub

    startSubscriptions().then((i) => {
      sub = i
    }).catch(console.error)

    return () => sub()
  }, [])

  // const saveContractToState = contracts => Object.keys(contracts).forEach(name => saveContract({ name, contract: contracts[name] }))

  /**
   * onChange Event Handler
   * @param { providerInfo } @type { ProviderObject }
   * @memberof WalletIntegration
   */
  const onChange = async (providerInfo) => {
    try {
      // Set Modal
      showModal('Loading user data . . .')
      // appLoading(true)

      // State setters
      _setError(undefined)
      _setInitialising(true)

      const chosenProvider = Providers[providerInfo]
      // initialize providers and return specific Web3 instances
      await chosenProvider.initialize()

      // Save ACTIVE_PROVIDER to State
      setActiveProvider(providerInfo)
      
      // Save web3 provider + notify state locally
      _setActiveProviderState(true)

      // interface with contracts & connect entire DX API
      // grabbing eth here to show contrived example of state
      await getAppContracts()

      // registers/saves contracts to StateProvider
      // saveContractToState(contracts)

      // INIT main API
      await getAPI()

      // Set pool token info
      setPoolTokenInfo()

      // Hide Modal, all good!
      showModal(undefined)
      // appLoading(false)

      return _setInitialising(false)
    } catch (err) {
      console.error(err)
      showModal(undefined)
      // appLoading(false)
      
      _setInitialising(false)
      return _setError(error)
    }
  }

  const walletSelector = () => (
    <section className="walletChooser">
      <h2>Please select a wallet</h2>
      <div className={!initialising ? 'lightBlue' : ''}>
        {Object.keys(Providers).map((provider, i) => {
          const providerObj = Providers[provider]
          return (
            <div
              className="poolContainer providerChoiceContainer"
              role="container"
              key={i}
              onClick={() => onChange(provider)}
            >
              <h4 className="providerChoice">{`${providerObj.providerName}`}</h4>
            </div>
          )
        })}
      </div>
      {error && <h3>{error.message}</h3>}
    </section>
  )
  
  if (error) return <h1>An error occurred: {error}</h1>
  
  if ((ACTIVE_PROVIDER && activeProviderSet) && !initialising) return children
  
  return walletSelector()
}

const mapProps = ({
  // state properties
  state: {
    PROVIDER: { ACTIVE_PROVIDER },
    DX_MGN_POOL: {
      POOL1: {
        TOTAL_SHARE: TOTAL_SHARE1,
        YOUR_SHARE: YOUR_SHARE1,
      },
      POOL2: {
        TOTAL_SHARE: TOTAL_SHARE2,
        YOUR_SHARE: YOUR_SHARE2,
      },
    },
    TOKEN_MGN: {
      ADDRESS,
      BALANCE,
    },
    LOADING,
    SHOW_MODAL,
    INPUT_AMOUNT,
  },
  // dispatchers
  appLoading,
  registerProviders,
  setActiveProvider,
  getDXTokenBalance,
  saveContract,
  showModal,
  setPoolTokenInfo,
}) => ({
  // state properties
  state: {
    "[Pool #1] Total Share": cleanData(TOTAL_SHARE1),
    "[Pool #1] User's Share": cleanData(YOUR_SHARE1),
    "[Pool #2] Total Share": cleanData(TOTAL_SHARE2),
    "[Pool #2] User's Share": cleanData(YOUR_SHARE2),
    "[MGN] Address": ADDRESS,
    "[MGN] Balance": cleanData(BALANCE),
    ACTIVE_PROVIDER,
    LOADING,
    SHOW_MODAL,
    INPUT_AMOUNT,
  },
  // dispatchers
  dispatchers: {
    appLoading,
    registerProviders,
    setActiveProvider,
    getDXTokenBalance,
    saveContract,
    showModal,
    setPoolTokenInfo,
  },
})

export default connect(mapProps)(process.env.SHOW_APP_DATA === 'true'
  ? ModalHOC(ConfigDisplayerHOC(WalletIntegration))
  : ModalHOC(WalletIntegration))
