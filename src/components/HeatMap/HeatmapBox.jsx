/** @format */

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import CalendarHeatMap from './CalendarHeatMap';
import useAppsApi from '../../hooks/useAppsApi';
import moment from 'moment/moment';
import { Spinner } from 'react-bootstrap';
import GeneralSingleAppFilter from '../GeneralFilters/GeneralSingleAppFilter';
import CustomNoDataComponent from '../DataTableComponents/CustomNoDataComponent';
import Select from 'react-select';
import dayjs from 'dayjs';
import GeneralCampaign from '../GeneralFilters/GeneralCampaign';
import GeneralCountry from '../GeneralFilters/GeneralCountry';
import GeneralSingleDatePicker from '../GeneralFilters/GeneralSingleDatePicker';
import { useLocation } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';
import GeneralDataFilter from '../GeneralFilters/GeneralDataFilter';
import { arraysEqual, indianNumberFormat } from '../../utils/helper';
import useStickyOnScroll from '../../hooks/useStickyOnScroll';
import Tippy from '@tippyjs/react';
import { MdMoreVert } from 'react-icons/md';
import { BsQuestionCircle } from 'react-icons/bs';
import XIRRInfoModal from './XIRRInfoModal';
import { xirr } from '../../utils/lib';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useAppList } from '../../context/AppListContext';
import { useGroupSettings } from '../../context/GroupSettingsContext';

