/** @format */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import GeneralDateRange from '../GeneralFilters/GeneralDateRange';
import GeneralAppFilter from '../GeneralFilters/GeneralAppFilter';
import { retention_dimension } from '../../utils/table_helper.json';
import { indianNumberFormat } from '../../utils/helper';
import FirstColumnFilter from './ExtraColumn/FirstColumnFilter';
import SecondColumnFilter from './ExtraColumn/SecondColumnFilter';
import GeneralGroupBy from '../GeneralFilters/GeneralGroupBy';
import moment from 'moment';
import AppInfoBox from '../GeneralComponents/AppInfoBox';
import GeneralCountry from '../GeneralFilters/GeneralCountry';
import GeneralDataFilter from '../GeneralFilters/GeneralDataFilter';
import { FiDownload } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import { MdMoreVert } from 'react-icons/md';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useAppList } from '../../context/AppListContext';
import { useGroupSettings } from '../../context/GroupSettingsContext';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import { useTanStackTableHover } from '../../hooks/useTanStackTableHover';

const RetentionBox = () => {
	//table
	const { selectedGroup } = useGroupSettings();
	const [isLoaderVisible, setIsLoaderVisible] = useState(false);
	const [fetchFlags, setFetchFlags] = useState(false);
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

	// const { campaignFilter: filterData } = useAppList();

	const { campaignFilter: rawFilterData } = useAppList();

	const filterData = useMemo(() => {
  if (!rawFilterData) return null;

  return {
    ...rawFilterData,
    list_apps: rawFilterData.list_apps?.filter(
      (app) => Number(app.app_visibility) === 1
    ) || [],
    list_campaign: rawFilterData.list_campaign || [],
  };
}, [rawFilterData]);

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
			finalAppVersion,
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
			setMainData(retentionData);
			setInitialAPIData(apiResponse);
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

	const baseColumns = useMemo(() => {
		return [
			{
				id: 'APP',
				header: () => (
					<div className='report-title' data-sort-value='APP'>
						<div className='report-header-dimension'>Apps</div>
					</div>
				),
				accessorKey: 'app_display_name',
				enableSorting: true,
				size: 150,
				meta: {
					sortValue: 'APP',
					sortKey: 'app_display_name',
					omit: false,
					fixed: true,
				},
				cell: ({ row }) => (
					<AppInfoBox
						app_auto_id={row.original?.app_auto_id}
						app_icon={row.original?.app_icon}
						app_platform={row.original?.app_platform}
						app_display_name={row.original?.app_display_name}
						app_console_name={row.original?.app_console_name}
						app_store_id={row.original?.app_store_id}
					/>
				),
			},

			/* ================= FIRST COLUMN ================= */
			{
				id: 'FirstColumn',
				enableSorting: true,
				size: 150,
				meta: {
					sortValue: 'FirstColumn',
					sortKey:
						firstColumnDimension === 'INSTALL_DATE'
							? 'ar_install_date'
							: firstColumnDimension === 'APP_VERSION'
							? 'app_version'
							: firstColumnDimension === 'COUNTRY'
							? 'country'
							: '-',
					omit: !isGroupSelected,
					alignMent: 'center',
				},
				header: () => (
					<div className={`dimension-column custom_report_column ${isDefaultSort ? 'active' : ''}`}>
						<FirstColumnFilter
							uniqueIdentifier='retention'
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
				accessorFn: (row) => {
					switch (firstColumnDimension) {
						case 'INSTALL_DATE':
							return row.ar_install_date;
						case 'APP_VERSION':
							return row.app_version;
						case 'COUNTRY':
							return row.country;
						default:
							return '-';
					}
				},
				cell: ({ row }) => {
					const value =
						firstColumnDimension === 'INSTALL_DATE'
							? row.original.ar_install_date
							: firstColumnDimension === 'APP_VERSION'
							? row.original.app_version
							: row.original.country;

					return (
						<div className='report_column_box custom_word_ellipsis'>
							<div className='report_main_value' title={value}>
								{value}
							</div>
						</div>
					);
				},
			},

			/* ================= SECOND COLUMN ================= */
			{
				id: 'ExtraColumn',
				enableSorting: true,
				size: 150,
				meta: {
					sortValue: 'ExtraColumn',
					sortKey:
						secondColumnDimension === 'INSTALL_DATE'
							? 'ar_install_date'
							: secondColumnDimension === 'APP_VERSION'
							? 'app_version'
							: secondColumnDimension === 'COUNTRY'
							? 'country'
							: '-',
					omit: !secondColumnDimension,
					alignMent: 'center',
				},
				header: () => (
					<div className='dimension-column extra_column custom_report_column'>
						<SecondColumnFilter
							uniqueIdentifier='retention'
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
				accessorFn: (row) => {
					switch (secondColumnDimension) {
						case 'INSTALL_DATE':
							return row.ar_install_date;
						case 'APP_VERSION':
							return row.app_version;
						case 'COUNTRY':
							return row.country;
						default:
							return '-';
					}
				},
				cell: ({ row }) => {
					const value =
						secondColumnDimension === 'INSTALL_DATE'
							? row.original.ar_install_date
							: secondColumnDimension === 'APP_VERSION'
							? row.original.app_version
							: row.original.country;

					return (
						<div className='report_column_box custom_word_ellipsis'>
							<div className='report_main_value' title={value}>
								{value}
							</div>
						</div>
					);
				},
			},
		];
	}, [
		firstColumnDimension,
		secondColumnDimension,
		isGroupSelected,
		isDefaultSort,
		isFirstOpen,
		isSecondOpen,
		secondArrow,
		fetchFlags,
		retentionCheckedApp,
	]);

	const dynamicColumns = useMemo(() => {
		let diffDays = 0;

		mainData.forEach((r) => {
			diffDays = Math.max(diffDays, r.day_wise_retention.length);
		});

		const avgRetention = calculateAverageRetention(mainData, diffDays);
		const headerTitle = isWeekSelected ? 'Week' : isMonthSelected ? 'Month' : 'Day';

		return Array.from({ length: diffDays }, (_, index) => {
			const totalValue = avgRetention.find((d) => +d.day === index + 1);

			return {
				id: `retention_${index}`,
				enableSorting: true,
				size: 110,
				meta: {
					isDynamic: true,
					sortValue: { columnIndex: index },
					sortKey: { columnIndex: index },
					alignMent: 'right',
				},
				header: () => (
					<div className='report-title'>
						<div className='analytics-header-dimension'>{`${headerTitle} ${index + 1}`}</div>
						<div className='report-total-dimension'>
							{totalValue?.average_retention ? Number(totalValue.average_retention).toFixed(2) + '%' : '-'}
						</div>
					</div>
				),
				accessorFn: (row) => row.day_wise_retention?.find((d) => +d.day === index + 1) || null,
				cell: ({ row }) => {
					const d = row.original.day_wise_retention?.find((x) => +x.day === index + 1);

					return (
						<div className='custom_new_tooltip_wrap'>
							<span className='sub_title'>{d ? d.retention_rate : '-'}</span>
							{d?.ar_retained_users && (
								<div className='user_count custom_tiny_font'>{indianNumberFormat(d.ar_retained_users)}</div>
							)}
						</div>
					);
				},
			};
		});
	}, [mainData, isWeekSelected, isMonthSelected]);

	const tanstackColumns = useMemo(
		() => [...baseColumns, ...dynamicColumns],
		[baseColumns, dynamicColumns]
	);

	useTanStackTableHover(initialAPIData, '.retention_table');

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
				headers.push({
					label: `${periodLabel} ${i}`,
					key: `${periodLabel} ${i}`,
				});
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
											<GeneralTanStackTable
												data={mainData}
												className='retention_tanstack_table'
												columns={tanstackColumns}
												enableResize={true}
												stickyColumns={3}
												enableVirtualization
												height={48 * 17}
												rowHeight={48}
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

export default RetentionBox;
