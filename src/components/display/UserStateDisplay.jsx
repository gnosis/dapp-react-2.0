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
    },
  }) => ({
    account,
    balance: balance && fromWei(balance),
    network,
  })
  
export default connect(mapProps)(DataDisplay)
