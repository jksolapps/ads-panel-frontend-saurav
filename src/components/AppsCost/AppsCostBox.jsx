/** @format */

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import useGeneratePagination from '../../hooks/useGeneratePagination';
import { useCostColumns } from './useCostColumn';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import { ReportContext } from '../../context/ReportContext';

import { useLocation } from 'react-router-dom';
// table sort arrow svg removed (not used by TanStack table here)
import AccountPageAccountPopup from '../AccountPageComponents/Popups/AccountPageAccountPopup';
import AccountPlatFormPopup from '../AccountPageComponents/Popups/AccountPlatFormPopup';
import CheckMark from '../AccountPageComponents/Popups/CheckMark';
import GroupBy from '../AccountPageComponents/Popups/GroupBy';
import { MdMoreVert } from 'react-icons/md';
import { CSVLink } from 'react-csv';
import { indianNumberFormat, microValueConvert } from '../../utils/helper';
import Swal from 'sweetalert2';
import { FiDownload } from 'react-icons/fi';
import { LuInfo } from 'react-icons/lu';
import useApi from '../../hooks/useApi';
import { AiOutlinePercentage } from 'react-icons/ai';
import ShowByFilter from '../AccountPageComponents/Popups/ShowByFilter';
import moment from 'moment';
import GeneralDateRange from '../GeneralFilters/GeneralDateRange';
import CostInfoModal from './CostInfoModal';
import GeneralAppFilter from '../GeneralFilters/GeneralAppFilter';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useGroupSettings } from '../../context/GroupSettingsContext';

