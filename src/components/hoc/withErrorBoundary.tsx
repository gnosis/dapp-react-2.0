import React, { Component } from 'react'

interface ErrorBoundaryState {
  error: Error,
  info: { componentStack: string },
}

const withErrorBoundary = (WrapComponent: React.ComponentType<any>) =>
  class ErrorBoundary extends Component<any, ErrorBoundaryState> {
    state = { 
      error: null,
      info: null,
    } as ErrorBoundaryState

    componentDidCatch(error: Error, info: { componentStack: string } ) {
      this.setState({ error, info })
      // can log errors here
    }

    render() {
      const { error, info } = this.state

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          return (
            <pre style={{ position: 'relative', zIndex: 2 }}>
              Error: {error.message}
              <br />
              Info: {info.componentStack}
            </pre>
          )
        }
        return <h3>Error occurred!</h3>
      }

      return <WrapComponent {...this.props} />
    }
  }


export default withErrorBoundary
