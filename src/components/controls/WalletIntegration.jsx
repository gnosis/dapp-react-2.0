import React, { useEffect, useState } from 'react'

import Providers from '../../api/providers'

import { connect } from '../StateProvider'
import { getAPI } from '../../api'
import { getAppContracts } from '../../api/Contracts'
import { cleanData } from '../../api/utils'

import ConfigDisplayerHOC from '../hoc/ConfigDisplayHOC'
import ModalHOC from '../hoc/ModalHOC'

function WalletIntegration({ 
  dispatchers: { 
    grabUserState,
    setDxMgnPoolState,
    registerProviders, 
    saveContract, 
    setActiveProvider,
    showModal,
    // appLoading, 
    // saveTotalPoolShares,
    // saveMGNAddressAndBalance,
    // setUserParticipation,
  }, 
  state: { activeProvider }, 
  children,
}) {
  const [error, setError] = useState(undefined)
  const [initialising, setInitialising] = useState(false)
  const [activeProviderSet, setActiveProviderState] = useState(undefined)

  // Fire once on load
  useEffect(() => {
    // returns [ Provider{}, ... ]
    const providersArray = Object.values(Providers)
    // register each providerObject into state
    providersArray.forEach(() => { registerProviders(providersArray) })
  }, [])

  const saveContractToState = contracts => Object.keys(contracts).forEach(name => saveContract({ name, contract: contracts[name] }))

  /**
   * onChange Event Handler
   * @param { providerInfo } @type { ProviderObject }
   * @memberof WalletIntegration
   */
  const onChange = async (providerInfo) => {
    try {
      // Set Modal
      showModal('LOADING USER DATA . . .')
      // appLoading(true)

      // State setters
      setError(undefined)
      setInitialising(true)

      const chosenProvider = Providers[providerInfo]
      // initialize providers and return specific Web3 instances
      await chosenProvider.initialize()

      // Save activeProvider to State
      setActiveProvider(providerInfo)
      
      // Save web3 provider + notify state locally
      setActiveProviderState(true)

      // interface with contracts & connect entire DX API
      // grabbing eth here to show contrived example of state
      const contracts = await getAppContracts()

      // registers/saves contracts to StateProvider
      saveContractToState(contracts)

      // INIT main API
      await getAPI()

      // First time grab userState
      await grabUserState()

      // Sets all essential DxMgnPool State
      await setDxMgnPoolState()

      // Hide Modal, all good!
      showModal(undefined)
      // appLoading(false)

      return setInitialising(false)
    } catch (err) {
      console.error(err)
      showModal(undefined)
      // appLoading(false)
      
      setInitialising(false)
      return setError(error)
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
  
  if ((activeProvider && activeProviderSet) && !initialising) return children
  
  return walletSelector()
}

const mapProps = ({
  // state properties
  state: {
    PROVIDER: { activeProvider },
    DX_MGN_POOL: {
      pool1: {
        totalShare,
        totalUserParticipation: totalUserParticipation1,
      },
      pool2: {
        totalShare: totalShare2,
        totalUserParticipation: totalUserParticipation2,
      },
    },
    TOKEN_MGN: {
      address,
      balance,
    },
    loading,
    SHOW_MODAL,
    INPUT_AMOUNT,
  },
  // dispatchers
  appLoading,
  grabUserState,
  setDxMgnPoolState,
  registerProviders,
  setActiveProvider,
  getDXTokenBalance,
  saveContract,
  showModal,
  // saveTotalPoolShares,
  // saveMGNAddressAndBalance,
  // setUserParticipation,
}) => ({
  // state properties
  state: {
    "[Pool #1] Total Share": cleanData(totalShare),
    "[Pool #1] User's Share": cleanData(totalUserParticipation1),
    "[Pool #2] Total Share": cleanData(totalShare2),
    "[Pool #2] User's Share": cleanData(totalUserParticipation2),
    "[MGN] Address": address,
    "[MGN] Balance": cleanData(balance),
    activeProvider,
    loading,
    SHOW_MODAL,
    INPUT_AMOUNT,
  },
  // dispatchers
  dispatchers: {
    appLoading,
    grabUserState,
    setDxMgnPoolState,
    registerProviders,
    setActiveProvider,
    getDXTokenBalance,
    saveContract,
    showModal,
    // saveTotalPoolShares,
    // saveMGNAddressAndBalance,
    // setUserParticipation,
  },
})

export default connect(mapProps)(process.env.SHOW_APP_DATA === 'true'
  ? ModalHOC(ConfigDisplayerHOC(WalletIntegration))
  : ModalHOC(WalletIntegration))
