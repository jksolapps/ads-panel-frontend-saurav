/** @format */

import { createContext, useEffect, useState } from 'react';

// Create a context object
export const ReportContext = createContext();

export const ReportContextProvider = ({ children }) => {
	const localAppValue = JSON.parse(sessionStorage.getItem('app_filter'));
	const localFormatValue = JSON.parse(sessionStorage.getItem('format_filter'));
	const localPlatformValue = JSON.parse(sessionStorage.getItem('platform_filter'));
	const localCountryValue = JSON.parse(sessionStorage.getItem('country_filter'));
	const localGroupValue = JSON.parse(sessionStorage.getItem('group_filter'));
	const localUnitValue = JSON.parse(sessionStorage.getItem('unit_filter'));
	const localDimensionValue = JSON.parse(sessionStorage.getItem('dimension_items'));
	const localMatrixValue = JSON.parse(sessionStorage.getItem('matrix_items'));

	const [appValue, setAppValue] = useState(localAppValue ? localAppValue : []);
	const [formatValue, setFormatValue] = useState(localFormatValue ? localFormatValue : []);
	const [platformValue, setPlatformValue] = useState(localPlatformValue ? localPlatformValue : []);
	const [countryValue, setCountryValue] = useState(localCountryValue ? localCountryValue : []);
	const [groupByValue, setGroupByValue] = useState(localGroupValue ? localGroupValue : []);

	const [unitValue, setUnitValue] = useState(localUnitValue ? localUnitValue : []);

	const [dimensionValue, setDimensionValue] = useState(
		localDimensionValue
			? localDimensionValue
			: [
					{
						id: 'APP',
						name: 'Apps',
						dimension_checked: true,
						dimension_id: '1',
						key: 'app_display_name',
						pin_key: true,
						data_column_id: 1,
					},
					{
						id: 'DATE',
						name: 'Date',
						dimension_checked: true,
						dimension_id: '2',
						key: 'report_date',
						pin_key: false,
						data_column_id: 2,
					},
					{
						id: 'DAY',
						name: 'Day',
						dimension_checked: false,
						dimension_id: '3',
						key: 'report_date',
						pin_key: false,
						data_column_id: 3,
					},
					{
						id: 'AD_UNIT',
						name: 'Ad Unit',
						dimension_checked: false,
						key: 'au_display_name',
						pin_key: false,
						data_column_id: 4,
					},
					{
						id: 'FORMAT',
						name: 'Format',
						dimension_checked: false,
						key: 'au_format',
						pin_key: false,
						data_column_id: 5,
					},
					{
						id: 'COUNTRY',
						name: 'Country',
						dimension_checked: false,
						key: 'country_name',
						pin_key: false,
						data_column_id: 6,
					},
					{
						id: 'APP_VERSION_NAME',
						name: 'App Version',
						dimension_checked: false,
						key: 'app_version',
						pin_key: false,
						data_column_id: 7,
					},
			  ]
	);

	const [selectedAccountData, setSelectedAccountData] = useState(() => {
		const stored = sessionStorage.getItem('report_admob_filter');
		return stored ? JSON.parse(stored) : undefined;
	});
	const [groupValue, setGroupValue] = useState([]);
	const [popupFlags, setPopupFlags] = useState(false);
	const [analyticsPopupFlags, setAnalyticsPopupFlags] = useState(false);
	const [isAccountSelected, setIsAccountSelected] = useState(false);

	const [filterFlag, setFilterFlag] = useState(false);
	const [isMatrixCheck, setIsMatrixCheck] = useState(true);

	const [allMatrixData, setAllMatrixData] = useState(
		localMatrixValue
			? localMatrixValue
			: [
					{
						matrix_auto_id: '5',
						matrix_display_name: 'Est. earnings',
						matrix_checked: true,
						value: 'total_estimated_earnings',
						data_column_id: '8',
						key: 'estimated_earnings',
						name: 'ESTIMATED_EARNINGS',
					},
					{
						matrix_auto_id: '6',
						matrix_display_name: 'Observed eCPM',
						matrix_checked: true,
						value: 'total_observed_ecpm',
						data_column_id: '9',
						key: 'observed_ecpm',
						name: 'IMPRESSION_RPM',
					},
					{
						matrix_auto_id: '7',
						matrix_display_name: 'Requests',
						matrix_checked: true,
						value: 'total_ad_requests',
						data_column_id: '10',
						key: 'ad_requests',
						name: 'AD_REQUESTS',
					},
					{
						matrix_auto_id: '9',
						matrix_display_name: 'Matched requests',
						matrix_checked: false,
						value: 'total_matched_requests',
						data_column_id: '11',
						key: 'matched_requests',
						name: 'MATCHED_REQUESTS',
					},
					{
						matrix_auto_id: '8',
						matrix_display_name: 'Match rate (%)',
						matrix_checked: true,
						value: 'total_match_rate',
						data_column_id: '12',
						key: 'match_rate',
						name: 'MATCH_RATE',
					},
					{
						matrix_auto_id: '11',
						matrix_display_name: 'Impressions',
						matrix_checked: true,
						value: 'total_impressions',
						data_column_id: '13',
						key: 'impressions',
						name: 'IMPRESSIONS',
					},
					{
						matrix_auto_id: '12',
						matrix_display_name: 'Active users',
						matrix_checked: true,
						value: 'total_active_users',
						data_column_id: '14',
						key: 'active_users',
						name: 'ACTIVE_USER',
					},
					{
						matrix_auto_id: '13',
						matrix_display_name: 'ARPU',
						matrix_checked: true,
						value: 'total_arpu',
						data_column_id: '15',
						key: 'arpu',
						name: 'ARPU',
					},
					{
						matrix_auto_id: '14',
						matrix_display_name: 'ARPDAU',
						matrix_checked: true,
						value: 'total_arpdau',
						data_column_id: '16',
						key: 'arpdau',
						name: 'ARPDAU',
					},
					{
						matrix_auto_id: '15',
						matrix_display_name: 'DAU AV',
						matrix_checked: true,
						value: 'total_dau_av',
						data_column_id: '17',
						key: 'dau_av',
						name: 'DAU_AV',
					},
					{
						matrix_auto_id: '16',
						matrix_display_name: 'AV RATE',
						matrix_checked: true,
						value: 'total_av_rate',
						data_column_id: '18',
						key: 'av_rate',
						name: 'AV_RATE',
					},
					{
						matrix_auto_id: '17',
						matrix_display_name: 'Impression/User',
						matrix_checked: true,
						value: 'total_impr_per_user',
						data_column_id: '19',
						key: 'impr_per_user',
						name: 'IMPR_PER_USER',
					},
					{
						matrix_auto_id: '18',
						matrix_display_name: 'Show rate (%)',
						matrix_checked: true,
						value: 'total_show_rate',
						data_column_id: '20',
						key: 'show_rate',
						name: 'SHOW_RATE',
					},
					{
						matrix_auto_id: '19',
						matrix_display_name: 'Clicks',
						matrix_checked: true,
						value: 'total_clicks',
						data_column_id: '20',
						key: 'clicks',
						name: 'CLICKS',
					},
					{
						matrix_auto_id: '20',
						matrix_display_name: 'CTR (%)',
						matrix_checked: true,
						value: 'total_impression_ctr',
						data_column_id: '21',
						key: 'impression_ctr',
						name: 'IMPRESSION_CTR',
					},
			  ]
	);

	//analytics filter
	//dimension
	const localFilteredDimension = JSON.parse(sessionStorage.getItem('new_checked_dimension'));
	const [filteredDimension, setFilteredDimension] = useState(
		localFilteredDimension ? localFilteredDimension : []
	);

	const initialDimensionList = [
		{
			matrix_auto_id: '2',
			matrix_display_name: 'Date',
			matrix_checked: false,
			value: 'DATE',
			data_column_id: '2',
			key: 'Date',
			name: 'Date',
			sortValue: 'DATE',
		},
		{
			matrix_auto_id: '3',
			matrix_display_name: 'Month',
			matrix_checked: false,
			value: 'MONTH',
			data_column_id: '3',
			key: 'Month',
			name: 'Month',
			sortValue: 'MONTH',
		},
		{
			matrix_auto_id: '4',
			matrix_display_name: 'Campaign',
			matrix_checked: false,
			value: 'CAMPAIGN_NAME',
			data_column_id: '4',
			key: 'firstUserCampaignId',
			name: 'Campaign',
			sortValue: 'CAMPAIGN_NAME',
		},
		{
			matrix_auto_id: '5',
			matrix_display_name: 'Country',
			matrix_checked: false,
			value: 'CAMPAIGN_NAME',
			data_column_id: '4',
			key: 'firstUserCampaignId',
			name: 'Country',
			sortValue: 'CAMPAIGN_NAME',
		},
	];
	const [dimensionList, setDimensionList] = useState(() => {
		const stored = JSON.parse(sessionStorage.getItem('new_dimension_list'));
		return stored && stored.length > 0 ? stored : initialDimensionList;
	});

	//matrix
	const localFilteredMatrix = JSON.parse(sessionStorage.getItem('new_checked_matrix'));
	const [filteredMatrix, setFilteredMatrix] = useState(
		localFilteredMatrix ? localFilteredMatrix : []
	);
	const localAnalyticsMatrix = JSON.parse(sessionStorage.getItem('analytics_matrix'));
	const [allAnalyticsMatrixData, setallAnalyticsMatrixData] = useState(
		localAnalyticsMatrix
			? localAnalyticsMatrix
			: [
					{
						matrix_auto_id: '4',
						matrix_display_name: 'Cost',
						matrix_checked: false,
						value: 'Total Cost',
						data_column_id: '4',
						key: 'Total Cost',
						name: 'advertiserAdCost',
						sortValue: 'advertiserAdCost',
					},
					{
						matrix_auto_id: '5',
						matrix_display_name: 'Revenue',
						matrix_checked: false,
						value: 'Total Revenue',
						data_column_id: '5',
						key: 'Total Revenue',
						name: 'totalAdRevenue',
						sortValue: 'totalAdRevenue',
					},
					{
						matrix_auto_id: '6',
						matrix_display_name: 'ROAS',
						matrix_checked: false,
						value: 'ROAS',
						data_column_id: '6',
						key: 'ROAS',
						name: 'returnOnAdSpend',
						sortValue: 'returnOnAdSpend',
					},
			  ]
	);

	//statistics
	const localStatisticsMatrix = JSON.parse(sessionStorage.getItem('statistics_matrix'));
	const [statisticsMatrix, setStatisticsMatrix] = useState(
		localStatisticsMatrix
			? localStatisticsMatrix
			: [
					{
						id: 'DOWNLOADS',
						name: 'Downloads',
						dimension_checked: true,
						key: 'app_downloads',
						pin_key: false,
						data_column_id: 4,
					},
					// {
					// 	id: 'CUMULATIVE_DOWNLOADS',
					// 	name: 'Cumulative Downloads',
					// 	dimension_checked: true,
					// 	key: 'cumulative_downloads',
					// 	pin_key: false,
					// 	data_column_id: 5,
					// },
					{
						id: 'ACTIVE_USERS',
						name: 'Active Users',
						dimension_checked: true,
						key: 'active_user',
						pin_key: false,
						data_column_id: 6,
					},
					// {
					// 	id: 'DAU_PERCENTAGE',
					// 	name: 'DAU (%)',
					// 	dimension_checked: true,
					// 	key: 'app_dau',
					// 	pin_key: false,
					// 	data_column_id: 7,
					// },
					// {
					// 	id: 'D1_RETENTION',
					// 	name: 'D1',
					// 	dimension_checked: true,
					// 	key: 'd1_retention',
					// 	pin_key: false,
					// 	data_column_id: 8,
					// },
					// {
					// 	id: 'D7_RETENTION',
					// 	name: 'D7',
					// 	dimension_checked: true,
					// 	key: 'd7_retention',
					// 	pin_key: false,
					// 	data_column_id: 9,
					// },
					// {
					// 	id: 'D30_RETENTION',
					// 	name: 'D30',
					// 	dimension_checked: true,
					// 	key: 'd30_retention',
					// 	pin_key: false,
					// 	data_column_id: 10,
					// },
					// {
					// 	id: 'D60_RETENTION',
					// 	name: 'D60',
					// 	dimension_checked: true,
					// 	key: 'd60_retention',
					// 	pin_key: false,
					// 	data_column_id: 11,
					// },
					// {
					// 	id: 'D90_RETENTION',
					// 	name: 'D90',
					// 	dimension_checked: true,
					// 	key: 'd90_retention',
					// 	pin_key: false,
					// 	data_column_id: 12,
					// },
					// {
					// 	id: 'D180_RETENTION',
					// 	name: 'D180',
					// 	dimension_checked: true,
					// 	key: 'd180_retention',
					// 	pin_key: false,
					// 	data_column_id: 13,
					// },
					{
						id: 'AVG_SESSION',
						name: 'Average Session',
						dimension_checked: true,
						key: 'average_session',
						pin_key: false,
						data_column_id: 14,
					},
					{
						id: 'SESSION_DURATION',
						name: 'Session Duration',
						dimension_checked: true,
						key: 'session_duration',
						pin_key: false,
						data_column_id: 15,
					},
					{
						id: 'TIME_PER_USER',
						name: 'Time per user',
						dimension_checked: true,
						key: 'time_per_user',
						pin_key: false,
						data_column_id: 16,
					},
					{
						id: 'TOTAL_TIME',
						name: 'Total Time',
						dimension_checked: true,
						key: 'total_time_per_user',
						pin_key: false,
						data_column_id: 17,
					},
					// {
					// 	id: 'CRASH_FREE',
					// 	name: 'Crash Free',
					// 	dimension_checked: true,
					// 	key: 'crash_free',
					// 	pin_key: false,
					// 	data_column_id: 18,
					// },
					{
						id: 'ORGANIC_DOWNLOAD',
						name: 'Organic Download',
						dimension_checked: true,
						key: 'organic_download',
						pin_key: false,
						data_column_id: 19,
					},
					{
						id: 'PAID_DOWNLOAD',
						name: 'Paid Download',
						dimension_checked: true,
						key: 'paid_download',
						pin_key: false,
						data_column_id: 20,
					},
					{
						id: 'OPEN_RATE',
						name: 'Open Rate',
						dimension_checked: true,
						key: 'open_rate',
						pin_key: false,
						data_column_id: 21,
					},
					{
						id: 'ORGANIC_DOWNLOAD_PERCENT',
						name: 'Organic Download (%)',
						dimension_checked: true,
						key: 'organic_download',
						pin_key: false,
						data_column_id: 22,
					},
					{
						id: 'PAID_DOWNLOAD_PERCENT',
						name: 'Paid Download (%)',
						dimension_checked: true,
						key: 'paid_download',
						pin_key: false,
						data_column_id: 23,
					},
					// {
					// 	id: 'AVG_ACTIVE_DAYS',
					// 	name: 'Average Active Days',
					// 	dimension_checked: true,
					// 	key: 'open_rate',
					// 	pin_key: false,
					// 	data_column_id: 24,
					// },
			  ]
	);

	//account page
	const path = window.location.pathname;

	const [accountApp, setaccountApp] = useState(() => {
		const storageKey = path.includes('cost') ? 'cost_app_filter' : 'account_app_filter';
		const stored = sessionStorage.getItem(storageKey);
		return stored ? JSON.parse(stored) : [];
	});
	const [accountType, setaccountType] = useState(() => {
		const stored = sessionStorage.getItem('account_type_filter');
		return stored
			? JSON.parse(stored)
			: [
					{
						type_auto_id: '1',
						type_auto_name: 'Revenue',
						item_checked: true,
						order_id: '1',
					},
			  ];
	});
	const [accountpageAccountData, setaccountPageAccountData] = useState([]);
	const [accountOrder, setaccountOrder] = useState([
		{
			type_auto_id: '2',
			type_auto_name: 'Revenue ↑ (ascending)',
			sorting_column: 'Revenue',
			sorting_order: 'asc',
			item_checked: true,
			order_id: '1',
		},
	]);
	const [checkMark, setcheckMark] = useState(() => {
		const storageKey = path.includes('cost') ? 'cost_checkmark_filter' : 'account_checkmark_filter';
		const stored = sessionStorage.getItem(storageKey);
		return stored ? JSON.parse(stored) : [];
	});
	const [orderToggle, setOrderToggle] = useState(true);

	//report page
	const initialPlatformData = [
		{
			platform_auto_id: '1',
			platform_display_name: 'IOS',
			item_checked: false,
			platform_value: 'iOS',
		},
		{
			platform_auto_id: '2',
			platform_display_name: 'Android',
			item_checked: false,
			platform_value: 'Android',
		},
	];
	const localAppVersion = JSON.parse(sessionStorage.getItem('app_version_filter'));
	const [appVersionData, setappVersionData] = useState(localAppVersion ? localAppVersion : []);
	const [filteredPlatformData, setFilteredPlatformData] = useState(initialPlatformData);
	const [allPlatformData, setAllPlatformData] = useState(initialPlatformData);
	const [checkedPlatform, setCheckedPlatform] = useState([]);
	const [allFormatData, setAllFormatData] = useState([]);
	const [filteredFormatData, setFilteredFormatData] = useState([]);
	const [checkedFormat, setCheckedFormat] = useState([]);
	const [allAppData, setAllAppData] = useState([]);
	const [filteredAppData, setFilteredAppData] = useState([]);
	const [checkedApp, setCheckedApp] = useState([]);

	//acct page

	const initialAccountPlatformData = [
		{
			platform_auto_id: '1',
			platform_display_name: 'IOS',
			item_checked: false,
			platform_value: 'iOS',
		},
		{
			platform_auto_id: '2',
			platform_display_name: 'Android',
			item_checked: false,
			platform_value: 'Android',
		},
	];
	const [initialAccountFilterPerformanceData, setinitialAccountFilterPerformanceData] = useState([
		{
			platform_auto_id: '1',
			platform_display_name: 'top_performers',
			item_checked: false,
			platform_value: 'Top performers',
		},
		{
			platform_auto_id: '2',
			platform_display_name: 'top_mover',
			item_checked: false,
			platform_value: 'Top Mover',
		},
		{
			platform_auto_id: '3',
			platform_display_name: 'bottom_movers',
			item_checked: false,
			platform_value: 'Bottom movers',
		},
	]);
	const [allAccounAppData, setallAccounAppData] = useState([]);
	const [filteredAccountAppData, setfilteredAccountAppData] = useState([]);
	const [checkedAccountApp, setcheckedAccountApp] = useState([]);
	const [checkedAccountDash, setcheckedAccountDash] = useState([]);
	const [checkedAccountCamp, setcheckedAccountCamp] = useState([]);

	const [allAccountPlatformData, setallAccountPlatformData] = useState(initialAccountPlatformData);
	const [filteredAccountPlatformData, setfilteredAccountPlatformData] = useState(
		initialAccountPlatformData
	);
	const [checkedAccountPlatform, setcheckedAccountPlatform] = useState([]);
	const [allAccountFilterPerformanceData, setallAccountFilterPerformanceData] = useState(
		initialAccountFilterPerformanceData
	);
	const [filteredAccountFilterPerformanceData, setfilteredAccountFilterPerformanceData] = useState(
		initialAccountFilterPerformanceData
	);
	const [checkedAccountFilterPerformance, setcheckedAccountFilterPerformance] = useState([]);
	const [performanceData, setPerformanceData] = useState([]);
	const [allAppVersionData, setallAppVersionData] = useState([]);
	const [filteredAppVersionData, setfilteredAppVersionData] = useState([]);
	const [checkedAppVersion, setcheckedAppVersion] = useState([]);
	const [allUnitData, setAllUnitData] = useState([]);
	const [searchAllUnitData, setSearchAllUnitData] = useState([]);
	const [checkedUnit, setCheckedUnit] = useState([]);
	const [allAccountData, setallAccountData] = useState([]);
	const [filteredAccountData, setfilteredAccountData] = useState([]);
	const [checkedAccount, setcheckedAccount] = useState([]);
	const [dimensionBoxCheck, setDimensionBoxCheck] = useState(false);
	const [MatrixBoxCheck, setMatrixBoxCheck] = useState(false);
	const [selectedFilter, setSelectedFilter] = useState('');
	const [selectedReportFilter, setReportSelectedFilter] = useState('');
	const [pinToggle, setPinToggle] = useState(false);
	const [dimensionId, setDimensionId] = useState('');
	const [toggleRize, setToggleResize] = useState(false);
	const [toggleRizeAnalytics, setToggleResizeAnalytics] = useState(false);
	// /campaign page
	const localCampaignValue = JSON.parse(sessionStorage.getItem('analytic_campaign_filter'));
	const localAnalyticsApp = JSON.parse(sessionStorage.getItem('analytic_app_filter'));
	const localAnalyticsGroup = JSON.parse(sessionStorage.getItem('analytic_group_filter'));

	const [campaignId, setCampaignID] = useState(localCampaignValue ? localCampaignValue : []);
	const [analyticsApp, setAnalyticsApp] = useState(localAnalyticsApp ? localAnalyticsApp : []);
	const [analyticsGroupBy, setAnalyticsGroupBy] = useState(
		localAnalyticsGroup ? localAnalyticsGroup : []
	);

	const [propertyData, setPropertyData] = useState([]);
	const [groupData, setGroupData] = useState([]);
	const [accountData, SetAccountdata] = useState([]);
	const [statusData, setStatusData] = useState([
		{ status_id: '0', status_name: 'All', item_checked: true },
	]);

	// analytics page
	const [analyticsDimensionValue, setanalyticsDimensionValue] = useState([
		{
			id: 'Apps',
			name: 'Apps',
			dimension_checked: true,
			pin_key: false,
			key: 'Apps',
			sortValue: 'Apps',
			value: 'Apps',
			api_id: 'Apps',
			child: 'false',
		},
		{
			name: 'Campaign Name',
			id: 'firstUserCampaignId',
			dimension_checked: false,
			key: 'firstUserCampaignId',
			pin_key: false,
			value: 'CAMPAIGN_NAME',
			api_id: 'firstUserCampaignName',
			child: 'false',
		},
		{
			id: 'Date',
			name: 'Date',
			dimension_checked: false,
			key: 'Date',
			pin_key: false,
			value: 'DATE',
			api_id: 'date',
			child: 'true',
		},
		{
			id: 'COUNTRY',
			name: 'Country',
			dimension_checked: false,
			key: 'COUNTRY',
			sortValue: 'COUNTRY',
			value: 'COUNTRY',
			api_id: 'country',
			child: 'false',
		},
		{
			id: 'NewColumn',
			dimension_id: 2,
			data_column_id: 2,
			name: 'NewColumn',
			dimension_checked: true,
			key: 'NewColumn',
			sortValue: 'NewColumn',
			value: 'NewColumn',
			api_id: 'NewColumn',
			pin_key: true,
		},
		{
			id: 'ExtraColumn',
			dimension_id: 3,
			data_column_id: 3,
			name: 'ExtraColumn',
			dimension_checked: false,
			key: 'ExtraColumn',
			sortValue: 'ExtraColumn',
			value: 'ExtraColumn',
			api_id: 'ExtraColumn',
			pin_key: false,
		},
		{
			id: 'advertiserAdCost',
			dimension_id: 4,
			data_column_id: 4,
			name: 'advertiserAdCost',
			dimension_checked: true,
			key: 'advertiserAdCost',
			sortValue: 'advertiserAdCost',
			value: 'advertiserAdCost',
			api_id: 'advertiserAdCost',
			pin_key: true,
		},
		{
			id: 'totalAdRevenue',
			dimension_id: 5,
			data_column_id: 5,
			name: 'totalAdRevenue',
			dimension_checked: true,
			key: 'totalAdRevenue',
			sortValue: 'totalAdRevenue',
			value: 'totalAdRevenue',
			api_id: 'totalAdRevenue',
			pin_key: true,
		},
		{
			id: 'returnOnAdSpend',
			dimension_id: 6,
			data_column_id: 6,
			name: 'returnOnAdSpend',
			dimension_checked: true,
			key: 'returnOnAdSpend',
			sortValue: 'returnOnAdSpend',
			value: 'returnOnAdSpend',
			api_id: 'returnOnAdSpend',
			pin_key: true,
		},
		// {
		//   id: "APP_VERSION",
		//   dimension_id: 7,
		//   data_column_id: 7,
		//   name: "App Version",
		//   dimension_checked: false,
		//   key: "App Version",
		//   sortValue: "APP_VERSION",
		//   value: "APP_VERSION",
		//   api_id: "app_version",
		//   child: "false",
		// },
		// {
		//   id: "PAGESCREEN",
		//   dimension_id: 8,
		//   data_column_id: 8,
		//   name: "PAGESCREEN",
		//   dimension_checked: false,
		//   key: "PAGE & SCREEN",
		//   sortValue: "PAGESCREEN",
		//   value: "PAGESCREEN",
		//   api_id: "PAGESCREEN",
		//   child: "false",
		// },
	]);
	const [analyticsDimensionValueBox, setanalyticsDimensionValueBox] = useState([
		{
			id: 'Apps',
			dimension_id: 5,
			data_column_id: 5,
			name: 'Apps',
			dimension_checked: true,
			pin_key: false,
			key: 'Apps',
			sortValue: 'Apps',
			value: 'APP',
			api_id: 'Apps',
		},
		{
			id: 'firstUserCampaignId',
			dimension_id: 2,
			data_column_id: 2,
			name: 'Campaign Name',
			dimension_checked: true,
			key: 'firstUserCampaignId',
			pin_key: false,
			value: 'CAMPAIGN_NAME',
			api_id: 'firstUserCampaignId',
		},
		{
			id: 'Date',
			dimension_id: 3,
			data_column_id: 3,
			name: 'Date',
			dimension_checked: false,
			key: 'Date',
			pin_key: false,
			value: 'DATE',
			api_id: 'date',
		},
	]);

	const [rowExpandToggle, setRowExpandToggle] = useState(false);
	const [allAnalyticsOthersData, setallAnalyticsOthersData] = useState([
		{
			others_auto_id: '1',
			others_display_name: 'Country',
			others_checked: true,
			key: 'COUNTRY',
			id: 'COUNTRY',
			sortValue: 'COUNTRY',
		},
	]);
	const [dynamicDimensionWidth, setDynamicDimensionWidth] = useState([]);

	// analytics page
	const [campaignData, setCampaignData] = useState([]);
	const [campaignLastToggledFlag, setCampaingLastToggledFlag] = useState(false);
	const [analyticsDashboardApp, setAnalyticsDashboardApp] = useState([]);
	const [analyticsCampApp, setCampApp] = useState([]);

	const [newColumnFilter, setNewColumnFilter] = useState(null);
	const [extraColumnFilter, setExtraColumnFilter] = useState(null);
	const [isOpen, setIsOpen] = useState(false);
	const [secondIsOpen, setSecondsecondIsOpen] = useState(false);
	const [showFilterDropdown, setShowFilterDropdown] = useState(false);
	const [categoryClick, setCategorClick] = useState(false);
	const [resizeSticky, setResizeSticky] = useState(false);

	return (
		<ReportContext.Provider
			value={{
				appValue,
				setAppValue,
				countryValue,
				setCountryValue,
				formatValue,
				setFormatValue,
				platformValue,
				setPlatformValue,
				popupFlags,
				setPopupFlags,
				dimensionValue,
				setDimensionValue,
				unitValue,
				setUnitValue,
				filterFlag,
				setFilterFlag,
				allMatrixData,
				setAllMatrixData,
				isMatrixCheck,
				setIsMatrixCheck,
				selectedAccountData,
				setSelectedAccountData,
				isAccountSelected,
				setIsAccountSelected,
				setaccountApp,
				accountApp,
				setaccountType,
				accountType,
				accountpageAccountData,
				setaccountPageAccountData,
				accountOrder,
				setaccountOrder,
				checkMark,
				setcheckMark,
				orderToggle,
				setOrderToggle,
				initialPlatformData,
				filteredPlatformData,
				setFilteredPlatformData,
				checkedPlatform,
				setCheckedPlatform,
				allPlatformData,
				setAllPlatformData,
				allFormatData,
				setAllFormatData,
				filteredFormatData,
				setFilteredFormatData,
				checkedFormat,
				setCheckedFormat,
				allAppData,
				setAllAppData,
				filteredAppData,
				setFilteredAppData,
				checkedApp,
				setCheckedApp,
				appVersionData,
				setappVersionData,
				allAccounAppData,
				setallAccounAppData,
				filteredAccountAppData,
				setfilteredAccountAppData,
				checkedAccountApp,
				setcheckedAccountApp,
				allAccountPlatformData,
				setallAccountPlatformData,
				filteredAccountPlatformData,
				setfilteredAccountPlatformData,
				checkedAccountPlatform,
				setcheckedAccountPlatform,
				initialAccountPlatformData,
				allAppVersionData,
				setallAppVersionData,
				filteredAppVersionData,
				setfilteredAppVersionData,
				checkedAppVersion,
				setcheckedAppVersion,
				groupValue,
				setGroupValue,
				allUnitData,
				setAllUnitData,
				searchAllUnitData,
				setSearchAllUnitData,
				checkedUnit,
				setCheckedUnit,
				allAccountData,
				setallAccountData,
				filteredAccountData,
				setfilteredAccountData,
				checkedAccount,
				setcheckedAccount,
				dimensionBoxCheck,
				setDimensionBoxCheck,
				MatrixBoxCheck,
				setMatrixBoxCheck,
				allAccountFilterPerformanceData,
				setallAccountFilterPerformanceData,
				filteredAccountFilterPerformanceData,
				setfilteredAccountFilterPerformanceData,
				checkedAccountFilterPerformance,
				setcheckedAccountFilterPerformance,
				initialAccountFilterPerformanceData,
				setinitialAccountFilterPerformanceData,
				performanceData,
				setPerformanceData,
				selectedFilter,
				setSelectedFilter,
				selectedReportFilter,
				setReportSelectedFilter,
				pinToggle,
				setPinToggle,
				dimensionId,
				setDimensionId,
				toggleRize,
				setToggleResize,
				campaignId,
				setCampaignID,
				propertyData,
				setPropertyData,
				allAnalyticsMatrixData,
				setallAnalyticsMatrixData,
				groupData,
				setGroupData,
				accountData,
				SetAccountdata,
				analyticsPopupFlags,
				setAnalyticsPopupFlags,
				statusData,
				setStatusData,
				toggleRizeAnalytics,
				setToggleResizeAnalytics,
				analyticsDimensionValue,
				setanalyticsDimensionValue,
				analyticsApp,
				setAnalyticsApp,
				rowExpandToggle,
				setRowExpandToggle,
				allAnalyticsOthersData,
				setallAnalyticsOthersData,
				dynamicDimensionWidth,
				setDynamicDimensionWidth,
				campaignData,
				setCampaignData,
				campaignLastToggledFlag,
				setCampaingLastToggledFlag,
				analyticsDimensionValueBox,
				setanalyticsDimensionValueBox,
				analyticsDashboardApp,
				setAnalyticsDashboardApp,
				analyticsCampApp,
				setCampApp,
				checkedAccountDash,
				setcheckedAccountDash,
				checkedAccountCamp,
				setcheckedAccountCamp,

				newColumnFilter,
				setNewColumnFilter,
				extraColumnFilter,
				setExtraColumnFilter,
				isOpen,
				setIsOpen,
				showFilterDropdown,
				setShowFilterDropdown,
				secondIsOpen,
				setSecondsecondIsOpen,
				categoryClick,
				setCategorClick,
				resizeSticky,
				setResizeSticky,
				groupByValue,
				setGroupByValue,
				analyticsGroupBy,
				setAnalyticsGroupBy,
				filteredDimension,
				setFilteredDimension,
				statisticsMatrix,
				setStatisticsMatrix,
				dimensionList,
				setDimensionList,
				filteredMatrix,
				setFilteredMatrix,
			}}
		>
			{children}
		</ReportContext.Provider>
	);
};

export default ReportContextProvider;
