/** @format */

// useRetentionColumns.js
/** @format */
import React, { useMemo, useCallback } from 'react';
import Tippy from '@tippyjs/react';
import { calculateColumnWidth, indianNumberFormat } from '../../utils/helper';
import AppInsightsInfoBox from '../GeneralComponents/AppInsightsInfoBox';

// numeric compare for sorting (handles NaN safely)
const cmpNum = (A, B) => {
	const a = Number.isFinite(+A) ? +A : -Infinity;
	const b = Number.isFinite(+B) ? +B : -Infinity;
	return a === b ? 0 : a < b ? -1 : 1;
};

export default function useARPURawColumn({
	// required data
	mainData = [],
	averageRetention = [], // [{ day, total_user, total_revenue, ... }]
	dayCheckedColumn = [], // [{label, value: "1"}, ...]
	totalSummary = {}, // { baseUser, avg_user, totalRevenueSum, totalCostSum }
	rowWiseTotal = {}, // keyed by rowKey, { total_cost, total_revenue, total_user, average_retention }
	lastAvailableByRowExternal, // optional precomputed map (if you already have one)

	// ui/calculations
	isDollarCheck = false,
	columnWidths = {}, // { total: 100, [day]: 100 }
	setPlacementClass, // tooltip onMount callback

	// optional overrides
	currencySymbolOverride, // '$' or '₹'
}) {
	// 1) stable row key for lookups
	const rowKeyFor = useCallback((row) => {
		return row.country && row.country !== '-'
			? `${row.ar_install_date}|${row.country}`
			: row.ar_install_date;
	}, []);

	// 2) max available day across averageRetention
	const diffDays = useMemo(() => {
		if (!averageRetention?.length) return 0;
		return Math.max(...averageRetention.map((d) => +d.day || 0));
	}, [averageRetention]);

	// 3) selected days set
	const selectedDaysSet = useMemo(() => {
		const s = new Set();
		for (let i = 0; i < dayCheckedColumn.length; i++) {
			const v = +dayCheckedColumn[i]?.value;
			if (v > 0) s.add(v);
		}
		return s;
	}, [dayCheckedColumn]);

	// 4) build per-row, per-day index + last-available map
	const { dayIndexByRow, lastAvailableByRow } = useMemo(() => {
		const dayMap = Object.create(null);
		const lastMap = Object.create(null);

		for (let i = 0; i < mainData.length; i++) {
			const row = mainData[i];
			const rk = rowKeyFor(row);

			const perDay = Object.create(null);
			const list = row?.day_wise_retention || [];

			let last = null;
			let lastDayNum = -1;

			for (let j = 0; j < list.length; j++) {
				const e = list[j];
				const dNum = +e.day;
				perDay[dNum] = e;

				// treat as "available" if either users or revenue present
				const hasUsers = Number(e?.arc_retained_users) > 0;
				const hasRevenue = Number(e?.arc_total_revenue) > 0;
				if ((hasUsers || hasRevenue) && dNum > lastDayNum) {
					last = e;
					lastDayNum = dNum;
				}
			}

			dayMap[rk] = perDay;
			lastMap[rk] = last || null;
		}

		// allow external override
		return {
			dayIndexByRow: dayMap,
			lastAvailableByRow: lastAvailableByRowExternal ?? lastMap,
		};
	}, [mainData, rowKeyFor, lastAvailableByRowExternal]);

	// 5) money helpers
	const currencySymbol = useMemo(
		() => (currencySymbolOverride ? currencySymbolOverride : isDollarCheck ? '$' : '₹'),
		[isDollarCheck, currencySymbolOverride]
	);
	const STATIC_INR = isDollarCheck ? 1 : 86;

	// ---------- static tanstack columns ----------
	const staticColumns = useMemo(
		() => [
			{
				id: 'app',
				accessorKey: 'app_display_name',
				header: () => (
					<div className='report-title' data-sort-value='APP'>
						<div className='report-header-dimension'>Apps</div>
					</div>
				),
				cell: ({ row }) => {
					const r = row.original;
					return (
						<AppInsightsInfoBox
							app_auto_id={r.app_auto_id}
							app_icon={r.app_icon}
							app_platform={r.app_platform}
							app_display_name={r.app_display_name}
							app_console_name={r.app_console_name}
							app_store_id={r.app_store_id}
							percentageInfo={false}
						/>
					);
				},
				enableSorting: true,
				sortingFn: 'alphanumeric',
				size: 150,
				meta: { fixed: true },
			},
			{
				id: 'date',
				accessorKey: 'ar_install_date',
				header: () => (
					<div className='report-title' data-sort-value='Date'>
						<div className='report-header-dimension'>Date</div>
					</div>
				),
				cell: ({ getValue }) => (
					<div className='campaign-column country-text center_cell'>{getValue()}</div>
				),
				enableSorting: true,
				sortingFn: 'datetime',
				meta: { style: { justifyContent: 'center !important' } },
			},
			{
				id: 'country',
				accessorKey: 'country',
				header: () => (
					<div className='report-title' data-sort-value='Country'>
						<div className='report-header-dimension' style={{ justifyContent: 'center' }}>
							Country
						</div>
					</div>
				),
				cell: ({ getValue }) => <div className='campaign-column country-text'>{getValue()}</div>,
				enableSorting: true,
				sortingFn: 'alphanumeric',
				meta: {
					style: { justifyContent: 'center !important' },
					sortKey: 'country',
					sortValue: 'Country',
				},
			},
		],
		[]
	);

	// ---------- dynamic tanstack columns (Cost, Total, Day N) ----------
	const dynamicColumns = useMemo(() => {
		if (!mainData?.length || !diffDays) return [];

		const lastDayValue = averageRetention[diffDays - 1] || {};
		const totalRevenueSum = Number((totalSummary?.totalRevenueSum || 0) * STATIC_INR);
		const totalCostSum = Number((totalSummary?.totalCostSum || 0) * STATIC_INR);
		const totalRetentionPct = totalSummary?.baseUser
			? (totalSummary?.avg_user / totalSummary?.baseUser) * 100
			: 0;
		const totalARPU = totalSummary?.baseUser
			? ((totalSummary?.totalRevenueSum || 0) * STATIC_INR) / totalSummary.baseUser
			: 0;
		const totalROAS = totalCostSum ? Number(totalRevenueSum / totalCostSum) : 0;

		// COST column
		const costColumn = {
			id: 'cost',
			header: () => (
				<div className='report-title'>
					<div className='analytics-header-dimension'>Cost</div>
					<div className='report-total-dimension'>
						{lastDayValue ? (
							<div className='user_count'>
								{currencySymbol}
								{indianNumberFormat(totalCostSum.toFixed(2))}
							</div>
						) : (
							<div>-</div>
						)}
					</div>
				</div>
			),
			accessorFn: (row) => {
				const rk = rowKeyFor(row);
				return rowWiseTotal[rk]?.total_cost ?? null;
			},
			sortUndefined: -1,
			cell: ({ row }) => {
				const rk = rowKeyFor(row.original);
				const totals = rowWiseTotal[rk];
				if (!totals) return <div>-</div>;
				const dailyTotalCost = (totals?.total_cost || 0) * STATIC_INR;
				return (
					<div className='custom_new_tooltip_wrap new_retention_wrap'>
						<div className='user_count'>
							{currencySymbol}
							{indianNumberFormat((dailyTotalCost || 0).toFixed(2))}
						</div>
					</div>
				);
			},
			enableSorting: true,
			sortingFn: (a, b, columnId) =>
				cmpNum(a.getValue(columnId) * STATIC_INR, b.getValue(columnId) * STATIC_INR),
			size: calculateColumnWidth(totalCostSum ? `$${Number(totalCostSum.toFixed(2))}` : '-', 10, 130),
			meta: { alignMent: 'right', style: { justifyContent: 'flex-end' } },
		};

		// TOTAL (last available LTV)
		const totalColumn = {
			id: 'total_last_available',
			header: () => (
				<div className='report-title'>
					<div className='analytics-header-dimension'>Total</div>
					<Tippy
						content={
							<div className='copyMessage'>
								<div>Retention: {totalRetentionPct?.toFixed(2)}%</div>
								<div>Total User: {indianNumberFormat(totalSummary?.baseUser || 0)}</div>
								<div>
									Revenue: {currencySymbol}
									{indianNumberFormat(totalRevenueSum.toFixed(2))}
								</div>
								<div>ROAS: {totalROAS.toFixed(2)}</div>
								<div>
									ARPU: {currencySymbol}
									{indianNumberFormat(totalARPU.toFixed(2))}
								</div>
							</div>
						}
						placement='top'
						arrow
						duration={0}
						className='new_custom_tooltip'
						onMount={setPlacementClass}
					>
						<div className='report-total-dimension'>
							{lastDayValue ? (
								<div className='user_count'>
									{currencySymbol}
									{indianNumberFormat(
										((lastDayValue.final_cumulative_ltv_rev || 0) * STATIC_INR).toFixed(2)
									)}
								</div>
							) : (
								<div>-</div>
							)}
						</div>
					</Tippy>
				</div>
			),
			accessorFn: (row) => {
				// return numeric value used for sorting — cumulative LTV at last available day
				const rk = rowKeyFor(row);
				const last = lastAvailableByRow[rk];
				return (last?.cumulative_ltv_revenue || 0) * STATIC_INR;
			},
			cell: ({ row }) => {
				const rk = rowKeyFor(row.original);
				const last = lastAvailableByRow[rk];
				const totals = rowWiseTotal[rk];
				if (!totals) return <div>-</div>;

				const dailyAverageRetention = totals?.average_retention;
				const dailyTotalUser = totals?.total_user || 0;
				const dailyTotalRevenue = (totals?.total_revenue || 0) * STATIC_INR;
				const dailyTotalCost2 = (totals?.total_cost || 0) * STATIC_INR;
				const dailyTotalROAS2 = dailyTotalCost2 ? Number(dailyTotalRevenue / dailyTotalCost2) : 0;
				const dailyRevUser = dailyTotalUser ? dailyTotalRevenue / dailyTotalUser : 0;
				const dailyLTVRevenue = (+last?.cumulative_ltv_revenue || 0) * STATIC_INR || 0;

				return (
					<Tippy
						content={
							<div className='copyMessage'>
								<div>Retention: {Number(dailyAverageRetention || 0).toFixed(2)}%</div>
								<div>Total User: {indianNumberFormat(dailyTotalUser)}</div>
								<div>
									Revenue: {currencySymbol}
									{indianNumberFormat(dailyTotalRevenue.toFixed(2))}
								</div>
								<div>ROAS: {dailyTotalROAS2.toFixed(2)}</div>
								<div>
									ARPU: {currencySymbol}
									{indianNumberFormat(dailyRevUser.toFixed(2))}
								</div>
							</div>
						}
						placement='top'
						arrow
						duration={0}
						className='new_custom_tooltip'
						onMount={setPlacementClass}
					>
						<div className='custom_new_tooltip_wrap new_retention_wrap'>
							<div className='user_count'>
								{currencySymbol}
								{indianNumberFormat(dailyLTVRevenue.toFixed(2))}
							</div>
						</div>
					</Tippy>
				);
			},
			enableSorting: true,
			sortingFn: (a, b, columnId) => cmpNum(a.getValue(columnId), b.getValue(columnId)),
			size: calculateColumnWidth(
				lastDayValue.final_cumulative_ltv_rev
					? `$${Number(lastDayValue.final_cumulative_ltv_rev).toFixed(2)}`
					: '-',
				8,
				100
			),
			meta: { alignMent: 'right', style: { justifyContent: 'flex-end' } },
		};

		// Day N columns
		const dayColumns = [];
		for (let day = 1; day <= diffDays; day++) {
			if (!selectedDaysSet.has(day)) continue;

			const totalValue = averageRetention[day - 1] || {};
			const isLast = day === diffDays;
			const totalRetentionDay = (totalValue.average_retention || 0).toFixed(2);
			const totalUserDay = indianNumberFormat(totalValue.total_user || 0);
			const totalRevenueDay = Number((totalValue.total_revenue || 0) * STATIC_INR);
			const totalARPUDay = totalValue.total_user
				? ((totalValue.total_revenue || 0) * STATIC_INR) / totalValue.total_user
				: 0;

			dayColumns.push({
				id: `day_${day}`,
				header: () => (
					<div className='report-title'>
						<div className='analytics-header-dimension'>Day {day}</div>
						<Tippy
							content={
								<div className='copyMessage'>
									<div>Retention: {totalRetentionDay}%</div>
									<div>Total User: {totalUserDay}</div>
									<div>
										Revenue: {currencySymbol}
										{indianNumberFormat(totalRevenueDay.toFixed(2))}
									</div>
									<div>
										ARPU: {currencySymbol}
										{indianNumberFormat(totalARPUDay.toFixed(2))}
									</div>
								</div>
							}
							placement='top'
							arrow
							duration={0}
							onMount={setPlacementClass}
							className={`new_custom_tooltip${isLast ? ' last-tooltip' : ''}`}
						>
							<div className='report-total-dimension'>
								{totalValue.final_cumulative_ltv_rev ? (
									<div className='user_count'>
										{currencySymbol}
										{indianNumberFormat(((totalValue.final_cumulative_ltv_rev || 0) * STATIC_INR).toFixed(2))}
									</div>
								) : (
									<div>-</div>
								)}
							</div>
						</Tippy>
					</div>
				),
				accessorFn: (row) => {
					// numeric value used for sorting — cumulative LTV for that exact day
					const rk = rowKeyFor(row);
					const d = dayIndexByRow[rk]?.[day];
					return (d?.cumulative_ltv_revenue ?? 0) * STATIC_INR || 0;
				},
				cell: ({ row }) => {
					const rk = rowKeyFor(row.original);
					const d = dayIndexByRow[rk]?.[day];
					if (!d) {
						return (
							<div className='custom_new_tooltip_wrap new_retention_wrap'>
								<div className='user_count'>{currencySymbol}0.00</div>
							</div>
						);
					}

					const dailyAverageRetention =
						Number((d?.retention_rate || '').toString().replace('%', '')) || 0;
					const dailyActiveUsers = Number(d?.arc_retained_users) || 0;
					const dailyRevenue = (Number(d?.arc_total_revenue) || 0) * STATIC_INR || 0;
					const dailyRevUser = dailyActiveUsers ? dailyRevenue / dailyActiveUsers : 0;
					const dailyLTVRevenue = (Number(d?.cumulative_ltv_revenue) || 0) * STATIC_INR || 0;

					return (
						<Tippy
							content={
								<div className='copyMessage'>
									<div className='tooltip_top'>{d?.installDate}</div>
									<div className='tooltip_body'>
										<div>Retention: {dailyAverageRetention.toFixed(2)}%</div>
										<div>Total User: {indianNumberFormat(dailyActiveUsers)}</div>
										<div>
											Revenue: {currencySymbol}
											{indianNumberFormat(dailyRevenue.toFixed(2))}
										</div>
										<div>
											ARPU: {currencySymbol}
											{indianNumberFormat(dailyRevUser.toFixed(2))}
										</div>
									</div>
								</div>
							}
							placement='top'
							arrow
							duration={0}
							onMount={setPlacementClass}
							className={`new_custom_tooltip${isLast ? ' last-tooltip' : ''} cell_tooltip`}
						>
							<div className='custom_new_tooltip_wrap new_retention_wrap'>
								<div className='user_count'>
									{currencySymbol}
									{indianNumberFormat(dailyLTVRevenue.toFixed(2))}
								</div>
							</div>
						</Tippy>
					);
				},
				enableSorting: true,
				sortingFn: (a, b, columnId) => cmpNum(a.getValue(columnId), b.getValue(columnId)),
				size: columnWidths[day] ? Number.parseInt(columnWidths[day]) : 100,
				minSize: 100,
				meta: {
					isDynamic: true,
					alignMent: 'right',
					style: { justifyContent: 'flex-end' },
					sortKey: { columnIndex: day - 1 },
					sortValue: { columnIndex: day - 1 },
				},
			});
		}

		return [costColumn, totalColumn, ...dayColumns];
	}, [
		mainData,
		diffDays,
		selectedDaysSet,
		averageRetention,
		totalSummary,
		STATIC_INR,
		currencySymbol,
		dayIndexByRow,
		lastAvailableByRow,
		rowKeyFor,
		columnWidths,
		setPlacementClass,
	]);

	const columns = useMemo(
		() => [...staticColumns, ...dynamicColumns],
		[staticColumns, dynamicColumns]
	);

	return { columns, rowKeyFor, diffDays, selectedDaysSet };
}
