import { getAppContracts } from './Contracts'

/**
 * Tokens OWL and Tokens GNO API
 */


// tokensAPI singleton
let tokensAPI

export const getTokensAPI = async () => {
  if (tokensAPI) return tokensAPI

  tokensAPI = await init()
  return tokensAPI
}

async function init() {
  const contractMap = await getAppContracts()
  const { hft, weth } = contractMap
  /**
   * getToken
   * @param {string} tokenAddress '0xc89asd ... '
   * @returns {contract} TokenContract interfaced via HFT - if it exists
   */
  const getToken = async (tokenAddress) => {
    try {
      return hft.at(tokenAddress)
    } catch (error) {
      throw new Error(error)
    }
  }

  const getWETHToken = async (wethAddress) => {
    try {
      return weth.at(wethAddress)
    } catch (error) {
      throw new Error(error)
    }
  }

  // return tokenAPI methods here...
  /**
   * allowance
   * @param {string} name TOKEN name as string
   * @param {string} owner OWNER address
   * @param {string} spender SPENDER address
   * @returns {Promise<BigNumber>} allowance
   */
  const allowance = async (tokenAddress, owner, spender) => (await getToken(tokenAddress)).allowance.call(owner, spender)

  /**
   * approve
   * @param {string} tokenAddress
   * @param {string} spender
   * @param {number} value
   * @param {{ from: string }} tx
   * @returns {object} txReceipt
   */
  const approve = async (tokenAddress, spender, value, tx) => (await getToken(tokenAddress)).approve(spender, value, tx)

  /**
   * getTokenSymbol
   * @param {string} tokenAddress
   * @returns {Promise<BigNumber>} symbol
   */
  const getTokenSymbol = async tokenAddress => (await getToken(tokenAddress)).symbol.call()

  /**
   * getTokenName
   * @param {string} tokenAddress
   * @returns {Promise<BigNumber>} name
   */
  const getTokenName = async tokenAddress => (await getToken(tokenAddress)).name.call()

  /**
   * getTokenBalance
   * @param {string} tokenAddress
   * @param {string} account
   * @returns {Promise<BigNumber>} balance
   */
  const getTokenBalance = async (tokenAddress, account) => (await getToken(tokenAddress)).balanceOf.call(account)

  /**
   * getTotalSupply
   * @param {string} tokenAddress TOKEN tokenAddress as string
   * @returns {Promise<BigNumber>} total supply
   */
  const getTotalSupply = async tokenAddress => (await getToken(tokenAddress)).totalSupply.call()

  /**
   * transfer
   * @param {string} tokenAddress tokenAddress of token as string
   * @param {string} to address to send to as string
   * @param {number} value value to send as number
   * @param {{ from: string }} tx transaction object
   * @returns {object} txReceipt
   */
  const transfer = async (tokenAddress, to, value, tx) => (await getToken(tokenAddress)).transfer(to, value, tx)

  /**
   * transferFrom
   * @param {string} tokenAddress tokenAddress of token as string
   * @param {string} from address to send FROM as string
   * @param {string} to address to send TO as string
   * @param {number} value value to send as number
   * @param {{ from: string }} tx transaction object
   * @returns {object} txReceipt
   */
  const transferFrom = async (tokenAddress, from, to, value, tx) => (await getToken(tokenAddress)).transferFrom(from, to, value, tx)

  /**
   * depositEth
   * @param {string} tokenAddress tokenAddress of token as string
   * @param {string} from address to send FROM as string
   * @param {number} value value to send as number
   * @param {{ from: string }} tx transaction object
   * @returns {object} txReceipt
   */
  const depositETH = async (tokenAddress, tx) => (await getWETHToken(tokenAddress)).deposit(tx)

  return {
    allowance,
    approve,
    getToken,
    getTokenBalance,
    getTokenSymbol,
    getTokenName,
    getTotalSupply,
    tokens: contractMap,
    transfer,
    transferFrom,
    depositETH,
  }
}
