/** @format */

import React, { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { DataContext } from '../../context/DataContext';
import useUserApi from '../../hooks/useUserApi';
import { useFormik } from 'formik';
import { AddGroup } from '../../schemas/GroupSchema';
import Select from 'react-select';
import AccountPageAppBox from '../GeneralComponents/AccountPageAppBox';

const AddGroupModal = ({ allAppsList, ...props }) => {
	const { addGroupFlag, setAddGroupFlag } = useContext(DataContext);
	const [addUserErrorMassage, setAddUserErrorMassage] = useState('');

	let appSelectOptions = {};
	if (allAppsList?.length > 0) {
		appSelectOptions = allAppsList?.map((options) => {
			return {
				value: [options.app_auto_id, options?.app_display_name],
				// value: options.app_auto_id,
				label: (
					<AccountPageAppBox
						app_auto_id={options?.app_auto_id}
						app_icon={options?.app_icon}
						app_platform={options?.app_platform}
						app_display_name={options?.app_display_name}
						app_store_id={options?.app_store_id}
						app_console_name={options?.app_console_name}
						className='add-permission'
					/>
				),
			};
		});
	}

	const handleAddUser = async (values, action) => {
		const idsArray = values?.appSelectOptions?.map((option) => option.value[0]);
		const commaSeparatedIds = idsArray?.join(',');
		const formData = new FormData();
		formData.append('user_id', localStorage.getItem('id'));
		formData.append('user_token', localStorage.getItem('token'));
		formData.append('group_name', values?.name);
		formData.append('group_app_ids', commaSeparatedIds);
		formData.append('group_status ', values.role);
		const response = await useUserApi('create-group', formData);
		if (response?.status_code == 1) {
			props.onHide();
			setAddUserErrorMassage('');
			action.resetForm();
			setAddGroupFlag(!addGroupFlag);
		}
		if (response.status_code !== 1) {
			setAddUserErrorMassage(response?.msg);
		}
	};

	const { values, errors, touched, setFieldValue, resetForm, handleChange, handleSubmit } =
		useFormik({
			initialValues: {
				name: '',
				role: 1,
				appSelectOptions: [],
			},
			validationSchema: AddGroup,
			onSubmit: (values, action) => {
				handleAddUser(values, action);
			},
		});
	const handleCancel = () => {
		props.onHide();
		setAddUserErrorMassage('');
		resetForm();
	};

	const roleOptions = [
		{ value: 1, label: 'Active' },
		{ value: 2, label: 'In Active' },
	];

	return (
		<Modal
			{...props}
			aria-labelledby='contained-modal-title-vcenter'
			centered
			className='modal fade basic-modal-wrap popup-modal-wrap'
		>
			<Modal.Body>
				<div className='form-wrap modal-form'>
					<h3>Create new Group</h3>
					<form onSubmit={handleSubmit} noValidate>
						<div className='input-box'>
							<input
								type='text'
								className='input'
								name='name'
								value={values.name}
								onChange={handleChange}
							/>
							<div className='input-label snByac'>
								<span>Group name</span>
							</div>
							<div className='input-border'></div>
							<div className='blue-border'></div>
						</div>
						{touched.name && errors.name && <div className='formErrors'>{errors.name}</div>}
						<div className='input-box react-select app-select-css add-permission-form-select app-input-css'>
							<Select
								className='app-select-css'
								classNamePrefix='app-select-css app-select'
								placeholder={<div className='select-placeholder'>Select Application</div>}
								isMulti={true}
								value={values?.appSelectOptions?.length > 0 ? values?.appSelectOptions?.value?.[0] : []}
								options={
									values?.appSelectOptions?.length > 0
										? appSelectOptions?.filter(
												(option) =>
													!values?.appSelectOptions?.some(
														(selectedOption) => selectedOption?.value[0] === option.value[0]
													)
										  )
										: appSelectOptions
								}
								onChange={(option) => setFieldValue('appSelectOptions', option)}
							/>
						</div>
						{touched.appSelectOptions && errors.appSelectOptions && (
							<div className='formErrors'>{errors.appSelectOptions}</div>
						)}

						<div className='input-box react-select'>
							<Select
								value={roleOptions.find((option) => option.value === values.role)}
								options={roleOptions}
								onChange={(option) => setFieldValue('role', option.value)}
								isSearchable={false}
								classNamePrefix='add-user-select'
								className='add-user-select'
							/>
						</div>
						{errors.role && <div className='formErrors'>{errors.role}</div>}
						<div className='group-modal-footer'>
							<button type='submit' className='mt-3 d-content-btn bg-btn float-right'>
								Add
							</button>
							<button type='button' className='mt-3 d-content-btn float-right' onClick={handleCancel}>
								Cancel
							</button>
						</div>
					</form>
					{addUserErrorMassage ? <div className='backError'>{addUserErrorMassage} !!</div> : null}
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default AddGroupModal;
