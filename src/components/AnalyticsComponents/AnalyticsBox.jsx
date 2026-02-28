/** @format */

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Footer from '../Footer';
import DateRangeAnalyticsPopup from './Popups/DateRangeAnalyticsPopup';
import { DataContext } from '../../context/DataContext';
import { ReportContext } from '../../context/ReportContext';
import AnalyticsErrorModal from './Popups/AnalyticsErrorModal';
import { Spinner } from 'react-bootstrap';
import { arraysEqual, displayNumber, formatValue, indianNumberFormat } from '../../utils/helper';
import AppFilter from './Popups/AppFilter';
import CampaignFilter from './Popups/CampaignFilter';
import { MdMoreVert } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import filterPopupData from '../../utils/report_filter.json';
import moment from 'moment/moment';
import Swal from 'sweetalert2';
import DimensionFilter from './Popups/DimensionFilter';
import MatrixFilter from './Popups/MartixFilter';
import GeneralCountry from '../GeneralFilters/GeneralCountry';
import { CSVLink } from 'react-csv';
import { FiDownload } from 'react-icons/fi';
import GeneralDayColumnFilter from '../GeneralFilters/GeneralDayColumnFilter';
import GeneralDataFilter from '../GeneralFilters/GeneralDataFilter';
import useStickyOnScroll from '../../hooks/useStickyOnScroll';
import { useTableHover } from '../../hooks/useTableHover';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import useAnalyticsColumns from './useAnalyticsBox';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useAppList } from '../../context/AppListContext';
import { useGroupSettings } from '../../context/GroupSettingsContext';

