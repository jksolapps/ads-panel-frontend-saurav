/** @format */

import { useContext, useEffect, useMemo, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import Spinner from 'react-bootstrap/Spinner';
import AddPermissionModal from './AddPermissionModal';
import useApi from '../../hooks/useApi';
import UnitEditModal from './UnitEditModal';
import AppInfoBox from '../GeneralComponents/AppInfoBox';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import { Alignment } from 'react-data-table-component';

const PAGE_SIZE = 100;

const PermissionContentBox = () => {
	const { addPermissionFlag, setAddPermissionFlag } = useContext(DataContext);

	const [permissionAppList, setPermissionAppList] = useState({});
	const [pageIndex, setPageIndex] = useState(0);
	const [sorting, setSorting] = useState([]);
	const [totalPages, setTotalPages] = useState(1);

	const [unitModal, setUnitModal] = useState(false);
	const [permissionModalShow, setPermissionModalShow] = useState(false);

	// ---- edit data
	const [permissionEditData, setPermissionEditData] = useState([]);

	const handleUnitModal = async (app_auto_id, user_unique_id, app_display_name, ad_units) => {
		if (document.selection && document.selection.empty) {
			document.selection.empty();
		} else if (window.getSelection) {
			const sel = window.getSelection();
			sel.removeAllRanges();
		}

		setUnitModal(true);

		const editData = new FormData();
		editData.append('user_id', localStorage.getItem('id'));
		editData.append('user_token', localStorage.getItem('token'));
		editData.append('user_unique_id', user_unique_id);
		editData.append('app_auto_id', app_auto_id);

		const response = await useApi('edit-user-app-permission', editData);

		setPermissionEditData({
			...response?.data,
			app_auto_id,
			selected_app_display_name: app_display_name,
			selected_ad_units: ad_units,
			user_unique_id,
		});
	};

	const formData = useMemo(() => {
		const fd = new FormData();
		fd.append('user_id', localStorage.getItem('id'));
		fd.append('user_token', localStorage.getItem('token'));
		fd.append('start', pageIndex * PAGE_SIZE);
		fd.append('length', PAGE_SIZE);

		if (sorting?.length) {
			fd.append('iSortCol_0', sorting[0].id); // "0" | "1"
			fd.append('sSortDir_0', sorting[0].desc ? 'DESC' : 'ASC');
		} else {
			fd.append('iSortCol_0', '');
		}

		return fd;
	}, [pageIndex, sorting]);

	const sortKey = sorting?.[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : 'none';

	const {
		data: apiResponse,
		isSuccess,
		isFetching,
		isPlaceholderData,
	} = useQueryFetch(
		['permission-table', addPermissionFlag, pageIndex, sortKey],
		'permission-apps-list',
		formData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
			placeholderData: (prev) => prev,
		}
	);

	useEffect(() => {
		if (!apiResponse || !isSuccess) return;

		if (apiResponse?.sEcho === 1) {
			setPermissionAppList(apiResponse);
			setTotalPages(Math.ceil((apiResponse?.iTotalDisplayRecords || 0) / PAGE_SIZE) || 1);
		}
	}, [apiResponse, isSuccess]);

	const handleRowDoubleClick = (row) => {
		const r = row;
		handleUnitModal(r?.app_auto_id, r?.user_unique_id, r?.app_display_name, r?.ad_units);
	};

	const columns = useMemo(
		() => [
			{
				id: 'increment_id',
				accessorKey: 'increment_id',
				header: 'Id',
				size: 90,
				meta: { alignMent: 'left' },
				enableSorting: false,
				cell: ({ row }) => <div className='custom-column'>{row.original.increment_id}</div>,
			},
			{
				id: '0',
				accessorKey: 'user_name',
				header: 'User Name',
				size: 200,
				meta: { alignMent: 'left' },
				cell: ({ row }) => <div className='custom-column'>{row.original.user_name}</div>,
			},
			{
				id: '1',
				accessorKey: 'app_display_name',
				header: 'App Name',
				meta: { isDynamic: true, alignMent: 'left' },
				cell: ({ row }) => {
					const app = row.original;
					return (
						<div className='app-item-box custom-column'>
							<AppInfoBox
								app_auto_id={app?.app_auto_id}
								app_icon={app?.app_icon}
								app_platform={app?.app_platform}
								app_display_name={app?.app_display_name}
								app_console_name={app?.app_console_name}
								app_store_id={app?.app_store_id}
							/>
						</div>
					);
				},
			},
			{
				id: 'total_ad_units',
				accessorKey: 'total_ad_units',
				header: 'Ad Units',
				enableSorting: false,
				size: 200,
				cell: ({ row }) => {
					const r = row.original;
					const label =
						r?.app_all_ad_units == r?.total_ad_units?.replace('units', '')?.trim()
							? 'ALL'
							: r?.total_ad_units;

					return <div className='custom-column'>{label}</div>;
				},
			},
		],
		[]
	);

	const showMainLoader = permissionAppList?.sEcho !== 1 && !isPlaceholderData && isFetching;
	const showOverlayLoader = isPlaceholderData && isFetching;

	return (
		<div className='right-box-wrap'>
			<div className='table-box-wrap main-box-wrapper'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='button-top-wrap'>
						<h1 className='title'></h1>
						<div
							className='d-content-btn float-right text-transform body-font-btn ml-0'
							onClick={() => setPermissionModalShow(true)}
						>
							Add Permission
						</div>
					</div>

					{showMainLoader ? (
						<div className='shimmer-spinner'>
							<Spinner animation='border' variant='secondary' />
						</div>
					) : (
						<div className='table-container custom_table_container_border ad-units-box permission-table-box'>
							{showOverlayLoader && (
								<div className='shimmer-spinner overlay-spinner'>
									<Spinner animation='border' variant='secondary' />
								</div>
							)}

							<GeneralTanStackTable
								data={permissionAppList?.aaData || []}
								columns={columns}
								enableSorting
								rowHeight={45}
								variant='normal'
								stickyColumns={0}
								enableResize={false}
								className='basic_tan_stack_table'
								onRowDoubleClick={handleRowDoubleClick}
								sorting={{
									type: 'server',
									state: sorting,
									onChange: (updater) => {
										const next = typeof updater === 'function' ? updater(sorting) : updater;
										setSorting(next);
										setPageIndex(0);
										setAddPermissionFlag((v) => !v);
									},
								}}
								pagination={{
									type: 'server',
									pageIndex,
									pageSize: PAGE_SIZE,
									pageCount: totalPages,
									onPageChange: (next) => {
										setPageIndex(next);
									},
								}}
							/>
						</div>
					)}
				</div>
			</div>

			<AddPermissionModal show={permissionModalShow} onHide={() => setPermissionModalShow(false)} />
			<UnitEditModal
				show={unitModal}
				onHide={() => setUnitModal(false)}
				editdata={permissionEditData}
			/>
		</div>
	);
};

export default PermissionContentBox;
