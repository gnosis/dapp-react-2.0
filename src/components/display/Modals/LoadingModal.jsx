import React from 'react'

const LoadingModal = ({
    header = 'LOADING . . .',
}) => {
    return (
        <div className="loadingHOC">
            <h1>{header}</h1>
        </div>
    )
}

export default LoadingModal
