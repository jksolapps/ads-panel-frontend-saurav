/** @format */

import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { MdClose, MdMoreVert } from 'react-icons/md';
import { FiDownload } from 'react-icons/fi';
import { IoEyeOff } from 'react-icons/io5';

import { indianNumberFormat } from '../../utils/helper';
import { single_report_dimension } from '../../utils/table_helper.json';

import ColumnDropdown from './Filters/ColumnDropdown';
import SecondColumnFilter from './Filters/SecondColumnFilter';
import ColumnOmitModal from './Filters/ColumnOmitModal';

import { useQueryFetch } from '../../hooks/useQueryFetch';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import { useTanStackTableHover } from '../../hooks/useTanStackTableHover';
import { CSVLink } from 'react-csv';
import { dynamicColumnWidthCal } from '../../utils/pureHelper';
import Tippy from '@tippyjs/react';

const makeWorker = () => {
	return new Worker(new URL('../../workers/app_details.worker.js', import.meta.url), {
		type: 'module',
	});
};

const parseMoney = (v) => {
	if (v == null) return 0;
	const n = Number(String(v).replace(/[$,]/g, ''));
	return Number.isFinite(n) ? n : 0;
};

const parseIntSafe = (v) => {
	if (v == null) return 0;
	const n = Number(String(v).replace(/,/g, ''));
	return Number.isFinite(n) ? n : 0;
};

const parsePercent = (v) => {
	if (v == null) return 0;
	const n = Number(String(v).replace('%', ''));
	return Number.isFinite(n) ? n : 0;
};

function extractVersionParts(versionString) {
	const m = String(versionString ?? '').match(/(\d+)\.(\d+)\.(\d+)/);
	if (!m) return null;
	return [Number(m[1]), Number(m[2]), Number(m[3])];
}
function versionToSortableInt(parts) {
	if (!parts) return 0;
	return (parts[0] || 0) * 1_000_000 + (parts[1] || 0) * 1_000 + (parts[2] || 0);
}

