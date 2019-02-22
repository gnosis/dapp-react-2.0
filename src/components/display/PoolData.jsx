import React from 'react'
import { connect } from '../StateProvider'

import AsyncActionsHOC from '../hoc/AsyncActionsHOC'
import { DataDisplay } from './DataDisplay'
import { TextInput } from '../controls/ControlledInput'

import { 
    MGNPoolDataSubscription, 
    MGNPoolDataSub, 
  } from '../../subscriptions'

const DepositToken = AsyncActionsHOC(TextInput)

const PoolData = ({
    DX_MGN_POOL,
    setDepositAmount,
    setInputAmount,
}) => 
    <>  
        <h2>Mgn pool - {DX_MGN_POOL.POOL1.DEPOSIT_SYMBOL.toLowerCase()}/{DX_MGN_POOL.POOL1.SECONDARY_SYMBOL.toLowerCase()}</h2>
        <div className="poolContainer">
            <div className="poolInnerContainer">
                {/* POOL 1 */}
                <pre className="poolDataContainer data-pre-blue">
                    <h2>{DX_MGN_POOL.POOL1.DEPOSIT_TOKEN} [{DX_MGN_POOL.POOL1.DEPOSIT_SYMBOL}]</h2>
                    {/* <ul>
                        {Object.keys(makePoolObject(POOL1)).map((key, idx) => <li key={idx * Math.random()}>{`${key.split('_').join(' ')}: ${cleanData(POOL1[key])}`}</li>)}
                    </ul> */}
                    <MGNPoolDataSubscription source={MGNPoolDataSub}>
                        {({ POOL1: p1 }) => <DataDisplay {...p1} />}
                    </MGNPoolDataSubscription>
                    <DepositToken 
                        asyncAction={() => setDepositAmount(1)} 
                        inputChangeHandler={setInputAmount}
                        title={`Deposit [${DX_MGN_POOL.POOL1.DEPOSIT_TOKEN}]`}
                        {...DX_MGN_POOL} 
                    />
                </pre>
                {/* POOL 2 */}
                <pre className="poolDataContainer data-pre-green">
                    <h2>{DX_MGN_POOL.POOL1.SECONDARY_TOKEN} [{DX_MGN_POOL.POOL1.SECONDARY_SYMBOL}]</h2>
                    {/* <ul>
                        {Object.keys(makePoolObject(POOL2)).map((key, idx) => <li key={idx * Math.random()}>{`${key.split('_').join(' ')}: ${cleanData(POOL2[key])}`}</li>)}
                    </ul> */}
                    <MGNPoolDataSubscription source={MGNPoolDataSub}>
                        {({ POOL2: p2 }) => <DataDisplay {...p2} />}
                    </MGNPoolDataSubscription>
                    <DepositToken 
                        asyncAction={() => setDepositAmount(2)} 
                        inputChangeHandler={setInputAmount}
                        title={`Deposit [${DX_MGN_POOL.POOL1.SECONDARY_TOKEN}]`}
                        {...DX_MGN_POOL} 
                    />
                </pre>
            </div>
        </div>
    </>

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
