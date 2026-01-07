/** @format */

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import Footer from '../Footer';
import Spinner from 'react-bootstrap/Spinner';
import useApi from '../../hooks/useApi';
import EditIpModal from './EditIpModal';
import InfoModal from './InfoModal';
import ServerInfoModal from './ServerInfoModal';
import axios from 'axios';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';

const PAGE_SIZE = 100;

const IpContentBox = () => {
	const { ipFlag } = useContext(DataContext);

	const [ipList, setIpList] = useState({});
	const [pageIndex, setPageIndex] = useState(0);
	const [sorting, setSorting] = useState([]);
	const [totalPages, setTotalPages] = useState(1);

	const [unitModal, setUnitModal] = useState(false);
	const [isLoaderVisible, setIsLoaderVisible] = useState(false);

	const [ipInfoModal, setIpInfoModal] = useState(false);
	const [infoData, setInfoData] = useState({});

	const [serverInfoModal, setServerInfoModal] = useState(false);
	const [serverData, setServerData] = useState({});

	const [ipv6Address, setIpv6Address] = useState('');

	// edit data
	const [editData, setEditData] = useState(null);

	// -----------------------------
	// helpers
	// -----------------------------
	const clearSelection = () => {
		if (document.selection && document.selection.empty) {
			document.selection.empty();
		} else if (window.getSelection) {
			const sel = window.getSelection();
			sel.removeAllRanges();
		}
	};

	const handleEditIp = (row) => {
		// in old code you were re-finding by auto_id, but row already contains the data
		clearSelection();
		setEditData(row);
		setUnitModal(true);
	};

	const handleIpInfo = (data) => {
		clearSelection();
		setInfoData(data || {});
		setIpInfoModal(true);
	};

	const handleServerInfo = (data) => {
		clearSelection();
		setServerData(data || {});
		setServerInfoModal(true);
	};

	// -----------------------------
	// API formData (server paging + sorting)
	// Backend expects iSortCol_0 numeric index based on column order.
	// Old mapping: column.id - 2 (DataTable internal)
	// Now we set sortable columns ids explicitly: "0","1","2","3","4"
	// 0: Id, 1: IP address, 2: IP Location, 3: IP created at, 4: IP updated at
	// (Status is not sortable in old code)
	// -----------------------------
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
		isSuccess: apiSuccess,
		isFetching,
		isPlaceholderData,
	} = useQueryFetch(['ip-table', ipFlag, pageIndex, sortKey], 'list-ip-address', formData, {
		staleTime: 60 * 1000,
		refetchOnMount: 'ifStale',
		placeholderData: (prev) => prev,
	});

	useEffect(() => {
		if (!apiResponse || !apiSuccess) return;

		if (apiResponse?.sEcho === 1) {
			setIpList(apiResponse);
			setIsLoaderVisible(false);
			setTotalPages(Math.ceil((apiResponse?.iTotalDisplayRecords || 0) / PAGE_SIZE) || 1);
		}
	}, [apiResponse, apiSuccess]);

	// fetch current ip (same as before)
	useEffect(() => {
		const fetchIpAddress = async () => {
			try {
				const response = await axios.get('https://api64.ipify.org?format=json');
				const { ip } = response.data;
				setIpv6Address(ip);
			} catch (error) {
				console.error('Error fetching IP address:', error);
			}
		};
		fetchIpAddress();
	}, []);

	// -----------------------------
	// Columns (TanStack)
	// NOTE: Per-column double click actions are preserved.
	// We STOP event propagation so row double-click (if enabled) won't trigger.
	// -----------------------------
	const columns = useMemo(
		() => [
			{
				id: '0',
				accessorKey: 'auto_id',
				header: 'Id',
				size: 90,
				meta: { alignMent: 'left' },
				cell: ({ row }) => <div className='custom-column'>{row.original?.auto_id}</div>,
			},
			{
				id: '1',
				accessorKey: 'ip_address',
				header: 'IP address',
				cell: ({ row }) => {
					const r = row.original;
					return (
						<div
							className={`custom-column ${r?.ip_address == ipv6Address ? 'ip-address-row' : ''}`}
							onDoubleClick={(e) => {
								e.stopPropagation();
								handleServerInfo(r?.server_info);
							}}
						>
							{r?.ip_address ? r?.ip_address : '-'}
						</div>
					);
				},
				meta: { isDynamic: true, alignMent: 'left' },
			},
			{
				id: '2',
				accessorKey: 'ip_info',
				header: 'IP Location',
				cell: ({ row }) => {
					const r = row.original;
					return (
						<div
							className='custom-column'
							onDoubleClick={(e) => {
								e.stopPropagation();
								handleIpInfo(r?.ip_info);
							}}
						>
							{r?.ip_info ? `${r.ip_info.city}, ${r.ip_info.region}, ${r.ip_info.country}` : '-'}
						</div>
					);
				},
				meta: { isDynamic: true, alignMent: 'left' },
			},
			{
				id: '3',
				accessorKey: 'ip_added_at',
				header: 'IP created at',
				cell: ({ row }) => (
					<div className='custom-column'>
						{row.original?.ip_added_at ? row.original?.ip_added_at : '-'}
					</div>
				),
				meta: { isDynamic: true },
			},
			{
				id: '4',
				accessorKey: 'ip_updated_at',
				header: 'IP updated at',
				cell: ({ row }) => (
					<div className='custom-column'>
						{row.original?.ip_updated_at ? row.original?.ip_updated_at : '-'}
					</div>
				),
				meta: { isDynamic: true, alignMent: 'left' },
			},
			{
				id: 'ip_status',
				accessorKey: 'ip_status',
				header: 'IP status',
				enableSorting: false,
				size: 130,
				meta: { alignMent: 'left' },
				cell: ({ row }) => {
					const r = row.original;
					return (
						<div
							className='custom-column'
							onDoubleClick={(e) => {
								e.stopPropagation();
								handleEditIp(r);
							}}
						>
							{r?.ip_status === 'Active' ? (
								<span>
									<span className='badge badge-soft-info'>Active</span>
								</span>
							) : (
								<span>
									<span className='badge bg-secondary'>Blocked</span>
								</span>
							)}
						</div>
					);
				},
			},
		],
		[ipv6Address]
	);

	const showMainLoader = ipList?.sEcho !== 1 && !isPlaceholderData && isFetching;
	const showOverlayLoader = isPlaceholderData && isFetching;

	return (
		<div className='right-box-wrap'>
			<div className='table-box-wrap main-box-wrapper'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='button-top-wrap'>
						<h1 className='title'></h1>
					</div>

					{showMainLoader ? (
						<div className='shimmer-spinner'>
							<Spinner animation='border' variant='secondary' />
						</div>
					) : (
						<div className='table-container custom_table_container_border'>
							{(isLoaderVisible || showOverlayLoader) && (
								<div className='shimmer-spinner overlay-spinner'>
									<Spinner animation='border' variant='secondary' />
								</div>
							)}

							<GeneralTanStackTable
								data={ipList?.aaData || []}
								columns={columns}
								enableSorting
								rowHeight={40}
								variant='normal'
								stickyColumns={0}
								enableResize={false}
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
										setIsLoaderVisible(true);
										setPageIndex(next);
									},
								}}
							/>
						</div>
					)}
				</div>

				<Footer />
			</div>

			<EditIpModal show={unitModal} onHide={() => setUnitModal(false)} editdata={editData} />
			<InfoModal show={ipInfoModal} onHide={() => setIpInfoModal(false)} infodata={infoData} />
			<ServerInfoModal
				show={serverInfoModal}
				onHide={() => setServerInfoModal(false)}
				serverdata={serverData}
			/>
		</div>
	);
};

export default IpContentBox;
