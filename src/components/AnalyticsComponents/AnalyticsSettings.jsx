/** @format */

import React, { useContext, useEffect, useRef, useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import Footer from '../Footer';
import { DataContext } from '../../context/DataContext';
import useAppsApi from '../../hooks/useAppsApi';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import AnalyticsPropertyApps from '../GeneralComponents/AnalyticsPropertyApps';
import CustomNoDataComponentAccount from '../DataTableComponents/CustomNoDataComponentAccount';
import { Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { useFormik } from 'formik';
import AccountPageAppBox from '../GeneralComponents/AccountPageAppBox';
import { ReportContext } from '../../context/ReportContext';
import AnalyticsErrorModal from './Popups/AnalyticsErrorModal';
import { ReactComponent as TableSortArrow } from '../../assets/images/arrow-dwon.svg';
import { MdSearch } from 'react-icons/md';
import CustomNoDataComponent from '../DataTableComponents/CustomNoDataComponent';
import CustomPaginationComponent from '../CustomPaginationComponent';
import useGeneratePagination from '../../hooks/useGeneratePagination';
import { FaPlus } from 'react-icons/fa6';
import { FaMinus } from 'react-icons/fa6';
import { ReactComponent as AppsRemoveIcon } from '../../assets/images/apps-remove-icon.svg';
import useUserApi from '../../hooks/useUserApi';
import { useAppList } from '../../context/AppListContext';

const AnalyticsSettings = () => {
	const { settingAppList: appList } = useAppList();

	const { addUserFlag, setAddUserFlag } = useContext(DataContext);
	const { popupFlags, setPopupFlags } = useContext(ReportContext);
	const [analyticsData, setAnalyticsData] = useState([]);
	const [fetchDataAnalytics, setFetchdata] = useState([]);
	const [isAnalyticsLoaderVisible, setIsAnalyticsLoaderVisible] = useState(true);
	const [isCampaignLoaderVisible, setIsCampaignLoaderVisible] = useState({});
	const [usersOrder, setUsersOrder] = useState('');
	const [usersColumnName, setUsersColumnName] = useState('');

	const [usersPageNumber, setUsersPageNumber] = useState(1);
	const [usersPageLength, setUsersPageLength] = useState(100);
	const [usersTotalPages, setUsersTotalPages] = useState('');
	const [usersPaginationList, setUsersPaginationList] = useState([]);
	const [campaignData, setCampaignData] = useState({});
	const [currentRow, setCurrentRow] = useState({});

	const [doubleClickedRow, setDoubleClickedRow] = useState(null); // Track edit state
	const selectRef = useRef(null);
	const [unitModal, setUnitModal] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');

	const [searchText, setSearchText] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');

	const buildFormData = (overrides = {}) => {
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
		if (overrides.sSearch) {
			fd.append('sSearch', overrides.sSearch);
		}
		if (overrides.ap_auto_id) {
			fd.append('ap_auto_id', overrides.ap_auto_id);
		}
		if (Object.prototype.hasOwnProperty.call(overrides, 'app_auto_id')) {
			fd.append('app_auto_id', overrides.app_auto_id);
		}
		return fd;
	};

	const queryFormData = useMemo(() => {
		const s = debouncedSearch && debouncedSearch.length >= 2 ? debouncedSearch : undefined;
		return buildFormData({ sSearch: s });
	}, [usersPageLength, usersPageNumber, usersColumnName, usersOrder, debouncedSearch]);

	const [appSelectOptions, setappSelectOptions] = useState({});

	//check
	const [isSwitchBox, setIsSwitchBox] = useState({});

	useEffect(() => {
		const allappslist = appList.aaData;
		if (allappslist?.length > 0) {
			const value = allappslist?.map((options) => {
				return {
					value: [options.app_auto_id, options?.app_display_name],
					label: (
						<AccountPageAppBox
							app_auto_id={options?.app_auto_id}
							app_icon={options?.app_icon}
							app_platform={options?.app_platform}
							app_display_name={options?.app_display_name}
							app_store_id={options?.app_store_id}
							app_console_name={options?.app_console_name}
							className='add-permission'
						/>
					),
				};
			});

			value.unshift({
				value: [null, null],
				label: (
					<div className='permission-app app-item custom-app-box remove-app-option'>
						<AppsRemoveIcon className='remove-apps-icon' />
						Remove
					</div>
				),
			});

			setappSelectOptions(value);
		}
	}, [appList]);

	const { values, setFieldValue } = useFormik({
		initialValues: {
			appSelectOptions: [],
		},
		enableReinitialize: true,
		onSubmit: (values) => {
			// handleUpdatePermissionData(values);
		},
	});

	// Use tanstack query via `useQueryFetch` and debounced search
	const { data: apiResponse, isSuccess: apiSuccess } = useQueryFetch(
		['analytics-property-table', addUserFlag, usersPageNumber, debouncedSearch],
		'list-analytics-property',
		queryFormData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: debouncedSearch.length === 0 || debouncedSearch.length >= 2,
		}
	);

	useEffect(() => {
		if (!apiResponse || !apiSuccess) return;
		if (apiResponse?.sEcho) {
			setAnalyticsData(apiResponse?.aaData);
			setFetchdata(apiResponse);
			setIsAnalyticsLoaderVisible(false);
			setUsersTotalPages(apiResponse.iTotalRecords / usersPageLength);
		}
	}, [apiResponse, apiSuccess]);

	useEffect(() => {
		const paginationLinks = useGeneratePagination(usersTotalPages);
		setUsersPaginationList(paginationLinks);
	}, [usersTotalPages]);

	const [columns, setColumns] = useState([
		{
			name: 'Campaign',
			selector: (row) => row['campaign'],
			cell: (app) => {
				return (
					<>
						<div className='campaign-column'>
							<div>{app?.campaign_id}</div>
							<div>{app?.campaign_name}</div>
						</div>
					</>
				);
			},
		},
		{
			name: 'Property',
			selector: (row) => row['property'],
			cell: (app) => {
				return (
					<>
						<div className='property-column'>
							<div>{app?.ap_id}</div>
							<div>{app?.ap_name}</div>
						</div>
					</>
				);
			},
		},
		{
			name: 'apps',
			cell: (app) => (
				<>
					{app?.ap_app_auto_id ? (
						<AnalyticsPropertyApps
							app_auto_id={app?.ap_app_auto_id}
							app_icon={app?.app_icon}
							app_platform={app?.app_platform}
							app_display_name={app?.app_display_name}
							app_console_name={app?.app_console_name}
							app_store_id={app?.app_store_id}
						/>
					) : (
						<div className='input-box react-select app-select-css add-permission-form-select app-input-css analytics-setting-select'>
							<Select
								className='app-select-css'
								classNamePrefix='app-select-css'
								name='appSelectOptions'
								placeholder={<div className='select-placeholder'>Select Application</div>}
								value={values?.appSelectOptions?.length > 0 ? values?.appSelectOptions : []}
								options={appSelectOptions?.length > 0 ? appSelectOptions : []}
								onChange={(option) => setFieldValue('appSelectOptions', option)}
							/>
						</div>
					)}
				</>
			),
		},
	]);

	const handleAppSelectChange = async (option, id) => {
		const isBool = option?.label?.props?.children?.[1] === 'Remove';
		let isAppNotSelected = false;
		const updatedAnalyticsData = analyticsData?.map((data) => {
			if (data.ap_auto_id === id) {
				isAppNotSelected = isBool && data?.ap_app_auto_id === null;
				return {
					...data,
					ap_app_auto_id: isBool ? null : option?.label?.props?.app_auto_id,
					app_console_name: isBool ? null : option?.label?.props?.app_console_name,
					app_display_name: isBool ? null : option?.label?.props?.app_display_name,
					app_icon: option?.isBool ? null : option?.label?.props?.app_icon,
					app_platform: option?.isBool ? null : option?.label?.props?.app_platform,
					app_store_id: option?.isBool ? null : option?.label?.props?.app_store_id,
				};
			}
			return data;
		});
		setAnalyticsData(updatedAnalyticsData);
		if (!isAppNotSelected) {
			setFieldValue('appSelectOptions', option);
			const fd = buildFormData({
				ap_auto_id: id,
				app_auto_id: isBool ? null : option?.label?.props?.app_auto_id,
			});
			const response = await useAppsApi('update-property-app', fd);
			try {
				if (response?.status_code) {
					setDoubleClickedRow(null);
					// fetchData()
				} else {
					setErrorMsg(response?.message);
					setUnitModal(true);
				}
			} catch (error) {
				new throwError(error);
			}
		}
	};

	const handleDoubleClick = (app) => {
		setDoubleClickedRow(`${app.ap_app_auto_id}-${app.ap_auto_id}`);
	};
	const handleSelectBlur = () => {
		setDoubleClickedRow(null);
	};

	//switch
	const debounce = (func, delay) => {
		let timeoutId;
		return function (...args) {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => func.apply(this, args), delay);
		};
	};

	function updateStatusInData(data, ap_auto_id, new_status) {
		const updatedAaData = data.map((item) => {
			if (item.ap_auto_id === ap_auto_id) {
				return {
					...item,
					ap_status: new_status,
				};
			}
			return item;
		});
		return updatedAaData;
	}

	const handleChangeSwitch = (status, ap_auto_id, isChecked) => {
		const updatedStatus = status == '1' ? '0' : '1';
		setIsSwitchBox((prevStatuses) => ({
			...prevStatuses,
			[ap_auto_id]: updatedStatus,
		}));
		statusFormData.append('ap_auto_id', ap_auto_id);
		statusFormData.append('ap_status', updatedStatus);
		const updatedData = updateStatusInData(analyticsData, ap_auto_id, updatedStatus);
		setAnalyticsData(updatedData);
		accountStatusUpdate();
	};
	const debouncedHandleChangeSwitch = debounce(handleChangeSwitch, 100);

	const statusFormData = new FormData();
	statusFormData.append('user_id', localStorage.getItem('id'));
	statusFormData.append('user_token', localStorage.getItem('token'));
	const accountStatusUpdate = async () => {
		try {
			await useUserApi('update-property-status', statusFormData);
		} catch (error) {
			throw new Error(error);
		}
	};

	useEffect(() => {
		setColumns([
			{
				name: 'Id',
				selector: (row, index) => (usersPageNumber - 1) * usersPageLength + index + 1,
				width: '80px',
			},
			{
				name: 'Property Id',
				selector: (row) => row['ap_id'],
				cell: (app) => (
					<div className='property-column'>
						<div>{app?.ap_id}</div>
					</div>
				),
				width: '150px',
				sortValue: 'ap_id',
				sortable: true,
			},
			{
				name: 'Property',
				selector: (row) => row['property'],
				cell: (app) => (
					<div className='property-column'>
						<div>{app?.ap_name}</div>
					</div>
				),
				style: {
					minWidth: '250px',
				},
				sortValue: 'ap_name',
				sortable: true,
			},
			{
				name: 'Account Name',
				selector: (row) => row['aa_name'],
				cell: (app) => (
					<div className='property-column'>
						<div>{app?.aa_name}</div>
					</div>
				),
				style: {
					minWidth: '150px',
				},
				sortValue: 'aa_name',
				sortable: true,
			},
			{
				name: 'App',
				selector: (row) => row['adcart'],
				cell: (app) => {
					const totalRows = analyticsData?.length || 0;
					const currentIndex = analyticsData?.findIndex((r) => r.ap_auto_id === app.ap_auto_id);
					const isLast4Rows = totalRows >= 6 && totalRows - currentIndex <= 6;

					return (
						<>
							{app?.ap_app_auto_id && doubleClickedRow !== `${app.ap_app_auto_id}-${app.ap_auto_id}` ? (
								<div
									className='anaytics-app'
									onDoubleClick={() => handleDoubleClick(app)}
									style={{
										cursor: 'pointer',
										width: '100%',
									}}
								>
									<AnalyticsPropertyApps
										app_auto_id={app?.ap_app_auto_id}
										app_icon={app?.app_icon}
										app_platform={app?.app_platform}
										app_display_name={app?.app_display_name}
										app_console_name={app?.app_console_name}
										app_store_id={app?.app_store_id}
									/>
								</div>
							) : (
								<div
									className='input-box react-select app-select-css add-permission-form-select app-input-css analytics-setting-select'
									ref={selectRef}
								>
									<Select
										className='app-select-css'
										classNamePrefix='app-select-css analytics-select'
										name='appSelectOptions'
										menuPlacement={isLast4Rows ? 'top' : 'bottom'}
										menuPosition='absolute'
										placeholder={<div className='select-placeholder'>Select Application</div>}
										value={values?.appSelectOptions?.length > 0 ? values?.appSelectOptions : []}
										options={appSelectOptions?.length > 0 ? appSelectOptions : []}
										onChange={(option) => handleAppSelectChange(option, app?.ap_auto_id)}
										onBlur={handleSelectBlur}
										menuShouldScrollIntoView={false}
									/>
								</div>
							)}
						</>
					);
				},
				style: {
					minWidth: '250px',
				},
				sortValue: 'app_display_name',
				sortable: true,
			},
			{
				name: 'Action',
				width: '100px',
				style: {
					minWidth: '100px',
					justifyContent: 'center',
				},
				cell: (app) => {
					const isChecked = isSwitchBox[app.ap_auto_id]
						? isSwitchBox[app.ap_auto_id] === '1'
							? true
							: false
						: app.ap_status === '1';
					return (
						<div className='switch toggle-icon' htmlFor='checkbox'>
							<input type='checkbox' value={isChecked} onChange={() => null} checked={isChecked} />
							<div
								className='slider round'
								onClick={() => debouncedHandleChangeSwitch(app?.ap_status, app?.ap_auto_id, isChecked)}
							></div>
						</div>
					);
				},
				id: 'analytics-account-action',
			},
		]);
	}, [appSelectOptions, values.appSelectOptions, doubleClickedRow, analyticsData]);

	//sorting function
	const customSort = (column, sortDirection) => {
		setIsAnalyticsLoaderVisible(true);
		let columnName = String(column?.sortValue);
		setUsersColumnName(columnName);
		setUsersOrder(sortDirection.toUpperCase());
		setAddUserFlag(!addUserFlag);
	};
	//clear double click
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

	//search: debounce the input and update `debouncedSearch` after 500ms
	useEffect(() => {
		const handler = setTimeout(() => setDebouncedSearch(searchText), 500);
		return () => clearTimeout(handler);
	}, [searchText]);

	const handleSearch = (e) => {
		setSearchText(e?.target?.value);
	};
	const ExpandedComponent = ({ campaignData }) => (
		<pre className='analytics-expandable-property-table'>
			{campaignData?.campaignkey?.[campaignData?.id] === true ? (
				<div className='shimmer-spinner '>
					<Spinner animation='border' variant='secondary' />
				</div>
			) : campaignData?.Data?.length === 0 ? (
				<div className='campaign-no-data'>
					<CustomNoDataComponentAccount />
				</div>
			) : (
				<table className='table table-sm table-nowrap expanded-table'>
					<thead>
						<tr>
							<th scope='col expanded-table-head'>Id</th>
							<th scope='col expanded-table-head'>Campaign Id</th>
							<th scope='col expanded-table-head'>Campaign Name</th>
						</tr>
					</thead>
					<tbody>
						{campaignData?.Data?.map((value, index) => (
							<tr key={index}>
								<td scope='row'>{index + 1}</td>
								<td scope='row'>{value?.campaign_id}</td>
								<td>{value?.campaign_name}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</pre>
	);

	const expandableIcon = {
		collapsed: <FaPlus />,
		expanded: <FaMinus />,
	};

	const appsCampaignApi = async (ap_auto_id) => {
		setIsCampaignLoaderVisible((prevState) => ({ ...prevState, [ap_auto_id]: true }));
		const fd = buildFormData({ ap_auto_id });
		const response = await useAppsApi('campaign-list', fd);
		try {
			if (response.sEcho) {
				setIsCampaignLoaderVisible((prevState) => ({ ...prevState, [ap_auto_id]: false }));
				return response?.aaData;
			}
		} catch (error) {
			setIsCampaignLoaderVisible((prevState) => ({ ...prevState, [ap_auto_id]: false }));
			throw new Error(error);
		}
	};
	useEffect(() => {
		if (currentRow?.boolean && currentRow?.row?.ap_auto_id) {
			const id = currentRow.row.ap_auto_id;
			const storedData = campaignData[id];

			if (!storedData) {
				appsCampaignApi(id)
					.then((data) => setCampaignData({ ...campaignData, [id]: data }))
					.catch((error) => console.error(error));
			}
		}
	}, [currentRow]);

	return (
		<div className={`right-box-wrap`}>
			<div className='table-box-wrap main-box-wrapper anlaytics-campaign property_tab_table '>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='button-top-wrap segment-country-box' style={{ margin: '12px 0px' }}>
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
						{/* <div
                            className="d-content-btn float-right text-transform body-font-btn ml-0"
                            onClick={() => setAddModalShow(true)}
                        >
                            Add
                        </div> */}
					</div>
					{fetchDataAnalytics?.aaData == 0 ? (
						<CustomNoDataComponentAccount />
					) : fetchDataAnalytics?.sEcho !== 1 ? (
						<div className='shimmer-spinner'>
							<Spinner animation='border' variant='secondary' />
						</div>
					) : (
						<>
							<div className='popup-full-box form-box-wrap form-wizard'>
								{isAnalyticsLoaderVisible && (
									<div className='shimmer-spinner overlay-spinner'>
										<Spinner animation='border' variant='secondary' />
									</div>
								)}{' '}
								<div className={`popup-box-wrapper `}>
									<div
										className={`box-wrapper table-container analytics-setting-table ${
											analyticsData?.length < 2 ? 'min-height-condition' : ''
										}`}
									>
										<DataTable
											className='analytics-campaign-rdt'
											columns={columns}
											data={analyticsData}
											pagination
											paginationPerPage={100}
											paginationServer
											paginationComponent={() => (
												<CustomPaginationComponent
													pageNumber={usersPageNumber}
													paginationList={usersPaginationList}
													setPageNumber={setUsersPageNumber}
													setIsLoaderVisible={setIsAnalyticsLoaderVisible}
												/>
											)}
											noDataComponent={<CustomNoDataComponent />}
											fixedHeader
											fixedHeaderScrollHeight={window?.innerWidth < 480 ? '64.6vh' : '68.6vh'}
											sortServer
											onSort={customSort}
											sortIcon={<TableSortArrow />}
											expandableRows
											expandableIcon={expandableIcon}
											expandableRowsComponent={(props) => {
												const id = props?.data?.ap_auto_id;
												const Data = campaignData[id] || [];
												const campaignkey = isCampaignLoaderVisible;
												return <ExpandedComponent campaignData={{ Data, id, campaignkey }} />;
											}}
											onRowExpandToggled={(bool, row) => setCurrentRow({ boolean: bool, row: row })}
										/>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
				<Footer />
			</div>
			<AnalyticsErrorModal show={unitModal} onHide={() => setUnitModal(false)} errormsg={errorMsg} />
		</div>
	);
};

export default AnalyticsSettings;
