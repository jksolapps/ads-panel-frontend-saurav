/** @format */

import React, { useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import AppInfoGroupIcon from '../GeneralComponents/AppInfoGroupIcon';
import EditGroupSetting from './EditGroupSetting';
import AddGroupSetting from './AddGroupSetting';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useGroupSettings } from '../../context/GroupSettingsContext';

const GroupSettingBox = () => {
	const [fetchFlag, setFetchFlag] = useState(false);
	const [addModalShow, setAddModalShow] = useState(false);
	const [editModalShow, setEditModalShow] = useState(false);
	const [editData, setEditData] = useState([]);

	const appFormData = new FormData();
	appFormData.append('user_id', localStorage.getItem('id'));
	appFormData.append('user_token', localStorage.getItem('token'));

	const { data } = useQueryFetch('group-app-list', 'apps-list', appFormData, {
		staleTime: 1000 * 60 * 5,
		refetchOnMount: 'ifStale',
	});
	const allAppsList = data?.aaData;

	const { groupList: mainGroupList, isLoading, isFetching } = useGroupSettings();

	const findObjectById = (id) => {
		return mainGroupList?.find((obj) => obj.gg_id === id);
	};

	const handleDoubleClick = (row) => {
		const data = findObjectById(row?.gg_id);
		setEditData(data);
		setEditModalShow(true);
	};

	const columns = useMemo(
		() => [
			{
				id: 'group_id',
				header: () => <div className=''>Id</div>,
				meta: { isDynamic: true, alignMent: 'left' },
				minSize: 80,
				enableSorting: false,
				cell: ({ row }) => <div className='custom-column'>{+row.id + 1}</div>,
			},
			{
				id: 'gg_name',
				header: () => <div className=''>Group Name</div>,
				accessorKey: 'gg_name',
				enableSorting: true,
				minSize: 115,
				meta: { isDynamic: true, alignMent: 'left' },
				cell: ({ row }) => <div className='custom-column'>{row.original.gg_name}</div>,
			},
			{
				id: 'gg_apps',
				header: () => <div className=''>Apps</div>,
				accessorKey: 'gg_apps',
				enableSorting: true,
				minSize: 115,
				meta: { isDynamic: true },
				cell: ({ row }) => {
					const groupAppIds = row.original.gg_apps?.split(',')?.map((id) => id.trim());
					const selectedApps =
						allAppsList?.length > 0
							? allAppsList.filter((app) => groupAppIds?.includes(app.app_auto_id))
							: [];

					return (
						<div className='text-box custom-column'>
							<div className='app-item-box'>
								{selectedApps.map((app, idx) => (
									<AppInfoGroupIcon
										key={`${app.app_auto_id}-${idx}`}
										app_auto_id={app.app_auto_id}
										app_icon={app.app_icon}
										app_display_name={app.app_display_name}
									/>
								))}
							</div>
						</div>
					);
				},
			},
			// {
			// 	id: 'gg_status',
			// 	header: () => <div className=''>Status</div>,
			// 	accessorKey: 'gg_status',
			// 	size: 150,
			// 	enableSorting: false,
			// 	cell: ({ row }) => (
			// 		<div className='text-box copy-text value-tooltip custom-column'>
			// 			{row.original.gg_status == '1' && <span className='badge badge-soft-success'>Active</span>}
			// 			{row.original.gg_status == '2' && <span className='badge badge-soft-danger'>Inactive</span>}
			// 		</div>
			// 	),
			// },
		],
		[allAppsList, handleDoubleClick]
	);

	return (
		<div className='right-box-wrap'>
			<div className='table-box-wrap main-box-wrapper pdglr24 group_setting_box'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='button-top-wrap action-bar-container'>
						<div
							className='d-content-btn float-right text-transform ms-auto'
							onClick={() => setAddModalShow(true)}
						>
							Add Group
						</div>
					</div>
					{isLoading ? (
						<div className='shimmer-spinner'>
							<Spinner animation='border' variant='secondary' />
						</div>
					) : (
						<div className='analytics-container analytics-popup-box'>
							{isFetching && (
								<div className='shimmer-spinner overlay-spinner'>
									<Spinner animation='border' variant='secondary' />
								</div>
							)}
							<div className='box-wrapper table-container analytics-table analytics-campaign-table'>
								<GeneralTanStackTable
									data={mainGroupList}
									columns={columns}
									stickyColumns={0}
									enableResize={false}
									height={39 * 22}
									rowHeight={38}
									onRowDoubleClick={handleDoubleClick}
									variant='normal'
								/>
							</div>
						</div>
					)}
				</div>
			</div>
			<AddGroupSetting
				show={addModalShow}
				onHide={() => setAddModalShow(false)}
				allAppsList={allAppsList}
				fetchFlag={fetchFlag}
				setFetchFlag={setFetchFlag}
			/>
			<EditGroupSetting
				show={editModalShow}
				onHide={() => setEditModalShow(false)}
				allAppsList={allAppsList}
				editData={editData}
			/>
		</div>
	);
};

export default GroupSettingBox;
