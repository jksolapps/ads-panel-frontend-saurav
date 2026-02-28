/** @format */

import { useMemo } from 'react';
import moment from 'moment';
import AppInfoBox from '../GeneralComponents/AppInfoBox';
import { calculateColumnWidth } from '../../utils/helper';
import Tippy from '@tippyjs/react';

const cmpNum = (a, b) => {
	const A = Number.isFinite(+a) ? +a : -Infinity;
	const B = Number.isFinite(+b) ? +b : -Infinity;
	return A === B ? 0 : A < B ? -1 : 1;
};

const METRIC_KEYS = ['advertiserAdCost', 'totalAdRevenue', 'returnOnAdSpend'];
const DIMENSION_KEYS = ['APP', 'CAMPAIGN_NAME', 'DATE'];

export default function useCampaignAnalyticsColumns({
	// data
	analyticsData = [],
	total = {},
	isCountrySelected = false,
	dimensionList = [],
	allAnalyticsMatrixData = [],
	filteredMatrix = [],
	sharedAnalyticsMatrixData,
	sharedNewDimensionData,
	newFinalDimension = [],
	newStartDate,
	dayCheckedColumn = [],
	calculateAverageCumulativeRoas,
	indianNumberFormat,
	displayNumber,
	formatValue,
}) {
	const baseColumns = useMemo(() => {
		const appsCol = {
			id: 'apps',
			accessorKey: 'app_display_name',
			header: () => (
				<div className='report-title' data-sort-value='APP'>
					<div className=''>Apps</div>
				</div>
			),
			cell: ({ row }) => {
				const app = row.original;
				return (
					<AppInfoBox
						app_auto_id={app?.app_auto_id}
						app_icon={app?.app_icon}
						app_platform={app?.app_platform}
						app_display_name={app?.app_display_name}
						app_console_name={app?.app_console_name}
						app_store_id={app?.app_store_id}
					/>
				);
			},
			enableSorting: true,
			sortingFn: 'alphanumeric',
			size: 150,
			meta: { fixed: true, sortValue: 'APP', style: {} },
		};

		const campaignOrCountryCol = {
			id: 'campaign_or_country',
			accessorFn: (row) =>
				isCountrySelected && row?.country?.length ? row.country : row.firstUserCampaignName,
			header: () => (
				<div className='report-title' data-sort-value='CAMPAIGN_NAME'>
					<div className=''>{isCountrySelected ? 'Country' : 'Campaign'}</div>
				</div>
			),
			cell: ({ row }) => {
				const text =
					isCountrySelected && row?.original?.country?.length
						? row.original.country
						: row.original.firstUserCampaignName;
				return (
					<Tippy
						content={<div className='copyMessage'>{text}</div>}
						placement='top'
						arrow
						duration={0}
						className='new_custom_tooltip '
					>
						<div className={`campaign-column custom_campaign_tooltip`}>
							<div className='sub_title'>{text}</div>
						</div>
					</Tippy>
				);
			},
			enableSorting: true,
			sortingFn: 'alphanumeric',
			size: isCountrySelected ? 150 : 200,
			meta: {
				sortValue: 'CAMPAIGN_NAME',
				style: { zIndex: '2 !important', backgroundColor: '#fff' },
			},
		};

		const dateCol = {
			id: 'date',
			accessorKey: 'date',
			header: () => (
				<div className='report-title' data-sort-value='DATE'>
					<div className=''>Date</div>
				</div>
			),
			accessorFn: (row) => (row?.date ? moment(row.date).valueOf() : null),
			cell: ({ getValue }) => (
				<div className='campaign-column country-text'>
					<div>{moment(getValue()).format('YYYY-MM-DD')}</div>
				</div>
			),
			enableSorting: true,
			sortingFn: (a, b, colId) => cmpNum(a.getValue(colId), b.getValue(colId)),
			size: 100,
			meta: {
				sortValue: 'DATE',
				style: { zIndex: '2 !important', backgroundColor: '#fff' },
			},
		};

		const monthCol = {
			id: 'month',
			header: () => (
				<div className='report-title' data-sort-value='MONTH'>
					<div className=''>Month</div>
				</div>
			),
			accessorFn: (row) => {
				const m = moment(row?.date);
				return m.isValid() ? Number(m.format('YYYYMM')) : null;
			},
			cell: ({ row }) => (
				<div className='campaign-column country-text'>
					<div>{moment(row.original?.date).format('MMM YY')}</div>
				</div>
			),
			enableSorting: true,
			sortingFn: (a, b, colId) => cmpNum(a.getValue(colId), b.getValue(colId)),
			size: 100,
			meta: {
				sortValue: 'MONTH',
				style: { zIndex: '2 !important', backgroundColor: '#fff' },
			},
		};

		const costCol = {
			id: 'total_cost',
			header: () => 'Total Cost',
			accessorKey: 'advertiserAdCost',
			accessorFn: (row) => Number(row?.advertiserAdCost ?? 0),
			cell: ({ row }) => {
				const v = row.original?.advertiserAdCost;
				const n = indianNumberFormat(displayNumber(v));
				const out = Number.isInteger(Number(n)) ? `${n}.00` : n;
				return <div>{v ? '$' + out : '-'}</div>;
			},
			enableSorting: true,
			sortingFn: (a, b, colId) => cmpNum(a.getValue(colId), b.getValue(colId)),
			size: calculateColumnWidth(
				total?.advertiserAdCost ? `$${Number(total?.advertiserAdCost).toFixed(2)}` : '-',
				9,
				140
			),
			meta: {
				sortValue: 'advertiserAdCost',
				alignMent: 'right',
				style: { zIndex: '2 !important', backgroundColor: '#fff' },
			},
		};

		const revenueCol = {
			id: 'total_revenue',
			header: () => 'Total Revenue',
			accessorKey: 'totalAdRevenue',
			accessorFn: (row) => Number(row?.totalAdRevenue ?? 0),
			cell: ({ row }) => {
				const v = row.original?.totalAdRevenue;
				const n = indianNumberFormat(displayNumber(v));
				const out = Number.isInteger(Number(n)) ? `${n}.00` : n;
				return <div>{v ? '$' + out : '-'}</div>;
			},
			enableSorting: true,
			sortingFn: (a, b, colId) => cmpNum(a.getValue(colId), b.getValue(colId)),
			size: calculateColumnWidth(
				total?.totalAdRevenue ? `$${Number(total?.totalAdRevenue).toFixed(2)}` : '-',
				10,
				140
			),
			meta: {
				sortValue: 'totalAdRevenue',
				alignMent: 'right',
				style: { zIndex: '2 !important', backgroundColor: '#fff' },
			},
		};

		const roasCol = {
			id: 'roas',
			header: () => 'ROAS',
			accessorKey: 'returnOnAdSpend',
			accessorFn: (row) => Number(row?.returnOnAdSpend ?? 0),
			cell: ({ row }) => {
				const raw = row.original?.returnOnAdSpend;
				let roasValue;
				if (raw === 0 || raw === '0') roasValue = '0.00';
				else if (raw) roasValue = Number(displayNumber(raw)).toFixed(2);
				else roasValue = '-';
				return <div>{roasValue}</div>;
			},
			enableSorting: true,
			sortingFn: (a, b, colId) => cmpNum(a.getValue(colId), b.getValue(colId)),
			size: calculateColumnWidth(
				total?.returnOnAdSpend ? `$${Number(total?.returnOnAdSpend).toFixed(2)}` : '-',
				8,
				90
			),
			meta: {
				sortValue: 'returnOnAdSpend',
				alignMent: 'right',
				style: { zIndex: '2 !important', backgroundColor: '#fff' },
			},
		};

		return [appsCol, campaignOrCountryCol, dateCol, monthCol, costCol, revenueCol, roasCol];
	}, [isCountrySelected, total, displayNumber, indianNumberFormat]);

	const withTotalsHeaders = useMemo(() => {
		return baseColumns.map((c) => {
			const key = c.meta?.sortValue;
			if (key === 'advertiserAdCost') {
				const sum = indianNumberFormat(displayNumber(total?.advertiserAdCost));
				const out = Number.isInteger(Number(sum)) ? `${sum}.00` : sum;
				return {
					...c,
					header: () => (
						<div className='report-title' data-sort-value='advertiserAdCost'>
							<div className='analytics-header-dimension'>Total Cost</div>
							<div className='report-total-dimension'>{total?.advertiserAdCost ? '$' + out : '-'}</div>
						</div>
					),
				};
			}
			if (key === 'totalAdRevenue') {
				const sum = indianNumberFormat(displayNumber(total?.totalAdRevenue));
				const out = Number.isInteger(Number(sum)) ? `${sum}.00` : sum;
				return {
					...c,
					header: () => (
						<div className='report-title' data-sort-value='totalAdRevenue'>
							<div className='analytics-header-dimension'>Total Revenue</div>
							<div className='report-total-dimension'>{total?.totalAdRevenue ? '$' + out : '-'}</div>
						</div>
					),
				};
			}
			if (key === 'returnOnAdSpend') {
				const val = Number(total?.totalAdRevenue) / (Number(total?.advertiserAdCost) || 1);
				return {
					...c,
					header: () => (
						<div className='report-title' data-sort-value='returnOnAdSpend'>
							<div className='analytics-header-dimension' title='Return on ad spend'>
								ROAS
							</div>
							<div className='report-total-dimension'>{Number.isFinite(val) ? val.toFixed(2) : '-'}</div>
						</div>
					),
				};
			}
			return c;
		});
	}, [baseColumns, total, indianNumberFormat, displayNumber]);

	const columnsWithOmit = useMemo(() => {
		const hasFilteredMatrix = Array.isArray(filteredMatrix) && filteredMatrix.length > 0;

		// 1) Apply dimension visibility (APP, CAMPAIGN_NAME, DATE, etc.)
		const byDimensionList = withTotalsHeaders.map((c) => {
			const key = c.meta?.sortValue;
			if (!key) return c;

			const dimItem = dimensionList?.find((d) => d.value === key);
			if (dimItem) {
				return { ...c, meta: { ...(c.meta || {}), omit: !dimItem.matrix_checked } };
			}
			return c;
		});

		// 2) Apply metrics visibility based ONLY on filteredMatrix rule:
		//    - if no filteredMatrix => show all metrics
		//    - if filteredMatrix has items => show only checked, hide others
		const byMetricsMatrix = byDimensionList.map((c) => {
			const key = c.meta?.sortValue;
			if (!key || !METRIC_KEYS.includes(key)) return c;

			// CASE 1: No filteredMatrix selected -> show ALL metrics
			if (!hasFilteredMatrix) {
				return { ...c, meta: { ...(c.meta || {}), omit: false } };
			}

			// CASE 2: filteredMatrix has items -> only keep checked ones
			const item = filteredMatrix.find((x) => x?.name === key);
			const enabled = !!item?.matrix_checked; // undefined or false => omit
			return { ...c, meta: { ...(c.meta || {}), omit: !enabled } };
		});

		// 3) Force show items listed in newFinalDimension (if you still need this)
		const forced = byMetricsMatrix.map((c) => {
			const key = c.meta?.sortValue;
			if (key && newFinalDimension.includes(key)) {
				return { ...c, meta: { ...(c.meta || {}), omit: false } };
			}
			return c;
		});

		return forced;
	}, [withTotalsHeaders, dimensionList, filteredMatrix, newFinalDimension]);

	const todayDate = moment();
	const oneDay = 24 * 60 * 60 * 1000;

	const diffDays = useMemo(() => {
		if (!newStartDate) return 0;
		const startMs = moment(newStartDate).valueOf();
		const days = Math.round(Math.abs((startMs - todayDate.valueOf()) / oneDay)) + 1;
		return Math.max(days, 0);
	}, [newStartDate]);

	const totalRoas = useMemo(() => {
		if (!analyticsData?.length || !diffDays) return [];
		return calculateAverageCumulativeRoas(analyticsData, diffDays) || [];
	}, [analyticsData, diffDays, calculateAverageCumulativeRoas]);

	const allowedDaysSet = useMemo(() => {
		const vals = (dayCheckedColumn || [])
			.map((d) => parseInt(d.value, 10))
			.filter((n) => Number.isFinite(n));
		return new Set(vals); // days are 1-based
	}, [dayCheckedColumn]);

	const allDynamicCols = useMemo(() => {
		if (!diffDays) return [];
		const cols = [];

		for (let i = 0; i < diffDays; i++) {
			const day1 = i + 1;
			if (!allowedDaysSet.has(day1)) continue;

			const exists = analyticsData?.some((app) => app?.day_wise_total?.some((d) => +d?.day === i));
			if (!exists) continue;
			const totalVal = totalRoas.find((x) => +x?.day === i);
			cols.push({
				id: `day_${day1}`,
				header: () => (
					<div className='report-title' data-sort-value={i}>
						<div className='analytics-header-dimension'>{`Day ${day1}`}</div>
						<div className='report-total-dimension'>
							{totalVal?.average != null ? Number(totalVal?.average).toFixed(2) : '-'}
						</div>
					</div>
				),
				accessorFn: (row) => {
					const d = row?.day_wise_total?.find((x) => +x?.day === i);
					const v = Number(d?.cumulative_roas);
					if (!Number.isFinite(v) || v === 0) return undefined;
					return v;
				},

				sortUndefined: -1,
				cell: ({ row }) => {
					const d = row.original?.day_wise_total?.find((x) => +x?.day === i);
					if (!d) {
						return (
							<div className='no-select' style={{ justifyContent: 'center' }}>
								<div className='primary-percentage-label roas-text roas-label'>-</div>
								<div className='primary-percentage-label roas-text roas-label demo-rev'>-</div>
							</div>
						);
					}
					const ros = displayNumber(d?.cumulative_roas);
					const rosOut = Number.isInteger(Number(ros)) ? `${ros}.00` : ros;
					const valueOut = '$' + indianNumberFormat(formatValue(+d?.value || 0));
					const isZero = +d?.value === 0;

					return (
						<div className='no-select' style={{ justifyContent: 'center' }}>
							<div className='roas-text roas-label'>
								{isZero ? '-' : d?.cumulative_roas === 0 ? '0.00' : rosOut}
							</div>
							<div className='primary-percentage-label roas-text roas-label demo-rev'>
								{isZero ? '-' : valueOut}
							</div>
						</div>
					);
				},
				enableSorting: true,
				sortingFn: (a, b, colId) => cmpNum(a.getValue(colId), b.getValue(colId)),
				meta: {
					isDynamic: true,
					alignMent: 'right',
					style: { justifyContent: 'flex-end' },
					sortValue: { columnIndex: i },
				},
			});
		}
		return cols;
	}, [
		diffDays,
		allowedDaysSet,
		totalRoas,
		analyticsData,
		indianNumberFormat,
		displayNumber,
		formatValue,
	]);

	const metricsSelection = useMemo(() => {
		const names = (sharedAnalyticsMatrixData?.columns || []).map((x) => x?.name).filter(Boolean);
		return {
			hasSelection: names.length > 0,
			selected: new Set(names),
			order: names,
		};
	}, [sharedAnalyticsMatrixData]);

	const afterMetricsSelection = useMemo(() => {
		let cols = [...columnsWithOmit];

		if (metricsSelection.hasSelection) {
			const visibleMetrics = cols.filter(
				(c) => METRIC_KEYS.includes(c.meta?.sortValue) && !c.meta?.omit
			);
			const others = cols.filter((c) => !METRIC_KEYS.includes(c.meta?.sortValue) || c.meta?.omit);

			const orderedMetrics = metricsSelection.order
				.map((name) => visibleMetrics.find((c) => c.meta?.sortValue === name))
				.filter(Boolean);

			cols = [...others, ...orderedMetrics];
		}

		return cols;
	}, [columnsWithOmit, metricsSelection]);

	const columnsReordered = useMemo(() => {
		let cols = [...afterMetricsSelection];

		if (sharedNewDimensionData?.columns?.length) {
			const dims = cols.filter((c) => DIMENSION_KEYS.includes(c.meta?.sortValue));
			const others = cols.filter((c) => !DIMENSION_KEYS.includes(c.meta?.sortValue));

			const orderedDims = sharedNewDimensionData.columns
				.map((x) => dims.find((c) => c.meta?.sortValue === x.value))
				.filter(Boolean);

			cols = [...orderedDims, ...others];
		}

		return cols;
	}, [afterMetricsSelection, sharedNewDimensionData]);

	const columns = useMemo(
		() => [...columnsReordered, ...allDynamicCols],
		[columnsReordered, allDynamicCols]
	);

	return { columns };
}