const AppsCostBox = () => {
	const {
		popupFlags,
		setPopupFlags,
		accountOrder,
		checkMark,
		orderToggle,
		setOrderToggle,
		performanceData,
	} = useContext(ReportContext);

	const { selectedGroup } = useGroupSettings();

	// all state
	const [appList, setAppList] = useState([]);
	const [fetchdata, setfetchdata] = useState([]);
	const [filterData, setFilterData] = useState([]);
	const [appPageNumber, setAppPageNumber] = useState(1);
	const [appPageLength, setAppPageLength] = useState(10);
	const [appTotalPages, setAppTotalPages] = useState('');
	const [appPaginationList, setAppPaginationList] = useState([]);
	const [mainLoaderVisible, setMainLoaderVisible] = useState(true);
	const [isReportLoaderVisible, setIsReportLoaderVisible] = useState(false);
	const [filterAccountData, setFilterAccountData] = useState([]);
	const [filterPopupData, setFilterPopupData] = useState([]);
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);
	const [currentUnitPage, setCurrentUnitPage] = useState(1);
	const [summaryData, setSummaryData] = useState([]);
	const [summaryDateWise, setSummaryDateWise] = useState([]);
	const [currentDate, setCurrentDate] = useState([]);
	const [updateTableNewData, setUpdatedTableNewData] = useState([]);
	const [sortedArray, setSortedArray] = useState([]);
	const [datesInArray, setDatesInarray] = useState([]);
	const [isDataPresent, setIsDataPresent] = useState(false);
	const [percentageInfo, setPercentageInfo] = useState(false);
	const [totalFlag, setTotalFlag] = useState(false);
	const [ispercentage, setIsPercentage] = useState(false);
	const [isRouteChange, setRouteChange] = useState(true);
	const [isSorting, setIsSorting] = useState(false);
	const { state } = useLocation();

	//Handle show hide
	const TOGGLE_KEY = 'isCostPercentageCheck';
	const VIS_KEY = 'costVisibilityState';
	const VIS_STATES = ['value', 'percentage', 'both'];
	const [isPercentageBool, setIsPercentageBool] = useState(() => {
		const s = localStorage.getItem(TOGGLE_KEY);
		if (s == null) return false;
		try {
			return JSON.parse(s);
		} catch {
			return s === 'true';
		}
	});

	//New Filter
	const localShowFilter = JSON.parse(sessionStorage.getItem('apps_cost_show_by_filter'));
	const [showByFilter, setShowByFilter] = useState(localShowFilter ? localShowFilter : []);

	const finalShowFilter = useMemo(() => {
		return showByFilter?.map((item) => item?.value);
	}, [showByFilter]);

	const monthFilterActive = useMemo(() => finalShowFilter?.includes('MONTH'), [finalShowFilter]);
	const yearFilterActive = useMemo(() => finalShowFilter?.includes('YEAR'), [finalShowFilter]);
	const weekFilterActive = useMemo(() => finalShowFilter?.includes('WEEK'), [finalShowFilter]);

	//New state
	const localDateRange = JSON.parse(sessionStorage.getItem('apps_cost_date_range'));
	const [costDateRange, setCostDateRange] = useState(localDateRange ? localDateRange : '');

	const [accountPlatform, setAccountPlatform] = useState(() => {
		const stored = sessionStorage.getItem('cost_platform_filter');
		return stored ? JSON.parse(stored) : [];
	});
	const [accountNewApp, setAccountNewApp] = useState(() => {
		const stored = sessionStorage.getItem('cost_app_filter');
		return stored ? JSON.parse(stored) : [];
	});
	const [accountGroupBy, setAccountGroupBy] = useState(() => {
		const stored = sessionStorage.getItem('cost_group_filter');
		return stored ? JSON.parse(stored) : [];
	});

	const [accountAdmob, setAccountAdmob] = useState(() => {
		const stored = sessionStorage.getItem('cost_admob_filter');
		return stored ? JSON.parse(stored) : [];
	});

	//checking type
	// setting formdata
	const newStartDate = new Date(costDateRange[0]?.startDate);
	newStartDate.setHours(0, 0, 0, 0);
	const selectedStartDate = newStartDate.toLocaleDateString('en-GB');
	const newEndDate = new Date(costDateRange[0]?.endDate);
	newEndDate.setHours(23, 59, 59, 999);
	const today = new Date();
	today.setHours(23, 59, 59, 999);
	if (newEndDate > today) {
		newEndDate.setTime(today.getTime());
	}
	const selectedEndDate = newEndDate.toLocaleDateString('en-GB');

	const firstData = selectedStartDate;
	const startDateformat = convertDateStringToTuple(firstData);
	const firstDate = new Date(startDateformat[0], startDateformat[1], startDateformat[2]);
	const endData = selectedEndDate;
	const endDateformat = convertDateStringToTuple(endData);
	const secondDate = new Date(endDateformat[0], endDateformat[1], endDateformat[2]);

	const lastDate = newEndDate.toLocaleDateString('en-GB', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});
	const startDate = newStartDate.toLocaleDateString('en-GB', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});
	//final date for css conditioning
	const lastDateInDashFormat = yearFilterActive
		? moment(lastDate, 'DD/MM/YYYY').format('YYYY')
		: monthFilterActive
		? moment(lastDate, 'DD/MM/YYYY').format('YYYY-MM')
		: weekFilterActive
		? moment(lastDate, 'DD/MM/YYYY').format('GGGG-[W]WW')
		: moment(lastDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
	const startDateInDashFormat = yearFilterActive
		? moment(startDate, 'DD/MM/YYYY').format('YYYY')
		: monthFilterActive
		? moment(startDate, 'DD/MM/YYYY').format('YYYY-MM')
		: weekFilterActive
		? moment(startDate, 'DD/MM/YYYY').format('GGGG-[W]WW')
		: moment(startDate, 'DD/MM/YYYY').format('YYYY-MM-DD');

	const oneDay = 24 * 60 * 60 * 1000;
	let diffDays;
	if (monthFilterActive) {
		diffDays =
			(secondDate.getFullYear() - firstDate.getFullYear()) * 12 +
			(secondDate.getMonth() - firstDate.getMonth()) +
			1;
	} else if (weekFilterActive) {
		diffDays =
			moment(secondDate).startOf('isoWeek').diff(moment(firstDate).startOf('isoWeek'), 'weeks') + 1;
	} else if (yearFilterActive) {
		diffDays = secondDate.getFullYear() - firstDate.getFullYear() + 1;
	} else {
		diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay) + 1);
	}

	const startSelection = costDateRange[0]?.startDate;
	const newStartRangeDate = new Date(startSelection);
	newStartRangeDate.setDate(new Date(startSelection)?.getDate() - 1);
	const selectedNewStartDate = newStartRangeDate.toLocaleDateString('en-GB');

	const endSelection = costDateRange[0]?.endDate;
	new Date(endSelection)?.setHours(0, 0, 0, 0);

	const [allAppList, setAllAppList] = useState([]);
	//get-analytics-api call
	const filterAccData = useMemo(() => {
		const fd = new FormData();
		fd?.append('user_id', localStorage.getItem('id'));
		fd?.append('user_token', localStorage.getItem('token'));
		if (selectedGroup?.length > 0) {
			fd.append('gg_id', selectedGroup);
		}
		return fd;
	}, [selectedGroup]);

	const { data: appResponse, isSuccess: isAppSuccess } = useQueryFetch(
		['cost-filter-data', selectedGroup],
		'get-analytics-filtering-data',
		filterAccData,
		{
			staleTime: 5 * 60 * 1000,
			refetchOnMount: 'ifStale',
		}
	);
	useEffect(() => {
		if (!isAppSuccess || !appResponse) return;
		const response = appResponse;
		const uniqueAppData = response?.all_app_list
			?.filter((v, i, self) => self?.findIndex((t) => t?.admob_email === v?.admob_email) === i)
			.map((v, i) => ({
				...v,
				item_checked: false,
				id: i,
			}));

		let data = response?.all_app_list;

		const uniqueAppAutoIdObjects = [];
		Object?.keys(data)?.forEach((key) => {
			const entry = data[key];

			if (!uniqueAppAutoIdObjects.some((obj) => obj?.app_auto_id === entry?.app_auto_id)) {
				uniqueAppAutoIdObjects?.push(entry);
			}
		});

		setAllAppList(uniqueAppAutoIdObjects);
		setFilterData(uniqueAppAutoIdObjects);
		setFilterAccountData(uniqueAppData);
		setFilterPopupData(response);
		setIsDataPresent(true);
	}, [appResponse, isAppSuccess]);

	useEffect(() => {
		if (accountAdmob.length > 0) {
			const updatedApp = allAppList?.filter((item) => {
				const isMatched = accountAdmob?.some((innerItem) => {
					return item.admob_auto_id == innerItem.admob_auto_id;
				});
				if (isMatched) {
					const accountAppMatch = accountNewApp?.find((accountItem) => {
						return item.app_auto_id === accountItem.app_auto_id;
					});
					if (accountAppMatch) {
						item.item_checked = true;
					}
				}
				return isMatched;
			});

			setFilterData(updatedApp);
		} else {
			setFilterData(allAppList);
		}
	}, [accountAdmob, popupFlags, allAppList]);

	// list_admob_revenue api

	const sortingColumn = useMemo(
		() => accountOrder?.map((item) => item?.sorting_column),
		[accountOrder]
	);
	const sortingOrder = useMemo(
		() => accountOrder?.map((item) => item?.sorting_order),
		[accountOrder]
	);
	const finalGroup = useMemo(
		() => accountGroupBy?.map((item) => item?.app_auto_id),
		[accountGroupBy]
	);
	const finalApp = useMemo(() => accountNewApp?.map((item) => item?.app_auto_id), [accountNewApp]);
	const finalPlatform = useMemo(
		() => accountPlatform?.map((item) => item?.platform_value),
		[accountPlatform]
	);

	const costFormData = useMemo(() => {
		const formData = new FormData();
		formData?.append('user_id', localStorage?.getItem('id'));
		formData?.append('user_token', localStorage?.getItem('token'));
		if (selectedGroup?.length > 0) {
			formData.append('gg_id', selectedGroup);
		}
		// appending form data values
		if (costDateRange?.length > 0) {
			formData?.append('analytics_date_range', `${selectedNewStartDate}-${selectedEndDate}`);
		}
		if (sortingColumn?.length > 0) {
			formData?.append('sorting_column', sortingColumn?.join(','));
		}
		if (sortingOrder?.length > 0) {
			formData?.append('sorting_order', sortingOrder?.join(','));
		}
		if (finalGroup?.length > 0) {
			formData.append('selected_app_auto_id', finalGroup.join(','));
		}
		if (finalApp?.length > 0) {
			formData.append('selected_app_auto_id', finalApp.join(','));
		}
		if (accountAdmob?.length > 0) {
			const finalSelectedAccount = accountAdmob
				?.map((item) => {
					return item?.admob_auto_id;
				})
				.join(',');
			const finalSelectedAccountArray = finalSelectedAccount?.split(',')?.map(Number);
			formData?.append('selected_admob_auto_id', finalSelectedAccountArray.join(','));
		}
		if (finalPlatform?.length > 0) {
			formData.append('selected_app_platform', finalPlatform.join(','));
		}
		return formData;
	}, [
		selectedNewStartDate,
		selectedEndDate,
		sortingColumn,
		sortingOrder,
		finalGroup,
		finalApp,
		finalPlatform,
		accountAdmob,
		selectedGroup,
	]);

	const isQueryEnabled = costDateRange?.length > 0;

	const {
		data: response,
		isLoading,
		isFetching,
		isSuccess,
	} = useQueryFetch(
		[
			'cost-table',
			'group_select',
			selectedNewStartDate,
			selectedEndDate,
			sortingColumn,
			sortingOrder,
			finalGroup,
			finalApp,
			finalPlatform,
			accountAdmob,
			selectedGroup,
		],
		'list-apps-cost',
		costFormData,
		{
			enabled: isQueryEnabled,
			staleTime: 10 * 1000,
			refetchOnMount: 'ifStale',
		}
	);

	useEffect(() => {
		if (!isSuccess || !response) return;
		const data = response?.info;
		// store response in array
		const resonseInArray = Object.values(data || {}).map((entry) => ({
			...entry,
			data_by_date: Array.isArray(entry?.data_by_date)
				? entry.data_by_date.map((d) => ({
						...d,
						report_date: moment(d.report_date, 'YYYYMMDD').format('YYYY-MM-DD'),
				  }))
				: [],
		}));
		const startDate = new Date(selectedStartDate.split('/').reverse().join('-'));
		const endDate = new Date(selectedEndDate.split('/').reverse().join('-'));
		if (monthFilterActive) {
			resonseInArray.forEach((app) => {
				const monthlyData = {};
				app.data_by_date.forEach((entry) => {
					const reportDate = new Date(entry.report_date);
					const monthKey = entry.report_date.substring(0, 7);
					if (!monthlyData[monthKey]) {
						monthlyData[monthKey] = {
							report_value_original: 0,
							report_value: 0,
						};
					}
					if (reportDate >= startDate && reportDate <= endDate) {
						monthlyData[monthKey].report_value_original += Number(
							entry?.report_value_original?.replace('$', '')?.replace(',', '')
						);
						const cleanedValue = entry?.report_value?.replace(/[^0-9.-]+/g, '');
						monthlyData[monthKey].report_value += Number(cleanedValue);
					}
				});
				app.data_by_date = Object.keys(monthlyData)
					.filter((month) => {
						const monthDate = new Date(month + '-01');
						const monthStartDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
						const monthEndDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
						return (
							(monthStartDate >= startDate && monthStartDate <= endDate) ||
							(monthEndDate >= startDate && monthEndDate <= endDate) ||
							(monthStartDate <= startDate && monthEndDate >= endDate)
						);
					})
					.map((month) => ({
						report_date: month,
						report_value_original:
							app?.row_type == 'Impressions'
								? monthlyData[month].report_value_original.toFixed(2)
								: `$${monthlyData[month].report_value_original.toFixed(2)}`,
						report_value: `${monthlyData[month].report_value}`,
					}));
			});
		} else if (weekFilterActive) {
			const startM = moment(selectedStartDate.split('/').reverse().join('-'));
			const endM = moment(selectedEndDate.split('/').reverse().join('-'));
			resonseInArray.forEach((app) => {
				const weeklyData = {};
				app.data_by_date.forEach((entry) => {
					const entryM = moment(entry.report_date, 'YYYY-MM-DD');
					const weekKey = entryM.format('GGGG-[W]WW');
					if (!weeklyData[weekKey]) {
						weeklyData[weekKey] = { report_value_original: 0, report_value: 0 };
					}
					if (entryM.isBetween(startM.startOf('isoWeek'), endM.endOf('isoWeek'), undefined, '[]')) {
						weeklyData[weekKey].report_value_original += Number(
							entry?.report_value_original?.replace('$', '')?.replace(',', '')
						);
						const cleanedValue = entry?.report_value?.replace(/[^0-9.-]+/g, '');
						weeklyData[weekKey].report_value += Number(cleanedValue);
					}
				});
				app.data_by_date = Object.keys(weeklyData)
					.map((week) => ({
						report_date: week,
						report_value_original: `$${weeklyData[week].report_value_original.toFixed(2)}`,
						report_value: `${weeklyData[week].report_value}`,
					}))
					.sort(
						(a, b) =>
							moment(a.report_date, 'GGGG-[W]WW').toDate() - moment(b.report_date, 'GGGG-[W]WW').toDate()
					);
			});
		} else if (yearFilterActive) {
			const startYear = new Date(selectedStartDate.split('/').reverse().join('-')).getFullYear();
			const endYear = new Date(selectedEndDate.split('/').reverse().join('-')).getFullYear();

			resonseInArray.forEach((app) => {
				const yearlyData = {};
				app.data_by_date.forEach((entry) => {
					const reportDate = new Date(entry.report_date);
					const yearKey = reportDate.getFullYear();
					if (!yearlyData[yearKey]) {
						yearlyData[yearKey] = {
							report_value_original: 0,
							report_value: 0,
						};
					}
					if (reportDate >= startDate && reportDate <= endDate) {
						yearlyData[yearKey].report_value_original += Number(
							entry?.report_value_original?.replace('$', '')?.replace(',', '')
						);
						const cleanedValue = entry?.report_value?.replace(/[^0-9.-]+/g, '');
						yearlyData[yearKey].report_value += Number(cleanedValue);
					}
				});
				app.data_by_date = Object.keys(yearlyData)
					.filter((year) => {
						return year >= startYear && year <= endYear;
					})
					.map((year) => ({
						report_date: year,
						report_value_original: `$${yearlyData[year].report_value_original.toFixed(2)}`,
						report_value: `${yearlyData[year].report_value}`,
					}));
			});
		}

		const totals = {};
		resonseInArray?.forEach((item) => {
			const { this_month, last_month } = item;
			const convertedThismonth = this_month ? parseFloat(this_month?.replace(/,/g, '')) : 0;
			const convertedLastmonth = last_month ? parseFloat(last_month?.replace(/,/g, '')) : 0;
			const thisMonthCount = convertedThismonth ? convertedThismonth : 0;
			const lastMonthCount = convertedLastmonth ? convertedLastmonth : 0;
			if (!totals['Revenue']) {
				totals['Revenue'] = {
					this_month: 0,
					last_month: 0,
				};
			}
			totals.Revenue.this_month += thisMonthCount;
			totals.Revenue.last_month += lastMonthCount;
		});
		// date wise
		const groupedData = {};
		const totalImpressions = {};
		let totalRevenue = 0;

		resonseInArray?.forEach((item) => {
			item?.data_by_date?.forEach((entry) => {
				const { report_date, report_value_original, report_value } = entry;
				const convertValue = report_value ? report_value?.replace(/[^0-9.-]+/g, '') : 0;
				const value = +convertValue ? +convertValue : 0;

				if (!isNaN(value)) {
					const currentDate = new Date(report_date);
					const startMonthYear = `${newStartDate.getFullYear()}-${String(
						newStartDate.getMonth() + 1
					).padStart(2, '0')}`;
					const endMonthYear = `${newEndDate.getFullYear()}-${String(newEndDate.getMonth() + 1).padStart(
						2,
						'0'
					)}`;

					// Format report_date for monthYear comparison
					const reportDate = new Date(report_date);
					const monthYear = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(
						2,
						'0'
					)}`;

					if (monthFilterActive) {
						// Compare monthYear instead of full date
						if (monthYear >= startMonthYear && monthYear <= endMonthYear) {
							// Use "YYYY-MM" for monthly aggregation
							if (!groupedData[monthYear]) {
								groupedData[monthYear] = { revenue: 0 };
							}
							groupedData[monthYear].revenue += value;
							totalRevenue += value;
						}
					} else if (weekFilterActive) {
						const weekKey = moment(report_date, ['YYYY-MM-DD', 'GGGG-[W]WW']).format('GGGG-[W]WW');
						if (!groupedData[weekKey]) {
							groupedData[weekKey] = { revenue: 0 };
						}
						const entryWeekStart = moment(report_date, ['YYYY-MM-DD', 'GGGG-[W]WW'])
							.startOf('isoWeek')
							.toDate();
						const rangeStart = moment(newStartDate).startOf('isoWeek').toDate();
						const rangeEnd = moment(newEndDate).endOf('isoWeek').toDate();
						if (entryWeekStart >= rangeStart && entryWeekStart <= rangeEnd) {
							groupedData[weekKey].revenue += value;
							totalRevenue += value;
						}
					} else if (yearFilterActive) {
						if (
							currentDate.getFullYear() >= newStartDate.getFullYear() &&
							currentDate.getFullYear() <= newEndDate.getFullYear()
						) {
							const formattedYear = report_date.split('-')[0];
							if (!groupedData[formattedYear]) {
								groupedData[formattedYear] = { revenue: 0 };
							}
							groupedData[formattedYear].revenue += value;
							totalRevenue += value;
						}
					} else {
						if (currentDate >= newStartDate && currentDate <= newEndDate) {
							const formattedDate = report_date?.split('-')?.reverse()?.join('/'); // For daily data

							if (!groupedData[formattedDate]) {
								groupedData[formattedDate] = { revenue: 0 };
							}
							groupedData[formattedDate].revenue += value;
							totalRevenue += value;
						}
					}
				}
			});
		});

		const totalECPM = {};
		for (const date in groupedData) {
			if (groupedData?.hasOwnProperty(date) && totalImpressions[date]) {
				totalECPM[date] = (groupedData[date].revenue / totalImpressions[date]) * 1000;
			}
		}
		const total = [];
		const dates = Object.keys(groupedData).sort((a, b) => {
			if (weekFilterActive) {
				return moment(a, 'GGGG-[W]WW').toDate() - moment(b, 'GGGG-[W]WW').toDate();
			}
			return new Date(a) - new Date(b);
		});
		dates?.forEach((date) => {
			const { revenue } = groupedData[date];
			total.push({ [date]: { revenue } });
		});
		setSummaryDateWise(total);
		setSummaryData([{ Revenue: totals?.Revenue }]);
		setAppList(resonseInArray);
		setIsReportLoaderVisible(false);
		setAppTotalPages(response?.iTotalDisplayRecords / appPageLength);
		setTotalFlag(!totalFlag);
	}, [isSuccess, response, finalShowFilter, weekFilterActive, monthFilterActive, yearFilterActive]);

	function convertDateStringToTuple(dateString) {
		const parts = dateString.split('/');
		const day = parseInt(parts[0], 10);
		const month = parseInt(parts[1], 10) - 1;
		const year = parseInt(parts[2], 10);
		return [year, month, day];
	}

	//longest length
	let longestLength = 0;
	let longestDataArray = null;
	const updatedAppList = appList.map((app) => {
		return {
			...app,
			data_by_date: app.data_by_date.filter((entry) => {
				if (weekFilterActive) {
					const entryWeekStart = moment(entry.report_date, 'GGGG-[W]WW').startOf('isoWeek').toDate();
					const rangeStart = moment(newStartDate).startOf('isoWeek').toDate();
					const rangeEnd = moment(endSelection).endOf('isoWeek').toDate();
					return entryWeekStart >= rangeStart && entryWeekStart <= rangeEnd;
				}
				const entryDate = new Date(entry.report_date);
				return entryDate >= newStartDate && entryDate <= endSelection;
			}),
		};
	});
	for (const app of updatedAppList) {
		const dataByDate = app?.data_by_date;
		const currentLength = dataByDate?.length ?? 0; // Handle potential undefined values

		if (currentLength > longestLength) {
			longestLength = currentLength;
			longestDataArray = dataByDate;
		}
	}

	//handle double click on  columns
	const applyState = useCallback((state) => {
		document.documentElement.setAttribute('data-vis', state);
		localStorage.setItem(VIS_KEY, state);
		setIsPercentage(state === 'percentage');
	}, []);

	const getSavedVis = () => {
		const s = localStorage.getItem(VIS_KEY);
		return VIS_STATES.includes(s) ? s : 'value';
	};

	// hydrate on load
	useEffect(() => {
		applyState(getSavedVis());
		document.documentElement.setAttribute(
			'data-per',
			isPercentageBool ? 'per_check_off' : 'per_check_on'
		);
		localStorage.setItem(TOGGLE_KEY, String(isPercentageBool));
	}, []);

	// keep data-per + LS in sync whenever toggle changes
	useEffect(() => {
		document.documentElement.setAttribute(
			'data-per',
			isPercentageBool ? 'per_check_off' : 'per_check_on'
		);
		localStorage.setItem(TOGGLE_KEY, String(isPercentageBool));
	}, [isPercentageBool]);

	const handlePercentageCheck = () => {
		setIsPercentageBool(!isPercentageBool);
	};

	const handleDoubleClick = () => {
		const cur = getSavedVis();
		const next = VIS_STATES[(VIS_STATES.indexOf(cur) + 1) % VIS_STATES.length];

		if ((next === 'percentage' || next === 'both') && isPercentageBool) {
			setIsPercentageBool(false);
			localStorage.setItem(TOGGLE_KEY, 'false');
			document.documentElement.setAttribute('data-per', 'per_check_on');
		}

		if (next !== 'percentage') {
			setIsPercentageBool(true);
			localStorage.setItem(TOGGLE_KEY, 'true');
			document.documentElement.setAttribute('data-per', 'per_check_off');
		}

		if (next == 'value') {
			setIsPercentageBool(false);
			localStorage.setItem(TOGGLE_KEY, 'false');
			document.documentElement.setAttribute('data-per', 'per_check_on');
		}
		applyState(next);
	};

	// dynamic-width of column
	const firstSixResults = [];
	const elements = document.querySelectorAll('.rdt_TableCol[data-column-id]');
	if (elements.length > 0) {
		for (let i = 0; i < elements.length && i < 6; i++) {
			const element = elements[i];
			const dataColumnId = parseInt(element?.dataset?.columnId, 10);
			if (Number.isInteger(dataColumnId) && dataColumnId >= 1 && dataColumnId <= 6) {
				const rect = element?.getBoundingClientRect();
				const width = rect?.width;
				const value = element?.textContent?.trim(); // Get and trim the content
				firstSixResults?.push({ width, value, dataColumnId });
			}
		}
	}

	let cssClass = '';
	let percentageValue = 0;
	const revenueData = summaryData[0]?.Revenue;

	const currentrevenueDataValue = microValueConvert(revenueData?.this_month);
	const previousrevenueDataValue = microValueConvert(revenueData?.last_month);
	if (previousrevenueDataValue !== 0 && previousrevenueDataValue !== null) {
		percentageValue = (currentrevenueDataValue / Math.abs(previousrevenueDataValue)) * 100;
	} else {
		percentageValue = currentrevenueDataValue === 0 ? 0 : 100;
	}
	if (
		currentrevenueDataValue - previousrevenueDataValue >= 10 ||
		currentrevenueDataValue - previousrevenueDataValue <= -10
	) {
		if (percentageValue >= 110) {
			cssClass += 'revenue-increase';
		} else {
			cssClass += 'revenue-decrease';
		}
	}
	//add css in header
	useEffect(() => {
		if (sortedArray && cssClass) {
			const headerClass = document?.getElementById('this-month-percentage');
			if (headerClass?.classList) {
				headerClass?.classList?.add(cssClass ? cssClass : '');
			}
		}
	}, [sortedArray, cssClass]);

	const tanStackColumns = useCostColumns({
		appList,
		checkMark,
		summaryDateWise,
		diffDays,
		firstDate,
		lastDateInDashFormat,
		startDateInDashFormat,
		monthFilterActive,
		yearFilterActive,
		weekFilterActive,
		percentageInfo,
		finalShowFilter,
		selectedStartDate,
		handleDoubleClick,
		summaryData,
		percentageValue,
	});

	//summary scroll
	function syncSummaryRefScroll(scrollLeft) {
		const summaryDiv = document?.querySelector('.accpage'); // Assuming you want to scroll the "summary" div
		if (summaryDiv) {
			summaryDiv.scrollLeft = scrollLeft;
		}
	}
	// Function to get the scroll position of a target element
	function getScrollX(targetElement) {
		if (targetElement) {
			const scrollLeft = targetElement?.scrollLeft;
			syncSummaryRefScroll(scrollLeft);
		}
	}
	const targetElement = document?.querySelector('.Account-table-scroll');
	useEffect(() => {
		// Add event listener to handle scroll
		const handleScroll = () => {
			const targetElement = document?.querySelector('.Account-table-scroll');
			getScrollX(targetElement);
		};
		if (targetElement) {
			targetElement.addEventListener('scroll', () => handleScroll());
		}
		// Remove event listener when component unmounts
		return () => {
			if (targetElement) {
				targetElement.removeEventListener('scroll', () => handleScroll());
			}
		};
	}, [targetElement]);

	useEffect(() => {
		const paginationLinks = useGeneratePagination(appTotalPages);
		setAppPaginationList(paginationLinks);
	}, [appTotalPages]);

	useEffect(() => {
		const handleResize = () => {
			setWindowWidth(window.innerWidth);
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	// const calculateDifference = (current, compare) => (current - compare);
	const calculateDifference = (current, compare) => {
		if (compare === 0) {
			return 0;
		}
		return (current - compare).toFixed(3);
	};
	const reorderApps = (apps, flag) => {
		switch (flag) {
			case 'Top performers':
				return apps.sort((a, b) => parseFloat(b.current) - parseFloat(a.current));
			case 'Top Mover':
				return apps.sort((a, b) => parseFloat(b.difference) - parseFloat(a.difference));
			case 'Bottom movers':
				return apps.sort((a, b) => parseFloat(a.difference) - parseFloat(b.difference));
			// default:
			//   return apps; // Return the original array if the flag is not recognized
		}
	};

	useEffect(() => {
		if (performanceData?.length > 0 && updateTableNewData) {
			const reorderedApps = reorderApps(updateTableNewData, performanceData[0]?.platform_value);
			setSortedArray([]);
			setUpdatedTableNewData(reorderedApps);
		}
	}, [updateTableNewData, performanceData]);

	useEffect(() => {
		if (appList?.length > 0) {
			const compareRangeStart = new Date(selectedNewStartDate);
			const compareRangeEnd = new Date(newStartDate);
			compareRangeEnd.setDate(compareRangeEnd.getDate() - 1);

			appList?.forEach((app) => {
				const { data_by_date } = app;
				const compareRangeTotal = data_by_date.reduce((total, entry) => {
					const entryDate = new Date(entry.report_date);
					entryDate?.setHours(0, 0, 0, 0);
					if (entryDate >= newStartRangeDate && entryDate <= compareRangeEnd) {
						const { report_value_original } = entry;
						const value = parseFloat(report_value_original?.replace('$', ''));
						return total + value;
					}
					return total;
				}, 0);
				const currentRangeTotal = data_by_date.reduce((total, entry) => {
					const entryDate = new Date(entry.report_date);
					entryDate?.setHours(0, 0, 0, 0);
					if (entryDate >= newStartDate && entryDate <= newEndDate) {
						const { report_value_original } = entry;
						const value = parseFloat(report_value_original?.replace('$', ''));
						return total + value;
					}
					return total;
				}, 0);
				app.compare = compareRangeTotal.toFixed(2);
				app.current = currentRangeTotal.toFixed(2);
			});
			appList?.forEach((app) => {
				app.difference = calculateDifference(parseFloat(app.current), parseFloat(app.compare));
			});
			setSortedArray([]);

			//need to remove this line
			// const totalCopies = 20;
			// const newData = [];
			// for (let i = 0; i < totalCopies; i++) {
			// 	newData.push(...appList);
			// }
			setUpdatedTableNewData(appList ? appList : []);
		} else {
			setSortedArray([]);
			setUpdatedTableNewData([]);
		}
	}, [appList, performanceData]);

	const convertToDesiredDateFormat = (date) => {
		const [day, month, year] = date.split('/');
		return `${year}-${month}-${day}`; // Convert DD/MM/YYYY to YYYY-MM-DD
	};

	//CSV Account Report
	const csvData = sortedArray?.length > 0 ? sortedArray : updateTableNewData;

	let formattedStartDate, formattedEndDate;
	if (monthFilterActive) {
		formattedStartDate = moment(selectedStartDate, 'DD/MM/YYYY').format('YYYY-MM');
		formattedEndDate = moment(selectedEndDate, 'DD/MM/YYYY').format('YYYY-MM');
	} else if (yearFilterActive) {
		formattedStartDate = moment(selectedStartDate, 'DD/MM/YYYY').format('YYYY');
		formattedEndDate = moment(selectedEndDate, 'DD/MM/YYYY').format('YYYY');
	} else {
		formattedStartDate = convertToDesiredDateFormat(selectedStartDate);
		formattedEndDate = convertToDesiredDateFormat(selectedEndDate);
	}

	const csvFilter = csvData.map((item) => {
		const filteredDataByDate = item.data_by_date.filter((entry) => {
			const reportDate = entry.report_date;
			if (weekFilterActive) {
				const entryWeek = moment(reportDate, 'GGGG-[W]WW').startOf('isoWeek');
				const startWeek = moment(selectedStartDate, 'DD/MM/YYYY').startOf('isoWeek');
				const endWeek = moment(selectedEndDate, 'DD/MM/YYYY').endOf('isoWeek');
				return entryWeek.isBetween(startWeek, endWeek, undefined, '[]');
			}
			return reportDate >= formattedStartDate && reportDate <= formattedEndDate;
		});
		return {
			...item,
			data_by_date: filteredDataByDate,
		};
	});

	const transformedData = csvFilter?.map((item, index) => {
		const rowData = {
			Id: String(index + 1),
			'App Name': item.app_display_name,
			'Console Name': item.app_console_name,
			'Package id': item.app_store_id ? item.app_store_id : '-',
			'Last Updated': item.report_updated_at,
			'Last Month': indianNumberFormat(item?.last_month_original?.replace('$', '')),
			'This Month': indianNumberFormat(item?.this_month_original?.replace('$', '')),
			...item.data_by_date
				.sort((a, b) =>
					weekFilterActive
						? moment(b.report_date, 'GGGG-[W]WW').toDate() - moment(a.report_date, 'GGGG-[W]WW').toDate()
						: new Date(b.report_date) - new Date(a.report_date)
				)
				.reduce((acc, curr) => {
					const monthDay = monthFilterActive
						? moment(curr.report_date).format('MM/YYYY')
						: yearFilterActive
						? moment(curr.report_date, 'YYYY').format(' YYYY')
						: weekFilterActive
						? moment(curr.report_date, 'GGGG-[W]WW').format('GGGG[W]WW')
						: moment(curr.report_date, 'YYYY-MM-DD').format('DD/MM');
					acc[monthDay] = indianNumberFormat(curr?.report_value_original?.replace('$', ''));
					return acc;
				}, {}),
		};
		return rowData;
	});

	var convertedData = transformedData?.map((item) => {
		const newItem = {};
		for (const key in item) {
			if (item.hasOwnProperty(key)) {
				const newKey = key;
				newItem[newKey] = item[key];
			}
		}
		return newItem;
	});

	const dateObjects = summaryDateWise?.map((obj) => {
		const dateString = Object.keys(obj)[0];
		if (monthFilterActive) {
			const [year, month] = dateString.split('-');
			return { date: new Date(year, month - 1), data: obj[dateString] }; // Only use year and month
		} else if (yearFilterActive) {
			const [year] = dateString.split('-');
			return { date: new Date(year), data: obj[dateString] }; // Only use year
		} else if (weekFilterActive) {
			const m = moment(dateString, 'GGGG-[W]WW');
			return { date: m.toDate(), data: obj[dateString] };
		} else {
			const [day, month, year] = dateString.split('/');
			return { date: new Date(year, month - 1, day), data: obj[dateString] }; // Use day, month, and year
		}
	});
	dateObjects.sort((a, b) => b.date - a.date);

	const sortedSummaryDateWise = dateObjects.map((item) => {
		let dateString;
		if (monthFilterActive) {
			const year = item.date.getFullYear();
			const month = item.date.getMonth() + 1;
			dateString = `${year}-${month < 10 ? '0' + month : month}`; // Format as YYYY-MM
		} else if (yearFilterActive) {
			const year = item.date.getFullYear();
			dateString = `${year}`; // Format as YYYY
		} else if (weekFilterActive) {
			dateString = moment(item.date).format('GGGG-[W]WW');
		} else {
			dateString = `${item?.date?.getDate()}/${item.date.getMonth() + 1}/${item.date.getFullYear()}`; // Default format as DD/MM/YYYY
		}
		return { [dateString]: item.data };
	});
	function formatTableDate(dateString) {
		if (monthFilterActive) {
			const [year, month] = dateString.split('-');
			return `${month}/${year}`;
		} else if (weekFilterActive) {
			return moment(dateString, 'GGGG-[W]WW').format('GGGG[W]WW');
		} else if (yearFilterActive) {
			return dateString;
		} else {
			const [day, month, year] = dateString.split('/').map((part) => parseInt(part));
			return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
		}
	}
	var totalAccountData = [];
	const revenueDataCSV = sortedSummaryDateWise.map((item) => ({
		date: formatTableDate(Object.keys(item)[0]),
		revenue: item[Object.keys(item)[0]].revenue,
	}));
	totalAccountData.push({
		Id: 'Total Cost',
		'App Name': '-',
		'Console Name': '-',
		'Package id': '-',
		'Last Updated': '-',
		'Last Month': indianNumberFormat(+`${summaryData[0]?.Revenue?.last_month.toFixed(2)}`),
		'This Month': indianNumberFormat(+`${summaryData[0]?.Revenue?.this_month.toFixed(2)}`),
		...revenueDataCSV.reduce((acc, item) => {
			const monthDay = yearFilterActive
				? moment(item.date, 'YYYY').format(' YYYY')
				: item.date.split('/').splice(0, 2).join('/');
			acc[monthDay] = indianNumberFormat(`${item.revenue.toFixed(2)}`);
			return acc;
		}, {}),
	});
	totalAccountData.forEach(function (obj) {
		convertedData?.push(obj);
	});
	//csv data of omitted column
	const keysToRemove = checkMark?.map((item) => {
		if (item?.item_checked === false) {
			return item?.type_auto_name;
		}
	});
	const finalConvertedData = convertedData?.map((obj) => {
		let newObj = { ...obj };
		keysToRemove.forEach((key) => delete newObj[key]);
		return newObj;
	});
	//csv end

	let diffInDays = Math.abs(Math.round((newStartDate - newEndDate) / (1000 * 60 * 60 * 24)));
	//popup for error
	if (fetchdata?.status_code == 0 && diffInDays > 60) {
		Swal.fire({
			title: fetchdata.msg,
			width: 450,
			icon: 'warning',
			// timer: 3000,
			// timerProgressBar: true,
			focusConfirm: false,
			confirmButtonColor: '#1967d2',
			confirmButtonText: 'Okay',
		}).then((result) => {
			if (result.isConfirmed) {
			}
		});
	}

	const defaultShortValue = accountOrder?.map((item) => {
		return item?.sorting_order;
	});

	//mobile view column uncheck condition
	// useEffect(() =>{
	// },[])

	//info modal
	const [groupByData, setGroupByData] = useState([]);

	const selectListFormData = new FormData();
	selectListFormData.append('user_id', localStorage.getItem('id'));
	selectListFormData.append('user_token', localStorage.getItem('token'));
	const { data: groupAppResponse, isSuccess: isGroupSuccess } = useQueryFetch(
		'cost-group',
		'list-my-active-group',
		selectListFormData,
		{
			enabled: isDataPresent,
			staleTime: 3 * 60 * 1000,
		}
	);

	useEffect(() => {
		if (!groupAppResponse && !isGroupSuccess) return;
		const groupData = groupAppResponse?.info;

		const appDataMap = new Map(filterPopupData?.all_app_list?.map((app) => [app.app_auto_id, app]));

		const updatedGroupData = groupData?.map((group) => {
			const appIds = group.group_app_ids.split(',');
			const groupApps = appIds.map((appId) => appDataMap.get(appId)).filter(Boolean);
			return {
				...group,
				group_apps: groupApps,
			};
		});
		setGroupByData(updatedGroupData);
	}, [groupAppResponse, isGroupSuccess, filterPopupData]);

	const [updateProfileShow, setUpdateProfileShow] = useState(false);

	// filter order
	const [selectedFilterOrder, setSelectedFilterOrder] = useState([]);
	const allFilterNames = [
		'AccountPageAccountPopup',
		'AppAccountPopup',
		'CheckMark',
		'GroupBy',
		'AccountPlatFormPopup',
		'ShowBy',
	];

	const filterStates = {
		AccountPageAccountPopup: !!accountAdmob?.length,
		AppAccountPopup: !!accountNewApp?.length,
		CheckMark: !!checkMark?.length,
		AccountPlatFormPopup: !!accountPlatform?.length,
		GroupBy: !!accountGroupBy?.length,
		ShowBy: !!showByFilter?.length,
	};
	useEffect(() => {
		const selectedNow = Object.entries(filterStates)
			.filter(([_, isSelected]) => isSelected)
			.map(([key]) => key);
		setSelectedFilterOrder((prevOrder) => {
			const stillSelected = prevOrder.filter((name) => selectedNow.includes(name));
			selectedNow.forEach((filter) => {
				if (!stillSelected.includes(filter)) {
					stillSelected.push(filter);
				}
			});
			return stillSelected;
		});
	}, [JSON.stringify(filterStates)]);

	const selectedFilters = selectedFilterOrder.filter((name) => filterStates[name]);
	const remainingFilters = allFilterNames.filter((name) => !selectedFilters.includes(name));
	const dynamicFilterOrder = [...selectedFilters, ...remainingFilters];

	const renderComponent = (componentName) => {
		switch (componentName) {
			case 'AccountPageAccountPopup':
				return (
					<AccountPageAccountPopup
						uniqueIdentifier='cost'
						filterPopupData={filterAccountData}
						selectedAccountData={accountAdmob}
						setAccountAdmob={setAccountAdmob}
						setPageNumber={setAppPageNumber}
						setIsReportLoaderVisible={setIsReportLoaderVisible}
						setCurrentUnitPage={setCurrentUnitPage}
						setAccountGroupBy={setAccountGroupBy}
						setAccountNewApp={setAccountNewApp}
						setAccountPlatform={setAccountPlatform}
					/>
				);
			case 'AppAccountPopup':
				return (
					<GeneralAppFilter
						uniqueIdentifier={'cost'}
						filterAppList={filterData}
						selectedApp={accountNewApp}
						setSelectedApp={setAccountNewApp}
						fetchFlags={popupFlags}
						setFetchFlags={setPopupFlags}
						setIsTableLoaderVisible={setIsReportLoaderVisible}
					/>
				);
			case 'AccountPlatFormPopup':
				return (
					<AccountPlatFormPopup
						uniqueIdentifier='cost'
						platformValue={accountPlatform}
						setPlatformValue={setAccountPlatform}
						setPageNumber={setAppPageNumber}
						setIsReportLoaderVisible={setIsReportLoaderVisible}
						setCurrentUnitPage={setCurrentUnitPage}
						setAccountGroupBy={setAccountGroupBy}
					/>
				);
			case 'CheckMark':
				return (
					<CheckMark
						uniqueIdentifier='cost_checkmark'
						setPageNumber={setAppPageNumber}
						setIsReportLoaderVisible={setIsReportLoaderVisible}
						setCurrentUnitPage={setCurrentUnitPage}
						windowWidth={windowWidth}
					/>
				);
			case 'GroupBy':
				return (
					<GroupBy
						uniqueIdentifier='cost'
						groupValue={accountGroupBy}
						setGroupValue={setAccountGroupBy}
						filterPopupData={filterPopupData}
						groupByData={groupByData}
						setPageNumber={setAppPageNumber}
						setIsReportLoaderVisible={setIsReportLoaderVisible}
						setCurrentUnitPage={setCurrentUnitPage}
						windowWidth={windowWidth}
						setSelectedAccountData={setAccountAdmob}
						setAccountNewApp={setAccountNewApp}
						setAccountPlatform={setAccountPlatform}
					/>
				);
			case 'ShowBy':
				return (
					<ShowByFilter
						uniqueIdentifier={'apps_cost'}
						setIsReportLoaderVisible={setIsReportLoaderVisible}
						showByFilter={showByFilter}
						setShowByFilter={setShowByFilter}
					/>
				);
			default:
				return null;
		}
	};
	const renderedComponents = dynamicFilterOrder?.map((filterName, index) => (
		<React.Fragment key={filterName + index}>{renderComponent(filterName)}</React.Fragment>
	));

	const isFirstLoad = isLoading && !response;
	const isRefetching = isFetching && !!response;

	return (
		<div className='right-box-wrap'>
			<div className={`table-box-wrap main-box-wrapper pdglr24`}>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='account-page-topbar'>
						<div className='button-top-wrap'>
							<div className='filter-bar-wrap'>
								<div className='filter-box' id='filter-box'>
									<GeneralDateRange
										uniqueIdentifier={'apps_cost'}
										selectedStartDate={selectedStartDate}
										selectedEndDate={selectedEndDate}
										setIsTableLoaderVisible={setIsReportLoaderVisible}
										setMainDate={setCostDateRange}
										fetchFlags={popupFlags}
										setFetchFlags={setPopupFlags}
									/>
									{renderedComponents}
								</div>
								<div className='more-button three-icon-button'>
									<MdMoreVert className='material-icons' />
									<div className='more-box'>
										<div className='border-box'>
											<CSVLink
												className='downloadbtn'
												filename='account-report.csv'
												data={finalConvertedData ? finalConvertedData : []}
											>
												<span className='material-icons'>
													<FiDownload style={{ marginTop: '6px' }} />
												</span>
												Download CSV
											</CSVLink>
										</div>
										<div className='border-box'>
											<div
												className='downloadbtn'
												style={{
													color: '#5f6368',
													fontWeight: '100',
													fontSize: '15px',
												}}
												onClick={() => setUpdateProfileShow(true)}
											>
												<span className='material-icons'>
													<LuInfo
														style={{
															marginTop: '-2px',
															marginRight: '12px',
															fontSize: '20px',
														}}
													/>
												</span>
												Calculation Info
											</div>
										</div>
										{!ispercentage && (
											<div
												className='border-box  percentage-box'
												style={{ display: 'flex', padding: '6px 12px' }}
											>
												<span
													className='material-icons'
													style={{
														padding: '0px 12px',
														fontSize: '20px',
														marginTop: '-4px',
													}}
												>
													<AiOutlinePercentage />
												</span>

												<div className='show-button percentage-btn'>Percentage</div>
												<label className='switch toggle-icon' style={{ position: 'relative' }}>
													<input
														type='checkbox'
														id='checkbox'
														onChange={handlePercentageCheck}
														checked={isPercentageBool}
													/>
													<div className='slider round'></div>
												</label>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>

					<>
						<div className={`Account-Table`}>
							<div className={`table-container ad-units-box user-table-box `}>
								{isRefetching && (
									<div className='shimmer-spinner overlay-spinner'>
										<Spinner animation='border' variant='secondary' />
									</div>
								)}
								<div
									className={`fixed-columns hover-table ${
										checkMark?.length > 0
											? checkMark[0]?.type_auto_name === 'Hide'
												? 'same-column'
												: 'extra-column'
											: 'same-column'
									}`}
								>
									{isFirstLoad ? (
										<div className='shimmer-spinner'>
											<Spinner animation='border' variant='secondary' />
										</div>
									) : (
										<GeneralTanStackTable
											data={updateTableNewData}
											columns={tanStackColumns}
											enableResize={false}
											stickyColumns={5}
											enableVirtualization
											height={50 * 15 + 110}
											variant='normal'
											className='Account-table-scroll'
										/>
									)}
								</div>
							</div>
							<CostInfoModal show={updateProfileShow} onHide={() => setUpdateProfileShow(false)} />
						</div>
					</>
				</div>
			</div>
		</div>
	);
};

export default AppsCostBox;
