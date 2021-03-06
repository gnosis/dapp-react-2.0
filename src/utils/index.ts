import { isBN, toBN, toWei, fromWei } from 'web3-utils'
import { DATA_LOAD_STRING, FIXED_DECIMAL_AMOUNT, WEBSOCKET_URLS } from 'globals'

// eslint-disable-next-line import/prefer-default-
const windowLoaded = new Promise((resolve) => {
  if (typeof window === 'undefined') {
    resolve()
    return
  }

  if (typeof window.addEventListener !== 'function') {
    throw new Error('Expected to use event listener')
  }

  window.addEventListener('load', function loadHandler(event) {
    window.removeEventListener('load', loadHandler, false)

    return resolve(event)
  })
})

export const web3CompatibleNetwork = async () => {
  await windowLoaded
  // blocks access via load
  if (typeof window === 'undefined' || !window.web3) return (console.error('No Provider detected. Returning UNKNOWN network.'), 'UNKNOWN')

  let { web3 } = window
  let netID: string

  // irregular APIs - Opera, new MM, some other providers
  if (web3.currentProvider && !web3.version) {
    const Web3 = require('web3')
    console.warn('Non-Metamask or Gnosis Safe Provider injected web3 API detected')

    window.web3 = web3 = new Web3(web3.currentProvider)
  }

  // 1.X.X API
  if (typeof web3.version === 'string') {
    netID = await new Promise((accept, reject) => {
      web3.eth.net.getId((err: Error, res: any) => {
        if (err) {
          reject(new Error(`UNKNOWN ${err}`))
        } else {
          accept(res)
        }
      })
    })
  } else {
    // 0.XX.xx API
    // without windowLoaded web3 can be injected but network id not yet set
    netID = await new Promise((a, r) => {
      web3.version.getNetwork((e: Error, res: any) => {
        if (e) return r(new Error(`UNKNOWN ${e}`))

        return a(res)
      })
    })
  }

  return netID
}

const zeroDecimalsRegEx = /\.?0+$/
const decimalChecker = (n: string) => {
  const indOfDecimal = n.indexOf('.')
  // no decimal point or there are fewer decimal digits than 17
  if (indOfDecimal === -1 || n.length - indOfDecimal < 17) return n

  const shortened = Number(n).toFixed(4)

  // 5.0700 => 5.07
  return shortened.replace(zeroDecimalsRegEx, '')
}

const timeValidator = (t: string | number, now: string | number) => t > now

// TODO: consider different formatting, not with .toLocaleString
const displayTime = (sec: number, locale = 'de-DE', timeZone = 'Europe/Berlin') => (sec === 0 ? null : new Date(sec * 1000).toLocaleString(locale, {
  hour: 'numeric',
  minute: 'numeric',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone,
}))

const netIdToName = (id: string | number) => {
  switch (id) {
    case 1:
      return 'Mainnet'

    case 2:
      return 'Morden'

    case 3:
      return 'Ropsten'

    case 4:
      return 'Rinkeby'

    case 42:
      return 'Kovan'

    case null:
    case undefined:
      return 'No network detected'

    default:
      return 'Local Network'
  }
}

const netIdToWebsocket = (id: number) => {
  switch (id) {
    case 1:
      return WEBSOCKET_URLS.MAIN

    case 2:
      return WEBSOCKET_URLS.MORDEN

    case 3:
      return WEBSOCKET_URLS.ROPSTEN

    case 4:
      return WEBSOCKET_URLS.RINKEBY

    case 42:
      return WEBSOCKET_URLS.KOVAN

    case null:
    case undefined:
      return 'No network detected'

    default:
      return WEBSOCKET_URLS.LOCAL
  }
}

// const cleanData = data => (data && isBN(data) ? fromWei(data) : data)
const cleanDataFromWei = (data: any) => (data && data !== DATA_LOAD_STRING) && Number(data.toString() / (10 ** 18)).toFixed(FIXED_DECIMAL_AMOUNT)
// const cleanDataFromWei = data => (data && data !== DATA_LOAD_STRING) && Number(fromWei(data.toString())).toFixed(FIXED_DECIMAL_AMOUNT)
// TODO: broken in 4.11.6 BN - precision is wrong
// const cleanDataNative = (data, dec) => (data && data !== DATA_LOAD_STRING) && Number(toBN(data).div(toBN(10).pow(toBN(dec)))).toFixed(FIXED_DECIMAL_AMOUNT)
const cleanDataNative = (data: any, dec: number) => (data && data !== DATA_LOAD_STRING) && Number(data.toString() / 10 ** dec).toFixed(FIXED_DECIMAL_AMOUNT)
const mapTS = (arr: any[], type: string) => (Array.isArray(arr) ? arr : [arr]).map(item => (type === 'fromWei' && isBN(item) ? fromWei(item) : item).toString())

/**
 * checkLoadingOrNonZero
 * @description Function that takes an arbitrary amount of args and returns whether the cummulative reduced sum is truthy
 * @param  {...any} args
 */
const checkLoadingOrNonZero = (...args: any[]) => {
  // if any arguments = 'LOADING...' returns false
  if (args.some(i => (i === DATA_LOAD_STRING || i === '...'))) return false
  return !!args.reduce((acc, i) => ((+acc) + (+i)))
}

const flattener = (obj: {}) => Object.assign(
  {},
  ...(function _flatten(o): any {
      return [].concat(...Object.keys(o)
          .map(k =>
              (typeof o[k] === 'object' ?
                  _flatten(o[k]) :
                  ({ [k]: o[k] }))))
  }(obj)),
)

const shallowDifferent = (obj1: {}, obj2: {}) => {
  if (Object.is(obj1, obj2)) return false

  if (!obj1 || !obj2) return true
  
  const flatObj1 = flattener(obj1)
  const flatObj2 = flattener(obj2)

  const keys1 = Object.keys(flatObj1)
  const keys2 = Object.keys(flatObj2)

  if (keys1.length !== keys2.length) return true
  
  return keys1.some(key => !Object.is(flatObj1[key], flatObj2[key]))
}

const splitAddress = (addr: string) => {
	const { length } = addr
	return `${addr.slice(0, 6)}...${addr.slice(length - 4)}`
}

const delay = async (time = 1000) => new Promise(acc => setTimeout(() => acc('Delay done'), time))

export {
  delay,
  toBN,
  isBN,
  toWei,
  fromWei,
  cleanDataNative,
  cleanDataFromWei,
  mapTS,
  displayTime,
  timeValidator,
  decimalChecker,
  netIdToName,
  netIdToWebsocket,
  windowLoaded,
  flattener,
  shallowDifferent,
  splitAddress,
  checkLoadingOrNonZero,
}

/**
   * displayTimeDiff(sec, now)
   * @param {number} endSec --> time (in seconds) when lock ENDS
   * @param {number} now    --> time NOW (in seconds)
   */
/*  const displayTimeDiff = (endSec, now) => {
  const diff = endSec - Math.floor(now)

  // if lockTime has passed display nothing
  if (diff < 0) return undefined

  let hours = diff % DAY
  const days = (diff - hours) / DAY

  let minutes = hours % HOUR
  hours = (hours - minutes) / HOUR

  const seconds = minutes % MINUTE
  minutes = (minutes - seconds) / MINUTE

  let res = '[ '
  if (days) res += `${days}D `
  if (hours) res += `${hours}H `
  if (minutes) res += `${minutes}M `
  if (seconds) res += `${seconds}S `

  return `${res}]`
} */
