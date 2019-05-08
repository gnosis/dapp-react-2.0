import React, { useEffect, useState } from 'react'
import { connect } from 'components/StateProvider'
import { State } from 'types'

// const formatTime = time => (time > 0 ? time > 24 ? `${(time / 24).toFixed()} day(s)` : `${time} hours` : 'now')
const formatTime = (time: string | number) => 
    `${Number(time)
        .toFixed(2)
        .split('.')
        .map((t: string, i) => (i === 0 ? t : (60 * (+t / 100)).toFixed()))
        .join('h ')}m`

interface CountdownProps {
    BLOCK_TIMESTAMP: string | number;
    POOLING_PERIOD_END: string | number;
}

function Countdown({
    BLOCK_TIMESTAMP,
    POOLING_PERIOD_END,
}: CountdownProps) { 
    const [timeDifference, setTimeDifference] = useState(undefined)

    useEffect(() => {
        if (BLOCK_TIMESTAMP && POOLING_PERIOD_END) {
            const newDiff = (+POOLING_PERIOD_END) - (+BLOCK_TIMESTAMP)
            // Set hours until PoolingEnds + 24 hours + 8 hours (for even auctions)
            setTimeDifference((newDiff / 3600 + 32).toFixed(2))
        }
    }, [BLOCK_TIMESTAMP, POOLING_PERIOD_END])

    // dont show negative time
    if (timeDifference <= 0) return null

    return (
        <div>
            {(timeDifference && timeDifference > 0) && <h6>CLAIM & WITHDRAW IN APPROX. {formatTime(timeDifference)}</h6>}
        </div>
    )
}

const mapState = ({ 
    state: {
        PROVIDER: { BLOCK_TIMESTAMP },
    },
}: { state: State }) => ({ BLOCK_TIMESTAMP })

export default connect(mapState)(Countdown)
