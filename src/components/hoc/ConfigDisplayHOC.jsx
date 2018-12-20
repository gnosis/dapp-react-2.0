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
          { state.loading && <div className="loadingHOC"><img style={{ minWidth: '100%' }} src="https://1.bp.blogspot.com/-Z4NueKmr1Bw/WMkssb-4RGI/AAAAAAAAA98/7BtKVFcqMo0PUMF81wEhsbWWkIMjJDlEQCLcB/s1600/Round%2BAnimated%2BLoading%2BGif.gif" /></div> }
          <h3>Development Context:</h3>
          {Object.keys(this.state).map(stateKey => (
            <div className="displayBanner" key={stateKey}>{`${stateKey}: ${this.state[stateKey]}`}</div>
          ))}
          <pre>
            {JSON.stringify(state, undefined, 2)}
          </pre>
          <Component {...this.props} {...this.state} />
        </>
      )
    }
  }

export default ConfigDisplayerHOC
