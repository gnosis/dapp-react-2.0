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
   * getMGNLockedBalance
   * @param { string } address
   * @param { string } userAddress
   * @returns { BN } mgnLockedTokenBalance as <BN>
   */
  const getMGNLockedBalance = async (address, userAddress) => (await getTokenMGN(address)).lockedTokenBalances.call(userAddress)

  /**
   * getMGNUnlockedBalance
   * @param { string } address
   * @param { string } userAddress
   * @returns { BN } getMGNUnlockedBalance as <BN>
   */
  const getMGNUnlockedBalance = async (address, userAddress) => (await (await getTokenMGN(address)).unlockedTokens.call(userAddress)).amountUnlocked

  /**
   * getMGNBalance
   * @param { string } address
   * @param { string } userAddress
   * @returns { BN } getMGNBalance as <BN>
   */
  const getMGNBalance = async (address, userAddress) => (await getTokenMGN(address)).balanceOf.call(userAddress)

  /**
   * lockMGN
   * @param { string | BN } amount - BN or string
   * @param { string } address - Address
   * @param { string } userAddress - Address 
   */
  const lockMGN = async (amount, address, userAddress) => (await getTokenMGN(address)).lockTokens(amount, { from: userAddress, gas: GAS_LIMIT, gasPrice: GAS_PRICE })

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

  /**
   * calculateClaimableMgnAndDeposits1
   * @returns {Promise<{ '0': string, '1': string }>} - Promise<{ '0': ClaimableMGN | string, '1': ClaimableDeposits | string }>
   */
  const calculateClaimableMgnAndDeposits1 = async userAccount => dxMP1.getAllClaimableMgnAndDeposits.call(userAccount)
  const calculateClaimableMgnAndDeposits2 = async userAccount => dxMP2.getAllClaimableMgnAndDeposits.call(userAccount)

  /**
   * calculateClaimableMgnAndDeposits1
   * @returns { Promise<"BN"> } - Promise<BN>
   */
  const getCurrentPoolingEndTime1 = async () => dxMP1.poolingPeriodEndTime.call()
  /**
   * calculateClaimableMgnAndDeposits2
   * @returns { Promise<"BN"> } - Promise<BN>
   */
  const getCurrentPoolingEndTime2 = async () => dxMP2.poolingPeriodEndTime.call()

  /**
   * Get back user's participation status
   * @param {string} userAccount 
   */
  const getParticipationStatus1 = async userAccount => dxMP1.hasParticpationWithdrawn(userAccount)
  const getParticipationStatus2 = async userAccount => dxMP2.hasParticpationWithdrawn(userAccount)

  /**
   * withdrawDepositPool1
   * @description - Withdraws all of users Deposit from Pool 1
   * @param { string } userAccount 
   */
  const withdrawDepositPool1 = async userAccount => dxMP1.withdrawDeposit({ from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
  withdrawDepositPool1.call = async userAccount => dxMP1.withdrawDeposit.call({ from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })

  /**
   * withdrawDepositPool2
   * @description - Withdraws all of users Deposit from Pool 2
   * @param { string } userAccount 
   */
  const withdrawDepositPool2 = async userAccount => dxMP2.withdrawDeposit({ from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
  withdrawDepositPool2.call = async userAccount => dxMP2.withdrawDeposit.call({ from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })

  /**
   * withdrawMagnoliaPool1
   * @description - Withdraws all of users MGN from Pool 1
   * @param { string } userAccount 
   */
  const withdrawMagnoliaPool1 = async userAccount => dxMP1.withdrawMagnolia({ from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
  withdrawMagnoliaPool1.call = async userAccount => dxMP1.withdrawMagnolia.call({ from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })

  /**
   * withdrawMagnoliaPool2
   * @description - Withdraws all of users MGN from Pool 2
   * @param { string } userAccount 
   */
  const withdrawMagnoliaPool2 = async userAccount => dxMP2.withdrawMagnolia({ from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
  withdrawMagnoliaPool2.call = async userAccount => dxMP2.withdrawMagnolia.call({ from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
  
  /**
   * withdrawDepositAndMagnoliaPool1
   * @description - Withdraws all of users MGN from Pool 1
   * @param { string } userAccount 
   */
  const withdrawDepositAndMagnoliaPool1 = async userAccount => dxMP1.withdrawDepositandMagnolia({ from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
  withdrawDepositAndMagnoliaPool1.call = async userAccount => dxMP2.withdrawDepositandMagnolia.call({ from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
  
  /**
   * withdrawDepositAndMagnoliaPool2
   * @description - Withdraws all of users MGN from Pool 2
   * @param { string } userAccount 
   */
  const withdrawDepositAndMagnoliaPool2 = async userAccount => dxMP2.withdrawDepositandMagnolia({ from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
  withdrawDepositAndMagnoliaPool2.call = async userAccount => dxMP2.withdrawDepositandMagnolia.call({ from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })

  /**
   * withdrawMGNandDepositsFromPools
   */
  const withdrawMGNandDepositsFromPools = async userAccount => coord.withdrawMGNandDepositsFromBothPools({ from: userAccount, gas: GAS_LIMIT, gasPrice: GAS_PRICE })

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
    getMGNLockedBalance,
    getMGNUnlockedBalance,
    getMGNBalance,
    getPoolTokensAddresses,
    lockMGN,
    depositIntoPool1,
    depositIntoPool2,
    getCurrentPoolingEndTime1,
    getCurrentPoolingEndTime2,
    calculateClaimableMgnAndDeposits1,
    calculateClaimableMgnAndDeposits2,
    getParticipationStatus1,
    getParticipationStatus2,
    withdrawMGNandDepositsFromPools,
    withdrawDepositPool1,
    withdrawDepositPool2,
    withdrawMagnoliaPool1,
    withdrawMagnoliaPool2,
    withdrawDepositAndMagnoliaPool1,
    withdrawDepositAndMagnoliaPool2,
    // event,
    // allEvents,
  }
}
