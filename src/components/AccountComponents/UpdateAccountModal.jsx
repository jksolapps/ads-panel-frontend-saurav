/** @format */

import React, { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { DataContext } from '../../context/DataContext';
import { useFormik } from 'formik';
import useAccountApi from '../../hooks/useAccountApi';
import { UpdateAccountSchema } from '../../schemas/AccountSchema';

const UpdateAccountModal = (props) => {
	const { addAccFlag, setAddAccFlag, editAccData } = useContext(DataContext);
	const [updateErrorMassage, setUpdateErrorMassage] = useState('');

	const handleUpdateAcc = async (values) => {
		const updateAccData = new FormData();
		updateAccData.append('user_id', localStorage.getItem('id'));
		updateAccData.append('user_token', localStorage.getItem('token'));
		updateAccData.append('admob_auto_id', editAccData.admob_auto_id);
		updateAccData.append('admob_email', values.email);
		updateAccData.append('admob_pub_id', values.publicId);
		updateAccData.append('admob_access_token', values.accessToken);
		const response = await useAccountApi('update-admob-account', updateAccData);
		if (response.status_code == 1) {
			props.onHide();
			setAddAccFlag(!addAccFlag);
			setUpdateErrorMassage('');
		}
		if (response.status_code !== 1) {
			setUpdateErrorMassage(response?.msg);
		}
	};

	const editInitialValues = {
		name: '',
		email: editAccData.admob_email || '',
		publicId: editAccData.admob_pub_id || '',
		accessToken: editAccData.admob_access_token || '',
	};
	const { values, errors, touched, resetForm, handleChange, handleSubmit } = useFormik({
		enableReinitialize: true,
		initialValues: editInitialValues,
		validationSchema: UpdateAccountSchema,
		onSubmit: (values) => {
			handleUpdateAcc(values);
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
					<h3>Update AdMob Account</h3>
					<form onSubmit={handleSubmit} noValidate>
						<div className='input-box'>
							<input
								type='text'
								className='input text-add'
								name='publicId'
								value={values?.publicId}
								onChange={handleChange}
							/>
							<div className='input-label snByac'>
								<span>Public Id</span>
							</div>
							<div className='input-border'></div>
							<div className='blue-border'></div>
						</div>
						{touched.publicId && errors.publicId && <div className='formErrors'>{errors.publicId}</div>}
						<div className='input-box'>
							<input
								type='text'
								className='input text-add'
								name='email'
								value={values?.email}
								onChange={handleChange}
							/>
							<div className='input-label snByac'>
								<span>AdMob Email</span>
							</div>
							<div className='input-border'></div>
							<div className='blue-border'></div>
						</div>
						{touched.email && errors.email && <div className='formErrors'>{errors.email}</div>}
						<div className='input-box textarea'>
							<textarea
								rows={3}
								className='input text-add'
								name='accessToken'
								value={values?.accessToken}
								onChange={handleChange}
							/>
							<div className='input-label snByac'>
								<span>Access Token</span>
							</div>
							<div className='input-border'></div>
							<div className='blue-border'></div>
						</div>
						{touched.accessToken && errors.accessToken && (
							<div className='formErrors'>{errors.accessToken}</div>
						)}
						<button type='submit' className='mt-3 d-content-btn bg-btn float-right'>
							Update
						</button>
						<button type='button' className='mt-3 d-content-btn float-right' onClick={handleCancel}>
							Cancel
						</button>
					</form>
					{updateErrorMassage ? <div className='backError'>{updateErrorMassage}</div> : null}
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default UpdateAccountModal;
