import React from 'react'

import DataDisplayVisualContainer from './DataDisplay'

import { APP_NAME } from 'globals'
// @ts-ignore
import { version, dependencies } from '../../../package.json'

const UserStateDisplay = () =>
  <DataDisplayVisualContainer
    colour="lightSalmon"
  >
    {() =>
    <>
        <h6 className="footerH">{APP_NAME}</h6>
        <p className="footerP">APP VERSION: {version}</p>
        <p className="footerP">CONTRACTS VERSION: {dependencies['@gnosis.pm/dx-mgn-pool']}</p>
    </>
    }
  </DataDisplayVisualContainer>

export default UserStateDisplay
