/** @format */

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import Footer from '../Footer';
import Spinner from 'react-bootstrap/Spinner';
import DateRangePopup from './Popups/DateRangePopup';
import AppPopup from './Popups/AppPopup';
import CountryPopup from './Popups/CountryPopup';
import FormatPopup from './Popups/FormatPopup';
import AppVersion from './Popups/AppVersion';
import PlatformPopup from './Popups/PlatformPopup';
import { ReportContext } from '../../context/ReportContext';
import 'bootstrap/dist/css/bootstrap.css';
import DataTable from 'react-data-table-component';
import CustomNoDataComponent from '../DataTableComponents/CustomNoDataComponent';
import CustomLoadingIndicator from '../DataTableComponents/CustomLoadingIndicator';
import useGeneratePagination from '../../hooks/useGeneratePagination';
import AdUnitsPopup from './Popups/AdUnitsPopup';
import DimensionBox from './DimensionBox';
import { MdMoreVert } from 'react-icons/md';
import { ReactComponent as TableSortArrow } from '../../assets/images/arrow-dwon.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import MatrixBox from './MatrixBox';
import AccountSelectPopup from './Popups/AccountSelectPopup';
import CustomReportPagination from '../CustomReportPagination';
import { CSVLink } from 'react-csv';
import { FiDownload } from 'react-icons/fi';
import { MdOutlineEdit } from 'react-icons/md';
import debounce from 'lodash/debounce';
import filterUtilsPopupData from '../../utils/report_filter.json';
import $ from 'jquery';
import GroupByFilter from './Popups/GroupByFilter';
import moment from 'moment';
import { indianNumberFormat } from '../../utils/helper';
import { BiGitCompare } from 'react-icons/bi';
import useStickyOnScroll from '../../hooks/useStickyOnScroll';
import { useTableHover } from '../../hooks/useTableHover';
import GeneralTinyAppBox from '../GeneralComponents/GeneralTinyAppBox';
import { useGroupSettings } from '../../context/GroupSettingsContext';
import { useQueryFetch } from '../../hooks/useQueryFetch';

