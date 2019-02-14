import { getAppContracts } from './Contracts'

let dxPoolAPI

export const getDxPoolAPI = async () => {
  if (dxPoolAPI) return dxPoolAPI

  dxPoolAPI = await init()
  return dxPoolAPI
}

async function init() {
  const { coord, dxMP } = await getAppContracts()

  const getDxPool = async address => dxMP.at(address)

  const getPoolAddresses = async () => Promise.all([coord.dxMgnPool1.call(), coord.dxMgnPool2.call()])

  const getMGNAddress = async address => (await getDxPool(address)).frtToken.call()

  /* 
  const getLatestAuctionIndex = ({ sell: { address: t1 }, buy: { address: t2 } }) =>
    dx.getAuctionIndex.call(t1, t2)
  */
  /* 
  const event = (
    eventName,
    valueFilter,
    filter,
    cb,
  ) => {
    const coordEvent = coord[eventName]

    if (typeof dxEvent !== 'function') throw new Error(`No event with ${eventName} name found on DutchExchange contract`)

    return coordEvent(valueFilter, filter, cb)
  }

  const allEvents = coord.allEvents.bind(coord)
 */
  return {
    get coordAddress() {
      return coord.address
    },
    getDxPool,
    getPoolAddresses,
    getMGNAddress,
    // event,
    // allEvents,
  }
}
