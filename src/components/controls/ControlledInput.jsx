import React from 'react'

export const TextInput = ({ onChange, disabled, ...rest }) => (
    <input
        disabled={disabled}
        onChange={onChange}
        type="text"
        {...rest}
    />
)

export const NumberInput = ({ onChange, disabled, ...rest }) => (
    <input
        disabled={disabled}
        onChange={onChange}
        type="number" 
        {...rest}
    />
)
