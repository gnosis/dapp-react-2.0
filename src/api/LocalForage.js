import localForage from 'localforage'

import { web3CompatibleNetwork } from './utils'
import { LOCALFORAGE_KEYS } from '../globals'

export const loadLocalForage = async () => {
    const [network, verificationSettings/* , cookieSettings */] = await Promise.all([
        web3CompatibleNetwork(),
        localForage.getItem(LOCALFORAGE_KEYS.VERIFICATION_SETTINGS),
        localForage.getItem(LOCALFORAGE_KEYS.COOKIE_SETTINGS),
    ])

    if (verificationSettings) {
        // check disclaimer settings for networks accepted
        const { networks_accepted: networksAccepted } = verificationSettings
        // if user currently using MAIN
        // check if networksAccepted includes MAIN or not
        if (network && (!networksAccepted || !networksAccepted[network])) {
            // set disclaimer_accepted to false to reprompt verification
            // verificationSettings.disclaimer_accepted = false
            return localForage.setItem(LOCALFORAGE_KEYS.VERIFICATION_SETTINGS, {
                disclaimer_accepted: false,
                networks_accepted: {
                    ...verificationSettings.networks_accepted,
                },
            })
        }
    }
}

