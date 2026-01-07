/** @format */

import React, { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { DataContext } from '../../context/DataContext';
import { useFormik } from 'formik';
import useAccountApi from '../../hooks/useAccountApi';
import { AddAccountSchema } from '../../schemas/AccountSchema';

const AddAccountModal = (props) => {
  const { addAccFlag, setAddAccFlag } = useContext(DataContext);
  const [addAccErrorMassage, setAddAccErrorMassage] = useState('');

  const handleAccountUser = async (values, action) => {
    const accountUserData = new FormData();
    accountUserData.append('user_id', localStorage.getItem('id'));
    accountUserData.append('user_token', localStorage.getItem('token'));
    accountUserData.append('admob_email', values.email);
    accountUserData.append('admob_pub_id', values.publicId);
    accountUserData.append('admob_access_token', values.accessToken);

    const response = await useAccountApi('add-admob-account', accountUserData);

    if (response.status_code == 1) {
      props.onHide();
      action.resetForm();
      setAddAccErrorMassage('');
      setAddAccFlag(!addAccFlag);
    }
    if (response.status_code !== 1) {
      setAddAccErrorMassage(response?.msg);
    }
  };

  const { values, errors, touched, resetForm, handleChange, handleSubmit } =
    useFormik({
      initialValues: {
        name: '',
        email: '',
        publicId: '',
        accessToken: '',
      },
      validationSchema: AddAccountSchema,
      onSubmit: (values, action) => {
        handleAccountUser(values, action);
      },
    });
  const handleCancel = () => {
    props.onHide();
    setAddAccErrorMassage('');
    resetForm();
  };

  return (
    <Modal
      {...props}
      size='xl-down'
      aria-labelledby='contained-modal-title-vcenter'
      centered
      className='modal fade basic-modal-wrap popup-modal-wrap'
    >
      <Modal.Body>
        <div className='form-wrap modal-form'>
          <h3>Add AdMob Account</h3>
          <form onSubmit={handleSubmit} noValidate>
            {/* <div className='input-box'>
              <input
                type='text'
                className='input'
                name='name'
                value={values.name}
                onChange={handleChange}
              />
              <div className='input-label snByac'>
                <span>Name</span>
              </div>
              <div className='input-border'></div>
              <div className='blue-border'></div>
            </div>
            {touched.name && errors.name && (
              <div className='formErrors'>{errors.name}</div>
            )} */}
            <div className='input-box'>
              <input
                type='text'
                className='input'
                name='publicId'
                value={values.publicId}
                onChange={handleChange}
              />
              <div className='input-label snByac'>
                <span>Public Id</span>
              </div>
              <div className='input-border'></div>
              <div className='blue-border'></div>
            </div>
            {touched.publicId && errors.publicId && (
              <div className='formErrors'>{errors.publicId}</div>
            )}
            <div className='input-box'>
              <input
                type='text'
                className='input'
                name='email'
                value={values.email}
                onChange={handleChange}
              />
              <div className='input-label snByac'>
                <span>AdMob Email</span>
              </div>
              <div className='input-border'></div>
              <div className='blue-border'></div>
            </div>
            {touched.email && errors.email && (
              <div className='formErrors'>{errors.email}</div>
            )}
            <div className='input-box textarea'>
              <textarea
                rows={3}
                className='input'
                name='accessToken'
                value={values.accessToken}
                onChange={handleChange}
              />
              <div className='input-label snByac'>
                <span>Access Token</span>
              </div>
            </div>
            {touched.accessToken && errors.accessToken && (
              <div className='formErrors'>{errors.accessToken}</div>
            )}
            <button
              type='submit'
              className='mt-3 d-content-btn bg-btn float-right'
            >
              Add
            </button>
            <button
              type='button'
              className='mt-3 d-content-btn float-right'
              onClick={handleCancel}
            >
              Cancel
            </button>
          </form>
          {addAccErrorMassage ? (
            <div className='backError'>{addAccErrorMassage} !!</div>
          ) : null}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AddAccountModal;
