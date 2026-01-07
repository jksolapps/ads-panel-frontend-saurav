/** @format */

// columns-retention.js (JS)
import React, { useMemo } from 'react';
import Tippy from '@tippyjs/react';
import AppInsightsInfoBox from '../GeneralComponents/AppInsightsInfoBox';

// ---- helpers you already use ----
const hasValue = (v) => v !== null && v !== undefined && !Number.isNaN(v);
const pct = (n) => `${Number(n)?.toFixed(2)}%`;
const indianNumberFormat = (n) => {
	try {
		const num = Number(n);
		if (!Number.isFinite(num)) return '-';
		return num.toLocaleString('en-IN');
	} catch {
		return String(n);
	}
};
const money = (n, isDollar) =>
	`${isDollar ? '$' : '₹'}${indianNumberFormat(Number(n)?.toFixed(2))}`;
const num = (n) => indianNumberFormat(n);

const METRIC_ORDER_DEFAULT = [
	'finalRetention',
	'totalActiveUsers',
	'totalRevenue',
	'totalCost',
	'finalRoas',
	'totalRevUser',
	'dailyLTVRevenue',
];

// robust case-insensitive string sort (for Country)
const stringSort = (rowA, rowB, columnId) => {
	const norm = (v) => {
		if (v === null || v === undefined) return '';
		if (typeof v === 'string') return v.toLowerCase();
		if (typeof v === 'number') return String(v);
		if (Array.isArray(v)) return v.join(',');
		if (typeof v === 'object') return JSON.stringify(v);
		return String(v);
	};
	const a = norm(rowA.getValue(columnId));
	const b = norm(rowB.getValue(columnId));
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
};

// numeric compare with NaN protection
const cmpNum = (a, b) => {
	const A = Number.isFinite(+a) ? +a : -Infinity;
	const B = Number.isFinite(+b) ? +b : -Infinity;
	return A === B ? 0 : A < B ? -1 : 1;
};

// ---------- STATIC COLUMNS (TanStack v8) ----------
function useStaticColumns() {
	return useMemo(
		() => [
			{
				id: '_index',
				accessorKey: '_index',
				header: () => (
					<div className='report-title' data-sort-value='ID'>
						<div className='report-header-dimension'>Id</div>
					</div>
				),
				cell: ({ getValue }) => (
					<div style={{ display: 'flex', justifyContent: 'center' }}>{getValue()}</div>
				),
				enableSorting: false,
				size: 60,
				minSize: 60,
				maxSize: 60,
				meta: {
					fixed: true,
					omit: false,
					alignMent: 'center',
					style: { justifyContent: 'center' },
				},
			},
			{
				id: 'app_display_name',
				accessorKey: 'app_display_name',
				header: () => (
					<div className='report-title' data-sort-value='APP'>
						<div className='report-header-dimension'>Apps</div>
					</div>
				),
				cell: ({ row }) => {
					const app = row.original;
					return (
						<AppInsightsInfoBox
							app_auto_id={app?.app_auto_id}
							app_icon={app?.app_icon}
							app_platform={app?.app_platform}
							app_display_name={app?.app_display_name}
							app_console_name={app?.app_console_name}
							app_store_id={app?.app_store_id}
							percentageInfo={false}
						/>
					);
				},
				enableSorting: true,
				sortingFn: stringSort,
				size: 150,
				minSize: 150,
				meta: {
					fixed: true,
					omit: false,
					sortValue: 'APP',
					sortKey: 'app_display_name',
				},
			},
			{
				id: 'country',
				accessorKey: 'country',
				header: () => (
					<div className='report-title' data-sort-value='Country'>
						<div className='report-header-dimension' style={{ marginBottom: 0 }}>
							Country
						</div>
					</div>
				),
				cell: ({ getValue }) => (
					<div className='campaign-column country-text arpu_country_name_wrap'>
						<div className='arpu_country_name'>{getValue()}</div>
					</div>
				),
				enableSorting: true,
				sortingFn: stringSort,
				size: 120,
				minSize: 120,
				meta: {
					omit: false,
					sortValue: 'Country',
					sortKey: 'country',
					alignMent: 'center',
					style: { justifyContent: 'center' },
				},
			},
		],
		[]
	);
}

