import { useEffect } from 'react'
import ReactDOM from 'react-dom'

const modalRoot = document.getElementById('modal')

function ModalBase({
    children,
}) {
    const element = document.createElement('div')

    // Append modal then remove on unmount
    useEffect(() => {
        modalRoot.appendChild(element)

        return function removeModal() { 
            modalRoot.removeChild(element)
        }
    })

    return ReactDOM.createPortal(
        children,
        element,
    )
}

export default ModalBase
