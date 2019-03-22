/* eslint no-console:0 */
module.exports = (web3) => {
  const increaseTimeBy = async (seconds, dontMine) => {
    if (seconds < 0) {
      throw new Error('Can\'t decrease time in testrpc')
    }

    if (seconds === 0) return

    await increaseTime(seconds)

    if (!dontMine) {
      await mineBlock()
    }
  }

  const setTime = (seconds, dontMine) => {
    const increaseBy = seconds - getTime()

    increaseTimeBy(increaseBy, dontMine)
  }

  function mineBlock() {
    return web3Send({
      method: 'evm_mine',
    })
  }

  function increaseTime(num) {
    if (num <= 0) {
      console.log('No need to increase time')
      return
    }
    return web3Send({
      method: 'evm_increaseTime', params: [num],
    })
  }

  async function makeSnapshot() {
    return (await web3Send({
      method: 'evm_snapshot',
    })).result
  }

  function revertSnapshot(id) {
    return web3Send({
      method: 'evm_revert',
      params: [id],
    })
  }

  function web3Send(options) {
    return new Promise((resolve, reject) => web3.currentProvider.send(options, (err, res) => (err ? reject(err) : resolve(res))))
  }

  async function getTime(block = 'latest') {
    return (await web3.eth.getBlock(block)).timestamp
  }

  return {
    getTime,
    increaseTimeBy,
    setTime,
    makeSnapshot,
    revertSnapshot,
    mineBlock,
  }
}

