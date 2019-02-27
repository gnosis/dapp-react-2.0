import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import './styles/global.css'

ReactDOM.hydrate(<App />, document.getElementById('app'))
