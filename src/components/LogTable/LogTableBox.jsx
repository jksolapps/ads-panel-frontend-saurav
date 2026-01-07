/** @format */

import moment from 'moment/moment';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Spinner } from 'react-bootstrap';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import GeneralDataFilter from '../GeneralFilters/GeneralDataFilter';
import LogModal from './LogModal';
import { MdSearch } from 'react-icons/md';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';

const PAGE_SIZE = 100;

const LogTableBox = () => {
	const [logData, setLogData] = useState([]);
	const [mainLoader, setMainLoader] = useState(true);

	// Server sorting
	const [columnName, setColumnName] = useState('');
	const [columnOrder, setColumnOrder] = useState('');

	const [overlayLoader, setOverlayLoader] = useState(false);
	const [isFetched, setIsFetched] = useState(false);

	// Server pagination (0-based for TanStack)
	const [pageIndex, setPageIndex] = useState(0);
	const [pageCount, setPageCount] = useState(1);

	// Filter
	const [userFilterList, setUserFilterList] = useState([]);
	const [selectedUser, setSelectedUser] = useState(() => {
		const stored = sessionStorage.getItem('logs_user_filter');
		return stored ? JSON.parse(stored) : [];
	});

	// Modal
	const [modalInfo, setModalInfo] = useState('');
	const [isLogModal, setIsLogModal] = useState(false);
	const [fullImageUrl, setFullImageUrl] = useState(null);

	// Search
	const [searchText, setSearchText] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');

	const finalSelectedUser = selectedUser?.map((item) => item?.user_id) || [];

	// TanStack sorting state (single column)
	const [sorting, setSorting] = useState([]);

	const buildFormData = (overrides = {}) => {
		const fd = new FormData();
		fd.append('user_id', localStorage.getItem('id'));
		fd.append('user_token', localStorage.getItem('token'));
		fd.append('start', PAGE_SIZE * pageIndex);
		fd.append('length', PAGE_SIZE);

		if (columnName?.length > 0) fd.append('sort_column', columnName);
		if (columnOrder?.length > 0) fd.append('sort_by', columnOrder);

		if (finalSelectedUser.length > 0) fd.append('selected_user_ids', finalSelectedUser.join(','));
		if (overrides.sSearch) fd.append('sSearch', overrides.sSearch);

		return fd;
	};

	const queryFormData = useMemo(() => {
		const s = debouncedSearch && debouncedSearch.length > 0 ? debouncedSearch : undefined;
		return buildFormData({ sSearch: s });
		// NOTE: join(',') is important so dependency is stable
	}, [pageIndex, columnName, columnOrder, finalSelectedUser.join(','), debouncedSearch]);

	const sortKey = sorting?.[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : 'none';

	const {
		data: apiResponse,
		isSuccess: apiSuccess,
		isFetching,
		isPlaceholderData,
	} = useQueryFetch(
		['logs-table', isFetched, pageIndex, finalSelectedUser.join(','), debouncedSearch, sortKey],
		'list-logs',
		queryFormData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: true,
			placeholderData: (prev) => prev,
		}
	);

	useEffect(() => {
		if (!apiResponse || !apiSuccess) return;

		const payload = apiResponse?.data ?? apiResponse;

		// Only apply when expected data exists
		if (payload?.sEcho == 1 || payload?.data?.sEcho == 1) {
			const dataRoot = payload?.sEcho == 1 ? payload : payload?.data;

			setLogData(dataRoot?.aaData || []);

			const totalRecords = Number(dataRoot?.iTotalRecords || 0);
			const pages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
			setPageCount(pages);

			setMainLoader(false);
			setOverlayLoader(false);
		}
	}, [apiResponse, apiSuccess]);

	// Fetch user list (same logic as your old code)
	const userFormData = useMemo(() => {
		const fd = new FormData();
		fd.append('user_id', localStorage.getItem('id'));
		fd.append('user_token', localStorage.getItem('token'));
		return fd;
	}, []);

	const listLogsHasData = (() => {
		if (!apiResponse) return false;
		const p = apiResponse?.data ?? apiResponse;
		return !!(p?.sEcho == 1 || p?.data?.sEcho == 1);
	})();

	const { data: userResp, isSuccess: userSuccess } = useQueryFetch(
		['user-list-data'],
		'user-list',
		userFormData,
		{
			staleTime: 60 * 1000,
			enabled: !listLogsHasData,
		}
	);

	useEffect(() => {
		if (!userResp || !userSuccess) return;
		const payload = userResp?.data ?? userResp;

		if (payload?.sEcho == 1) {
			setUserFilterList(
				payload?.aaData?.map((item) => ({
					item_id: item?.increment_id,
					item_name: item.user_name,
					user_id: item?.user_id,
				})) || []
			);
		}
	}, [userResp, userSuccess]);

	// Search debounce
	const handleSearch = (e) => {
		const query = e?.target?.value;
		setOverlayLoader(true);
		setPageIndex(0);
		setSearchText(query);
	};

	useEffect(() => {
		const handler = setTimeout(() => setDebouncedSearch(searchText), 500);
		return () => clearTimeout(handler);
	}, [searchText]);

	const columns = useMemo(
		() => [
			{
				id: 'sr',
				header: 'Id',
				enableSorting: false,
				meta: { alignMent: 'left' },
				size: 80,
				cell: ({ row }) => <div className='custom-column'>{pageIndex * PAGE_SIZE + row.index + 1}</div>,
			},
			{
				id: 'user_name',
				accessorKey: 'user_name',
				header: 'User',
				enableSorting: true,
				meta: { isDynamic: true, alignMent: 'left' },
				size: window.innerWidth > 1400 ? 250 : window.innerWidth > 576 ? 180 : 140,
				cell: ({ row }) => <div className='custom-column'>{row.original?.user_name}</div>,
			},
			{
				id: 'log_text',
				accessorKey: 'log_text',
				header: 'Log',
				enableSorting: true,
				meta: { isDynamic: true, alignMent: 'left' },
				size: 450,
				cell: ({ row }) => {
					const r = row.original;
					const imgURL = import.meta.env.VITE_IMAGE_BASE_URL + r?.attempted_user_image;

					return (
						<div className='custom-column log_user_image'>
							{r?.attempted_user_image && (
								<img
									src={imgURL}
									alt='user'
									onClick={(e) => {
										e.stopPropagation();
										setFullImageUrl(imgURL);
									}}
								/>
							)}
							<span>{r?.log_text}</span>
						</div>
					);
				},
			},
			{
				id: 'user_agent',
				accessorKey: 'user_agent',
				header: 'User Agent',
				enableSorting: true,
				meta: { isDynamic: true, alignMent: 'left' },
				size: 350,
				cell: ({ row }) => <div className='custom-column'>{row.original?.user_agent}</div>,
			},
			{
				id: 'log_created_at',
				accessorKey: 'log_created_at',
				header: 'Datetime',
				enableSorting: true,
				meta: { isDynamic: true, alignMent: 'left' },
				size: window.innerWidth > 1400 ? 300 : 220,
				cell: ({ row }) => {
					const finalDate = moment(row.original?.log_created_at).format('DD-MM-YYYY HH:mm:ss A');
					return <div className='custom-column'>{finalDate}</div>;
				},
			},
			{
				id: 'log_extra_data',
				header: 'Extra',
				enableSorting: false,
				size: 120,
				cell: ({ row }) => (
					<button
						className='log_details_btn'
						onClick={(e) => {
							e.stopPropagation();
							setModalInfo(row.original);
							setIsLogModal(true);
						}}
					>
						Details
					</button>
				),
			},
		],
		[pageIndex]
	);

	const showMainLoader = mainLoader && !isPlaceholderData && isFetching;
	const showOverlayLoader = overlayLoader || (isPlaceholderData && isFetching);

	return (
		<div className={`right-box-wrap`}>
			<div className='table-box-wrap main-box-wrapper pdglr24 report-table-box error_table_box'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='popup-full-wrapper reports-popup-box active'>
						<div className='filter_search_bar'>
							<div className='action-bar-container'>
								<div className='middle-section'>
									<div className='filter-bar-wrap'>
										<div className={`filter-box logs_filter_box`}>
											<GeneralDataFilter
												uniqueIdentifier={'logs_user'}
												filterName='Users'
												filterPopupData={userFilterList}
												finalSelectData={selectedUser}
												setFinalSelectData={setSelectedUser}
												fetchFlag={isFetched}
												setFetchFlag={(v) => {
													setOverlayLoader(true);
													setPageIndex(0);
													setIsFetched(v);
												}}
												setIsLoaderVisible={(v) => setOverlayLoader(v)}
											/>
										</div>
									</div>
								</div>
							</div>

							<div className='segment-country-box'>
								<div className='segment-search'>
									<MdSearch className='search-icon' />
									<input
										className='input search-btn-input focus-border'
										onChange={handleSearch}
										placeholder='Search'
										autoComplete='off'
									/>
								</div>
							</div>
						</div>

						<div className='popup-full-box form-box-wrap form-wizard'>
							<div className={`popup-box-wrapper report-table-popup-box `}>
								<div className={`box-wrapper table-container `} style={{ zIndex: '8' }}>
									{showOverlayLoader && (
										<div className='shimmer-spinner overlay-spinner'>
											<Spinner animation='border' variant='secondary' />
										</div>
									)}

									{showMainLoader ? (
										<div className='shimmer-spinner'>
											<Spinner animation='border' variant='secondary' />
										</div>
									) : (
										<GeneralTanStackTable
											data={logData}
											columns={columns}
											className={'custom_log_table basic_tan_stack_table'}
											variant='normal'
											rowHeight={45}
											height={window.innerWidth > 1400 ? 45 * 18 : 45 * 16}
											stickyColumns={0}
											enableResize={false}
											enableSorting
											sorting={{
												type: 'server',
												state: sorting,
												onChange: (updater) => {
													const next = typeof updater === 'function' ? updater(sorting) : updater;
													const first = next?.[0];

													const nextSorting = first ? [first] : [];
													setSorting(nextSorting);

													if (first?.id) {
														setColumnName(first.id);
														setColumnOrder(first.desc ? 'DESC' : 'ASC');
													} else {
														setColumnName('');
														setColumnOrder('');
													}

													setOverlayLoader(true);
													setPageIndex(0);
													setIsFetched((v) => !v);
												},
											}}
											pagination={{
												type: 'server',
												pageIndex,
												pageSize: PAGE_SIZE,
												pageCount,
												onPageChange: (nextIndex) => {
													setOverlayLoader(true);
													setPageIndex(nextIndex);
												},
											}}
										/>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<LogModal show={isLogModal} onHide={() => setIsLogModal(false)} modalInfo={modalInfo} />

			{fullImageUrl && (
				<div className='full-image-overlay' onClick={() => setFullImageUrl(null)}>
					<img
						src={fullImageUrl}
						alt='Full view'
						className='full-image-modal-img'
						onClick={(e) => e.stopPropagation()}
					/>
					<button className='full-image-modal-close' onClick={() => setFullImageUrl(null)}>
						&times;
					</button>
				</div>
			)}
		</div>
	);
};

export default LogTableBox;
