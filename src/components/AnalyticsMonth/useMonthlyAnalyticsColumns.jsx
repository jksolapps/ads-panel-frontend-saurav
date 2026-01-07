/** @format */

import React, { useMemo } from 'react';
import moment from 'moment';
import Tippy from '@tippyjs/react';
import GeneralTinyAppBox from '../GeneralComponents/GeneralTinyAppBox';

const cmpNum = (a, b) => {
	const A = Number.isFinite(+a) ? +a : -Infinity;
	const B = Number.isFinite(+b) ? +b : -Infinity;
	if (A === B) return 0;
	return A < B ? -1 : 1;
};

export default function useMonthlyAnalyticsColumns({
	// data
	mainData = [],
	totals = {},
	monthlyTotal = [],
	finalMonthRange = '',
	omittedColumnNames = [],
	selectedMonth,
	indianNumberFormat,
	displayNumber,
	calculateColumnWidth,
}) {
	// ---- base (static) columns ----
	const baseColumns = useMemo(() => {
		const columns = [
			// Apps
			{
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
						<GeneralTinyAppBox
							uniqueIdentifier='monthly_analytics'
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
				meta: { fixed: true, title: 'Apps' },
			},
			// Country
			{
				id: 'country',
				accessorKey: 'country',
				header: () => (
					<div className='report-title'>
						<div className=''>Country</div>
					</div>
				),
				cell: ({ getValue }) => (
					<div className='campaign-column country-text'>
						<div>{getValue() || '-'}</div>
					</div>
				),
				enableSorting: true,
				sortingFn: 'alphanumeric',
				size: 120,
				meta: {
					title: 'Country',
					style: { zIndex: '2 !important', backgroundColor: '#fff' },
				},
			},
			// Total Cost
			{
				id: 'totalCost',
				header: () => (
					<div className='report-title'>
						<div className='analytics-header-dimension'>Cost</div>
						<div className='report-total-dimension'>
							{totals?.advertiserAdCost
								? '$' + indianNumberFormat(Number(totals?.advertiserAdCost).toFixed(2))
								: '-'}
						</div>
					</div>
				),
				accessorKey: 'advertiserAdCost',
				accessorFn: (row) => Number(row?.advertiserAdCost ?? 0), // numeric for sorting
				cell: ({ row }) => {
					const v = row.original?.advertiserAdCost;
					const formatted = indianNumberFormat(displayNumber(v));
					const out = Number.isInteger(Number(formatted)) ? `${formatted}.00` : formatted;
					return <div>{v ? '$' + out : '-'}</div>;
				},
				enableSorting: true,
				sortingFn: (a, b, columnId) => cmpNum(a.getValue(columnId), b.getValue(columnId)),
				size: calculateColumnWidth(
					totals?.advertiserAdCost ? `$${Number(totals?.advertiserAdCost).toFixed(2)}` : '-',
					8,
					110
				),
				meta: {
					title: 'Cost',
					alignMent: 'right',
					style: {
						isDynamic: true,
						zIndex: '2 !important',
						backgroundColor: '#fff',
					},
				},
			},

			// Total Revenue
			{
				id: 'totalRevenue',
				header: () => (
					<div className='report-title'>
						<div className='analytics-header-dimension'>Revenue</div>
						<div className='report-total-dimension'>
							{totals?.totalAdRevenue
								? '$' + indianNumberFormat(Number(totals?.totalAdRevenue).toFixed(2))
								: '-'}
						</div>
					</div>
				),
				accessorKey: 'totalAdRevenue',
				accessorFn: (row) => Number(row?.totalAdRevenue ?? 0),
				cell: ({ row }) => {
					const v = row.original?.totalAdRevenue;
					const formatted = indianNumberFormat(displayNumber(v));
					const out = Number.isInteger(Number(formatted)) ? `${formatted}.00` : formatted;
					return <div>{v ? '$' + out : '-'}</div>;
				},
				enableSorting: true,
				sortingFn: (a, b, columnId) => cmpNum(a.getValue(columnId), b.getValue(columnId)),
				size: calculateColumnWidth(
					totals?.totalAdRevenue ? `$${Number(totals?.totalAdRevenue).toFixed(2)}` : '-',
					8
				),
				meta: {
					title: 'Revenue',
					alignMent: 'right',
					style: {
						isDynamic: true,
						zIndex: '2 !important',
						backgroundColor: '#fff',
					},
				},
			},

			// ROAS
			{
				id: 'roas',
				header: () => (
					<div className='report-title'>
						<div className='analytics-header-dimension'>ROAS</div>
						<div className='report-total-dimension'>
							{Number(Number(totals?.roas * 100 || 0).toFixed(2)).toLocaleString(undefined, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</div>
					</div>
				),
				accessorKey: 'returnOnAdSpend',
				accessorFn: (row) => Number(row?.returnOnAdSpend ?? 0),
				cell: ({ row }) => {
					const raw = row.original?.returnOnAdSpend;
					const num = Number(raw * 100);
					const roasValue = Number.isFinite(num) ? num : 0;
					return (
						<div className='report-total-dimension'>
							{Number(roasValue.toFixed(2)).toLocaleString(undefined, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</div>
					);
				},
				enableSorting: true,
				sortingFn: (a, b, columnId) => cmpNum(a.getValue(columnId), b.getValue(columnId)),
				size: calculateColumnWidth(
					totals?.roas ? `${Number(totals?.roas * 100).toFixed(2)}%` : '-',
					7,
					80
				),
				meta: {
					title: 'ROAS',
					alignMent: 'right',
					style: { zIndex: '2 !important', backgroundColor: '#fff' },
				},
			},
			// Month (flexibly parse baseMonth to avoid '-')
			{
				id: 'month',
				accessorKey: 'baseMonth',
				header: () => (
					<div className='report-title'>
						<div className=''>Month</div>
					</div>
				),
				cell: ({ row }) => {
					const bm = row?.original?.baseMonth;
					const dt = moment(String(bm), 'YYYYMM', true);
					return (
						<div className='campaign-column country-text'>
							<div>{dt.isValid() ? dt.format('MMM YY') : '-'}</div>
						</div>
					);
				},
				// strict YYYYMM -> millis for sorting
				accessorFn: (row) => {
					const dt = moment(String(row?.baseMonth), 'YYYYMM', true);
					return dt.isValid() ? dt.valueOf() : null;
				},
				enableSorting: true,
				sortingFn: (a, b, columnId) => cmpNum(a.getValue(columnId), b.getValue(columnId)),
				size: 85,
				meta: {
					title: 'Month',
					style: { zIndex: '2 !important', backgroundColor: '#fff' },
				},
			},
		];

		// apply omission via meta.omit so your renderer can respect it
		const omittedSet = new Set(
			(omittedColumnNames || []).map((x) => (typeof x === 'string' ? x : x?.item_name))
		);

		return columns.map((c) => ({
			...c,
			meta: { ...(c.meta || {}), omit: omittedSet.has(c.meta?.title) },
		}));
	}, [
		totals,
		omittedColumnNames,
		selectedMonth,
		calculateColumnWidth,
		indianNumberFormat,
		displayNumber,
	]);

	// ---- dynamic monthly columns (Month 1..N) ----
	const dynamicColumns = useMemo(() => {
		if (!Array.isArray(mainData) || mainData.length === 0) return [];

		// infer months to render from range
		const [startStr] = (finalMonthRange || '').split('-');
		const start = moment(startStr, 'DD/MM/YYYY', true).startOf('month');
		const end = moment(); // now
		const diffMonths = start.isValid() ? end.diff(start, 'months') + 1 : 0;

		// which month indexes exist in the data
		const availableMonths = new Set();
		for (const app of mainData) {
			(app?.month_wise_total || []).forEach((d) => {
				const idx = Number(d?.month); // 0-based
				if (Number.isInteger(idx)) availableMonths.add(idx + 1); // store 1..N for loop convenience
			});
		}

		const cols = [];
		for (let m = 1; m <= diffMonths; m++) {
			if (!availableMonths.has(m)) continue;

			const columnIndex = m - 1; // 0-based index in your data
			const totalValue = monthlyTotal.find((d) => +d?.month === columnIndex);

			cols.push({
				id: `m_${columnIndex}`,
				header: () => (
					<div className='report-title' data-sort-value={columnIndex}>
						<Tippy
							content={<div className='monthly_tooltip'>{totalValue.label}</div>}
							placement='top'
							arrow
							duration={0}
							zIndex={99999}
							className='new_custom_tooltip'
						>
							<div className='analytics-header-dimension'>{'Month ' + totalValue?.month}</div>
						</Tippy>
						<Tippy
							content={
								<div className='monthly_tooltip'>
									<div>
										Revenue :{' '}
										{totalValue?.revenue != null
											? '$' + indianNumberFormat(Number(totalValue?.revenue).toFixed(2))
											: '$0.00'}
									</div>
									<div>
										C.ROAS :{' '}
										{Number(Number(totalValue?.average ?? 0).toFixed(2)).toLocaleString(undefined, {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</div>
								</div>
							}
							placement='top'
							arrow
							duration={0}
							zIndex={99999}
							className='new_custom_tooltip'
						>
							<div className='report-total-dimension'>
								{Number(Number(totalValue?.raw_roas * 100 ?? 0).toFixed(2)).toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</div>
						</Tippy>
					</div>
				),
				accessorFn: (row) => {
					const hit = row?.month_wise_total?.find((d) => +d?.month === columnIndex);
					if (!hit || +hit.value === 0) return undefined; // "-" case
					const roas = Number(hit?.roas);
					return Number.isFinite(roas) ? roas : undefined;
				},
				sortUndefined: -1,
				enableSorting: true,
				sortingFn: (a, b, columnId) => cmpNum(a.getValue(columnId), b.getValue(columnId)),
				cell: ({ row }) => {
					const data = row.original?.month_wise_total?.find((d) => +d?.month === columnIndex);

					if (!data || +data.value === 0) {
						return (
							<div className='no-select' style={{ justifyContent: 'center' }}>
								<div className='primary-percentage-label roas-text roas-label'>-</div>
								<div className='primary-percentage-label roas-text roas-label demo-rev'>-</div>
							</div>
						);
					}

					const roas = Number(Number(data.roas * 100).toFixed(2)).toLocaleString(undefined, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					});

					const color_class = data?.class;
					const cum_roas = Number(Number(data.cumulative_roas).toFixed(2)).toLocaleString(undefined, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					});
					const percentageChange = Number(data.percentage_change).toFixed(2);
					const value = '$' + indianNumberFormat(Number(data.value).toFixed(2));
					const monthTitle = totalValue.label;

					return (
						<div className='no-select' style={{ justifyContent: 'center' }}>
							<Tippy
								content={
									<div className='copyMessage'>
										<div className='tooltip_top'>{monthTitle}</div>
										<div className='tooltip_body'>
											<div>Revenue : {value}</div>
											<div>C.ROAS : {cum_roas}</div>
										</div>
									</div>
								}
								placement='top'
								arrow
								duration={0}
								className='new_custom_tooltip cell_tooltip tooltip_shadow'
							>
								<div className='tippy_content'>
									<div className='primary-percentage-label roas-text roas-label'>{roas}</div>
									<div className={`primary-percentage-label roas-text roas-label demo-rev ${color_class}`}>
										{percentageChange + '%'}
									</div>
								</div>
							</Tippy>
						</div>
					);
				},
				minSize: 110,
				meta: {
					isDynamic: true,
					alignMent: 'right',
					style: { justifyContent: 'flex-end' },
					sortKey: { columnIndex },
					sortValue: { columnIndex },
				},
			});
		}
		return cols;
	}, [mainData, finalMonthRange, monthlyTotal, indianNumberFormat]);

	// final columns
	const columns = useMemo(() => [...baseColumns, ...dynamicColumns], [baseColumns, dynamicColumns]);

	return { columns };
}
