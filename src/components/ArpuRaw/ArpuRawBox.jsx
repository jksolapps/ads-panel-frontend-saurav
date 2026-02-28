/** @format */

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Spinner } from 'react-bootstrap';
import GeneralDateRange from '../GeneralFilters/GeneralDateRange';
import useAppsApi from '../../hooks/useAppsApi';
import { setPlacementClass } from '../../utils/helper';
import GeneralSingleAppFilter from '../GeneralFilters/GeneralSingleAppFilter';
import GeneralCountry from '../GeneralFilters/GeneralCountry';
import GeneralDayColumnFilter from '../GeneralFilters/GeneralDayColumnFilter';
import { MdMoreVert } from 'react-icons/md';
import { RiExchangeDollarLine } from 'react-icons/ri';
import { CSVLink } from 'react-csv';
import { FiDownload } from 'react-icons/fi';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import useARPURawColumn from './useARPURawColumn';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useGroupSettings } from '../../context/GroupSettingsContext';
import { useAppList } from '../../context/AppListContext';

const ArpuRawBox = () => {
	const { selectedGroup } = useGroupSettings();
	const { state } = useLocation();
	const [fetchFlags, setFetchFlags] = useState(false);
	const [mainData, setMainData] = useState([]);
	const [filterDate, setFilterDate] = useState(() => {
		const stored = sessionStorage.getItem('retention_raw_date_range');
		return stored ? JSON.parse(stored) : [];
	});
	const [isDateClicked, setIsDateClicked] = useState(false);

	const [hasTableData, setHasTableData] = useState(false);
	const [isWorkerProcessing, setIsWorkerProcessing] = useState(false);
	const [csvData, setCsvData] = useState([]);

	const [retentionCheckedApp, setRetentionCheckedApp] = useState(() => {
		const stored = sessionStorage.getItem('retention_raw_app_filter');
		return stored ? JSON.parse(stored) : [];
	});

	const [isFilterDataLoaded, setIsFilterDataLoaded] = useState(false);
	const [countryValue, setCountryValue] = useState(() => {
		const stored = sessionStorage.getItem('retention_raw_country_filter');
		return stored ? JSON.parse(stored) : [];
	});

	const [dayCheckedColumn, setDayCheckedColumn] = useState(() => {
		const stored = sessionStorage.getItem('retention_raw_day_column_filter_new');
		return stored ? JSON.parse(stored) : [];
	});
	const [currentPage, setCurrentPage] = useState(1);
	const [isDollarCheck, setIsDollarCheck] = useState(
		() => localStorage.getItem('isRawDollarCheck') === 'true'
	);
	const [averageRetention, setAverageRetention] = useState([]);
	const [totalSummary, setTotalSummary] = useState({});
	const [columnWidths, setColumnWidths] = useState({});
	const [lastAvailableMap, setLastAvailableMap] = useState({});
	const [rowWiseTotal, setRowWiseTotal] = useState([]);

	const workerRef = useRef(null);

	useEffect(() => {
		workerRef.current = new Worker(new URL('../../workers/arpu_raw.worker.js', import.meta.url), {
			type: 'module',
		});

		workerRef.current.onmessage = (e) => {
			const { type, payload } = e.data;
			if (type === 'arpuDataProcessed') {
				setMainData(payload.processed);
				setAverageRetention(payload.averageRetention);
				setTotalSummary(payload.totalSummary);
				setColumnWidths(payload.columnWidths);
				setLastAvailableMap(payload.lastAvailableMap);
				setRowWiseTotal(payload.rowWiseTotals);
				setCsvData(payload.csvData || []);
				setIsWorkerProcessing(false);
			}
		};
		return () => {
			workerRef.current?.terminate();
			workerRef.current = null;
		};
	}, []);

	const hasValidDateRange =
		Array.isArray(filterDate) && filterDate[0]?.startDate && filterDate[0]?.endDate;
	const selectedStartDate = useMemo(
		() => (filterDate[0]?.startDate ? moment(filterDate[0].startDate).format('DD/MM/YYYY') : ''),
		[filterDate]
	);

	const selectedEndDate = useMemo(
		() => (filterDate[0]?.endDate ? moment(filterDate[0].endDate).format('DD/MM/YYYY') : ''),
		[filterDate]
	);
	const finalAppId = useMemo(
		() => retentionCheckedApp?.map((item) => item.app_auto_id).join(','),
		[retentionCheckedApp]
	);
	const finalCountry = useMemo(() => countryValue?.map((item) => item?.alpha2_code), [countryValue]);

	//fetch app list
	const { campaignFilter } = useAppList();
	// const filterData = campaignFilter?.list_apps;
	const filterData = useMemo(() => {
  return campaignFilter?.list_apps?.filter(
    (app) => Number(app.app_visibility) === 1
  ) || [];
}, [campaignFilter]);

	useEffect(() => {
		if (!isFilterDataLoaded && filterData) {
			setIsFilterDataLoaded(true);
		}
	}, [filterData]);

	const formData = useMemo(() => {
		const data = new FormData();
		data.append('user_id', localStorage.getItem('id'));
		data.append('user_token', localStorage.getItem('token'));
		if (selectedGroup) {
			data.append('gg_id', selectedGroup);
		}
		if (filterDate?.length > 0) {
			data.append('date_range', `${selectedStartDate}-${selectedEndDate}`);
		}
		if (finalAppId?.length > 0 && filterData?.length > 0) {
			data.append('app_auto_id', state?.app_auto_id != null ? state?.app_auto_id : finalAppId);
		}
		if (finalCountry.length > 0) {
			data.append('country', finalCountry.join(','));
		}
		return data;
	}, [selectedStartDate, selectedEndDate, finalAppId, filterData, finalCountry, selectedGroup]);

	//enable query
	const hasGroupSelected = selectedGroup != null && selectedGroup !== '';
	const hasAppFilterWhenNoGroup = !hasGroupSelected ? finalAppId?.length > 0 : true;
	const groupHasApps = hasGroupSelected && filterData?.length > 0;
	const appSelectionMatchesGroup =
		!groupHasApps ||
		(retentionCheckedApp?.length > 0 &&
			filterData.some((a) => a.app_auto_id === retentionCheckedApp[0]?.app_auto_id));

	const requiresCountryForFirstLoad = mainData.length === 0;
	const hasCountryOrNotRequired = !requiresCountryForFirstLoad || finalCountry.length > 0;

	const isQueryEnabled =
		hasValidDateRange &&
		hasAppFilterWhenNoGroup &&
		appSelectionMatchesGroup &&
		hasCountryOrNotRequired;

	//group query
	const groupPartForKey = finalAppId.length > 0 ? null : selectedGroup ?? null;

	const {
		data: apiResponse,
		isSuccess: apiSuccess,
		isFetching,
		isLoading,
	} = useQueryFetch(
		[
			'arpu-raw-table',
			finalAppId,
			selectedStartDate,
			selectedEndDate,
			finalCountry,
			finalAppId,
			groupPartForKey,
		],
		'retention-data-row',
		formData,
		{
			staleTime: 30 * 60 * 1000,
			refetchOnMount: 'ifStale',
			enabled: isQueryEnabled,
			placeholderData: (prev) => prev,
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
				type: 'processArpuData',
				payload: {
					apiResponseData: apiResponse,
					selectedStartDate,
					finalAppId,
					filterData,
					isDollarCheck,
					finalCountry,
					dayCheckedColumn,
				},
			});
		}
	}, [apiSuccess, filterData, apiResponse, dayCheckedColumn]);

	//csv download

	const handleCurrencyCheck = useCallback(() => {
		setIsDollarCheck((prev) => {
			const newValue = !prev;
			localStorage.setItem('isRawDollarCheck', newValue);
			return newValue;
		});
	}, []);

	const { columns } = useARPURawColumn({
		mainData,
		averageRetention,
		dayCheckedColumn,
		totalSummary,
		rowWiseTotal,
		isDollarCheck,
		columnWidths,
		setPlacementClass,
	});

	const showMainLoader = !hasTableData && isWorkerProcessing;
	const showOverlayLoader = hasTableData && isWorkerProcessing;

	return (
		<div
			className={`right-box-wrap retention_pp_wrap ${mainData.length > 400 ? 'pagination_on' : ''}`}
		>
			<div className='table-box-wrap main-box-wrapper pdglr24 retention_table_wrap'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='popup-full-wrapper reports-popup-box active analytics-page-topbar'>
						<div className='action-bar-container'>
							<div className='middle-section'>
								<div className='filter-bar-wrap'>
									<div className='filter-box analytics-filter-box'>
										<GeneralDateRange
											uniqueIdentifier='retention_raw'
											selectedStartDate={selectedStartDate}
											selectedEndDate={selectedEndDate}
											setMainDate={setFilterDate}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
											isDateClicked={isDateClicked}
											setIsDateClicked={setIsDateClicked}
										/>
										<GeneralSingleAppFilter
											uniqueIdentifier='retention_raw'
											filterAppList={filterData}
											selectedApp={retentionCheckedApp}
											setSelectedApp={setRetentionCheckedApp}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
										/>
										<GeneralCountry
											uniqueIdentifier='retention_raw'
											countryValue={countryValue}
											setCountryValue={setCountryValue}
											fetchFlag={fetchFlags}
											setFetchFlag={setFetchFlags}
										/>
										<GeneralDayColumnFilter
											uniqueIdentifier='retention_raw'
											columnCount={180}
											dayCheckedColumn={dayCheckedColumn}
											setDayCheckedColumn={setDayCheckedColumn}
											setPageNumber={setCurrentPage}
										/>
									</div>
								</div>
							</div>
							<div className='more-button three-icon-button'>
								<MdMoreVert className='material-icons' />
								<div className='more-box analytics_csv arpu_csv'>
									<div className='border-box'>
										{csvData?.length > 0 && (
											<CSVLink className='downloadbtn' filename='arpu-raw.csv' data={csvData}>
												<span className='material-icons'>
													<FiDownload />
												</span>
												Download CSV
											</CSVLink>
										)}
									</div>
									<div className='border-box usd_dollar_padding'>
										<div className='border-box-icon'>
											<RiExchangeDollarLine color='#3c434aff' size={22} />
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
							<div className='popup-full-box form-box-wrap form-wizard analytics-popup-box'>
								{showOverlayLoader && (
									<div className='shimmer-spinner overlay-spinner'>
										<Spinner animation='border' variant='secondary' />
									</div>
								)}
								<div className='popup-box-wrapper analytics-container analytics-popup-box'>
									<div className='box-wrapper table-container analytics-table analytics-campaign-table'>
										<GeneralTanStackTable
											data={mainData}
											columns={columns}
											onTableDataState={setHasTableData}
											enableResize={true}
											stickyColumns={5}
											enableVirtualization
											height={39 * 22}
											rowHeight={38}
											defaultSortColumn={'total_last_available'}
										/>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ArpuRawBox;
