/** @format */

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { DataContext } from '../../context/DataContext';
import useUserApi from '../../hooks/useUserApi';
import Footer from '../Footer';
import Spinner from 'react-bootstrap/Spinner';
import useGeneratePagination from '../../hooks/useGeneratePagination';
import CustomPaginationComponent from '../CustomPaginationComponent';
import CustomLoadingIndicator from '../DataTableComponents/CustomLoadingIndicator';
import CustomNoDataComponent from '../DataTableComponents/CustomNoDataComponent';
import DataTable from 'react-data-table-component';
import Profile from '../../assets/images/profile.png';
import { ReactComponent as TableSortArrow } from '../../assets/images/arrow-dwon.svg';
import AddAccount from './AnalyticsAccPopups/AddAccount';
import EditAccount from './AnalyticsAccPopups/EditAccount';
import AnalyticsStatus from './AnalyticsAccPopups/AnalyticsStatus';
import { MdSearch } from 'react-icons/md';
import { customDateCell } from '../../utils/helper';
import { ReportContext } from '../../context/ReportContext';
import { useQueryFetch } from '../../hooks/useQueryFetch';

const AnalyticsAccount = () => {
	const { addUserFlag, setAddUserFlag, setEditUserData } = useContext(DataContext);
	const { statusData } = useContext(ReportContext);

	const [accountList, setAccountList] = useState([]);
	const [searchText, setSearchText] = useState('');

	const [usersPageNumber, setUsersPageNumber] = useState(1);
	const [usersPageLength, setUsersPageLength] = useState(100);
	const [usersTotalPages, setUsersTotalPages] = useState('');
	const [usersPaginationList, setUsersPaginationList] = useState([]);

	const [usersOrder, setUsersOrder] = useState('');
	const [usersColumnName, setUsersColumnName] = useState('');

	const [addModalShow, setAddModalShow] = useState(false);
	const [updateModalShow, setUpdateModalShow] = useState(false);
	const [accessModalShow, setAccessModalShow] = useState(false);
	const [selectDisable, setSelectDisable] = useState(false);
	const [isUserLoaderVisible, setIsUserLoaderVisible] = useState(false);
	const [isSwitchBox, setIsSwitchBox] = useState({});
	// const [isSwitchBox, setIsSwitchBox] = useState({ key: '', value: '' });

	const [debouncedSearch, setDebouncedSearch] = useState('');

	const formData = useMemo(() => {
		const fd = new FormData();
		fd.append('user_id', localStorage.getItem('id'));
		fd.append('user_token', localStorage.getItem('token'));
		fd.append('start', usersPageLength * (usersPageNumber - 1));
		fd.append('length', usersPageLength);
		if (usersColumnName?.length > 0) {
			fd.append('sort_column', usersColumnName);
		}
		if (usersOrder?.length > 0) {
			fd.append('sort_by', usersOrder);
		}
		if (statusData?.length > 0 && statusData?.find((i) => i.status_id !== 0 && i.status_id !== '0')) {
			fd.append('aa_status', statusData?.[0]?.value);
		}
		if (debouncedSearch && debouncedSearch.length >= 2) {
			fd.append('sSearch', debouncedSearch);
		}
		return fd;
	}, [usersPageLength, usersPageNumber, usersColumnName, usersOrder, debouncedSearch, statusData]);

	//Sort Function
	const customSort = (column, sortDirection) => {
		setIsUserLoaderVisible(true);
		let columnName = String(column?.sortValue);
		setUsersColumnName(columnName);
		setUsersOrder(sortDirection.toUpperCase());
		setAddUserFlag(!addUserFlag);
	};
	//list function

	const { data: apiResponse, isSuccess: apiSuccess } = useQueryFetch(
		['analytics-account-table', addUserFlag, usersPageNumber, debouncedSearch, statusData],
		'list-analytics-account',
		formData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: debouncedSearch.length === 0 || debouncedSearch.length >= 2,
		}
	);
	useEffect(() => {
		if (!apiResponse || !apiSuccess) return;
		if (apiResponse?.sEcho === 1) {
			setAccountList(apiResponse);
			setUsersTotalPages(apiResponse.iTotalRecords / usersPageLength);
			setIsUserLoaderVisible(false);
		}
	}, [apiResponse, apiSuccess]);

	// Removed manual fetchData — switching to `useQueryFetch` (tanstack) with debounced search below.

	//status update function
	const statusFormData = new FormData();
	statusFormData.append('user_id', localStorage.getItem('id'));
	statusFormData.append('user_token', localStorage.getItem('token'));
	const accountStatusUpdate = async () => {
		try {
			await useUserApi('update-account-status', statusFormData);
		} catch (error) {
			throw new Error(error);
		}
	};

	const debounce = (func, delay) => {
		let timeoutId;
		return function (...args) {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => func.apply(this, args), delay);
		};
	};

	//function to update status in accountlist state
	function updateStatusInData(data, aa_auto_id, new_status) {
		const updatedAaData = data.aaData.map((item) => {
			if (item.aa_auto_id === aa_auto_id) {
				return {
					...item,
					aa_status: new_status,
				};
			}
			return item;
		});
		return {
			...data,
			aaData: updatedAaData,
		};
	}
	const handleChangeSwitch = (status, aa_auto_id, isChecked) => {
		isChecked;
		const updatedStatus = status === '1' ? '0' : '1';
		setIsSwitchBox((prevStatuses) => ({
			...prevStatuses,
			[aa_auto_id]: updatedStatus,
		}));
		statusFormData.append('aa_auto_id', aa_auto_id);
		statusFormData.append('aa_status', updatedStatus);
		const updatedData = updateStatusInData(accountList, aa_auto_id, updatedStatus);
		setAccountList(updatedData);
		accountStatusUpdate();
	};
	const debouncedHandleChangeSwitch = debounce(handleChangeSwitch, 100);

	useEffect(() => {
		const handler = setTimeout(() => setDebouncedSearch(searchText), 500);
		return () => clearTimeout(handler);
	}, [searchText]);

	const columns = [
		{
			name: 'Id',
			selector: (row) => row['increment_id'],
			width: '90px',
			sortable: false,
		},
		{
			name: 'Account Name',
			selector: (row) => row['aa_name'],
			sortValue: 'aa_name',
			sortable: true,
			style: {
				minWidth: '250px',
			},
		},
		{
			name: 'Account Id',
			selector: (row) => row['aa_id'],
			sortValue: 'aa_id',
			sortable: true,
			style: {
				minWidth: '90px',
			},
		},
		{
			name: 'Created At',
			width: '160px',
			selector: (row) => row['aa_created_at'],
			sortValue: 'aa_created_at',
			sortable: true,
			style: {
				minWidth: '160px',
				justifyContent: 'center',
			},
			cell: (app) => {
				const dateTimeString = app?.aa_created_at ? app?.aa_created_at : '';
				const [date, time] = dateTimeString.split(' ');
				let formattedDate;
				if (date) {
					formattedDate = customDateCell(date);
				}
				return (
					<>
						<div style={{ textAlign: 'center' }} title={app?.aa_created_at ? app?.aa_created_at : ''}>
							{formattedDate ? formattedDate : '-'}
						</div>
					</>
				);
			},
			id: 'analytics-account-created',
		},
		{
			name: 'Updated At',
			selector: (row) => row['aa_updated_at'],
			width: '160px',
			sortValue: 'aa_updated_at',
			sortable: true,
			style: {
				minWidth: '160px',
				justifyContent: 'center',
			},
			cell: (app) => {
				const dateTimeString = app?.aa_updated_at ? app?.aa_updated_at : '';
				const [date, time] = dateTimeString.split(' ');
				let formattedDate;
				if (date) {
					formattedDate = customDateCell(date);
				}
				return (
					<>
						<div style={{ textAlign: 'center' }} title={app?.aa_updated_at ? app?.aa_updated_at : ''}>
							{formattedDate ? formattedDate : '-'}
						</div>
					</>
				);
			},
			id: 'analytics-account-updated',
		},
		{
			name: 'Action',
			width: '100px',
			style: {
				minWidth: '100px',
				justifyContent: 'center',
			},
			cell: (app) => {
				const isChecked = isSwitchBox[app.aa_auto_id]
					? isSwitchBox[app.aa_auto_id] === '1'
						? true
						: false
					: app.aa_status === '1';

				return (
					<div className='switch toggle-icon' htmlFor='checkbox'>
						<input
							type='checkbox'
							value={isChecked}
							onChange={() => debouncedHandleChangeSwitch(app?.aa_status, app?.aa_auto_id, isChecked)}
							checked={isChecked}
						/>
						<div
							className='slider round'
							onClick={() => debouncedHandleChangeSwitch(app?.aa_status, app?.aa_auto_id, isChecked)}
						></div>
					</div>
				);
			},
			id: 'analytics-account-action',
		},
	];
	//Edit
	const handleEdit = async (uniqueId) => {
		if (document.selection && document.selection.empty) {
			document.selection.empty();
		} else if (window.getSelection) {
			var sel = window.getSelection();
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

	const handleSearch = (e) => {
		setSearchText(e?.target?.value);
	};
	//pagination
	useEffect(() => {
		const paginationLinks = useGeneratePagination(usersTotalPages);
		setUsersPaginationList(paginationLinks);
	}, [usersTotalPages]);

	return (
		<div className={`right-box-wrap analytics-account-main`}>
			<div className='table-box-wrap main-box-wrapper'>
				<div className='userBoxWrap user-section-wrapper user-tab analytics-section-wrapper'>
					<div className='popup-full-wrapper reports-popup-box active analytics-page-topbar'>
						<div className='account-top-flex'>
							<div className='action-bar-container' style={{ marginBottom: '12px' }}>
								<div className='middle-section'>
									<div className='filter-bar-wrap'>
										<div className={`filter-box analytics-filter-box`}>
											<AnalyticsStatus setIsReportLoaderVisible={setIsUserLoaderVisible} />
										</div>
									</div>
								</div>
							</div>
							<div className='button-top-wrap segment-country-box'>
								<div className='segment-search'>
									<MdSearch className='search-icon' />
									<input
										className='input search-btn-input focus-border'
										id='searchInput2'
										onChange={(e) => handleSearch(e)}
										placeholder='Search'
										autoComplete='off'
									/>
								</div>
							</div>
						</div>
						{accountList?.aaData?.length === undefined ? (
							<div className='shimmer-spinner'>
								<Spinner animation='border' variant='secondary' />
							</div>
						) : (
							<>
								<div className='table-container ad-units-box user-table-box analytics-account-table'>
									{isUserLoaderVisible && (
										<div className='shimmer-spinner overlay-spinner'>
											<Spinner animation='border' variant='secondary' />
										</div>
									)}
									<DataTable
										columns={columns}
										data={accountList?.aaData}
										className={selectDisable ? 'settings-table-wrap  disable-select' : 'settings-table-wrap '}
										pagination
										paginationPerPage={100}
										fixedHeader
										fixedHeaderScrollHeight={
											window?.innerWidth < 480 ? '58.6vh !important' : '64.6vh !important'
										}
										paginationServer
										progressPending={false}
										paginationComponent={() => (
											<CustomPaginationComponent
												pageNumber={usersPageNumber}
												paginationList={usersPaginationList}
												setPageNumber={setUsersPageNumber}
												setIsLoaderVisible={setIsUserLoaderVisible}
											/>
										)}
										// progressComponent={<CustomLoadingIndicator />}
										noDataComponent={<CustomNoDataComponent />}
										onSort={customSort}
										sortServer
										sortIcon={<TableSortArrow />}
										highlightOnHover
									/>
								</div>
							</>
						)}
					</div>
				</div>
				<Footer />
			</div>
			<AddAccount show={addModalShow} onHide={() => setAddModalShow(false)} />
			<EditAccount show={updateModalShow} onHide={() => setUpdateModalShow(false)} />
		</div>
	);
};

export default AnalyticsAccount;
