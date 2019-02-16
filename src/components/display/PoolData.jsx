import React from 'react'
import { connect } from '../StateProvider'
import { fromWei } from '../../api/utils'

const PoolData = ({
    DX_MGN_POOL,
}) => {
    const { pool1, pool2 } = DX_MGN_POOL
    return (
        <>
            <h2>Dx-Mgn-Pool Data</h2>
            <div className="poolContainer">
                <h3>Dx-Mgn-Pool</h3>
                <div className="poolInnerContainer">
                    {/* POOL 1 */}
                    <pre className="poolDataContainer data-pre-blue">
                        <h2>DxMGNPool #1 {/* TOKEN SYMBOL HERE */}</h2>
                        <ul>
                            {Object.keys(pool1).map((key, idx) => <li key={idx * Math.random()}>{`${key}: ${pool1[key] && fromWei(pool1[key].toString())}`}</li>)}
                        </ul>
                    </pre>

                    {/* POOL 2 */}
                    <pre className="poolDataContainer data-pre-green">
                        <h2>DxMGNPool #2 {/* TOKEN SYMBOL HERE */}</h2>
                        <ul>
                            {Object.keys(pool2).map((key, idx) => <li key={idx * Math.random()}>{`${key}: ${pool2[key] && fromWei(pool2[key].toString())}`}</li>)}
                        </ul>
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
  }) => ({
    DX_MGN_POOL,
  })
  
  export default connect(mapProps)(PoolData)
