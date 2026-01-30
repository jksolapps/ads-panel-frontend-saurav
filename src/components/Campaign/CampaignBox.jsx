/** @format */

import { memo, useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { indianNumberFormat } from '../../utils/helper';
import GeneralDateRange from '../GeneralFilters/GeneralDateRange';
import GeneralSingleAppFilter from '../GeneralFilters/GeneralSingleAppFilter';
import GeneralCampaign from '../GeneralFilters/GeneralCampaign';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useAppList } from '../../context/AppListContext';
import { useGroupSettings } from '../../context/GroupSettingsContext';

const CampaignBox = memo(() => {
	const { selectedGroup } = useGroupSettings();
	const [mainData, setMainData] = useState([]);
	const [totalSummary, setTotalSummary] = useState([]);
	const [initialConvertedData, setInitialConvertedData] = useState([]);
	const [isLoaderVisible, setIsLoaderVisible] = useState(false);
	const [fetchFlags, setFetchFlags] = useState(false);

	// filters
	const localDateRange = JSON.parse(sessionStorage.getItem('main_campaign_date_range'));
	const [filterDate, setFilterDate] = useState(localDateRange ? localDateRange : '');

	// app-list
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


	const filterAppList = useMemo(() => filterData?.list_apps || [], [filterData]);
	const filterCampaignList = useMemo(() => filterData?.list_campaign || [], [filterData]);

	//final app
	const [filteredApp, setFilteredApp] = useState(() => {
		const store = sessionStorage.getItem('main_campaign_app_filter');
		return store ? JSON.parse(store) : [];
	});

	const [filteredCampaign, setFilteredCampaign] = useState([]);

	const [isCampaignApplied, setIsCampaignApplied] = useState(false);
	const [isDateClicked, setIsDateClicked] = useState(false);
	const [isClearClicked, setIsClearClicked] = useState(false);

	// Date
	const hasValidDateRange =
		Array.isArray(filterDate) && filterDate[0]?.startDate && filterDate[0]?.endDate;

	const selectedStartDate = hasValidDateRange
		? new Date(filterDate[0].startDate).toLocaleDateString('en-GB')
		: '';
	const selectedEndDate = hasValidDateRange
		? new Date(filterDate[0].endDate).toLocaleDateString('en-GB')
		: '';

	const columns = useMemo(
		() => [
			// Campaign
			{
				id: 'campaign',
				header: () => <div className='report-title custom_sibling_head'>Campaign</div>,
				accessorFn: (row) => row.firstUserCampaignName ?? '',
				cell: ({ row }) => {
					const value = row.original.firstUserCampaignName;
					return (
						<div className='custom_word_ellipsis'>
							<div className='report_main_value' title={value}>
								{value}
							</div>
						</div>
					);
				},
				enableSorting: true,
				sortingFn: (rowA, rowB, columnId) => {
					const a = rowA.getValue(columnId) || '';
					const b = rowB.getValue(columnId) || '';
					return a.localeCompare(b);
				},
				size: 400,
				minSize: 200,
				meta: {
					sortValue: 'CAMPAIGN_NAME',
					sortKey: 'firstUserCampaignName',
					alignMent: 'center',
					style: { justifyContent: 'center !important' },
				},
			},

			// Ad Cost
			{
				id: 'adCost',
				header: () => (
					<div className='report-title custom_right_head'>
						<div className='top_total'>
							<div className='report-header'>Ad Cost</div>
							{totalSummary && (
								<div className='report-total'>
									${indianNumberFormat(Number(totalSummary?.headerTotalAdCost || 0).toFixed(2))}
								</div>
							)}
						</div>
					</div>
				),
				accessorFn: (row) => Number(row.advertiserAdCost ?? row.adCost ?? 0),
				cell: ({ row }) => {
					const value = Number(row.original?.advertiserAdCost || 0);
					return <div className='report_column_box'>{'$' + indianNumberFormat(value.toFixed(2))}</div>;
				},
				enableSorting: true,
				sortingFn: (rowA, rowB, columnId) => {
					const a = Number(rowA.getValue(columnId) ?? 0);
					const b = Number(rowB.getValue(columnId) ?? 0);
					return a === b ? 0 : a < b ? -1 : 1;
				},
				minSize: 100,
				meta: {
					isDynamic: true,
					sortValue: 'AD_COST',
					sortKey: 'advertiserAdCost',
					omit: false,
					alignMent: 'right',
					style: { justifyContent: 'right !important' },
				},
			},

			// Revenue
			{
				id: 'revenue',
				header: () => (
					<div className='report-title custom_right_head'>
						<div className='top_total'>
							<div className='report-header'>Revenue</div>
							{totalSummary && (
								<div className='report-total'>
									${indianNumberFormat(Number(totalSummary?.headerTotalAdRevenue || 0).toFixed(2))}
								</div>
							)}
						</div>
					</div>
				),
				accessorFn: (row) => Number(row.totalAdRevenue ?? 0),
				cell: ({ row }) => {
					const value = Number(row.original?.totalAdRevenue || 0);
					return <div className='report_column_box'>{'$' + indianNumberFormat(value.toFixed(2))}</div>;
				},
				enableSorting: true,
				sortingFn: (rowA, rowB, columnId) => {
					const a = Number(rowA.getValue(columnId) ?? 0);
					const b = Number(rowB.getValue(columnId) ?? 0);
					return a === b ? 0 : a < b ? -1 : 1;
				},
				minSize: 100,
				meta: {
					sortValue: 'REVENUE',
					sortKey: 'totalAdRevenue',
					omit: false,
					alignMent: 'right',
					style: { justifyContent: 'right !important' },
					isDynamic: true,
				},
			},

			// ROAS
			{
				id: 'roas',
				header: () => (
					<div className='report-title custom_right_head'>
						<div className='top_total'>
							<div className='report-header'>ROAS</div>
							{totalSummary && (
								<div className='report-total'>
									{indianNumberFormat(Number(totalSummary?.headerTotalROAS || 0).toFixed(2))}
								</div>
							)}
						</div>
					</div>
				),
				accessorFn: (row) => Number(row.roas ?? 0),
				cell: ({ row }) => {
					const value = Number(row.original?.roas || 0);
					return <div className='report_column_box'>{indianNumberFormat(value.toFixed(2))}</div>;
				},
				enableSorting: true,
				sortingFn: (rowA, rowB, columnId) => {
					const a = Number(rowA.getValue(columnId) ?? 0);
					const b = Number(rowB.getValue(columnId) ?? 0);
					return a === b ? 0 : a < b ? -1 : 1;
				},
				minSize: 80,
				meta: {
					sortValue: 'ROAS',
					sortKey: 'roas',
					omit: false,
					alignMent: 'right',
					style: { justifyContent: 'right !important' },
					isDynamic: true,
				},
			},

			// Total User
			{
				id: 'totalUsers',
				header: () => (
					<div className='report-title custom_right_head'>
						<div className='top_total'>
							<div className='report-header'>Total User</div>
							{totalSummary && (
								<div className='report-total'>
									{indianNumberFormat(totalSummary?.headerTotalUsers || 0)}
								</div>
							)}
						</div>
					</div>
				),
				accessorFn: (row) => Number(String(row.totalUsers ?? 0).replace(/[$,]/g, '') || 0),
				cell: ({ row }) => {
					const value = row.original?.totalUsers || 0;
					return <div className='report_column_box'>{indianNumberFormat(value)}</div>;
				},
				enableSorting: true,
				sortingFn: (rowA, rowB, columnId) => {
					const a = Number(rowA.getValue(columnId) ?? 0);
					const b = Number(rowB.getValue(columnId) ?? 0);
					return a === b ? 0 : a < b ? -1 : 1;
				},
				minSize: 100,
				meta: {
					sortValue: 'TOTAL_USER',
					sortKey: 'totalUsers',
					omit: false,
					alignMent: 'right',
					style: { justifyContent: 'right !important' },
					isDynamic: true,
				},
			},

			// Active User
			{
				id: 'activeUsers',
				header: () => (
					<div className='report-title custom_right_head'>
						<div className='top_total'>
							<div className='report-header'>Active User</div>
							{totalSummary && (
								<div className='report-total'>
									{indianNumberFormat(totalSummary?.headerTotalActiveUser || 0)}
								</div>
							)}
						</div>
					</div>
				),
				accessorFn: (row) => Number(String(row.activeUsers ?? 0).replace(/[$,]/g, '') || 0),
				cell: ({ row }) => {
					const value = row.original?.activeUsers || 0;
					return <div className='report_column_box'>{indianNumberFormat(value)}</div>;
				},
				enableSorting: true,
				sortingFn: (rowA, rowB, columnId) => {
					const a = Number(rowA.getValue(columnId) ?? 0);
					const b = Number(rowB.getValue(columnId) ?? 0);
					return a === b ? 0 : a < b ? -1 : 1;
				},
				minSize: 100,
				meta: {
					sortValue: 'ACTIVE_USER',
					sortKey: 'activeUsers',
					omit: false,
					alignMent: 'right',
					style: { justifyContent: 'right !important' },
					isDynamic: true,
				},
			},
		],
		[totalSummary]
	);

	// local
	const user_id = localStorage.getItem('id');
	const user_token = localStorage.getItem('token');

	// campaign IDs from filter
	const finalCampaign = useMemo(
		() => filteredCampaign.map((item) => item.campaign_id),
		[filteredCampaign]
	);

	// totals helpers
	const createEmptyTotals = () => ({
		headerTotalAdRevenue: 0,
		headerTotalAdCost: 0,
		headerTotalUsers: 0,
		headerTotalActiveUser: 0,
		headerTotalROAS: 0,
	});

	const calculateTotalSummary = (data) => {
		const totals = createEmptyTotals();
		data.forEach((mergedItem) => {
			totals.headerTotalAdRevenue += Number(mergedItem?.totalAdRevenue) || 0;
			totals.headerTotalAdCost += Number(mergedItem?.advertiserAdCost) || 0;
			totals.headerTotalUsers += Number(mergedItem?.totalUsers) || 0;
			totals.headerTotalActiveUser += Number(mergedItem?.activeUsers) || 0;
			totals.headerTotalROAS =
				totals.headerTotalAdCost !== 0 ? totals.headerTotalAdRevenue / totals.headerTotalAdCost : 0;
		});
		return totals;
	};

	const finalFilterApp = useMemo(
		() => filteredApp.map((item) => item.app_auto_id).join(','),
		[filteredApp]
	);

	const mainFormData = useMemo(() => {
		const fd = new FormData();
		fd.append('user_id', user_id);
		fd.append('user_token', user_token);
		if (selectedGroup?.length > 0) {
			fd.append('gg_id', selectedGroup);
		}
		if (filterDate?.length > 0) {
			fd.append('analytics_date_range', `${selectedStartDate}-${selectedEndDate}`);
		}
		if (finalFilterApp?.length > 0 && filterAppList.length > 0) {
			fd.append('app_auto_id', finalFilterApp);
		}
		return fd;
	}, [finalFilterApp, filterAppList, selectedStartDate, selectedEndDate, selectedGroup]);

	//enable query
	const hasGroupSelected = selectedGroup != null && selectedGroup !== '';
	const hasAppFilterWhenNoGroup = !hasGroupSelected ? finalFilterApp?.length > 0 : true;
	const groupHasApps = hasGroupSelected && filterAppList?.length > 0;
	const appSelectionMatchesGroup =
		!groupHasApps ||
		(filteredApp?.length > 0 &&
			filterAppList.some((a) => a.app_auto_id === filteredApp[0]?.app_auto_id));

	const isQueryEnabled = hasValidDateRange && hasAppFilterWhenNoGroup && appSelectionMatchesGroup;

	//group query
	const groupPartForKey = finalFilterApp.length > 0 ? null : selectedGroup ?? null;

	const {
		data: appResponse,
		isSuccess: apiSuccess,
		isPending,
		isPlaceholderData,
		isFetching,
	} = useQueryFetch(
		[
			// 'group_select',
			'campaign-table',
			finalFilterApp,
			selectedStartDate,
			selectedEndDate,
			groupPartForKey,
		],
		'campaign-metrics',
		mainFormData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: isQueryEnabled,
			placeholderData: (prev) => prev,
		}
	);

	// handle API response
	useEffect(() => {
		if (!appResponse || !apiSuccess) return;

		if (appResponse?.status_code === 1) {
			const convertedData = [];
			const totals = createEmptyTotals();
			const apiData = appResponse?.data || [];

			apiData.forEach((app) => {
				const mergedMap = new Map();

				app?.data?.forEach((item) => {
					const key = item.firstUserCampaignId;
					mergedMap.set(key, {
						...item,
						totalAdRevenue: Number(item.totalAdRevenue) || 0,
						advertiserAdCost: Number(item.advertiserAdCost) || 0,
					});
				});

				app?.extra_data?.forEach((extraItem) => {
					const extra_key = extraItem.firstUserCampaignId;
					if (mergedMap.has(extra_key)) {
						const existingItem = mergedMap.get(extra_key);
						mergedMap.set(extra_key, {
							...existingItem,
							...extraItem,
							totalAdRevenue: Number(extraItem.totalAdRevenue) || existingItem.totalAdRevenue || 0,
							advertiserAdCost: Number(extraItem.advertiserAdCost) || existingItem.advertiserAdCost || 0,
						});
					}
				});

				mergedMap.forEach((mergedItem) => {
					totals.headerTotalAdRevenue += Number(mergedItem?.totalAdRevenue) || 0;
					totals.headerTotalAdCost += Number(mergedItem?.advertiserAdCost) || 0;
					totals.headerTotalUsers += Number(mergedItem?.totalUsers) || 0;
					totals.headerTotalActiveUser += Number(mergedItem?.activeUsers) || 0;
					totals.headerTotalROAS =
						totals.headerTotalAdCost !== 0 ? totals.headerTotalAdRevenue / totals.headerTotalAdCost : 0;

					convertedData.push({
						...mergedItem,
						roas:
							mergedItem?.advertiserAdCost !== 0
								? mergedItem?.totalAdRevenue / mergedItem?.advertiserAdCost
								: 0,
					});
				});
			});

			// attach campaign names
			convertedData.forEach((item) => {
				const campaign = filterCampaignList?.find((c) => c.campaign_id == item.firstUserCampaignId);
				if (campaign) item.firstUserCampaignName = campaign.campaign_name;
			});

			setMainData(convertedData);
			setInitialConvertedData(convertedData);

			if (finalCampaign.length > 0 && isDateClicked) {
				const filteredData = convertedData.filter((item) =>
					finalCampaign.some((id) => id == item.firstUserCampaignId)
				);
				setTotalSummary(calculateTotalSummary(filteredData));
			} else {
				setTotalSummary(totals);
			}
		}

		if (appResponse?.status_code === 0) {
			setMainData([]);
			setInitialConvertedData([]);
			setTotalSummary(createEmptyTotals());
		}
	}, [appResponse, apiSuccess, filterCampaignList, finalCampaign, isDateClicked]);

	useEffect(() => {
		if (!isCampaignApplied && !isClearClicked) return;

		if (finalCampaign.length > 0 && isCampaignApplied) {
			const filteredData = initialConvertedData.filter((item) =>
				finalCampaign.some((id) => id === item.firstUserCampaignId)
			);
			setMainData(filteredData);
			setTotalSummary(calculateTotalSummary(filteredData));
			setIsCampaignApplied(false);
		}

		if (finalCampaign.length === 0 && isClearClicked) {
			setMainData(initialConvertedData);
			setTotalSummary(calculateTotalSummary(initialConvertedData));
			setIsClearClicked(false);
		}
	}, [finalCampaign, isCampaignApplied, isClearClicked, initialConvertedData]);

	// const showMainLoader = isPending && !isPlaceholderData;
	// const showOverlayLoader = isFetching && isPlaceholderData;

	const hasAnyApp = filterAppList && filterAppList.length > 0;

const showMainLoader =
  hasAnyApp && isPending && !isPlaceholderData;

const showOverlayLoader =
  hasAnyApp && isFetching && isPlaceholderData;

	return (
		<div className='right-box-wrap custom_ads_ui'>
			<div className='table-box-wrap main-box-wrapper pdglr24 report-table-box'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='popup-full-wrapper reports-popup-box active'>
						<div className='action-bar-container report-page-topbar'>
							<div className='middle-section'>
								<div className='filter-bar-wrap'>
									<div className='filter-box statistics_filter'>
										<GeneralDateRange
											uniqueIdentifier={'main_campaign'}
											selectedStartDate={selectedStartDate}
											selectedEndDate={selectedEndDate}
											setIsTableLoaderVisible={setIsLoaderVisible}
											setMainDate={setFilterDate}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
											isDateClicked={isDateClicked}
											setIsDateClicked={setIsDateClicked}
										/>
										<GeneralSingleAppFilter
											uniqueIdentifier={'main_campaign'}
											filterAppList={filterAppList}
											selectedApp={filteredApp}
											setSelectedApp={setFilteredApp}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
											setMainLoader={setIsLoaderVisible}
											setIsDateClicked={setIsDateClicked}
										/>
										<GeneralCampaign
											uniqueIdentifier={'main_campaign'}
											filterPopupData={filterCampaignList}
											campaignId={filteredCampaign}
											setCampaignId={setFilteredCampaign}
											setIsLoaderVisible={setIsLoaderVisible}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
											analyticsApp={filteredApp}
											initialApp={filterAppList}
											setIsCampaignApplied={setIsCampaignApplied}
											setIsClearClicked={setIsClearClicked}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className='popup-full-box form-box-wrap form-wizard'>
							<div className='popup-box-wrapper report-table-popup-box'>
								<div className='box-wrapper table-container'>
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
										<GeneralTanStackTable
											data={mainData}
											columns={columns}
											enableResize={false}
											stickyColumns={1}
											enableVirtualization
											height={39 * 22}
											rowHeight={37}
											defaultSortColumn={'total_last_available'}
											variant='normal'
										/>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
});

export default CampaignBox;
