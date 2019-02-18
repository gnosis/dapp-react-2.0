import React from 'react'

export const TextInput = ({ onChange, disabled }) => (
    <input
        disabled={disabled}
        onChange={onChange}
        type="text" 
    />
)
