/** @format */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import TableSortArrow from '../AnalyticsComponents/TableSortArrow';
import CustomNoDataComponent from '../DataTableComponents/CustomNoDataComponent';
import GeneralDateRange from '../GeneralFilters/GeneralDateRange';
import GeneralAppFilter from '../GeneralFilters/GeneralAppFilter';
import CustomAnalyticsPagination from '../CustomAnalyticsPagination';
import { retention_dimension } from '../../utils/table_helper.json';
import { indianNumberFormat } from '../../utils/helper';
import FirstColumnFilter from './ExtraColumn/FirstColumnFilter';
import SecondColumnFilter from './ExtraColumn/SecondColumnFilter';
import useTableResize from '../../hooks/useTableResize';
import GeneralGroupBy from '../GeneralFilters/GeneralGroupBy';
import moment from 'moment';
import AppInfoBox from '../GeneralComponents/AppInfoBox';
import GeneralCountry from '../GeneralFilters/GeneralCountry';
import GeneralDataFilter from '../GeneralFilters/GeneralDataFilter';
import useStickyColumns from '../../hooks/useColumnSticky';
import { useTableHover } from '../../hooks/useTableHover';
import { FiDownload } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import { MdMoreVert } from 'react-icons/md';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useAppList } from '../../context/AppListContext';
import { useGroupSettings } from '../../context/GroupSettingsContext';