const HeatmapBox = ({ heatmapApp, setHeatmapApp }) => {
	const { pathname, state } = useLocation();
	const { selectedGroup } = useGroupSettings();

	//table
	const [heatmapData, setHeatmapData] = useState([]);
	const [mainLoader, setMainLoader] = useState(true);

	//filter
	const [fetchFlags, setFetchFlags] = useState(false);
	//app
	//campaign
	const [campaignId, setCampaignId] = useState(() => {
		const stored = sessionStorage.getItem('heatmap_selected_item');
		return stored ? JSON.parse(stored) : [];
	});
	//country
	const [countryValue, setCountryValue] = useState(() => {
		const stored = sessionStorage.getItem('heatmap_country_filter');
		return stored ? JSON.parse(stored) : [];
	});
	//modal
	const [infoModalShow, setInfoModalShow] = useState(false);
	//single date-picker
	const [singleSelectedDate, setSingleSelectedDate] = useState(null);

	const [isCountryChecked, setIsCountryChecked] = useState(false);
	const [isCampaignChecked, setIsCampaignChecked] = useState(false);
	const [count, setCount] = useState(1);

	//activity filter
	const [selectedActivity, setSelectedActivity] = useState(() => {
		const stored = sessionStorage.getItem('heatmap_activity_filter');
		return stored ? JSON.parse(stored) : [];
	});
	const [activityFilterList, setActivityFilterList] = useState([]);

	//month-year select
	const generateMonthYearRanges = () => {
		const options = [];
		let currentDate = dayjs();
		let startMonthYear = currentDate;
		while (true) {
			const endMonthYear = startMonthYear.subtract(23, 'month');
			if (endMonthYear.year() < 2013) break;
			options.push({
				value: `${startMonthYear.format('MMM YYYY')} - ${endMonthYear.format('MMM YYYY')}`,
				label: `${startMonthYear.format('MMM YYYY')} - ${endMonthYear.format('MMM YYYY')}`,
			});
			startMonthYear = startMonthYear.subtract(2, 'year');
		}
		return options;
	};

	const handleMonthRangeChange = (option) => {
		setMonthRange(option.value);
		sessionStorage.setItem('heatmap_month_range', JSON.stringify(option.value));
		setSingleSelectedDate(null);
	};
	const MonthRangeOptions = generateMonthYearRanges();
	const [monthRange, setMonthRange] = useState(MonthRangeOptions[0].value);

	//FetchAppData
	const user_id = localStorage.getItem('id');
	const user_token = localStorage.getItem('token');

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

	const filterAppList = useMemo(() => {
		return filterData?.list_apps || [];
	}, [filterData]);
	const campaignList = useMemo(() => {
		return filterData?.list_campaign || [];
	}, [filterData]);

	//main API

	const finalSelectedApp = useMemo(
		() => heatmapApp?.map((item) => item.app_auto_id).join(','),
		[heatmapApp]
	);
	const finalCampaign = useMemo(
		() => campaignId?.map((item) => item?.campaign_auto_id).join(','),
		[campaignId]
	);
	const finalCountry = useMemo(
		() => countryValue?.map((item) => item.alpha2_code).join(','),
		[countryValue]
	);
	const finalActivity = useMemo(
		() => selectedActivity?.map((item) => item?.activity_name).join(','),
		[selectedActivity]
	);

	//fetch activity
	const prevAnalyticsAppRef = useRef();

	// your existing condition
	const shouldCall =
		heatmapApp && heatmapApp.length === 1 && !arraysEqual(prevAnalyticsAppRef.current, heatmapApp);

	const activityFormData = new FormData();
	activityFormData.append('user_id', localStorage.getItem('id'));
	activityFormData.append('user_token', localStorage.getItem('token'));
	if (state) {
		activityFormData.append('app_auto_id', state?.app_auto_id);
	} else if (finalSelectedApp?.length > 0) {
		activityFormData.append('app_auto_id', finalSelectedApp);
	}
	const { data: activityResponse, isSuccess: isActivitySuccess } = useQueryFetch(
		['analytics-activity-list', selectedGroup, finalSelectedApp],
		'get-activity-by-app',
		activityFormData,
		{
			staleTime: 5 * 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: shouldCall,
		}
	);

	useEffect(() => {
		if (!activityResponse || !isActivitySuccess) return;
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
			prevAnalyticsAppRef.current = [...heatmapApp];
		}
	}, [activityResponse, isActivitySuccess]);

	const formData = useMemo(() => {
		const mainFormData = new FormData();
		mainFormData?.append('user_id', user_id);
		mainFormData?.append('user_token', user_token);
		if (selectedGroup?.length > 0) {
			mainFormData.append('gg_id', selectedGroup);
		}
		if (monthRange.length > 0) {
			mainFormData?.append('selected_date_range', monthRange);
		}
		if (finalSelectedApp.length > 0 && filterAppList.length > 0) {
			mainFormData.append(
				'app_auto_id',
				state?.app_auto_id != null && state?.app_auto_id !== ''
					? state.app_auto_id
					: finalSelectedApp || ''
			);
		}

		if (finalCampaign?.length > 0) {
			mainFormData.append('campaign_auto_ids', finalCampaign);
		}
		if (finalCountry?.length > 0) {
			mainFormData.append('campaign_country', finalCountry);
		}
		if (finalActivity?.length > 0) {
			mainFormData.append('analytics_activity', finalActivity);
		}
		if (singleSelectedDate != null) {
			const d = new Date(singleSelectedDate);
			const day = String(d.getDate()).padStart(2, '0');
			const month = String(d.getMonth() + 1).padStart(2, '0');
			const year = d.getFullYear();
			const finalDate = `${year}-${month}-${day}`;
			mainFormData.append('date', finalDate);
		}
		return mainFormData;
	}, [
		monthRange,
		selectedGroup,
		finalSelectedApp,
		finalCampaign,
		finalCountry,
		finalActivity,
		singleSelectedDate,
		filterAppList,
	]);

	const heatmapEndPoint =
		finalCampaign.length > 0 ||
		finalCountry.length > 0 ||
		selectedActivity.length > 0 ||
		singleSelectedDate != null
			? 'get-heatmap'
			: 'get-heatmap-offline';

	//enable query
	const hasGroupSelected = selectedGroup != null && selectedGroup !== '';
	const hasAppFilterWhenNoGroup = !hasGroupSelected ? finalSelectedApp?.length > 0 : true;
	const groupHasApps = hasGroupSelected && filterAppList?.length > 0;
	const appSelectionMatchesGroup =
		!groupHasApps ||
		(heatmapApp?.length > 0 &&
			filterAppList.some((a) => a.app_auto_id === heatmapApp[0]?.app_auto_id));

	const isQueryEnabled = hasAppFilterWhenNoGroup && appSelectionMatchesGroup;

	//group query
	const groupPartForKey = finalSelectedApp.length > 0 ? null : selectedGroup ?? null;

	const {
		data: apiResponse,
		isSuccess: apiSuccess,
		isLoading,
		isFetching,
	} = useQueryFetch(
		[
			'heatmap-view',
			finalSelectedApp,
			finalCampaign,
			finalCountry,
			finalActivity,
			singleSelectedDate,
			monthRange,
			groupPartForKey,
			finalSelectedApp,
		],
		heatmapEndPoint,
		formData,
		{
			staleTime: 60 * 1000,
			enabled: isQueryEnabled,
			refetchOnMount: 'ifStale',
		}
	);

	useEffect(() => {
		if (!apiSuccess || !apiResponse) return;
		if (apiResponse.status_code == 1) {
			const allData = [];
			apiResponse?.data?.forEach((app) => {
				const result = app?.data?.map((item) => {
					return {
						...item,
						date: moment(item.date, 'YYYYMMDD').format('YYYY-MM-DD'),
						roas:
							Number(item?.advertiserAdCost).toFixed(2) != '0.00'
								? (item?.totalAdRevenue / item?.advertiserAdCost).toFixed(2)
								: 0.0,
					};
				});
				allData.push(...result);
			});
			setHeatmapData(allData);
		}
	}, [apiResponse, apiSuccess, finalSelectedApp, finalCountry, singleSelectedDate]);

	//loader count
	useEffect(() => {
		if (!apiSuccess) {
			const countdownInterval = setInterval(() => {
				setCount((prevCount) => prevCount + 1);
			}, 1000);
			return () => clearInterval(countdownInterval);
		} else {
			setCount(1);
		}
	}, [apiSuccess]);

	useEffect(() => {
		if (heatmapApp?.length > 0 && pathname === '/heatmap') {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.src = heatmapApp[0].app_icon;

			img.onload = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');

				const originalSize = 32;
				const iconSize = 30;
				const padding = (originalSize - iconSize) / 2;

				canvas.width = originalSize;
				canvas.height = originalSize;
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(img, padding, padding, iconSize, iconSize);

				const resizedFavicon = canvas.toDataURL('image/png');

				const faviconLink =
					document.querySelector("link[rel='icon']") || document.createElement('link');
				faviconLink.rel = 'icon';
				faviconLink.href = resizedFavicon;
				document.head.appendChild(faviconLink);
			};
		}
	}, [heatmapApp, pathname]);

	// Filter order

	const [orderFilter, setPreviousOrder] = useState([]);
	const [selectedReportFilter, setReportSelectedFilter] = useState('');
	const renderComponent = (componentName) => {
		switch (componentName) {
			case 'GeneralSingleDatePicker':
				return (
					<GeneralSingleDatePicker
						key='GeneralSingleDatePicker'
						uniqueIdentifier={'heatmap'}
						selectedDate={singleSelectedDate}
						setSelectedDate={setSingleSelectedDate}
						fetchFlags={fetchFlags}
						setFetchFlags={setFetchFlags}
						monthRange={monthRange}
						setDynamicSelectedFilter={setReportSelectedFilter}
					/>
				);
			case 'GeneralCampaign':
				return (
					<GeneralCampaign
						key='GeneralCampaign'
						uniqueIdentifier={'heatmap'}
						filterPopupData={campaignList}
						campaignId={campaignId}
						setCampaignId={setCampaignId}
						setIsLoaderVisible={setMainLoader}
						fetchFlags={fetchFlags}
						setFetchFlags={setFetchFlags}
						analyticsApp={heatmapApp}
						initialApp={filterAppList}
						setCountryValue={setCountryValue}
						isCountryChecked={isCountryChecked}
						isCampaignChecked={isCampaignChecked}
						setIsCampaignChecked={setIsCampaignChecked}
						setDynamicSelectedFilter={setReportSelectedFilter}
					/>
				);
			case 'GeneralCountry':
				return (
					<GeneralCountry
						key='GeneralCountry'
						uniqueIdentifier={'heatmap'}
						countryValue={countryValue}
						setCountryValue={setCountryValue}
						fetchFlag={fetchFlags}
						setFetchFlag={setFetchFlags}
						setMainLoader={setMainLoader}
						setCampaignId={setCampaignId}
						isCampaignChecked={isCampaignChecked}
						isCountryChecked={isCountryChecked}
						setIsCountryChecked={setIsCountryChecked}
						setDynamicSelectedFilter={setReportSelectedFilter}
						heatmapApp={heatmapApp}
					/>
				);
			case 'GeneralActivity':
				return (
					<GeneralDataFilter
						uniqueIdentifier={'heatmap_activity'}
						filterName='Activity'
						filterPopupData={activityFilterList}
						finalSelectData={selectedActivity}
						setFinalSelectData={setSelectedActivity}
						fetchFlag={fetchFlags}
						setFetchFlag={setFetchFlags}
						setIsLoaderVisible={setMainLoader}
					/>
				);
			default:
				return null;
		}
	};
	//conditional rendering of filter
	const getComponentOrder = () => {
		let remainingStates = [];
		remainingStates = [
			'GeneralSingleDatePicker',
			'GeneralCountry',
			'GeneralCampaign',
			'GeneralActivity',
		];
		const d = new Date(singleSelectedDate);
		const day = String(d.getDate()).padStart(2, '0');
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const year = d.getFullYear();
		const finalDate = singleSelectedDate ? `${year}-${month}-${day}` : '';
		const stateValues = {
			GeneralSingleDatePicker: finalDate?.length,
			GeneralCampaign: finalCampaign?.length,
			GeneralCountry: finalCountry?.length,
			GeneralActivity: selectedActivity?.length,
		};
		const activeStates = Object?.keys(stateValues).filter((state) => stateValues[state] > 0);
		if (activeStates) {
			localStorage.setItem('heatState', JSON?.stringify(activeStates));
			if (selectedReportFilter) {
				let localState = localStorage?.getItem('heatState');
				let storeArray = JSON?.parse(localState || []);

				const index = storeArray.indexOf(selectedReportFilter);
				if (index > -1) {
					storeArray.splice(index, 1);
				}
				storeArray.push(selectedReportFilter);
				localStorage.setItem('heatState', JSON?.stringify(storeArray));
				remainingStates = remainingStates?.filter((state) => !storeArray?.includes(state));
				return [...storeArray, ...remainingStates];
			} else {
				remainingStates = remainingStates?.filter((state) => !activeStates?.includes(state));
				return [...activeStates, ...remainingStates];
			}
		} else {
			return ['GeneralSingleDatePicker', 'GeneralCountry', 'GeneralCampaign', 'GeneralActivity'];
		}
	};

	useEffect(() => {
		const filterOrder = getComponentOrder();
		setPreviousOrder(filterOrder);
	}, [
		filterAppList,
		heatmapApp,
		fetchFlags,
		singleSelectedDate,
		fetchFlags,
		monthRange,
		campaignList,
		campaignId,
		filterAppList,
		isCountryChecked,
		isCampaignChecked,
		countryValue,
		isCampaignChecked,
		isCountryChecked,
		selectedActivity,
	]);
	const renderedComponents = orderFilter?.map((componentName) => renderComponent(componentName));

	const isIOS =
		/iPhone|iPad|iPod/i.test(navigator.userAgent) || /iPhone X/i.test(navigator.userAgent);

	const { addClass } = useStickyOnScroll({ topSpace: 15 });

	const totalCount = useMemo(() => {
		return heatmapData.reduce(
			(acc, item) => {
				const revenue = Number(item.totalAdRevenue) || 0;
				const cost = Number(item.advertiserAdCost) || 0;
				const roas = Number(item.roas) || 0;

				if (roas >= 1) {
					acc.profit.total_revenue += revenue;
					acc.profit.total_cost += cost;
					acc.profit.days += 1;
				} else {
					acc.loss.total_revenue += revenue;
					acc.loss.total_cost += cost;
					acc.loss.days += 1;
				}
				return acc;
			},
			{
				profit: { total_revenue: 0, total_cost: 0, days: 0 },
				loss: { total_revenue: 0, total_cost: 0, days: 0 },
			}
		);
	}, [heatmapData]);

	const totalDays = heatmapData.length;
	const profitPercentage = Number((totalCount?.profit?.days / totalDays) * 100).toFixed(2);
	const lossPercentage = Number(100 - profitPercentage).toFixed(2);

	function computeOverallAnnualReturn(data, asOfDate = new Date()) {
		if (!Array.isArray(data) || data.length === 0) {
			return { totalRevenue: 0, totalCost: 0, annualReturnPct: NaN };
		}

		const rows = data
			.map((r) => ({
				date: new Date(r.date),
				cost: +r.advertiserAdCost || 0,
				rev: +r.totalAdRevenue || 0,
			}))
			.sort((a, b) => a.date - b.date);

		const base = rows[0].date;
		let totalRevenue = 0;
		let totalCost = 0;

		const cashflows = [];
		for (const r of rows) {
			if (r.cost) {
				totalCost += r.cost;
				cashflows.push({ date: r.date, amount: -r.cost });
			}
			if (r.rev) totalRevenue += r.rev;
		}

		if (totalRevenue) {
			cashflows.push({ date: asOfDate, amount: totalRevenue });
		}

		const r = xirr(cashflows, base);

		return {
			totalRevenue,
			totalCost,
			annualReturnPct: Number.isFinite(r) ? r * 100 : -100,
		};
	}
	const annualReturn = useMemo(() => computeOverallAnnualReturn(heatmapData), [heatmapData]);
	const pctNum = Number(annualReturn?.annualReturnPct);

	return (
		<div className={`right-box-wrap ${isIOS ? 'iOS_device' : ''}`}>
			<div className='table-box-wrap main-box-wrapper pdglr24 calendar_page heatmap_calendar revenue_dashboard'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='popup-full-wrapper reports-popup-box active analytics-page-topbar heatmap-page-topbar'>
						<div className={`action-bar-container report-page-topbar ${addClass ? 'sticky_filter' : ''}`}>
							<div className='middle-section'>
								<div className='filter-bar-wrap'>
									<div className='filter-box revenue_filter analytics-filter-box'>
										<Select
											className='month_range_filter check-wrapper heatmap-dynamic-filter'
											classNamePrefix={'custom_month_range'}
											options={MonthRangeOptions}
											defaultValue={MonthRangeOptions[0]}
											onChange={handleMonthRangeChange}
											isSearchable={false}
											placeholder='Select Month-Year Range'
											styles={{
												option: (provided) => ({
													...provided,
													color: 'black',
												}),
											}}
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
										<GeneralSingleAppFilter
											uniqueIdentifier={'heatmap'}
											filterAppList={filterAppList}
											selectedApp={heatmapApp}
											setSelectedApp={setHeatmapApp}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
											setMainLoader={setMainLoader}
										/>
										{renderedComponents}
										{Number.isFinite(pctNum) && (
											<div className='overall_xirr'>
												<span>XIRR : </span>
												<span>{pctNum.toFixed(2)}%</span>
											</div>
										)}
									</div>
									<div className='right-bar-wrap'>
										{Number.isFinite(pctNum) && (
											<div className='overall_xirr'>
												<span>XIRR : </span>
												<span>{pctNum.toFixed(2)}%</span>
											</div>
										)}
										{totalCount?.profit?.total_revenue !== 0 && (
											<div className='heatmap_capsule'>
												<span className='capsule_wrap left-wrap' style={{ width: profitPercentage + '%' }}>
													<Tippy
														content={
															<div className='tooltip_inner'>
																<div>
																	Revenue : ${indianNumberFormat(totalCount?.profit?.total_revenue?.toFixed(2))}
																</div>
																<div>Cost : ${indianNumberFormat(totalCount?.profit?.total_cost?.toFixed(2))}</div>
																<div>
																	Profit : $
																	{indianNumberFormat(
																		(totalCount?.profit?.total_revenue - totalCount?.profit?.total_cost)?.toFixed(2)
																	)}
																</div>
																<div>
																	ROAS :{' '}
																	{totalCount?.profit?.total_cost
																		? (totalCount?.profit?.total_revenue / totalCount?.profit?.total_cost).toFixed(2)
																		: 0}
																</div>
															</div>
														}
														placement='bottom'
														arrow={false}
														duration={0}
														offset={[0, 2]}
														className='new_custom_tooltip top_arrow'
													>
														<div className='tooltip_trigger'>
															<span>{totalCount?.profit?.days}</span>
														</div>
													</Tippy>
												</span>
												<span className='capsule_wrap right-wrap' style={{ width: lossPercentage + '%' }}>
													<Tippy
														content={
															<div className='tooltip_inner'>
																<div>
																	Revenue : ${indianNumberFormat(totalCount?.loss?.total_revenue?.toFixed(2))}
																</div>
																<div>Cost : ${indianNumberFormat(totalCount?.loss?.total_cost?.toFixed(2))}</div>
																<div>
																	Loss : $
																	{indianNumberFormat(
																		Math.abs(totalCount?.loss?.total_revenue - totalCount?.loss?.total_cost)?.toFixed(
																			2
																		)
																	)}
																</div>
																<div>
																	ROAS :{' '}
																	{totalCount?.loss?.total_cost
																		? (totalCount?.loss?.total_revenue / totalCount?.loss?.total_cost).toFixed(2)
																		: 0}
																</div>
															</div>
														}
														placement='bottom'
														arrow={false}
														duration={0}
														offset={[0, 2]}
														className='new_custom_tooltip top_arrow loss_tooltip'
													>
														<div className='tooltip_trigger'>
															<span>{totalCount?.loss?.days}</span>
														</div>
													</Tippy>
												</span>
											</div>
										)}

										<div className='heatmap_more_btn  more-button three-icon-button'>
											<MdMoreVert className='material-icons' />
											<div className='more-box analytics_csv arpu_csv'>
												<div className='border-box' onClick={() => setInfoModalShow(true)}>
													<div className='border-box-icon'>
														<BsQuestionCircle color='#5f6368' size={20} />
													</div>
													<span>Monthly XIRR</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className='popup-full-box form-box-wrap form-wizard'>
							<div className='popup-box-wrapper statistics_table_wrap calendar-heatmap-panel'>
								{isLoading || isFetching ? (
									<div className='shimmer-spinner'>
										<div className='spinner_inner'>
											<Spinner animation='border' variant='secondary' />
											<div id='countdown' className='countdown'>
												{count}
											</div>
										</div>
									</div>
								) : heatmapData?.length == 0 ? (
									<CustomNoDataComponent />
								) : (
									<CalendarHeatMap data={heatmapData} />
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Info Modal */}
			<XIRRInfoModal show={infoModalShow} onHide={() => setInfoModalShow(false)} />
		</div>
	);
};

export default HeatmapBox;
