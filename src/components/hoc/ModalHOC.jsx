import React from 'react'
import LoadingModal from '../display/Modals/LoadingModal'

/**
 * Configuration Displayer HOC
 * @param {*} Component Component to wrap
 */
const ModalHOC = Component =>
  props => 
    <>
      {props.state.SHOW_MODAL && <LoadingModal header={props.state.SHOW_MODAL} />}
      <Component {...props} />
    </>

export default ModalHOC
