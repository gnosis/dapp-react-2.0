/* eslint-disable camelcase */
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import { loadLocalForage } from './api/LocalForage'

// Import CSS
import './styles/global.css'

async function asyncRender() {
    await loadLocalForage()

    return ReactDOM.hydrate(<App />, document.getElementById('app'))
}

asyncRender()

