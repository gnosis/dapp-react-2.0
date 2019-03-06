import { isBN, toBN, toWei, fromWei } from 'web3-utils'
import { DATA_LOAD_STRING, FIXED_DECIMAL_AMOUNT, WEBSOCKET_URLS, POOL_STATES } from '../../globals'

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

const zeroDecimalsRegEx = /\.?0+$/
const decimalChecker = (n) => {
  const indOfDecimal = n.indexOf('.')
  // no decimal point or there are fewer decimal digits than 17
  if (indOfDecimal === -1 || n.length - indOfDecimal < 17) return n

  const shortened = Number(n).toFixed(4)

  // 5.0700 => 5.07
  return shortened.replace(zeroDecimalsRegEx, '')
}

const timeValidator = (t, now) => t > now

// TODO: consider different formatting, not with .toLocaleString
const displayTime = (sec, locale = 'de-DE', timeZone = 'Europe/Berlin') => (sec === 0 ? null : new Date(sec * 1000).toLocaleString(locale, {
  hour: 'numeric',
  minute: 'numeric',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone,
}))

const netIdToName = (id) => {
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

const netIdToWebsocket = (id) => {
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
const cleanDataFromWei = data => (data && data !== DATA_LOAD_STRING) && Number(data.toString() / (10 ** 18)).toFixed(FIXED_DECIMAL_AMOUNT)
// const cleanDataFromWei = data => (data && data !== DATA_LOAD_STRING) && Number(fromWei(data.toString())).toFixed(FIXED_DECIMAL_AMOUNT)
const cleanDataNative = (data, dec) => (data && data !== DATA_LOAD_STRING) && Number(toBN(data).div(toBN(10).pow(toBN(dec)))).toFixed(FIXED_DECIMAL_AMOUNT)
const mapTS = (arr, type) => (Array.isArray(arr) ? arr : [arr]).map(item => (type === 'fromWei' && isBN(item) ? fromWei(item) : item).toString())

/**
 * checkLoadingOrNonZero
 * @description Function that takes an arbitrary amount of args and returns whether the cummulative reduced sum is truthy
 * @param  {...any} args
 */
const checkLoadingOrNonZero = (...args) => {
  // if any arguments = 'LOADING...' returns false
  if (args.some(i => (i === DATA_LOAD_STRING || i === '...'))) return false
  return !!args.reduce((acc, i) => ((+acc) + (+i)))
}

const flattener = obj => Object.assign(
  {},
  ...(function _flatten(o) {
      return [].concat(...Object.keys(o)
          .map(k =>
              (typeof o[k] === 'object' ?
                  _flatten(o[k]) :
                  ({ [k]: o[k] }))))
  }(obj)),
)

const shallowDifferent = (obj1, obj2) => {
  if (Object.is(obj1, obj2)) return false

  if (!obj1 || !obj2) return true
  
  const flatObj1 = flattener(obj1)
  const flatObj2 = flattener(obj2)

  const keys1 = Object.keys(flatObj1)
  const keys2 = Object.keys(flatObj2)

  if (keys1.length !== keys2.length) return true
  
  return keys1.some(key => !Object.is(flatObj1[key], flatObj2[key]))
}

const splitAddress = (addr) => {
	const { length } = addr
	return `${addr.slice(0, 6)}...${addr.slice(length - 4)}`
}

const poolStateIdToName = (id) => {
  switch (id) {
    case '0':
    case 0:
      return POOL_STATES.POOLING
    case '1':
    case 1:
      return POOL_STATES.POOLING_ENDED
    case '2':
    case 2:
      return POOL_STATES.DEPOSIT_WITHDRAW_FROM_DX
    case '3':
    case 3:
      return POOL_STATES.MGN_UNLOCKED
    default: 
      return 'Unknown Contract State' 
  }
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
  poolStateIdToName,
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
