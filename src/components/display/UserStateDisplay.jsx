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
    network,
    "balance (ETH)": balance && fromWei(balance).toString(),
    "balance (locked MGN)": "0",
  })
  
export default connect(mapProps)(DataDisplay)