const ReportContentBoxOld = () => {
	const { dateRange, sharedData, sharedMatrixData } = useContext(DataContext);
	const {
		appValue,
		countryValue,
		formatValue,
		platformValue,
		popupFlags,
		setPopupFlags,
		dimensionValue,
		unitValue,
		setAppValue,
		setCountryValue,
		setFormatValue,
		setPlatformValue,
		setUnitValue,
		allMatrixData,
		selectedAccountData,
		setSelectedAccountData,
		appVersionData,
		setappVersionData,
		allAppVersionData,
		setallAppVersionData,
		filteredAppVersionData,
		setfilteredAppVersionData,
		setcheckedAppVersion,
		selectedReportFilter,
		pinToggle,
		toggleRize,
		setToggleResize,
		dynamicDimensionWidth,
		setDynamicDimensionWidth,
		groupByValue,
		setGroupByValue,
	} = useContext(ReportContext);

	const { selectedGroup } = useGroupSettings();
	const [tableNewData, setTableNewData] = useState([]);
	const [mainLoaderVisible, setMainLoaderVisible] = useState(true);
	const [SummaryData, setSummaryData] = useState({});
	const [pageNumber, setPageNumber] = useState(1);
	const [pageLength, setPageLength] = useState(10);
	const [currentUnitPage, setCurrentUnitPage] = useState(1);
	const [totalPages, setTotalPages] = useState('');
	const [paginationList, setPaginationList] = useState([]);
	const [order, setOrder] = useState('');
	const [columnName, setColumnName] = useState('');
	const [totalRecordsData, setTotalRecordsData] = useState([]);
	const [prevTotalRecordsData, setPrevTotalRecordsData] = useState([]);
	const [saveReportShow, setSaveReportShow] = useState(false);
	const [isReportLoaderVisible, setIsReportLoaderVisible] = useState(false);
	const [accountChecked, setAccountChecked] = useState(false);
	const [columnSticky, setColumnSticky] = useState(false);
	const [disable, setDisabled] = useState(false);
	const [appVersion, setAppVersion] = useState(false);
	const [isFilterDataLoaded, setIsFilterDataLoaded] = useState(false);
	const stickyHeaderRefs = useRef([]); // Array to store header cell refs
	const stickyFooterRefs = useRef([]);

	const navigate = useNavigate();
	const reportlocation = useLocation();
	const adUnitVal = reportlocation?.state?.data;
	const app_id = reportlocation?.state?.auto_app_id;
	const ad_id = reportlocation?.state?.admob_app_id;
	const adunitDashboardClick = reportlocation?.state?.click;
	const graphClick = reportlocation?.state?.graph_click;
	const au_id = reportlocation?.state?.au_id;
	const perfermanceDateRange = reportlocation?.state?.date;
	const filterData = reportlocation?.state?.filterData;
	// Report-account-api-calling
	const [filterAccountData, setFilterAccountData] = useState([]);
	const [filterAppData, setFilterAppData] = useState([]);
	const [filterAdUnitData, setFilteAdUnitData] = useState([]);
	const [adUnitId, setAdUnitId] = useState('');
	const [filterPopupData, setFilterPopupData] = useState([]);
	const [countryWiseSorting, setSortingCountryWise] = useState([]);
	const [isAdUnitClick, setIsAdUnitClick] = useState(false);
	const localUnitSwitch = JSON.parse(localStorage.getItem('unit_switch'));

	const [isUnitSwitch, setIsUnitSwitch] = useState(localUnitSwitch ? localUnitSwitch : false);
	const [filteredAppData, setFilteredAppData] = useState([]);
	const [checkedApp, setCheckedApp] = useState([]);
	const [allAppData, setAllAppData] = useState([]);

	const finalApp = appValue?.map((item) => {
		return item?.app_auto_id;
	});
	const finalCountry = countryValue?.map((item) => {
		return item?.alpha2_code;
	});
	const finalFormat = formatValue?.map((item) => {
		return item?.type;
	});
	const finalPlatform = platformValue?.map((item) => {
		return item?.platform_value;
	});
	const finalVersion = appVersionData?.map((item) => {
		return {
			app_display_name: item.app_display_name,
			name: item.name,
		};
	});
	const finalUnit = (unitValue ?? [])
		.filter((u) => u?.unit_checked && u?.unit_auto_id != null && u?.unit_auto_id !== '')
		.map((u) => u.unit_auto_id);

	useEffect(() => {
		const unit_flag = dimensionValue?.some((item) => {
			return item?.id == 'AD_UNIT' && item?.dimension_checked ? true : false;
		});
		setIsAdUnitClick(unit_flag);
	}, [dimensionValue]);

	const finalDimension = dimensionValue
		?.filter((item) => item?.dimension_checked && item.id !== 'DAY')
		?.map((item) => item?.id)
		?.join(',');

	const [finalSelectedAccount, setFinalSelectedAccount] = useState('');
	useEffect(() => {
		setFinalSelectedAccount(
			selectedAccountData
				?.map((item) => {
					return item?.admob_auto_id;
				})
				.join(',')
		);
	}, [selectedAccountData]);

	const finalGroupValue = groupByValue?.map((item) => {
		return item?.value;
	});

	//First API call
	const filterAccData = useMemo(() => {
		const fd = new FormData();
		fd?.append('user_id', localStorage.getItem('id'));
		fd?.append('user_token', localStorage.getItem('token'));
		if (selectedGroup?.length > 0) {
			fd.append('gg_id', selectedGroup);
		}
		return fd;
	}, [selectedGroup]);

	const { data: apiResponse, isSuccess: isApiSuccess } = useQueryFetch(
		['report-filter-data', 'group_select', selectedGroup],
		'get-analytics-filtering-data',
		filterAccData,
		{
			staleTime: 5 * 60 * 1000,
			refetchOnMount: 'ifStale',
		}
	);

	useEffect(() => {
		if (!isApiSuccess || !apiResponse || apiResponse.status_code !== 1) return;

		const allApps = apiResponse.all_app_list || [];

		// read localStorage safely
		let selectedAppId = null;
		const raw = localStorage.getItem('accountId');
		if (raw) {
			try {
				selectedAppId = JSON.parse(raw);
			} catch {
				selectedAppId = raw;
			}
		}

		// unique by email
		const uniqueAppData = allApps.filter(
			(app, idx, arr) => arr.findIndex((t) => t.admob_email === app.admob_email) === idx
		);

		// map with check flags
		const withCheckFlags = uniqueAppData.map((app, index) => {
			const isSelected = selectedAppId != null && app.admob_auto_id == selectedAppId;

			return {
				...app,
				item_checked: selectedAppId != null ? isSelected : index === 0,
				id: index + 1,
			};
		});

		setFilterAccountData(withCheckFlags);
		setFilterPopupData(apiResponse);

		// derive finalSelectedAccount from checked apps
		const checkedAccounts = withCheckFlags
			.filter((app) => app.item_checked)
			.map((app) => app.admob_auto_id);

		let resolvedAccount = undefined;

		if (checkedAccounts.length > 0) {
			resolvedAccount = checkedAccounts.join(',');
		} else if (withCheckFlags.length > 0) {
			// fallback first app
			resolvedAccount = String(withCheckFlags[0].admob_auto_id);
		}

		if (resolvedAccount !== undefined) {
			localStorage.setItem('accountId', JSON.stringify(resolvedAccount));
			setFinalSelectedAccount(resolvedAccount);
		} else {
			// resolved but empty
			setFinalSelectedAccount('');
		}

		setIsFilterDataLoaded(true);
	}, [isApiSuccess, apiResponse]);

	useEffect(() => {
		if (!apiResponse?.all_app_list || !finalSelectedAccount) return;

		const allApps = apiResponse.all_app_list;

		const accountArray = finalSelectedAccount
			.split(',')
			.map((account) => account.trim())
			.filter(Boolean);

		const uniqueAppList = allApps
			.filter((item) => accountArray.includes(String(item.admob_auto_id)))
			.map((item, i) => ({
				...item,
				item_checked: false,
				id: i + 1,
			}));

		// Build ad-unit structure
		const initialData = uniqueAppList.map((app) => ({
			...app,
			ad_units: (app?.ad_units ?? '')
				.split(',')
				.filter(Boolean)
				.map((unitStr) => {
					const [unit_auto_id, unit_display_name, ad_unit_id] = unitStr.split('#');

					return {
						unit_auto_id,
						unit_display_name,
						unit_checked: app?.app_auto_id === app_id && au_id === ad_unit_id,
						app_name: app?.app_display_name,
						app_platform: app?.app_platform,
						ad_unit_id,
					};
				}),
		}));

		// If we came from a link with au_id, clear app filters once.
		if (au_id) {
			sessionStorage.removeItem('app_filter');
			setAppValue([]);
		}

		// Read local unit filter safely
		let localData = null;
		try {
			const raw = sessionStorage.getItem('unit_filter');
			localData = raw ? JSON.parse(raw) : null;
		} catch {
			localData = null;
		}

		// Merge selected units from local storage
		initialData.forEach((app) => {
			let appChecked = false;

			app.ad_units?.forEach((unit) => {
				const matchedUnit = localData?.find((localUnit) => localUnit.unit_auto_id == unit.unit_auto_id);

				if (matchedUnit) {
					unit.unit_checked = true;
					appChecked = true;
				}
			});

			if (appChecked) {
				app.item_checked = true;
			}
		});

		// Collect all checked units
		const checkedUnits =
			initialData.flatMap((app) => app.ad_units?.filter((u) => u.unit_checked) ?? []) ?? [];

		if (checkedUnits.length === 0) {
			setUnitValue([
				{
					unit_auto_id: null,
					unit_display_name: '',
					unit_checked: false,
					app_name: null,
					app_platform: null,
					ad_unit_id: null,
				},
			]);
		} else {
			setUnitValue(checkedUnits);
		}

		// First selected ad unit id (if any)
		const adUnitIds =
			initialData.flatMap(
				(app) => app.ad_units?.filter((u) => u.unit_checked).map((u) => u.unit_auto_id) ?? []
			) ?? [];

		setAdUnitId(adUnitIds[0] ?? null);
		setFilteAdUnitData(initialData);
		setFilterAppData(uniqueAppList);
	}, [finalSelectedAccount, apiResponse, au_id, app_id, selectedGroup]);

	const newStartDate = new Date(dateRange[0]?.startDate);
	const selectedStartDate = newStartDate.toLocaleDateString('en-GB');
	const newEndDate = new Date(dateRange[0]?.endDate);
	const selectedEndDate = newEndDate.toLocaleDateString('en-GB');

	var queryString = window.location.search;
	var queryParams = {};
	if (queryString) {
		queryString = queryString.substring(1);
		var paramPairs = queryString.split('&');
		for (var i = 0; i < paramPairs?.length; i++) {
			var pair = paramPairs[i].split('=');
			var paramName = decodeURIComponent(pair[0]);
			var paramValue = decodeURIComponent(pair[1]);
			queryParams[paramName] = paramValue;
		}
	}
	const { appId, adId } = queryParams;

	//FormData for api
	const formData = new FormData();
	formData.append('user_id', localStorage.getItem('id'));
	formData.append('user_token', localStorage.getItem('token'));
	if (selectedGroup?.length > 0) {
		formData.append('gg_id', selectedGroup);
	}

	if (finalCountry?.length > 0) {
		formData.append('selected_country', finalCountry.join(','));
	}
	if (finalFormat?.length > 0) {
		formData.append('selected_ad_format', finalFormat.join(','));
	}

	if (finalPlatform?.length > 0) {
		formData.append('selected_app_platform', finalPlatform.join(','));
	}
	if (finalUnit?.length > 0) {
		formData.append('selected_ad_units', finalUnit.join(','));
	}
	if (order?.length > 0) {
		formData.append('sorting_order', order);
	} else {
		formData.append('sorting_order', 'DESCENDING');
	}

	const isColumnValid = dimensionValue?.some(
		(dimension) => dimension?.dimension_checked && dimension.id === columnName
	);
	const isColumnValidMatrix = allMatrixData?.some(
		(dimension) => dimension?.matrix_checked && dimension.name === columnName
	);

	if (groupByValue?.length > 0) {
		const key = groupByValue?.map((item) => {
			return item?.value;
		});
		if (key == 'QUARTER') {
			formData.append('sorting_column', 'MONTH');
		} else {
			formData.append('sorting_column', key);
		}
	} else if (columnName?.length > 0 && isColumnValid) {
		formData.append('sorting_column', columnName);
	} else if (columnName?.length > 0 && isColumnValidMatrix) {
		formData.append('sorting_column', columnName);
	} else if (!finalDimension?.includes('DATE')) {
		formData.delete('sorting_column');
	} else {
		formData.append('sorting_column', 'DATE');
	}

	if (dateRange?.length > 0)
		formData?.append('analytics_date_range', `${selectedStartDate}-${selectedEndDate}`);

	if (finalDimension?.length > 0) {
		formData.append('selected_dimension', finalDimension);
	} else if (finalDimension === '') {
		formData.delete('selected_dimension');
	}
	if (finalApp?.length > 0) {
		formData.append('selected_apps', finalApp.join(','));
	} else if (appId && !finalApp && !accountChecked) {
		formData.append('selected_apps', appId);
	} else if (app_id?.length > 0) {
		formData.append('selected_apps', app_id);
	}
	if (finalSelectedAccount?.length > 0) {
		formData?.append('admob_auto_id', finalSelectedAccount);
	}
	if (finalGroupValue?.length > 0) {
		formData.append('groupBy', finalGroupValue.join(','));
	}
	if (isUnitSwitch == true) {
		formData.append('ad_unit_comparison', isUnitSwitch);
	}

	//Sort Function
	const customSort = (column, sortDirection) => {
		let columnName = String(column?.sortValue);
		if (columnName) columnName === 'DAY' ? (columnName = 'DATE') : columnName;
		setColumnName(columnName);
		setOrder(sortDirection === 'asc' ? 'ASCENDING' : 'DESCENDING');
		setPageNumber(1);
		setCurrentUnitPage(1);
		setPopupFlags(!popupFlags);
		setIsReportLoaderVisible(true);
	};

	//Prev Data add

	const format = 'DD/MM/YYYY';
	const rangeDiff =
		moment(selectedEndDate, format).diff(moment(selectedStartDate, format), 'days') + 1;

	//consolidateData
	function consolidateData(data) {
		const mergedData = {};

		data.forEach((entry) => {
			const key = `${entry.au_display_name}_${entry?.au_id}`;
			if (!mergedData[key]) {
				mergedData[key] = {
					...entry,
					estimated_earnings: parseFloat(entry.estimated_earnings.replace('$', '')),
					ad_requests: parseInt(entry.ad_requests.replace(/,/g, ''), 10),
					matched_requests: parseInt(entry.matched_requests.replace(/,/g, ''), 10),
					impressions: parseInt(entry.impressions.replace(/,/g, ''), 10),
					clicks: parseInt(entry.clicks.replace(/,/g, ''), 10),
					match_rate: parseFloat(entry.match_rate.replace('%', '')),
					show_rate: parseFloat(entry.show_rate.replace('%', '')),
					impression_ctr: parseFloat(entry.impression_ctr.replace('%', '')),
					observed_ecpm: parseFloat(entry.observed_ecpm.replace('$', '')),
					count: 1,
				};
			} else {
				const existing = mergedData[key];
				// Aggregate numeric values
				existing.estimated_earnings += parseFloat(entry.estimated_earnings.replace('$', ''));
				existing.ad_requests += parseInt(entry.ad_requests.replace(/,/g, ''), 10);
				existing.matched_requests += parseInt(entry.matched_requests.replace(/,/g, ''), 10);
				existing.impressions += parseInt(entry.impressions.replace(/,/g, ''), 10);
				existing.clicks += parseInt(entry.clicks.replace(/,/g, ''), 10);
				existing.match_rate += parseFloat(entry.match_rate.replace('%', ''));
				existing.show_rate += parseFloat(entry.show_rate.replace('%', ''));
				existing.impression_ctr += parseFloat(entry.impression_ctr.replace('%', ''));
				existing.observed_ecpm += parseFloat(entry.observed_ecpm.replace('$', ''));

				existing.count += 1;
			}
		});

		// Compute averages and return consolidated data
		return Object.values(mergedData).map((entry) => {
			const { estimated_earnings, ad_requests, matched_requests, impressions, clicks } = entry;

			return {
				...entry,
				au_display_name: entry.au_display_name,
				estimated_earnings: `$${estimated_earnings.toFixed(2)}`,
				ad_requests: ad_requests.toLocaleString(),
				matched_requests: matched_requests.toLocaleString(),
				impressions: impressions.toLocaleString(),
				clicks: clicks.toLocaleString(),
				match_rate: `${((matched_requests / ad_requests) * 100).toFixed(2)}%`,
				show_rate: `${((impressions / matched_requests) * 100).toFixed(2)}%`,
				impression_ctr: `${((clicks / impressions) * 100).toFixed(2)}%`,
				observed_ecpm: `$${((estimated_earnings / impressions) * 1000).toFixed(2)}`,
			};
		});
	}

	const isAccountReady = finalSelectedAccount !== undefined;
	const isQueryEnabled = isAccountReady && !!dateRange && isFilterDataLoaded;

	const {
		data: reportResponse,
		isSuccess: isReportSuccess,
		isPending,
		isPlaceholderData,
		isFetching,
	} = useQueryFetch(
		[
			'report-table',
			'group_select',
			finalApp,
			finalCountry,
			finalFormat,
			finalPlatform,
			finalVersion,
			finalUnit,
			finalDimension,
			order,
			columnName,
			pageNumber,
			pageLength,
			dimensionValue,
			groupByValue,
			isUnitSwitch,
			finalSelectedAccount,
			selectedStartDate,
			selectedEndDate,
			selectedGroup,
		],
		'analytics-list',
		formData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: isQueryEnabled,
			placeholderData: (prev) => prev,
		}
	);

	useEffect(() => {
		if (!isReportSuccess || !reportResponse) return;
		setIsReportLoaderVisible(false);
		const currentData = reportResponse?.aaData;
		let prevData = reportResponse?.previous_aaData;
		currentData?.forEach((mainItem) => {
			const currentDate = mainItem.report_date;
			const admob_app_id = mainItem.app_admob_app_id;
			const au_id = mainItem.au_id;

			let prevDate;
			const prevStartDate = moment(selectedStartDate, format).subtract(rangeDiff, 'days');
			const prevEndDate = moment(selectedEndDate, format).subtract(rangeDiff, 'days');

			// if group by select
			if (finalGroupValue?.join('') == 'MONTH') {
				const current = prevStartDate.clone();
				const prevMonths = new Set();
				while (current.isSameOrBefore(prevEndDate)) {
					prevMonths.add(current.format('YYYYMM'));
					current.add(1, 'day');
				}
				prevDate = Array.from(prevMonths).join(',');

				if (Array.from(prevMonths)?.length > 1) {
					prevData = consolidateData(prevData);
				}
			} else if (finalGroupValue?.join('') == 'QUARTER') {
				const current = prevStartDate.clone();

				const prevQuarters = new Set();
				while (current.isSameOrBefore(prevEndDate)) {
					const quarter = Math.ceil((current.month() + 1) / 3);
					prevQuarters.add(`0${quarter}`);
					current.add(1, 'day');
				}
				prevDate = Array.from(prevQuarters).join(',');
				if (Array.from(prevQuarters)?.length > 1) {
					prevData = consolidateData(prevData);
				}
			} else {
				prevDate = moment(currentDate, 'YYYY-MM-DD').subtract(rangeDiff, 'days').format(format);
			}

			const matchedPrevItem = prevData.find((prevItem) => {
				if (finalGroupValue?.join('') == 'MONTH') {
					const prevMonth = moment(prevItem.report_date).format('YYYYMM');
					return (
						prevDate.includes(prevMonth) &&
						prevItem.app_admob_app_id == admob_app_id &&
						prevItem.au_id == au_id
					);
				}
				if (finalGroupValue?.join('') == 'QUARTER') {
					return (
						prevDate.includes(prevItem.report_date) &&
						prevItem.app_admob_app_id == admob_app_id &&
						prevItem.au_id == au_id
					);
				}
				return (
					moment(prevItem.report_date).format('DD/MM/YYYY') == prevDate &&
					prevItem.app_admob_app_id == admob_app_id &&
					prevItem.au_id == au_id
				);
			});

			if (matchedPrevItem) {
				const updatedPrevItem = Object.keys(matchedPrevItem).reduce((acc, key) => {
					acc[`prev_${key}`] = matchedPrevItem[key];
					return acc;
				}, {});
				Object.assign(mainItem, updatedPrevItem);
			}
		});

		const finalRecord = {
			aaData: currentData,
			iTotalRecords: reportResponse?.iTotalRecords,
			iTotalDisplayRecords: reportResponse?.iTotalDisplayRecords,
			status_code: reportResponse?.status_code,
			total_records_data: reportResponse?.total_records_data,
		};
		setTableNewData(finalRecord);
		let Data = currentData;
		if (reportResponse?.status_code === 1) {
			setToggleResize(true);

			setDisabled(false);
			const totalRecords = reportResponse?.total_records_data;
			if (totalRecords) {
				for (const item of dimensionValue) {
					if (item?.dimension_checked === true) {
						const firstDimensionKey = item?.key;
						const firstDimensionValue = 'Total';
						totalRecords[firstDimensionKey] = firstDimensionValue;
						break;
					}
				}
			}

			function organizeVersionsByApp(data) {
				const appVersionsMap = new Map();
				let autoId = 1; // Initialize auto_id counter

				for (const item of data) {
					if (
						item?.hasOwnProperty('app_display_name') &&
						item?.hasOwnProperty('app_version') &&
						item?.app_version
					) {
						const { app_display_name, app_version, app_platform } = item;
						const displayNameWithPlatform = `${app_display_name} (${app_platform})`;
						if (!appVersionsMap.has(displayNameWithPlatform)) {
							appVersionsMap.set(displayNameWithPlatform, [
								{
									id: autoId++,
									name: app_version,
									item_checked: false,
									app_display_name,
									app_platform,
								},
							]);
						} else {
							// If the app_display_name with app_platform already exists in the map, add the current app_version to its array
							const versions = appVersionsMap.get(displayNameWithPlatform);
							const existingVersion = versions.find((version) => version.name === app_version);
							if (!existingVersion) {
								versions.push({
									id: autoId++,
									name: app_version,
									item_checked: false,
									app_display_name,
									app_platform,
								});
							}
						}
					}
				}

				const organizedVersions = [];
				for (const [displayNameWithPlatform, versions] of appVersionsMap) {
					const [app_display_name, app_platform] = displayNameWithPlatform.split(' (');
					organizedVersions.push({
						app_display_name,
						app_platform: app_platform.slice(0, -1),
						versions,
					});
				}

				return organizedVersions;
			}
			if (finalDimension?.includes('COUNTRY')) {
				let sortedCountryFilter;
				const countryOrderMap = new Map();
				if (columnName?.includes('ESTIMATED_EARNINGS') && order?.includes('DESCENDING')) {
					Data?.forEach((item, index) => {
						if (!countryOrderMap.has(item.country_name)) {
							countryOrderMap.set(item.country_name, index);
						}
					});
					// Step 2: Sort filterArray based on the order of country names in dataArray
					sortedCountryFilter = filterUtilsPopupData?.all_countries?.sort((a, b) => {
						return (countryOrderMap.get(a.name) ?? Infinity) - (countryOrderMap.get(b.name) ?? Infinity);
					});
				} else {
					Data?.forEach((item, index) => {
						if (!countryOrderMap.has(item.country_name)) {
							countryOrderMap.set(item.country_name, index);
						}
					});
					// Step 2: Sort filterArray based on the order of country names in dataArray
					sortedCountryFilter = filterUtilsPopupData?.all_countries?.sort((a, b) => {
						return (countryOrderMap.get(a.name) ?? Infinity) - (countryOrderMap.get(b.name) ?? Infinity);
					});
				}
				setSortingCountryWise(sortedCountryFilter);
			}

			const organizedData = organizeVersionsByApp(Data);
			setAppVersion(organizedData);
			setSummaryData(totalRecords);
			setTotalRecordsData(reportResponse?.total_records_data);
			setPrevTotalRecordsData(reportResponse?.previous_total_records_data);
			setTotalPages(reportResponse.iTotalDisplayRecords / pageLength);
			setTimeout(() => {
				setMainLoaderVisible(false);
			}, 300);
		} else {
			setAppVersion([]);
			setIsReportLoaderVisible(false);
			setMainLoaderVisible(false);
			setDisabled(false);
			setToggleResize(true);
		}
	}, [isReportSuccess, reportResponse]);

	const [updateTableNewData, setUpdatedTableNewData] = useState([]);

	let adVersionBool = false;
	let adUnitBool = false;
	let dateBool = false;
	let appBool = false;
	let adUnitValue = false;

	// ad unit filter starts
	useEffect(() => {
		if (filterPopupData?.all_app_list?.length > 0 && tableNewData?.aaData?.length > 0) {
			const updatedTableNewData = tableNewData.aaData?.map((tableItem) => {
				const matchingPopupItem = filterPopupData?.all_app_list?.find(
					(popupItem) => popupItem?.app_admob_app_id === tableItem?.app_admob_app_id
				);
				if (matchingPopupItem) {
					return {
						...tableItem,
						app_icon: matchingPopupItem?.app_icon !== undefined ? matchingPopupItem?.app_icon : '',
						app_platform: matchingPopupItem?.app_platform,
						app_auto_id: matchingPopupItem?.app_auto_id,
						app_console_name: matchingPopupItem?.app_console_name,
						app_store_id:
							matchingPopupItem?.app_store_id !== undefined ? matchingPopupItem?.app_store_id : '',
					};
				}
				return tableItem;
			});

			//data filtering for user for adunit
			const userRole = localStorage?.getItem('role');
			dimensionValue?.forEach((dimension) => {
				if (dimension.id === 'AD_UNIT' && dimension.dimension_checked === true) {
					adUnitBool = true;
				}
				if (dimension.id === 'DATE' && dimension.dimension_checked === true) {
					dateBool = true;
				}
				if (dimension.id === 'APP' && dimension.dimension_checked === true) {
					appBool = true;
				}
				if (dimension.id === 'APP_VERSION_NAME' && dimension.dimension_checked === true) {
					adVersionBool = true;
				}
				if (dimension.id === 'AD_UNIT' && dimension.dimension_checked === true) {
					adUnitValue = true;
				}
			});
			function removeIndianCommas(numberString) {
				return numberString?.replace(/\,/g, '');
			}
			function addDollars(value1, value2) {
				const num1 = parseFloat(removeIndianCommas(value1?.replace('$', '')));
				const num2 = parseFloat(removeIndianCommas(value2?.replace('$', '')));
				return '$' + (num1 + num2).toFixed(2);
			}
			let filterByadUnitData = [];

			if (userRole !== '1') {
				const map = new Map();
				updatedTableNewData.forEach((obj) => {
					let key;
					dimensionValue.forEach((dimension) => {
						if (dimension.dimension_checked) {
							key += obj[dimension.key];
						}
					});
					if (!map.has(key)) {
						map.set(key, {
							...obj,
							total_ad_requests: parseInt(obj.ad_requests.replace(',', '')),
							total_estimated_earnings: parseFloat(obj.estimated_earnings.replace('$', '')),
							total_observed_ecpm: parseFloat(obj.observed_ecpm.replace('$', '')),
							total_matched_requests: parseInt(obj.matched_requests.replace(',', '')),
							total_impressions: parseInt(obj.impressions.replace(',', '')),
							total_clicks: parseInt(obj.clicks.replace(',', '')),
							total_match_rate: parseFloat(obj.match_rate),
							total_show_rate: parseFloat(obj.show_rate),
							//total_impression_ctr: parseInt(obj.impression_ctr),
							entryCount: 1,
						});
					} else {
						// Summing up ad_requests, estimated_earnings, and calculating total match_rate for duplicate entries
						const entry = map.get(key);
						const initial_ad_requests =
							parseInt(entry.ad_requests ? entry.ad_requests.replace(/\,/g, '') : 0) +
							parseInt(obj.ad_requests ? obj.ad_requests.replace(/\,/g, '') : 0);

						entry.ad_requests = initial_ad_requests.toLocaleString('en-IN');

						entry.estimated_earnings = addDollars(
							entry.estimated_earnings ? entry.estimated_earnings : 0,
							obj.estimated_earnings ? obj.estimated_earnings : 0
						);
						entry.total_observed_ecpm += parseFloat(obj.observed_ecpm ? obj.observed_ecpm : 0);
						entry.total_matched_requests += parseInt(
							obj.matched_requests ? obj.matched_requests.replace(/\,/g, '') : 0
						);
						entry.total_impressions += parseInt(obj.impressions ? obj.impressions.replace(/\,/g, '') : 0);
						entry.total_clicks += parseInt(obj.clicks ? obj.clicks.replace(/\,/g, '') : 0);
						entry.total_match_rate += parseFloat(obj.match_rate ? obj.match_rate : 0);
						entry.total_show_rate += parseFloat(obj.show_rate ? obj.show_rate : 0);

						entry.entryCount++;
						entry.match_rate = (entry.total_match_rate / entry.entryCount).toFixed(2) + '%';
						entry.show_rate = (entry.total_show_rate / entry.entryCount).toFixed(2) + '%';
						// entry.impression_ctr =
						//   (entry.total_impression_ctr / entry.entryCount).toFixed(2) + '%';
					}
				});
				map.forEach((value) => {
					value.additional_key = 'additional_value';
					value.clicks = value.total_clicks.toLocaleString('en-IN');
					value.impressions = value.total_impressions.toLocaleString('en-IN');
					value.ad_requests = value.ad_requests.toLocaleString('en-IN');
					value.matched_requests = value?.total_matched_requests.toLocaleString('en-IN');

					let finalObserver_ecpm = 0;
					if (
						value.estimated_earnings.replace('$', '') == 0 ||
						value.estimated_earnings.replace('$', '') == 0.0 ||
						value.estimated_earnings == null ||
						value.estimated_earnings == undefined ||
						value.total_impressions == 0 ||
						value.total_impressions == null ||
						value.total_impressions == undefined
					) {
						finalObserver_ecpm = '$0';
					} else {
						finalObserver_ecpm =
							'$' +
							(
								(removeIndianCommas(value.estimated_earnings.replace('$', '')) / value.total_impressions) *
								1000
							).toFixed(2);
					}

					finalObserver_ecpm == '$0'
						? (value.observed_ecpm = '$0')
						: (value.observed_ecpm = finalObserver_ecpm);

					let finalCTR = 0;
					if (
						value.total_clicks == 0 ||
						value.total_clicks == null ||
						value.total_clicks == undefined ||
						value.total_impressions == 0 ||
						value.total_impressions == null ||
						value.total_impressions == undefined
					) {
						finalCTR = '0%';
					} else {
						finalCTR = ((value.total_clicks / value.total_impressions) * 100).toFixed(2) + '%';
					}

					finalCTR == '0.00%' ? (value.impression_ctr = '0%') : (value.impression_ctr = finalCTR);

					filterByadUnitData.push(value);
				});
				//adversion filtering of adunit filter data
				if (finalVersion?.length > 0 && adVersionBool) {
					const filteredData = filterByadUnitData.filter((item) =>
						finalVersion?.some(
							(versionItem) =>
								versionItem.app_display_name === item.app_display_name &&
								versionItem.name === item.app_version
						)
					);
					setUpdatedTableNewData(filteredData);
				} else {
					if (appVersionData?.length > 0) {
						setappVersionData([]);
						setallAppVersionData(
							allAppVersionData?.forEach((item) => {
								item?.versions?.forEach((version) => {
									version.item_checked = false;
								});
							})
						);
						setfilteredAppVersionData(
							filteredAppVersionData?.forEach((item) => {
								item?.versions?.forEach((version) => {
									version.item_checked = false;
								});
							})
						);
						setcheckedAppVersion(null);
					}

					setUpdatedTableNewData(filterByadUnitData);
				}
			} else if (unitValue?.length > 0) {
				// ad unit condtion
				const map = new Map();
				updatedTableNewData.forEach((obj) => {
					let key;
					dimensionValue.forEach((dimension) => {
						if (dimension.dimension_checked) {
							key += obj[dimension.key];
						}
					});
					if (!map.has(key)) {
						map.set(key, {
							...obj,
							total_ad_requests: parseInt(obj.ad_requests.replace(/\,/g, '')),
							total_estimated_earnings: parseFloat(obj.estimated_earnings.replace('$', '')),
							total_observed_ecpm: parseFloat(obj.observed_ecpm.replace('$', '')),
							total_matched_requests: parseInt(obj.matched_requests.replace(/\,/g, '')),
							total_impressions: parseInt(obj.impressions.replace(/\,/g, '')),
							total_clicks: parseInt(obj.clicks.replace(/\,/g, '')),
							total_match_rate: parseFloat(obj.match_rate),
							total_show_rate: parseFloat(obj.show_rate),
							//total_impression_ctr: parseInt(obj.impression_ctr),
							entryCount: 1,
						});
					} else {
						// Summing up ad_requests, estimated_earnings, and calculating total match_rate for duplicate entries
						const entry = map.get(key);
						const initial_ad_requests =
							parseInt(entry.ad_requests ? entry.ad_requests.replace(/\,/g, '') : 0) +
							parseInt(obj.ad_requests ? obj.ad_requests.replace(/\,/g, '') : 0);

						entry.ad_requests = initial_ad_requests.toLocaleString('en-IN');

						entry.estimated_earnings = addDollars(
							entry.estimated_earnings ? entry.estimated_earnings : 0,
							obj.estimated_earnings ? obj.estimated_earnings : 0
						);
						entry.total_observed_ecpm += parseFloat(obj.observed_ecpm ? obj.observed_ecpm : 0);
						entry.total_matched_requests += parseInt(
							obj.matched_requests ? obj.matched_requests.replace(/\,/g, '') : 0
						);
						entry.total_impressions += parseInt(obj.impressions ? obj.impressions.replace(/\,/g, '') : 0);
						entry.total_clicks += parseInt(obj.clicks ? obj.clicks.replace(/\,/g, '') : 0);
						entry.total_match_rate += parseFloat(obj.match_rate ? obj.match_rate : 0);
						entry.total_show_rate += parseFloat(obj.show_rate ? obj.show_rate : 0);

						entry.entryCount++;
						entry.match_rate = (entry.total_match_rate / entry.entryCount).toFixed(2) + '%';
						entry.show_rate = (entry.total_show_rate / entry.entryCount).toFixed(2) + '%';
						// entry.impression_ctr =
						//   (entry.total_impression_ctr / entry.entryCount).toFixed(2) + '%';
					}
				});
				map.forEach((value) => {
					value.additional_key = 'additional_value';
					value.clicks = value.total_clicks.toLocaleString('en-IN');
					value.impressions = value.total_impressions.toLocaleString('en-IN');
					value.ad_requests = value.ad_requests.toLocaleString('en-IN');
					value.matched_requests = value?.total_matched_requests.toLocaleString('en-IN');

					let finalObserver_ecpm = 0;
					if (
						value.estimated_earnings.replace('$', '') == 0 ||
						value.estimated_earnings.replace('$', '') == 0.0 ||
						value.estimated_earnings == null ||
						value.estimated_earnings == undefined ||
						value.total_impressions == 0 ||
						value.total_impressions == null ||
						value.total_impressions == undefined
					) {
						finalObserver_ecpm = '$0';
					} else {
						finalObserver_ecpm =
							'$' +
							(
								(removeIndianCommas(value.estimated_earnings.replace('$', '')) / value.total_impressions) *
								1000
							).toFixed(2);
					}

					finalObserver_ecpm == '$0'
						? (value.observed_ecpm = '$0')
						: (value.observed_ecpm = finalObserver_ecpm);

					let finalCTR = 0;
					if (
						value.total_clicks == 0 ||
						value.total_clicks == null ||
						value.total_clicks == undefined ||
						value.total_impressions == 0 ||
						value.total_impressions == null ||
						value.total_impressions == undefined
					) {
						finalCTR = '0%';
					} else {
						finalCTR = ((value.total_clicks / value.total_impressions) * 100).toFixed(2) + '%';
					}

					finalCTR == '0.00%' ? (value.impression_ctr = '0%') : (value.impression_ctr = finalCTR);

					filterByadUnitData.push(value);
				});
				if (finalVersion?.length > 0 && adVersionBool) {
					const filteredData = filterByadUnitData.filter((item) =>
						finalVersion?.some(
							(versionItem) =>
								versionItem.app_display_name === item.app_display_name &&
								versionItem.name === item.app_version
						)
					);
					setUpdatedTableNewData(filteredData);
				} else {
					if (appVersionData?.length > 0) {
						setappVersionData([]);
						setallAppVersionData(
							allAppVersionData?.forEach((item) => {
								item?.versions?.forEach((version) => {
									version.item_checked = false;
								});
							})
						);
						setfilteredAppVersionData(
							filteredAppVersionData?.forEach((item) => {
								item?.versions?.forEach((version) => {
									version.item_checked = false;
								});
							})
						);
						setcheckedAppVersion(null);
					}

					setUpdatedTableNewData(filterByadUnitData);
				}
			} else {
				//filter for appversion
				if (finalVersion?.length > 0 && adVersionBool) {
					const filteredData = updatedTableNewData?.filter((item) =>
						finalVersion?.some(
							(versionItem) =>
								versionItem.app_display_name === item.app_display_name &&
								versionItem.name === item.app_version
						)
					);

					const totalsMap = new Map([
						['total_estimated_earnings', 0],
						['total_observed_ecpm', 0],
						['total_ad_requests', 0],
						['total_match_rate', 0],
						['total_matched_requests', 0],
						['total_show_rate', 0],
						['total_impressions', 0],
						['total_impression_ctr', 0],
						['total_clicks', 0],
						['count', 0],
					]);
					filteredData.forEach((item) => {
						totalsMap.set(
							'total_estimated_earnings',
							totalsMap.get('total_estimated_earnings') +
								parseFloat(item.estimated_earnings.replace(/[$,]/g, ''))
						);
						totalsMap.set(
							'total_observed_ecpm',
							totalsMap.get('total_observed_ecpm') + parseFloat(item.observed_ecpm.replace(/[$,]/g, ''))
						);
						totalsMap.set(
							'total_ad_requests',
							totalsMap.get('total_ad_requests') + parseInt(item.ad_requests.replace(/[,]/g, ''))
						);
						totalsMap.set(
							'total_match_rate',
							totalsMap.get('total_match_rate') + parseFloat(item.match_rate.replace(/[%]/g, ''))
						);
						totalsMap.set(
							'total_matched_requests',
							totalsMap.get('total_matched_requests') + parseInt(item.matched_requests.replace(/[,]/g, ''))
						);
						totalsMap.set(
							'total_show_rate',
							totalsMap.get('total_show_rate') +
								(item.show_rate.length > 0 ? parseFloat(item.show_rate.replace(/[%]/g, '')) : 0)
						);
						totalsMap.set(
							'total_impressions',
							totalsMap.get('total_impressions') + parseInt(item.impressions.replace(/[,]/g, ''))
						);
						if (item.impressions !== '0' && item.impression_ctr !== '-') {
							totalsMap.set(
								'total_impression_ctr',
								totalsMap.get('total_impression_ctr') + parseFloat(item.impression_ctr.replace(/[%]/g, ''))
							);
							totalsMap.set('impression_ctr_count', totalsMap.get('impression_ctr_count') + 1);
						}
						totalsMap.set(
							'total_clicks',
							totalsMap.get('total_clicks') + parseInt(item.clicks.replace(/[,]/g, ''))
						);
						totalsMap.set('count', totalsMap.get('count') + 1);
					});
					const totalResults = {
						total_estimated_earnings: `$${totalsMap.get('total_estimated_earnings').toFixed(2)}`,
						total_observed_ecpm: `$${totalsMap.get('total_observed_ecpm').toFixed(2)}`,
						total_ad_requests: totalsMap.get('total_ad_requests').toLocaleString(),
						total_match_rate: `${(totalsMap.get('total_match_rate') / totalsMap.get('count')).toFixed(
							2
						)}%`,
						total_matched_requests: totalsMap.get('total_matched_requests').toLocaleString(),
						total_show_rate: `${(totalsMap.get('total_show_rate') / totalsMap.get('count')).toFixed(2)}%`,
						total_impressions: totalsMap.get('total_impressions').toLocaleString(),
						total_impression_ctr:
							totalsMap.get('total_impressions') > 0
								? `${((totalsMap.get('total_clicks') / totalsMap.get('total_impressions')) * 100).toFixed(
										2
								  )}%`
								: '0.00%',
						total_clicks: totalsMap.get('total_clicks').toLocaleString(),
						admob_currency_code: 'USD',
						app_display_name: 'Total',
					};
					setUpdatedTableNewData(filteredData);
					setTotalRecordsData(totalResults);
				} else {
					if (appVersionData?.length > 0) {
						setappVersionData([]);
						setallAppVersionData(
							allAppVersionData?.forEach((item) => {
								item?.versions?.forEach((version) => {
									version.item_checked = false;
								});
							})
						);
						setfilteredAppVersionData(
							filteredAppVersionData?.forEach((item) => {
								item?.versions?.forEach((version) => {
									version.item_checked = false;
								});
							})
						);
						setcheckedAppVersion(null);
					}
					setUpdatedTableNewData(updatedTableNewData);
				}
			}
		} else {
			setUpdatedTableNewData([]);
		}
	}, [filterPopupData, tableNewData]);

	useEffect(() => {
		const paginationLinks = useGeneratePagination(totalPages);
		setPaginationList(paginationLinks);
	}, [totalPages]);

	//Matrix report
	const finalMatrix = allMatrixData.map((data) => {
		return data.matrix_checked;
	});

	const [styleWidth] = useState(['0px', '200px']);

	//pagination
	const [itemsPerPage] = useState(100);
	//const totalUnitPage = totalUnitData / itemsPerPage;
	const totalUnitPage = Math.ceil(updateTableNewData?.length / itemsPerPage);

	const indexOfLastItem = currentUnitPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentAdUnitData = updateTableNewData?.slice(indexOfFirstItem, indexOfLastItem);

	const getHighlightClass = (current, previous = '0', isPercentage = false) => {
		if (previous != null && previous != undefined) {
			const cleanPrevious = +previous.replace(/[$%,]/g, '');
			const cleanCurrent = +current.replace(/[$%,]/g, '');

			const diff = cleanCurrent - cleanPrevious;
			const threshold = isPercentage ? 0 : cleanPrevious * 0;
			if (Math.abs(diff) > threshold) {
				return diff > 0 ? 'highlight-positive' : 'highlight-negative';
			}
		} else {
			return '';
		}
	};

	function calculatePercentageChange(current, previous) {
		const currentValue = Number(current) || 0;
		const previousValue = Number(previous) || 0;
		if (previousValue === 0) {
			return currentValue > 0 ? '100%' : '0%';
		}
		const change = ((currentValue - previousValue) / previousValue) * 100;
		return parseFloat(Math.abs(change.toFixed(2))) + '%';
	}

	function calculatePercentageChangeOfPercentage(current, previous) {
		const currentValue = Number(current) || 0;
		const previousValue = Number(previous) || 0;
		const change = currentValue - previousValue;
		return parseFloat(Math.abs(change.toFixed(2))) + '%';
	}

	const [dimensionMatrix, setDimensionMatrix] = useState([]);

	const [columns, setColumns] = useState([
		{
			name: (
				<>
					<div className='report-title'>
						<div className='report-header-dimension'>Apps</div>
					</div>
				</>
			),
			selector: (row) => row['app_display_name'],
			cell: (app) => (
				<>
					<GeneralTinyAppBox
						uniqueIdentifier='report'
						app_auto_id={app?.app_auto_id}
						app_icon={app?.app_icon}
						app_platform={app?.app_platform}
						app_display_name={app?.app_display_name}
						app_console_name={app?.app_console_name}
						app_store_id={app?.app_store_id}
					/>
				</>
			),
			reorder: false,
			sortable: true,
			sortValue: 'APP',
			width: '139px',
			omit: false,
			fixed: true,
		},
		{
			name: (
				<div className='report-title'>
					<div className='report-header-dimension'>Date</div>
				</div>
			),
			selector: (row) => row['report_date'],
			sortable: true,
			cell: (row) => {
				return (
					<div className='report_column_box'>
						<div className='report_main_value'>{row.report_date}</div>
						<div className='report_prev_value'>{row.prev_report_date}</div>
					</div>
				);
			},
			width: '120px',
			// sortValue: () => {
			//   const key = groupValue?.map((item) => {
			//     return item?.value;
			//   });
			//   return key == 'QUARTER' ? 'MONTH' : key;
			// },
			sortValue: 'DATE',
			omit: false,
			customIndex: 'DATE',
			reorder: false,
		},
		{
			name: (
				<>
					<div className='report-title'>
						<div className='report-header-dimension'>Day</div>
					</div>
				</>
			),
			selector: (row) => row['report_date'],
			cell: (row) => {
				const weekDay = moment(row?.report_date, 'YYYY-MM-DD').format('dddd');
				return <div className='custom_day_column'>{weekDay == 'Invalid date' ? '-' : weekDay}</div>;
			},
			style: {
				justifyContent: 'left !important',
			},
			sortable: true,
			width: '120px',
			sortValue: 'DAY',
			omit: false,
			reorder: false,
		},
		{
			name: (
				<>
					<div className='report-title'>
						<div className='report-header-dimension'>Ad Unit</div>
					</div>
				</>
			),
			selector: (row) => row['au_display_name'],
			cell: (row) => (
				<div className='column-ellipsis' title={row?.au_display_name}>
					{row?.au_display_name}
				</div>
			),
			style: {
				justifyContent: 'left !important',
			},
			sortable: true,
			reorder: false,
			width: '120px',
			sortValue: 'AD_UNIT',
			omit: true,
		},
		{
			name: (
				<>
					<div className='report-title'>
						<div className='report-header-dimension'>Format</div>
					</div>
				</>
			),
			selector: (row) => row['au_format'],
			cell: (row) => (
				<div className='column-ellipsis' title={row?.au_format}>
					{row?.au_format?.replace('_', ' ').toUpperCase()}
				</div>
			),
			sortable: true,
			reorder: false,
			width: '120px',
			sortValue: 'FORMAT',
			omit: true,
		},
		{
			name: (
				<>
					<div className='report-title'>
						<div className='report-header-dimension'>Country</div>
					</div>
				</>
			),
			selector: (row) => row['country_name'],
			cell: (row) => (
				<div className='column-ellipsis' title={row?.country_name}>
					{row?.country_name}
				</div>
			),
			sortable: true,
			reorder: false,
			width: '120px',
			sortValue: 'COUNTRY',
			omit: true,
		},
		{
			name: (
				<>
					<div className='report-title'>
						<div className='report-header-dimension'>App Version</div>
					</div>
				</>
			),
			selector: (row) => row['app_version'],
			cell: (row) => (
				<div className='column-ellipsis' title={row?.app_version}>
					{row?.app_version}
				</div>
			),
			sortable: true,
			reorder: false,
			width: '130px',
			sortValue: 'APP_VERSION_NAME',
			omit: true,
		},
		{
			name: 'Est. earnings',
			selector: (row) => row['estimated_earnings'],
			sortable: true,
			reorder: false,
			sortValue: 'ESTIMATED_EARNINGS',
			cell: (row) => {
				const current = row?.estimated_earnings;
				const previous = row?.prev_estimated_earnings || '$0.00';
				const highlightClass = getHighlightClass(current, previous);

				// Convert the values to numbers
				const currentValue = Number(current.replace('$', ''));
				const previousValue = Number(previous.replace('$', ''));
				const percentageMove = calculatePercentageChange(currentValue, previousValue);

				return (
					<div className='report_column_box'>
						<div className={`report_main_value hover_tooltip_box`}>
							{current}
							<div className={`hover_tooltip`}>{previous}</div>
						</div>
						<div className={`report_prev_value ${highlightClass}`}>{percentageMove}</div>
					</div>
				);
			},
			omit: false,
			style: {
				justifyContent: 'right !important',
				minWidth: '120px',
			},
			id: 'estimated-earnings',
		},
		{
			name: 'eCPM',
			selector: (row) => row['observed_ecpm'],
			cell: (row) => {
				const current = row?.observed_ecpm || '$0.00';
				const previous = row?.prev_observed_ecpm || '$0.00';
				const highlightClass = getHighlightClass(current, previous);

				// const difference = previous
				// 	? Math.abs(+current.replace('$', '') - +previous.replace('$', ''))
				// 	: null;

				// Convert the values to numbers
				const currentValue = Number(current.replace('$', ''));
				const previousValue = Number(previous.replace('$', ''));
				const percentageMove = calculatePercentageChange(currentValue, previousValue);

				return (
					<div className='report_column_box'>
						<div className={`report_main_value hover_tooltip_box`}>
							{current}
							<div className={`hover_tooltip`}>{previous}</div>
						</div>
						<div className={`report_prev_value ${highlightClass}`}>{percentageMove}</div>
					</div>
				);
			},
			sortable: true,
			reorder: false,
			sortValue: 'IMPRESSION_RPM',
			omit: !finalMatrix[1],
			style: {
				justifyContent: 'right !important',
				minWidth: '120px',
			},
			id: 'observed-ecpm',
		},
		{
			name: 'Requests',
			selector: (row) => row['ad_requests'],
			cell: (row) => {
				const current = row?.ad_requests || '0';
				const previous = row?.prev_ad_requests || '0';
				const highlightClass = getHighlightClass(current, previous);

				// Convert the values to numbers
				const currentValue = Number(current.replace(',', ''));
				const previousValue = Number(previous.replace(',', ''));
				const percentageMove = calculatePercentageChange(currentValue, previousValue);
				return (
					<div className='report_column_box'>
						<div className={`report_main_value hover_tooltip_box`}>
							{current}
							<div className={`hover_tooltip`}>{previous}</div>
						</div>
						<div className={`report_prev_value ${highlightClass}`}>{percentageMove}</div>
					</div>
				);
			},
			sortable: true,
			reorder: false,
			sortValue: 'AD_REQUESTS',
			omit: false,
			style: {
				justifyContent: 'right !important',
				minWidth: '120px',
			},
			id: 'request',
		},
		{
			name: 'Matched requests',
			selector: (row) => row['matched_requests'],
			cell: (row) => {
				const current = row?.matched_requests || '0';
				const previous = row?.prev_matched_requests || '0';
				const highlightClass = getHighlightClass(current, previous);

				// Convert the values to numbers
				const currentValue = Number(current.replace(',', ''));
				const previousValue = Number(previous.replace(',', ''));
				const percentageMove = calculatePercentageChange(currentValue, previousValue);

				return (
					<div className='report_column_box'>
						<div className={`report_main_value hover_tooltip_box`}>
							{current}
							<div className={`hover_tooltip`}>{previous}</div>
						</div>
						<div className={`report_prev_value ${highlightClass}`}>{percentageMove}</div>
					</div>
				);
			},
			sortable: true,
			reorder: false,
			sortValue: 'MATCHED_REQUESTS',
			omit: true,
			style: {
				justifyContent: 'right !important',
			},
			id: 'matched-requests',
			width: '160px',
		},
		{
			name: 'Match rate (%)',
			selector: (row) => row['match_rate'],
			cell: (row) => {
				const current = row?.match_rate || '0.00%';
				const previous = row?.prev_match_rate || '0.00%';
				const highlightClass = getHighlightClass(current, previous, true);
				// Convert the values to numbers
				const currentValue = Number(current.replace('%', ''));
				const previousValue = Number(previous.replace('%', ''));
				const percentageMove = calculatePercentageChangeOfPercentage(currentValue, previousValue);

				return (
					<div className='report_column_box'>
						<div className={`report_main_value hover_tooltip_box`}>
							{current}
							<div className={`hover_tooltip`}>{previous}</div>
						</div>
						<div className={`report_prev_value ${highlightClass}`}>{percentageMove}</div>
					</div>
				);
			},
			sortable: true,
			reorder: false,
			sortValue: 'MATCH_RATE',
			omit: false,
			style: {
				justifyContent: 'right !important',
				minWidth: '120px',
			},
			id: 'match-rate',
		},
		{
			name: 'Impressions',
			selector: (row) => row['impressions'],
			cell: (row) => {
				const current = row?.impressions || '0';
				const previous = row?.prev_impressions || '0';
				const highlightClass = getHighlightClass(current, previous);

				const currentValue = Number(current.replace(',', ''));
				const previousValue = Number(previous.replace(',', ''));
				const percentageMove = calculatePercentageChange(currentValue, previousValue);

				return (
					<div className='report_column_box'>
						<div className={`report_main_value hover_tooltip_box`}>
							{current}
							<div className={`hover_tooltip`}>{previous}</div>
						</div>
						<div className={`report_prev_value ${highlightClass}`}>{percentageMove}</div>
					</div>
				);
			},
			sortable: true,
			reorder: false,
			sortValue: 'IMPRESSIONS',
			omit: false,
			style: {
				justifyContent: 'right !important',
				minWidth: '120px',
			},
			id: 'impressions',
		},
		{
			name: 'Show rate (%)',
			selector: (row) => row['show_rate'],
			cell: (row) => {
				const current = row?.show_rate || '0.00%';
				const previous = row?.prev_show_rate || '0.00%';
				const highlightClass = getHighlightClass(current, previous, true);
				// Convert the values to numbers
				const currentValue = Number(current.replace('%', ''));
				const previousValue = Number(previous.replace('%', ''));
				const percentageMove = calculatePercentageChangeOfPercentage(currentValue, previousValue);
				return (
					<div className='report_column_box'>
						<div className={`report_main_value hover_tooltip_box`}>
							{current}
							<div className={`hover_tooltip`}>{previous}</div>
						</div>
						<div className={`report_prev_value ${highlightClass}`}>{percentageMove}</div>
					</div>
				);
			},
			sortable: true,
			reorder: false,
			sortValue: 'SHOW_RATE',
			omit: false,
			style: {
				justifyContent: 'right !important',
				minWidth: '120px',
			},
			id: 'show-rate',
		},
		{
			name: 'Clicks',
			selector: (row) => row['clicks'],
			cell: (row) => {
				const current = row?.clicks || '0';
				const previous = row?.prev_clicks || '0';
				const highlightClass = getHighlightClass(current, previous);

				// Convert the values to numbers
				const currentValue = Number(current.replace(',', ''));
				const previousValue = Number(previous.replace(',', ''));
				const percentageMove = calculatePercentageChange(currentValue, previousValue);

				return (
					<div className='report_column_box'>
						<div className={`report_main_value hover_tooltip_box`}>
							{current}
							<div className={`hover_tooltip`}>{previous}</div>
						</div>
						<div className={`report_prev_value ${highlightClass}`}>{percentageMove}</div>
					</div>
				);
			},
			sortable: true,
			sortValue: 'CLICKS',
			omit: false,
			reorder: false,
			order: 1,
			style: {
				justifyContent: 'right !important',
				minWidth: '120px',
			},
			id: 'clicks',
		},
		{
			name: 'CTR (%)',
			selector: (row) => row['impression_ctr'],
			cell: (row) => {
				const current =
					row?.impression_ctr == '-' ? '0.00%' : row?.impression_ctr ? row?.impression_ctr : '0.00%';
				const previous =
					row?.prev_impression_ctr == '-'
						? '0.00%'
						: row?.prev_impression_ctr
						? row?.prev_impression_ctr
						: '0.00%';

				const highlightClass = getHighlightClass(current, previous, true);
				// Convert the values to numbers
				const currentValue = Number(current.replace('%', ''));
				const previousValue = Number(previous.replace('%', ''));
				const percentageMove = calculatePercentageChangeOfPercentage(currentValue, previousValue);
				return (
					<div className='report_column_box'>
						<div className={`report_main_value hover_tooltip_box`}>
							{current}
							<div className={`hover_tooltip`}>{previous}</div>
						</div>
						<div className={`report_prev_value ${highlightClass}`}>{percentageMove}</div>
					</div>
				);
			},
			sortable: true,
			reorder: false,
			sortValue: 'IMPRESSION_CTR',
			omit: false,
			order: 0,
			style: {
				justifyContent: 'right !important',
				minWidth: '120px',
			},
			id: 'impression-ctr',
		},
		// {
		//   Header: "Total",
		// // Footer: () => calculateTotal(data),
		// }
	]);

	//groupByValue
	useEffect(() => {
		setColumns((prevColumns) => {
			return prevColumns.map((column) => {
				if (column?.customIndex == 'DATE') {
					return {
						...column,
						cell: (row) => {
							let customReportDate = row?.report_date;
							const groupFilterKey = groupByValue?.map((item) => item?.value).join('');
							if (groupFilterKey == 'WEEK') {
								const weekNum = moment(row?.report_date, 'YYYYMMDD').week().toString().padStart(2, '0');
								const momentDate = moment(row?.report_date, 'YYYYMMDD');
								const year = momentDate.year();
								customReportDate = year + 'W' + weekNum;
							} else if (groupFilterKey == 'MONTH') {
								const monthNum = (moment(row?.report_date, 'YYYYMM').month() + 1)
									.toString()
									.padStart(2, '0');
								const momentDate = moment(row?.report_date, 'YYYYMM');
								const year = momentDate.year();
								customReportDate = year + 'M' + monthNum;
							} else if (groupFilterKey == 'QUARTER') {
								const year = row?.report_date.slice(0, 4);
								const quarter = row?.report_date.slice(4);
								customReportDate = year + 'Q' + quarter;
							}
							return <div>{customReportDate}</div>;
						},
					};
				}
				return column;
			});
		});
	}, [groupByValue, updateTableNewData]);

	// calc for pin columns
	const calculateLeft = (sortedColumns, index) => {
		let left = 0;
		for (let i = 0; i < index; i++) {
			left += parseFloat(sortedColumns[i].width) || 0;
		}
		return left + 'px';
	};
	const updateStickyPosition = (cell, value, sortedColumns) => {
		if (cell) {
			cell.style.position = 'sticky';
			cell.style.zIndex = 7;
			cell.style.left = calculateLeft(sortedColumns, value);
			cell.style.backgroundColor = '#fff';
		}
	};

	//Fixed Column
	useEffect(() => {
		const updatedColumns = columns?.map((column) => {
			const dimensionItem = dimensionValue.find((item) => item.id === column.sortValue);
			if (dimensionItem) {
				return {
					...column,
					omit: !dimensionItem?.dimension_checked,
					pin_key: dimensionItem?.pin_key || false,
					data_column_id: dimensionItem.data_column_id,

					...(column.sortValue === 'APP' &&
						totalRecordsData && {
							name: (
								<>
									{' '}
									<div className='report-title'>
										<div className='report-header-dimension'>Apps</div>
										<div className='report-total-dimension'>{totalRecordsData?.total_app_display_name}</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'DATE' &&
						totalRecordsData && {
							name: (
								<>
									{' '}
									<div className='report-title'>
										<div className='report-header-dimension'>Date</div>
										<div className='report-total-dimension'>{totalRecordsData?.total_report_date}</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'DAY' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header-dimension'>Day</div>
										<div className='report-total-dimension'>{totalRecordsData?.total_report_date}</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'AD_UNIT' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header-dimension'>Ad Unit</div>
										<div className='report-total-dimension'>{totalRecordsData?.total_au_display_name}</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'FORMAT' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header-dimension'>Format</div>
										<div className='report-total-dimension'>{totalRecordsData?.total_au_format}</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'COUNTRY' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header-dimension'>Country</div>
										<div className='report-total-dimension'>{totalRecordsData?.total_country_name}</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'APP_VERSION_NAME' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header-dimension'>App Version</div>
										<div className='report-total-dimension'>{totalRecordsData?.total_app_version}</div>
									</div>
								</>
							),
						}),
				};
			}
			return column;
		});
		const dimensionCheckedArray = [];
		dimensionValue?.forEach((dimensionItem) => {
			const column = updatedColumns?.find((col) => col.sortValue === dimensionItem.id);
			if (column) {
				dimensionCheckedArray.push(column);
			}
		});
		columns?.forEach((column) => {
			if (!dimensionCheckedArray?.find((col) => col.sortValue === column.sortValue)) {
				dimensionCheckedArray.push(column);
			}
		});
		let reorderedColumns = dimensionCheckedArray;

		setColumns(reorderedColumns);
	}, [dimensionValue]);

	useEffect(() => {
		const updatedColumns = columns?.map((column) => {
			const allMatrixValue = allMatrixData?.find((item) => item?.name === column.sortValue);
			if (allMatrixValue) {
				const getHighlightedTotal = (current, previous, isPercentage = false) => {
					const highlightClass = getHighlightClass(String(current), String(previous), isPercentage);
					return (
						<>
							<span className={`report_main_total`}>{indianNumberFormat(current)}</span>
							<span className={`report_prev_total ${highlightClass}`}>
								({indianNumberFormat(previous)})
							</span>
						</>
					);
				};
				return {
					...column,
					omit: !allMatrixValue?.matrix_checked,
					...(column.sortValue === 'ESTIMATED_EARNINGS' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header'>Est. earnings</div>
										<div className='report-total'>
											{getHighlightedTotal(
												totalRecordsData?.total_estimated_earnings,
												prevTotalRecordsData?.total_estimated_earnings
											)}
										</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'IMPRESSION_RPM' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header'>eCPM</div>
										<div className='report-total'>
											{getHighlightedTotal(
												totalRecordsData?.total_observed_ecpm,
												prevTotalRecordsData?.total_observed_ecpm
											)}
										</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'AD_REQUESTS' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header'>Requests</div>
										<div className='report-total'>
											{getHighlightedTotal(
												totalRecordsData?.total_ad_requests,
												prevTotalRecordsData?.total_ad_requests
											)}
										</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'MATCHED_REQUESTS' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header'>Matched requests</div>
										<div className='report-total'>
											{getHighlightedTotal(
												totalRecordsData?.total_matched_requests,
												prevTotalRecordsData?.total_matched_requests
											)}
										</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'MATCH_RATE' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header'>Match rate (%)</div>
										<div className='report-total'>
											{getHighlightedTotal(
												totalRecordsData?.total_match_rate,
												prevTotalRecordsData?.total_match_rate,
												true
											)}
										</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'IMPRESSIONS' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header'>Impressions</div>
										<div className='report-total'>
											{getHighlightedTotal(
												totalRecordsData?.total_impressions,
												prevTotalRecordsData?.total_impressions
											)}
										</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'SHOW_RATE' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header'>Show rate (%)</div>
										<div className='report-total'>
											{getHighlightedTotal(
												totalRecordsData?.total_show_rate,
												prevTotalRecordsData?.total_show_rate,
												true
											)}
										</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'CLICKS' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header'>Clicks</div>
										<div className='report-total'>
											{getHighlightedTotal(totalRecordsData?.total_clicks, prevTotalRecordsData?.total_clicks)}
										</div>
									</div>
								</>
							),
						}),
					...(column.sortValue === 'IMPRESSION_CTR' &&
						totalRecordsData && {
							name: (
								<>
									<div className='report-title'>
										<div className='report-header'>CTR (%)</div>
										<div className='report-total'>
											{getHighlightedTotal(
												totalRecordsData?.total_impression_ctr,
												prevTotalRecordsData?.total_impression_ctr,
												true
											)}
										</div>
									</div>
								</>
							),
						}),
				};
			}
			return column;
		});
		setColumns(updatedColumns);
	}, [allMatrixData, totalRecordsData]);

	useEffect(() => {
		if (sharedData?.columns?.length > 0 || pinToggle) {
			const dataColumn = sharedData?.columns;
			const fixedColumns = columns?.filter((column) =>
				['APP', 'DATE', 'DAY', 'AD_UNIT', 'FORMAT', 'COUNTRY', 'APP_VERSION_NAME']?.includes(
					column.sortValue
				)
			);
			const dynamicColumns = columns?.filter((column) => !fixedColumns.includes(column));
			// Add pin_key attribute from datacolumn to fixedColumns
			fixedColumns.forEach((fixedColumn) => {
				const correspondingColumn = dataColumn?.find((column) => column?.id === fixedColumn?.sortValue);
				if (correspondingColumn) {
					fixedColumn.pin_key = correspondingColumn.pin_key;
					fixedColumn.omit = !correspondingColumn.dimension_checked;
				}
			});
			const pinnedColumns = fixedColumns?.filter((column) => column.pin_key);
			const dataColumnPinnedColumn = dataColumn?.filter((column) => column.pin_key);

			const unpinnedColumns = fixedColumns?.filter((column) => !column.pin_key);
			const dataColumnUnPinnedColumn = dataColumn?.filter((column) => !column.pin_key);
			const reorderedUnPinnedFixedColumns = dataColumnUnPinnedColumn
				?.map((column) => {
					const fixedColumn = unpinnedColumns?.find((col) => col.sortValue === column.id);
					if (fixedColumn) {
						return {
							...fixedColumn,
						};
					} else {
						return null; // Handle the case where a fixed column is not found
					}
				})
				.filter(Boolean);
			const reorderedPinnedFixedColumns = dataColumnPinnedColumn
				?.map((column) => {
					const fixedColumn = pinnedColumns?.find((col) => col.sortValue === column.id);
					if (fixedColumn) {
						return {
							...fixedColumn,
						};
					} else {
						return null; // Handle the case where a fixed column is not found
					}
				})
				.filter(Boolean);
			const newColumns = [
				...reorderedPinnedFixedColumns,
				...reorderedUnPinnedFixedColumns,
				...dynamicColumns,
			];

			newColumns.forEach((column, index) => {
				if (column.pin_key) {
					column.style = {
						...column.style,
						left: calculateLeft(newColumns, index),
						zIndex: '7 !important',
						position: 'sticky',
						backgroundColor: '#fff',
					};
					const isLastPinnedColumn = index === pinnedColumns.length - 1;
					if (isLastPinnedColumn) {
						column.style.borderRight = '1px solid rgb(0 0 0 / 8%)';
					} else {
						column.style.borderRight = 'none';
					}
					const headerCell = document.querySelector(
						`.report-table-scroll .rdt_TableCol[data-column-id="${index + 1}"]`
					);
					if (headerCell) {
						stickyHeaderRefs.current[index] = headerCell;
						updateStickyPosition(headerCell, index, newColumns);
						if (index === pinnedColumns.length - 1) {
							headerCell.style.borderRight = '1px solid rgb(0 0 0 / 8%)';
						} else {
							headerCell.style.borderRight = 'none';
						}
					}
				} else {
					if (column.style && column.style.position === 'sticky') {
						column.style = {
							...column.style,
							position: undefined,
							zIndex: undefined,
							left: undefined,
							backgroundColor: undefined,
							borderRight: undefined,
						};
					}
					const headerCell = document.querySelector(
						`.report-table-scroll .rdt_TableCol[data-column-id="${index + 1}"]`
					);
					if (headerCell && headerCell.style.position === 'sticky') {
						headerCell.style.position = '';
						headerCell.style.zIndex = '';
						headerCell.style.left = '';
						headerCell.style.backgroundColor = '';
						headerCell.style.borderRight = '';
					}
				}
			});
			setColumns(newColumns);
		}
		// dynamicDimensionWidth?.forEach(column => {
		//   const cellSelector = `.rdt_TableCell[data-column-id="${column.data_column_id}"]`;
		//   const colSelector = `.rdt_TableCol[data-column-id="${column.data_column_id}"]`;
		//   const cellElement = document.querySelector(cellSelector);
		//   const colElement = document.querySelector(colSelector);
		//   if (cellElement && colElement) {
		//     cellElement.style.width = `${column.width}px`;
		//     cellElement.style.minWidth = `${column.minWidth}px`;
		//     cellElement.style.maxWidth = `${column.maxWidth}px`;
		//   }
		// });
	}, [sharedData, pinToggle, mainLoaderVisible]);

	useEffect(() => {
		if (sharedMatrixData?.columns?.length > 0) {
			const dataColumn = sharedMatrixData?.columns;

			// Determine fixed and dynamic columns based on names
			const fixedColumns = columns?.filter((column) =>
				[
					'ESTIMATED_EARNINGS',
					'IMPRESSION_RPM',
					'AD_REQUESTS',
					'MATCHED_REQUESTS',
					'MATCH_RATE',
					'IMPRESSIONS',
					'SHOW_RATE',
					'CLICKS',
					'IMPRESSION_CTR',
				]?.includes(column.sortValue)
			);

			const dynamicColumns = columns?.filter((column) => !fixedColumns.includes(column));
			// Create a map to easily access fixed columns by their name
			const reorderedFixedColumns = dataColumn
				?.map((column) => {
					const fixedColumn = fixedColumns.find((col) => col.sortValue === column.name);
					if (fixedColumn) {
						return fixedColumn;
					} else {
						return null; // Handle the case where a fixed column is not found
					}
				})
				.filter(Boolean);
			const newColumns = [...dynamicColumns, ...reorderedFixedColumns];
			setColumns(newColumns);
		}
	}, [sharedMatrixData]);

	//hide/show dimension
	const [isSwitch, setIsSwitch] = useState(true);
	const [isSwitchBox, setIsSwitchBox] = useState('');
	useEffect(() => {
		const changeValueString = localStorage?.getItem('isSwitchBoxlocal');
		if (changeValueString) {
			const changeValue = JSON?.parse(changeValueString);
			setIsSwitchBox(changeValue);
		} else {
			localStorage.setItem('isSwitchBoxlocal', true);
		}
	}, [reportResponse]);

	const handleChangeSwitch = () => {
		const switchBoxValuefromLocal = localStorage.getItem('isSwitchBoxlocal');
		if (switchBoxValuefromLocal === 'true') {
			const value = JSON?.parse(switchBoxValuefromLocal);
			setIsSwitchBox(!value);
			localStorage.setItem('isSwitchBoxlocal', !switchBoxValuefromLocal);
		} else {
			setIsSwitchBox(!isSwitchBox);
			localStorage.setItem('isSwitchBoxlocal', !isSwitchBox);
		}
	};

	//Ad unit show hide
	const handleUnitSwitch = () => {
		setIsReportLoaderVisible(true);
		setIsUnitSwitch(!isUnitSwitch);
		localStorage.setItem('unit_switch', JSON.stringify(!isUnitSwitch));
	};

	//table scroll
	const syncTableRefScroll = (scrollLeft) => {
		const tableWrapElement = document?.querySelector('.report-table-scroll');
		if (tableWrapElement) {
			tableWrapElement.scrollLeft = scrollLeft;
		}
	};
	//summary scroll
	function syncSummaryRefScroll(scrollLeft) {
		const summaryDiv = document?.querySelector('.total-records'); // Assuming you want to scroll the "summary" div
		if (summaryDiv) {
			if (summaryDiv !== undefined) {
				summaryDiv.scrollLeft = scrollLeft;
			}
		}
	}
	// // Function to get the scroll position of a target element
	function getScrollX(targetElement) {
		if (targetElement) {
			const scrollLeft = targetElement?.scrollLeft;
			syncSummaryRefScroll(scrollLeft);
		}
	}
	const targetElement = document?.querySelector('.report-table-scroll');
	useEffect(() => {
		const handleScroll = () => {
			const targetElement = document?.querySelector('.report-table-scroll');
			getScrollX(targetElement);
		};
		if (targetElement) {
			targetElement.addEventListener('scroll', () => handleScroll());
		}
		return () => {
			if (targetElement) {
				targetElement.removeEventListener('scroll', () => handleScroll());
			}
		};
	}, [targetElement]);

	const handleButtonClick = () => {
		setColumnWidth((width) => width + 1);
	};

	const [columnWidth, setColumnWidth] = useState('');
	useEffect(() => {
		const columnElements = document.querySelector('.rdt_TableCell[data-column-id="6"]');

		if (columnElements) {
			const newWidth = columnElements?.offsetWidth;
			setColumnWidth(newWidth);
		}
	}, [columnWidth, finalMatrix]);

	const matrixForNoData = finalMatrix.filter((item) => item);

	//csv
	const keys = [];

	const dimensionKeys = dimensionValue?.filter((item) => item.dimension_checked) ?? [];
	const matrixKeys = allMatrixData ?? [];
	for (const item of dimensionKeys) {
		keys.push(item.key);
		if (item.key === 'app_display_name') {
			keys.push('app_console_name', 'app_store_id');
		}
	}
	for (const item of matrixKeys) {
		keys.push(item.key);
	}
	const filteredData = updateTableNewData?.map((item) => {
		const filteredItem = {};
		keys.forEach((key) => {
			if (key === 'estimated_earnings' || key === 'observed_ecpm') {
				// Remove the dollar sign from the value if it exists
				filteredItem[key] = item[key]?.replace('$', '');
			} else {
				filteredItem[key] = item[key];
			}
		});
		return filteredItem;
	});
	const updatedSummaryData = {};
	for (const key in SummaryData) {
		if (SummaryData.hasOwnProperty(key)) {
			updatedSummaryData[key] = SummaryData[key]?.replace('$', '');
		}
	}
	const totalCalObject = updatedSummaryData;
	delete totalCalObject?.admob_currency_code;
	const updatedTotalObject = {};
	for (const key in totalCalObject) {
		const newKey = key?.replace('total_', '');
		updatedTotalObject[newKey] = totalCalObject[key];
	}
	const newFilteredData = [...filteredData];
	newFilteredData?.push(updatedTotalObject);
	const modifiedData = newFilteredData?.map(({ app_icon, ...rest }) => rest);
	const keyMapping = {
		app_display_name: 'Apps',
		app_console_name: 'Console Name',
		app_store_id: 'Package Name',
		report_date: 'Date',
		au_display_name: 'Ad Unit',
		au_format: 'Format',
		country_name: 'Country',
		app_version: 'App Version',
		estimated_earnings: 'Est. earnings (USD)',
		observed_ecpm: 'Observed eCPM (USD)',
		ad_requests: 'Requests',
		matched_requests: 'Matched requests',
		match_rate: 'Match rate (%)',
		impressions: 'Impressions',
		show_rate: 'Show rate (%)',
		clicks: 'Clicks',
		impression_ctr: 'CTR (%)',
	};

	const convertedData = modifiedData?.map((item) => {
		const newItem = {};
		for (const key in item) {
			if (item.hasOwnProperty(key)) {
				const newKey = keyMapping[key] || key;
				newItem[newKey] = item[key];
			}
		}
		return newItem;
	});

	const [orderFilter, setPreviousOrder] = useState([]);
	//conditional rendering of filter
	const getComponentOrder = () => {
		if (
			!(
				appValue?.length > 0 ||
				appVersionData?.length > 0 ||
				formatValue?.length > 0 ||
				unitValue?.length > 0 ||
				countryValue?.length > 0 ||
				platformValue?.length > 0 ||
				groupByValue?.length > 0
			)
		) {
			if (appVersion?.length > 0) {
				return [
					'AppPopup',
					'AppVersion',
					'FormatPopup',
					'AdUnitsPopup',
					'CountryPopup',
					'PlatformPopup',
					'GroupByPopup',
				];
			} else {
				return [
					'AppPopup',
					'FormatPopup',
					'AdUnitsPopup',
					'CountryPopup',
					'PlatformPopup',
					'GroupByPopup',
				];
			}
		} else {
			let remainingStates = [];
			if (appVersion?.length > 0) {
				remainingStates = [
					'AppPopup',
					'AppVersion',
					'FormatPopup',
					'AdUnitsPopup',
					'CountryPopup',
					'PlatformPopup',
					'GroupByPopup',
				];
			} else {
				remainingStates = [
					'AppPopup',
					'FormatPopup',
					'AdUnitsPopup',
					'CountryPopup',
					'PlatformPopup',
					'GroupByPopup',
				];
			}
			const stateValues = {
				AppPopup: appValue?.length,
				AppVersion: appVersionData?.length,
				FormatPopup: formatValue?.length,
				AdUnitsPopup: unitValue?.length,
				CountryPopup: countryValue?.length,
				PlatformPopup: platformValue?.length,
				GroupByPopup: groupByValue?.length,
			};

			const activeStates = Object?.keys(stateValues).filter((state) => stateValues[state] > 0);
			if (activeStates) {
				localStorage.setItem('reportState', JSON?.stringify(activeStates));
				if (selectedReportFilter) {
					let localState = localStorage?.getItem('reportState');
					let storeArray = JSON?.parse(localState || []);

					const index = storeArray.indexOf(selectedReportFilter);
					if (index > -1) {
						storeArray.splice(index, 1);
					}
					storeArray.push(selectedReportFilter);
					localStorage.setItem('reportState', JSON?.stringify(storeArray));
					remainingStates = remainingStates?.filter((state) => !storeArray?.includes(state));
					return [...storeArray, ...remainingStates];
				} else {
					remainingStates = remainingStates?.filter((state) => !activeStates?.includes(state));
					return [...activeStates, ...remainingStates];
				}
			} else {
				return [
					'AppPopup',
					'FormatPopup',
					'AdUnitsPopup',
					'CountryPopup',
					'PlatformPopup',
					'GroupByPopup',
				];
			}
		}
	};
	const renderComponent = (componentName) => {
		switch (componentName) {
			case 'AppPopup':
				return (
					<AppPopup
						key='AppPopup'
						disable={disable}
						filterPopupData={filterAppData}
						setPageNumber={setPageNumber}
						selectedAccountData={selectedAccountData}
						setIsReportLoaderVisible={setIsReportLoaderVisible}
						setCurrentUnitPage={setCurrentUnitPage}
						setDisabled={setDisabled}
						filteredAppData={filteredAppData}
						setFilteredAppData={setFilteredAppData}
						checkedApp={checkedApp}
						setCheckedApp={setCheckedApp}
						allAppData={allAppData}
						setAllAppData={setAllAppData}
					/>
				);
			case 'AppVersion':
				return (
					<AppVersion
						key='AppVersion'
						AppVersion={appVersion}
						setPageNumber={setPageNumber}
						selectedAccountData={selectedAccountData}
						setIsReportLoaderVisible={setIsReportLoaderVisible}
						setCurrentUnitPage={setCurrentUnitPage}
						AppVersionbool={adVersionBool}
					/>
				);
			case 'FormatPopup':
				return (
					<FormatPopup
						key='FormatPopup'
						setPageNumber={setPageNumber}
						setIsReportLoaderVisible={setIsReportLoaderVisible}
						setCurrentUnitPage={setCurrentUnitPage}
					/>
				);
			case 'AdUnitsPopup':
				return (
					<AdUnitsPopup
						key='AdUnitsPopup'
						setTableNewData={setTableNewData}
						filterPopupData={filterAdUnitData}
						setPageNumber={setPageNumber}
						selectedAccountData={selectedAccountData}
						setIsReportLoaderVisible={setIsReportLoaderVisible}
						setCurrentUnitPage={setCurrentUnitPage}
						disable={disable}
						setDisabled={setDisabled}
						filterData={filterData}
					/>
				);
			case 'CountryPopup':
				return (
					<CountryPopup
						key='CountryPopup'
						setPageNumber={setPageNumber}
						setIsReportLoaderVisible={setIsReportLoaderVisible}
						setCurrentUnitPage={setCurrentUnitPage}
						disable={disable}
						setDisabled={setDisabled}
						filterData={filterData}
						countryWiseSorting={countryWiseSorting}
						countryFlag={columnName?.includes('ESTIMATED_EARNINGS') && order?.includes('DESCENDING')}
					/>
				);
			case 'PlatformPopup':
				return (
					<PlatformPopup
						key='PlatformPopup'
						setPageNumber={setPageNumber}
						setIsReportLoaderVisible={setIsReportLoaderVisible}
						setCurrentUnitPage={setCurrentUnitPage}
						disable={disable}
						setDisabled={setDisabled}
					/>
				);
			case 'GroupByPopup':
				return <GroupByFilter key='GroupByPopup' setIsReportLoaderVisible={setIsReportLoaderVisible} />;
			default:
				return null;
		}
	};
	useEffect(() => {
		const filterOrder = getComponentOrder();
		setPreviousOrder(filterOrder);
	}, [appValue, appVersionData, formatValue, unitValue, countryValue, platformValue, appVersion]);

	const renderedComponents = orderFilter?.map((componentName) => renderComponent(componentName));

	useEffect(() => {
		$('.report-table-scroll .rdt_TableCol').each(function () {
			$(this).append('<div class="resizer-area"></div>');
		});
		return () => {
			$('.resizer-area').remove();
		};
	}, [reportResponse]);

	// resize
	const [resizeSticky, setResizeSticky] = useState(false);

	useEffect(() => {
		let isResizing = false;
		let startX = 0;
		let startWidth = 0;
		let initialColumnId = null;
		let initialWidth = null;
		let header = null;
		let isSticky = false;
		const columnWidths = {
			1: 85,
			2: 85,
			3: 85,
			4: 85,
			5: 85,
			6: 85,
			7: 106,
			'estimated-earnings': 110.75,
			'observed-ecpm': 65.75,
			request: 86.75,
			'matched-requests': 140,
			'match-rate': 117.75,
			impressions: 102.75,
			'show-rate': 111.75,
			clicks: 74.75,
			'impression-ctr': 79.75,
		};
		const initialColumnwidth = {};
		const onMouseDown = (e) => {
			const resizerArea = e?.target?.closest('.resizer-area');
			const resizerColumnHead = e.target.closest('.report-table-scroll .rdt_TableHeadRow ');
			if (resizerColumnHead) {
				e.preventDefault();
			}
			if (resizerArea) {
				e.preventDefault();
				const columnId = resizerArea
					? resizerArea?.parentElement?.getAttribute('data-column-id')
					: null;
				const elementWidthWithPx = resizerArea
					? resizerArea?.parentElement?.getBoundingClientRect()
					: null;
				const elementWidth = elementWidthWithPx?.width;
				if (e?.target?.classList.contains('resizer-area')) {
					isResizing = true;
					setToggleResize(false);
					startX = e.clientX;
					startWidth = e.target.offsetWidth;
					initialColumnId = columnId;
					initialWidth = elementWidth;
					if (!columnWidths?.hasOwnProperty(columnId)) {
						columnWidths[columnId] = initialWidth;
					}
					document.querySelectorAll('.rdt_TableCol').forEach((col) => {
						const colId = col.getAttribute('data-column-id');
						initialColumnwidth[colId] = col.getBoundingClientRect().width;
					});
				}
			}
			const header = document.querySelector(`.rdt_TableCol[data-column-id='${initialColumnId}']`);
			isSticky =
				parseInt(initialColumnId, 10) >= 1 &&
				parseInt(initialColumnId, 10) <= 7 &&
				header?.style.position === 'sticky';
		};

		const onMouseMove = debounce((e) => {
			if (!isResizing) return;
			const header = document.querySelector(`.rdt_TableCol[data-column-id='${initialColumnId}']`);

			const matches = document.querySelectorAll(`.rdt_TableCell[data-column-id='${initialColumnId}']`);
			let newWidth = startWidth + initialWidth + (e.clientX - startX);
			if (newWidth < columnWidths[initialColumnId]) {
				newWidth = columnWidths[initialColumnId];
			}
			if (header) {
				header.style.width = newWidth + 'px';
				header.style.minWidth = newWidth + 'px';
				header.style.maxWidth = newWidth + 'px';
			}
			matches?.forEach((item) => {
				if (item) {
					item.style.width = newWidth + 'px';
					item.style.minWidth = newWidth + 'px';
					item.style.maxWidth = newWidth + 'px';
				}
			});
			const updateLeftProperty = (element, cumulativeWidth) => {
				if (element) {
					element.style.left = `${cumulativeWidth}px`;
				}
			};
			function calculatePrevAllWidth(columnId) {
				let cumulativeWidth = 0;
				for (let i = 1; i <= columnId; i++) {
					const prevHeader = document.querySelector(`.rdt_TableCol[data-column-id='${i}']`);
					if (prevHeader) {
						cumulativeWidth += prevHeader?.getBoundingClientRect().width;
					}
				}
				return cumulativeWidth;
			}
			if (isSticky) {
				setResizeSticky(true);
				const columnId = +initialColumnId;
				for (let index = columnId + 1; index <= 7; index++) {
					const header = document.querySelector(`.rdt_TableCol[data-column-id='${index}']`);
					if (header && header.style.position === 'sticky') {
						const cumulativeWidth = calculatePrevAllWidth(index - 1);
						updateLeftProperty(header, cumulativeWidth);
						document
							.querySelectorAll(`.rdt_TableCell[data-column-id='${index}']`)
							.forEach((item) => updateLeftProperty(item, cumulativeWidth));
					}
				}
			}

			document.querySelectorAll('.rdt_TableCol').forEach((col) => {
				const colId = col.getAttribute('data-column-id');
				if (colId !== initialColumnId && !(colId >= 1 && colId <= 8)) {
					const newColWidth = initialColumnwidth[colId];
					col.style.width = newColWidth + 'px';
					col.style.minWidth = newColWidth + 'px';
					col.style.maxWidth = newColWidth + 'px';
					document.querySelectorAll(`.rdt_TableCell[data-column-id='${colId}']`).forEach((item) => {
						item.style.width = newColWidth + 'px';
						item.style.minWidth = newColWidth + 'px';
						item.style.maxWidth = newColWidth + 'px';
					});
				}
			});
		}, 0);
		const onMouseUp = () => {
			isResizing = false;
		};
		const resetFunctions = () => {
			const header = document.querySelectorAll(`.rdt_TableCol`);
			const cells = document.querySelectorAll(`.rdt_TableCell`);
			if (header) {
				header?.forEach((item) => {
					if (item) {
						item.style.width = '';
						item.style.minWidth = '';
						item.style.maxWidth = '';
					}
				});
			}
			if (cells) {
				cells?.forEach((item) => {
					if (item) {
						item.style.width = '';
						item.style.minWidth = '';
						item.style.maxWidth = '';
						item.style.left = '';
					}
				});
			}
		};
		if ((resizeSticky === true && toggleRize === true) || toggleRize === true) {
			resetFunctions();
		}
		window.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}, [resizeSticky, toggleRize, setToggleResize, setResizeSticky]);

	//conditional css
	const conditionalRowStyles = [
		{
			when: (row) => row.ad_requests,
			classNames: ['ad-request'],
		},
	];

	useEffect(() => {
		if (graphClick || adunitDashboardClick) {
			const closeSidebar = () => {
				if (location.pathname.includes('/reports')) {
					$('.sidebar-wrap').addClass('open-menu');
					$('.right-box-wrap').addClass('open-box');
				}
			};
			closeSidebar();
			return () => {};
		}
	}, [location.pathname]);

	const { addClass } = useStickyOnScroll({ topSpace: 15 });

	useTableHover(mainLoaderVisible, '.report-table-scroll');

	const showMainLoader = isPending && !isPlaceholderData;
	const showOverlayLoader = isFetching && isPlaceholderData;

	return (
		<div className={`right-box-wrap`}>
			<div className='table-box-wrap main-box-wrapper pdglr24 report-table-box'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='popup-full-wrapper reports-popup-box active'>
						<div className={`action-bar-container report-page-topbar ${addClass ? 'sticky_filter' : ''}`}>
							<div className='middle-section'>
								<div className='filter-bar-wrap'>
									<div className={`${isFetching ? 'disabled-div' : ''} filter-box`}>
										<DateRangePopup
											perfermanceDateRange={perfermanceDateRange}
											selectedStartDate={selectedStartDate}
											selectedEndDate={selectedEndDate}
											setPageNumber={setPageNumber}
											setIsReportLoaderVisible={setIsReportLoaderVisible}
											setCurrentUnitPage={setCurrentUnitPage}
											disable={disable}
											setDisabled={setDisabled}
										/>
										<AccountSelectPopup
											filterPopupData={filterAccountData}
											filterActualData={filterPopupData}
											selectedAccountData={selectedAccountData}
											setSelectedAccountData={setSelectedAccountData}
											setTableNewData={setTableNewData}
											setPageNumber={setPageNumber}
											setIsReportLoaderVisible={setIsReportLoaderVisible}
											setCurrentUnitPage={setCurrentUnitPage}
											setAccountChecked={setAccountChecked}
											disable={disable}
											setDisabled={setDisabled}
											filteredAppData={filteredAppData}
											setFilteredAppData={setFilteredAppData}
											setCheckedApp={setCheckedApp}
											allAppData={allAppData}
											setAllAppData={setAllAppData}
										/>
										{renderedComponents}
									</div>
								</div>
							</div>
							<div className='more-button three-icon-button'>
								<MdMoreVert className='material-icons' />
								<div className='more-box w-250'>
									<div className='border-box'>
										<CSVLink className='downloadbtn' filename='admob-report.csv' data={convertedData}>
											<span className='material-icons'>
												<FiDownload style={{ marginTop: '6px' }} />
											</span>
											Download CSV
										</CSVLink>
									</div>

									<div
										className='border-box'
										style={{
											display: 'flex',
											padding: '6px 12px',
										}}
									>
										<span
											className='material-icons'
											style={{
												padding: '0px 10px',
												fontSize: '20px',
											}}
										>
											<MdOutlineEdit
												style={{
													fontSize: '24px',
													color: 'grey',
												}}
											/>
										</span>

										<div className='show-button'>Dimension / Metrics</div>
										<label className='switch toggle-icon' htmlFor='checkbox' style={{ position: 'relative' }}>
											<input
												type='checkbox'
												id='checkbox'
												value={!isSwitchBox}
												onChange={handleChangeSwitch}
												checked={isSwitchBox}
											/>
											<div className='slider round'></div>
										</label>
									</div>

									<div
										className={`border-box unit_switch ${!isAdUnitClick ? 'switch_disabled' : ''}`}
										style={{
											display: 'flex',
											padding: '6px 12px',
										}}
										title={!isAdUnitClick ? 'Select Ad Unit Dimension' : ''}
									>
										<span
											className='material-icons'
											style={{
												padding: '0px 10px',
												fontSize: '20px',
											}}
										>
											<BiGitCompare
												style={{
													fontSize: '22px',
													color: 'grey',
												}}
											/>
										</span>

										<div className='show-button'>Ad Unit Comparison</div>
										<label
											className={`switch toggle-icon`}
											htmlFor='unit_checkbox'
											style={{ position: 'relative' }}
										>
											<input
												type='checkbox'
												id='unit_checkbox'
												value={isUnitSwitch}
												onChange={handleUnitSwitch}
												checked={isAdUnitClick && isUnitSwitch}
												disabled={!isAdUnitClick}
											/>
											<div className='slider round'></div>
										</label>
									</div>
								</div>
							</div>
						</div>
						<div className='popup-full-box form-box-wrap form-wizard'>
							{isSwitch && (
								<div
									className={`popup-box-wrapper ${
										isSwitchBox ? 'show-dimension-Box' : ''
									} report-table-popup-box ${sharedData?.length > 0 ? '' : 'emit-column-css'} `}
								>
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
											<DataTable
												columns={columns}
												className={`report-table-scroll ${
													Math.ceil(totalUnitPage) > 1 ? '' : 'report-table-height'
												} ${isAdUnitClick && isUnitSwitch ? 'custom_unit_select' : ''}`}
												data={currentAdUnitData}
												pagination={true}
												paginationPerPage={100}
												//paginationServer
												progressPending={false}
												fixedHeader
												fixedHeaderScrollHeight={'79.8vh'}
												paginationComponent={() => (
													<CustomReportPagination
														Data={currentAdUnitData}
														pageNumber={currentUnitPage}
														paginationList={Math.ceil(totalUnitPage)}
														setPageNumber={setCurrentUnitPage}
														rowCount={currentAdUnitData?.length}
														totalRecords={tableNewData?.total_records_data}
														syncTableRefScroll={syncTableRefScroll}
														finalMatrix={finalMatrix}
														dimensionMatrix={dimensionMatrix}
														setIsLoaderVisible={setIsReportLoaderVisible}
														dimensionValue={dimensionValue}
														sharedMatrixData={sharedMatrixData}
														columnWidth={columnWidth}
														sharedData={sharedData}
														styleWidth={styleWidth}
													/>
												)}
												progressComponent={<CustomLoadingIndicator />}
												noDataComponent={<CustomNoDataComponent />}
												onSort={customSort}
												sortServer
												highlightOnHover
												defaultSortAsc={false}
												conditionalRowStyles={conditionalRowStyles}
												sortIcon={<TableSortArrow />}
												manualColumnResize
											/>
										)}
									</div>
									{isSwitchBox && (
										<div className='matrix-box'>
											<DimensionBox
												Data={currentAdUnitData}
												setDimensionMatrix={setDimensionMatrix}
												setPageNumber={setPageNumber}
												setIsReportLoaderVisible={setIsReportLoaderVisible}
												setCurrentUnitPage={setCurrentUnitPage}
												syncTableRefScroll={syncTableRefScroll}
												disable={disable}
												setDisabled={setDisabled}
												setIsUnitSwitch={setIsUnitSwitch}
											/>

											<MatrixBox
												setPageNumber={setPageNumber}
												handleClick={handleButtonClick}
												setIsReportLoaderVisible={setIsReportLoaderVisible}
												setCurrentUnitPage={setCurrentUnitPage}
												syncTableRefScroll={syncTableRefScroll}
												disable={disable}
												setDisabled={setDisabled}
											/>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
				<Footer />
			</div>
		</div>
	);
};

export default ReportContentBoxOld;
