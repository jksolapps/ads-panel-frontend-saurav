/** @format */

import React, { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useFormik } from 'formik';
import Select from 'react-select';
import { DataContext } from '../../../context/DataContext';
import useUserApi from '../../../hooks/useUserApi';
import { AddAnalyticspropertySchema } from '../../../schemas/AnalyticsProperty';

const AddProperty = (props) => {
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
            account_selection: '',
        },
        validationSchema: AddAnalyticspropertySchema,
        onSubmit: (values, action) => {
            handleAddUser(values, action);
        },
    });
    const handleCancel = () => {
        props.onHide();
        setAddUserErrorMassage('');
        resetForm();
    };

    const acctOptions = [
        { value: '1', label: 'Admin' },
        { value: '2', label: 'User' },
    ];



    return (
        <Modal
            {...props}
            aria-labelledby='contained-modal-title-vcenter '
            centered
            className='modal fade basic-modal-wrap popup-modal-wrap property-add-model'
        >
            <Modal.Body>
                <div className='form-wrap modal-form'>
                    <h3>Add Property Details</h3>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className='input-box react-select'>
                            <Select
                                placeholder={
                                    <div className='select-placeholder'>Account selection</div>
                                }
                                value={values?.acctOptions?.value}
                                options={acctOptions}
                                onChange={(option) => setFieldValue('account_selection', option.value)}
                                isSearchable={false}
                                className='add-user-select'
                            />
                        </div>
                        {touched.account_selection && errors.account_selection && (
                            <div className='formErrors'>{errors.account_selection}</div>
                        )}
                        <div className='input-box property-id-field'>
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

export default AddProperty;
