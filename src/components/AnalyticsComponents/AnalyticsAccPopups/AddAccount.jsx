/** @format */

import React, { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useFormik } from 'formik';
import { DataContext } from '../../../context/DataContext';
import useUserApi from '../../../hooks/useUserApi';
import { AddAnalyticsAccountSchema } from '../../../schemas/AnalyticsAccoutSchema';

const AddAccount = (props) => {
    const { addUserFlag, setAddUserFlag } = useContext(DataContext);
    const [addUserErrorMassage, setAddUserErrorMassage] = useState('');

    const handleAddUser = async (values, action) => {
        const formData = new FormData();
        formData.append('user_id', localStorage.getItem('id'));
        formData.append('user_token', localStorage.getItem('token'));
        formData.append('id', values.id);
        formData.append('name', values.name);
        const response = await useUserApi('add-user', formData);

        if (response.status_code == 1) {
            props.onHide();
            setAddUserErrorMassage('');
            action.resetForm();
            setAddUserFlag(!addUserFlag);
        }
        if (response.status_code !== 1) {
            setAddUserErrorMassage(response?.msg);
        }
    };

    const {
        values,
        errors,
        touched,
        setFieldValue,
        resetForm,
        handleChange,
        handleSubmit,
    } = useFormik({
        initialValues: {
            id: '',
            name: '',
        },
        validationSchema: AddAnalyticsAccountSchema,
        onSubmit: (values, action) => {
            handleAddUser(values, action);
        },
    });
    const handleCancel = () => {
        props.onHide();
        setAddUserErrorMassage('');
        resetForm();
    };



    return (
        <Modal
            {...props}
            aria-labelledby='contained-modal-title-vcenter'
            centered
            className='modal fade basic-modal-wrap popup-modal-wrap'
        >
            <Modal.Body>
                <div className='form-wrap modal-form'>
                    <h3>Create Account</h3>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className='input-box'>
                            <input
                                type='text'
                                className='input'
                                name='id'
                                value={values.id}
                                onChange={handleChange}
                            />
                            <div className='input-label snByac'>
                                <span>Id</span>
                            </div>
                            <div className='input-border'></div>
                            <div className='blue-border'></div>
                        </div>
                        {touched.id && errors.id && (
                            <div className='formErrors'>{errors.id}</div>
                        )}
                        <div className='input-box'>
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
                    {addUserErrorMassage ? (
                        <div className='backError'>{addUserErrorMassage} !!</div>
                    ) : null}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default AddAccount;
