import React from 'react'

/**
 * Configuration Displayer HOC
 * @param {*} Component Component to wrap
 */
const ConfigDisplayerHOC = Component =>
  class extends React.Component {
    state = {
      ENV: process.env.NODE_ENV,
      TIME: new Date(),
    }

    render() {
      const { state } = this.props
      return (
        <>
          { state.loading && <div className="loadingHOC"><h1>LOADING . . .</h1>{/* <img style={{ minWidth: '100%' }} src="" /> */}</div> }
          <h3>Development Context:</h3>
          {Object.keys(this.state).map(stateKey => (
            <pre className="data-pre-yellow" key={stateKey}>{`${stateKey}: ${this.state[stateKey]}`}</pre>
          ))}
          <h2>App State:</h2>
          <pre className="data-pre-pink">
            <br />
            <br />
            {JSON.stringify(state, undefined, 2)}
          </pre>
          <Component {...this.props} {...this.state} />
        </>
      )
    }
  }

export default ConfigDisplayerHOC
