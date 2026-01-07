/** @format */

import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { CSVLink } from 'react-csv';
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
import Tippy from '@tippyjs/react';
import { dynamicColumnWidthCal } from '../../utils/pureHelper';

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
	// e.g. "Android 23.1.0" or "23.1.0"
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
	const [csvData, setCsvData] = useState([]);
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

	// loader overlay (useQueryFetch already has isFetching; keep your local flag too if used by dropdowns)
	const [isLoaderVisible, setIsLoaderVisible] = useState(false);
	const [fetchFlag, setFetchFlag] = useState(false);

	const isOnlyMonthYearSelected = useMemo(() => {
		return (
			(firstColumnDimension === 'MONTH' || firstColumnDimension === 'YEAR') &&
			!secondColumnDimension &&
			appInfo?.app_info?.is_app_property == '1'
		);
	}, [firstColumnDimension, secondColumnDimension, appInfo]);

	// ---- Column visibility map (drives meta.omit) ----
	const [columnVisibility, setColumnVisibility] = useState({
		AD_COST: isOnlyMonthYearSelected,
		ESTIMATED_EARNINGS: true,
		ROAS: isOnlyMonthYearSelected,
		CUMULATIVE_EARNINGS: false,
		CUMULATIVE_ROAS: false,
		PROFIT: isOnlyMonthYearSelected,

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
		}));
	}, [isOnlyMonthYearSelected]);

	// ---------------- fetch ----------------
	const user_id = localStorage.getItem('id');
	const user_token = localStorage.getItem('token');

	const convertYearToMonth = (dimension) => (dimension?.includes('YEAR') ? 'MONTH' : dimension);

	const finalDimension = useMemo(() => {
		return secondColumnDimension
			? `${convertYearToMonth(firstColumnDimension)},${convertYearToMonth(secondColumnDimension)}`
			: convertYearToMonth(firstColumnDimension);
	}, [firstColumnDimension, secondColumnDimension]);

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

	// ---------------- helpers from your old file ----------------
	const renderSearchDimension = (dimension) => {
		switch (dimension) {
			case 'MONTH':
			case 'WEEK':
			case 'YEAR':
				return 'report_date';
			case 'AD_UNIT':
				return 'au_display_name';
			case 'COUNTRY':
				return 'country_name';
			case 'FORMAT':
				return 'au_format';
			case 'MOBILE_OS_VERSION':
				return 'mobile_os_version';
			case 'GMA_SDK_VERSION':
				return 'gma_sdk_version';
			case 'APP_VERSION_NAME':
				return 'app_version';
			default:
				return null;
		}
	};

	function formatDimensionValue(dimension, value) {
		if (!value) return '';
		switch (dimension) {
			case 'MONTH':
				return moment(value, 'YYYYMM').format('MMM YY');
			case 'WEEK':
				return moment(value, 'YYYYMMDD').format('YYYY[W]WW');
			case 'YEAR':
				return moment(value, 'YYYYMMDD').format('YYYY');
			default:
				return value;
		}
	}

	function filterDataByDimensions(data, firstDimension, secondDimension, searchValue) {
		const firstKey = renderSearchDimension(firstDimension);
		const secondKey = renderSearchDimension(secondDimension);
		if (!firstKey && !secondKey) return [];

		const lower = String(searchValue ?? '').toLowerCase();

		// keep your YEAR aggregation behavior
		if (firstDimension?.includes('YEAR') || secondDimension?.includes('YEAR')) {
			const yearMap = new Map();

			for (const row of data) {
				const year = moment(row.report_date, 'YYYYMM').format('YYYY');

				const k1 = firstColumnDimension.includes('YEAR')
					? year
					: row[renderSearchDimension(firstColumnDimension)];
				const k2 = secondColumnDimension?.includes('YEAR')
					? year
					: row[renderSearchDimension(secondColumnDimension)];

				const mapKey = secondColumnDimension ? `${k1}-${k2}` : k1;

				if (!yearMap.has(mapKey)) {
					yearMap.set(mapKey, {
						report_date: firstColumnDimension.includes('YEAR') ? year : row.report_date,
						[renderSearchDimension(firstColumnDimension)]: k1,
						...(secondColumnDimension && {
							[renderSearchDimension(secondColumnDimension)]: k2,
						}),
						estimated_earnings: 0,
						fsr: 0,
						ad_requests: 0,
						cost: 0,
						matched_requests: 0,
						impressions: 0,
						clicks: 0,
						count: 0,
					});
				}

				const cur = yearMap.get(mapKey);
				cur.estimated_earnings += parseMoney(row.estimated_earnings);
				cur.fsr += row?.fsr ? parseMoney(row.fsr) : 0;
				cur.cost += row?.cost ? parseMoney(row.cost) : 0;
				cur.ad_requests += parseIntSafe(row.ad_requests);
				cur.matched_requests += parseIntSafe(row.matched_requests);
				cur.impressions += parseIntSafe(row.impressions);
				cur.clicks += parseIntSafe(row.clicks);
				cur.count += 1;
			}

			data = Array.from(yearMap.values()).map((d) => ({
				report_date: d.report_date,
				...(d.au_display_name && { au_display_name: d.au_display_name }),
				...(d.country_name && { country_name: d.country_name }),
				...(d.au_format && { au_format: d.au_format }),
				...(d.mobile_os_version && { mobile_os_version: d.mobile_os_version }),
				...(d.gma_sdk_version && { gma_sdk_version: d.gma_sdk_version }),
				...(d.app_version && { app_version: d.app_version }),
				estimated_earnings: `$${indianNumberFormat(d.estimated_earnings.toFixed(2))}`,
				fsr: d?.fsr ? `$${indianNumberFormat(d.fsr.toFixed(2))}` : 0,
				cost: d?.cost ? `$${d.cost.toFixed(2)}` : 0,
				observed_ecpm:
					'$' +
					`${d.impressions > 0 ? ((d.estimated_earnings / d.impressions) * 1000).toFixed(2) : '0.00'}`,
				ad_requests: indianNumberFormat(d.ad_requests),
				matched_requests: indianNumberFormat(d.matched_requests),
				match_rate: `${
					d.ad_requests > 0 ? ((d.matched_requests / d.ad_requests) * 100).toFixed(2) : '0.00'
				}%`,
				show_rate: `${
					d.matched_requests > 0 ? ((d.impressions / d.matched_requests) * 100).toFixed(2) : '0.00'
				}%`,
				impressions: indianNumberFormat(d.impressions),
				clicks: indianNumberFormat(d.clicks),
				impression_ctr: `${
					d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(2) : '0.00'
				}%`,
			}));
		}

		return data.filter((item) => {
			const v1 = firstKey ? formatDimensionValue(firstDimension, item[firstKey]) : null;
			const v2 = secondKey ? formatDimensionValue(secondDimension, item[secondKey]) : null;
			return (v1 && v1.toLowerCase().includes(lower)) || (v2 && v2.toLowerCase().includes(lower));
		});
	}

	function totalRecordsSum(data) {
		const acc = data.reduce(
			(a, curr) => {
				a.total_estimated_earnings += parseMoney(curr?.estimated_earnings);
				a.total_fsr += curr?.fsr ? parseMoney(curr?.fsr) : 0;
				a.total_cost += curr?.cost ? parseMoney(curr?.cost) : 0;

				a.total_ad_requests += parseIntSafe(curr?.ad_requests);
				a.total_matched_requests += parseIntSafe(curr?.matched_requests);
				a.total_impressions += parseIntSafe(curr?.impressions);
				a.total_clicks += parseIntSafe(curr?.clicks);

				a.total_show_rate += parsePercent(curr?.show_rate);
				a.total_impression_ctr += parsePercent(curr?.impression_ctr);

				a.count += 1;
				return a;
			},
			{
				total_estimated_earnings: 0,
				total_observed_ecpm: 0,
				total_ad_requests: 0,
				total_matched_requests: 0,
				total_impressions: 0,
				total_clicks: 0,
				total_match_rate: 0,
				total_show_rate: 0,
				total_impression_ctr: 0,
				total_cost: 0,
				total_roas: 0,
				total_profit: 0,
				total_fsr: 0,
				total_cumulative_roas: 0,
				count: 0,
			}
		);

		acc.total_observed_ecpm = (acc.total_estimated_earnings / acc.total_impressions) * 1000 || 0;
		acc.total_match_rate = (acc.total_matched_requests / acc.total_ad_requests) * 100 || 0;
		acc.total_show_rate = (acc.total_impressions / acc.total_matched_requests) * 100 || 0;
		acc.total_impression_ctr = (acc.total_clicks / acc.total_impressions) * 100 || 0;

		acc.total_roas = acc.total_cost
			? Number(acc.total_estimated_earnings / acc.total_cost).toFixed(2)
			: 0.0;
		acc.total_cumulative_roas = acc.total_cost
			? Number(acc.total_fsr / acc.total_cost).toFixed(2)
			: 0.0;
		acc.total_profit = Number(acc.total_estimated_earnings - acc.total_cost).toFixed(2);

		acc.total_estimated_earnings = `$${acc.total_estimated_earnings.toFixed(2)}`;
		acc.total_fsr = `$${acc.total_fsr.toFixed(2)}`;
		acc.total_cost = `$${acc.total_cost.toFixed(2)}`;
		acc.total_observed_ecpm = `$${acc.total_observed_ecpm.toFixed(2)}`;
		acc.total_match_rate = `${acc.total_match_rate.toFixed(2)}%`;
		acc.total_show_rate = `${acc.total_show_rate.toFixed(2)}%`;
		acc.total_impression_ctr = `${acc.total_impression_ctr.toFixed(2)}%`;

		return acc;
	}

	useEffect(() => {
		if (!apiResponse || !apiSucesss) return;

		if (apiResponse?.status_code == 1) {
			const finalData = filterDataByDimensions(
				apiResponse?.aaData,
				firstColumnDimension,
				secondColumnDimension,
				searchText
			);
			const totalSum = totalRecordsSum(apiResponse?.aaData);

			setSingleReportData(finalData);
			setCsvData(finalData);
			setTotalRecordsData(totalSum);
			setSearchData(apiResponse?.aaData);

			setIsLoaderVisible(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiResponse, apiSucesss, firstColumnDimension, secondColumnDimension]);

	// ---------------- search handlers ----------------
	const handleSearch = (e) => {
		const query = e?.target?.value ?? '';
		setSearchText(query);

		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		timeoutRef.current = setTimeout(() => {
			const finalData = filterDataByDimensions(
				searchData,
				firstColumnDimension,
				secondColumnDimension,
				query
			);
			const totalSum = totalRecordsSum(finalData);
			setSingleReportData(finalData);
			setCsvData(finalData);
			setTotalRecordsData(totalSum);
		}, 700);
	};

	const handleSearchClose = () => {
		const query = '';
		setSearchText(query);
		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		const finalData = filterDataByDimensions(
			searchData,
			firstColumnDimension,
			secondColumnDimension,
			query
		);
		const totalSum = totalRecordsSum(finalData);
		setSingleReportData(finalData);
		setCsvData(finalData);
		setTotalRecordsData(totalSum);
	};

	// ---------------- CSV conversion (kept same behavior) ----------------
	const keyMapping = useMemo(
		() => ({
			report_date: 'Date',
			au_display_name: 'Ad Unit',
			au_format: 'Format',
			country_name: 'Country',
			gma_sdk_version: 'GMA SDK Version',
			mobile_os_version: 'Mobile OS Version',
			app_version: 'App Version',
			cost: 'Cost (USD)',
			estimated_earnings: 'Actual Earnings (USD)',
			roas: 'Actual ROAS',
			fsr: 'Cumulative Earnings (USD)',
			cumulative_roas: 'Cumulative ROAS',
			profit: 'Profit (USD)',
			observed_ecpm: 'Observed eCPM (USD)',
			ad_requests: 'Requests',
			matched_requests: 'Matched requests',
			match_rate: 'Match rate (%)',
			impressions: 'Impressions',
			show_rate: 'Show rate (%)',
			clicks: 'Clicks',
			impression_ctr: 'CTR (%)',
		}),
		[]
	);

	const [convertedData, setConvertedData] = useState([]);

	useEffect(() => {
		const km = { ...keyMapping };

		if (firstColumnDimension === 'MONTH' || secondColumnDimension === 'MONTH')
			km.report_date = 'Month';
		else if (firstColumnDimension === 'WEEK' || secondColumnDimension === 'WEEK')
			km.report_date = 'Week';
		else if (firstColumnDimension === 'YEAR' || secondColumnDimension === 'YEAR')
			km.report_date = 'Year';

		const sanitizedData = (csvData || []).map((item) => {
			let formattedDate = item.report_date;

			if (firstColumnDimension === 'MONTH' || secondColumnDimension === 'MONTH') {
				formattedDate = moment(item.report_date, 'YYYYMM').format('MMM YY');
			} else if (firstColumnDimension === 'WEEK' || secondColumnDimension === 'WEEK') {
				formattedDate = moment(item.report_date, 'YYYYMMDD').format('YYYY[W]WW');
			} else if (firstColumnDimension === 'YEAR' || secondColumnDimension === 'YEAR') {
				formattedDate = moment(item.report_date, 'YYYYMMDD').format('YYYY');
			}

			const updated = {
				...item,
				report_date: formattedDate,
				estimated_earnings: String(item.estimated_earnings ?? '').replace('$', ''),
				observed_ecpm: String(item.observed_ecpm ?? '').replace('$', ''),
			};

			if (item.cost && isOnlyMonthYearSelected) {
				const cost = parseMoney(item.cost);
				const earn = parseMoney(item.estimated_earnings);
				const fsr = parseMoney(item.fsr);

				updated.cost = indianNumberFormat(String(item.cost ?? '').replace('$', ''));
				updated.fsr = indianNumberFormat(String(item.fsr ?? '').replace('$', ''));

				updated.roas = cost ? (earn / cost).toFixed(2) : '0.00';
				updated.cumulative_roas = cost ? (fsr / cost).toFixed(2) : '0.00';
				updated.profit = indianNumberFormat((earn - cost).toFixed(2));
			} else {
				delete updated.cost;
				delete updated.fsr;
			}

			if (updated.hasOwnProperty('au_id')) delete updated.au_id;

			return updated;
		});

		const activeColumns = new Set();
		sanitizedData.forEach((item) => {
			Object.keys(km).forEach((key) => {
				const label = km[key];
				if (item[key] != null && String(item[key]).trim() !== '') activeColumns.add(label);
			});
		});

		const finalData = sanitizedData.map((item) => {
			const out = {};
			Object.keys(km).forEach((key) => {
				const label = km[key];
				if (activeColumns.has(label)) out[label] = item[key] ?? '';
			});
			return out;
		});

		const formatValue = (value) => {
			const s = String(value ?? '');
			if (s.includes('$'))
				return Number(s.replace('$', '')).toLocaleString('en-IN', {
					maximumFractionDigits: 2,
				});
			if (s.includes('-'))
				return (
					'-' +
					Number(s.replace('-', '')).toLocaleString('en-IN', {
						maximumFractionDigits: 2,
					})
				);
			const n = Number(s);
			if (Number.isFinite(n)) return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
			return s;
		};

		const firstColumnKey = finalData.length > 0 ? Object.keys(finalData[0])?.[0] : km.report_date;
		const totalRow = { [firstColumnKey]: 'Total' };

		if (totalRecordsData) {
			for (const key in totalRecordsData) {
				const newKey = key.replace('total_', '');
				if (!km[newKey]) continue;

				if (
					!isOnlyMonthYearSelected &&
					(newKey === 'roas' ||
						newKey === 'profit' ||
						newKey === 'cost' ||
						newKey === 'fsr' ||
						newKey === 'cumulative_roas')
				) {
					continue;
				}
				totalRow[km[newKey]] = formatValue(totalRecordsData[key]);
			}
		}

		finalData.push(totalRow);
		setConvertedData(finalData);
	}, [
		csvData,
		firstColumnDimension,
		secondColumnDimension,
		isOnlyMonthYearSelected,
		keyMapping,
		totalRecordsData,
	]);

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
				// ensure chronological ordering
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
			meta: {
				alignMent: 'center',
				headerClassName: 'custom_report_column',
			},
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

		// const costTotal = totalRecordsData?.total_cost
		//   ? indianNumberFormat(totalRecordsData.total_cost)
		//   : null;

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
					minWidth: 100,
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
					minWidth: 100,
				}),
				meta: {
					alignMent: 'right',
					omit: !columnVisibility.IMPRESSIONS,
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
					minWidth: 100,
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
	const modalColumns = useMemo(() => {
		return tanstackColumns.map((c) => ({
			name: typeof c.header === 'function' ? c.header() : c.header,
			sortValue: c.id,
			omit: Boolean(c?.meta?.omit),
		}));
	}, [tanstackColumns]);

	const applyModalColumns = (updatedCols) => {
		const updatedVisibility = {};

		updatedCols.forEach((col) => {
			updatedVisibility[col.sortValue] = !col.omit;
		});

		setColumnVisibility((prev) => ({
			...prev,
			...updatedVisibility,
		}));
	};

	const showOverlayLoader = isFetching;

	useTanStackTableHover([singleReportData, columnVisibility], '.single_app_report');

	//table height
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
											<CSVLink
												className='downloadbtn more_btn_item'
												filename='report.csv'
												data={convertedData}
											>
												<span className='material-icons'>
													<FiDownload />
												</span>
												<span> Export CSV</span>
											</CSVLink>
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
								className='statistics_table single_app_report report-table-scroll'
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
