import React, { useEffect, useState } from 'react'

// State connector
import { connect } from '../StateProvider'

// API
import { getAPI } from '../../api'
import Providers, { safeInjected, checkProviderOnWindow } from '../../api/providers'
import { getAppContracts } from '../../api/Contracts'
import { delay } from '../../api/utils'

// HOC Components
import ConfigDisplayerHOC from '../hoc/ConfigDisplayHOC'
import ModalHOC from '../hoc/ModalHOC'

// Subscription starter
import startSubscriptions from '../../subscriptions'

function WalletIntegration({ 
  dispatchers: { 
    registerProviders, 
    setActiveProvider,
    showModal,
  }, 
  state: { ACTIVE_PROVIDER }, 
  children,
}) {
  /* 
   * STATE
   */
  const [activeProviderSet, setActiveProviderState] = useState(undefined)
  const [error, setError] = useState(undefined)
  const [initialising, setInitialising] = useState(false)
  const [providersDetected, setProvidersDetected] = useState(false)

  // Fire once on load
  useEffect(() => {
    // returns [ Provider{}, ... ]
    const providersArray = Object.values(Providers)
    // register each providerObject into state
    providersArray.forEach(() => { registerProviders(providersArray) })
  }, [])

  /**
   * onChange Event Handler
   * @param { providerInfo } @type { ProviderObject }
   * @memberof WalletIntegration
   */
  const onChange = async (providerInfo) => {
    // App state subscriptions
    let unsub
    try {
      // Set Modal
      showModal('Loading user data . . .')

      // Gnosis Safe Fix
      Promise.race([
        delay(500),
        safeInjected,
      ]).then(async () => {
        const provider = await checkProviderOnWindow()
        setProvidersDetected(!!provider)
      })

      // State setters
      setError(undefined)
      setInitialising(true)

      const chosenProvider = Providers[providerInfo]
      // initialize providers and return specific Web3 instances
      await chosenProvider.initialize()

      // Save ACTIVE_PROVIDER to State
      setActiveProvider(providerInfo)
      
      // Save web3 provider + notify state locally
      setActiveProviderState(true)

      // interface with contracts & connect entire DX API
      await getAppContracts()

      // INIT main API
      await getAPI()

      // Start socket state subscriptions
      unsub = await startSubscriptions()

      // Lazy load pool token info
      setPoolTokenInfo()

      // Hide Modal, all good!
      showModal(undefined)

      return setInitialising(false)
    } catch (err) {
      console.error(err)

      showModal(undefined)      
      setInitialising(false)
      setError(error)

      // Unsubscribe
      return unsub()
    }
  }

  const walletSelector = () => (
    <section className="walletChooser">
      <h2>Please select a wallet</h2>
      <div className={initialising || providersDetected ? '' : 'lightBlue'}>
        {Object.keys(Providers).map((provider, i) => {
          const providerObj = Providers[provider]
          return (
            <div
              className="poolContainer providerChoiceContainer"
              role="container"
              key={i}
              onClick={() => onChange(provider)}
            >
              <h4 className="providerChoice">{`${providerObj.providerName || ''}`}</h4>
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
    LOADING,
    SHOW_MODAL,
  },
  // dispatchers
  appLoading,
  registerProviders,
  saveContract,
  setActiveProvider,
  showModal,
}) => ({
  // state properties
  state: {
    ACTIVE_PROVIDER,
    LOADING,
    SHOW_MODAL,
  },
  // dispatchers
  dispatchers: {
    appLoading,
    registerProviders,
    setActiveProvider,
    saveContract,
    showModal,
  },
})

export default connect(mapProps)(process.env.SHOW_APP_DATA === 'true'
  ? ModalHOC(ConfigDisplayerHOC(WalletIntegration))
  : ModalHOC(WalletIntegration))
