/** @format */

import React, { useContext, useMemo } from 'react';
import Modal from 'react-bootstrap/Modal';
import { DataContext } from '../../context/DataContext';
import { useFormik } from 'formik';
import { PermissionSchema } from '../../schemas/PermissionSchema';
import { useState } from 'react';
import { useEffect } from 'react';
import useApi from '../../hooks/useApi';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import AccountPageAppBox from '../GeneralComponents/AccountPageAppBox';
import { useQueryFetch } from '../../hooks/useQueryFetch';
const AddPermissionModal = (props) => {
	const { addPermissionFlag, setAddPermissionFlag } = useContext(DataContext);

	const [permissionList, setPermissionList] = useState([]);
	const animatedComponents = makeAnimated();
	// api call
	const selectListFormData = new FormData();
	selectListFormData.append('user_id', localStorage.getItem('id'));
	selectListFormData.append('user_token', localStorage.getItem('token'));

	//formik
	const { values, errors, touched, setFieldValue, resetForm, handleSubmit } = useFormik({
		initialValues: {
			userSelectOptions: '',
			appSelectOptions: '',
			multiSelectOptions: [],
		},
		validationSchema: PermissionSchema,
		onSubmit: (values, action) => {
			handlePermissionData(values);
			action.resetForm();
		},
	});

	const unitFormData = useMemo(() => {
		const fd = new FormData();
		fd.append('user_id', localStorage.getItem('id'));
		fd.append('user_token', localStorage.getItem('token'));
		fd.append('app_auto_id', values?.appSelectOptions || 1);
		return fd;
	});

	const { data: allUsesList } = useQueryFetch(['all-users'], 'get-all-users', selectListFormData, {
		staleTime: 60 * 1000,
		refetchOnMount: 'ifStale',
	});

	const { data: allAppsList } = useQueryFetch(['all-apps'], 'list-all-apps', selectListFormData, {
		staleTime: 60 * 1000,
		refetchOnMount: 'ifStale',
	});

	const { data: adUnitList } = useQueryFetch(
		['all-units', values?.appSelectOptions],
		'list-ad-units',
		unitFormData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
		}
	);

	let multiSelectOptions = {};
	let appSelectOptions = {};
	let userSelectOptions = {};

	if (allAppsList?.info?.length > 0) {
		appSelectOptions = allAppsList?.info?.map((options) => {
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
	if (adUnitList?.info?.length > 0) {
		multiSelectOptions = [
			{ value: 'all', label: 'All' }, // Add the "All" option at the beginning
			...adUnitList?.info?.map((options) => ({
				value: options.au_auto_id,
				label: options.au_display_name,
			})),
		];
	}

	if (allUsesList?.info?.length > 0) {
		userSelectOptions = allUsesList?.info?.map((options) => {
			return { value: options.user_id, label: options.user_name };
		});
	}

	const selectedOptions = Array.isArray(values?.multiSelectOptions)
		? values?.multiSelectOptions
		: values?.multiSelectOptions
		? [values?.multiSelectOptions]
		: [];

	const handlePermissionData = async (values) => {
		props.onHide();
		resetForm();
		const multiVal = selectedOptions
			?.map((val) => {
				if (val.value === 'all') {
					return adUnitList?.info?.map((adunit) => adunit?.au_auto_id);
				}
				return val?.value;
			})
			.flat();
		const permissionParams = JSON?.stringify({
			user_id: localStorage.getItem('id'),
			user_token: localStorage.getItem('token'),
			user_unique_id: values?.userSelectOptions,
			app_auto_id: values?.appSelectOptions,
			permission_au_auto_id: multiVal,
			is_all_au_permission:
				selectedOptions?.length > 0 && selectedOptions?.some((item) => item.value === 'all')
					? 'true'
					: 'false',
		});
		const permissionFormData = new FormData();
		permissionFormData.append('json_data', permissionParams);
		const permissionResponse = await useApi('add-user-permission', permissionFormData);
		if (permissionResponse?.status === 200) {
			setPermissionList(permissionResponse);
			setAddPermissionFlag(!addPermissionFlag);
		}
	};

	const handleCancel = () => {
		props.onHide();
		resetForm();
	};

	return (
		<Modal
			{...props}
			aria-labelledby='contained-modal-title-vcenter'
			centered
			size={'lg'}
			className='modal fade basic-modal-wrap popup-modal-wrap'
		>
			<Modal.Body>
				<div className='form-wrap modal-form'>
					<h3>Add Permission</h3>
					<form onSubmit={handleSubmit} noValidate className=''>
						<div className='input-box react-select'>
							<Select
								placeholder={<div className='select-placeholder'>Select User</div>}
								value={values?.userSelectOptions?.length > 0 ? values?.userSelectOptions.value : ''}
								options={userSelectOptions?.length > 0 ? userSelectOptions : ''}
								onChange={(option) => setFieldValue('userSelectOptions', option.value)}
								classNamePrefix='setting-select'
							/>
						</div>
						{touched.userSelectOptions && errors.userSelectOptions && (
							<div className='formErrors'>{errors.userSelectOptions}</div>
						)}

						<div className='input-box react-select app-select-css add-permission-form-select'>
							<Select
								classNamePrefix='app-select'
								className='permission-box-appBox'
								placeholder={<div className='select-placeholder'>Select Application</div>}
								value={values?.appSelectOptions?.length > 0 ? values?.appSelectOptions?.value?.[0] : ''}
								options={appSelectOptions?.length > 0 ? appSelectOptions : ''}
								onChange={(option) => setFieldValue('appSelectOptions', option?.value?.[0])}
							/>
						</div>
						{touched.appSelectOptions && errors.appSelectOptions && (
							<div className='formErrors'>{errors.appSelectOptions}</div>
						)}

						<div className='input-box react-select'>
							<Select
								classNamePrefix='setting-select'
								placeholder={<div className='select-placeholder'>Select Ad Unit</div>}
								value={selectedOptions ? selectedOptions : []}
								// isMulti={true}
								isMulti={
									selectedOptions?.length > 0
										? selectedOptions?.some((option) => option?.value === 'all')
											? false
											: true
										: true
								} // Modified condition
								options={multiSelectOptions?.length > 0 ? multiSelectOptions : []}
								components={animatedComponents}
								onChange={(option) => {
									if (option?.length > 0 && option?.some((opt) => opt?.value === 'all')) {
										// If "all" is selected, set only "all" in the multiSelectOptions
										setFieldValue('multiSelectOptions', [option?.find((opt) => opt?.value === 'all')]);
									} else {
										// Otherwise, set the selected options
										setFieldValue('multiSelectOptions', option);
									}
								}}
							/>
						</div>
						{touched.multiSelectOptions && errors.multiSelectOptions && (
							<div className='formErrors'>{errors.multiSelectOptions}</div>
						)}

						<button type='submit' className='mt-4 d-content-btn bg-btn float-right'>
							Add
						</button>
						<button type='button' className='mt-4 d-content-btn float-right' onClick={handleCancel}>
							Cancel
						</button>
					</form>
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default AddPermissionModal;
