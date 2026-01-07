/** @format */

import { useMemo, useState, useCallback } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useFormik } from 'formik';
import { useQueryClient } from '@tanstack/react-query';

import { AddGG } from '../../schemas/GroupSchema';
import { useQueryMutation } from '../../hooks/useQueryMutation';
import GroupAppsSelectorV2 from './GroupAppsSelectorV2';
import { Spinner } from 'react-bootstrap';

const AddGroupSetting = ({ allAppsList = [], fetchFlag, setFetchFlag, ...props }) => {
	const [errorMassage, setErrorMassage] = useState('');
	const queryClient = useQueryClient();

	const toAppVM = useCallback((app) => {
		return {
			id: app?.app_auto_id,
			app_auto_id: app?.app_auto_id,
			app_icon: app?.app_icon,
			app_platform: app?.app_platform,
			app_display_name: app?.app_display_name,
			app_store_id: app?.app_store_id,
			app_console_name: app?.app_console_name,
		};
	}, []);

	const apps = useMemo(() => {
		return (allAppsList || []).map(toAppVM).filter((a) => a?.id != null);
	}, [allAppsList, toAppVM]);

	const { mutate: addGroup, isPending } = useQueryMutation(['group-add'], 'create-global-group', {
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['group_select'] });
			if (data.status_code == 1) {
				props.onHide?.();
				setErrorMassage('');
				resetForm();
			} else {
				setErrorMassage(data.msg || 'Unable to create group.');
			}
		},
		onError: () => {
			setErrorMassage('Something went wrong. Please try again.');
		},
	});

	const { values, errors, touched, setFieldValue, resetForm, handleChange, handleSubmit } =
		useFormik({
			initialValues: {
				name: '',
				appSelectOptions: [],
			},
			validationSchema: AddGG,
			onSubmit: (v) => handleAddGroup(v),
		});

	const handleAddGroup = (v) => {
		const idsArray = (v?.appSelectOptions || []).map((a) => a?.id).filter(Boolean);
		const commaSeparatedIds = idsArray.join(',');

		const formData = new FormData();
		formData.append('user_id', localStorage.getItem('id'));
		formData.append('user_token', localStorage.getItem('token'));
		formData.append('gg_name', v?.name);
		formData.append('gg_apps', commaSeparatedIds);

		addGroup(formData);
	};

	return (
		<Modal
			{...props}
			aria-labelledby='contained-modal-title-vcenter'
			centered
			size='lg'
			className='modal fade basic-modal-wrap group_settings_modal popup-modal-wrap'
		>
			<Modal.Body>
				<div className='form-wrap modal-form'>
					<h3>Create New Group</h3>

					<form onSubmit={handleSubmit} noValidate>
						<h6 className='group_name_input'>Group name</h6>
						<div className='input-box group_name_input'>
							<input
								type='text'
								className='input'
								name='name'
								placeholder='Group name'
								value={values.name}
								onChange={handleChange}
							/>
						</div>
						{touched.name && errors.name && <div className='formErrors'>{errors.name}</div>}

						<GroupAppsSelectorV2
							apps={apps}
							selectedApps={values.appSelectOptions}
							onChangeSelected={(next) => setFieldValue('appSelectOptions', next)}
						/>

						{touched.appSelectOptions && errors.appSelectOptions && (
							<div className='formErrors ggAppError'>{errors.appSelectOptions}</div>
						)}

						<div className='group-modal-footer'>
							<button
								type='submit'
								className='mt-3 d-content-btn bg-btn gg_submit_btn float-right'
								disabled={isPending}
							>
								{isPending ? <Spinner animation='border' size='sm' /> : 'Add'}
							</button>

							<button
								type='button'
								className='mt-3 d-content-btn float-right'
								onClick={() => {
									props.onHide?.();
									setErrorMassage('');
									resetForm();
								}}
								disabled={isPending}
							>
								Cancel
							</button>
						</div>
					</form>

					{errorMassage ? <div className='backError'>{errorMassage}</div> : null}
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default AddGroupSetting;
