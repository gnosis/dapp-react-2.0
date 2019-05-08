import React from 'react'
import LoadingModal from '../display/Modals/LoadingModal'
import { State } from 'types';

/**
 * Configuration Displayer HOC
 * @param {*} Component Component to wrap
 */
const ModalHOC = (Component: React.ComponentType<any>) =>
  (props: { state: State }) => 
    <>
      {props.state.SHOW_MODAL && <LoadingModal header={props.state.SHOW_MODAL} />}
      <Component {...props} />
    </>

export default ModalHOC