const AnalyticsBox = () => {
	const { selectedGroup } = useGroupSettings();

	const { dateRangeforAnalytics, sharedAnalyticsMatrixData, sharedNewDimensionData } =
		useContext(DataContext);

	const {
		analyticsApp,
		campaignId,
		allAnalyticsMatrixData,
		setPopupFlags,
		popupFlags,
		setToggleResizeAnalytics,
		analyticsGroupBy,
		filteredDimension,
		dimensionList,
		filteredMatrix,
	} = useContext(ReportContext);

	const [analyticsData, setAnalyticsData] = useState([]);
	const [fetchDataAnalytics, setFetchdata] = useState([]);
	const [isAnalyticsLoaderVisible, setIsAnalyticsLoaderVisible] = useState(true);
	const [initialAPIData, setInitialAPIData] = useState([]);
	const [unitModal, setUnitModal] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');

	// const [filterData, setFilterData] = useState(localFilterData ? localFilterData : []);

	const [disable, setDisabled] = useState(false);
	const [total, setTotals] = useState({});
	const [countryFlag, setCountryExpandedFlag] = useState(false);
	const [currentUnitPage, setCurrentUnitPage] = useState(1);
	const [totalUnitpage, setTotalUnitPage] = useState('');
	const [itemsPerPage] = useState(400);

	const hasValidDateRange =
		Array.isArray(dateRangeforAnalytics) &&
		dateRangeforAnalytics[0]?.startDate &&
		dateRangeforAnalytics[0]?.endDate;

	const newStartDate = hasValidDateRange ? new Date(dateRangeforAnalytics[0].startDate) : null;

	const selectedStartDate = hasValidDateRange
		? new Date(dateRangeforAnalytics[0].startDate).toLocaleDateString('en-GB')
		: '';
	const selectedEndDate = hasValidDateRange
		? new Date(dateRangeforAnalytics[0].endDate).toLocaleDateString('en-GB')
		: '';

	const [addHidebutton, setAddHidebutton] = useState(true);
	const [groupFilterKey, setGroupFilterKey] = useState('');
	const [screenValue, setScreenValue] = useState([]);

	//new date filter
	const localDayChecked = JSON.parse(sessionStorage.getItem('analytics_day_column_filter_new'));
	const [dayCheckedColumn, setDayCheckedColumn] = useState(localDayChecked ? localDayChecked : []);

	const localCountry = JSON.parse(sessionStorage.getItem('analytics_country_filter'));
	const [countryValue, setCountryValue] = useState(localCountry ? localCountry : []);

	//activity
	const [selectedActivity, setSelectedActivity] = useState(() => {
		const stored = sessionStorage.getItem('analytics_activity_filter');
		return stored ? JSON.parse(stored) : [];
	});
	const [activityFilterList, setActivityFilterList] = useState([]);

	let location = useLocation();

	// clicked Dimension

	const newFinalDimension = useMemo(() => {
		return filteredDimension
			?.filter((item) => item.matrix_checked)
			?.filter((item) => item.value !== 'APP' || item.value !== 'MONTH')
			?.map((item) => item?.value);
	}, [filteredDimension]);

	const isCountrySelected = filteredDimension?.some((ele) => ele.name == 'Country');

	const isSingleAppSelected = useMemo(() => {
		return analyticsApp?.length == 1 ? true : false;
	}, [analyticsApp]);

	const localSortState = JSON.parse(sessionStorage.getItem('lastSortedColumn'));

	const [sortState, setSortState] = useState(
		localSortState
			? localSortState
			: {
					name: {
						sortValue: newFinalDimension?.includes('DATE') ? 'DATE' : 'advertiserAdCost',
					},
					key: 'desc',
			  }
	);

	useEffect(() => {
		const key = analyticsGroupBy?.map((item) => item?.value).join('');
		setGroupFilterKey(key);
	}, [analyticsGroupBy]);

	//country bool
	const indexOfLastItem = currentUnitPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentAnalyticsData = analyticsData?.slice(indexOfFirstItem, indexOfLastItem);

	const { campaignFilter: rawFilterData  } = useAppList();

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

	const finalCampaign = useMemo(
		() => campaignId?.map((item) => item.campaign_auto_id),
		[campaignId]
	);
	const finalActivity = useMemo(
		() => selectedActivity?.map((item) => item.activity_name),
		[selectedActivity]
	);

	const finalGroupValue = useMemo(
		() => analyticsGroupBy?.map((item) => item.value),
		[analyticsGroupBy]
	);

	const finalScreenValue = useMemo(
		() => screenValue?.map((item) => `${item.name}_${item.app_auto_id}`),
		[screenValue]
	);
	const finalApp = useMemo(() => {
		if (location?.state?.app_auto_id) {
			return [location.state.app_auto_id];
		}
		return analyticsApp?.map((item) => item.app_auto_id) ?? [];
	}, [location?.state?.app_auto_id, analyticsApp]);

	const formData = useMemo(() => {
		const fd = new FormData();

		fd.append('user_id', localStorage.getItem('id'));
		fd.append('user_token', localStorage.getItem('token'));
		if (selectedGroup?.length > 0) {
			fd.append('gg_id', selectedGroup);
		}

		if (dateRangeforAnalytics?.length > 0) {
			if (hasValidDateRange) {
				fd.append('analytics_date_range', `${selectedStartDate}-${selectedEndDate}`);
			}
		}

		if (location?.state) {
			fd.append('app_auto_id', location.state.app_auto_id);
		} else if (finalApp?.length > 0) {
			fd.append('app_auto_id', finalApp.join(','));
		}

		if (finalCampaign?.length > 0) {
			fd.append('campaign_auto_ids', finalCampaign.join(','));
		}

		if (countryValue?.length > 0) {
			const alpha2Codes = new Set(countryValue.map((c) => c.alpha2_code));
			const appAutoIds = new Set(analyticsApp.map((a) => a.app_auto_id));

			const matchedCampaignIds = filterData.list_campaign
				?.filter(
					(campaign) =>
						alpha2Codes.has(campaign.campaign_country) && appAutoIds.has(campaign.ap_app_auto_id)
				)
				.map((c) => c.campaign_auto_id);

			if (matchedCampaignIds?.length > 0) {
				fd.append('campaign_auto_ids', matchedCampaignIds.join(','));
			}
		}
		if (finalGroupValue?.length > 0) {
			fd.append('groupBy', finalGroupValue.join(','));
		}
		if (finalScreenValue?.length > 0) {
			fd.append('screenBy', finalScreenValue.join(','));
		}
		if (finalActivity?.length > 0) {
			fd.append('analytics_activity', finalActivity.join(','));
		}
		if (newFinalDimension?.length > 0) {
			fd.append('analytics_dimensions', 'APP,' + newFinalDimension.join(','));
		}

		return fd;
	}, [
		dateRangeforAnalytics,
		selectedStartDate,
		selectedEndDate,
		location?.state,
		countryValue,
		newFinalDimension,
		finalApp,
		finalCampaign,
		filterData,
		finalActivity,
		finalGroupValue,
		finalScreenValue,
		selectedGroup,
	]);

	const handleAlert = () => {
		Swal.fire({
			title: 'Exhausted property tokens, please try after some time.',
			width: 450,
			icon: 'warning',
			focusConfirm: false,
			showCancelButton: false,
			confirmButtonColor: '#1967d2',
			cancelButtonColor: '#5f6368',
			confirmButtonText: 'Okay',
		}).then((result) => {
			if (result.isConfirmed) {
			}
		});
	};

	const findCountryName = (countryCode) => {
		const country = filterPopupData?.all_countries?.find((c) => c.alpha2_code == countryCode);
		return country?.name || null;
	};

	// Use useQueryFetch to get analytics data
	const activityFilter = selectedActivity?.length > 0;
	const endpoint =
		newFinalDimension?.includes('CAMPAIGN_NAME') || activityFilter
			? 'campaign-summary-live'
			: 'campaign-summary-by-date';

	const isQueryEnabled = !!filterData && !!hasValidDateRange && !!newFinalDimension;

	const {
		data: apiResponse,
		isSuccess: apiSuccess,
		isPending,
		isPlaceholderData,
		isFetching,
	} = useQueryFetch(
		[
			'analytics-table',
			selectedStartDate,
			selectedEndDate,
			newFinalDimension,
			activityFilter,
			countryValue,
			finalApp,
			filterData,
			selectedGroup,
			finalCampaign,
			finalGroupValue,
			finalScreenValue,
			finalActivity,
		],
		endpoint,
		formData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: isQueryEnabled,
			placeholderData: (prev) => prev,
		}
	);

	useEffect(() => {
		if (!apiResponse || !apiSuccess) return;

		const response = apiResponse;
		setInitialAPIData(response);
		setToggleResizeAnalytics(true);

		if (response?.status_code == 0) {
			try {
				const errorMessage = JSON.parse(response.msg);
				if (errorMessage?.status == 'RESOURCE_EXHAUSTED') {
					setAnalyticsData([]);
					setIsAnalyticsLoaderVisible(false);
					setDisabled(false);
					setFetchdata({ status_code: 0 });
					handleAlert();
				}
			} catch (e) {}
			setInitialAPIData({ status_code: 1 });
			return;
		}

		if (response?.status_code === 1) {
			const localStoreID = JSON.parse(sessionStorage.getItem('new_dimension_list'));
			const combinedStoredIds =
				localStoreID == null
					? ['APP']
					: ['APP', ...localStoreID?.filter((item) => item?.matrix_checked)?.map((item) => item?.value)];
			const campaignFilter = combinedStoredIds?.some((id) => id === 'CAMPAIGN_NAME');
			const dateFilter = combinedStoredIds?.some((id) => id === 'DATE');
			const monthFilter = combinedStoredIds?.some((id) => id === 'MONTH');

			setDisabled(false);
			let raw_data = response?.data;
			let raw_extra_data = response?.extra_data;

			// if endpoint is live summary, apply same date filtering as before
			if (endpoint === 'campaign-summary-live' && Array.isArray(raw_data)) {
				raw_data = raw_data.filter((record) => {
					const recordDate = moment(record.d, 'YYYYMMDD');
					const fsdDate = moment(record.fsd, 'YYYYMMDD');
					const todayDate = moment();
					return (
						recordDate.isSameOrAfter(newStartDate) &&
						recordDate.isSameOrAfter(fsdDate) &&
						recordDate.isSameOrBefore(todayDate)
					);
				});
			}

			// day-wise-total and cost/revenue aggregation
			const combinedMap = new Map();
			const analyticsMap = new Map();
			raw_data.forEach((entry) => {
				const { pr_app_auto_id = undefined, ci = undefined, d, fsd, tar } = entry;
				const diff = moment(d).diff(moment(fsd), 'days');
				let groupKey, appId;

				const thirdKey = monthFilter ? fsd.substring(0, 6) : dateFilter ? fsd : undefined;

				if (campaignFilter || activityFilter) {
					const matchingCampaign = filterData.list_campaign.find(
						(campaign) => campaign.campaign_id == ci
					);
					appId = matchingCampaign?.ap_app_auto_id || undefined;

					const secondKey = isCountrySelected
						? matchingCampaign?.campaign_country || matchingCampaign?.campaign_id
						: !campaignFilter && activityFilter
						? undefined
						: ci;

					groupKey = `${appId}|${secondKey}|${thirdKey}`;
				} else {
					appId = pr_app_auto_id;
					groupKey = `${pr_app_auto_id}|${undefined}|${thirdKey}`;
				}

				if (!analyticsMap.has(groupKey)) {
					analyticsMap.set(groupKey, {});
				}
				const analyticsMapData = analyticsMap.get(groupKey);
				if (!analyticsMapData[diff]) {
					analyticsMapData[diff] = 0;
				}
				analyticsMapData[diff] += Number(tar || 0);
			});

			const costMap = new Map();
			const dateRevenueMap = new Map();
			raw_extra_data.forEach((costEntry) => {
				const { ci, d, aac, pc_fsd_revenue = undefined, app_auto_id = undefined } = costEntry;

				const matchingCampaign = filterData.list_campaign.find(
					(campaign) => campaign.campaign_id == ci
				);
				const appId = app_auto_id ? app_auto_id : matchingCampaign?.ap_app_auto_id;

				const secondKey = isCountrySelected
					? matchingCampaign?.campaign_country || matchingCampaign?.campaign_id
					: !campaignFilter && activityFilter
					? undefined
					: ci;

				const thirdKey = monthFilter ? d.substring(0, 6) : dateFilter ? d : undefined;

				let extraKey = `${appId}|${secondKey}|${thirdKey}`;

				costMap.set(extraKey, (costMap.get(extraKey) || 0) + Number(aac));

				if (!campaignFilter) {
					const dateKey = `${appId}|${undefined}|${thirdKey}`;
					dateRevenueMap.set(dateKey, (dateRevenueMap.get(dateKey) || 0) + Number(pc_fsd_revenue || 0));
				}
			});

			analyticsMap.forEach((days, key) => {
				const cost = costMap.get(key) || 0;
				let revenue = 0;
				if (campaignFilter || activityFilter) {
					revenue = Object.values(days).reduce((sum, count) => sum + count, 0);
				} else {
					revenue = dateRevenueMap.get(key) || 0;
				}
				combinedMap.set(key, { days, cost, revenue });
			});

			costMap.forEach((cost, key) => {
				if (!combinedMap.has(key)) {
					let revenue = 0;
					if (!campaignFilter) {
						revenue = dateRevenueMap.get(key) || 0;
					}
					combinedMap.set(key, { days: {}, cost, revenue });
				}
			});

			const result = Array.from(combinedMap.entries())
				.filter(([key]) => {
					const [appId] = key.split('|');
					return appId !== 'undefined' && appId !== null;
				})
				.map(([key, { days, cost, revenue }]) => {
					const [appId, campaignId, firstSessionDate] = key
						.split('|')
						.map((val) => (val === 'undefined' ? null : val));

					const matchingCampaign =
						campaignId && filterData.list_campaign.find((campaign) => campaign.campaign_id == campaignId);

					const dayWiseTotal = Object.entries(days).map(([day, count]) => {
						const previousCounts = Object.values(days)
							.slice(0, +day)
							.reduce((sum, val) => sum + val, 0);
						count = +count.toFixed(2);
						return {
							day: `${+day}`,
							value: count,
							roas: cost ? +(count / cost).toFixed(2) : 0,
							cumulative_roas: cost ? +((count + previousCounts) / cost).toFixed(2) : 0,
						};
					});

					const countryName = findCountryName(campaignId);
					const { app_campaigns, id, item_checked, ...appDetails } =
						filterData.list_apps?.find((app) => app.app_auto_id === appId) || {};
					return {
						date: firstSessionDate || '',
						firstUserCampaignId: campaignId || '',
						country: countryName || '',
						firstUserCampaignName: matchingCampaign?.campaign_name || '',
						day_wise_total: dayWiseTotal,
						totalAdRevenue: revenue,
						advertiserAdCost: cost,
						returnOnAdSpend: cost ? +(+revenue.toFixed(2) / +cost.toFixed(2)).toFixed(2) : 0,
						...appDetails,
					};
				});

			const totals = result.reduce(
				(acc, item) => {
					acc.totalAdRevenue += Number(item.totalAdRevenue) || 0;
					acc.advertiserAdCost += Number(item.advertiserAdCost) || 0;
					return acc;
				},
				{ totalAdRevenue: 0, advertiserAdCost: 0 }
			);

			totals.returnOnAdSpend =
				totals.advertiserAdCost != 0 ? totals.totalAdRevenue / totals.advertiserAdCost : 0.0;

			const totalUnitPage = Math.ceil(result?.length / itemsPerPage);
			setTotalUnitPage(totalUnitPage);
			setAnalyticsData(result);
			// customSort(sortState.name, sortState.key, result);
			setTotals(totals);
			setFetchdata(response);
			setIsAnalyticsLoaderVisible(false);
		} else {
			setAnalyticsData([]);
			setFetchdata({ status_code: 0 });
			setIsAnalyticsLoaderVisible(false);
		}
		setToggleResizeAnalytics(false);
	}, [apiResponse, apiSuccess, dayCheckedColumn, popupFlags, campaignId]);

	function calculateAverageCumulativeRoas(data, diffDays) {
		const averageCumulativeRoas = [];
		let cumulativeAvgRoas = 0;
		for (let i = 0; i < diffDays; i++) {
			let totalRevenue = 0;
			let totalCost = 0;
			let count = 0;

			data?.forEach((obj) => {
				totalCost += obj?.advertiserAdCost;
				if (obj?.day_wise_total?.[i]) {
					totalRevenue += obj?.day_wise_total[i]?.value;
					count++;
				}
			});

			const avgRoas = count > 0 ? totalRevenue / totalCost : 0;
			cumulativeAvgRoas += avgRoas;

			averageCumulativeRoas.push({
				day: i,
				average: cumulativeAvgRoas,
				revenue: totalRevenue,
				cost: totalCost,
			});
		}
		return averageCumulativeRoas;
	}

	const prevAnalyticsAppRef = useRef();
	const shouldCall =
		analyticsApp &&
		analyticsApp?.length == 1 &&
		!arraysEqual(prevAnalyticsAppRef.current, analyticsApp);

	//fetch activity
	const activityFormData = new FormData();
	activityFormData.append('user_id', localStorage.getItem('id'));
	activityFormData.append('user_token', localStorage.getItem('token'));
	if (location?.state) {
		activityFormData.append('app_auto_id', location?.state?.app_auto_id);
	} else if (finalApp?.length > 0) {
		activityFormData.append('app_auto_id', finalApp.join(','));
	}

	const { data: activityResponse, isSuccess: isActivitySuccess } = useQueryFetch(
		['analytics-activity-list', selectedGroup, finalApp],
		'get-activity-by-app',
		activityFormData,
		{
			staleTime: 5 * 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: shouldCall,
		}
	);

	useEffect(() => {
		if (!activityResponse && !isActivitySuccess) return;
		if (activityResponse?.status_code == 1) {
			setActivityFilterList(() => {
				return activityResponse?.info?.map((item, index) => {
					return {
						item_id: index + 1,
						item_name: item.activity_alias,
						activity_name: item.activity_name,
					};
				});
			});
			prevAnalyticsAppRef.current = [...analyticsApp];
		}
	}, [activityResponse, isActivitySuccess]);

	const todayDate = moment();
	const oneDay = 24 * 60 * 60 * 1000;
	const diffDays = Math.round(Math.abs((newStartDate - todayDate) / oneDay)) + 1; //+1

	const totalRoas = calculateAverageCumulativeRoas(analyticsData, diffDays);

	// Filter order
	const [selectedFilterOrder, setSelectedFilterOrder] = useState([]);
	const allFilterNames = [
		'DayColumnFilter',
		'DimensionFilter',
		'MatrixFilter',
		'CampaignPopup',
		'GeneralCountry',
		'GeneralActivity',
	];
	const filterStates = {
		DayColumnFilter: !!dayCheckedColumn?.length,
		DimensionFilter: !!filteredDimension?.length,
		MatrixFilter: !!filteredMatrix?.length,
		CampaignPopup: !!campaignId?.length,
		GeneralCountry: !!countryValue?.length,
		GeneralActivity: !!selectedActivity?.length,
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
			case 'CampaignPopup':
				return newFinalDimension.includes('CAMPAIGN_NAME') && !isCountrySelected ? (
					<CampaignFilter
						key={'CampaignPopup'}
						filterPopupData={filterData?.list_campaign}
						initialApp={filterData?.list_apps}
						setIsReportLoaderVisible={setIsAnalyticsLoaderVisible}
						analyticsData={analyticsData}
						countryValue={countryValue}
					/>
				) : null;
			case 'GeneralCountry':
				return newFinalDimension.includes('CAMPAIGN_NAME') && isCountrySelected ? (
					<GeneralCountry
						uniqueIdentifier={'analytics'}
						countryValue={countryValue}
						setCountryValue={setCountryValue}
						fetchFlag={popupFlags}
						setFetchFlag={setPopupFlags}
						setMainLoader={setIsAnalyticsLoaderVisible}
						filterData={filterData}
						analyticsData={analyticsData}
						campaignId={campaignId}
					/>
				) : null;
			case 'GeneralActivity':
				return analyticsApp?.length == 1 ? (
					<GeneralDataFilter
						uniqueIdentifier={'analytics_activity'}
						filterName='Activity'
						filterPopupData={activityFilterList}
						finalSelectData={selectedActivity}
						setFinalSelectData={setSelectedActivity}
						fetchFlag={popupFlags}
						setFetchFlag={setPopupFlags}
						setIsLoaderVisible={setIsAnalyticsLoaderVisible}
					/>
				) : null;
			case 'DimensionFilter':
				return (
					<DimensionFilter
						key={'DimensionFilter'}
						setPageNumber={setCurrentUnitPage}
						setIsReportLoaderVisible={setIsAnalyticsLoaderVisible}
						setCountryValue={setCountryValue}
						isSingleAppSelected={isSingleAppSelected}
					/>
				);
			case 'MatrixFilter':
				return (
					<MatrixFilter
						key={'MatrixFilter'}
						setPageNumber={setCurrentUnitPage}
						setIsReportLoaderVisible={setIsAnalyticsLoaderVisible}
					/>
				);
			case 'DayColumnFilter':
				return (
					<GeneralDayColumnFilter
						key={'DayColumnFilter'}
						uniqueIdentifier='analytics'
						dayCheckedColumn={dayCheckedColumn}
						setDayCheckedColumn={setDayCheckedColumn}
						setPageNumber={setCurrentUnitPage}
						setIsReportLoaderVisible={setIsAnalyticsLoaderVisible}
						noneSelectedClass="analytics-none-selected"
					/>
				);
			default:
				return null;
		}
	};

	const renderedComponents = dynamicFilterOrder?.map((filterName, index) => (
		<React.Fragment key={filterName + index}>{renderComponent(filterName)}</React.Fragment>
	));

	//CSV download
	const allDimension = ['Date', 'Month', 'Campaign', 'Country'];
	const allMetrix = ['Total Cost', 'Total Revenue', 'ROAS'];
	const finalDimensionKey = filteredDimension?.map((item) => item.name);
	const finalmatrixKey = filteredMatrix?.map((item) => item.key);
	const remainingDimensions = allDimension.filter((item) => !finalDimensionKey.includes(item));
	const remainingMatrix = allMetrix.filter((item) => !finalmatrixKey.includes(item));

	const keyMapping = {
		app_display_name: 'Apps',
		app_console_name: 'Console Name',
		app_store_id: 'Package Name',
		firstUserCampaignName: 'Campaign',
		country: 'Country',
		date: finalDimensionKey.includes('Month') ? 'Month' : 'Date',
		advertiserAdCost: 'Total Cost',
		totalAdRevenue: 'Total Revenue',
		returnOnAdSpend: 'ROAS',
	};
	Object.keys(keyMapping).forEach((key) => {
		if (filteredMatrix?.length > 0 && remainingMatrix.includes(keyMapping[key])) {
			delete keyMapping[key];
		}
		if (remainingDimensions.includes(keyMapping[key])) {
			delete keyMapping[key];
		}
	});

	const modifiedData = currentAnalyticsData?.map((item) => {
		const newItem = {};
		for (const key in item) {
			if (key === 'date') {
				const date = moment(item[key]);
				newItem[key] = finalDimensionKey.includes('Month')
					? date.format('MMM-YY')
					: date.format('DD-MM-YYYY');
			} else if (key === 'day_wise_total') {
				item[key].forEach((dayData) => {
					newItem[`D${Number(dayData?.day) + 1}`] = dayData.roas;
				});
			} else if (key === 'advertiserAdCost' || key === 'totalAdRevenue') {
				newItem[key] = indianNumberFormat(Number(item[key]).toFixed(2));
			} else if (key === 'country' && (item['country'] === undefined || item['country'].length == 0)) {
				newItem[key] = item['firstUserCampaignName'];
			} else {
				newItem[key] = item[key];
			}
		}
		return newItem;
	});

	let sum = 0;
	for (let i = 0; i < modifiedData?.length; i++) {
		for (let j = 1; j <= 180; j++) {
			if (modifiedData[i][`D${j}`] !== undefined) {
				sum += modifiedData[i][`D${j}`];
				modifiedData[i][`D${j}`] = sum?.toFixed(2);
			}
		}
		sum = 0;
	}
	const filteredData = modifiedData.map((item) => {
		const newItem = {};
		for (const key in item) {
			if (key.startsWith('D') && dayCheckedColumn.map((day) => day.name).includes(key)) {
				newItem[key] = item[key];
			} else if (!key.startsWith('D')) {
				newItem[key] = item[key];
			}
		}
		return newItem;
	});
	function formatTotalNumber(value) {
		return Number(value).toLocaleString('en-IN', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	}

	const totalRow = {
		Apps: 'Total',
		'Total Cost': formatTotalNumber(total?.advertiserAdCost) || 0,
		'Total Revenue': formatTotalNumber(total.totalAdRevenue) || 0,
		ROAS: formatTotalNumber(total.returnOnAdSpend) || 0,
	};
	totalRoas.forEach((dayData) => {
		const dayIndex = dayData.day + 1;
		if (dayCheckedColumn.some((day) => day.value == dayIndex)) {
			totalRow[`Day ${dayIndex}`] = +dayData?.average?.toFixed(2) || 0;
		}
	});

	const convertedData = filteredData?.map((item) => {
		const newItem = {};
		for (const key in keyMapping) {
			newItem[keyMapping[key]] = item[key];
		}
		for (const key in item) {
			if (key.startsWith('D')) {
				newItem[key.replace('D', 'Day ')] = item[key];
			}
		}
		return newItem;
	});
	convertedData.push(totalRow);

	//sticky filter
	const { addClass } = useStickyOnScroll({ topSpace: 15 });

	useTableHover(isAnalyticsLoaderVisible, '.table-scroll-analytics');

	const { columns } = useAnalyticsColumns({
		analyticsData,
		total,
		isCountrySelected,
		filteredDimension,
		dimensionList,
		allAnalyticsMatrixData,
		filteredMatrix,
		sharedAnalyticsMatrixData,
		sharedNewDimensionData,
		newFinalDimension,
		newStartDate,
		dayCheckedColumn,
		calculateAverageCumulativeRoas,
		indianNumberFormat,
		displayNumber,
		formatValue,
	});

	const showMainLoader = isPending && !isPlaceholderData;
	const showOverlayLoader = isFetching && isPlaceholderData;

	return (
		<div className={`right-box-wrap`}>
			<div className='table-box-wrap main-box-wrapper pdglr24 '>
				<div className='userBoxWrap user-section-wrapper '>
					<div className='popup-full-wrapper reports-popup-box active analytics-page-topbar'>
						<div className={`action-bar-container ${addClass ? 'sticky_filter' : ''}`}>
							<div className='middle-section'>
								<div className='filter-bar-wrap'>
									<div className={`filter-box analytics-filter-box ${disable ? 'disabled-div' : ''}`}>
										<DateRangeAnalyticsPopup
											selectedStartDate={selectedStartDate}
											selectedEndDate={selectedEndDate}
											setIsAnalyticsLoaderVisible={setIsAnalyticsLoaderVisible}
										/>
										<AppFilter
											key={'AppPopup'}
											filterPopupData={filterData?.list_apps}
											setIsReportLoaderVisible={setIsAnalyticsLoaderVisible}
											setSelectedActivity={setSelectedActivity}
											setSortState={setSortState}
										/>
										{renderedComponents}
									</div>
								</div>
							</div>
							<div className='more-button three-icon-button'>
								<MdMoreVert className='material-icons' />
								<div className='more-box w-250 analytics_csv'>
									<div className='border-box'>
										<CSVLink className='downloadbtn' filename='analytics.csv' data={convertedData}>
											<span className='material-icons'>
												<FiDownload style={{ marginTop: '6px' }} />
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
								<div
									className={`popup-full-box form-box-wrap form-wizard analytics-popup-box ${
										countryFlag ? '' : 'campaign-exp-box'
									} `}
								>
									{showOverlayLoader && (
										<div className='shimmer-spinner overlay-spinner'>
											<Spinner animation='border' variant='secondary' />
										</div>
									)}{' '}
									<div className={`popup-box-wrapper analytics-container analytics-popup-box`}>
										<div
											className={`box-wrapper table-container analytics-table analytics-campaign-table ${
												!addHidebutton ? 'extra-column-table' : 'new-column-table'
											} `}
										>
											<GeneralTanStackTable
												data={analyticsData}
												columns={columns}
												enableResize={true}
												stickyColumns={7}
												enableVirtualization
												height={50 * 17}
												rowHeight={50}
												defaultSortColumn={'advertiserAdCost'}
											/>
										</div>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
				<Footer />
			</div>
			<AnalyticsErrorModal show={unitModal} onHide={() => setUnitModal(false)} errormsg={errorMsg} />
		</div>
	);
};

export default AnalyticsBox;
