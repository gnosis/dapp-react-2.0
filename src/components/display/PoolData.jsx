import React from 'react'
import { connect } from '../StateProvider'

import AsyncActionsHOC from '../hoc/AsyncActionsHOC'
import DataDisplayVisualContainer from './DataDisplay'
import Countdown from './Countdown'
import { TextInput } from '../controls/ControlledInput'

import { withdrawMGNandDepositsFromAllPools } from '../../api'
import { POOL_STATES, DATA_LOAD_STRING } from '../../globals'

const DepositToken = AsyncActionsHOC(TextInput)
const WithdrawMGNandDepositsFromBothPools = AsyncActionsHOC()

const PoolData = ({
    BALANCE,
    DX_MGN_POOL,
    INPUT_AMOUNT,
    setDepositAmount,
    setInputAmount,
}) =>
    <>
        <h2>Mgn pool - {DX_MGN_POOL.POOL1.DEPOSIT_SYMBOL.toLowerCase()}/{DX_MGN_POOL.POOL1.SECONDARY_SYMBOL.toLowerCase()}</h2>
        <div className="poolContainer">
            <div className="poolInnerContainer">
                {/* POOL 1 */}
                <pre className="poolDataContainer data-pre-blue">
                    <h3>{DX_MGN_POOL.POOL1.DEPOSIT_TOKEN.toLowerCase()} [{DX_MGN_POOL.POOL1.DEPOSIT_SYMBOL.toLowerCase()}]</h3>
                    <p><span className="data-title">STATUS:</span> <strong>{DX_MGN_POOL.POOL1.CURRENT_STATE.toUpperCase()}</strong></p>
                    {DX_MGN_POOL.POOL1.POOLING_PERIOD_END !== DATA_LOAD_STRING && 
                        <p><span className="data-title">POOLING END TIME:</span> <span className="data-date">{new Date(DX_MGN_POOL.POOL1.POOLING_PERIOD_END * 1000).toUTCString()}</span></p>}
                    <hr />
                    <p><span className="data-title">TOTAL POOL SHARE:</span> {DX_MGN_POOL.POOL1.TOTAL_SHARE}</p>
                    <p><span className="data-title">YOUR CONTRIBUTION:</span> {DX_MGN_POOL.POOL1.YOUR_SHARE}</p>
                    <hr />
                    <p><span className="data-title">TOTAL CLAIMABLE MGN:</span> {DX_MGN_POOL.POOL1.TOTAL_CLAIMABLE_MGN}</p>
                    <p><span className="data-title">TOTAL CLAIMABLE DEPOSIT:</span> {DX_MGN_POOL.POOL1.TOTAL_CLAIMABLE_DEPOSIT}</p>
                    <hr />
                    <p><span className="data-title">[<strong>{DX_MGN_POOL.POOL1.DEPOSIT_SYMBOL}</strong>] WALLET BALANCE:</span> {DX_MGN_POOL.POOL1.DEPOSIT_SYMBOL === 'WETH' ? (+DX_MGN_POOL.POOL1.TOKEN_BALANCE) + (+BALANCE) : DX_MGN_POOL.POOL1.TOKEN_BALANCE}</p>
                    <hr />
                    {DX_MGN_POOL.POOL1.CURRENT_STATE === POOL_STATES.POOLING 
                        && <DepositToken
                            asyncAction={() => setDepositAmount(1)}
                            forceDisable={DX_MGN_POOL.POOL1.CURRENT_STATE !== POOL_STATES.POOLING}
                            inputChangeDispatch={setInputAmount}
                            globalInput={INPUT_AMOUNT}
                            info={
                                DX_MGN_POOL.POOL1.DEPOSIT_SYMBOL === 'WETH' ? 
                                '[WETH] You may need to sign up to 3 TXs [Wrap, Approve, Deposit]' : 
                                `[${DX_MGN_POOL.POOL1.DEPOSIT_SYMBOL}] You may need to sign up to 2 TXs [Approve, Deposit]`
                            }
                            title={`deposit [${DX_MGN_POOL.POOL1.DEPOSIT_TOKEN.toLowerCase()}]`}
                            {...DX_MGN_POOL}
                        />}
                    <Countdown POOLING_PERIOD_END={DX_MGN_POOL.POOL1.POOLING_PERIOD_END} />
                </pre>
                {/* POOL 2 */}
                <pre className="poolDataContainer data-pre-purple">
                    <h3>{DX_MGN_POOL.POOL1.SECONDARY_TOKEN.toLowerCase()} [{DX_MGN_POOL.POOL1.SECONDARY_SYMBOL.toLowerCase()}]</h3>
                    <p><span className="data-title">STATUS:</span> <strong>{DX_MGN_POOL.POOL2.CURRENT_STATE.toUpperCase()}</strong></p>
                    {DX_MGN_POOL.POOL2.POOLING_PERIOD_END !== DATA_LOAD_STRING && 
                        <p><span className="data-title">POOLING END TIME:</span> <span className="data-date">{new Date(DX_MGN_POOL.POOL2.POOLING_PERIOD_END * 1000).toUTCString()}</span></p>}
                    <hr />
                    <p><span className="data-title">TOTAL POOL SHARE:</span> {DX_MGN_POOL.POOL2.TOTAL_SHARE}</p>
                    <p><span className="data-title">YOUR CONTRIBUTION:</span> {DX_MGN_POOL.POOL2.YOUR_SHARE}</p>
                    <hr />
                    <p><span className="data-title">TOTAL CLAIMABLE MGN:</span> {DX_MGN_POOL.POOL2.TOTAL_CLAIMABLE_MGN}</p>
                    <p><span className="data-title">TOTAL CLAIMABLE DEPOSIT:</span> {DX_MGN_POOL.POOL2.TOTAL_CLAIMABLE_DEPOSIT}</p>
                    <hr />
                    <p><span className="data-title">[<strong>{DX_MGN_POOL.POOL1.SECONDARY_SYMBOL}</strong>] WALLET BALANCE:</span> {DX_MGN_POOL.POOL1.SECONDARY_SYMBOL === 'WETH' ? (+DX_MGN_POOL.POOL2.TOKEN_BALANCE) + (+BALANCE) : DX_MGN_POOL.POOL2.TOKEN_BALANCE}</p>

                    <hr />
                    {DX_MGN_POOL.POOL2.CURRENT_STATE === POOL_STATES.POOLING 
                        && <DepositToken
                            asyncAction={() => setDepositAmount(2)}
                            forceDisable={DX_MGN_POOL.POOL2.CURRENT_STATE !== POOL_STATES.POOLING}
                            inputChangeDispatch={setInputAmount}
                            globalInput={INPUT_AMOUNT}
                            info={
                                DX_MGN_POOL.POOL1.SECONDARY_SYMBOL === 'WETH' ? 
                                '[WETH] You may need to sign up to 3 TXs [Wrap, Approve, Deposit]' : 
                                `[${DX_MGN_POOL.POOL1.SECONDARY_SYMBOL}] You may need to sign up to 2 TXs [Approve, Deposit]`
                            }
                            title={`deposit [${DX_MGN_POOL.POOL1.SECONDARY_TOKEN.toLowerCase()}]`}
                            {...DX_MGN_POOL}
                        />}
                    <Countdown POOLING_PERIOD_END={DX_MGN_POOL.POOL2.POOLING_PERIOD_END} />
                </pre>
            </div>
            {DX_MGN_POOL.POOL1.CURRENT_STATE === POOL_STATES.MGN_UNLOCKED 
                && DX_MGN_POOL.POOL2.CURRENT_STATE === POOL_STATES.MGN_UNLOCKED 
                && 
                <DataDisplayVisualContainer
                    colour="greenGradient"
                    title={null}
                >
                    {() =>
                        <WithdrawMGNandDepositsFromBothPools 
                            asyncAction={withdrawMGNandDepositsFromAllPools}
                            title="Withdraw MGn + deposits [both pooLs]"
                            buttonText="Withdraw"
                            info="Withdraw any of your MGN + Deposits from both pools"
                        />
                    }
                </DataDisplayVisualContainer>
        }
        </div>
    </>

const mapProps = ({
    state: {
        DX_MGN_POOL,
        INPUT_AMOUNT,
        USER: {
            BALANCE,
        },
    },
    setDepositAmount,
    setInputAmount,
}) => ({
    BALANCE,
    DX_MGN_POOL,
    INPUT_AMOUNT,
    setDepositAmount,
    setInputAmount,
})

export default connect(mapProps)(PoolData)
