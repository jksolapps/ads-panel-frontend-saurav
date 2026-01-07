/** @format */

import React, { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import { DataContext } from '../context/DataContext';

const UserGuideModal = (props) => {
  const { setGuideStart } = useContext(DataContext);
  return (
    <Modal
      {...props}
      aria-labelledby='contained-modal-title-vcenter'
      centered
      className='modal fade basic-modal-wrap popup-modal-wrap'
    >
      <Modal.Body>
        <div className='form-wrap modal-form'>
          <h3>AdMob Account</h3>
          <p>Please add admob account first to see analytics.</p>
          <button
            type='submit'
            className='mt-3 d-content-btn bg-btn float-right'
            onClick={() => {
              props.onHide();
              setGuideStart(true);
            }}
          >
            Next
          </button>
          <button
            type='button'
            className='mt-3 d-content-btn float-right'
            onClick={() => props.onHide()}
          >
            Skip
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default UserGuideModal;
