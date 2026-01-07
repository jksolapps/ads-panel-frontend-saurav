/** @format */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAppsApi from '../../hooks/useAppsApi';
import { Spinner } from 'react-bootstrap';
import { calculateColumnWidth, displayNumber, indianNumberFormat } from '../../utils/helper';
import { MdMoreVert } from 'react-icons/md';
import { CSVLink } from 'react-csv';
import { FiDownload } from 'react-icons/fi';
import moment from 'moment/moment';
import GeneralAppFilter from '../GeneralFilters/GeneralAppFilter';
import GeneralCountry from '../GeneralFilters/GeneralCountry';
import GeneralDataFilter from '../GeneralFilters/GeneralDataFilter';
import GeneralTinyFilter from '../GeneralFilters/GeneralTinyFilter';
import { monthly_analytics_metrics } from '../../utils/table_helper.json';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import useMonthlyAnalyticsColumns from './useMonthlyAnalyticsColumns';
import { LuInfo } from 'react-icons/lu';
import InfoModal from './InfoModal';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useGroupSettings } from '../../context/GroupSettingsContext';
import { useAppList } from '../../context/AppListContext';

const AnalyticsMonthBox = () => {
	const { selectedGroup } = useGroupSettings();

	const [hasTableData, setHasTableData] = useState(false);
	const [isWorkerProcessing, setIsWorkerProcessing] = useState(false);

	const [mainData, setMainData] = useState([]);
	const [rawData, setRawData] = useState([]);
	const [totals, setTotals] = useState({});
	const [monthlyTotal, setMonthlyTotal] = useState([]);
	const [csvData, setCsvData] = useState([]);

	const [fetchFlags, setFetchFlags] = useState(false);
	const [infoBoxShow, setInfoBoxShow] = useState(false);
	//app-filter
	const [checkedApp, setCheckedApp] = useState(() => {
		const stored = sessionStorage.getItem('monthly_analytics_app_filter');
		return stored ? JSON.parse(stored) : [];
	});

	//month range
	const finalMonthRange = useMemo(() => {
		const startDate = '01/01/2017';
		const endDate = moment().endOf('month').format('DD/MM/YYYY');
		return `${startDate}-${endDate}`;
	}, []);

	//metrics
	const [checkedMetrics, setCheckedMetrics] = useState(() => {
		const stored = sessionStorage.getItem('monthly_analytics_omit_columns');
		return stored ? JSON.parse(stored) : [];
	});

	// omit filter
	const ALL_METRICS = useMemo(
		() => (monthly_analytics_metrics || []).map((i) => i.item_name),
		[monthly_analytics_metrics]
	);

	const omittedColumnNames = useMemo(() => {
		const checkedSet = new Set((checkedMetrics || []).map((i) => i.item_name));
		return ALL_METRICS.filter((name) => !checkedSet.has(name));
	}, [ALL_METRICS, checkedMetrics]);

	//month filter
	const availableMonth = useMemo(
		() => Array.from(new Set(rawData?.data?.map((i) => i.csm_month))),
		[rawData]
	).reverse();
	const monthFilterList = useMemo(
		() =>
			availableMonth?.map((item, index) => {
				return {
					item_id: index + 1,
					item_name: moment(item, 'YYYYMM').format('MMM YY'),
					item_value: item,
				};
			}),
		[availableMonth]
	);
	const [selectedMonth, setSelectedMonth] = useState(() => {
		const stored = sessionStorage.getItem('monthly_analytics_month_filter');
		return stored ? JSON.parse(stored) : [];
	});

	//country filter
	const [countryValue, setCountryValue] = useState(() => {
		const stored = sessionStorage.getItem('monthly_analytics_country_filter');
		return stored ? JSON.parse(stored) : [];
	});

	const isMonthFilterSelected = useMemo(() => selectedMonth.length > 0, [selectedMonth]);
	const isMonthMetricsSelected = useMemo(
		() => checkedMetrics.some((item) => item.item_name == 'Month'),
		[checkedMetrics]
	);

	//Ref
	const workerRef = useRef(null);

	//worker
	useEffect(() => {
		workerRef.current = new Worker(new URL('../../workers/cohort.worker.js', import.meta.url), {
			type: 'module',
		});
		workerRef.current.onmessage = (e) => {
			const { type, payload } = e.data;
			if (type === 'dataProcessed') {
				const { finalData } = payload;
				const { result, totals, monthlyTotal, csvData } = finalData;
				setMainData(result);
				setTotals(totals);
				setMonthlyTotal(monthlyTotal);
				setCsvData(csvData || []);
				setIsWorkerProcessing(false);
			}
		};
		return () => {
			workerRef.current?.terminate();
			workerRef.current = null;
		};
	}, []);

	// Memoized values
	const finalApp = useMemo(() => checkedApp?.map((item) => item?.app_auto_id), [checkedApp]);
	const finalCountry = useMemo(() => countryValue?.map((item) => item?.alpha2_code), [countryValue]);

	//dimension
	const DIMENSION_KEYS = ['Apps', 'Country', 'Month'];
	const dimensionMap = {
		Apps: 'app_auto_id',
		Country: 'country',
		Month: 'month',
	};
	const finalDimension = useMemo(() => {
		let dims = [...DIMENSION_KEYS];
		if (Array.isArray(omittedColumnNames)) {
			dims = dims.filter((d) => !omittedColumnNames.includes(d));
		}
		return dims;
	}, [omittedColumnNames]);

	const monthlyDimension = useMemo(
		() => finalDimension.map((dim) => dimensionMap[dim] || dim),
		[finalDimension]
	);

	//campaign Filter Data
	const { campaignFilter: filterData } = useAppList();

	// Optimized formData
	const formData = useMemo(() => {
		const data = new FormData();
		data.append('user_id', localStorage.getItem('id'));
		data.append('user_token', localStorage.getItem('token'));
		if (selectedGroup?.length > 0) {
			data.append('gg_id', selectedGroup);
		}
		if (finalMonthRange) {
			data.append('analytics_date_range', finalMonthRange);
		}
		if (finalApp?.length > 0) {
			data.append('app_auto_id', finalApp.join(','));
		}
		if (finalCountry?.length > 0) {
			data.append('country', finalCountry.join(','));
		}
		if (monthlyDimension?.length > 0) {
			data.append('analytics_dimensions', monthlyDimension.join(','));
		}
		return data;
	}, [finalApp, finalMonthRange, monthlyDimension, finalCountry, selectedGroup]);

	const isQueryEnabled = !!filterData && monthlyDimension.length > 0;

	const {
		data: cohortResponse,
		isSuccess: cohortSuccess,
		isLoading: cohortIsLoading,
		isFetching: cohortIsFetching,
	} = useQueryFetch(
		['cohort-table', finalApp, monthlyDimension, omittedColumnNames, finalCountry, selectedGroup],
		'campaign-summary-by-month',
		formData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: isQueryEnabled,
			placeholderData: (prev) => prev,
		}
	);

	useEffect(() => {
		if (!isQueryEnabled) return;
		if (cohortIsLoading || cohortIsFetching) {
			setIsWorkerProcessing(true);
		}
	}, [cohortIsLoading, cohortIsFetching, isQueryEnabled]);

	useEffect(() => {
		if (!cohortSuccess || !cohortResponse) return;
		setRawData(cohortResponse);
		if (cohortResponse.status_code === 1) {
			setIsWorkerProcessing(true);
			workerRef.current?.postMessage({
				type: 'processData',
				payload: {
					apiResponseData: cohortResponse,
					filterData: filterData,
					monthRange: finalMonthRange,
					dimension: finalDimension,
					selectedMonth: selectedMonth,
				},
			});
		}
	}, [cohortSuccess, cohortResponse, selectedMonth]);

	const { columns } = useMonthlyAnalyticsColumns({
		mainData,
		totals,
		monthlyTotal,
		finalMonthRange,
		omittedColumnNames,
		selectedMonth,
		indianNumberFormat,
		displayNumber,
		calculateColumnWidth,
	});

	const showMainLoader = !hasTableData && isWorkerProcessing;
	const showOverlayLoader = hasTableData && isWorkerProcessing;

	return (
		<div className={`right-box-wrap monthly_analytics_wrap cohort_section`}>
			<div className='table-box-wrap main-box-wrapper pdglr24'>
				<div className='userBoxWrap user-section-wrapper '>
					<div className='popup-full-wrapper reports-popup-box active analytics-page-topbar'>
						<div className={`action-bar-container`}>
							<div className='middle-section'>
								<div className='filter-bar-wrap monthly_analytics_top_bar'>
									<div className={`filter-box analytics-filter-box `}>
										<GeneralAppFilter
											uniqueIdentifier={'monthly_analytics'}
											filterAppList={filterData?.list_apps}
											selectedApp={checkedApp}
											setSelectedApp={setCheckedApp}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
										/>
										<GeneralTinyFilter
											uniqueIdentifier={'monthly_analytics_metrics'}
											filterName='Metrics'
											className='analytics_metrics_filter'
											filterPopupData={monthly_analytics_metrics}
											finalSelectData={checkedMetrics}
											setFinalSelectData={setCheckedMetrics}
											fetchFlag={fetchFlags}
											setFetchFlag={setFetchFlags}
											isSingleSelect={false}
										/>
										<GeneralCountry
											uniqueIdentifier={'monthly_analytics'}
											countryValue={countryValue}
											setCountryValue={setCountryValue}
											fetchFlag={fetchFlags}
											setFetchFlag={setFetchFlags}
										/>
										<GeneralDataFilter
											uniqueIdentifier={'monthly_analytics_month'}
											className='analytics_month_filter'
											filterName='Month'
											filterPopupData={monthFilterList}
											finalSelectData={selectedMonth}
											setFinalSelectData={setSelectedMonth}
											fetchFlag={fetchFlags}
											setFetchFlag={setFetchFlags}
										/>
									</div>
								</div>
							</div>
							<div className='more-button three-icon-button'>
								<MdMoreVert className='material-icons' />
								<div className='more-box w-250 analytics_csv'>
									<div className='border-box'>
										{csvData?.length > 0 && (
											<CSVLink className='downloadbtn' filename='cohort.csv' data={csvData}>
												<span className='material-icons'>
													<FiDownload />
												</span>
												Download CSV
											</CSVLink>
										)}
									</div>
									<div className='border-box'>
										<div className='downloadbtn' onClick={() => setInfoBoxShow(true)}>
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
												columns={columns}
												onTableDataState={setHasTableData}
												enableResize={true}
												stickyColumns={6}
												enableVirtualization
												height={50 * 15 + 110}
												rowHeight={45}
												defaultSortColumn={isMonthMetricsSelected ? 'month' : 'totalCost'}
											/>
										</div>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
			<InfoModal show={infoBoxShow} onHide={() => setInfoBoxShow(false)} />
		</div>
	);
};

export default AnalyticsMonthBox;
