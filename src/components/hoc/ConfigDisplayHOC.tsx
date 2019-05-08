import React from 'react'
// import contractNetworks from '@gnosis.pm/dx-mgn-pool/networks.json'

import DataDisplayContainer from 'components/display/DataDisplay'
/**
 * Configuration Displayer HOC
 * @param {*} Component Component to wrap
 */
const ConfigDisplayerHOC = (Component: React.ComponentType<{}>) =>
  class extends React.Component<any> {
    state = {
      ENV: process.env.NODE_ENV,
    }
    render() {
      return (
        <>
          {/* DEV CONTEXT */}
          <DataDisplayContainer
            title="Development Context"
            colour="yellow"
            height={440}
            startOpen={false}
            transition
          >
            {() => 
              <>
                {Object.keys(this.state).map(stateKey => (
                  <pre key={stateKey}>{`${stateKey}: ${this.state[stateKey]}`}</pre>
                ))}
                <h5>- Contracts in use -</h5>
                {/* {Object.keys(contractNetworks).map(contract => (
                  <pre key={contract} style={{ fontSize: 10, whiteSpace: 'pre-wrap' }}>{`${contract}: ${JSON.stringify(contractNetworks[contract], undefined, 2)}`}</pre>
                ))} */}
              </>
            }
          </DataDisplayContainer>

          {/* MAIN APP */}
          <Component {...this.props} {...this.state} />
          
          {/* APP STATE */}
          <DataDisplayContainer title="App state" startOpen={false} colour="pink" {...this.props.state} />
        </>
      )
    }
  }

export default ConfigDisplayerHOC
