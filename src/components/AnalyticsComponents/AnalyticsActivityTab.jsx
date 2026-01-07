/** @format */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Spinner } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import useApi from '../../hooks/useApi';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import useGeneratePagination from '../../hooks/useGeneratePagination';
import TableSortArrow from '../AnalyticsComponents/TableSortArrow';
import CustomPaginationComponent from '../CustomPaginationComponent';
import CustomNoDataComponent from '../DataTableComponents/CustomNoDataComponent';
import { MdSearch } from 'react-icons/md';
import AppInfoBox from '../GeneralComponents/AccountPageAppBox';
import Select from 'react-select';
import GeneralAppFilter from '../GeneralFilters/GeneralAppFilter';
import GeneralDataFilter from '../GeneralFilters/GeneralDataFilter';
import useFilterOrder from '../../hooks/useFilterOrder';
import { useAppList } from '../../context/AppListContext';

const AnalyticsActivityTab = () => {
	const [mainData, setMainData] = useState([]);
	const [mainLoader, setMainLoader] = useState(true);
	const [columnName, setColumnName] = useState('');
	const [columnOrder, setColumnOrder] = useState('');
	const [overlayLoader, setOverlayLoader] = useState(false);
	const [isFetched, setIsFetched] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);
	const [pageLength] = useState(100);
	const [totalPages, setTotalPages] = useState(3);
	const [paginationList, setPaginationList] = useState([]);

	//alias
	const [aliasList, setAliasList] = useState([]);
	const [addAliasRow, setAddAliasRow] = useState(null);
	const [newAlias, setNewAlias] = useState('');
	const [isAliasAdded, setIsAliasAdded] = useState(false);
	const [isAliasUpdate, setIsAliasUpdate] = useState(false);
	const [doubleClickedRow, setDoubleClickedRow] = useState(null);
	const selectRef = useRef(null);

	//filter
	const [selectedActivity, setSelectedActivity] = useState(() => {
		const stored = sessionStorage.getItem('activity_activity_filter');
		return stored ? JSON.parse(stored) : [];
	});
	const [selectedApp, setSelectedApp] = useState(() => {
		const stored = sessionStorage.getItem('activity_app_filter');
		return stored ? JSON.parse(stored) : [];
	});
	const [activityFilterList, setActivityFilterList] = useState([]);
	const userId = localStorage.getItem('id');
	const userToken = localStorage.getItem('token');

	const { campaignFilter } = useAppList();
	const appFilterList = campaignFilter?.list_apps;

	// search + request builder
	const [searchText, setSearchText] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');

	const finalApp = selectedApp?.map((item) => item?.app_auto_id);
	const finalActivity = selectedActivity?.map((item) => item?.item_name);

	const buildFormData = (overrides = {}) => {
		const fd = new FormData();
		fd.append('user_id', userId);
		fd.append('user_token', userToken);
		fd.append('start', pageLength * (pageNumber - 1));
		fd.append('length', pageLength);
		if (finalApp?.length > 0) fd.append('app_auto_id', finalApp.join(','));
		if (finalActivity?.length > 0) fd.append('activity_name', finalActivity.join(','));
		if (columnName.length > 0) fd.append('sort_column', columnName);
		if (columnOrder.length > 0) fd.append('sort_by', columnOrder);
		if (overrides.sSearch) fd.append('sSearch', overrides.sSearch);
		return fd;
	};

	const queryFormData = useMemo(() => {
		const s = debouncedSearch && debouncedSearch.length > 0 ? debouncedSearch : undefined;
		return buildFormData({ sSearch: s });
	}, [
		pageLength,
		pageNumber,
		finalApp?.join(','),
		finalActivity?.join(','),
		columnName,
		columnOrder,
		debouncedSearch,
	]);

	// Use tanstack query for listing activity
	const { data: apiResponse, isSuccess: apiSuccess } = useQueryFetch(
		[
			'property-activity',
			finalActivity,
			isFetched,
			pageNumber,
			isAliasUpdate,
			isAliasAdded,
			debouncedSearch,
		],
		'list-property-activity',
		queryFormData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: !!campaignFilter,
		}
	);

	useEffect(() => {
		if (!apiResponse || !apiSuccess) return;
		if (apiResponse?.sEcho == 1) {
			setMainData(apiResponse?.aaData);
			setTotalPages(+apiResponse?.iTotalRecords / pageLength);
			setMainLoader(false);
			setOverlayLoader(false);
		}
	}, [apiResponse, apiSuccess]);

	//alias
	const aliasFormData = new FormData();
	aliasFormData.append('user_id', userId);
	aliasFormData.append('user_token', userToken);

	const { data: aliasResponse, isSuccess: aliasSuccess } = useQueryFetch(
		['alias-list', isAliasAdded],
		'get-activity-alias',
		aliasFormData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
		}
	);

	useEffect(() => {
		if (!aliasResponse && !aliasSuccess) return;
		if (aliasResponse?.status_code == 1) {
			setAliasList(aliasResponse?.info);
			setActivityFilterList(() => {
				return aliasResponse?.info.map((item, index) => {
					return {
						item_id: index + 1,
						item_name: item.activity_alias,
						activity_name: item?.activity_name,
					};
				});
			});
		}
	}, [aliasResponse]);

	const handleAddAlias = async (app, alias) => {
		setOverlayLoader(true);
		const updateAliasFormData = new FormData();
		updateAliasFormData.append('user_id', userId);
		updateAliasFormData.append('user_token', userToken);
		updateAliasFormData.append('activity_auto_id', app?.activity_auto_id);
		updateAliasFormData.append('activity_alias', alias);
		const response = await useApi('update-property-alias', updateAliasFormData);
		if (response?.data?.status_code == 1) {
			setIsAliasAdded(!isAliasAdded);
			setDoubleClickedRow(null);
			setAddAliasRow(null);
			setNewAlias('');
		}
	};

	const handleUpdateAlias = async (alias) => {
		setOverlayLoader(true);
		const updateAliasFormData = new FormData();
		updateAliasFormData.append('user_id', userId);
		updateAliasFormData.append('user_token', userToken);
		updateAliasFormData.append('activity_auto_id', alias?.activity_auto_id);
		updateAliasFormData.append('activity_alias', alias?.label);
		const response = await useApi('update-property-alias', updateAliasFormData);
		if (response?.data?.status_code == 1) {
			setIsAliasUpdate(!isAliasUpdate);
			setNewAlias('');
			setDoubleClickedRow(null);
			setAddAliasRow(null);
		}
	};

	const handleDoubleClick = (app) => {
		setDoubleClickedRow(`${app.increment_id}-${app.activity_auto_id}`);
	};

	useEffect(() => {
		function handleClickOutside(event) {
			if (selectRef.current && !selectRef.current.contains(event.target)) {
				setDoubleClickedRow(null);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const [columns, setColumns] = useState([
		{
			name: 'Id',
			selector: (row) => row['id'],
			width: '80px',
			sortable: false,
			cell: (row, index) => <div className='custom-column'>{row?.increment_id}</div>,
		},
		{
			name: 'Apps',
			selector: (row) => row['app_display_name'],
			sortable: true,
			cell: (app) => (
				<>
					<AppInfoBox
						app_auto_id={app?.app_auto_id}
						app_icon={app?.app_icon}
						app_platform={app?.app_platform}
						app_display_name={app?.app_display_name}
						app_console_name={app?.app_console_name}
						app_store_id={app?.app_store_id}
					/>
				</>
			),
			sortValue: 'app_display_name',
			minWidth: '200px',
		},
		{
			name: 'Activity Name',
			selector: (row) => row['activity_name'],
			sortable: true,
			cell: (row) => {
				return <div className='custom-column'>{row?.activity_name}</div>;
			},
			sortValue: 'activity_name',
			minWidth: '150px',
		},
		{
			name: 'Activity Alias',
			selector: (row) => row['activity_alias'],
			sortable: true,
			cell: () => null,
			sortValue: 'activity_alias',
			minWidth: '250px',
		},
	]);

	useEffect(() => {
		setColumns((columns) =>
			columns.map((column) => {
				if (column?.sortValue === 'activity_alias') {
					return {
						...column,
						cell: (app) => {
							const aliasOptions = [
								{ value: '__add__', label: 'Add Alias' },
								...(aliasList?.map((item, index) => ({
									value: index + 1,
									label: item?.activity_alias,
									activity_auto_id: app.activity_auto_id,
								})) || []),
							];

							const totalRows = mainData?.length || 0;
							const currentIndex = mainData?.findIndex((r) => r.activity_auto_id === app.activity_auto_id);
							const isLast4Rows = totalRows >= 6 && totalRows - currentIndex <= 6;

							if (
								app?.activity_alias &&
								doubleClickedRow !== `${app.increment_id}-${app.activity_auto_id}`
							) {
								return <div onDoubleClick={() => handleDoubleClick(app)}>{app?.activity_alias}</div>;
							} else if (addAliasRow === app.activity_auto_id) {
								return (
									<form
										onSubmit={(e) => {
											e.preventDefault();
											if (newAlias.trim().length > 0) {
												handleAddAlias(app, newAlias.trim());
											}
										}}
									>
										<input
											autoFocus
											type='text'
											value={newAlias}
											placeholder='Enter new alias'
											onChange={(e) => setNewAlias(e.target.value)}
											onBlur={() => setTimeout(() => setAddAliasRow(null), 300)}
											onKeyDown={(e) => {
												if (e.key === 'Escape') setAddAliasRow(null);
											}}
										/>
										<button type='submit' disabled={newAlias.trim().length === 0}>
											Add
										</button>
									</form>
								);
							} else {
								return (
									<div ref={selectRef}>
										<Select
											name='activityAliasOptions'
											classNamePrefix='country_prefix'
											placeholder='Select Alias'
											value={
												app.activity_alias ? { value: app.activity_auto_id, label: app.activity_alias } : null
											}
											options={aliasOptions}
											onChange={(option) => {
												if (option.value === '__add__') {
													setAddAliasRow(app.activity_auto_id);
												} else {
													handleUpdateAlias(option);
												}
											}}
											menuPlacement={isLast4Rows ? 'top' : 'bottom'}
											menuPosition='absolute'
											menuShouldScrollIntoView={false}
											menuIsOpen={true}
										/>
									</div>
								);
							}
						},
					};
				}
				return column;
			})
		);
	}, [mainData, aliasList, addAliasRow, newAlias, doubleClickedRow]);

	//Sort Function
	const customSort = (column, sortDirection) => {
		let columnName = String(column?.sortValue);
		setColumnName(columnName);
		setColumnOrder(sortDirection === 'asc' ? 'ASC' : 'DESC');
		setIsFetched(!isFetched);
		setOverlayLoader(true);
	};

	//pagination
	useEffect(() => {
		const paginationLinks = useGeneratePagination(Math.ceil(totalPages));
		setPaginationList(paginationLinks);
	}, [totalPages]);

	//search: debounce via state+effect
	const timeoutRef = useRef(null);
	const handleSearch = (e) => {
		const query = e?.target?.value;
		setOverlayLoader(true);
		setPageNumber(1);
		setSearchText(query);
	};

	useEffect(() => {
		const handler = setTimeout(() => setDebouncedSearch(searchText), 500);
		return () => clearTimeout(handler);
	}, [searchText]);

	// Filter order
	const allFilterNames = ['AppFilter', 'GeneralActivity'];
	const filterStates = {
		AppFilter: !!selectedApp?.length,
		GeneralActivity: !!selectedActivity?.length,
	};

	const renderComponent = (componentName) => {
		switch (componentName) {
			case 'AppFilter':
				return (
					<GeneralAppFilter
						uniqueIdentifier={'activity'}
						filterAppList={appFilterList}
						selectedApp={selectedApp}
						setSelectedApp={setSelectedApp}
						fetchFlags={isFetched}
						setFetchFlags={setIsFetched}
						setIsTableLoaderVisible={setOverlayLoader}
						setPageNumber={setPageNumber}
					/>
				);
			case 'GeneralActivity':
				return (
					<GeneralDataFilter
						uniqueIdentifier={'activity_activity'}
						filterName='Activity'
						filterPopupData={activityFilterList}
						finalSelectData={selectedActivity}
						setFinalSelectData={setSelectedActivity}
						fetchFlag={isFetched}
						setFetchFlag={setIsFetched}
						setIsLoaderVisible={setOverlayLoader}
					/>
				);
			default:
				return null;
		}
	};
	const renderedComponents = useFilterOrder({
		allFilterNames,
		filterStates,
		renderComponent,
	});

	return (
		<div className={`right-box-wrap`}>
			<div className='table-box-wrap main-box-wrapper pdglr24 report-table-box error_table_box activity_table_box'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='popup-full-wrapper reports-popup-box active'>
						<div className='filter_search_bar'>
							<div className='action-bar-container'>
								<div className='middle-section'>
									<div className='filter-bar-wrap'>
										<div className={`filter-box logs_filter_box`}>{renderedComponents}</div>
									</div>
								</div>
							</div>
							<div className='segment-country-box'>
								<div className='segment-search'>
									<MdSearch className='search-icon' />
									<input
										className='input search-btn-input focus-border'
										onChange={(e) => handleSearch(e)}
										placeholder='Search'
										autoComplete='off'
									/>
								</div>
							</div>
						</div>
						<div className='popup-full-box form-box-wrap form-wizard'>
							<div className={`popup-box-wrapper report-table-popup-box `}>
								<div className={`box-wrapper table-container `} style={{ zIndex: '8' }}>
									{overlayLoader && (
										<div className='shimmer-spinner overlay-spinner'>
											<Spinner animation='border' variant='secondary' />
										</div>
									)}
									{mainLoader ? (
										<div className='shimmer-spinner'>
											<Spinner animation='border' variant='secondary' />
										</div>
									) : (
										<DataTable
											columns={columns}
											data={mainData}
											className={'custom_log_table custom_activity_tab general_class'}
											onSort={customSort}
											sortServer
											sortIcon={<TableSortArrow />}
											fixedHeader
											fixedHeaderScrollHeight={window.innerWidth > 1400 ? '71.5vh' : '63vh'}
											pagination
											paginationServer
											paginationComponent={() => (
												<CustomPaginationComponent
													pageNumber={pageNumber}
													paginationList={paginationList}
													setPageNumber={setPageNumber}
													setIsLoaderVisible={setOverlayLoader}
												/>
											)}
											noDataComponent={<CustomNoDataComponent />}
											highlightOnHover
										/>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AnalyticsActivityTab;
