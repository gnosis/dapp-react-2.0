import React from 'react'
import { connect } from '../StateProvider'

import AsyncActionsHOC from '../hoc/AsyncActionsHOC'
import { TextInput } from '../controls/ControlledInput'

import { cleanData } from '../../api/utils'

const DepositToken = AsyncActionsHOC(TextInput)
const WithdrawAndClaimMGN = AsyncActionsHOC()
const RefreshAppState = AsyncActionsHOC()

const PoolData = ({
    DX_MGN_POOL,
    setDxMgnPoolState,
    setDepositAmount,
    setInputAmount,
}) => {
    const { POOL1, POOL2 } = DX_MGN_POOL
    const makePoolObject = keyName => ({
        TOTAL_SHARE: keyName.TOTAL_SHARE,
        YOUR_SHARE: keyName.YOUR_SHARE,
        TOKEN_BALANCE: keyName.TOKEN_BALANCE,
    })
    return (
        <>  
            {/* TODO: Remove */}
            <RefreshAppState asyncAction={setDxMgnPoolState} buttonText="Refresh App State" />
            <h2>Dx-Mgn-Pool Data</h2>
            <div className="poolContainer">
                <h3>Dx-Mgn-Pool</h3>
                <div className="poolInnerContainer">
                    {/* POOL 1 */}
                    <pre className="poolDataContainer data-pre-blue">
                        <h2>DxMGNPool #1 - {DX_MGN_POOL.POOL1.DEPOSIT_TOKEN} [{DX_MGN_POOL.POOL1.DEPOSIT_SYMBOL}]</h2>
                        <ul>
                            {Object.keys(makePoolObject(POOL1)).map((key, idx) => <li key={idx * Math.random()}>{`${key.split('_').join(' ')}: ${cleanData(POOL1[key])}`}</li>)}
                        </ul>
                        <DepositToken 
                            asyncAction={() => setDepositAmount(1)} 
                            inputChangeHandler={setInputAmount}
                            title={`Deposit [${DX_MGN_POOL.POOL1.DEPOSIT_TOKEN}]`}
                            {...DX_MGN_POOL} 
                        />
                        <WithdrawAndClaimMGN 
                            asyncAction={setDxMgnPoolState}
                            buttonText="Withdraw"
                            title="Withdraw MGN Tokens"
                        />
                    </pre>
                    {/* POOL 2 */}
                    <pre className="poolDataContainer data-pre-green">
                        <h2>DxMGNPool #2 - {DX_MGN_POOL.POOL1.SECONDARY_TOKEN} [{DX_MGN_POOL.POOL2.SECONDARY_SYMBOL}]</h2>
                        <ul>
                            {Object.keys(makePoolObject(POOL2)).map((key, idx) => <li key={idx * Math.random()}>{`${key.split('_').join(' ')}: ${cleanData(POOL2[key])}`}</li>)}
                        </ul>
                        <DepositToken 
                            asyncAction={() => setDepositAmount(2)} 
                            inputChangeHandler={setInputAmount}
                            title={`Deposit [${DX_MGN_POOL.POOL1.SECONDARY_TOKEN}]`}
                            {...DX_MGN_POOL} 
                        />
                        <WithdrawAndClaimMGN 
                            asyncAction={setDxMgnPoolState}
                            buttonText="Withdraw"
                            title="Withdraw MGN Tokens"
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
