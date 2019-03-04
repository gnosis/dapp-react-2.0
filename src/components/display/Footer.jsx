import React from 'react'

import DataDisplayVisualContainer from './DataDisplay'
import { version, dependencies } from '../../../package.json'

const UserStateDisplay = () =>
  <DataDisplayVisualContainer
    colour="lightSalmon"
  >
    {() =>
    <>
        <h6 className="footerH">dx-Mgn-pool Web</h6>
        <p className="footerP">APP VERSION: {version}</p>
        <p className="footerP">CONTRACTS VERSION: {dependencies['@gnosis.pm/dx-mgn-pool']}</p>
    </>
    }
  </DataDisplayVisualContainer>

export default UserStateDisplay
