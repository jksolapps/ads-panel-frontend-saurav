/** @format */

import { useContext, useEffect, useMemo, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import AddUserModal from './AddUserModal';
import useUserApi from '../../hooks/useUserApi';
import UpdateUserModal from './UpdateUserModal';
import Spinner from 'react-bootstrap/Spinner';
import Profile from '../../assets/images/profile.png';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';

const PAGE_SIZE = 100;

const UserContentBox = () => {
	const { addUserFlag, setAddUserFlag, setEditUserData } = useContext(DataContext);

	const [usersList, setUsersList] = useState({});
	const [pageIndex, setPageIndex] = useState(0);
	const [sorting, setSorting] = useState([]);
	const [totalPages, setTotalPages] = useState(1);

	const [addModalShow, setAddModalShow] = useState(false);
	const [updateModalShow, setUpdateModalShow] = useState(false);

	const formData = useMemo(() => {
		const fd = new FormData();
		fd.append('user_id', localStorage.getItem('id'));
		fd.append('user_token', localStorage.getItem('token'));
		fd.append('start', pageIndex * PAGE_SIZE);
		fd.append('length', PAGE_SIZE);

		if (sorting?.length) {
			fd.append('iSortCol_0', sorting[0].id);
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
	} = useQueryFetch(['user-list-table', addUserFlag, pageIndex, sortKey], 'user-list', formData, {
		staleTime: 60 * 1000,
		refetchOnMount: 'ifStale',
		placeholderData: (prev) => prev,
	});

	useEffect(() => {
		if (!apiResponse || !isSuccess) return;

		if (apiResponse?.sEcho === 1 || apiResponse?.aaData) {
			setUsersList(apiResponse);
			setTotalPages(Math.ceil((apiResponse?.iTotalDisplayRecords || 0) / PAGE_SIZE) || 1);
		}
	}, [apiResponse, isSuccess]);

	const handleEdit = async (uniqueId) => {
		if (document.selection && document.selection.empty) {
			document.selection.empty();
		} else if (window.getSelection) {
			const sel = window.getSelection();
			sel.removeAllRanges();
		}

		setUpdateModalShow(true);

		const editData = new FormData();
		editData.append('user_id', localStorage.getItem('id'));
		editData.append('user_token', localStorage.getItem('token'));
		editData.append('user_unique_id', uniqueId);

		const response = await useUserApi('get-user-detail', editData);
		setEditUserData(response?.info);
	};

	const handleRowDoubleClick = (row) => {
		handleEdit(row?.user_id);
	};

	const columns = useMemo(
		() => [
			{
				id: 'increment_id',
				accessorKey: 'increment_id',
				header: 'Id',
				size: 80,
				enableSorting: false,
				meta: { alignMent: 'left' },
				cell: ({ row }) => <div className='custom-column'>{row.original.increment_id}</div>,
			},
			{
				id: '0',
				accessorKey: 'user_name',
				header: 'Name',
				size: 300,
				cell: ({ row }) => (
					<div className='custom-column user-info'>
						<div className='app-img profile_photo'>
							<img src={Profile} loading='lazy' alt='user' />
						</div>
						<div className='label-container'>
							<span className='primary-label'>{row.original.user_name}</span>
							<span className='secondary-label'>{row.original.user_email}</span>
						</div>
					</div>
				),
				meta: { isDynamic: true, alignMent: 'left' },
			},
			{
				id: '1',
				accessorKey: 'user_role',
				header: 'Role',
				cell: ({ row }) => (
					<div className='custom-column'>
						<span dangerouslySetInnerHTML={{ __html: row.original.user_role }} />
					</div>
				),
				meta: { isDynamic: true, alignMent: 'left' },
			},
			{
				id: 'app_access',
				accessorKey: 'user_role',
				size: 140,
				header: 'App Access',
				enableSorting: false,
				cell: () => <div className='custom-column access-app-wrap'>-</div>,
			},
			{
				id: '2',
				accessorKey: 'last_login_at',
				header: 'Last Login',
				cell: ({ row }) => (
					<div className='custom-column login-date'>
						<span>{row.original?.last_login_at}</span>
					</div>
				),
				meta: { isDynamic: true },
			},
			{
				id: '3',
				accessorKey: 'user_status',
				header: 'Status',
				size: 120,
				cell: ({ row }) => (
					<div className='custom-column'>
						<span dangerouslySetInnerHTML={{ __html: row.original.user_status }} />
					</div>
				),
				meta: { alignMent: 'left' },
			},
		],
		[]
	);

	const showMainLoader = !isPlaceholderData && isFetching;
	const showOverlayLoader = isPlaceholderData && isFetching;

	return (
		<div className='right-box-wrap'>
			<div className='table-box-wrap main-box-wrapper'>
				<div className='userBoxWrap user-section-wrapper user-tab'>
					<div className='button-top-wrap'>
						<h1 className='title'></h1>
						<div
							className='d-content-btn float-right text-transform body-font-btn ml-0'
							onClick={() => setAddModalShow(true)}
						>
							Add User
						</div>
					</div>

					{showMainLoader ? (
						<div className='shimmer-spinner'>
							<Spinner animation='border' variant='secondary' />
						</div>
					) : (
						<div className='table-container custom_table_container_border ad-units-box user-table-box'>
							{showOverlayLoader && (
								<div className='shimmer-spinner overlay-spinner'>
									<Spinner animation='border' variant='secondary' />
								</div>
							)}

							<GeneralTanStackTable
								data={usersList?.aaData || []}
								columns={columns}
								enableSorting
								rowHeight={48}
								variant='normal'
								stickyColumns={0}
								className='basic_tan_stack_table'
								enableResize={false}
								customCellSpace='8px 25px'
								customColSpace='12px 25px'
								onRowDoubleClick={handleRowDoubleClick}
								sorting={{
									type: 'server',
									state: sorting,
									onChange: (updater) => {
										const next = typeof updater === 'function' ? updater(sorting) : updater;
										setSorting(next);
										setPageIndex(0);
										setAddUserFlag((v) => !v);
									},
								}}
								pagination={{
									type: 'server',
									pageIndex,
									pageSize: PAGE_SIZE,
									pageCount: totalPages,
									onPageChange: (next) => setPageIndex(next),
								}}
							/>
						</div>
					)}
				</div>
			</div>

			<AddUserModal show={addModalShow} onHide={() => setAddModalShow(false)} />
			<UpdateUserModal show={updateModalShow} onHide={() => setUpdateModalShow(false)} />
		</div>
	);
};

export default UserContentBox;
