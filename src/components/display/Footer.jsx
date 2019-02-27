import React from 'react'

import DataDisplayVisualContainer from './DataDisplay'
import { version, dependencies } from '../../../package.json'

const UserStateDisplay = () =>
  <DataDisplayVisualContainer
    colour="lightSalmon"
  >
    {() =>
    <>
        <h5>- dX-MGn-pool fRontend inteRfAce -</h5>
        <p>APP VERSION: {version}</p>
        <p>CONTRACTS VERSION: {dependencies['@gnosis.pm/dx-mgn-pool']}</p>
    </>
    }
  </DataDisplayVisualContainer>

export default UserStateDisplay
