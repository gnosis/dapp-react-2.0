import DataDisplay from './DataDisplay'
import { connect } from '../StateProvider'

import { cleanData } from '../../api/utils'

const mapProps = ({
    state: {
      USER: {
        account,
        balance,
      },
      PROVIDER: { network },
      TOKEN_MGN: {
        LOCKED_BALANCE,
        UNLOCKED_BALANCE,
        BALANCE: MGN_BALANCE,
      },
    },
  }) => ({
    account,
    network,
    "[ETH] balance": cleanData(balance),
    "[MGN] balance": cleanData(MGN_BALANCE),    
    "[locked MGN] balance": cleanData(LOCKED_BALANCE),
    "[unlocked MGN] balance": cleanData(UNLOCKED_BALANCE),
  })
  
export default connect(mapProps)(DataDisplay)