const AppDetailsTable = ({ appId, appInfo }) => {
	const [singleReportData, setSingleReportData] = useState([]);
	const [searchData, setSearchData] = useState([]);
	const [csvData, setCsvData] = useState([]); // keep: used as payload for CSV build
	const [totalRecordsData, setTotalRecordsData] = useState(null);

	// header/dimension states
	const [firstColumnDimension, setFirstColumnDimension] = useState('MONTH');
	const [secondColumnDimension, setSecondColumnDimension] = useState(null);
	const [availableFilters, setAvailableFilters] = useState(single_report_dimension);

	// dropdown open states
	const [isOpen, setIsOpen] = useState(false);
	const [secondIsOpen, setSecondIsOpen] = useState(false);
	const [secondArrow, setSecondArrow] = useState(false);

	// modal
	const [omitModalShow, setOmitModalShow] = useState(false);

	// search
	const [searchText, setSearchText] = useState('');
	const timeoutRef = useRef(null);

	// loader overlay
	const [isLoaderVisible, setIsLoaderVisible] = useState(false);
	const [fetchFlag, setFetchFlag] = useState(false);

	const monthYearOnlyColumnIds = [
	'ACTIVE_USER',
	'ARPU',
	'IMPR_PER_USER',
];

	const isOnlyMonthYearSelected = useMemo(() => {
		return (
			(firstColumnDimension === 'MONTH' || firstColumnDimension === 'YEAR') &&
			!secondColumnDimension &&
			appInfo?.app_info?.is_app_property == '1'
		);
	}, [firstColumnDimension, secondColumnDimension, appInfo]);

	const isMonthOrYearOnly = useMemo(() => {
	return (
		(firstColumnDimension === 'MONTH' || firstColumnDimension === 'YEAR' || firstColumnDimension === 'WEEK') &&
		!secondColumnDimension
	);
}, [firstColumnDimension, secondColumnDimension]);

	// ---- Column visibility map ----
	const [columnVisibility, setColumnVisibility] = useState({
		AD_COST: isOnlyMonthYearSelected,
		ESTIMATED_EARNINGS: true,
		ROAS: isOnlyMonthYearSelected,
		CUMULATIVE_EARNINGS: false,
		CUMULATIVE_ROAS: false,
		PROFIT: isOnlyMonthYearSelected,

		ACTIVE_USER: false,
		ARPU: false,
		IMPR_PER_USER: false,
		ARPDAU: false,
		DAU_AV: false,
		AV_RATE: false,

		IMPRESSION_RPM: true,
		AD_REQUESTS: true,
		MATCH_RATE: true,
		IMPRESSIONS: true,
		SHOW_RATE: true,
		CLICKS: true,
		IMPRESSION_CTR: true,
	});

	useEffect(() => {
		setColumnVisibility((prev) => ({
			...prev,
			AD_COST: isOnlyMonthYearSelected,
			ROAS: isOnlyMonthYearSelected,
			PROFIT: isOnlyMonthYearSelected,

			ACTIVE_USER: isMonthOrYearOnly,
			ARPU: isMonthOrYearOnly,
			IMPR_PER_USER: isMonthOrYearOnly,

			ARPDAU: isMonthOrYearOnly,
			DAU_AV: isMonthOrYearOnly,
			AV_RATE: isMonthOrYearOnly,

		}));
	}, [isOnlyMonthYearSelected, isMonthOrYearOnly]);

	// ---------------- fetch ----------------
	const user_id = localStorage.getItem('id');
	const user_token = localStorage.getItem('token');

	const convertYearToMonth = (dimension) => (dimension?.includes('YEAR') ? 'MONTH' : dimension);

	const finalDimension = useMemo(() => {
		return secondColumnDimension
			? `${convertYearToMonth(firstColumnDimension)},${convertYearToMonth(secondColumnDimension)}`
			: convertYearToMonth(firstColumnDimension);
	}, [firstColumnDimension, secondColumnDimension]);

	// Map current table visibility to CSV keys for worker
	const visibleCsvKeys = useMemo(() => ({
		cost: Boolean(columnVisibility.AD_COST),
		estimated_earnings: Boolean(columnVisibility.ESTIMATED_EARNINGS),
		roas: Boolean(columnVisibility.ROAS),
		fsr: Boolean(columnVisibility.CUMULATIVE_EARNINGS),
		cumulative_roas: Boolean(columnVisibility.CUMULATIVE_ROAS),
		profit: Boolean(columnVisibility.PROFIT),

		observed_ecpm: Boolean(columnVisibility.IMPRESSION_RPM),
		ad_requests: Boolean(columnVisibility.AD_REQUESTS),
		match_rate: Boolean(columnVisibility.MATCH_RATE),
		impressions: Boolean(columnVisibility.IMPRESSIONS),
		show_rate: Boolean(columnVisibility.SHOW_RATE),
		clicks: Boolean(columnVisibility.CLICKS),
		impression_ctr: Boolean(columnVisibility.IMPRESSION_CTR),

		active_users: Boolean(columnVisibility.ACTIVE_USER),
		arpu: Boolean(columnVisibility.ARPU),
		arpdau: Boolean(columnVisibility.ARPDAU),
		dau_av: Boolean(columnVisibility.DAU_AV),
		av_rate: Boolean(columnVisibility.AV_RATE),
		impr_per_user: Boolean(columnVisibility.IMPR_PER_USER),
	}), [columnVisibility]);

	const formData = useMemo(() => {
		const fd = new FormData();
		fd.append('user_id', user_id);
		fd.append('user_token', user_token);
		fd.append('selected_apps', appId);
		fd.append('selected_dimension', finalDimension);
		return fd;
	}, [appId, finalDimension, user_id, user_token]);

	const {
		data: apiResponse,
		isSuccess: apiSucesss,
		isFetching,
	} = useQueryFetch(
		['report-single-app', appId, firstColumnDimension, secondColumnDimension],
		'analytics-report-single-app',
		formData,
		{
			enabled: !!appId,
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
		}
	);

	const workerRef = useRef(null);
	const reqIdRef = useRef(0);

	useEffect(() => {
		const w = makeWorker();
		workerRef.current = w;
		w.onmessage = (e) => {
			const { type, requestId, data } = e.data || {};
			if (requestId !== reqIdRef.current) return;

			if (type === 'PROCESS_TABLE_DONE') {
				setSingleReportData(data.filtered);
				setCsvData(data.finalCsvData);
				setTotalRecordsData(data.totals);
				setIsLoaderVisible(false);
				return;
			}
			if (type === 'ERROR') {
				setIsLoaderVisible(false);
			}
		};
		return () => {
			w.terminate();
			workerRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (!apiResponse || !apiSucesss) return;

		if (apiResponse?.status_code == 1) {
			const aaData = apiResponse?.aaData || [];
			setSearchData(aaData);

			if (workerRef.current) {
				setIsLoaderVisible(true);
				reqIdRef.current += 1;

				workerRef.current.postMessage({
					type: 'PROCESS_TABLE',
					requestId: reqIdRef.current,
					payload: {
						aaData,
						firstColumnDimension,
						secondColumnDimension,
						isOnlyMonthYearSelected,
						visibleCsvKeys,
						searchText,
					},
				});
			}
		}
	}, [apiResponse, apiSucesss, firstColumnDimension, secondColumnDimension]);

	// search handlers
	const handleSearch = (e) => {
		const query = e?.target?.value ?? '';
		setSearchText(query);

		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		timeoutRef.current = setTimeout(() => {
			if (workerRef.current) {
				setIsLoaderVisible(true);
				reqIdRef.current += 1;

				workerRef.current.postMessage({
					type: 'PROCESS_TABLE',
					requestId: reqIdRef.current,
					payload: {
						aaData: searchData,
						firstColumnDimension,
						secondColumnDimension,
						isOnlyMonthYearSelected,
						visibleCsvKeys,
						searchText: query,
					},
				});
			}
		}, 350);
	};

	const handleSearchClose = () => {
		const query = '';
		setSearchText(query);
		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		if (workerRef.current) {
			setIsLoaderVisible(true);
			reqIdRef.current += 1;

			workerRef.current.postMessage({
				type: 'PROCESS_TABLE',
				requestId: reqIdRef.current,
				payload: {
					aaData: searchData,
					firstColumnDimension,
					secondColumnDimension,
					isOnlyMonthYearSelected,
					visibleCsvKeys,
					searchText: query,
				},
			});
		}
	};

	// Recompute CSV/rows when visibility changes so hidden columns are excluded and metrics populate
	useEffect(() => {
		if (!workerRef.current) return;
		setIsLoaderVisible(true);
		reqIdRef.current += 1;
		workerRef.current.postMessage({
			type: 'PROCESS_TABLE',
			requestId: reqIdRef.current,
			payload: {
				aaData: searchData || [],
				firstColumnDimension,
				secondColumnDimension,
				isOnlyMonthYearSelected,
				visibleCsvKeys,
				searchText,
			},
		});
	}, [visibleCsvKeys]);

	// ---------------- TanStack columns ----------------
	const dimensionHeaderWidth = (dim) => {
		switch (dim) {
			case 'MONTH':
			case 'WEEK':
			case 'YEAR':
				return 120;
			case 'AD_UNIT':
				return 130;
			case 'COUNTRY':
			case 'FORMAT':
				return 140;
			case 'MOBILE_OS_VERSION':
			case 'GMA_SDK_VERSION':
				return 195;
			case 'APP_VERSION_NAME':
				return 155;
			default:
				return 110;
		}
	};

	const dimensionValueLabel = (dim, row) => {
		switch (dim) {
			case 'MONTH':
				return moment(row.report_date, 'YYYYMM').format('MMM YY') || '-';
			case 'WEEK':
				return moment(row.report_date, 'YYYYMMDD').format('YYYY[W]WW') || '-';
			case 'YEAR':
				return moment(row.report_date, 'YYYYMMDD').format('YYYY') || '-';
			case 'AD_UNIT':
				return row.au_display_name ?? '-';
			case 'COUNTRY':
				return row.country_name ?? '-';
			case 'FORMAT':
				return row.au_format ?? '-';
			case 'MOBILE_OS_VERSION':
				return row.mobile_os_version ?? '-';
			case 'GMA_SDK_VERSION':
				return row.gma_sdk_version ?? '-';
			case 'APP_VERSION_NAME':
				return row.app_version ?? '-';
			default:
				return '-';
		}
	};

	const dimensionSortValue = (dim, row) => {
		switch (dim) {
			case 'MONTH':
				return Number(row.report_date) || 0;
			case 'WEEK':
				return moment(row.report_date, 'YYYYMMDD').valueOf() || 0;
			case 'YEAR':
				return Number(moment(row.report_date, 'YYYYMMDD').format('YYYY')) || 0;
			case 'GMA_SDK_VERSION':
				return versionToSortableInt(extractVersionParts(row.gma_sdk_version));
			case 'MOBILE_OS_VERSION':
				return versionToSortableInt(extractVersionParts(row.mobile_os_version));
			case 'APP_VERSION_NAME': {
				const m = String(row.app_version ?? '').match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?$/);
				if (!m) return 0;
				return versionToSortableInt([Number(m[1] || 0), Number(m[2] || 0), Number(m[3] || 0)]);
			}
			default:
				return String(dimensionValueLabel(dim, row) ?? '').toLowerCase();
		}
	};

	const tanstackColumns = useMemo(() => {
		const colFirstId = `FirstColumn_${firstColumnDimension}`;
		const colSecondId = `ExtraColumn_${secondColumnDimension || 'none'}`;

		const firstCol = {
			id: colFirstId,
			accessorFn: (row) => dimensionSortValue(firstColumnDimension, row),
			header: () => (
				<div className='dimension-column custom_report_column'>
					<ColumnDropdown
						columnName={firstColumnDimension}
						setIsLoaderVisible={setIsLoaderVisible}
						availableFilters={availableFilters}
						setAvailableFilters={setAvailableFilters}
						isOpen={isOpen}
						setIsOpen={setIsOpen}
						secondIsOpen={secondIsOpen}
						setSecondIsOpen={setSecondIsOpen}
						firstColumnDimension={firstColumnDimension}
						setFirstColumnDimension={setFirstColumnDimension}
						secondColumnDimension={secondColumnDimension}
						setSecondColumnDimension={setSecondColumnDimension}
						fetchFlag={fetchFlag}
						setFetchFlag={setFetchFlag}
					/>
				</div>
			),
			cell: ({ row }) => {
				const v = dimensionValueLabel(firstColumnDimension, row.original);
				return (
					<div className='report_column_box custom_word_ellipsis'>
						<div className='report_main_value' title={v}>
							{v}
						</div>
					</div>
				);
			},
			size: dimensionHeaderWidth(firstColumnDimension),
			meta: { alignMent: 'center', headerClassName: 'custom_report_column' },
			sortingFn: 'basic',
		};

		const secondCol = {
			id: colSecondId,
			accessorFn: (row) =>
				secondColumnDimension ? dimensionSortValue(secondColumnDimension, row) : '',
			header: () => (
				<div className='dimension-column extra_column custom_report_column'>
					<SecondColumnFilter
						columnName={secondColumnDimension || '( No Select )'}
						setIsLoaderVisible={setIsLoaderVisible}
						availableFilters={availableFilters}
						setAvailableFilters={setAvailableFilters}
						secondArrow={secondArrow}
						setSecondArrow={setSecondArrow}
						firstColumnDimension={firstColumnDimension}
						setFirstColumnDimension={setFirstColumnDimension}
						secondColumnDimension={secondColumnDimension}
						setSecondColumnDimension={setSecondColumnDimension}
						fetchFlag={fetchFlag}
						setFetchFlag={setFetchFlag}
						setSearchText={setSearchText}
					/>
				</div>
			),
			cell: ({ row }) => {
				const v = secondColumnDimension
					? dimensionValueLabel(secondColumnDimension, row.original)
					: '(not set)';
				return (
					<div className='report_column_box custom_word_ellipsis'>
						<div className='report_main_value' title={v}>
							{v}
						</div>
					</div>
				);
			},
			size: secondColumnDimension ? dimensionHeaderWidth(secondColumnDimension) : 130,
			meta: {
				alignMent: 'center',
				headerClassName: 'custom_report_column',
				omit: !secondColumnDimension,
			},
			sortingFn: 'basic',
		};

		const headerWithTotal = (title, total) => (
			<div className='report-title custom_right_head'>
				<div className='top_total'>
					<div className='report-header'>{title}</div>
					<div className='report-total'>{total}</div>
				</div>
			</div>
		);

		const cols = [
			firstCol,
			secondCol,

			{
				id: 'AD_COST',
				accessorFn: (row) => parseMoney(row.cost),
				header: () =>
					totalRecordsData ? (
						headerWithTotal('Cost', indianNumberFormat(totalRecordsData.total_cost))
					) : (
						<div className='report-title custom_right_head'>Cost</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box'>
						{row.original?.cost ? indianNumberFormat(row.original.cost) : '$0.00'}
					</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_cost,
					minWidth: 125,
				}),
				meta: {
					alignMent: 'right',
					isDynamic: true,
					omit: !columnVisibility.AD_COST,
				},
			},

			{
				id: 'ESTIMATED_EARNINGS',
				accessorFn: (row) => parseMoney(row.estimated_earnings),
				header: () =>
					totalRecordsData ? (
						<Tippy
							content={'Actual Earnings'}
							placement='top'
							duration={0}
							offset={[0, 0]}
							className='custom_black_tippy'
						>
							<div className='report-title custom_right_head'>
								<div className='top_total'>
									<div className='report-header hover_tooltip_box title_tooltip'>
										<span>Earnings</span>
									</div>
									<div className='report-total'>
										{indianNumberFormat(totalRecordsData.total_estimated_earnings)}
									</div>
								</div>
							</div>
						</Tippy>
					) : (
						<div className='report-title custom_right_head'>Earnings</div>
					),
				cell: ({ row }) => <div className='report_column_box'>{row.original?.estimated_earnings}</div>,
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_estimated_earnings,
					minWidth: 125,
				}),
				meta: {
					alignMent: 'right',
					isDynamic: true,
					omit: !columnVisibility.ESTIMATED_EARNINGS,
				},
			},

			{
				id: 'ROAS',
				accessorFn: (row) => {
					const cost = parseMoney(row.cost);
					const rev = parseMoney(row.estimated_earnings);
					return cost ? rev / cost : 0;
				},
				header: () =>
					totalRecordsData ? (
						<Tippy
							content={'Actual ROAS'}
							placement='top'
							duration={0}
							offset={[0, 0]}
							className='custom_black_tippy'
						>
							<div className='report-title custom_right_head'>
								<div className='top_total'>
									<div className='report-header hover_tooltip_box title_tooltip'>
										<span>A.ROAS</span>
									</div>
									<div className='report-total'>{totalRecordsData?.total_roas}</div>
								</div>
							</div>
						</Tippy>
					) : (
						<div className='report-title custom_right_head'>A.ROAS</div>
					),
				cell: ({ row }) => {
					const cost = parseMoney(row.original?.cost);
					const rev = parseMoney(row.original?.estimated_earnings);
					const roas = cost ? (rev / cost).toFixed(2) : '0.00';
					return <div className='report_column_box'>{roas}</div>;
				},
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_roas,
					minWidth: 100,
				}),
				meta: {
					alignMent: 'right',
					isDynamic: true,
					omit: !columnVisibility.ROAS,
				},
			},

			{
				id: 'CUMULATIVE_EARNINGS',
				accessorFn: (row) => parseMoney(row.fsr),
				header: () =>
					totalRecordsData ? (
						<Tippy
							content={'Cumulative Earning'}
							placement='top'
							duration={0}
							offset={[0, 0]}
							className='custom_black_tippy'
						>
							<div className='report-title custom_right_head'>
								<div className='top_total'>
									<div className='report-header hover_tooltip_box title_tooltip'>
										<span>C.Earning</span>
									</div>
									<div className='report-total'>{indianNumberFormat(totalRecordsData?.total_fsr)}</div>
								</div>
							</div>
						</Tippy>
					) : (
						<div className='report-title custom_right_head'>C.Earnings</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box'>{indianNumberFormat(row.original?.fsr)}</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_fsr,
					minWidth: 140,
				}),
				meta: {
					alignMent: 'right',
					isDynamic: true,
					omit: !columnVisibility.CUMULATIVE_EARNINGS,
				},
			},

			{
				id: 'CUMULATIVE_ROAS',
				accessorFn: (row) => {
					const cost = parseMoney(row.cost);
					const rev = parseMoney(row.fsr);
					return cost ? rev / cost : 0;
				},
				header: () =>
					totalRecordsData ? (
						<Tippy
							content={'Cumulative ROAS'}
							placement='top'
							duration={0}
							offset={[0, 0]}
							className='custom_black_tippy'
						>
							<div className='report-title custom_right_head'>
								<div className='top_total'>
									<div className='report-header hover_tooltip_box title_tooltip'>
										<span>C.ROAS</span>
									</div>
									<div className='report-total'>{totalRecordsData?.total_cumulative_roas}</div>
								</div>
							</div>
						</Tippy>
					) : (
						<div className='report-title custom_right_head'>C.ROAS</div>
					),
				cell: ({ row }) => {
					const cost = parseMoney(row.original?.cost);
					const rev = parseMoney(row.original?.fsr);
					const v = cost ? (rev / cost).toFixed(2) : '0.00';
					return <div className='report_column_box'>{v}</div>;
				},
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_cumulative_roas,
					minWidth: 100,
				}),
				meta: {
					alignMent: 'right',
					isDynamic: true,
					omit: !columnVisibility.CUMULATIVE_ROAS,
				},
			},

			{
				id: 'PROFIT',
				accessorFn: (row) => {
					const cost = parseMoney(row.cost);
					const rev = parseMoney(row.estimated_earnings);
					return rev - cost;
				},
				header: () =>
					totalRecordsData ? (
						<div className='report-title custom_right_head'>
							<div className='top_total'>
								<div className='report-header'>Profit</div>
								<div className='report-total'>
									{(Number(totalRecordsData?.total_profit) < 0 ? '- $' : '$') +
										indianNumberFormat(Math.abs(Number(totalRecordsData?.total_profit)))}
								</div>
							</div>
						</div>
					) : (
						<div className='report-title custom_right_head'>Profit</div>
					),
				cell: ({ row }) => {
					const cost = parseMoney(row.original?.cost);
					const rev = parseMoney(row.original?.estimated_earnings);
					const profit = rev - cost;
					return (
						<div className='report_column_box'>
							{(profit < 0 ? '- $' : '$') + indianNumberFormat(Math.abs(profit.toFixed(2)))}
						</div>
					);
				},
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_profit,
					minWidth: 125,
				}),
				meta: {
					alignMent: 'right',
					isDynamic: true,
					omit: !columnVisibility.PROFIT,
				},
			},

			{
				id: 'IMPRESSION_RPM',
				accessorFn: (row) => parseMoney(row.observed_ecpm),
				header: () =>
					totalRecordsData ? (
						headerWithTotal('eCPM', indianNumberFormat(totalRecordsData.total_observed_ecpm))
					) : (
						<div className='report-title custom_right_head'>eCPM</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box custom_right_head'>{row.original?.observed_ecpm}</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_observed_ecpm,
					minWidth: 90,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.IMPRESSION_RPM,
					isDynamic: true,
				},
			},

			{
				id: 'AD_REQUESTS',
				accessorFn: (row) => parseIntSafe(row.ad_requests),
				header: () =>
					totalRecordsData ? (
						headerWithTotal('Requests', indianNumberFormat(totalRecordsData.total_ad_requests))
					) : (
						<div className='report-title custom_right_head'>Requests</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box custom_right_head'>{row.original?.ad_requests}</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_ad_requests,
					minWidth: 150,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.AD_REQUESTS,
					isDynamic: true,
				},
			},

			{
				id: 'MATCH_RATE',
				accessorFn: (row) => parsePercent(row.match_rate),
				header: () =>
					totalRecordsData ? (
						<div className='report-title custom_right_head'>
							<div className='top_total'>
								<div className='report-header'>Match rate</div>
								<Tippy
									content={indianNumberFormat(totalRecordsData?.total_matched_requests)}
									placement='top'
									duration={0}
									offset={[0, 2]}
									className='custom_black_tippy'
								>
									<div className='report-total'>{totalRecordsData?.total_match_rate}</div>
								</Tippy>
							</div>
						</div>
					) : (
						<div className='report-title custom_right_head'>Match rate (%)</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box custom_right_head hover_tooltip_box'>
						<Tippy
							content={row.original?.matched_requests}
							placement='top'
							duration={0}
							offset={[0, 2]}
							className='custom_black_tippy'
						>
							<span>{row.original?.match_rate}</span>
						</Tippy>
					</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_matched_requests,
					minWidth: 120,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.MATCH_RATE,
					isDynamic: true,
				},
			},

			{
				id: 'IMPRESSIONS',
				accessorFn: (row) => parseIntSafe(row.impressions),
				header: () =>
					totalRecordsData ? (
						headerWithTotal('Impressions', indianNumberFormat(totalRecordsData.total_impressions))
					) : (
						<div className='report-title custom_right_head'>Impressions</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box custom_right_head'>{row.original?.impressions}</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_impressions,
					minWidth: 150,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.IMPRESSIONS,
					isDynamic: true,
				},
			},

			{
				id: 'ACTIVE_USER',
				accessorFn: (row) => parseIntSafe(row.active_users),
				header: () =>
					totalRecordsData ? (
						headerWithTotal('Active users', indianNumberFormat(totalRecordsData.total_active_users))
					) : (
						<div className='report-title custom_right_head'>Active users</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box custom_right_head'>{row.original?.active_users}</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_active_users,
					minWidth: 150,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.ACTIVE_USER,
					isDynamic: true,
				},
			},

			{
				id: 'ARPU',
				accessorFn: (row) => parseIntSafe(row.arpu),
				header: () =>
					totalRecordsData ? (
						headerWithTotal('ARPU', indianNumberFormat(totalRecordsData.total_arpu))
					) : (
						<div className='report-title custom_right_head'>ARPU</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box custom_right_head'>{row.original?.arpu}</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_arpu,
					minWidth: 100,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.ARPU,
					isDynamic: true,
				},
			},

			{
				id: 'ARPDAU',
				accessorFn: (row) => parseIntSafe(row.total_arpdau),
				header: () =>
					totalRecordsData ? (
						headerWithTotal('ARPDAU', indianNumberFormat(totalRecordsData.total_arpdau))
					) : (
						<div className='report-title custom_right_head'>ARPDAU</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box custom_right_head'>{row.original?.arpdau}</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_arpdau,
					minWidth: 100,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.ARPDAU,
					isDynamic: true,
				},
			},

			{
				id: 'DAU_AV',
				accessorFn: (row) => parseIntSafe(row.dau_av),
				header: () =>
					totalRecordsData ? (
						headerWithTotal('DAU AV', indianNumberFormat(totalRecordsData.total_dau_av))
					) : (
						<div className='report-title custom_right_head'>DAU AV</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box custom_right_head'>{row.original?.dau_av || 0}</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_dau_av,
					minWidth: 100,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.DAU_AV,
					isDynamic: true,
				},
			},

			{
				id: 'AV_RATE',
				accessorFn: (row) => parseIntSafe(row.av_rate),
				header: () =>
					totalRecordsData ? (
						headerWithTotal('AV RATE', indianNumberFormat(totalRecordsData.total_av_rate))
					) : (
						<div className='report-title custom_right_head'>AV RATE</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box custom_right_head'>{row.original?.av_rate || "0%"}</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_av_rate,
					minWidth: 100,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.AV_RATE,
					isDynamic: true,
				},
			},

			{
				id: 'IMPR_PER_USER',
				accessorFn: (row) => parseIntSafe(row.impr_per_user),
				header: () =>
					totalRecordsData ? (
						headerWithTotal('Impr/User', indianNumberFormat(totalRecordsData.total_impr_per_user))
					) : (
						<div className='report-title custom_right_head'>Impr/User</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box custom_right_head'>{row.original?.impr_per_user}</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_impr_per_user,
					minWidth: 130,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.IMPR_PER_USER,
					isDynamic: true,
				},
			},

			{
				id: 'SHOW_RATE',
				accessorFn: (row) => parsePercent(row.show_rate),
				header: () =>
					totalRecordsData ? (
						headerWithTotal('Show rate', totalRecordsData.total_show_rate)
					) : (
						<div className='report-title custom_right_head'>Show rate (%)</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box custom_right_head'>{row.original?.show_rate}</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_show_rate,
					minWidth: 120,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.SHOW_RATE,
					isDynamic: true,
				},
			},

			{
				id: 'CLICKS',
				accessorFn: (row) => parseIntSafe(row.clicks),
				header: () =>
					totalRecordsData ? (
						headerWithTotal('Clicks', indianNumberFormat(totalRecordsData.total_clicks))
					) : (
						<div className='report-title custom_right_head'>Clicks</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box custom_right_head'>{row.original?.clicks}</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_clicks,
					minWidth: 130,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.CLICKS,
					isDynamic: true,
				},
			},

			{
				id: 'IMPRESSION_CTR',
				accessorFn: (row) => parsePercent(row.impression_ctr),
				header: () =>
					totalRecordsData ? (
						headerWithTotal('CTR', totalRecordsData.total_impression_ctr)
					) : (
						<div className='report-title custom_right_head'>CTR (%)</div>
					),
				cell: ({ row }) => (
					<div className='report_column_box custom_right_head'>{row.original?.impression_ctr}</div>
				),
				size: dynamicColumnWidthCal({
					value: totalRecordsData?.total_impression_ctr,
					minWidth: 100,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.IMPRESSION_CTR,
					isDynamic: true,
				},
			},
		];

		return cols;
	}, [
		firstColumnDimension,
		secondColumnDimension,
		availableFilters,
		isOpen,
		secondIsOpen,
		secondArrow,
		fetchFlag,
		columnVisibility,
		totalRecordsData,
	]);

	// ---------------- Hide/Show modal adapter ----------------
	// const modalColumns = useMemo(() => {
	// 	return tanstackColumns.map((c) => ({
	// 		name: typeof c.header === 'function' ? c.header() : c.header,
	// 		sortValue: c.id,
	// 		omit: Boolean(c?.meta?.omit),
	// 	}));
	// }, [tanstackColumns]);

	const modalColumns = useMemo(() => {
	return tanstackColumns
		.filter((c) => {
			// Hide from modal when not allowed
			if (monthYearOnlyColumnIds.includes(c.id)) {
				return isMonthOrYearOnly;
			}
			return true;
		})
		.map((c) => ({
			name: typeof c.header === 'function' ? c.header() : c.header,
			sortValue: c.id,
			omit: Boolean(c?.meta?.omit),
		}));
}, [tanstackColumns, isMonthOrYearOnly]);

	const applyModalColumns = (updatedCols) => {
		const updatedVisibility = {};
		updatedCols.forEach((col) => {
			updatedVisibility[col.sortValue] = !col.omit;
		});
		setColumnVisibility((prev) => ({ ...prev, ...updatedVisibility }));
	};

	const showOverlayLoader = isFetching || isLoaderVisible;

	useTanStackTableHover([singleReportData, columnVisibility], '.single_app_report');

	// table height
	const ROW_HEIGHT = 36;
	const MAX_ROWS = 18;
	const MIN_HEIGHT = 300;
	const tableHeight =
		Math.max(MIN_HEIGHT, Math.min(singleReportData.length, MAX_ROWS) * ROW_HEIGHT) + 80;

	return (
		<div
			className={`table-box-wrap main-box-wrapper pdglr24 report-table-box ${
				!singleReportData.length ? 'no_data_table_wrap' : ''
			}`}
		>
			<div className='userBoxWrap user-section-wrapper'>
				<div className='popup-full-box form-box-wrap form-wizard'>
					<div className='popup-box-wrapper'>
						<div
							className={`box-wrapper table-container ${
								secondColumnDimension ? 'extra_column_visible' : ''
							}`}
							style={{ zIndex: 8 }}
						>
							{showOverlayLoader && (
								<div className='shimmer-spinner overlay-spinner'>
									<Spinner animation='border' variant='secondary' />
								</div>
							)}

							{/* top bar */}
							<div className='custom-search-filter single_app_search'>
								<div className='single_app_search_inner'>
									<input
										value={searchText}
										onChange={handleSearch}
										placeholder='Search...'
										autoComplete='off'
									/>
									{searchText?.length > 0 && (
										<MdClose className='search-close' onClick={handleSearchClose} />
									)}
								</div>

								<div className='more-button three-icon-button more_btn_box'>
									{singleReportData && (
										<div className='row_count'>Total rows : {singleReportData?.length}</div>
									)}
									<MdMoreVert className='material-icons' />
									<div className='more-box w-250'>
										<div className='border-box'>
											{csvData?.length > 0 && (
												<CSVLink className='downloadbtn' filename='single-report.csv' data={csvData}>
													<span className='material-icons'>
														<FiDownload />
													</span>
													Download CSV
												</CSVLink>
											)}
										</div>

										<div className='border-box more_btn_item' onClick={() => setOmitModalShow(true)}>
											<span className='material-icons'>
												<IoEyeOff />
											</span>
											<span>Hide/Show column</span>
										</div>
									</div>
								</div>
							</div>

							{/* table */}
							<GeneralTanStackTable
								className='statistics_table single_app_report single_app_report_freeze report-table-scroll'
								data={singleReportData}
								columns={tanstackColumns}
								variant='sticky'
								height={tableHeight}
								rowHeight={36}
								enableSorting
								enableResize
								columnResizeMode='onChange'
								enableVirtualization
								overscan={10}
								stickyColumns={secondColumnDimension ? 2 : 1}
								defaultSortColumn='FirstColumn_MONTH'
								defaultSortDirection='desc'
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Hide/Show modal (kept) */}
			<ColumnOmitModal
				show={omitModalShow}
				onHide={() => setOmitModalShow(false)}
				columns={modalColumns}
				onApply={(updatedColumns) => applyModalColumns(updatedColumns)}
				appInfo={appInfo}
				isOnlyMonthYearSelected={isOnlyMonthYearSelected}
			/>
		</div>
	);
};

export default AppDetailsTable;
