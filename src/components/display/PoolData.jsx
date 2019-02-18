import React from 'react'
import { connect } from '../StateProvider'

import AsyncActionsHOC from '../controls/AsyncActionsHOC'

import { cleanData } from '../../api/utils'

// TODO: remove
const asyncActionMock = async (time = 2000) => new Promise(accept => setTimeout(() => accept('YAY'), time))

const ButtonMocked = ({ onChange, disabled, ...rest }) => (
        <input
            disabled={disabled}
            onChange={onChange}
            type="text" 
        />
    )

const DepositToken = AsyncActionsHOC(ButtonMocked)/* ({ asyncAction: asyncActionMock }) */

const PoolData = ({
    DX_MGN_POOL,
    setDxMgnPoolState,
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
                            asyncAction={setDxMgnPoolState} 
                            title={`Deposit [${DX_MGN_POOL.pool1.dtName}]`}
                            {...DX_MGN_POOL} 
                        />
                    </pre>
                    {/* POOL 2 */}
                    <pre className="poolDataContainer data-pre-green">
                        <h2>DxMGNPool #2 {DX_MGN_POOL.pool1.stName} [{DX_MGN_POOL.pool1.stSymbol}]</h2>
                        <ul>
                            {Object.keys(pool2).map((key, idx) => <li key={idx * Math.random()}>{`${key}: ${cleanData(pool2[key])}`}</li>)}
                        </ul>
                        <DepositToken 
                            asyncAction={setDxMgnPoolState} 
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
  }) => ({
    DX_MGN_POOL,
    setDxMgnPoolState,
  })
  
  export default connect(mapProps)(PoolData)
