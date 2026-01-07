/** @format */

import { useContext, useEffect, useMemo, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import useAccountApi from '../../hooks/useAccountApi';
import AddAccountModal from './AddAccountModal';
import UpdateAccountModal from './UpdateAccountModal';
import { Spinner } from 'react-bootstrap';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';

const PAGE_SIZE = 100;

const AccountContentBox = () => {
	const { addAccFlag, setEditAccData, accModalShow, setAccModalShow } = useContext(DataContext);

	const [accountList, setAccountList] = useState({});
	const [pageIndex, setPageIndex] = useState(0);
	const [sorting, setSorting] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const [accUpdateModalShow, setAccUpdateModalShow] = useState(false);

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
	} = useQueryFetch(
		['account-list-table', addAccFlag, pageIndex, sortKey],
		'admob-account-list',
		formData,
		{ staleTime: 60 * 1000, refetchOnMount: 'ifStale', placeholderData: (prev) => prev }
	);

	useEffect(() => {
		if (!apiResponse || !isSuccess) return;
		setAccountList(apiResponse);
		setTotalPages(Math.ceil(apiResponse.iTotalDisplayRecords / PAGE_SIZE));
	}, [apiResponse, isSuccess]);

	const handleDoubleClick = async (row) => {
		setAccUpdateModalShow(true);
		const editFd = new FormData();
		editFd.append('user_id', localStorage.getItem('id'));
		editFd.append('user_token', localStorage.getItem('token'));
		editFd.append('admob_pub_id', row.admob_pub_id);
		const response = await useAccountApi('get-admob-account-detail', editFd);
		setEditAccData(response?.info);
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
				accessorKey: 'admob_email',
				header: 'Email',
				size: 300,
				cell: ({ row }) => <div className='custom-column'>{row.original.admob_email}</div>,
				meta: { isDynamic: true, alignMent: 'left' },
			},

			{
				id: '1',
				accessorKey: 'admob_pub_id',
				header: 'Public Id',
				cell: ({ row }) => <div className='custom-column'>{row.original.admob_pub_id}</div>,
				size: 300,
				meta: { isDynamic: true, alignMent: 'left' },
			},

			{
				id: '2',
				accessorKey: 'admob_updated_at',
				header: 'Last Updated Date',
				size: 300,
				cell: ({ row }) => <div className='custom-column'>{row.original.admob_updated_at}</div>,
				meta: { isDynamic: true, alignMent: 'left' },
			},
		],
		[]
	);

	const showMainLoader = !isPlaceholderData && isFetching;
	const showOverlayLoader = isPlaceholderData && isFetching;

	return (
		<div className='right-box-wrap'>
			<div className='table-box-wrap main-box-wrapper'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='button-top-wrap'>
						<h1 className='title'></h1>
						<div
							className='d-content-btn float-right text-transform body-font-btn ml-0'
							onClick={() => setAccModalShow(true)}
						>
							Add Account
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
								data={accountList.aaData}
								columns={columns}
								enableSorting
								rowHeight={40}
								variant='normal'
								stickyColumns={0}
								enableResize={false}
								onRowDoubleClick={handleDoubleClick}
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
										setPageIndex(next);
									},
								}}
							/>
						</div>
					)}
				</div>
			</div>

			<AddAccountModal show={accModalShow} onHide={() => setAccModalShow(false)} />
			<UpdateAccountModal show={accUpdateModalShow} onHide={() => setAccUpdateModalShow(false)} />
		</div>
	);
};

export default AccountContentBox;