const RetentionBoxOld = () => {
	//table
	const { selectedGroup } = useGroupSettings();
	const [isLoaderVisible, setIsLoaderVisible] = useState(false);
	const [fetchFlags, setFetchFlags] = useState(false);
	const [tableToggleResize, setTableToggleResize] = useState(false);
	const [mainData, setMainData] = useState([]);
	const [initialAPIData, setInitialAPIData] = useState([]);

	//date-filter
	const [filterDate, setFilterDate] = useState(() => {
		const stored = sessionStorage.getItem('retention_date_range');
		return stored ? JSON.parse(stored) : [];
	});
	const [isDateClicked, setIsDateClicked] = useState(false);
	const [retentionCheckedApp, setRetentionCheckedApp] = useState(() => {
		const stored = sessionStorage.getItem('retention_app_filter');
		return stored ? JSON.parse(stored) : [];
	});
	//group-by filter
	const [retentionGroupBy, setRetentionGroupBy] = useState(() => {
		const stored = sessionStorage.getItem('retention_group_filter');
		return stored ? JSON.parse(stored) : [];
	});
	const [groupByFilterList] = useState([
		{
			id: 1,
			name: 'Day',
			value: 'DAY',
			item_checked: false,
		},
		{
			id: 2,
			name: 'Week',
			value: 'WEEK',
			item_checked: false,
		},
		{
			id: 3,
			name: 'Month',
			value: 'MONTH',
			item_checked: false,
		},
	]);
	//country filter
	const [countryValue, setCountryValue] = useState(() => {
		const stored = sessionStorage.getItem('retention_country_filter');
		return stored ? JSON.parse(stored) : [];
	});
	//app-version filter
	const [appVersionValue, setAppVersionValue] = useState(() => {
		const stored = sessionStorage.getItem('retention_app_version_filter');
		return stored ? JSON.parse(stored) : [];
	});
	const [appVersionList, setAppVersionList] = useState(() => {
		const stored = sessionStorage.getItem('retention_app_version_list');
		return stored ? JSON.parse(stored) : [];
	});

	//pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPage, setTotalPage] = useState('');
	const [itemsPerPage] = useState(400);

	//extra-column
	const [isFirstOpen, setIsFirstOpen] = useState(false);
	const [isSecondOpen, setIsSecondOpen] = useState(false);
	const [firstColumnDimension, setFirstColumnDimension] = useState(() => {
		const stored = sessionStorage.getItem('retention_first_column');
		return stored ? stored : 'INSTALL_DATE';
	});
	const [secondColumnDimension, setSecondColumnDimension] = useState(() => {
		const stored = sessionStorage.getItem('retention_extra_column');
		return stored ? stored : null;
	});
	const [secondArrow, setSecondArrow] = useState(false);
	const [availableFilters, setAvailableFilters] = useState(retention_dimension);
	const [sortState, setSortState] = useState(() => {
		const stored = sessionStorage.getItem('lastRetentionSortedColumn');
		return stored ? JSON.parse(stored) : { sortValue: 'ar_install_date', sortDirection: 'desc' };
	});
	const [isDefaultSort, setIsDefaultSort] = useState(true);
	const finalDimensions = useMemo(
		() => [firstColumnDimension, secondColumnDimension].filter(Boolean),
		[firstColumnDimension, secondColumnDimension]
	);

	// Memoized Values
	const selectedStartDate = useMemo(
		() => (filterDate[0]?.startDate ? moment(filterDate[0].startDate).format('DD/MM/YYYY') : ''),
		[filterDate]
	);
	const selectedEndDate = useMemo(
		() => (filterDate[0]?.endDate ? moment(filterDate[0].endDate).format('DD/MM/YYYY') : ''),
		[filterDate]
	);

	const finalGroupBy = useMemo(() => retentionGroupBy.map((item) => item.value), [retentionGroupBy]);
	const isWeekSelected = useMemo(() => finalGroupBy.includes('WEEK'), [finalGroupBy]);
	const isMonthSelected = useMemo(() => finalGroupBy.includes('MONTH'), [finalGroupBy]);
	const isDateSelected = useMemo(() => finalDimensions.includes('INSTALL_DATE'), [finalDimensions]);
	const isCountrySelected = useMemo(() => finalDimensions.includes('COUNTRY'), [finalDimensions]);
	const isAppVersionSelected = useMemo(
		() => finalDimensions.includes('APP_VERSION'),
		[finalDimensions]
	);
	const isSingleAppSelected = useMemo(() => retentionCheckedApp?.length == 1, [retentionCheckedApp]);
	const isGroupSelected = useMemo(() => finalGroupBy?.length != 0, [finalGroupBy]);

	const { campaignFilter: filterData } = useAppList();

	//columns
	const [columns, setColumns] = useState([
		{
			name: (
				<>
					<div className='report-title' data-sort-value='APP'>
						<div className='report-header-dimension'>Apps</div>
					</div>
				</>
			),
			selector: (row) => row['app_display_name'],
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
			reorder: false,
			sortable: true,
			sortValue: 'APP',
			sortKey: 'app_display_name',
			width: '150px',
			omit: false,
			fixed: true,
		},
		{
			name: '(not set)',
			cell: (row) => {
				return (
					<>
						<div className='campaign-column country-text'>
							<div>-</div>
						</div>
					</>
				);
			},
			width: '150px',
			sortValue: 'FirstColumn',
			sortable: true,
			omit: !isGroupSelected ? true : false,
			right: true,
			style: {
				justifyContent: 'center !important',
			},
		},
		{
			name: '(not set)',
			cell: (row) => {
				return (
					<>
						<div className='campaign-column country-text'>
							<div>(not set)</div>
						</div>
					</>
				);
			},
			width: '150px',
			sortValue: 'ExtraColumn',
			sortable: true,
			right: true,
			omit: true,
			style: {
				justifyContent: 'center !important',
			},
		},
	]);

	const finalApp = useMemo(
		() => retentionCheckedApp?.map((item) => item?.app_auto_id),
		[retentionCheckedApp]
	);

	const finalCountry = useMemo(() => countryValue?.map((item) => item?.name), [countryValue]);
	const finalAppVersion = useMemo(
		() => appVersionValue?.map((item) => item?.item_name),
		[appVersionValue]
	);

	const formData = useMemo(() => {
		const fd = new FormData();
		fd?.append('user_id', localStorage.getItem('id'));
		fd?.append('user_token', localStorage.getItem('token'));
		if (selectedGroup?.length > 0) {
			fd.append('gg_id', selectedGroup);
		}
		if (filterDate?.length > 0) {
			fd?.append('analytics_date_range', `${selectedStartDate}-${selectedEndDate}`);
		}
		if (finalApp?.length > 0) {
			fd.append('app_auto_id', finalApp.join(','));
		}
		if (finalCountry.length > 0) {
			fd.append('analytics_country', finalCountry.join(','));
		}
		if (finalAppVersion.length > 0) {
			fd.append('analytics_appVersion', finalAppVersion.join(','));
		}

		const dimensionsToAppend = finalDimensions.filter((dim) => dim !== 'INSTALL_DATE');
		const analyticsDimensions = [];
		if (dimensionsToAppend.includes('APP_VERSION')) {
			analyticsDimensions.push('appVersion');
		}
		if (dimensionsToAppend.includes('COUNTRY')) {
			analyticsDimensions.push('country');
		}
		if (analyticsDimensions.length > 0) {
			fd.append('analytics_dimensions', analyticsDimensions.join(','));
		} else {
			fd.delete('analytics_dimensions');
		}

		return fd;
	}, [
		filterDate,
		selectedStartDate,
		selectedEndDate,
		finalApp,
		finalCountry,
		finalAppVersion,
		finalDimensions,
		selectedGroup,
	]);

	//formData
	const endPoint =
		(isCountrySelected || isAppVersionSelected) && isSingleAppSelected
			? 'retention-data-live'
			: 'retention-data';

	const isQueryEnabled = !!filterData && !!selectedStartDate && !!selectedEndDate;

	const {
		data: apiResponse,
		isSuccess: apiSuccess,
		isLoading,
		isFetching,
		isFetched,
		status,
	} = useQueryFetch(
		[
			'retention-table',
			'group_select',
			finalApp,
			finalGroupBy,
			finalCountry,
			finalDimensions,
			selectedStartDate,
			selectedEndDate,
			selectedGroup,
		],
		endPoint,
		formData,
		{
			staleTime: 60 * 1000,
			enabled: isQueryEnabled,
			refetchOnMount: 'ifStale',
		}
	);
	useEffect(() => {
		if (!apiResponse || !apiSuccess) return;
		if (apiResponse.status_code == 1) {
			const retentionData = formatRetentionData(apiResponse?.data);
			const localVersionList = sessionStorage.getItem('retention_app_version_list');
			if (!localVersionList && isAppVersionSelected) {
				const finalVersionList = Array.from(
					new Set(retentionData.map((item) => item?.app_version))
				).map((version, index) => ({
					item_id: index + 1,
					item_name: version || null,
				}));
				sessionStorage.setItem('retention_app_version_list', JSON.stringify(finalVersionList));
				setAppVersionList(finalVersionList);
			}
			const totalTablePage = Math.ceil(retentionData?.length / itemsPerPage);
			setTotalPage(totalTablePage);
			customSort(sortState.sortValue, sortState.sortDirection, retentionData);
			setInitialAPIData(apiResponse);
			setTableToggleResize(false);
		}
	}, [
		apiResponse,
		apiSuccess,
		finalApp,
		finalAppVersion,
		finalCountry,
		finalGroupBy,
		finalDimensions,
	]);

	function formatRetentionData(data) {
		const retentionMap = new Map();
		data.forEach((entry) => {
			const {
				ar_install_date,
				ar_retention_date,
				ar_app_auto_id,
				ar_retained_users,
				country,
				appVersion,
			} = entry;
			let installDate, groupKey, diff;

			if (isWeekSelected) {
				installDate = moment(ar_install_date).startOf('isoWeek').add(1, 'days').format('YYYY[W]WW');
				diff = moment(ar_retention_date).diff(
					moment(ar_install_date).startOf('isoWeek').add(0, 'days'),
					'weeks'
				);
			} else if (isMonthSelected) {
				installDate = moment(ar_install_date).startOf('month').format('MMM YY');
				diff = moment(ar_retention_date).diff(moment(ar_install_date).startOf('months'), 'months');
			} else {
				installDate = moment(ar_install_date).format('YYYY-MM-DD');
				diff = moment(ar_retention_date).diff(moment(installDate), 'days');
			}

			if (isCountrySelected && !isDateSelected) {
				groupKey = `${ar_app_auto_id}|${undefined}|${country}|${appVersion}`;
			} else if (isAppVersionSelected && !isDateSelected) {
				groupKey = `${ar_app_auto_id}|${undefined}|${country}|${appVersion}`;
			} else if (!isGroupSelected) {
				groupKey = `${ar_app_auto_id}|${undefined}|${country}|${appVersion}`;
			} else {
				groupKey = `${ar_app_auto_id}|${installDate}|${country}|${appVersion}`;
			}

			if (!retentionMap.has(groupKey)) {
				retentionMap.set(groupKey, {});
			}
			const retentionData = retentionMap.get(groupKey);
			if (!retentionData[diff]) {
				retentionData[diff] = 0;
			}
			retentionData[diff] += Number(ar_retained_users || 0);
		});
		const result = Array.from(retentionMap.entries()).map(([key, days]) => {
			const [appId, installDateString, countryString, appVersionString] = key.split('|');

			const installDate = installDateString === 'undefined' ? null : installDateString;
			const country = countryString === 'undefined' ? null : countryString;
			const appVersion = appVersionString === 'undefined' ? null : appVersionString;

			const baseEntry = Object.entries(days).find(([day]) => day == 0);
			const baseUsers = baseEntry ? baseEntry[1] : 0;
			const dayWiseRetention = Object.entries(days).map(([day, count]) => ({
				day: `${+day + 1}`,
				ar_retained_users: count,
				retention_rate: baseUsers > 0 ? ((count / baseUsers) * 100).toFixed(2) + '%' : '-',
			}));
			const appDetails = filterData.list_apps?.find((app) => app.app_auto_id == appId) || {};

			return {
				ar_install_date: installDate ? installDate : '-',
				country: country ? country : '-',
				app_version: appVersion ? appVersion : '-',
				day_wise_retention: dayWiseRetention,
				...(({ app_campaigns, item_checked, ...rest }) => rest)(appDetails),
			};
		});
		return result;
	}

	//sorting
	const customSort = (column, sortDirection, fullData) => {
		setIsLoaderVisible(true);
		let key = column?.sortValue;
		let bool = sortDirection === 'asc' ? true : false;
		let extraColumnKey = column?.sortKey || 'ar_install_date';

		const lastSortedColumn = {
			sortValue: column?.sortValue,
			sortDirection: sortDirection,
		};
		setSortState(lastSortedColumn);
		sessionStorage.setItem('lastRetentionSortedColumn', JSON.stringify(lastSortedColumn));

		let sortedData;
		if (key == 'APP') {
			sortedData = sortDataByString([...fullData], 'app_display_name', bool);
		} else if (key?.columnIndex != undefined) {
			sortedData = sortDataByKey([...fullData], key?.columnIndex, sortDirection);
		} else if ((key == 'FirstColumn' || 'ExtraColumn') && extraColumnKey == 'ar_install_date') {
			sortedData = sortByDate([...fullData], 'ar_install_date', sortDirection);
		} else if (key == 'FirstColumn' || 'ExtraColumn') {
			sortedData = sortDataByString([...fullData], extraColumnKey, bool);
		}
		setCurrentPage(1);
		setMainData(sortedData);
		setTimeout(() => {
			setIsLoaderVisible(false);
		}, 400);
	};
	function sortDataByString(data, key, sortBool) {
		setIsDefaultSort(false);
		return data?.sort((a, b) => {
			if (a[key] < b[key]) {
				return sortBool ? 1 : -1;
			}
			if (a[key] > b[key]) {
				return sortBool ? -1 : 1;
			}
			return 0;
		});
	}
	const sortDataByKey = (data, indexValue, order) => {
		setIsDefaultSort(false);
		return data.sort((a, b) => {
			const aDayWise = a.day_wise_retention.find((day) => day.day == indexValue + 1) || {};
			const bDayWise = b.day_wise_retention.find((day) => day.day == indexValue + 1) || {};

			const aRetention = +aDayWise.retention_rate?.replace('%', '') || 0;
			const bRetention = +bDayWise.retention_rate?.replace('%', '') || 0;
			if (order === 'asc') {
				return bRetention - aRetention;
			} else {
				return aRetention - bRetention;
			}
		});
	};
	const sortByDate = (data, key, sortBool) => {
		return data?.sort((a, b) => {
			const dateA = moment(
				a[key],
				isMonthSelected ? 'MMM YY' : isWeekSelected ? 'YYYY[W]WW' : 'YYYY-MM-DD'
			);
			const dateB = moment(
				b[key],
				isMonthSelected ? 'MMM YY' : isWeekSelected ? 'YYYY[W]WW' : 'YYYY-MM-DD'
			);
			if (sortBool === 'desc') {
				return dateA - dateB;
			} else if (sortBool === 'asc') {
				return dateB - dateA;
			} else {
				return 0;
			}
		});
	};

	//total summary
	function calculateAverageRetention(data, diffDays) {
		const averageRetention = [];

		for (let dayIdx = 1; dayIdx <= diffDays; dayIdx++) {
			let sum = 0;
			let count = 0;

			(data || []).forEach((obj) => {
				const entry = (obj?.day_wise_retention || []).find((d) => Number(d?.day) === dayIdx);
				if (!entry) return;

				const rateStr = entry.retention_rate;
				if (!rateStr || rateStr === '-') return;

				const val = parseFloat(String(rateStr).replace('%', ''));
				if (Number.isFinite(val)) {
					sum += val;
					count++;
				}
			});

			averageRetention.push({
				day: dayIdx,
				average_retention: count > 0 ? sum / count : 0,
			});
		}

		return averageRetention;
	}

	//Dynamic Columns
	const createDynamicColumns = () => {
		let dynamicColumns = [];
		let diffDays = 0;

		mainData.forEach((record) => {
			const retentionLength = record.day_wise_retention.length;
			if (retentionLength > diffDays) {
				diffDays = retentionLength;
			}
		});

		dynamicColumns = Array.from({ length: diffDays }, (_, index) => {
			let columnIndex = index++;
			//summary
			const averageRetention = calculateAverageRetention(mainData, diffDays);
			const totalValue = averageRetention?.find((data) => +data?.day == columnIndex + 1);

			const headerTitle = isWeekSelected ? 'Week' : isMonthSelected ? 'Month' : 'Day';
			const column = {
				name: (
					<>
						<div className='report-title'>
							<div className='analytics-header-dimension'>{`${headerTitle} ${columnIndex + 1}`}</div>
							<div className='report-total-dimension'>
								{totalValue?.average_retention
									? Number(totalValue?.average_retention).toFixed(2) + '%'
									: '-'}
							</div>
						</div>
					</>
				),
				sortable: true,
				sortValue: { columnIndex },
				sortKey: { columnIndex },
				minWidth: '100px',
				selector: (row) => {
					const matchingData = row?.day_wise_retention?.find((data) => +data?.day == columnIndex + 1);
					return matchingData || null;
				},
				cell: (row) => {
					const matchingData = row?.day_wise_retention?.find((data) => +data?.day == columnIndex + 1);
					const finalRetention = matchingData?.retention_rate;
					const dailyActiveUsers = matchingData?.ar_retained_users;
					return (
						<div className='custom_new_tooltip_wrap'>
							<span className='sub_title'>{matchingData ? finalRetention : '-'}</span>
							{dailyActiveUsers && (
								<div className='user_count'>{indianNumberFormat(dailyActiveUsers)}</div>
							)}
						</div>
					);
				},
				style: {
					justifyContent: 'flex-end',
				},
			};
			return column;
		}).filter((column) => column !== null);
		return dynamicColumns;
	};
	const updatedColumns = [...columns, ...createDynamicColumns()];

	const finalTableData = useMemo(() => {
		const indexOfLastItem = currentPage * itemsPerPage;
		const indexOfFirstItem = indexOfLastItem - itemsPerPage;
		return mainData.slice(indexOfFirstItem, indexOfLastItem);
	}, [mainData, currentPage]);

	//extra-column
	const dimensionLogic = {
		INSTALL_DATE: {
			selector: (row) => row['ar_install_date'],
		},
		APP_VERSION: {
			selector: (row) => row['app_version'],
		},
		COUNTRY: {
			selector: (row) => row['country'],
		},
	};

	useEffect(() => {
		const updatedColumns = columns.map((column) => {
			if (column.sortValue === 'FirstColumn') {
				const logic = dimensionLogic[firstColumnDimension];
				return {
					...column,
					selector: logic?.selector,
					omit: !isGroupSelected ? true : false,
					name: (
						<div className={`dimension-column custom_report_column ${isDefaultSort ? 'active' : ''}`}>
							<FirstColumnFilter
								uniqueIdentifier={'retention'}
								setIsLoaderVisible={setIsLoaderVisible}
								availableFilters={availableFilters}
								setAvailableFilters={setAvailableFilters}
								isOpen={isFirstOpen}
								setIsOpen={setIsFirstOpen}
								secondIsOpen={isSecondOpen}
								setSecondIsOpen={setIsSecondOpen}
								firstColumnDimension={firstColumnDimension}
								setFirstColumnDimension={setFirstColumnDimension}
								secondColumnDimension={secondColumnDimension}
								setSecondColumnDimension={setSecondColumnDimension}
								fetchFlag={fetchFlags}
								setFetchFlag={setFetchFlags}
								isSingleAppSelected={isSingleAppSelected}
							/>
						</div>
					),
					sortKey: (() => {
						switch (firstColumnDimension) {
							case 'INSTALL_DATE':
								return 'ar_install_date';
							case 'APP_VERSION':
								return 'app_version';
							case 'COUNTRY':
								return 'country';
							default:
								return '-';
						}
					})(),
					cell: (app) => {
						const renderCellContent = () => {
							switch (firstColumnDimension) {
								case 'INSTALL_DATE':
									return app.ar_install_date;
								case 'APP_VERSION':
									return app.app_version;
								case 'COUNTRY':
									return app.country;
								default:
									return '-';
							}
						};
						return (
							<div className='report_column_box custom_word_ellipsis'>
								<div className='report_main_value' title={renderCellContent()}>
									{renderCellContent()}
								</div>
							</div>
						);
					},
				};
			}
			if (column.sortValue === 'ExtraColumn') {
				const logic = dimensionLogic[secondColumnDimension];
				return {
					...column,
					omit: !secondColumnDimension,
					selector: logic?.selector,
					name: (
						<div
							className='dimension-column extra_column custom_report_column'
							data-sort-value='ExtraColumn'
						>
							<SecondColumnFilter
								uniqueIdentifier={'retention'}
								setIsLoaderVisible={setIsLoaderVisible}
								availableFilters={availableFilters}
								setAvailableFilters={setAvailableFilters}
								secondArrow={secondArrow}
								setSecondArrow={setSecondArrow}
								firstColumnDimension={firstColumnDimension}
								setFirstColumnDimension={setFirstColumnDimension}
								secondColumnDimension={secondColumnDimension}
								setSecondColumnDimension={setSecondColumnDimension}
								fetchFlag={fetchFlags}
								setFetchFlag={setFetchFlags}
							/>
						</div>
					),
					sortKey: (() => {
						switch (secondColumnDimension) {
							case 'INSTALL_DATE':
								return 'ar_install_date';
							case 'APP_VERSION':
								return 'app_version';
							case 'COUNTRY':
								return 'country';
							default:
								return '-';
						}
					})(),
					cell: (app) => {
						const renderCellContent = () => {
							switch (secondColumnDimension) {
								case 'INSTALL_DATE':
									return app.ar_install_date;
								case 'APP_VERSION':
									return app.app_version;
								case 'COUNTRY':
									return app.country;
								default:
									return '-';
							}
						};
						return (
							<div className='report_column_box custom_word_ellipsis'>
								<div className='report_main_value' title={renderCellContent()}>
									{renderCellContent()}
								</div>
							</div>
						);
					},
				};
			}
			return column;
		});
		setColumns(updatedColumns);
	}, [
		firstColumnDimension,
		fetchFlags,
		secondColumnDimension,
		retentionCheckedApp,
		isFirstOpen,
		isSecondOpen,
		secondArrow,
	]);

	//Resize
	useEffect(() => {
		if (mainData) {
			const columns = document.querySelectorAll(
				'.retention_table > div > .rdt_Table > .rdt_TableHead > .rdt_TableHeadRow > .rdt_TableCol'
			);
			columns.forEach((column) => {
				const resizer = document.createElement('div');
				resizer.className = 'resizer-area';
				column.appendChild(resizer);
			});

			return () => {
				document.querySelectorAll('.resizer-area').forEach((resizer) => {
					resizer.remove();
				});
			};
		}
	}, [mainData]);

	//sticky column
	useStickyColumns({
		uniqueSelector: '.retention_table',
		columnIds: [1, 2, 3],
		isZ_Index: true,
		mainData,
	});

	const columnWidths = {
		1: 120,
		2: 120,
		3: 120,
		default: 110,
	};
	useTableResize({
		tableSelector: '.retention_table',
		columnWidths: columnWidths,
		tableToggleResize,
		mainData,
	});

	useTableHover(initialAPIData, '.retention_table');

	const getCsvData = useCallback(
		(rows) => {
			if (!Array.isArray(rows) || rows.length === 0) return [];

			const periodLabel = isWeekSelected ? 'Week' : isMonthSelected ? 'Month' : 'Day';

			// Find the max day/week/month index
			const maxIndex = rows.reduce((max, r) => {
				const localMax = (r?.day_wise_retention || []).reduce((m, d) => {
					const num = parseInt(d?.day, 10);
					return Number.isFinite(num) ? Math.max(m, num) : m;
				}, 0);
				return Math.max(max, localMax);
			}, 0);

			// Check optional fields across dataset
			const hasCountry = rows.some((r) => r?.country && r.country !== '-');
			const hasAppVersion = rows.some((r) => r?.app_version && r.app_version !== '-');
			const hasDate = rows.some((r) => r?.ar_install_date && r.ar_install_date !== '-');

			// Build each CSV row
			const csvRows = rows.map((item) => {
				const base = {
					Apps: item?.app_display_name ?? '-',
					'Console Name': item?.app_console_name ?? '-',
					'Package Name': item?.app_store_id ?? '-',
				};
				if (hasDate) base['Date'] = item?.ar_install_date ?? '-';
				if (hasCountry) base['Country'] = item?.country ?? '-';
				if (hasAppVersion) base['App Version'] = item?.app_version ?? '-';

				const dayMap = new Map();
				(item?.day_wise_retention || []).forEach((d) => {
					const idx = parseInt(d?.day, 10);
					if (Number.isFinite(idx)) dayMap.set(idx, d);
				});

				for (let i = 1; i <= maxIndex; i++) {
					const entry = dayMap.get(i);
					base[`${periodLabel} ${i}`] = entry?.retention_rate ?? '-';
				}

				return base;
			});

			// ---- Add Total/Average row at bottom ----
			if (rows.length > 0) {
				const totalRow = {
					Apps: 'TOTAL',
					'Console Name': '',
					'Package Name': '',
				};
				if (hasDate) totalRow['Date'] = '';
				if (hasCountry) totalRow['Country'] = '';
				if (hasAppVersion) totalRow['App Version'] = '';

				for (let i = 1; i <= maxIndex; i++) {
					let sum = 0,
						count = 0;
					rows.forEach((r) => {
						const entry = r?.day_wise_retention?.find((d) => +d.day === i);
						if (entry?.retention_rate && entry.retention_rate !== '-') {
							const val = parseFloat(entry.retention_rate.replace('%', ''));
							if (!isNaN(val)) {
								sum += val;
								count++;
							}
						}
					});
					totalRow[`${periodLabel} ${i}`] = count > 0 ? (sum / count).toFixed(2) + '%' : '-';
				}
				csvRows.push(totalRow);
			}

			return csvRows;
		},
		[isWeekSelected, isMonthSelected]
	);

	const getCsvHeaders = useCallback(
		(rows) => {
			const periodLabel = isWeekSelected ? 'Week' : isMonthSelected ? 'Month' : 'Day';

			const headers = [
				{ label: 'Apps', key: 'Apps' },
				{ label: 'Console Name', key: 'Console Name' },
				{ label: 'Package Name', key: 'Package Name' },
			];

			const hasCountry = rows.some((r) => r?.country && r.country !== '-');
			const hasAppVersion = rows.some((r) => r?.app_version && r.app_version !== '-');
			const hasDate = rows.some((r) => r?.ar_install_date && r.ar_install_date !== '-');

			if (hasDate) headers.push({ label: 'Date', key: 'Date' });
			if (hasCountry) headers.push({ label: 'Country', key: 'Country' });
			if (hasAppVersion) headers.push({ label: 'App Version', key: 'App Version' });

			const maxIndex =
				rows?.reduce((max, r) => {
					const localMax = (r?.day_wise_retention || []).reduce((m, d) => {
						const num = parseInt(d?.day, 10);
						return Number.isFinite(num) ? Math.max(m, num) : m;
					}, 0);
					return Math.max(max, localMax);
				}, 0) || 0;

			for (let i = 1; i <= maxIndex; i++) {
				headers.push({ label: `${periodLabel} ${i}`, key: `${periodLabel} ${i}` });
			}

			return headers;
		},
		[isWeekSelected, isMonthSelected]
	);

	const hasTableData = mainData && mainData.length > 0;

	const showMainLoader = (status === 'loading' || isLoading || isFetching) && !hasTableData;
	const showOverlayLoader = isFetching && hasTableData;

	return (
		<div className={`right-box-wrap ${mainData.length > 400 ? 'pagination_on' : ''}`}>
			<div className='table-box-wrap main-box-wrapper pdglr24 retention_table_wrap'>
				<div className='userBoxWrap user-section-wrapper '>
					<div className='popup-full-wrapper reports-popup-box active analytics-page-topbar'>
						<div className='action-bar-container'>
							<div className='middle-section'>
								<div className='filter-bar-wrap'>
									<div className={`filter-box analytics-filter-box`}>
										<GeneralDateRange
											uniqueIdentifier={'retention'}
											selectedStartDate={selectedStartDate}
											selectedEndDate={selectedEndDate}
											setIsTableLoaderVisible={setIsLoaderVisible}
											setMainDate={setFilterDate}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
											isDateClicked={isDateClicked}
											setIsDateClicked={setIsDateClicked}
										/>
										<GeneralAppFilter
											uniqueIdentifier={'retention'}
											filterAppList={filterData?.list_apps}
											selectedApp={retentionCheckedApp}
											setSelectedApp={setRetentionCheckedApp}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
											setIsTableLoaderVisible={setIsLoaderVisible}
											setPageNumber={setCurrentPage}
											setFirstColumnDimension={setFirstColumnDimension}
											setSecondColumnDimension={setSecondColumnDimension}
											setAppVersionValue={setAppVersionValue}
											setCountryValue={setCountryValue}
										/>
										<GeneralGroupBy
											uniqueIdentifier={'retention'}
											filterName='Split By'
											groupByFilterList={groupByFilterList}
											groupBy={retentionGroupBy}
											setGroupBy={setRetentionGroupBy}
											setIsTableLoaderVisible={setIsLoaderVisible}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
										/>
										{isCountrySelected && (
											<GeneralCountry
												uniqueIdentifier={'retention'}
												countryValue={countryValue}
												setCountryValue={setCountryValue}
												fetchFlag={fetchFlags}
												setFetchFlag={setFetchFlags}
												setMainLoader={setIsLoaderVisible}
											/>
										)}
										{isAppVersionSelected && (
											<GeneralDataFilter
												uniqueIdentifier={'retention_app_version'}
												filterName='App Version'
												filterPopupData={appVersionList}
												finalSelectData={appVersionValue}
												setFinalSelectData={setAppVersionValue}
												fetchFlag={fetchFlags}
												setFetchFlag={setFetchFlags}
												setIsLoaderVisible={setIsLoaderVisible}
											/>
										)}
									</div>
								</div>
							</div>
							<div className='more-button three-icon-button'>
								<MdMoreVert className='material-icons' />
								<div className='more-box analytics_csv arpu_csv'>
									<div className='border-box'>
										<CSVLink
											className='downloadbtn'
											filename='retention.csv'
											headers={getCsvHeaders(mainData)}
											data={getCsvData(mainData)}
										>
											<span className='material-icons'>
												<FiDownload />
											</span>
											Download CSV
										</CSVLink>
									</div>
								</div>
							</div>
						</div>
						{showMainLoader ? (
							<div className='shimmer-spinner'>
								<Spinner animation='border' variant='secondary' />
							</div>
						) : (
							<>
								<div className={`popup-full-box form-box-wrap form-wizard analytics-popup-box`}>
									{showOverlayLoader && (
										<div className='shimmer-spinner overlay-spinner'>
											<Spinner animation='border' variant='secondary' />
										</div>
									)}{' '}
									<div className={`popup-box-wrapper analytics-container analytics-popup-box`}>
										<div
											className={`box-wrapper table-container analytics-table analytics-campaign-table ${
												secondColumnDimension ? 'extra_column_visible' : ''
											}`}
										>
											<DataTable
												className={`table-scroll-analytics retention_table general_class`}
												columns={updatedColumns}
												data={finalTableData}
												fixedHeader
												fixedHeaderScrollHeight={'70.6vh'}
												sortServer
												onSort={(column, direction) => {
													customSort(column, direction, mainData);
												}}
												sortIcon={<TableSortArrow />}
												noDataComponent={
													!isLoading && !isFetching && (isFetched || apiSuccess) ? (
														<CustomNoDataComponent />
													) : (
														<></>
													)
												}
												pagination={true}
												paginationPerPage={400}
												paginationComponent={() => (
													<CustomAnalyticsPagination
														pageNumber={currentPage}
														paginationList={Math.ceil(totalPage)}
														setPageNumber={setCurrentPage}
														rowCount={finalTableData?.length}
														setIsLoaderVisible={setIsLoaderVisible}
													/>
												)}
												defaultSortAsc={false}
											/>
										</div>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default RetentionBoxOld;