// ---------- DYNAMIC COLUMNS (Total + Day N) ----------
function useDynamicColumns({
	mainData,
	dayCheckedColumn,
	isDollarCheck,
	columnWidths = {},
	lastAvailableMap = {},
	rowWiseTotal = {},
	finalMetrics = ['dailyLTVRevenue'],
	setPlacementClass,
	METRIC_ORDER = METRIC_ORDER_DEFAULT,
}) {
	return useMemo(() => {
		if (!Array.isArray(mainData) || mainData.length === 0) return [];

		const STATIC_INR = isDollarCheck ? 1 : 86;

		// find max day across rows
		let diffDays = 0;
		for (const record of mainData) {
			const maxDay = Math.max(...(record?.day_wise_retention ?? []).map((d) => parseInt(d.day)));
			if (Number.isFinite(maxDay) && maxDay > diffDays) diffDays = maxDay;
		}

		const selectedKey = finalMetrics?.[0] || 'dailyLTVRevenue';

		// ---- accessor builders so sorting uses the visible metric value ----
		const getTotalMetricValue = (row) => {
			const key = `${row.app_auto_id}|${row.country}`;
			const totals = rowWiseTotal[key];
			const lastAvailable = lastAvailableMap[key];

			if (!totals) return null;

			const finalRetention = totals?.average_retention;
			const totalActiveUsers = totals?.total_user;
			const totalRevenue = totals?.total_revenue;
			const totalCost = totals?.total_cost;
			const finalRoas = totalCost ? Number(totalRevenue / totalCost).toFixed(2) : 0;

			const totalRevUser = totalActiveUsers ? totalRevenue / totalActiveUsers : 0;
			const dailyLTVRevenue = lastAvailable?.data?.ltv * STATIC_INR;

			switch (selectedKey) {
				case 'finalRetention':
					return Number(finalRetention);
				case 'totalActiveUsers':
					return Number(totalActiveUsers);
				case 'totalRevenue':
					return Number(totalRevenue) * STATIC_INR;
				case 'totalCost':
					return Number(totalCost) * STATIC_INR;
				case 'finalRoas':
					return Number(finalRoas);
				case 'totalRevUser':
					return Number(totalRevUser) * STATIC_INR;
				case 'dailyLTVRevenue':
					return Number(dailyLTVRevenue);
				default:
					return null;
			}
		};

		const getDayMetricValue = (row, day) => {
			const d = row?.day_wise_retention?.find((x) => +x?.day === day);
			if (!d || !d?.is_available) return null;

			const finalRetention = Number(d?.asc_avg_retained_users_pct);
			const totalActiveUsers = d?.asc_total_retained_user;
			const totalRevenue = d?.asc_total_revenue * STATIC_INR;
			const totalCost = d?.asc_cost * STATIC_INR;
			const finalRoas = totalCost ? Number(totalRevenue / totalCost).toFixed(2) : 0;
			const totalRevUser = d?.asc_avg_arpu * STATIC_INR;
			const dailyLTVRevenue = d?.cumulative_ltv_revenue * STATIC_INR;

			switch (selectedKey) {
				case 'finalRetention':
					return Number(finalRetention);
				case 'totalActiveUsers':
					return Number(totalActiveUsers);
				case 'totalRevenue':
					return Number(totalRevenue);
				case 'totalCost':
					return Number(totalCost);
				case 'finalRoas':
					return Number(finalRoas);
				case 'totalRevUser':
					return Number(totalRevUser);
				case 'dailyLTVRevenue':
					return Number(dailyLTVRevenue);
				default:
					return null;
			}
		};

		// renderer for Total cell (keeps your tooltip UI)
		const renderTotalCell = (row) => {
			const r = row.original;
			const key = `${r.app_auto_id}|${r.country}`;
			const lastAvailable = lastAvailableMap[key];
			const totals = rowWiseTotal[key];

			if (!lastAvailable || !totals) return <div>-</div>;

			const finalRetention = totals?.average_retention;
			const totalActiveUsers = totals?.total_user;
			const totalRevenue = totals?.total_revenue;
			const totalCost = totals?.total_cost;
			const finalRoas = totalCost ? Number(totalRevenue / totalCost).toFixed(2) : 0;
			const totalRevUser = totalActiveUsers ? totalRevenue / totalActiveUsers : 0;
			const dailyLTVRevenue = lastAvailable?.data?.ltv * STATIC_INR;

			const defs = {
				finalRetention: { label: 'Retention', value: finalRetention, render: (v) => pct(v) },
				totalActiveUsers: { label: 'Total User', value: totalActiveUsers, render: (v) => num(v) },
				totalRevenue: { label: 'Revenue', value: totalRevenue, render: (v) => money(v, isDollarCheck) },
				totalCost: { label: 'Cost', value: totalCost, render: (v) => money(v, isDollarCheck) },
				finalRoas: { label: 'ROAS', value: finalRoas, render: (v) => num(v) },
				totalRevUser: { label: 'ARPU', value: totalRevUser, render: (v) => money(v, isDollarCheck) },
				dailyLTVRevenue: {
					label: 'Cumulative ARPU',
					value: dailyLTVRevenue,
					render: (v) => money(v, isDollarCheck),
				},
			};

			const sel = defs[selectedKey];
			const contentText = hasValue(sel?.value) ? sel.render(sel.value) : null;

			const tooltipItems = METRIC_ORDER.filter((k) => k !== selectedKey)
				.map((k) => {
					const d = defs[k];
					if (!d || !hasValue(d.value)) return null;
					return (
						<div key={k}>
							{d.label}: {d.render(d.value)}
						</div>
					);
				})
				.filter(Boolean);

			return (
				<Tippy
					content={
						<div className='copyMessage'>{tooltipItems.length ? tooltipItems : <div>No data</div>}</div>
					}
					placement='top'
					arrow
					duration={0}
					className='new_custom_tooltip'
					onMount={setPlacementClass}
				>
					<div className='custom_new_tooltip_wrap new_retention_wrap'>
						{contentText ? <div className='user_count'>{contentText}</div> : <div>-</div>}
					</div>
				</Tippy>
			);
		};

		// renderer for Day N cell (keeps your tooltip UI)
		const renderDayCell = (row, day) => {
			const d = row.original?.day_wise_retention?.find((x) => +x?.day === day);
			if (!d || !d?.is_available) return <div>-</div>;

			const finalRetention = Number(d?.asc_avg_retained_users_pct).toFixed(2);
			const totalActiveUsers = d?.asc_total_retained_user;
			const totalRevenue = d?.asc_total_revenue * STATIC_INR;
			const totalCost = d?.asc_cost * STATIC_INR;
			const finalRoas = totalCost ? Number(totalRevenue / totalCost).toFixed(2) : 0;
			const totalRevUser = d?.asc_avg_arpu * STATIC_INR;
			const dailyLTVRevenue = d?.cumulative_ltv_revenue * STATIC_INR;

			const defs = {
				finalRetention: { label: 'Retention', value: finalRetention, render: (v) => pct(v) },
				totalActiveUsers: { label: 'Total User', value: totalActiveUsers, render: (v) => num(v) },
				totalRevenue: { label: 'Revenue', value: totalRevenue, render: (v) => money(v, isDollarCheck) },
				totalCost: { label: 'Cost', value: totalCost, render: (v) => money(v, isDollarCheck) },
				finalRoas: { label: 'ROAS', value: finalRoas, render: (v) => num(v) },
				totalRevUser: { label: 'ARPU', value: totalRevUser, render: (v) => money(v, isDollarCheck) },
				dailyLTVRevenue: {
					label: 'Cumulative ARPU',
					value: dailyLTVRevenue,
					render: (v) => money(v, isDollarCheck),
				},
			};

			const sel = defs[selectedKey];
			const contentText = hasValue(sel?.value) ? sel.render(sel.value) : null;

			const tooltipItems = METRIC_ORDER.filter((k) => k !== selectedKey)
				.map((k) => {
					const dd = defs[k];
					if (!dd || !hasValue(dd.value)) return null;
					return (
						<div key={k}>
							{dd.label}: {dd.render(dd.value)}
						</div>
					);
				})
				.filter(Boolean);

			return (
				<Tippy
					content={
						<div className='copyMessage'>{tooltipItems.length ? tooltipItems : <div>No data</div>}</div>
					}
					placement='top'
					arrow
					duration={0}
					className='new_custom_tooltip'
					onMount={setPlacementClass}
				>
					<div className='custom_new_tooltip_wrap new_retention_wrap'>
						{contentText ? <div className='user_count'>{contentText}</div> : <div>-</div>}
					</div>
				</Tippy>
			);
		};

		// ---- TOTAL column (accessor returns numeric metric for sorting) ----
		const totalColumn = {
			id: 'total_last_available',
			header: () => (
				<div className='report-title'>
					<div className='analytics-header-dimension'>Total</div>
				</div>
			),
			accessorFn: (row) => getTotalMetricValue(row),
			sortUndefined: -1,
			cell: (ctx) => renderTotalCell(ctx.row),
			enableSorting: true,
			sortingFn: (rowA, rowB, columnId) => cmpNum(rowA.getValue(columnId), rowB.getValue(columnId)),
			size: columnWidths['total'] ? Number.parseInt(columnWidths['total']) : 100,
			minSize: 100,
			meta: {
				isDynamic: true,
				alignMent: 'right',
				sortValue: 'TOTAL_LAST_AVAILABLE',
				sortKey: 'TOTAL_LAST_AVAILABLE',
			},
		};

		// ---- Day columns (only for selected days) ----
		const selectedDays = new Set(dayCheckedColumn?.map((d) => +d.value) ?? []);
		const dayColumns = [];
		for (let day = 1; day <= diffDays; day++) {
			if (!selectedDays.has(day)) continue;

			dayColumns.push({
				id: `day_${day}`,
				header: () => (
					<div className='report-title'>
						<div className='analytics-header-dimension'>{`Day ${day}`}</div>
					</div>
				),
				accessorFn: (row) => getDayMetricValue(row, day),
				sortUndefined: -1,
				cell: (ctx) => renderDayCell(ctx.row, day),
				enableSorting: true,
				sortingFn: (rowA, rowB, columnId) => cmpNum(rowA.getValue(columnId), rowB.getValue(columnId)),
				size: columnWidths[day] ? Number.parseInt(columnWidths[day]) : 100,
				minSize: 100,
				meta: {
					isDynamic: true,
					alignMent: 'right',
					sortValue: { columnIndex: day - 1 },
					sortKey: { columnIndex: day - 1 },
				},
			});
		}

		return [totalColumn, ...dayColumns];
	}, [
		mainData,
		dayCheckedColumn,
		isDollarCheck,
		columnWidths,
		lastAvailableMap,
		rowWiseTotal,
		finalMetrics,
		setPlacementClass,
		METRIC_ORDER,
	]);
}

export function useARPUColumn({
	mainData,
	dayCheckedColumn,
	isDollarCheck,
	columnWidths,
	lastAvailableMap,
	rowWiseTotal,
	finalMetrics,
	setPlacementClass,
	METRIC_ORDER,
}) {
	const staticCols = useStaticColumns();

	const dynamicCols = useDynamicColumns({
		mainData,
		dayCheckedColumn,
		isDollarCheck,
		columnWidths,
		lastAvailableMap,
		rowWiseTotal,
		finalMetrics,
		setPlacementClass,
		METRIC_ORDER,
	});

	return useMemo(() => [...staticCols, ...dynamicCols], [staticCols, dynamicCols]);
}
