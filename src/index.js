/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
import React from 'react'
import ReactDOM from 'react-dom'
// import ReactDOMServer from 'react-dom/server'

import App from './App'

import { loadLocalForage } from './api/LocalForage'
import { isGeoBlocked, isNetBlocked } from './block'

import { APP_URLS } from './globals'

// Import CSS
import './styles/global.css'

const rootElement = document.getElementById('app')

// Main App render logic
const asyncRender = async () => {
    await loadLocalForage()

    return ReactDOM.hydrate(<App />, rootElement)
}

/*
 * App blocking prerequisites
 * Scenario 1: User is a developer running app locally:             BLOCK: nothing
 * Scenario 2: User is using the pool on prod:                      BLOCK: all networks + geoblock
*/
const conditionalRender = async () => {
    /* User's environment does not have access to window API (e.g user on mobile?) */
    if (typeof window === 'undefined') return false
    let blocked = true, disabledReason/* , ALLOWED_NETWORK */

    const { hostname } = window.location
    const { FE_CONDITIONAL_ENV } = process.env
    
    // TESTING
    // const [hostname] = APP_URLS.PRODUCTION.MAIN

    try {
        /* Scenario 1: User is a developer running app locally: BLOCK: nothing */
        if (
            FE_CONDITIONAL_ENV !== 'production' ||
            APP_URLS.LOCAL.includes(hostname) ||
            APP_URLS.DEV.includes(hostname) ||
            APP_URLS.PR_REVIEW_TEST(hostname) ||
            hostname.startsWith('10')
        ) return asyncRender()

        /* PRODUCTION builds should be geoBlocked */
        if (FE_CONDITIONAL_ENV === 'production') {
            /* Scenario 1a: User is a developer on any of the STAGING APP_URLS OR ipfs */
            if (APP_URLS.STAGING.includes(hostname) || hostname.includes('ipfs')) {
                blocked = await isGeoBlocked()
                blocked && (disabledReason = 'geoblock')

                !APP_URLS.STAGING.includes(hostname)/*  && ReactGA.initialize(GA_CODES.IPFS) */
            } else if (APP_URLS.PR_REVIEW_TEST(hostname)) {
                /* Scenario 1b: User is a developer on a PR-review URL */
                blocked = false
            } else if (APP_URLS.PRODUCTION.RINKEBY.includes(hostname)) {
                // Main release Scenarios:
                /* Scenario 2: User is using the dx on dutchx-rinkeby (RINKEBY): BLOCK: networks */
                // ALLOWED_NETWORK = 'Rinkeby Test Network'
                blocked = await isNetBlocked(['4'])
                if (blocked) disabledReason = 'networkblock'
                // init GA
                // ReactGA.initialize(GA_CODES.RINKEBY)
            } else if (APP_URLS.PRODUCTION.MAIN.includes(hostname)) {
                /* Scenario 3: User is using the dx on dutchx.app (MAIN): BLOCK: all networks + geoblock */
                // ALLOWED_NETWORK = 'Ethereum Mainnet'
                // const netBlockedPromise = isNetBlocked(['1'])
                // geoblock gets precedence, checked last
                blocked = await isGeoBlocked()
				console.debug("TCL: conditionalRender -> blocked", blocked)
                if (blocked) {
                    disabledReason = 'geoblock'
                } /* else {
                    blocked = await netBlockedPromise
                    if (blocked) disabledReason = 'networkblock'
                } */
                // init GA
                // ReactGA.initialize(GA_CODES.MAIN)
            } else {
                // fallback
                console.warn('No hostname match - fallingback to geographical block')
                disabledReason = 'geoblock'
            }
        }
        // Blocked for one reason or another
        if (blocked) {
            window.history.replaceState(null, '', '/')
            // eslint-disable-next-line no-return-assign
            // return rootElement.innerHTML = ReactDOM.renderToStaticMarkup(<App disabledReason={disabledReason} /* networkAllowed={ALLOWED_NETWORK} */ />)
            return ReactDOM.hydrate(<App disabledReason={disabledReason} />, rootElement)
        }

        // all good? render app
        return asyncRender()
    } catch (error) {
        throw new Error(error)
    }
}

conditionalRender()
