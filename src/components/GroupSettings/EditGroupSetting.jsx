/** @format */

import { useCallback, useMemo, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useFormik } from 'formik';
import { Spinner } from 'react-bootstrap';
import { useQueryClient } from '@tanstack/react-query';

import { EditGG } from '../../schemas/GroupSchema';
import { useQueryMutation } from '../../hooks/useQueryMutation';
import GroupAppsSelectorV2 from './GroupAppsSelectorV2';

const EditGroupSetting = ({ allAppsList = [], editData, ...props }) => {
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

	const prefilledSelectedApps = useMemo(() => {
		const raw = String(editData?.gg_apps || '').trim();
		if (!raw) return [];
		const ids = raw
			.split(',')
			.map((x) => String(x).trim())
			.filter(Boolean);

		const idSet = new Set(ids);
		return (apps || []).filter((a) => idSet.has(String(a.id)));
	}, [editData?.gg_apps, apps]);

	const { mutate: updateGroup, isPending } = useQueryMutation(
		['group-update'],
		'update-global-group',
		{
			onSuccess: (data) => {
				queryClient.invalidateQueries({ queryKey: ['group_select'] });
				if (data?.status_code == 1) {
					props.onHide?.();
					setErrorMassage('');
					resetForm();
				} else {
					setErrorMassage(data?.msg || 'Unable to update group.');
				}
			},
			onError: () => {
				setErrorMassage('Something went wrong. Please try again.');
			},
		}
	);

	const { values, errors, touched, setFieldValue, resetForm, handleSubmit, handleChange } =
		useFormik({
			initialValues: {
				id: editData?.gg_id || '',
				name: editData?.gg_name || '',
				appSelectOptions: prefilledSelectedApps || [],
			},
			enableReinitialize: true,
			validationSchema: EditGG,
			onSubmit: (v) => handleUpdateGroup(v),
		});

	const handleUpdateGroup = (v) => {
		const idsArray = (v?.appSelectOptions || []).map((a) => a?.id).filter(Boolean);
		const commaSeparatedIds = idsArray.join(',');

		const formData = new FormData();
		formData.append('user_id', localStorage.getItem('id'));
		formData.append('user_token', localStorage.getItem('token'));
		formData.append('gg_id', v?.id);
		formData.append('gg_name', v?.name);
		formData.append('gg_apps', commaSeparatedIds);

		updateGroup(formData);
	};

	const handleCancel = () => {
		props.onHide?.();
		setErrorMassage('');
		resetForm();
	};

	return (
		<Modal
			{...props}
			aria-labelledby='contained-modal-title-vcenter'
			centered
			size={'lg'}
			className='modal fade basic-modal-wrap popup-modal-wrap group_settings_modal'
		>
			<Modal.Body>
				<div className='form-wrap modal-form'>
					<h3>Edit Group</h3>

					<form onSubmit={handleSubmit} noValidate className='add-permission-form'>
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

						<button type='submit' className='mt-4 d-content-btn bg-btn gg_submit_btn float-right'>
							{isPending ? <Spinner animation='border' size='sm' /> : 'Update'}
						</button>
						<button
							type='button'
							className='mt-4 d-content-btn float-right'
							onClick={handleCancel}
							disabled={isPending}
						>
							Cancel
						</button>
					</form>

					{errorMassage ? <div className='backError'>{errorMassage}</div> : null}
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default EditGroupSetting;
