/** @format */

import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';
import GeneralDateRange from '../GeneralFilters/GeneralDateRange';
import moment from 'moment';
import { FaUsers } from 'react-icons/fa';
import { MdAttachMoney, MdMoreVert } from 'react-icons/md';
import { FiTarget } from 'react-icons/fi';
import { RiErrorWarningLine } from 'react-icons/ri';
import { Spinner } from 'react-bootstrap';
import {
	displayNumber,
	formatDateMonthRange,
	formatValue,
	indianNumberFormat,
} from '../../utils/helper';
import GeneralAppFilter from '../GeneralFilters/GeneralAppFilter';
import CanvasChartItem from '../ChartComponents/CanvasBarMiniChart';
import { AiOutlinePercentage } from 'react-icons/ai';
import GeneralPlatform from '../GeneralFilters/GeneralPlatform';
import AppInsightsInfoBox from '../GeneralComponents/AppInsightsInfoBox';
import Tippy from '@tippyjs/react';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useGroupSettings } from '../../context/GroupSettingsContext';
import { useAppList } from '../../context/AppListContext';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import { toNum } from '../../utils/pureHelper';

const AppDashboard = () => {
	const { isDarkMode } = useContext(DataContext);
	const { selectedGroup } = useGroupSettings();
	const [isLoaderVisible, setIsLoaderVisible] = useState(true);
	const [isLoaderVisibleSort, setIsLoaderVisibleSort] = useState(true);
	const [fetchFlags, setFetchFlags] = useState(false);
	const [isDateClicked, setIsDateClicked] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const [currentData, setCurrentData] = useState([]);
	const [currentExtra, setCurrentExtra] = useState([]);
	const [compareData, setCompareData] = useState([]);
	const [compareExtra, setCompareExtra] = useState([]);
	const [initialAPIData, setInitialAPIData] = useState([]);
	const [currentRetention, setCurrentRetention] = useState([]);
	const [compareRetention, setCompareRetention] = useState([]);
	const [currentRetentionDayone, setCurrentRetentionDayone] = useState([]);
	const [compareRetentionDayone, setCompareRetentionDayone] = useState([]);
	const [currentEcpm, setEcpm] = useState([]);
	const [compareEcpm, setCompareEcpm] = useState([]);
	const [ispercentage, setIsPercentage] = useState(false);
	const [percentageInfo, setPercentageInfo] = useState(false);
	const [totalFlag, setTotalFlag] = useState(false);
	const [footerTotals, setFooterTotals] = useState({});
	//table
	const [mainData, setMainData] = useState([]);

	const [expandedRowAppId, setExpandedRowAppId] = useState(null);

	//sorting
	const [sorting, setSorting] = useState(() => {
		return [{ id: 'dau', desc: 'desc' }];
	});

	//pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(500);

	// date-filter
	const [filterDate, setFilterDate] = useState(() => {
		const stored = sessionStorage.getItem('app_insights_date_range');
		return stored ? JSON.parse(stored) : [];
	});

	//sort column
	const [appInsightsCheckedApp, setAppInsightsCheckedApp] = useState(() => {
		const stored = sessionStorage.getItem('app-insights_app_filter');
		return stored ? JSON.parse(stored) : [];
	});
	const [orderByItem, setOrderByItem] = useState([]);
	const [platformItem, setPlatformItem] = useState([]);
	//api states

	//date range dates
	const selectedStartDate = useMemo(
		() => (filterDate[0]?.startDate ? moment(filterDate[0].startDate).format('DD/MM/YYYY') : ''),
		[filterDate]
	);
	const selectedEndDate = useMemo(
		() => (filterDate[0]?.endDate ? moment(filterDate[0].endDate).format('DD/MM/YYYY') : ''),
		[filterDate]
	);

	const previousDateRange = useMemo(() => {
		if (!filterDate[0]?.startDate || !filterDate[0]?.endDate) return { start: '', end: '' };

		const start = moment(filterDate[0].startDate);
		const end = moment(filterDate[0].endDate);
		const diffDays = end.diff(start, 'days');

		const prevEnd = start.clone().subtract(1, 'day');
		const prevStart = start.clone().subtract(diffDays + 1, 'days');

		return {
			start: prevStart.format('DD/MM/YYYY'),
			end: prevEnd.format('DD/MM/YYYY'),
		};
	}, [filterDate]);

	const { campaignFilter: filterData } = useAppList();
	const appsList = filterData?.list_apps || [];

	const appMetaMap = useMemo(() => {
		const map = {};
		appsList.forEach((app) => {
			map[app.app_auto_id] = {
				name: app.app_display_name,
				icon: app.app_icon,
				console: app.app_console_name,
				platform: app.app_platform === '2' ? 'Android' : 'iOS',
				package: app.app_store_id,
			};
		});
		return map;
	}, [appsList]);

	const getChange = (current, previous) => {
		if (+current === 0 || +previous === 0) return '0%';

		const diff = ((current - previous) / Math.abs(previous)) * 100;
		const rounded = parseFloat(diff.toFixed(2));

		return `${rounded > 0 ? '+' : ''}${rounded}%`;
	};

	const computeTotals = (
		currentData,
		compareData,
		currentExtra,
		compareExtra,
		currentEcpm = [],
		compareEcpm = [],
		selectedPlatforms = []
	) => {
		let currentRevenue = 0,
			compareRevenue = 0,
			currentCost = 0,
			compareCost = 0,
			currentArpuSum = 0,
			compareArpuSum = 0,
			currentDauMauSum = 0,
			compareDauMauSum = 0,
			currentDays = 0,
			compareDays = 0;
		let currentAppDAUAvgsSum = 0,
			compareAppDAUAvgsSum = 0,
			currentAppsWithNonZeroDAU = 0,
			compareAppsWithNonZeroDAU = 0;

		// Process current data
		currentData.forEach((item) => {
			const appKey = Object.keys(item)[0];
			const appId = appKey.replace('app-', '');
			const meta = appMetaMap[appId];
			if (!meta || (selectedPlatforms.length && !selectedPlatforms.includes(meta.platform))) return;

			const ecpmEntry = currentEcpm.find((entry) => String(entry.app_auto_id) === String(appId));
			const appRevenue = ecpmEntry
				? parseFloat(ecpmEntry.report_estimated_earnings || 0) / 1_000_000
				: 0;
			currentRevenue += appRevenue;

			let appDAUSum = 0,
				appDays = 0,
				hasNonZeroDAU = false;

			item[appKey].forEach((day) => {
				const dau = parseInt(day.pd_active_users || 0);
				const arpu = parseFloat(day.pd_arpu || 0);
				const dauMau = parseFloat(day.pd_dau_per_mau || 0) * 100;

				appDAUSum += dau;
				if (dau > 0) hasNonZeroDAU = true;

				currentArpuSum += arpu;
				currentDauMauSum += dauMau;
				currentDays += 1;
				appDays += 1;
			});

			if (hasNonZeroDAU && appDays > 0) {
				const appAverageDAU = appDAUSum / appDays;
				currentAppDAUAvgsSum += appAverageDAU;
				currentAppsWithNonZeroDAU += 1;
			}
		});

		// Process compare data
		compareData.forEach((item) => {
			const appKey = Object.keys(item)[0];
			const appId = appKey.replace('previous-app-', '');
			const meta = appMetaMap[appId];
			if (!meta || (selectedPlatforms.length && !selectedPlatforms.includes(meta.platform))) return;

			const ecpmEntry = compareEcpm.find((entry) => String(entry.app_auto_id) === String(appId));
			const appRevenue = ecpmEntry
				? parseFloat(ecpmEntry.report_estimated_earnings || 0) / 1_000_000
				: 0;
			compareRevenue += appRevenue;

			let appDAUSum = 0,
				appDays = 0,
				hasNonZeroDAU = false;

			item[appKey].forEach((day) => {
				const dau = parseInt(day.pd_active_users || 0);
				const arpu = parseFloat(day.pd_arpu || 0);
				const dauMau = parseFloat(day.pd_dau_per_mau || 0) * 100;

				appDAUSum += dau;
				if (dau > 0) hasNonZeroDAU = true;

				compareArpuSum += arpu;
				compareDauMauSum += dauMau;
				compareDays += 1;
				appDays += 1;
			});

			if (hasNonZeroDAU && appDays > 0) {
				const appAverageDAU = appDAUSum / appDays;
				compareAppDAUAvgsSum += appAverageDAU;
				compareAppsWithNonZeroDAU += 1;
			}
		});

		// Process extra arrays for cost
		currentExtra.forEach((entry) => {
			const appId = String(entry.pc_app_auto_id);
			const meta = appMetaMap[appId];
			if (!meta || (selectedPlatforms.length && !selectedPlatforms.includes(meta.platform))) return;
			currentCost += parseFloat(entry.pc_cost || 0);
		});

		compareExtra.forEach((entry) => {
			const appId = String(entry.pc_app_auto_id);
			const meta = appMetaMap[appId];
			if (!meta || (selectedPlatforms.length && !selectedPlatforms.includes(meta.platform))) return;
			compareCost += parseFloat(entry.pc_cost || 0);
		});

		// Calculate final metrics
		const currentNetProfit = currentRevenue - currentCost;
		const compareNetProfit = compareRevenue - compareCost;
		const currentTotalDAU = currentAppsWithNonZeroDAU > 0 ? currentAppDAUAvgsSum : 0;
		const compareTotalDAU = compareAppsWithNonZeroDAU > 0 ? compareAppDAUAvgsSum : 0;
		const currentArpDau = currentDays > 0 ? currentArpuSum / currentDays : 0;
		const compareArpDau = compareDays > 0 ? compareArpuSum / compareDays : 0;
		const currentDauMau = currentDays > 0 ? currentDauMauSum / currentDays : 0;
		const compareDauMau = compareDays > 0 ? compareDauMauSum / compareDays : 0;

		return {
			current: {
				totalDAU: currentTotalDAU,
				totalRevenue: currentRevenue,
				totalCost: currentCost,
				netProfit: currentNetProfit,
				arpDau: currentArpDau,
				dauMau: currentDauMau,
			},
			compare: {
				totalDAU: compareTotalDAU,
				totalRevenue: compareRevenue,
				totalCost: compareCost,
				netProfit: compareNetProfit,
				arpDau: compareArpDau,
				dauMau: compareDauMau,
			},
		};
	};
	const dashMetrics = useMemo(() => {
		const selectedAppIds = appInsightsCheckedApp
			.filter((app) => app.item_checked)
			.map((app) => String(app.app_auto_id));
		const selectedPlatforms = platformItem.filter((p) => p.item_checked).map((p) => p.value);
		const shouldFilter = selectedAppIds.length > 0;

		const filteredCurrentData = shouldFilter
			? currentData.filter((item) => {
					const key = Object.keys(item)[0];
					if (!key.startsWith('app-')) return false;
					const appId = key.replace('app-', '');
					return selectedAppIds.includes(appId);
			  })
			: currentData;

		const filteredCompareData = shouldFilter
			? compareData.filter((item) => {
					const key = Object.keys(item)[0];
					if (!key.startsWith('previous-app-')) return false;
					const appId = key.replace('previous-app-', '');
					return selectedAppIds.includes(appId);
			  })
			: compareData;

		const filteredCurrentExtra = shouldFilter
			? currentExtra.filter((e) => selectedAppIds.includes(String(e.pc_app_auto_id)))
			: currentExtra;

		const filteredCompareExtra = shouldFilter
			? compareExtra.filter((e) => selectedAppIds.includes(String(e.pc_app_auto_id)))
			: compareExtra;

		const filteredCurrentEcpm = shouldFilter
			? currentEcpm.filter((e) => selectedAppIds.includes(String(e.app_auto_id)))
			: currentEcpm;

		const filteredCompareEcpm = shouldFilter
			? compareEcpm.filter((e) => selectedAppIds.includes(String(e.app_auto_id)))
			: compareEcpm;

		const { current, compare } = computeTotals(
			filteredCurrentData,
			filteredCompareData,
			filteredCurrentExtra,
			filteredCompareExtra,
			filteredCurrentEcpm,
			filteredCompareEcpm,
			selectedPlatforms
		);

		return [
			{
				title: 'Total DAU',
				value: indianNumberFormat(formatValue(String(current.totalDAU.toFixed(0) || 0))),
				original: indianNumberFormat(current.totalDAU.toFixed(0) || 0),
				compare_orginal: indianNumberFormat(compare.totalDAU.toFixed(0) || 0),
				change: getChange(current.totalDAU || 0, compare.totalDAU || 0),
				changeType: (() => {
					const percent = parseFloat(
						getChange(current.totalDAU || 0, compare.totalDAU || 0).replace('%', '')
					);
					return isNaN(percent) || percent <= 0 ? 'negative' : 'positive';
				})(),
				icon: <FaUsers />,
			},
			{
				title: 'Net Profit',
				value: `${(current.netProfit || 0) >= 0 ? '' : '-'}$${indianNumberFormat(
					formatValue(Math.abs(displayNumber(current.netProfit) || 0))
				)}`,
				original: `${(current.netProfit || 0) >= 0 ? '' : '-'}$${indianNumberFormat(
					Math.abs(displayNumber(current.netProfit) || 0)
				)}`,
				compare_orginal: `${(compare.netProfit || 0) >= 0 ? '' : '-'}$${indianNumberFormat(
					Math.abs(displayNumber(compare.netProfit) || 0)
				)}`,
				change: getChange(current.netProfit || 0, compare.netProfit || 0),
				changeType: (() => {
					const percent = parseFloat(
						getChange(current.netProfit || 0, compare.netProfit || 0).replace('%', '')
					);
					return isNaN(percent) || percent <= 0 ? 'negative' : 'positive';
				})(),
				icon: <MdAttachMoney />,
			},
			{
				title: 'ARPU',
				value: indianNumberFormat(formatValue(current.arpDau || 0)),
				original: displayNumber(indianNumberFormat(current.arpDau || 0)),
				compare_orginal: displayNumber(indianNumberFormat(compare.arpDau || 0)),
				change: getChange(current.arpDau || 0, compare.arpDau || 0),
				changeType: (() => {
					const percent = parseFloat(
						getChange(current.arpDau || 0, compare.arpDau || 0).replace('%', '')
					);
					return isNaN(percent) || percent <= 0 ? 'negative' : 'positive';
				})(),
				icon: <FiTarget />,
			},
			{
				title: 'DAU/MAU',
				value: `${displayNumber(current.dauMau || 0)}%`,
				original: `${(current.dauMau || 0).toFixed(2)}%`,
				compare_orginal: `${(compare.dauMau || 0).toFixed(2)}%`,
				change: getChange(current.dauMau || 0, compare.dauMau || 0),
				changeType: (() => {
					const percent = parseFloat(
						getChange(current.dauMau || 0, compare.dauMau || 0).replace('%', '')
					);
					return isNaN(percent) || percent <= 0 ? 'negative' : 'positive';
				})(),
				icon: <RiErrorWarningLine />,
			},
		];
	}, [
		currentData,
		currentExtra,
		compareData,
		compareExtra,
		appInsightsCheckedApp,
		currentEcpm,
		compareEcpm,
	]);
	// Build cost maps
	const currentCostMap = useMemo(() => {
		const map = {};
		currentExtra.forEach((row) => {
			const id = row.pc_app_auto_id;
			if (!map[id]) map[id] = { cost: 0 };
			map[id].cost += parseFloat(row.pc_cost || 0);
		});
		return map;
	}, [currentExtra]);

	const compareCostMap = useMemo(() => {
		const map = {};
		compareExtra.forEach((row) => {
			const id = row.pc_app_auto_id;
			if (!map[id]) map[id] = { cost: 0 };
			map[id].cost += parseFloat(row.pc_cost || 0);
		});
		return map;
	}, [compareExtra]);

	const ecpmRevenueMap = {};
	currentEcpm.forEach((entry) => {
		ecpmRevenueMap[entry.app_auto_id] = parseFloat(entry.report_estimated_earnings || 0) / 1_000_000;
	});

	const checkedAppIds = new Set(
		appInsightsCheckedApp.filter((app) => app.item_checked).map((app) => app.app_auto_id)
	);

	const selectedSort = orderByItem[0]?.value || null;

	const startDate = moment(selectedStartDate, 'DD/MM/YYYY');
	const endDate = moment(selectedEndDate, 'DD/MM/YYYY');
	const dayDiff = endDate.diff(startDate, 'days');
	let groupingMode = 'daily';
	if (dayDiff > 365) {
		groupingMode = 'yearly';
	} else if (dayDiff > 90) {
		groupingMode = 'monthly';
	} else if (dayDiff > 30) {
		groupingMode = 'weekly';
	}

	function processAppData({
		currentData,
		compareData,
		currentEcpm,
		compareEcpm,
		currentRetention,
		compareRetention,
		currentRetentionDayone,
		compareRetentionDayone,
		currentExtra,
		compareExtra,
		appMetaMap,
		checkedAppIds,
		platformFilterValues,
		groupingMode,
		selectedSort,
		currentCostMap,
		compareCostMap,
		ecpmRevenueMap,
		formatValue,
		indianNumberFormat,
		displayNumber,
		getChange,
		moment,
	}) {
		return currentData
			.map((item) => {
				const appKey = Object.keys(item)[0];
				const rows = item[appKey];
				const appId = rows[0]?.pd_app_auto_id;
				const meta = appMetaMap[appId] || {};
				if (
					(checkedAppIds.size > 0 && !checkedAppIds.has(appId)) ||
					(platformFilterValues?.length > 0 && !platformFilterValues.includes(meta.platform))
				) {
					return null;
				}

				// Current data aggregations
				let appDAUSum = 0;
				let hasNonZeroDAU = false;
				let totalNewUsers = 0;
				let totalArpu = 0;
				let sessionDauRatios = [];
				let dayCount = 0;

				const ecpmEntry = currentEcpm.find((entry) => String(entry.app_auto_id) === String(appId));
				const totalRevenue = currentEcpm
					.filter((entry) => String(entry.app_auto_id) === String(appId))
					.reduce((sum, entry) => sum + parseFloat(entry.report_estimated_earnings || 0) / 1_000_000, 0);
				rows.forEach((row) => {
					const dau = parseInt(row.pd_active_users || 0);
					const newUsers = parseInt(row.pd_new_users || 0);
					const sessions = parseInt(row.pd_sessions || 0);
					const arpu = parseFloat(row.pd_arpu || 0);

					appDAUSum += dau;
					if (dau > 0) hasNonZeroDAU = true;
					totalNewUsers += newUsers;
					totalArpu += arpu;
					if (dau > 0) {
						sessionDauRatios.push(sessions / dau);
					}
					dayCount += 1;
				});

				const totalDAU = hasNonZeroDAU && dayCount > 0 ? appDAUSum / dayCount : 0;
				const avgArpDau = dayCount > 0 ? totalArpu / dayCount : 0;
				const avgSessionDau =
					sessionDauRatios.length > 0
						? sessionDauRatios.reduce((a, b) => a + b, 0) / sessionDauRatios.length
						: 0;

				// Compare data aggregations
				const compareAppItem = compareData.find((cmp) => Object.keys(cmp)[0] === `previous-${appKey}`);
				let compareDAUSum = 0;
				let compareNewUsersSum = 0;
				let compareSessionDauRatios = [];
				let compareDayCount = 0;
				let compareArpuSum = 0;

				const compareEcpmEntry = compareEcpm.find(
					(entry) => String(entry.app_auto_id) === String(appId)
				);
				const compareRevenue = compareEcpm
					.filter((entry) => String(entry.app_auto_id) === String(appId))
					.reduce((sum, entry) => sum + parseFloat(entry.report_estimated_earnings || 0) / 1_000_000, 0);
				if (compareAppItem) {
					const compareRows = compareAppItem[`previous-${appKey}`];
					compareRows.forEach((row) => {
						const dau = parseInt(row.pd_active_users || 0);
						const newUsers = parseInt(row.pd_new_users || 0);
						const sessions = parseInt(row.pd_sessions || 0);
						const arpu = parseFloat(row.pd_arpu || 0);

						compareDAUSum += dau;
						compareNewUsersSum += newUsers;
						compareArpuSum += arpu;
						if (dau > 0) {
							compareSessionDauRatios.push(sessions / dau);
						}
						compareDayCount += 1;
					});
				}

				const compareDAU = compareDayCount > 0 ? compareDAUSum / compareDayCount : 0;
				const compareNewUsers = compareNewUsersSum;
				const compareSessionRatio =
					compareSessionDauRatios.length > 0
						? compareSessionDauRatios.reduce((a, b) => a + b, 0) / compareSessionDauRatios.length
						: 0;
				const compareArpDau = compareDayCount > 0 ? compareArpuSum / compareDayCount : 0;

				const cost = currentCostMap[appId]?.cost ?? null;
				const compareCost = compareCostMap[appId]?.cost ?? null;
				const profit = Number(totalRevenue) - Number(cost);
				const compareProfit = compareCost !== null ? compareRevenue - compareCost : null;

				const arpDauChange = getChange(avgArpDau || 0, compareArpDau || 0);
				const sessionDauChange = getChange(
					displayNumber(avgSessionDau) || 0,
					displayNumber(compareSessionRatio) || 0
				);

				// Retention and ECPM
				let retentionSum = 0;
				let compareRetentionSum = 0;
				let ecpmSum = 0;
				let compareEcpmSum = 0;
				let retentionDay1Sum = 0;
				let compareRetentionDay1Sum = 0;

				let retentionCount = 0;
				let compareRetentionCount = 0;
				let ecpmCount = 0;
				let compareEcpmCount = 0;
				let retentionDay1Count = 0;
				let compareRetentionDay1Count = 0;

				// Process current retention data
				currentRetention.forEach((retentionEntry) => {
					if (retentionEntry.ar_app_auto_id === appId) {
						const retention = parseFloat(retentionEntry.retention_rate_7_day || 0);
						retentionSum += retention;
						retentionCount += 1;
					}
				});

				// Process comparison retention data
				compareRetention.forEach((retentionEntry) => {
					if (retentionEntry.ar_app_auto_id === appId) {
						const retention = parseFloat(retentionEntry.retention_rate_7_day || 0);
						compareRetentionSum += retention;
						compareRetentionCount += 1;
					}
				});

				// Process current day-1 retention data
				currentRetentionDayone.forEach((retentionEntry) => {
					if (retentionEntry.ar_app_auto_id === appId) {
						const retentionDay1 = parseFloat(retentionEntry.retention_rate_1_day || 0);
						retentionDay1Sum += retentionDay1;
						retentionDay1Count += 1;
					}
				});

				// Process comparison day-1 retention data
				compareRetentionDayone.forEach((retentionEntry) => {
					if (retentionEntry.ar_app_auto_id === appId) {
						const retentionDay1 = parseFloat(retentionEntry.retention_rate_1_day || 0);
						compareRetentionDay1Sum += retentionDay1;
						compareRetentionDay1Count += 1;
					}
				});

				const ecpmEntryforecpmData = currentEcpm.filter(
					(entry) => String(entry.app_auto_id) === String(appId)
				);
				ecpmEntryforecpmData.forEach((entry) => {
					const ecpm = parseFloat(entry.report_observed_ecpm || 0);
					if (!isNaN(ecpm)) {
						ecpmSum += ecpm;
						ecpmCount += 1;
					}
				});

				// Process comparison eCPM data
				const compareEcpmEntryforecpmData = compareEcpm.filter(
					(entry) => String(entry.app_auto_id) === String(appId)
				);
				compareEcpmEntryforecpmData.forEach((entry) => {
					const compareEcpm = parseFloat(entry.report_observed_ecpm || 0);
					if (!isNaN(compareEcpm)) {
						compareEcpmSum += compareEcpm;
						compareEcpmCount += 1;
					}
				});

				// Calculate averages
				const avgRetention = retentionCount > 0 ? retentionSum / retentionCount : 0;
				const avgCompareRetention =
					compareRetentionCount > 0 ? compareRetentionSum / compareRetentionCount : 0;
				const avgEcpm = ecpmCount > 0 ? ecpmSum / ecpmCount : 0;
				const avgCompareEcpm = compareEcpmCount > 0 ? compareEcpmSum / compareEcpmCount : 0;

				const avgRetentionDay1 = retentionDay1Count > 0 ? retentionDay1Sum / retentionDay1Count : 0;

				const avgCompareRetentionDay1 =
					compareRetentionDay1Count > 0 ? compareRetentionDay1Sum / compareRetentionDay1Count : 0;

				// Calculate percentage changes
				const retentionPercentageChange = getChange(avgRetention || 0, avgCompareRetention || 0);
				const ecpmPercentageChange = getChange(
					displayNumber(avgEcpm) || 0,
					displayNumber(avgCompareEcpm) || 0
				);
				// Current data points
				const retentionDay1PercentageChange = getChange(
					avgRetentionDay1 || 0,
					avgCompareRetentionDay1 || 0
				);

				let groupedRows = {};
				rows.forEach((row) => {
					const date = moment(row.pd_date, 'YYYYMMDD');
					let groupKey;
					if (groupingMode === 'weekly') {
						groupKey = date.startOf('isoWeek').format('YYYY-[W]WW');
					} else if (groupingMode === 'monthly') {
						groupKey = date.startOf('month').format('YYYY-MM');
					} else if (groupingMode === 'yearly') {
						groupKey = date.startOf('year').format('YYYY');
					} else {
						groupKey = date.format('YYYYMMDD');
					}
					if (!groupedRows[groupKey]) groupedRows[groupKey] = [];
					groupedRows[groupKey].push(row);
				});

				const dataPoints = Object.entries(groupedRows)
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([key, group]) => {
						const dau = group.reduce((sum, row) => sum + parseInt(row.pd_active_users || 0), 0);
						const newUsers = group.reduce((sum, row) => sum + parseInt(row.pd_new_users || 0), 0);

						const revenue = group.reduce((sum, row) => {
							const rowDate = moment(row.pd_date, 'YYYYMMDD').format('YYYY-MM-DD');
							const matchingEcpmEntry = currentEcpm.find(
								(e) => String(e.app_auto_id) === String(appId) && e.report_date === rowDate
							);
							const earnings = matchingEcpmEntry
								? parseFloat(matchingEcpmEntry.report_estimated_earnings || 0)
								: 0;
							return sum + earnings / 1000000;
						}, 0);
						const sessions = group.reduce((sum, row) => sum + parseInt(row.pd_sessions || 0), 0);
						const arpu = group.reduce((sum, row) => sum + parseFloat(row.pd_arpu || 0), 0); // Fixed: Changed parseInt to parseFloat for arpu
						const label =
							groupingMode === 'daily'
								? moment(key, 'YYYYMMDD').format('MMM D')
								: groupingMode === 'weekly'
								? key
								: groupingMode === 'monthly'
								? moment(key, 'YYYY-MM').format('MMM YYYY')
								: key;

						const matchingCostItems = group.map((row) =>
							currentExtra.find((e) => e.pc_app_auto_id?.toString() === appId && e.pc_date === row.pd_date)
						);
						const cost = matchingCostItems.reduce((sum, e) => sum + parseFloat(e?.pc_cost || 0), 0);
						const profit = revenue - cost;

						// Calculate retention for the group
						let retentionSum = 0;
						let retentionCount = 0;
						group.forEach((row) => {
							const rowDate = moment(row.pd_date, 'YYYYMMDD').format('YYYY-MM-DD'); // Convert pd_date to YYYY-MM-DD
							const retentionEntry = currentRetention.find(
								(e) => e.ar_app_auto_id === appId && e.ar_install_date === rowDate
							);
							if (retentionEntry) {
								retentionSum += parseFloat(retentionEntry.retention_rate_7_day || 0);
								retentionCount += 1;
							}
						});
						const retention = retentionCount > 0 ? retentionSum / retentionCount : 0;

						// Calculate retention1 for the group
						let retentionSum1 = 0;
						let retentionCount1 = 0;
						group.forEach((row) => {
							const rowDate = moment(row.pd_date, 'YYYYMMDD').format('YYYY-MM-DD'); // Convert pd_date to YYYY-MM-DD
							const retentionEntry = currentRetentionDayone.find(
								(e) => e.ar_app_auto_id === appId && e.ar_install_date === rowDate
							);
							if (retentionEntry) {
								retentionSum1 += parseFloat(retentionEntry.retention_rate_1_day || 0);
								retentionCount1 += 1;
							}
						});
						const retention1 = retentionCount1 > 0 ? retentionSum1 / retentionCount1 : 0;

						// Calculate eCPM for the group
						let ecpmSum = 0;
						let ecpmCount = 0;
						group.forEach((row) => {
							const rowDate = moment(row.pd_date, 'YYYYMMDD').format('YYYY-MM-DD'); // Convert pd_date to YYYY-MM-DD
							const ecpmEntry = currentEcpm.find(
								(e) => String(e.app_auto_id) === String(appId) && e.report_date === rowDate
							);
							if (ecpmEntry) {
								ecpmSum += parseFloat(ecpmEntry.report_observed_ecpm || 0);
								ecpmCount += 1;
							}
						});
						const ecpm = ecpmCount > 0 ? ecpmSum / ecpmCount : 0;

						return {
							label,
							pd_date: key,
							dau,
							newUsers,
							revenue,
							cost,
							arpu: parseFloat((arpu / group.length).toFixed(2)), // Fixed: Average arpu over group length
							sessions,
							sessionDau: dau > 0 ? Number((sessions / dau).toFixed(2)) : 0,
							profit: profit != null ? parseFloat(profit.toFixed(2)) : null,
							retention: parseFloat(retention.toFixed(2)),
							retention1: parseFloat(retention1.toFixed(2)),
							ecpm: parseFloat(ecpm.toFixed(2)),
						};
					});

				// Compare data points
				let compareGroupedRows = {};
				if (compareAppItem) {
					const compareRows = compareAppItem[`previous-${appKey}`];
					compareRows.forEach((row) => {
						const date = moment(row.pd_date, 'YYYYMMDD');
						let groupKey;
						if (groupingMode === 'weekly') {
							groupKey = date.startOf('isoWeek').format('YYYY-[W]WW');
						} else if (groupingMode === 'monthly') {
							groupKey = date.startOf('month').format('YYYY-MM');
						} else if (groupingMode === 'yearly') {
							groupKey = date.startOf('year').format('YYYY');
						} else {
							groupKey = date.format('YYYYMMDD');
						}
						if (!compareGroupedRows[groupKey]) compareGroupedRows[groupKey] = [];
						compareGroupedRows[groupKey].push(row);
					});
				}

				const compareDataPoints = Object.entries(compareGroupedRows)
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([key, group]) => {
						const dau = group.reduce((sum, row) => sum + parseInt(row.pd_active_users || 0), 0);
						const newUsers = group.reduce((sum, row) => sum + parseInt(row.pd_new_users || 0), 0);
						const revenue = group.reduce((sum, row) => {
							const rowDate = moment(row.pd_date, 'YYYYMMDD').format('YYYY-MM-DD');
							const matchingEcpmEntry = compareEcpm.find(
								(e) => String(e.app_auto_id) === String(appId) && e.report_date === rowDate
							);
							const earnings = matchingEcpmEntry
								? parseFloat(matchingEcpmEntry.report_estimated_earnings || 0)
								: 0;
							return sum + earnings / 1000000;
						}, 0);
						const sessions = group.reduce((sum, row) => sum + parseInt(row.pd_sessions || 0), 0);
						const arpu = group.reduce((sum, row) => sum + parseFloat(row.pd_arpu || 0), 0); // Fixed: Changed parseInt to parseFloat for arpu
						const label =
							groupingMode === 'daily'
								? moment(key, 'YYYYMMDD').format('MMM D')
								: groupingMode === 'weekly'
								? key
								: groupingMode === 'monthly'
								? moment(key, 'YYYY-MM').format('MMM YYYY')
								: key;

						const matchingCostItems = group.map((row) =>
							compareExtra.find((e) => e.pc_app_auto_id?.toString() === appId && e.pc_date === row.pd_date)
						);
						const cost = matchingCostItems.reduce((sum, e) => sum + parseFloat(e?.pc_cost || 0), 0);
						const profit = revenue - cost;

						// Calculate retention for the group
						let retentionSum = 0;
						let retentionCount = 0;
						group.forEach((row) => {
							const rowDate = moment(row.pd_date, 'YYYYMMDD').format('YYYY-MM-DD'); // Convert pd_date to YYYY-MM-DD
							const retentionEntry = compareRetention.find(
								(e) => e.ar_app_auto_id === appId && e.ar_install_date === rowDate
							);
							if (retentionEntry) {
								retentionSum += parseFloat(retentionEntry.retention_rate_7_day || 0);
								retentionCount += 1;
							}
						});
						const retention = retentionCount > 0 ? retentionSum / retentionCount : 0;

						// Calculate retention1 for the group
						let retentionSum1 = 0;
						let retentionCount1 = 0;
						group.forEach((row) => {
							const rowDate = moment(row.pd_date, 'YYYYMMDD').format('YYYY-MM-DD'); // Convert pd_date to YYYY-MM-DD
							const retentionEntry = compareRetentionDayone.find(
								(e) => e.ar_app_auto_id === appId && e.ar_install_date === rowDate
							);
							if (retentionEntry) {
								retentionSum1 += parseFloat(retentionEntry.retention_rate_1_day || 0);
								retentionCount1 += 1;
							}
						});
						const retention1 = retentionCount1 > 0 ? retentionSum1 / retentionCount1 : 0;

						// Calculate eCPM for the group
						let ecpmSum = 0;
						let ecpmCount = 0;
						group.forEach((row) => {
							const rowDate = moment(row.pd_date, 'YYYYMMDD').format('YYYY-MM-DD'); // Convert pd_date to YYYY-MM-DD
							const ecpmEntry = compareEcpm.find(
								(e) => String(e.app_auto_id) === String(appId) && e.report_date === rowDate
							);
							if (ecpmEntry) {
								ecpmSum += parseFloat(ecpmEntry.report_observed_ecpm || 0);
								ecpmCount += 1;
							}
						});
						const ecpm = ecpmCount > 0 ? ecpmSum / ecpmCount : 0;

						return {
							label,
							pd_date: key,
							dau,
							newUsers,
							revenue,
							cost,
							arpu: parseFloat((arpu / group.length).toFixed(2)), // Fixed: Average arpu over group length
							sessions,
							sessionDau: dau > 0 ? Number((sessions / dau).toFixed(2)) : 0,
							profit: profit != null ? parseFloat(profit.toFixed(2)) : null,
							retention: parseFloat(retention.toFixed(2)),
							retention1: parseFloat(retention1.toFixed(2)),
							ecpm: parseFloat(ecpm.toFixed(2)),
						};
					});

				return {
					meta,
					appId,
					totalDAU,
					totalNewUsers,
					totalRevenue,
					cost,
					profit,
					avgArpDau,
					avgSessionDau,
					compareDAU,
					compareNewUsers,
					compareCost,
					compareRevenue,
					compareProfit,
					avgRetention,
					avgCompareRetention,
					retentionPercentageChange,
					avgEcpm,
					avgCompareEcpm,
					ecpmPercentageChange,
					avgRetentionDay1,
					avgCompareRetentionDay1,
					retentionDay1PercentageChange,
					arpDauChange,
					sessionDauChange,
					dataPoints,
					compareDataPoints,
					compareSessionRatio,
				};
			})
			.filter((app) => app !== null);
	}

	const formData = useMemo(() => {
		const appFormData = new FormData();
		appFormData.append('user_id', localStorage.getItem('id'));
		appFormData.append('user_token', localStorage.getItem('token'));
		appFormData.append('insight_date_range', `${selectedStartDate}-${selectedEndDate}`);
		if (selectedGroup?.length > 0) {
			appFormData.append('gg_id', selectedGroup);
		}

		return appFormData;
	}, [selectedStartDate, selectedEndDate, selectedGroup]);

	const isQueryEnabled = selectedStartDate.length > 0 && selectedEndDate.length > 0;

	const {
		data: apiResponse,
		isSuccess: apiSuccess,
		isLoading,
		isFetching,
	} = useQueryFetch(
		['insights-table', selectedStartDate, selectedEndDate, selectedGroup],
		'insight-all-apps',
		formData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: isQueryEnabled,
		}
	);

	useEffect(() => {
		if (!apiSuccess || !apiResponse) return;
		if (apiResponse.status_code == 1) {
			setCurrentData(apiResponse?.current?.data || []);
			setCurrentExtra(apiResponse?.current?.extra_data || []);
			setCompareData(apiResponse?.compare?.data || []);
			setCompareExtra(apiResponse?.compare?.extra_data || []);
			setCurrentRetention(apiResponse?.current?.date_wise_retention_7_day || []);
			setCompareRetention(apiResponse?.compare?.date_wise_retention_7_day || []);
			setCurrentRetentionDayone(apiResponse?.current?.date_wise_retention_1_day || []);
			setCompareRetentionDayone(apiResponse?.compare?.date_wise_retention_1_day || []);
			setEcpm(apiResponse?.current?.ecpm_data || []);
			setCompareEcpm(apiResponse?.compare?.ecpm_data || []);
			setIsLoaderVisible(false);
			setIsLoaderVisibleSort(false);
			setTotalFlag(!totalFlag);
			setInitialAPIData(apiResponse);
		}
	}, [apiResponse, apiSuccess]);

	//table data calculation
	useEffect(() => {
		const flattenData = () => {
			const checkedAppIds = new Set(
				appInsightsCheckedApp.filter((app) => app.item_checked).map((app) => app.app_auto_id)
			);

			const appMetrics = processAppData({
				currentData,
				compareData,
				currentEcpm,
				compareEcpm,
				currentRetention,
				compareRetention,
				currentRetentionDayone,
				compareRetentionDayone,
				currentExtra,
				compareExtra,
				appMetaMap,
				checkedAppIds,
				groupingMode,
				selectedSort,
				currentCostMap,
				compareCostMap,
				ecpmRevenueMap,
				formatValue,
				indianNumberFormat,
				displayNumber,
				getChange,
				moment,
			});
			const result = appMetrics.map((app) => ({
				app_auto_id: app.appId,
				app_display_name: app.meta.name,
				app_icon: app.meta.icon,
				app_console_name: app.meta.console,
				app_platform: app.meta.platform,
				app_store_id: app.meta.package,

				total_revenue: app.totalRevenue?.toFixed(2),
				total_cost: app.cost?.toFixed(2) ?? '0.00',
				profit: app.profit?.toFixed(2) ?? '0.00',
				arpu: (app.avgArpDau || 0).toFixed(6),
				dau: app.totalDAU.toFixed(0) ?? 0,
				sessions: app.avgSessionDau ?? 0,
				new_users: app.totalNewUsers ?? 0,
				ecpm: app.avgEcpm || 0,

				installs: currentRetention.find((r) => r.ar_app_auto_id === app.appId)
					?.total_installs_with_day7,
				retained: currentRetention.find((r) => r.ar_app_auto_id === app.appId)?.retained_on_day_7,
				retention_rate: app.avgRetention,
				retention_rate_day1: app.avgRetentionDay1,

				compare_total_revenue: app.compareRevenue?.toFixed(2),
				compare_total_cost: app?.compareCost?.toFixed(2) ?? '0.00',
				compare_profit: app.compareProfit?.toFixed(2) ?? '0.00',
				compare_arpu: parseFloat(app.compareTotals?.pd_arpu || 0).toFixed(6),
				compare_dau: app.compareDAU.toFixed(0) ?? 0,
				compare_sessions: app.compareSessionRatio ?? 0,
				compare_new_users: app.compareNewUsers ?? 0,
				compare_ecpm: app.avgCompareEcpm || 0,
				compare_installs: compareRetention.find((r) => r.ar_app_auto_id === app.appId)
					?.total_installs_with_day7,
				compare_retained: compareRetention.find((r) => r.ar_app_auto_id === app.appId)
					?.retained_on_day_7,

				compare_retention_rate: app.avgCompareRetention,
				compare_retention_rate_day1: app.avgCompareRetentionDay1,

				change_revenue: getChange(app.totalRevenue, app.compareRevenue),
				change_cost: getChange(app.cost?.toFixed(2) ?? 0, app?.compareCost?.toFixed(2) ?? 0),
				change_profit: getChange(app.profit ?? 0, app.compareProfit ?? 0),
				change_arpu: app.arpDauChange,
				change_dau: getChange(app.totalDAU, app.compareDAU),
				change_sessions: app.sessionDauChange,
				change_new_users: getChange(app.totalNewUsers, app.compareNewUsers),
				change_ecpm: app.ecpmPercentageChange,
				change_retention: app.retentionPercentageChange,

				session_dau: (app.avgSessionDau || 0).toFixed(2),
				compare_session_dau: (app.compareSessionRatio || 0).toFixed(2),
				change_session_dau: getChange(app.avgSessionDau, app.compareSessionRatio),
				dataPoints: app.dataPoints,
				compareDataPoints: app.compareDataPoints,
			}));
			const selectedPlatforms = platformItem.filter((p) => p.item_checked).map((p) => p.value);

			const filteredResult =
				selectedPlatforms.length > 0
					? result.filter((r) => selectedPlatforms.includes(r.app_platform))
					: result;

			const indexedResult = filteredResult.map((item, index) => ({
				...item,
				__index: index,
			}));
			setMainData(indexedResult);
		};

		flattenData();
	}, [
		currentData,
		compareData,
		currentEcpm,
		compareEcpm,
		currentRetention,
		compareRetention,
		currentExtra,
		compareExtra,
		appMetaMap,
		appInsightsCheckedApp,
		orderByItem,
		platformItem,
		selectedGroup,
	]);

	const renderMetricCell = (
		currentVal,
		compareVal,
		isCurrency = false,
		row,
		columnIndex,
		forcePercentage = false
	) => {
		const val = parseFloat(currentVal) ?? 0;
		const comp = parseFloat(compareVal) ?? 0;
		const numVal = displayNumber(val);
		const numComp = displayNumber(comp);

		const formatCellValue = (value, isCurrency, forcePercentage) => {
			if (forcePercentage) return `${displayNumber(value)}%`;
			if (isCurrency) {
				const absFormatted = indianNumberFormat(Math.abs(value));
				return value < 0 ? `-$${absFormatted}` : `$${absFormatted}`;
			}
			return indianNumberFormat(value);
		};

		const formatted = formatCellValue(numVal, isCurrency, forcePercentage);
		const original = formatCellValue(numVal, isCurrency, forcePercentage);
		const compareOriginal = formatCellValue(numComp, isCurrency, forcePercentage);

		const percentChange = getChange(numVal, numComp);
		const percent = parseFloat(percentChange.replace('%', '').replace('+', '').replace('-', ''));

		const isPositive = !isNaN(percent) && parseFloat(percentChange) > 0;

		const tooltipContent = (
			<div className='copyMessage'>
				<div className='tooltip-inner'>
					<div className='tooltip-value'>
						<div>
							<span className='prefix '>
								{formatDateMonthRange(previousDateRange.start, previousDateRange.end)}{' '}
							</span>
							<span>{compareOriginal}</span>
						</div>
						<div>
							<span className='prefix '>{formatDateMonthRange(selectedStartDate, selectedEndDate)} </span>
							<span>{original}</span>
						</div>
					</div>
				</div>
			</div>
		);

		return (
			<div
				className='app-insight-col'
				onClick={() => {
					setExpandedRowAppId((prevId) => (prevId === row.app_auto_id ? null : row.app_auto_id));
				}}
				style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}
			>
				<div className={`text-box copy-text value-tooltip `} style={{ display: 'inline-flex' }}>
					<Tippy
						content={tooltipContent}
						placement='top'
						arrow={true}
						duration={0}
						delay={[200, 0]}
						appendTo={document.body}
						trigger='mouseenter focus'
						className={`custom-tooltip ${+formatted === 0 || +formatted == null ? 'zero-val' : ''}`}
					>
						<div className='table-cell-value'>{formatted}</div>
					</Tippy>
				</div>

				{percentageInfo && !isNaN(percent) && Math.abs(percent) >= 10 && (
					<div
						className='metric-change insights-percentage'
						style={{
							color:
								isNaN(percent) || parseFloat(percentChange) <= 0
									? isDarkMode
										? '#ff0000b5'
										: '#d93025'
									: isDarkMode
									? '#04b488'
									: '#137333',
							display: 'inline-flex',
							alignItems: 'center',
							gap: 4,
						}}
					>
						{percentChange}
					</div>
				)}
			</div>
		);
	};

	const getHighlightedTotal = (current, previous, isPercentage = false, isARPU = false) => {
		const val = (isARPU ? Number(current).toFixed(2) : current) ?? 0;
		const comp = (isARPU ? Number(previous).toFixed(2) : previous) ?? 0;

		const numericCurrent = parseFloat((val || '0').toString().replace(/[$,%\s,]/g, ''));
		const numericCompare = parseFloat((comp || '0').toString().replace(/[$,%\s,]/g, ''));

		const percentChange = getChange(numericCurrent, numericCompare);
		const percent = parseFloat(percentChange.replace('%', '').replace('+', '').replace('-', ''));
		const isPositive = !isNaN(percent) && parseFloat(percentChange) > 0;

		return (
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<Tippy
					content={
						<div className='copyMessage'>
							<div className='tooltip-inner'>
								<div className='tooltip-value'>
									<div>
										<span className='prefix'>
											{formatDateMonthRange(previousDateRange.start, previousDateRange.end)}{' '}
										</span>
										<span>{comp}</span>
									</div>
									<div>
										<span className='prefix'>{formatDateMonthRange(selectedStartDate, selectedEndDate)}</span>
										<span>{val}</span>
									</div>
								</div>
							</div>
						</div>
					}
					placement='top'
					arrow={true}
					className={`custom-tooltip ${+val === 0 || +val == null ? 'zero-val' : ''}`}
					duration={0}
				>
					<div className={`report-total-dimension`}>{indianNumberFormat(val)}</div>
				</Tippy>

				{percentageInfo && !isNaN(percent) && Math.abs(percent) >= 10 && (
					<span
						className='report-prev-total'
						style={{
							color: isPositive
								? isDarkMode
									? '#04b488'
									: '#137333'
								: isDarkMode
								? '#ff0000b5'
								: '#d93025',
							fontSize: '10px',
						}}
					>
						{percentChange}
					</span>
				)}
			</div>
		);
	};

	const metricConfigs = [
		{ key: 'dau', type: 'users' },
		{ key: 'newUsers', type: 'users' },
		{ key: 'revenue', type: 'profit' },
		{ key: 'cost', type: 'profit' },
		{ key: 'profit', type: 'profit' },
		{ key: 'retention1', type: 'percent' },
		{ key: 'retention', type: 'percent' },
		{ key: 'arpu', type: 'profit' },
		{ key: 'ecpm', type: 'profit' },
		{ key: 'sessionDau', type: 'users' },
	];

	const ExpandableChartRow = ({ data }) => {
		const expandedAppData = finalTableData.find((app) => app.app_auto_id === data.app_auto_id);

		const containerRef = React.useRef(null);
		const [chartStyles, setChartStyles] = React.useState([]);
		const [isReady, setIsReady] = React.useState(false);

		// chart-key → TanStack column-id
		const chartToColId = React.useMemo(
			() => ({
				dau: 'dau',
				newUsers: 'new_users',
				revenue: 'total_revenue',
				cost: 'total_cost',
				profit: 'profit',
				retention1: 'retention_rate_day1',
				retention: 'retention_rate',
				arpu: 'arpu',
				ecpm: 'ecpm',
				sessionDau: 'sessions',
			}),
			[]
		);

		const getChartData = (key, valueType = 'users') => {
			if (!expandedAppData) return null;

			const keyExists = expandedAppData.dataPoints?.some(
				(dp) => dp[key] !== undefined && dp[key] !== null
			);
			if (!keyExists) return null;

			return {
				current: {
					type: 'column',
					name: 'Current',
					markerSize: 0,
					index: 8,
					color: '#1a73e8',
					dataPoints: expandedAppData.dataPoints.map((dp, idx) => ({
						x: idx,
						y: dp[key] ?? 0,
						label: dp.label,
						value: valueType,
					})),
				},
				compare: {
					type: 'column',
					name: 'Compare',
					markerSize: 0,
					color: '#1a73e835',
					dataPoints:
						expandedAppData.compareDataPoints?.map((dp, idx) => ({
							x: idx,
							y: dp[key] ?? 0,
							label: dp.label,
							value: valueType,
						})) ?? [],
				},
			};
		};

		React.useEffect(() => {
			let raf1 = 0;
			let raf2 = 0;

			const compute = () => {
				const host = containerRef.current;
				if (!host) return;

				const scroller = host.closest('.custom_tan_stack_table');
				if (!scroller) return;

				const table = scroller.querySelector('table');
				if (!table) return;

				const thead = table.querySelector('thead');
				if (!thead) return;

				const tableRect = table.getBoundingClientRect();

				const styles = metricConfigs.map(({ key }) => {
					const colId = chartToColId[key];
					if (!colId) return null;

					const headerCell = thead.querySelector(`[data-column-id="${colId}"]`);
					if (!headerCell) return null;

					const r = headerCell.getBoundingClientRect();

					// If column is not laid out yet, bail for this key
					if (!r.width) return null;

					// viewport → table-content coordinate
					//const colLeft = r.left - tableRect.left + scroller.scrollLeft;

					const colLeft = r.left - tableRect.left;

					const colWidth = r.width;

					const graphWidth = 100;
					const left = Math.max(0, colLeft + colWidth - graphWidth);

					return { position: 'absolute', left: `${left}px` };
				});

				setChartStyles(styles);
				setIsReady(true);
			};

			raf1 = requestAnimationFrame(() => {
				raf2 = requestAnimationFrame(() => compute());
			});

			const host = containerRef.current;
			const scroller = host?.closest('.custom_tan_stack_table');

			const ro = new ResizeObserver(() => compute());
			if (scroller) ro.observe(scroller);

			return () => {
				cancelAnimationFrame(raf1);
				cancelAnimationFrame(raf2);
				ro.disconnect();
			};
		}, [metricConfigs, chartToColId, expandedRowAppId, itemsPerPage, currentPage]);

		if (!expandedAppData) return null;

		const chartDataMap = metricConfigs.map(({ key, type }) => ({
			key,
			chartData: getChartData(key, type),
		}));

		return (
			<div
				ref={containerRef}
				className='metric-bar expanded-bar'
				style={{
					position: 'relative',
					display: 'flex',
					gap: '14px',
					padding: '9px 8px',
					width: '100%',
					height: '80px',
				}}
			>
				{chartDataMap.map(({ key, chartData }, idx) => {
					const style = chartStyles[idx];
					return (
						<div
							key={idx}
							className={`app-line-chart-box adunit-line-chart ${key}`}
							style={{
								...(style || { position: 'absolute', left: 0 }),
								minWidth: '100px',
								minHeight: 50,
								opacity: isReady && style ? 1 : 0,
								transition: 'opacity 0.15s ease-in',
								pointerEvents: 'auto',
							}}
						>
							{chartData ? (
								<CanvasChartItem chartData={chartData} graphType='line' height={50} />
							) : (
								<div style={{ width: '100%', height: '100%', borderRadius: 4 }} />
							)}
						</div>
					);
				})}
			</div>
		);
	};

	//percent logic
	const handlePercentageCheck = () => {
		setTotalFlag(!totalFlag);
		const switchBoxValuefromLocal = localStorage.getItem('isAppInsightsPercentageCheck');
		if (switchBoxValuefromLocal === 'true') {
			const value = JSON?.parse(switchBoxValuefromLocal);
			setPercentageInfo(!value);
			localStorage.setItem('isAppInsightsPercentageCheck', !switchBoxValuefromLocal);
		} else {
			setPercentageInfo(!percentageInfo);
			localStorage.setItem('isAppInsightsPercentageCheck', !percentageInfo);
		}
		setPercentageInfo(!percentageInfo);
	};

	//handle percentage check
	useEffect(() => {
		const changeValueString = localStorage?.getItem('isAppInsightsPercentageCheck');
		if (changeValueString) {
			const changeValue = JSON?.parse(changeValueString);
			setPercentageInfo(changeValue);
		}
	}, []);

	//pagination
	const finalTableData = useMemo(() => {
		return mainData;
	}, [mainData, selectedGroup]);

	//footer total
	useEffect(() => {
		if (!finalTableData || finalTableData.length === 0) return;

		let ecpmCount = 0;
		let compareEcpmCount = 0;
		let arpuCount = 0;
		let compareArpuCount = 0;
		let dauCount = 0;
		let compareDauCount = 0;
		let sessionCount = 0;
		let compareSessionCount = 0;
		let retentionCount = 0;
		let compareRetentionCount = 0;
		let retentionDay1Count = 0;
		let compareRetentionDay1Count = 0;

		const totals = finalTableData.reduce(
			(acc, row) => {
				const ecpm = parseFloat(row.ecpm);
				if (!isNaN(ecpm) && ecpm > 0) {
					ecpmCount++;
					acc.ecpm += ecpm;
				}

				const arpu = +parseFloat((+row.arpu).toFixed(2));

				if (!isNaN(arpu) && arpu > 0) {
					arpuCount++;
					acc.arpu += arpu;
				}

				const dau = parseFloat(row.dau);
				if (!isNaN(dau) && dau > 0) {
					dauCount++;
					acc.dau += dau;
				}

				const sessions = parseFloat(row.sessions);
				if (!isNaN(sessions) && sessions > 0) {
					sessionCount++;
					acc.sessions += sessions;
				}

				const retention = parseFloat(row.retention_rate);
				if (!isNaN(retention) && retention > 0) {
					retentionCount++;
					acc.retention_rate += retention;
				}

				const retentionDay1 = parseFloat(row.retention_rate_day1);
				if (!isNaN(retentionDay1) && retentionDay1 > 0) {
					retentionDay1Count++;
					acc.retention_rate_day1 += retentionDay1;
				}

				return {
					total_cost: acc.total_cost + (parseFloat(row.total_cost) || 0),
					dau: acc.dau,
					new_users: acc.new_users + (parseFloat(row.new_users) || 0),
					total_revenue: acc.total_revenue + (parseFloat(row.total_revenue) || 0),
					profit: acc.profit + (parseFloat(row.profit) || 0),
					retention_rate: acc.retention_rate,
					retention_rate_day1: acc.retention_rate_day1,
					arpu: acc.arpu,
					ecpm: acc.ecpm,
					sessions: acc.sessions,
				};
			},
			{
				total_cost: 0,
				dau: 0,
				new_users: 0,
				total_revenue: 0,
				profit: 0,
				retention_rate: 0,
				retention_rate_day1: 0,
				arpu: 0,
				ecpm: 0,
				sessions: 0,
			}
		);

		const compareTotals = finalTableData.reduce(
			(acc, row) => {
				const compareEcpm = parseFloat(row.compare_ecpm);
				if (!isNaN(compareEcpm) && compareEcpm > 0) {
					compareEcpmCount++;
					acc.ecpm += compareEcpm;
				}

				const compareArpu = parseFloat(row.compare_arpu);
				if (!isNaN(compareArpu) && compareArpu > 0) {
					compareArpuCount++;
					acc.arpu += compareArpu;
				}

				const compareDau = parseFloat(row.compare_dau);
				if (!isNaN(compareDau) && compareDau > 0) {
					compareDauCount++;
					acc.dau += compareDau;
				}

				const compareSessions = parseFloat(row.compare_sessions);
				if (!isNaN(compareSessions) && compareSessions > 0) {
					compareSessionCount++;
					acc.sessions += compareSessions;
				}

				const compareRetention = parseFloat(row.compare_retention_rate);
				if (!isNaN(compareRetention) && compareRetention > 0) {
					compareRetentionCount++;
					acc.retention_rate += compareRetention;
				}

				const compareRetentionDay1 = parseFloat(row.compare_retention_rate_day1);
				if (!isNaN(compareRetentionDay1) && compareRetentionDay1 > 0) {
					compareRetentionDay1Count++;
					acc.retention_rate_day1 += compareRetentionDay1;
				}

				return {
					total_cost: acc.total_cost + (parseFloat(row.compare_total_cost) || 0),
					dau: acc.dau,
					new_users: acc.new_users + (parseFloat(row.compare_new_users) || 0),
					total_revenue: acc.total_revenue + (parseFloat(row.compare_total_revenue) || 0),
					profit: acc.profit + (parseFloat(row.compare_profit) || 0),
					retention_rate: acc.retention_rate,
					retention_rate_day1: acc.retention_rate_day1,
					arpu: acc.arpu,
					ecpm: acc.ecpm,
					sessions: acc.sessions,
				};
			},
			{
				total_cost: 0,
				dau: 0,
				new_users: 0,
				total_revenue: 0,
				profit: 0,
				retention_rate: 0,
				retention_rate_day1: 0,
				arpu: 0,
				ecpm: 0,
				sessions: 0,
			}
		);

		const formatCurrency = (value) => {
			const num = displayNumber(value);
			const absFormatted = indianNumberFormat(Math.abs(num));
			return num < 0 ? `-$${absFormatted}` : `$${absFormatted}`;
		};

		const formattedTotals = {
			total_cost: formatCurrency(totals.total_cost),
			dau: indianNumberFormat(displayNumber(dauCount > 0 ? totals.dau : 0)),
			new_users: indianNumberFormat(displayNumber(totals.new_users)),
			total_revenue: formatCurrency(totals.total_revenue),
			profit: formatCurrency(totals.profit),
			retention_rate: `${displayNumber(
				retentionCount > 0 ? totals.retention_rate / retentionCount : 0
			)}%`,
			retention_rate_day1: `${displayNumber(
				retentionDay1Count > 0 ? totals.retention_rate_day1 / retentionDay1Count : 0
			)}%`,
			arpu: arpuCount > 0 ? totals.arpu / arpuCount : 0,
			ecpm: formatCurrency(ecpmCount > 0 ? totals.ecpm / ecpmCount : 0),
			sessions: displayNumber(sessionCount > 0 ? totals.sessions / sessionCount : 0),
		};

		const formattedCompareTotals = {
			total_cost: formatCurrency(compareTotals.total_cost),
			dau: indianNumberFormat(displayNumber(compareDauCount > 0 ? compareTotals.dau : 0)),
			new_users: indianNumberFormat(displayNumber(compareTotals.new_users)),
			total_revenue: formatCurrency(compareTotals.total_revenue),
			profit: formatCurrency(compareTotals.profit),
			retention_rate: `${displayNumber(
				compareRetentionCount > 0 ? compareTotals.retention_rate / compareRetentionCount : 0
			)}%`,
			retention_rate_day1: `${displayNumber(
				compareRetentionDay1Count > 0
					? compareTotals.retention_rate_day1 / compareRetentionDay1Count
					: 0
			)}%`,
			arpu: compareArpuCount > 0 ? compareTotals.arpu / compareArpuCount : 0,
			ecpm: formatCurrency(compareEcpmCount > 0 ? compareTotals.ecpm / compareEcpmCount : 0),
			sessions: displayNumber(
				compareSessionCount > 0 ? compareTotals.sessions / compareSessionCount : 0
			),
		};

		setFooterTotals({
			current: formattedTotals,
			compare: formattedCompareTotals,
		});
	}, [finalTableData]);

	//tanstack columns
	const tanColumns = useMemo(() => {
		const col = (id, header, cell, opts = {}) => ({
			id,
			header,
			cell,
			...opts,
		});

		return [
			// --- ID (no sorting) ---
			col(
				'row_id',
				() => (
					<div className='report-title' data-sort-value='#'>
						<div className='report-header-dimension'>Id</div>
					</div>
				),
				(info) => {
					const row = info.row.original;
					const globalIndex = (currentPage - 1) * itemsPerPage + (row.__index ?? 0) + 1;
					return <div>{globalIndex}</div>;
				},
				{
					size: 60,
					enableSorting: false,
					meta: { alignMent: 'center' },
				}
			),

			// --- App (string sorting) ---
			col(
				'app_display_name',
				() => (
					<div className='report-title' data-sort-value='APP'>
						<div className='report-header-dimension'>Apps</div>
					</div>
				),
				(info) => {
					const row = info.row.original;
					return (
						<AppInsightsInfoBox
							uniqueIdentifier={'app_insights'}
							app_auto_id={row.app_auto_id}
							app_icon={row.app_icon}
							app_platform={row.app_platform}
							app_display_name={row.app_display_name}
							app_console_name={row.app_console_name}
							app_store_id={row.app_store_id}
							percentageInfo={percentageInfo}
							isLastRow={row.__index === mainData.length - 1}
						/>
					);
				},
				{
					accessorKey: 'app_display_name',
					enableSorting: true,
					sortingFn: 'alphanumeric',
					minSize: 130,
					meta: { headerClassName: '', isDynamic: true, alignMent: 'center' },
				}
			),

			// --- DAU ---
			col(
				'dau',
				() => (
					<div className='report-title' data-sort-value='dau'>
						<div className='report-header-dimension'>Total DAU</div>
						<div className='report-total-dimension'>
							{footerTotals?.current?.dau &&
								getHighlightedTotal(footerTotals.current.dau, footerTotals.compare.dau, false)}
						</div>
					</div>
				),
				(info) => {
					const row = info.row.original;
					return renderMetricCell(row.dau, row.compare_dau, false, row, 0);
				},
				{
					accessorFn: (row) => toNum(row.dau),
					enableSorting: true,
					sortingFn: 'basic',
					meta: { alignMent: 'right', isDynamic: true },
					minSize: 130,
				}
			),

			// --- New Users ---
			col(
				'new_users',
				() => (
					<div className='report-title' data-sort-value='new_users'>
						<div className='report-header-dimension'>New Users</div>
						<div className='report-total-dimension'>
							{footerTotals?.current?.new_users &&
								getHighlightedTotal(footerTotals.current.new_users, footerTotals.compare.new_users, false)}
						</div>
					</div>
				),
				(info) => {
					const row = info.row.original;
					return renderMetricCell(row.new_users, row.compare_new_users, false, row, 1);
				},
				{
					accessorFn: (row) => toNum(row.new_users),
					enableSorting: true,
					sortingFn: 'basic',
					meta: { alignMent: 'right', isDynamic: true },
					minSize: 130,
				}
			),

			// --- Revenue ($) ---
			col(
				'total_revenue',
				() => (
					<div className='report-title' data-sort-value='total_revenue'>
						<div className='report-header-dimension'>Revenue</div>
						<div className='report-total-dimension'>
							{footerTotals?.current?.total_revenue &&
								getHighlightedTotal(
									footerTotals.current.total_revenue,
									footerTotals.compare.total_revenue,
									true
								)}
						</div>
					</div>
				),
				(info) => {
					const row = info.row.original;
					return renderMetricCell(row.total_revenue, row.compare_total_revenue, true, row, 2);
				},
				{
					accessorFn: (row) => toNum(row.total_revenue),
					enableSorting: true,
					sortingFn: 'basic',
					meta: { alignMent: 'right', isDynamic: true },
					minSize: 130,
				}
			),

			// --- Cost ($) ---
			col(
				'total_cost',
				() => (
					<div className='report-title' data-sort-value='total_cost'>
						<div className='report-header-dimension'>Cost</div>
						<div className='report-total-dimension'>
							{footerTotals?.current?.total_cost &&
								getHighlightedTotal(footerTotals.current.total_cost, footerTotals.compare.total_cost, true)}
						</div>
					</div>
				),
				(info) => {
					const row = info.row.original;
					return renderMetricCell(row.total_cost, row.compare_total_cost, true, row, 999);
				},
				{
					accessorFn: (row) => toNum(row.total_cost),
					enableSorting: true,
					sortingFn: 'basic',
					meta: { alignMent: 'right', isDynamic: true },
					minSize: 130,
				}
			),

			// --- Profit ($) ---
			col(
				'profit',
				() => (
					<div className='report-title' data-sort-value='profit'>
						<div className='report-header-dimension'>Profit</div>
						<div className='report-total-dimension'>
							{footerTotals?.current?.profit &&
								getHighlightedTotal(footerTotals.current.profit, footerTotals.compare.profit, true)}
						</div>
					</div>
				),
				(info) => {
					const row = info.row.original;
					return renderMetricCell(row.profit, row.compare_profit, true, row, 3);
				},
				{
					accessorFn: (row) => toNum(row.profit),
					enableSorting: true,
					sortingFn: 'basic',
					meta: { alignMent: 'right', isDynamic: true },
					minSize: 130,
				}
			),

			// --- D1 Retention (%) ---
			col(
				'retention_rate_day1',
				() => (
					<div className='report-title' data-sort-value='retention_rate_day1'>
						<div className='report-header-dimension'>D1 Ret.</div>
						<div className='report-total-dimension'>
							{footerTotals?.current?.retention_rate_day1 &&
								getHighlightedTotal(
									footerTotals.current.retention_rate_day1,
									footerTotals.compare.retention_rate_day1,
									true
								)}
						</div>
					</div>
				),
				(info) => {
					const row = info.row.original;
					return renderMetricCell(
						row.retention_rate_day1,
						row.compare_retention_rate_day1,
						false,
						row,
						999,
						true
					);
				},
				{
					accessorFn: (row) => toNum(row.retention_rate_day1),
					enableSorting: true,
					sortingFn: 'basic',
					meta: { alignMent: 'right', isDynamic: true },
					minSize: 120,
				}
			),

			// --- D7 Retention (%) ---
			col(
				'retention_rate',
				() => (
					<div className='report-title' data-sort-value='retention_rate'>
						<div className='report-header-dimension'>D7 Ret.</div>
						<div className='report-total-dimension'>
							{footerTotals?.current?.retention_rate &&
								getHighlightedTotal(
									footerTotals.current.retention_rate,
									footerTotals.compare.retention_rate,
									true
								)}
						</div>
					</div>
				),
				(info) => {
					const row = info.row.original;
					return renderMetricCell(row.retention_rate, row.compare_retention_rate, false, row, 4, true);
				},
				{
					accessorFn: (row) => toNum(row.retention_rate),
					enableSorting: true,
					sortingFn: 'basic',
					meta: { alignMent: 'right', isDynamic: true },
					minSize: 120,
				}
			),

			// --- ARPU (number) ---
			col(
				'arpu',
				() => (
					<div className='report-title' data-sort-value='arpu'>
						<div className='report-header-dimension'>ARPU</div>
						<div className='report-total-dimension'>
							{footerTotals?.current?.arpu &&
								getHighlightedTotal(footerTotals.current.arpu, footerTotals.compare.arpu, false, true)}
						</div>
					</div>
				),
				(info) => {
					const row = info.row.original;
					return renderMetricCell(row.arpu, row.compare_arpu, false, row, 5);
				},
				{
					accessorFn: (row) => toNum(row.arpu),
					enableSorting: true,
					sortingFn: 'basic',
					meta: { alignMent: 'right', isDynamic: true },
					minSize: 120,
				}
			),

			// --- eCPM ($) ---
			col(
				'ecpm',
				() => (
					<div className='report-title' data-sort-value='ecpm'>
						<div className='report-header-dimension'>eCPM</div>
						<div className='report-total-dimension'>
							{footerTotals?.current?.ecpm &&
								getHighlightedTotal(footerTotals.current.ecpm, footerTotals.compare.ecpm, true)}
						</div>
					</div>
				),
				(info) => {
					const row = info.row.original;
					return renderMetricCell(row.ecpm, row.compare_ecpm, true, row, 6);
				},
				{
					accessorFn: (row) => toNum(row.ecpm),
					enableSorting: true,
					sortingFn: 'basic',
					meta: { alignMent: 'right', isDynamic: true },
					minSize: 120,
				}
			),

			// --- Sessions / DAU ---
			col(
				'sessions',
				() => (
					<div className='report-title' data-sort-value='sessions'>
						<div className='report-header-dimension'>Session DAU</div>
						<div className='report-total-dimension'>
							{footerTotals?.current?.sessions &&
								getHighlightedTotal(footerTotals.current.sessions, footerTotals.compare.sessions, false)}
						</div>
					</div>
				),
				(info) => {
					const row = info.row.original;
					return renderMetricCell(row.sessions, row.compare_sessions, false, row, 7);
				},
				{
					accessorFn: (row) => toNum(row.sessions),
					enableSorting: true,
					sortingFn: 'basic',
					meta: { alignMent: 'right', isDynamic: true },
					minSize: 120,
				}
			),
		];
	}, [
		percentageInfo,
		footerTotals,
		currentPage,
		itemsPerPage,
		mainData,
		isDarkMode,
		selectedStartDate,
		selectedEndDate,
		previousDateRange,
	]);

	const pagedTableData = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return finalTableData.slice(start, end);
	}, [finalTableData, currentPage, itemsPerPage]);

	const rowHeight = percentageInfo ? 45 : 35;

	return (
		<div className={`right-box-wrap app-insights-overview`}>
			<div className='table-box-wrap  pdglr24 retention_table_wrap'>
				<div className='userBoxWrap user-section-wrapper '>
					<div
						className={`popup-full-wrapper reports-popup-box active analytics-page-topbar app-insights-topbar ${
							isLoaderVisible ? 'app-insights-omit' : ''
						}`}
					>
						<div className='action-bar-container'>
							<div className='middle-section'>
								<div className='filter-bar-wrap'>
									<div className={`filter-box analytics-filter-box`}>
										<GeneralDateRange
											uniqueIdentifier={'app_insights'}
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
											uniqueIdentifier={'app-insights'}
											filterAppList={appsList}
											selectedApp={appInsightsCheckedApp}
											setSelectedApp={setAppInsightsCheckedApp}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
											setIsTableLoaderVisible={setIsLoaderVisible}
										/>
										<GeneralPlatform
											uniqueIdentifier={'app-insights'}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
											setIsLoaderVisible={setIsLoaderVisible}
											setPageNumber={setCurrentPage}
											finalItem={platformItem}
											setFinalItem={setPlatformItem}
										/>
									</div>
								</div>
								<div
									className='more-button three-icon-button'
									style={{ gap: 5, marginLeft: 'unset !important' }}
								>
									<>
										<MdMoreVert className='material-icons' />
										<div className='more-box'>
											<div className='border-box'>
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
															}}
														>
															<AiOutlinePercentage />
														</span>

														<div className='show-button percentage-btn'>Percentage</div>
														<label className='switch toggle-icon' style={{ position: 'relative' }}>
															<input
																type='checkbox'
																id='checkbox'
																value={percentageInfo}
																onChange={handlePercentageCheck}
																checked={percentageInfo}
															/>
															<div className='slider round'></div>
														</label>
													</div>
												)}
											</div>
										</div>
									</>
								</div>
							</div>
						</div>
					</div>

					{isLoading && !apiResponse ? (
						<div className='shimmer-spinner'>
							<Spinner animation='border' variant='secondary' />
						</div>
					) : (
						<div className='popup-full-box form-box-wrap form-wizard app-insights-box'>
							{isFetching && (
								<div className='shimmer-spinner overlay-spinner'>
									<Spinner animation='border' variant='secondary' />
								</div>
							)}
							<div className='popup-box-wrapper analytics-container '>
								<div className='box-wrapper table-container analytics-table '>
									<GeneralTanStackTable
										data={pagedTableData}
										columns={tanColumns}
										className='app_insights_table'
										height={rowHeight * 10}
										rowHeight={rowHeight}
										stickyColumns={2}
										enableSorting={true}
										sorting={{
											type: 'client',
											state: sorting,
											onChange: setSorting,
										}}
										defaultSortColumn='dau'
										defaultSortDirection='desc'
										enableResize={true}
										enableVirtualization={false}
										expandedRowId={expandedRowAppId}
										isRowExpanded={(row) => String(row.app_auto_id) === String(expandedRowAppId)}
										renderExpandedRow={({ row }) => <ExpandableChartRow data={row.original} />}
									/>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AppDashboard;
