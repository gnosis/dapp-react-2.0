import React from 'react'
import { connect } from '../StateProvider'

const PoolData = ({
    DX_MGN_POOL,
}) => {
    const { pool1, pool2 } = DX_MGN_POOL
    return (
        <div className="poolContainer">
            <h2>Pool Data</h2>
            <br />
            <div className="poolInnerContainer">
                {/* POOL 1 */}
                <div className="poolDataContainer">
                    <h2>DxMGNPool #1</h2>
                    <ul>
                        {Object.keys(pool1).map((key, idx) => <li key={idx * Math.random()}>{`${key}: ${pool1[key]}`}</li>)}
                    </ul>
                </div>

                {/* POOL 2 */}
                <div className="poolDataContainer">
                    <h2>DxMGNPool #2</h2>
                    <ul>
                        {Object.keys(pool2).map((key, idx) => <li key={idx * Math.random()}>{`${key}: ${pool2[key]}`}</li>)}
                    </ul>
                </div>
            </div>
        </div>
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
