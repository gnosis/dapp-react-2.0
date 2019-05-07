import React from 'react'

import { BLOCKED_COUNTRIES } from '../../../block/blockedCountries'

const Blocked = () => 
  <div className="blockedModal">
    <h4 style={{ maxWidth: '80%', textAlign: 'center' }}>:( unfortunately this app is not currently available in your country</h4>
    <code style={{ background: '#000000d1', color: '#eaeaea', fontSize: 'smaller', textAlign: 'center', maxWidth: '70%', padding: 20 }}>
        {Object.keys(BLOCKED_COUNTRIES).map((countryCode, idx, array) => {
            if (idx === array.length - 1) return <span key={idx}>{`and ${BLOCKED_COUNTRIES[countryCode]}.`}</span>

            return <span key={idx}>{`${BLOCKED_COUNTRIES[countryCode]}, `}</span>
        })}
    </code>    
  </div>

export default Blocked
