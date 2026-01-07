/** @format */

import { createContext, useEffect, useMemo, useState } from 'react';

// Create a context object
export const DataContext = createContext();

export const DataContextProvider = ({ children }) => {
	const localReportDateRange = JSON.parse(sessionStorage.getItem('report_date_range'));
	const localAnalyticsDateRange = JSON.parse(sessionStorage.getItem('analytics_date_range'));
	const [dateRange, setDateRange] = useState(localReportDateRange ? localReportDateRange : '');
	const [dateRangeforAnalytics, setDateRangeforAnalytics] = useState(
		localAnalyticsDateRange ? localAnalyticsDateRange : ''
	);

	const [userId, setUserId] = useState('');
	// const [userToken, setUserToken] = useState('');
	const [addUserFlag, setAddUserFlag] = useState(false);
	const [editUserData, setEditUserData] = useState({});
	const [addAccFlag, setAddAccFlag] = useState(false);
	const [editAccData, setEditAccData] = useState({});
	const [addAppFlag, setAddAppFlag] = useState(false);
	const [auth, setAuth] = useState(false);
	const [dateRangeforacct, setDateRangeForAcct] = useState('');
	const [addPermissionFlag, setAddPermissionFlag] = useState(false);
	const [addGroupFlag, setAddGroupFlag] = useState(false);
	const [ipFlag, setIpFlag] = useState(false);
	const [roleFlag, setRoleFlag] = useState(false);
	const [isSearched, setIsSearched] = useState(false);
	const [cronFlag, setCronFlag] = useState(false);
	const [searchUnitId, setSearchUnitId] = useState('');
	const [isUnitSelection, setIsUnitSelection] = useState(false);
	const [sidebarSelectApp, setSidebarSelectApp] = useState(null);
	const [guideStart, setGuideStart] = useState(false);
	const [accModalShow, setAccModalShow] = useState(false);
	const [isGuideVisible, setIsGuideVisible] = useState(false);
	const [accSelectValue, setAccSelectValue] = useState([]);
	const [sharedData, setSharedData] = useState([]);
	const [sharedMatrixData, setSharedMatrixData] = useState([]);
	const [sharedAnalyticsDimensionData, setAnalyticsDimensionSharedData] = useState([]);
	const [sidebarData, setSidebardata] = useState([]);
	const [Data, setData] = useState(false);
	const [appListLocal, setAppListLocal] = useState([]);

	const role = useMemo(() => {
		const stored = JSON.parse(localStorage.getItem('role'));
		return stored ? stored : '';
	}, [roleFlag]);

	const [appTab, setAppTab] = useState({
		detailsPage: true,
		settingPage: false,
		unitPage: false,
	});

	const [tab, setTab] = useState({
		personalTab: true,
		accountTab: false,
		userTab: false,
		permissionTab: false,
		groupTab: false,
		IpTab: false,
		cron: false,
	});

	const [analyticstab, setAnalyticsTab] = useState(() => {
		const stored = sessionStorage.getItem('analytics_tab_state');
		return stored
			? JSON.parse(stored)
			: {
					account: true,
					property: false,
					campaign: false,
					activity: false,
			  };
	});
	const [isAppLoaderVisible, setIsAppLoaderVisible] = useState({
		unitPerformance: false,
		activityPerformance: false,
		UserMetricsPerformance: false,
	});
	const [policytab, setTabForPolicy] = useState({
		IssuesTab: true,
		DisapproveTab: false,
	});

	//New state
	const localStatisticDimension = JSON.parse(sessionStorage.getItem('statistics_dimension_items'));
	const [statisticsDimensionValue, setStatisticsDimensionValue] = useState(
		localStatisticDimension
			? localStatisticDimension
			: [
					{
						matrix_auto_id: '1',
						matrix_display_name: 'Apps',
						matrix_checked: true,
						value: 'APP',
						data_column_id: '1',
						key: 'Apps',
						name: 'Apps',
						sortValue: 'APP',
					},
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
						matrix_display_name: 'App Version',
						matrix_checked: false,
						value: 'APP_VERSION',
						data_column_id: '3',
						key: 'appVersion',
						name: 'appVersion',
						sortValue: 'APP_VERSION',
					},
			  ]
	);
	const localSharedStatisticsDimension = JSON.parse(
		sessionStorage.getItem('statistics_dimension_items')
	);
	const [statisticsSharedData, setStatisticsSharedData] = useState(
		localSharedStatisticsDimension ? { columns: localSharedStatisticsDimension } : []
	);
	const localSharedStatisticsMatrix = JSON.parse(sessionStorage.getItem('statistics_matrix_items'));
	const [statisticsSharedMatrixData, setStatisticsSharedMatrixData] = useState(
		localSharedStatisticsMatrix ? { columns: localSharedStatisticsMatrix } : []
	);

	const [statisticsPinToggle, setStatisticsPinToggle] = useState(false);
	const [statisticsDimensionCheck, setStatisticsDimensionCheck] = useState(false);
	const [statisticsToggleResize, setStatisticsToggleResize] = useState(false);

	const localSharedMatrix = JSON.parse(sessionStorage.getItem('analytics_matrix'));
	const [sharedAnalyticsMatrixData, setSharedAnalyticsMatrixData] = useState(
		localSharedMatrix ? { columns: localSharedMatrix } : []
	);
	const localSharedDimension = JSON.parse(sessionStorage.getItem('new_analytics_dimension'));
	const [sharedNewDimensionData, setSharedNewDimensionData] = useState(
		localSharedDimension ? { columns: localSharedDimension } : []
	);

	//heatmap
	const [allCountryData, setAllCountryData] = useState([]);
	const [filteredCountryData, setFilteredCountryData] = useState([]);

	const [profileImage, setProfileImage] = useState(() => {
		const storedImage = localStorage.getItem('profile');
		if (storedImage === 'null' || storedImage === null) {
			return null;
		}
		return storedImage ? import.meta.env.VITE_IMAGE_BASE_URL + storedImage : null;
	});
	const [activeTab, setActiveTab] = useState('otp');
	const [isDarkMode, setIsDarkMode] = useState(() => {
		return localStorage.getItem('theme') === 'dark';
	});

	const [userData, setUserData] = useState('');
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const value = {
		addUserFlag,
		setAddUserFlag,
		userId,
		setUserId,
		editUserData,
		setEditUserData,
		addAccFlag,
		setAddAccFlag,
		editAccData,
		setEditAccData,
		addAppFlag,
		setAddAppFlag,
		auth,
		setAuth,
		dateRange,
		setDateRange,
		addPermissionFlag,
		setAddPermissionFlag,
		roleFlag,
		setRoleFlag,
		role,
		cronFlag,
		setCronFlag,
		appTab,
		setAppTab,
		searchUnitId,
		setSearchUnitId,
		isSearched,
		setIsSearched,
		isUnitSelection,
		setIsUnitSelection,
		tab,
		setTab,
		accModalShow,
		setAccModalShow,
		sidebarSelectApp,
		setSidebarSelectApp,
		guideStart,
		setGuideStart,
		isGuideVisible,
		setIsGuideVisible,
		isAppLoaderVisible,
		setIsAppLoaderVisible,
		accSelectValue,
		setAccSelectValue,
		sharedData,
		setSharedData,
		sharedMatrixData,
		setSharedMatrixData,
		sidebarData,
		setSidebardata,
		Data,
		setData,
		policytab,
		setTabForPolicy,
		dateRangeforacct,
		setDateRangeForAcct,
		addGroupFlag,
		setAddGroupFlag,
		ipFlag,
		setIpFlag,
		dateRangeforAnalytics,
		setDateRangeforAnalytics,
		analyticstab,
		setAnalyticsTab,
		sharedAnalyticsMatrixData,
		setSharedAnalyticsMatrixData,
		sharedAnalyticsDimensionData,
		setAnalyticsDimensionSharedData,
		appListLocal,
		setAppListLocal,
		statisticsSharedData,
		setStatisticsSharedData,
		statisticsPinToggle,
		setStatisticsPinToggle,
		statisticsDimensionCheck,
		setStatisticsDimensionCheck,
		statisticsToggleResize,
		setStatisticsToggleResize,
		statisticsDimensionValue,
		setStatisticsDimensionValue,
		sharedNewDimensionData,
		setSharedNewDimensionData,
		statisticsSharedMatrixData,
		setStatisticsSharedMatrixData,
		allCountryData,
		setAllCountryData,
		filteredCountryData,
		setFilteredCountryData,
		profileImage,
		setProfileImage,
		activeTab,
		setActiveTab,
		isDarkMode,
		setIsDarkMode,
		userData,
		setUserData,
		isLoggedIn,
		setIsLoggedIn,
	};

	return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContextProvider;
