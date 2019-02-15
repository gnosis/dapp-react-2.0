import { getAppContracts } from './Contracts'

let dxPoolAPI

export const getDxPoolAPI = async () => {
  if (dxPoolAPI) return dxPoolAPI

  dxPoolAPI = await init()
  return dxPoolAPI
}

async function init() {
  const { coord, dxMP, mgn } = await getAppContracts()

  /**
   * getDxPool
   * @param {string} address 
   * @returns {contract} - Returns dxMgnPool contract at passed in address, if it exists
   */
  const getDxPool = async (address) => {
    try {
      return dxMP.at(address)
    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   * getPoolAddresses
   * @returns { string[] } - returns array of [dxMgnPool1 address, dxMgnPool2 address]
   */
  const getPoolAddresses = async () => Promise.all([coord.dxMgnPool1.call(), coord.dxMgnPool2.call()])

  /**
   * getMGNAddress
   * @param { string } address
   * @returns { string } return address of MGN Token (as string)
   */
  const getMGNAddress = async address => (await getDxPool(address)).mgnToken.call()

  const getTokenMGN = async (address) => {
    try {
      return mgn.at(address)
    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   * getMGNAddress
   * @param { string } address
   * @returns { string } return address of MGN Token (as string)
   */
  const getMGNBalance = async (address, userAddress) => (await getTokenMGN(address)).lockedTokenBalances.call(userAddress)
  
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
    getTokenMGN,
    getMGNAddress,
    getMGNBalance,
    // event,
    // allEvents,
  }
}
