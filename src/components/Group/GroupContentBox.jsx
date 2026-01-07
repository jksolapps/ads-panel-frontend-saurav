/** @format */

import { useContext, useEffect, useMemo, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import Spinner from 'react-bootstrap/Spinner';
import AddGroupModal from './AddGroupModal';
import EditGroupModal from './EditGroupModal';
import AppInfoGroupIcon from '../GeneralComponents/AppInfoGroupIcon';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';

const PAGE_SIZE = 100;

const GroupContentBox = () => {
	const { addGroupFlag } = useContext(DataContext);

	const [permissionAppList, setPermissionAppList] = useState([]);
	const [totalUnitData, setTotalUnitData] = useState(0);

	const [unitModal, setUnitModal] = useState(false);
	const [permissionModalShow, setPermissionModalShow] = useState(false);
	const [isPermissionLoaderVisible, setIsPermissionLoaderVisible] = useState(false);

	const [allAppsList, setAllAppsList] = useState([]);

	// TanStack states
	const [pageIndex, setPageIndex] = useState(0);
	const [sorting, setSorting] = useState([]);

	// edit data
	const [permissionEditData, setPermissionEditData] = useState([]);

	const formData = useMemo(() => {
		const fd = new FormData();
		fd.append('user_id', localStorage.getItem('id'));
		fd.append('user_token', localStorage.getItem('token'));
		return fd;
	}, []);

	const { data: appResponse, isSuccess: isAppSuccess } = useQueryFetch(
		['all-apps'],
		'list-all-apps',
		formData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
		}
	);

	useEffect(() => {
		if (!appResponse || !isAppSuccess) return;
		setAllAppsList(appResponse?.info || []);
	}, [appResponse, isAppSuccess]);

	const { data: apiResponse, isSuccess: apiSuccess } = useQueryFetch(
		['old-group-table', 'group_select', addGroupFlag],
		'list-my-group',
		formData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
		}
	);

	useEffect(() => {
		if (!apiResponse || !apiSuccess) return;

		if (apiResponse.status_code === 1) {
			setPermissionAppList(apiResponse);
			setTotalUnitData(apiResponse?.info?.length || 0);
			setIsPermissionLoaderVisible(false);

			const nextTotalPages = Math.max(1, Math.ceil((apiResponse?.info?.length || 0) / PAGE_SIZE));
			if (pageIndex > nextTotalPages - 1) setPageIndex(0);
		}
	}, [apiResponse, apiSuccess]);

	// ---- Double click
	const handleRowDoubleClick = (row) => {
		if (document.selection && document.selection.empty) {
			document.selection.empty();
		} else if (window.getSelection) {
			const sel = window.getSelection();
			sel.removeAllRanges();
		}
		setPermissionEditData(row);
		setUnitModal(true);
	};

	// ---- helpers for App Name cell
	const getSelectedAppsForRow = (row) => {
		const groupAppIds = row?.group_app_ids?.split(',')?.map((id) => id?.trim()) || [];
		if (!allAppsList?.length) return [];
		return allAppsList.filter((app) => groupAppIds.includes(app.app_auto_id));
	};

	// ---- Sorting is client-side
	const sortedRows = useMemo(() => {
		const rows = permissionAppList?.info || [];
		if (!sorting?.length) return rows;

		const { id, desc } = sorting[0];

		const getSortValue = (r) => {
			if (id === 'group_name') return (r?.group_name || '').toString().toLowerCase();
			if (id === 'group_app_ids') return (r?.group_app_ids || '').toString().toLowerCase();
			return (r?.[id] || '').toString().toLowerCase();
		};

		const copy = [...rows];
		copy.sort((a, b) => {
			const av = getSortValue(a);
			const bv = getSortValue(b);
			if (av < bv) return desc ? 1 : -1;
			if (av > bv) return desc ? -1 : 1;
			return 0;
		});
		return copy;
	}, [permissionAppList, sorting]);

	const totalPages = useMemo(() => {
		return Math.max(1, Math.ceil((totalUnitData || 0) / PAGE_SIZE));
	}, [totalUnitData]);

	const pageRows = useMemo(() => {
		const start = pageIndex * PAGE_SIZE;
		const end = start + PAGE_SIZE;
		return sortedRows.slice(start, end);
	}, [sortedRows, pageIndex]);

	const columns = useMemo(
		() => [
			{
				id: 'group_id',
				accessorKey: 'group_id',
				header: 'Id',
				size: 85,
				meta: { alignMent: 'left' },
				enableSorting: false,
				cell: ({ row }) => <div className='custom-column'>{row.original.group_id}</div>,
			},
			{
				id: 'group_name',
				accessorKey: 'group_name',
				header: 'Group Name',
				meta: { isDynamic: true, alignMent: 'left' },
				cell: ({ row }) => <div className='custom-column'>{row.original.group_name}</div>,
			},
			{
				id: 'group_app_ids',
				accessorKey: 'group_app_ids',
				header: 'App Name',
				meta: { isDynamic: true, alignMent: 'left' },
				cell: ({ row }) => {
					const r = row.original;
					const selectedApps = getSelectedAppsForRow(r);
					return (
						<div className='text-box custom-column'>
							<div className='app-item-box'>
								{selectedApps.map((app, index) => (
									<AppInfoGroupIcon
										key={`${app?.app_auto_id || index}-${index}`}
										app_auto_id={app?.app_auto_id}
										app_icon={app?.app_icon}
										app_display_name={app?.app_display_name}
									/>
								))}
							</div>
						</div>
					);
				},
			},
			{
				id: 'group_status',
				accessorKey: 'group_status',
				header: 'Status',
				size: 150,
				enableSorting: false,
				cell: ({ row }) => {
					const r = row.original;
					return (
						<div className='text-box copy-text value-tooltip custom-column'>
							{r?.group_status === '1' && <span className='badge badge-soft-success'>Active</span>}
							{r?.group_status === '2' && <span className='badge badge-soft-danger'>Inactive</span>}
						</div>
					);
				},
			},
		],
		[allAppsList]
	);

	return (
		<div className='right-box-wrap'>
			<div className='table-box-wrap main-box-wrapper group-content-box'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='button-top-wrap'>
						<h1 className='title'></h1>
						<div
							className='d-content-btn float-right text-transform body-font-btn ml-0'
							onClick={() => setPermissionModalShow(true)}
						>
							Add Group
						</div>
					</div>

					{permissionAppList?.status_code !== 1 ? (
						<div className='shimmer-spinner'>
							<Spinner animation='border' variant='secondary' />
						</div>
					) : (
						<div className='table-container custom_table_container_border ad-units-box permission-table-box'>
							{isPermissionLoaderVisible && (
								<div className='shimmer-spinner overlay-spinner'>
									<Spinner animation='border' variant='secondary' />
								</div>
							)}
							<GeneralTanStackTable
								data={pageRows}
								columns={columns}
								enableSorting
								rowHeight={45}
								variant='normal'
								stickyColumns={0}
								enableResize={false}
								onRowDoubleClick={handleRowDoubleClick}
								className='basic_tan_stack_table'
								sorting={{
									type: 'server',
									state: sorting,
									onChange: (updater) => {
										const next = typeof updater === 'function' ? updater(sorting) : updater;
										setSorting(next);
										setPageIndex(0);
									},
								}}
								pagination={{
									type: 'server',
									pageIndex,
									pageSize: PAGE_SIZE,
									pageCount: totalPages,
									onPageChange: (next) => {
										setIsPermissionLoaderVisible(true);
										setPageIndex(next);
									},
								}}
							/>
						</div>
					)}
				</div>
			</div>

			<AddGroupModal
				show={permissionModalShow}
				onHide={() => setPermissionModalShow(false)}
				allAppsList={allAppsList}
			/>

			<EditGroupModal
				show={unitModal}
				onHide={() => setUnitModal(false)}
				editData={permissionEditData}
				allAppsList={allAppsList}
			/>
		</div>
	);
};

export default GroupContentBox;
