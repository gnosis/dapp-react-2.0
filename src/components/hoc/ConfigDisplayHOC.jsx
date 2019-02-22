import React from 'react'
import DataDisplayContainer from '../display/DataDisplay'

/**
 * Configuration Displayer HOC
 * @param {*} Component Component to wrap
 */
const ConfigDisplayerHOC = Component =>
  class extends React.Component {
    state = {
      ENV: process.env.NODE_ENV,
      TIME: (new Date()).toString(),
    }
    render() {
      return (
        <>
          <h3>Development Context</h3>
          {Object.keys(this.state).map(stateKey => (
            <pre className="data-pre-yellow word-wrap" key={stateKey}>{`${stateKey}: ${this.state[stateKey]}`}</pre>
          ))}
          <Component {...this.props} {...this.state} />
          <DataDisplayContainer title="App state" startOpen={false} colour="pink" {...this.props.state} />
        </>
      )
    }
  }

/* <div className="loadingHOC"><h1>LOADING . . .</h1></div> */

export default ConfigDisplayerHOC
