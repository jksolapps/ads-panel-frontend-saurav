/** @format */

import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import useUserApi from '../../hooks/useUserApi';
import { useFormik } from 'formik';
import { UpdateProfileSchema } from '../../schemas/UserSchema';

const UpdateProfileModal = (props) => {
  const [updateErrorMassage, setUpdateErrorMassage] = useState('');

  const handleUpdateUser = async (values) => {
    const updateData = new FormData();
    updateData.append('user_id', localStorage.getItem('id'));
    updateData.append('user_token', localStorage.getItem('token'));
    updateData.append('user_name', values.name);
    updateData.append('user_email', values.email);

    const response = await useUserApi('update-my-profile', updateData);
    if (response.status_code == 1) {
      localStorage.setItem('name', values.name);
      localStorage.setItem('email', values.email);
      props.onHide();
      setUpdateErrorMassage('');
    }
    if (response.status_code !== 1) {
      setUpdateErrorMassage(response?.msg);
    }
  };

  const editInitialValues = {
    name: localStorage.getItem('name') || '',
    email: localStorage.getItem('email') || '',
  };
  const { values, errors, touched, resetForm, handleChange, handleSubmit } =
    useFormik({
      enableReinitialize: true,
      initialValues: editInitialValues,
      validationSchema: UpdateProfileSchema,
      onSubmit: (values) => {
        handleUpdateUser(values);
      },
    });

  const handleCancel = () => {
    props.onHide();
    setUpdateErrorMassage('');
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
          <form onSubmit={handleSubmit} noValidate>
            <h3>Edit Profile</h3>
            <div className='input-box'>
              <input
                type='text'
                className='input text-add'
                name='name'
                value={values?.name}
                onChange={handleChange}
              />
              <div className='input-label snByac'>
                <span>User name</span>
              </div>
              <div className='input-border'></div>
              <div className='blue-border'></div>
            </div>
            {touched.name && errors.name && (
              <div className='formErrors'>{errors.name}</div>
            )}
            <div className='input-box'>
              <input
                type='text'
                className='input text-add'
                name='email'
                value={values?.email}
                onChange={handleChange}
              />
              <div className='input-label snByac'>
                <span>Email</span>
              </div>
              <div className='input-border'></div>
              <div className='blue-border'></div>
            </div>
            {touched.email && errors.email && (
              <div className='formErrors'>{errors.email}</div>
            )}
            <button
              type='submit'
              className='mt-3 d-content-btn bg-btn float-right'
            >
              Update
            </button>
            <button
              type='button'
              className='mt-3 d-content-btn float-right'
              onClick={handleCancel}
            >
              Cancel
            </button>
          </form>
          {updateErrorMassage ? (
            <div className='backError'>{updateErrorMassage}</div>
          ) : null}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateProfileModal;
