import React, { useEffect, useState } from 'react'

import { delay } from '../../api/utils'

import Providers, { safeInjected, checkProviderOnWindow } from '../../api/providers'

import { connect } from '../StateProvider'
import { getAPI } from '../../api'
import { getAppContracts } from '../../api/Contracts'

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
  const [providersDetected, setProvidersDetected] = useState(false)
  const [error, _setError] = useState(undefined)
  const [initialising, _setInitialising] = useState(false)
  const [activeProviderSet, _setActiveProviderState] = useState(undefined)
  // const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)


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
      await getAppContracts()

      // INIT main API
      await getAPI()

      // Start socket state subscriptions
      unsub = await startSubscriptions()

      // Lazy load pool token info
      setPoolTokenInfo()

      // Hide Modal, all good!
      showModal(undefined)

      return _setInitialising(false)
    } catch (err) {
      console.error(err)

      showModal(undefined)      
      _setInitialising(false)
      _setError(error)

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
  
  /* // TODO: remove
  if (!disclaimerAccepted) {
    return (
      <DutchXVerfication
        fontFamily="monospace"
        relativeFontSize={13}

        acceptDisclaimer={setDisclaimerAccepted}
        saveLocalForageVerificationSettings={asyncSaveSettings}

        localForageVerificationKey={LOCALFORAGE_KEYS.VERIFICATION_SETTINGS}
        localForageCookiesKey={LOCALFORAGE_KEYS.COOKIE_SETTINGS}
      />
    )
  } */

  if (error) return <h1>An error occurred: {error}</h1>
  
  if ((ACTIVE_PROVIDER && activeProviderSet) && !initialising) return children
  
  return walletSelector()
}

const mapProps = ({
  // state properties
  state: {
    PROVIDER: { ACTIVE_PROVIDER },
    TOKEN_MGN: {
      ADDRESS,
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
    "[MGN] Address": ADDRESS,
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
