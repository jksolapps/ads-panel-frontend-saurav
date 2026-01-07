/** @format */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Spinner } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { MdSearch } from 'react-icons/md';
import useAppsApi from '../../hooks/useAppsApi';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import CustomAnalyticsPagination from '../CustomAnalyticsPagination';
import CustomNoDataComponent from '../DataTableComponents/CustomNoDataComponent';
import TableSortArrow from './TableSortArrow';
import { all_countries } from '../../utils/report_filter.json';
import useGeneratePagination from '../../hooks/useGeneratePagination';
import CustomPaginationComponent from '../CustomPaginationComponent';
import Select from 'react-select';
import { useFormik } from 'formik';
import { ReactComponent as AppsRemoveIcon } from '../../assets/images/apps-remove-icon.svg';
import GeneralCountry from '../GeneralFilters/GeneralCountry';

const AnalyticsCampaign = () => {
	const [analyticsCampaign, setAnalyticsCampaign] = useState([]);
	const [initialAPIData, setInitialAPIData] = useState([]);
	const [isLoaderVisible, setIsLoaderVisible] = useState(false);
	const [fetchFlag, setFetchFlag] = useState(false);
	const localCountry = JSON.parse(sessionStorage.getItem('country_tab_filter'));
	const [selectedCountry, setSelectedCountry] = useState(localCountry ? localCountry : []);

	//table
	const [pageNumber, setPageNumber] = useState(1);
	const [pageLength] = useState(100);
	const [totalPages, setTotalPages] = useState(null);
	const [paginationList, setPaginationList] = useState([]);
	const [order, setOrder] = useState('');
	const [columnName, setColumnName] = useState('');
	const [searchText, setSearchText] = useState('');

	//select
	const [doubleClickedRow, setDoubleClickedRow] = useState(null);
	const selectRef = useRef(null);

	//propertyList / form builder
	const user_id = localStorage.getItem('id');
	const user_token = localStorage.getItem('token');

	const [debouncedSearch, setDebouncedSearch] = useState('');

	const finalCountry = selectedCountry?.map((item) => item.alpha2_code).join(',');

	const buildFormData = (overrides = {}) => {
		const fd = new FormData();
		fd.append('user_id', user_id);
		fd.append('user_token', user_token);
		fd.append('start', pageLength * (pageNumber - 1));
		fd.append('length', pageLength);
		if (columnName?.length > 0) {
			fd.append('sort_column', columnName);
		}
		if (order?.length > 0) {
			fd.append('sort_by', order);
		}
		if (finalCountry?.length > 0) {
			fd.append('campaign_country', finalCountry);
		}
		if (overrides.sSearch) {
			fd.append('sSearch', overrides.sSearch);
		}
		if (overrides.campaign_auto_id) {
			fd.append('campaign_auto_id', overrides.campaign_auto_id);
		}
		if (Object.prototype.hasOwnProperty.call(overrides, 'campaign_country')) {
			fd.append('campaign_country', overrides.campaign_country);
		}
		return fd;
	};

	const queryFormData = useMemo(() => {
		const s = debouncedSearch && debouncedSearch.length > 0 ? debouncedSearch : undefined;
		return buildFormData({ sSearch: s });
	}, [pageLength, pageNumber, columnName, order, finalCountry, debouncedSearch]);

	// Use tanstack query via useQueryFetch
	const { data: apiResponse, isSuccess: apiSuccess } = useQueryFetch(
		['analytics-campaign-table', 'group_select', fetchFlag, pageNumber, debouncedSearch],
		'list-analytics-campaign',
		queryFormData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: true,
		}
	);

	useEffect(() => {
		if (!apiResponse || !apiSuccess) return;
		if (apiResponse.sEcho) {
			const mainData = apiResponse?.aaData || [];
			mainData.forEach((campaign) => {
				const countryName = all_countries.find(
					(country) => country.alpha2_code == campaign.campaign_country
				);
				if (campaign.campaign_country == 'ALL') {
					campaign.full_country_name = 'All Country';
				} else {
					campaign.full_country_name = countryName ? countryName?.name : null;
				}
			});
			setAnalyticsCampaign(mainData);
			setInitialAPIData(apiResponse);
			setIsLoaderVisible(false);
			setTotalPages(apiResponse.iTotalRecords / pageLength);
		}
	}, [apiResponse, apiSuccess]);

	//search: debounce via state/effect
	const timeoutRef = useRef(null);
	const handleSearch = (e) => {
		const query = e?.target?.value;
		setIsLoaderVisible(true);
		setPageNumber(1);
		setSearchText(query);
	};

	useEffect(() => {
		const handler = setTimeout(() => setDebouncedSearch(searchText), 500);
		return () => clearTimeout(handler);
	}, [searchText]);

	useEffect(() => {
		const paginationLinks = useGeneratePagination(totalPages);
		setPaginationList(paginationLinks);
	}, [totalPages]);

	//sorting function
	const customSort = (column, sortDirection) => {
		setIsLoaderVisible(true);
		setPageNumber(1);
		let columnName = String(column?.sortValue);
		setColumnName(columnName);
		setOrder(sortDirection.toUpperCase());
		setFetchFlag(!fetchFlag);
	};

	//handle country select
	const [countrySelectOptions, setCountrySelectOptions] = useState([]);

	useEffect(() => {
		const valueMap = all_countries?.map((country) => {
			return {
				value: country?.alpha2_code,
				label: country?.name,
			};
		});
		const isAlreadyAdded = valueMap.some((item) => item.value === 'ALL');
		if (!isAlreadyAdded) {
			valueMap.unshift({
				value: 'ALL',
				label: <div className='remove_icon'>All Country</div>,
			});
		}
		valueMap.unshift({
			value: null,
			label: (
				<div className='remove_icon'>
					<AppsRemoveIcon className='remove-apps-icon' />
					Remove
				</div>
			),
		});
		setCountrySelectOptions(valueMap);
	}, [all_countries]);

	const { values, setFieldValue } = useFormik({
		initialValues: {
			countrySelectOptions: [],
		},
		enableReinitialize: true,
	});

	const [columns, setColumns] = useState([
		{
			name: (
				<div className='report-title custom_sibling_head'>
					<div className='report-header-dimension'>Id</div>
				</div>
			),
			selector: (row) => row.increment_id,
			sortable: false,
			width: '70px',
		},
		{
			name: (
				<div className='report-title custom_sibling_head'>
					<div className='report-header-dimension'>Campaign</div>
				</div>
			),
			selector: (row) => row['campaign_name'],
			cell: (app) => <div>{app?.campaign_name}</div>,
			sortValue: 'campaign_name',
			sortable: true,
			style: {
				minWidth: '250px',
			},
		},
		{
			name: (
				<div className='report-title custom_sibling_head'>
					<div className='report-header-dimension'>Property</div>
				</div>
			),
			selector: (row) => row['campaign_country'],
			cell: (app) => <div>{app?.ap_name}</div>,
			sortValue: 'ap_name',
			sortable: true,
			style: {
				minWidth: '250px',
			},
		},
		{
			name: (
				<div className='report-title custom_sibling_head'>
					<div className='report-header-dimension'>Country</div>
				</div>
			),
			selector: (row) => row['campaign_country'],
			cell: (app) => <div className='custom_country_name'>{app?.full_country_name}</div>,
			sortValue: 'campaign_country',
			sortable: true,
			style: {
				minWidth: '250px',
			},
		},
	]);

	useEffect(() => {
		setColumns((columns) => {
			return columns.map((column) => {
				if (column?.sortValue === 'campaign_country') {
					return {
						...column,
						cell: (app) => {
							const totalRows = analyticsCampaign?.length || 0;
							const currentIndex = analyticsCampaign?.findIndex(
								(r) => r.campaign_auto_id === app.campaign_auto_id
							);
							const isLast4Rows = totalRows >= 6 && totalRows - currentIndex <= 6;

							return app.campaign_country &&
								doubleClickedRow !== `${app.increment_id}-${app.campaign_auto_id}` ? (
								<div className='custom_country_name' onDoubleClick={() => handleDoubleClick(app)}>
									{app?.full_country_name}
								</div>
							) : (
								<div className='input-box react-select analytics_campaign_select_wrap' ref={selectRef}>
									<Select
										className='analytics_campaign_select'
										classNamePrefix='country_prefix'
										name='countrySelectOptions'
										placeholder='Select Country'
										value={
											app.campaign_country
												? { value: app.campaign_country, label: app.full_country_name }
												: null
										}
										options={countrySelectOptions}
										onChange={(option) => handleCountrySelectChange(option, app?.campaign_auto_id)}
										onBlur={handleSelectBlur}
										maxMenuHeight={210}
										menuPlacement={isLast4Rows ? 'top' : 'bottom'}
										menuPosition='absolute'
										styles={{
											option: (provided) => ({ ...provided, color: 'black' }),
										}}
										menuShouldScrollIntoView={false}
										theme={(theme) => ({
											...theme,
											border: 0,
											colors: {
												...theme.colors,
												primary25: '#eee',
												primary: '#e8f0fe',
											},
										})}
									/>
								</div>
							);
						},
					};
				}
				return column;
			});
		});
	}, [countrySelectOptions, doubleClickedRow, analyticsCampaign]);

	const handleCountrySelectChange = async (option, campaignID) => {
		const isBool = option?.label?.props?.children?.[1] === 'Remove';
		let isNotSelected = false;
		const updatedData = analyticsCampaign?.map((data) => {
			if (data?.campaign_auto_id == campaignID) {
				isNotSelected = isBool && data?.campaign_country === null;
				return {
					...data,
					campaign_country: isBool ? null : option?.value,
					full_country_name: isBool ? null : option?.label,
				};
			}
			return data;
		});
		setAnalyticsCampaign(updatedData);

		if (!isNotSelected) {
			setFieldValue('countrySelectOptions', isBool ? null : option);
			const fd = buildFormData({
				campaign_country: isBool ? '' : option?.value,
				campaign_auto_id: campaignID,
			});
			try {
				const response = await useAppsApi('update-campaign-app-new', fd);
				if (response?.status_code == 1) {
					setDoubleClickedRow(null);
				}
			} catch (error) {
				new throwError(error);
			}
		}
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

	const handleSelectBlur = () => {
		setDoubleClickedRow(null);
	};

	const handleDoubleClick = (app) => {
		setDoubleClickedRow(`${app.increment_id}-${app.campaign_auto_id}`);
	};

	return (
		<div className={`right-box-wrap`}>
			<div className='table-box-wrap main-box-wrapper analytics-campaign campaign_tab_table'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='popup-full-wrapper reports-popup-box active analytics-page-topbar'>
						<div className='account-top-flex'>
							<div className='action-bar-container' style={{ marginBottom: '12px' }}>
								<div className='middle-section'>
									<div className='filter-bar-wrap'>
										<div className={`filter-box analytics-filter-box`}>
											<GeneralCountry
												uniqueIdentifier={'campaign_tab'}
												countryValue={selectedCountry}
												setCountryValue={setSelectedCountry}
												fetchFlag={fetchFlag}
												setFetchFlag={setFetchFlag}
												setMainLoader={setIsLoaderVisible}
											/>
										</div>
									</div>
								</div>
							</div>
							<div className='button-top-wrap segment-country-box'>
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
						{/* <div className='button-top-wrap segment-country-box' style={{ margin: '12px 0px' }}>
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
						</div> */}
						<div className='table-container ad-units-box user-table-box analytics-account-table'>
							{isLoaderVisible && (
								<div className='shimmer-spinner overlay-spinner'>
									<Spinner animation='border' variant='secondary' />
								</div>
							)}
							{initialAPIData.sEcho !== 1 ? (
								<div className='shimmer-spinner'>
									<Spinner animation='border' variant='secondary' />
								</div>
							) : (
								<DataTable
									columns={columns}
									data={analyticsCampaign}
									className={`analytics_campaign_table statistics_table revenue_table`}
									pagination
									paginationPerPage={100}
									paginationServer
									paginationComponent={() => (
										<CustomPaginationComponent
											pageNumber={pageNumber}
											paginationList={paginationList}
											setPageNumber={setPageNumber}
											setIsLoaderVisible={setIsLoaderVisible}
										/>
									)}
									noDataComponent={<CustomNoDataComponent />}
									fixedHeader
									fixedHeaderScrollHeight={'68.5vh'}
									sortServer
									onSort={customSort}
									sortIcon={<TableSortArrow />}
									allowColumnReorder={false}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AnalyticsCampaign;
