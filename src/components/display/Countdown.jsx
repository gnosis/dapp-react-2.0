import React, { useEffect, useState } from 'react'
import { connect } from '../StateProvider'

function Countdown({
    BLOCK_TIMESTAMP,
    POOLING_PERIOD_END,
}) { 
    const [timeDifference, setTimeDifference] = useState((POOLING_PERIOD_END - BLOCK_TIMESTAMP) || '...')

    useEffect(() => {
        if (BLOCK_TIMESTAMP && POOLING_PERIOD_END) {
            const newDiff = POOLING_PERIOD_END - BLOCK_TIMESTAMP
            
            // Set hours until PoolingEnds + 24 hours + 8 hours (for even auctions)
            setTimeDifference((newDiff / 3600 + 32).toFixed())
        }
    }, [BLOCK_TIMESTAMP, POOLING_PERIOD_END])

    return (
        <div>
            <h6>CLAIM & WITHDRAW IN APPROX. {timeDifference > 0 ? timeDifference : 0} hours</h6>
        </div>
    )
}

const mapState = ({ 
    state: {
        PROVIDER: { BLOCK_TIMESTAMP },
    },
}) => ({ BLOCK_TIMESTAMP })

export default connect(mapState)(Countdown)
