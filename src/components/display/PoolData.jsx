import React from 'react'
import { connect } from '../StateProvider'

import AsyncActionsHOC from '../hoc/AsyncActionsHOC'
import DataDisplayVisualContainer from './DataDisplay'
import { TextInput } from '../controls/ControlledInput'

import { withdrawMGNandDepositsFromAllPools } from '../../api'
import { POOL_STATES } from '../../globals'

const DepositToken = AsyncActionsHOC(TextInput)
const WithdrawMGNandDepositsFromBothPools = AsyncActionsHOC()

const PoolData = ({
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
                    <h4>- {DX_MGN_POOL.POOL1.DEPOSIT_TOKEN} [{DX_MGN_POOL.POOL1.DEPOSIT_SYMBOL.toLowerCase()}] -</h4>
                    <p>Status: <strong>{DX_MGN_POOL.POOL1.CURRENT_STATE.toUpperCase()}</strong></p>
                    <hr />
                    <p>TOTAL POOL SHARE: {DX_MGN_POOL.POOL1.TOTAL_SHARE}</p>
                    <p>YOUR CONTRIBUTION: {DX_MGN_POOL.POOL1.YOUR_SHARE}</p>
                    <hr />
                    <p>TOTAL CLAIMABLE MGN: {DX_MGN_POOL.POOL1.TOTAL_CLAIMABLE_MGN}</p>
                    <p>TOTAL CLAIMABLE DEPOSIT: {DX_MGN_POOL.POOL1.TOTAL_CLAIMABLE_DEPOSIT}</p>
                    <hr />
                    <p>[<strong>{DX_MGN_POOL.POOL1.DEPOSIT_SYMBOL}</strong>] WALLET BALANCE: {DX_MGN_POOL.POOL1.TOKEN_BALANCE}</p>

                    <hr />
                    <DepositToken
                        asyncAction={() => setDepositAmount(1)}
                        forceDisable={DX_MGN_POOL.POOL1.CURRENT_STATE !== POOL_STATES.POOLING}
                        inputChangeDispatch={setInputAmount}
                        globalInput={INPUT_AMOUNT}
                        title={`deposit [${DX_MGN_POOL.POOL1.DEPOSIT_TOKEN}]`}
                        {...DX_MGN_POOL}
                    />
                </pre>
                {/* POOL 2 */}
                <pre className="poolDataContainer data-pre-purple">
                    <h4>- {DX_MGN_POOL.POOL1.SECONDARY_TOKEN} [{DX_MGN_POOL.POOL1.SECONDARY_SYMBOL.toLowerCase()}] -</h4>
                    <p>Status: <strong>{DX_MGN_POOL.POOL2.CURRENT_STATE.toUpperCase()}</strong></p>
                    <hr />
                    <p>TOTAL POOL SHARE: {DX_MGN_POOL.POOL2.TOTAL_SHARE}</p>
                    <p>YOUR CONTRIBUTION: {DX_MGN_POOL.POOL2.YOUR_SHARE}</p>
                    <hr />
                    <p>TOTAL CLAIMABLE MGN: {DX_MGN_POOL.POOL2.TOTAL_CLAIMABLE_MGN}</p>
                    <p>TOTAL CLAIMABLE DEPOSIT: {DX_MGN_POOL.POOL2.TOTAL_CLAIMABLE_DEPOSIT}</p>
                    <hr />
                    <p>[<strong>{DX_MGN_POOL.POOL1.SECONDARY_SYMBOL}</strong>] WALLET BALANCE: {DX_MGN_POOL.POOL2.TOKEN_BALANCE}</p>

                    <hr />
                    <DepositToken
                        asyncAction={() => setDepositAmount(2)}
                        forceDisable={DX_MGN_POOL.POOL2.CURRENT_STATE !== POOL_STATES.POOLING}
                        inputChangeDispatch={setInputAmount}
                        globalInput={INPUT_AMOUNT}
                        title={`deposit [${DX_MGN_POOL.POOL1.SECONDARY_TOKEN.toLowerCase()}]`}
                        {...DX_MGN_POOL}
                    />
                </pre>
            </div>
            {
                DX_MGN_POOL.POOL1.CURRENT_STATE === POOL_STATES.MGN_UNLOCKED 
                && DX_MGN_POOL.POOL2.CURRENT_STATE === POOL_STATES.MGN_UNLOCKED 
                && 
                <DataDisplayVisualContainer
                    colour="green"
                    title={null}
                >
                    {() =>
                        <WithdrawMGNandDepositsFromBothPools 
                            asyncAction={withdrawMGNandDepositsFromAllPools}
                            title="Withdraw All MGn + deposits from both pooLs"
                            buttonText="Withdraw"
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
    },
    setDepositAmount,
    setInputAmount,
}) => ({
    DX_MGN_POOL,
    INPUT_AMOUNT,
    setDepositAmount,
    setInputAmount,
})

export default connect(mapProps)(PoolData)
