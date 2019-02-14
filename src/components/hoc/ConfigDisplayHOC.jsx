import React from 'react'
import DataDisplay from '../display/DataDisplay'

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
      console.debug(this.props.state)
      const { state } = this.props
      return (
        <>
          { state.loading && <div className="loadingHOC"><h1>LOADING . . .</h1>{/* <img style={{ minWidth: '100%' }} src="" /> */}</div> }
          <h3>Development Context</h3>
          {Object.keys(this.state).map(stateKey => (
            <pre className="data-pre-yellow word-wrap" key={stateKey}>{`${stateKey}: ${this.state[stateKey]}`}</pre>
          ))}
          <DataDisplay title="APP STATE" startOpen={false} colour="pink" {...this.props.state} />
          <Component {...this.props} {...this.state} />
        </>
      )
    }
  }

export default ConfigDisplayerHOC
