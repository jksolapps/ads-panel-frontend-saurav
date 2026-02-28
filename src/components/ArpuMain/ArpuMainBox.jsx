/** @format */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import useAppsApi from '../../hooks/useAppsApi';
import { setPlacementClass } from '../../utils/helper';
import GeneralCountry from '../GeneralFilters/GeneralCountry';
import GeneralAppFilter from '../GeneralFilters/GeneralAppFilter';
import GeneralDayColumnFilter from '../GeneralFilters/GeneralDayColumnFilter';
import { MdMoreVert } from 'react-icons/md';
import { RiExchangeDollarLine } from 'react-icons/ri';
import { useTableHover } from '../../hooks/useTableHover';
import { FiDownload } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import UserCountFilter from './UserCountFilter';
import GeneralTinyFilter from '../GeneralFilters/GeneralTinyFilter';
import { useLocation } from 'react-router-dom';
import { useARPUColumn } from './useARPUColumn';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import { useGroupSettings } from '../../context/GroupSettingsContext';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useAppList } from '../../context/AppListContext';

const ArpuMainBox = () => {
	//table
	const { selectedGroup } = useGroupSettings();
	const { state } = useLocation();
	const [fetchFlags, setFetchFlags] = useState(false);
	const [mainData, setMainData] = useState([]);
	const [minimumUser, setMinimumUser] = useState(() => {
		const stored = sessionStorage.getItem('retention_pp_minimum_user_filter');
		return stored ? JSON.parse(stored) : [];
	});

	const [hasTableData, setHasTableData] = useState(false);
	const [isWorkerProcessing, setIsWorkerProcessing] = useState(false);
	const [csvData, setCsvData] = useState([]);

	//app-filter
	const [retentionCheckedApp, setRetentionCheckedApp] = useState(() => {
		const stored = sessionStorage.getItem('retention_pp_app_filter');
		return stored ? JSON.parse(stored) : [];
	});

	//country filter
	const [countryValue, setCountryValue] = useState(() => {
		const stored = sessionStorage.getItem('retention_pp_country_filter');
		return stored ? JSON.parse(stored) : [];
	});

	//day column
	const localDayChecked = JSON.parse(sessionStorage.getItem('retention_pp_day_column_filter_new'));
	const [dayCheckedColumn, setDayCheckedColumn] = useState(localDayChecked ? localDayChecked : []);

	//metrics column
	const metricsList = [
		{
			item_id: 1,
			item_name: 'Retention',
			item_value: 'finalRetention',
			item_checked: false,
			item_key: 'asc_avg_retained_users_pct',
		},
		{
			item_id: 2,
			item_name: 'Total User',
			item_value: 'totalActiveUsers',
			item_checked: false,
			item_key: 'asc_total_retained_user',
		},
		{
			item_id: 3,
			item_name: 'Revenue',
			item_value: 'totalRevenue',
			item_checked: false,
			item_key: 'asc_total_revenue',
		},
		{
			item_id: 4,
			item_name: 'Cost',
			item_value: 'totalCost',
			item_checked: false,
			item_key: 'asc_cost',
		},
		{
			item_id: 5,
			item_name: 'ARPU',
			item_value: 'totalRevUser',
			item_checked: false,
			item_key: 'asc_avg_arpu',
		},
		{
			item_id: 6,
			item_name: 'Cumulative ARPU',
			item_value: 'dailyLTVRevenue',
			item_checked: true,
			item_key: 'cumulative_ltv_revenue',
		},
	];

	const localMetricsChecked = JSON.parse(sessionStorage.getItem('retention_pp_metrics_filter'));
	const [metricsCheckedColumn, setMetricsCheckedColumn] = useState(
		localMetricsChecked ? localMetricsChecked : []
	);

	//currency
	const [isDollarCheck, setIsDollarCheck] = useState(() => {
		const stored = localStorage.getItem('isDollarCheck');
		return stored === 'true';
	});

	// Optimized state
	const [columnWidths, setColumnWidths] = useState({});
	const [lastAvailableMap, setLastAvailableMap] = useState({});
	const [rowWiseTotal, setRowWiseTotal] = useState({});

	// Memoized values
	const finalApp = useMemo(
		() => retentionCheckedApp?.map((item) => item?.app_auto_id),
		[retentionCheckedApp]
	);
	const finalCountry = useMemo(() => countryValue.map((item) => item.alpha2_code), [countryValue]);
	const finalMinimumUser = useMemo(() => minimumUser.map((item) => item.value), [minimumUser]);
	const finalMetrics = useMemo(
		() => metricsCheckedColumn.map((item) => item.item_value),
		[metricsCheckedColumn]
	);

	const workerRef = useRef(null);

	useEffect(() => {
		workerRef.current = new Worker(new URL('../../workers/arpu.worker.js', import.meta.url), {
			type: 'module',
		});
		workerRef.current.onmessage = (e) => {
			const { type, payload } = e.data;
			if (type === 'retentionDataProcessed') {
				const { retentionData, maps, rowWiseTotals } = payload;
				setMainData(retentionData);
				setRowWiseTotal(rowWiseTotals);
				setColumnWidths(maps.columnWidths);
				setLastAvailableMap(maps.lastAvailableMap);
				setIsWorkerProcessing(false);
				setCsvData(payload.csvData || []);
			}
			if (type === 'recomputeWithDollarCheck') {
				const { maps, rowWiseTotals } = payload;
				setRowWiseTotal(rowWiseTotals);
				setColumnWidths(maps.columnWidths);
			}
		};
		return () => {
			workerRef.current?.terminate();
			workerRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (mainData.length && workerRef.current) {
			workerRef.current.postMessage({
				type: 'recomputeWithDollarCheck',
				payload: { isDollarCheck, finalMetrics },
			});
		}
	}, [isDollarCheck, finalMetrics]);

	//fetch app list
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

	// Optimized formData
	const formData = useMemo(() => {
		const data = new FormData();
		data.append('user_id', localStorage.getItem('id'));
		data.append('user_token', localStorage.getItem('token'));
		if (selectedGroup?.length > 0) {
			data.append('gg_id', selectedGroup);
		}
		if (finalApp?.length > 0) {
			data.append('app_auto_id', state?.app_auto_id != null ? state?.app_auto_id : finalApp.join(','));
		}
		if (finalCountry?.length > 0) {
			data.append('asc_country', finalCountry.join(','));
		}
		if (finalMinimumUser?.length > 0) {
			data.append('min_users', finalMinimumUser.join(','));
		}
		return data;
	}, [finalApp, finalCountry, finalMinimumUser, selectedGroup]);

	const isQueryEnabled = !!filterData && finalMinimumUser.length > 0;

	const {
		data: apiResponse,
		isSuccess: apiSuccess,
		isLoading,
		isFetching,
	} = useQueryFetch(
		['arpu-main-table', 'group_select', finalApp, finalCountry, finalMinimumUser, selectedGroup],
		'retention-data-new',
		formData,
		{
			staleTime: 6 * 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: isQueryEnabled,
		}
	);
	useEffect(() => {
		if (!isQueryEnabled) return;
		if (isLoading || isFetching) {
			setIsWorkerProcessing(true);
		}
	}, [isLoading, isFetching, isQueryEnabled]);

	useEffect(() => {
		if (!apiResponse || !apiSuccess) return;
		if (apiResponse.status_code === 1) {
			setIsWorkerProcessing(true);
			workerRef.current?.postMessage({
				type: 'processRetentionData',
				payload: {
					apiResponseData: apiResponse.data,
					filterData,
					isDollarCheck,
					finalMetrics,
					dayCheckedColumn,
				},
			});
		}
	}, [apiSuccess, apiResponse, finalMetrics, dayCheckedColumn]);

	const handleCurrencyCheck = useCallback(() => {
		setIsDollarCheck((prev) => {
			const newValue = !prev;
			localStorage.setItem('isDollarCheck', newValue);
			return newValue;
		});
	}, []);

	const tanStackColumns = useARPUColumn({
		mainData,
		dayCheckedColumn,
		isDollarCheck,
		columnWidths,
		lastAvailableMap,
		rowWiseTotal,
		finalMetrics,
		setPlacementClass,
	});

	const showMainLoader = !hasTableData && isWorkerProcessing;
	const showOverlayLoader = hasTableData && isWorkerProcessing;

	return (
		<div
			className={`right-box-wrap retention_pp_wrap ${mainData?.length > 400 ? 'pagination_on' : ''}`}
		>
			<div className='table-box-wrap main-box-wrapper pdglr24 retention_table_wrap'>
				<div className='userBoxWrap user-section-wrapper '>
					<div className='popup-full-wrapper reports-popup-box active analytics-page-topbar'>
						<div className='action-bar-container'>
							<div className='middle-section'>
								<div className='filter-bar-wrap'>
									<div className={`filter-box analytics-filter-box`}>
										<GeneralAppFilter
											uniqueIdentifier={'retention_pp'}
											filterAppList={filterData?.list_apps}
											selectedApp={retentionCheckedApp}
											setSelectedApp={setRetentionCheckedApp}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
										/>
										<GeneralCountry
											uniqueIdentifier={'retention_pp'}
											countryValue={countryValue}
											setCountryValue={setCountryValue}
										/>
										<GeneralDayColumnFilter
											uniqueIdentifier='retention_pp'
											columnCount={180}
											dayCheckedColumn={dayCheckedColumn}
											setDayCheckedColumn={setDayCheckedColumn}
										/>
										<UserCountFilter
											uniqueIdentifier={'retention_pp'}
											minimumUser={minimumUser}
											setMinimumUser={setMinimumUser}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
										/>
										<GeneralTinyFilter
											uniqueIdentifier={'retention_pp_metrics'}
											filterName='Metrics'
											filterPopupData={metricsList}
											finalSelectData={metricsCheckedColumn}
											setFinalSelectData={setMetricsCheckedColumn}
											fetchFlag={fetchFlags}
											setFetchFlag={setFetchFlags}
										/>
									</div>
								</div>
							</div>
							<div className='more-button three-icon-button'>
								<MdMoreVert className='material-icons' />
								<div className='more-box analytics_csv arpu_csv'>
									<div className='border-box'>
										{csvData?.length > 0 && (
											<CSVLink className='downloadbtn' filename='arpu.csv' data={csvData}>
												<span className='material-icons'>
													<FiDownload />
												</span>
												Download CSV
											</CSVLink>
										)}
									</div>
									<div className='border-box usd_dollar_padding'>
										<div className='border-box-icon'>
											<RiExchangeDollarLine color='#5f6368' size={22} />
											<span className='show-button'>USD</span>
										</div>
										<label className='switch toggle-icon' style={{ position: 'relative' }}>
											<input
												type='checkbox'
												id='checkbox'
												onChange={handleCurrencyCheck}
												checked={isDollarCheck}
											/>
											<div className='slider round'></div>
										</label>
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
									)}
									<div className={`popup-box-wrapper analytics-container analytics-popup-box`}>
										<div className={`box-wrapper table-container analytics-table analytics-campaign-table`}>
											<GeneralTanStackTable
												data={mainData}
												columns={tanStackColumns}
												onTableDataState={setHasTableData}
												enableResize={true}
												stickyColumns={4}
												enableVirtualization
												height={39 * 22}
												rowHeight={38}
												defaultSortColumn={'total_last_available'}
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

export default ArpuMainBox;
