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
        balance: mgnBalance,
      },
    },
  }) => ({
    account,
    network,
    "[ETH] balance": cleanData(balance),
    "[locked MGN] balance": cleanData(mgnBalance),
  })
  
export default connect(mapProps)(DataDisplay)
