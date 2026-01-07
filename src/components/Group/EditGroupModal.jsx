/** @format */

import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import Modal from 'react-bootstrap/Modal';
import { useFormik } from 'formik';
import Select from 'react-select';
import AccountPageAppBox from '../GeneralComponents/AccountPageAppBox';
import useUserApi from '../../hooks/useUserApi';
import { EditGroup } from '../../schemas/GroupSchema';

const UnitEditModal = ({ allAppsList, editData, ...props }) => {
	const { addGroupFlag, setAddGroupFlag } = useContext(DataContext);
	const [addUserErrorMassage, setAddUserErrorMassage] = useState('');

	//options
	let appSelectOptions = {};
	if (allAppsList?.length > 0) {
		appSelectOptions = allAppsList?.map((options) => {
			return {
				value: [options.app_auto_id, options?.app_display_name],
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
	//edit options Data
	const groupAppIdArray = editData?.group_app_ids?.split(',');
	const selectedApps =
		allAppsList?.length > 0
			? allAppsList
					.filter((app) => groupAppIdArray?.includes(app?.app_auto_id))
					.map((options) => {
						return {
							value: [options.app_auto_id, options?.app_display_name],
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
					})
			: null;

	const { values, errors, touched, setFieldValue, resetForm, handleSubmit, handleChange } =
		useFormik({
			initialValues: {
				id: editData?.group_id || '',
				role: Number(editData?.group_status) || '',
				name: editData?.group_name || '',
				appSelectOptions: selectedApps || [],
			},
			enableReinitialize: true,
			validationSchema: EditGroup,
			onSubmit: (values) => {
				handleUpdatePermissionData(values);
			},
		});

	const handleUpdatePermissionData = async (values, action) => {
		const idsArray = values?.appSelectOptions?.map((option) => option.value[0]);
		const commaSeparatedIds = idsArray?.join(',');
		const formData = new FormData();
		formData.append('user_id', localStorage.getItem('id'));
		formData.append('user_token', localStorage.getItem('token'));
		formData.append('group_id', values?.id);
		formData.append('group_name', values?.name);
		formData.append('group_app_ids', commaSeparatedIds);
		formData.append('group_status', values.role);
		const response = await useUserApi('update-group', formData);
		if (response?.status_code == 1) {
			props.onHide();
			setAddUserErrorMassage('');
			resetForm();
			setAddGroupFlag(!addGroupFlag);
		}
		if (response.status_code !== 1) {
			setAddUserErrorMassage(response?.msg);
		}
	};

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
			size={'lg'}
			className='modal fade basic-modal-wrap popup-modal-wrap group_edit_modal'
		>
			<Modal.Body>
				<div className='form-wrap modal-form'>
					<h3>Edit Group</h3>
					<div className='ad-units-box user-table-box'>
						<form onSubmit={handleSubmit} noValidate className='add-permission-form'>
							<div className='input-box'>
								<input
									type='text'
									className={`input ${values?.name?.length > 0 ? 'text-add input-active' : ''}`}
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
									className='app-select-css multi_select'
									classNamePrefix='app-select-css app-select'
									name='appSelectOptions'
									placeholder={<div className='select-placeholder'>Select Application</div>}
									value={values?.appSelectOptions?.length > 0 ? values?.appSelectOptions : []}
									isMulti={true}
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
									// options={
									//   appSelectOptions?.length > 0 ? appSelectOptions : []
									// }
									onChange={(option) => setFieldValue('appSelectOptions', option)}
									// menuIsOpen={true}
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
									className='add-user-select'
									classNamePrefix='add-user-select'
								/>
							</div>
							{errors.role && <div className='formErrors'>{errors.role}</div>}
							<button type='submit' className='mt-4 d-content-btn bg-btn float-right'>
								Update
							</button>
							<button type='button' className='mt-4 d-content-btn float-right' onClick={handleCancel}>
								Cancel
							</button>
						</form>
					</div>
					{addUserErrorMassage ? <div className='backError'>{addUserErrorMassage} !!</div> : null}
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default UnitEditModal;
