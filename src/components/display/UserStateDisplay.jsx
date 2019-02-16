import DataDisplay from './DataDisplay'
import { connect } from '../StateProvider'

import { fromWei } from '../../api/utils'

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
    "[ETH] balance": balance && fromWei(balance.toString()).toString(),
    "[locked MGN] balance": mgnBalance && fromWei(mgnBalance.toString()).toString(),
  })
  
export default connect(mapProps)(DataDisplay)
