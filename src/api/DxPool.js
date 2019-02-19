import { getAppContracts } from './Contracts'
import { GAS_LIMIT, GAS_PRICE } from '../globals'

let dxPoolAPI

export const getDxPoolAPI = async () => {
  if (dxPoolAPI) return dxPoolAPI

  dxPoolAPI = await init()
  return dxPoolAPI
}

async function init() {
  const { coord, dxMP, mgn } = await getAppContracts()

  const [dxMP1Address, dxMP2Address] = await Promise.all([
    coord.dxMgnPool1.call(),
    coord.dxMgnPool2.call(),
  ])
  
  const [dxMP1, dxMP2] = await Promise.all([
    dxMP.at(dxMP1Address),
    dxMP.at(dxMP2Address),
  ])

  const [dxMP1DepositTokenAddress, dxMP1SecondaryTokenAddress] = await Promise.all([
    dxMP1.depositToken.call(),
    dxMP1.secondaryToken.call(),
  ])

  /**
   * getDxPool
   * @param {string} address 
   * @returns {contract} - dxMgnPool <Contract>
   */
  const getDxPool = async (address) => {
    try {
      return dxMP.at(address)
    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   * getPoolTokensAddresses
   * @param { string } address 
   * @returns { Promise<string[]> } - [ dtAddress, stAddress ]
   */
  const getPoolTokensAddresses = async () => Promise.all([
    dxMP1.depositToken.call(), 
    dxMP1.secondaryToken.call(),
  ])

  /**
   * getPoolAddresses
   * @returns { string[] } - returns array of [dxMgnPool1 address, dxMgnPool2 address]
   */
  const getPoolAddresses = async () => Promise.all([coord.dxMgnPool1.call(), coord.dxMgnPool2.call()])

  /**
   * getMGNAddress
   * @param { string } address
   * @returns { string } mgnTokenAddress
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
   * @returns { BN } mgnTokenBalance <BN>
   */
  const getMGNBalance = async (address, userAddress) => (await getTokenMGN(address)).lockedTokenBalances.call(userAddress)
  

  /**
   * depositIntoPool1
   * @param { string || BN } amount - string value or BN instance
   * @param { string } userAccount
   */
  const depositIntoPool1 = async (
    amount,
    userAccount,
  ) => dxMP1.deposit(amount, { from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
  /**
   * depositIntoPool2
   * @param { string || BN } amount - string value or BN instance
   * @param { string } userAccount
   */
  const depositIntoPool2 = async (
    amount,
    userAccount,
  ) => dxMP2.deposit(amount, { from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })

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
    dxMP1Address,
    dxMP2Address,
    dxMP1,
    dxMP2,
    dxMP1DepositTokenAddress,
    dxMP1SecondaryTokenAddress,
    getDxPool,
    getPoolAddresses,
    getTokenMGN,
    getMGNAddress,
    getMGNBalance,
    getPoolTokensAddresses,
    depositIntoPool1,
    depositIntoPool2,
    // event,
    // allEvents,
  }
}
