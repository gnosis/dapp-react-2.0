import React from 'react'

interface InputInterface {
    disabled: boolean;
    onChange: (e: React.SyntheticEvent) => void;
}

export const TextInput: React.SFC<InputInterface> = ({ onChange, disabled, ...rest }) => (
    <input
        disabled={disabled}
        onChange={onChange}
        type="text"
        {...rest}
    />
)

export const NumberInput: React.SFC<InputInterface> = ({ onChange, disabled, ...rest }) => (
    <input
        disabled={disabled}
        onChange={onChange}
        type="number" 
        {...rest}
    />
)
