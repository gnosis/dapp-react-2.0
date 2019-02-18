import React from 'react'
import { connect } from '../StateProvider'

import AsyncActionsHOC from '../hoc/AsyncActionsHOC'
import { TextInput } from '../controls/ControlledInput'

import { cleanData } from '../../api/utils'

const DepositToken = AsyncActionsHOC(TextInput)
const WithdrawAndClaimMGN = AsyncActionsHOC()

const PoolData = ({
    DX_MGN_POOL,
    setDxMgnPoolState,
    setDepositAmount,
    setInputAmount,
}) => {
    const { pool1, pool2 } = DX_MGN_POOL
    /* const props = {
        ...DX_MGN_POOL,
        asyncAction: asyncActionMock,
    } */
    return (
        <>
            <h2>Dx-Mgn-Pool Data</h2>
            <div className="poolContainer">
                <h3>Dx-Mgn-Pool</h3>
                <div className="poolInnerContainer">
                    {/* POOL 1 */}
                    <pre className="poolDataContainer data-pre-blue">
                        <h2>DxMGNPool #1 - {DX_MGN_POOL.pool1.dtName} [{DX_MGN_POOL.pool1.dtSymbol}]</h2>
                        <ul>
                            {Object.keys(pool1).map((key, idx) => <li key={idx * Math.random()}>{`${key}: ${cleanData(pool1[key])}`}</li>)}
                        </ul>
                        <DepositToken 
                            asyncAction={() => setDepositAmount(1)} 
                            inputChangeHandler={setInputAmount}
                            title={`Deposit [${DX_MGN_POOL.pool1.dtName}]`}
                            {...DX_MGN_POOL} 
                        />
                        <WithdrawAndClaimMGN 
                            asyncAction={setDxMgnPoolState}
                            buttonText="Claim + Withdraw"
                            title="Claim + Withdraw MGN Tokens"
                        />
                    </pre>
                    {/* POOL 2 */}
                    <pre className="poolDataContainer data-pre-green">
                        <h2>DxMGNPool #2 {DX_MGN_POOL.pool1.stName} [{DX_MGN_POOL.pool1.stSymbol}]</h2>
                        <ul>
                            {Object.keys(pool2).map((key, idx) => <li key={idx * Math.random()}>{`${key}: ${cleanData(pool2[key])}`}</li>)}
                        </ul>
                        <DepositToken 
                            asyncAction={() => setDepositAmount(2)} 
                            inputChangeHandler={setInputAmount}
                            title={`Deposit [${DX_MGN_POOL.pool1.stName}]`}
                            {...DX_MGN_POOL} 
                        />
                    </pre>
                </div>
            </div>
        </>
    )
}

const mapProps = ({
    state: {
      DX_MGN_POOL,
    },
    setDxMgnPoolState,
    setDepositAmount,
    setInputAmount,
  }) => ({
    DX_MGN_POOL,
    setDxMgnPoolState,
    setDepositAmount,
    setInputAmount,
  })
  
  export default connect(mapProps)(PoolData)
