/** @format */

import { useMemo } from 'react';
import moment from 'moment';
import AppInfoBox from '../GeneralComponents/AppInfoBox';
import {
	analyticFormatDate,
	displayNumber,
	formatTooltipValue,
	formatValue,
	indianNumberFormat,
	microValueConvert,
} from '../../utils/helper';

export function useCostColumns({
	appList,
	checkMark,
	summaryDateWise,
	diffDays,
	firstDate,
	lastDateInDashFormat,
	startDateInDashFormat,
	monthFilterActive,
	yearFilterActive,
	weekFilterActive,
	percentageInfo,
	finalShowFilter,
	selectedStartDate,
	handleDoubleClick,
	summaryData,
	percentageValue,
}) {
	function parseMetricValue(raw) {
		if (raw == null) return 0;

		// Already numeric
		if (typeof raw === 'number') {
			return Number.isFinite(raw) ? raw : 0;
		}

		// Handle accessorFn returning objects (like date-wise cells)
		if (typeof raw === 'object') {
			const candidate =
				raw.report_value_original ??
				raw.report_value ??
				raw.this_month_original ??
				raw.last_month_original ??
				raw.value ??
				raw.amount ??
				raw.metric ??
				null;

			if (candidate != null) {
				return parseMetricValue(candidate);
			}
			return 0;
		}

		if (typeof raw !== 'string') return 0;

		let v = raw.trim().toUpperCase();
		if (!v) return 0;

		// Handle accounting negative style: (1,234.56)
		let isNegative = false;
		if (v.startsWith('(') && v.endsWith(')')) {
			isNegative = true;
			v = v.slice(1, -1).trim();
		}

		// Detect percentage BEFORE stripping symbols
		const isPercent = v.includes('%');

		// Handle suffixes only when not percentage: K, M, B
		let multiplier = 1;
		if (!isPercent) {
			if (v.endsWith('K')) {
				multiplier = 1e3;
				v = v.slice(0, -1);
			} else if (v.endsWith('M')) {
				multiplier = 1e6;
				v = v.slice(0, -1);
			} else if (v.endsWith('B')) {
				multiplier = 1e9;
				v = v.slice(0, -1);
			}
		}

		// Strip everything except digits, decimal, sign
		v = v.replace(/[^0-9.+-]/g, '');
		if (!v) return 0;

		const num = parseFloat(v);
		if (!Number.isFinite(num)) return 0;

		let value = num;

		if (isPercent) {
			value = value / 100;
		} else {
			value = value * multiplier;
		}

		if (isNegative) value = -value;

		return value;
	}

	const numericSortingFn = (rowA, rowB, columnId) => {
		const a = parseMetricValue(rowA.getValue(columnId));
		const b = parseMetricValue(rowB.getValue(columnId));
		if (a === b) return 0;
		return a < b ? -1 : 1;
	};

	const staticColumns = useMemo(
		() => [
			{
				id: 'id',
				header: () => <div className='table-left-header'>Id</div>,
				cell: ({ row }) => <div>{row.index + 1}</div>,
				size: 48,
			},
			{
				id: 'app',
				header: () => <div className='table-left-header'>App</div>,
				accessorKey: 'app_display_name',
				size: 155,
				cell: (info) => {
					const app = info.row.original;
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
			},
			{
				id: 'last_updated',
				header: () => <div className='table-left-header'>Last Updated</div>,
				accessorKey: 'report_updated_at',
				size: 158,
				cell: ({ row }) => {
					const [dateString, timeString] = analyticFormatDate(row.original?.report_updated_at).split(
						','
					);
					return (
						<div title={row.original?.report_updated_at} className='report-updated-value text-center'>
							<div>{dateString?.trim()}</div>
							<div style={{ marginLeft: '10px', marginTop: '2px' }}>{timeString?.trim()}</div>
						</div>
					);
				},
				meta: {
					omit: !checkMark?.some((item) => item.type_auto_name == 'Last Updated'),
					omitValue: 'Last Updated',
				},
			},
			{
				id: 'last_month',
				header: () => (
					<div className='table-title'>
						<div className='table-left-header'>
							<div style={{ marginLeft: '5px' }}>Last</div>
							<div>Month</div>
						</div>
						<div>
							<div className='last-month-field' title={'$' + summaryData?.[0]?.Revenue?.last_month}>
								{summaryData?.[0]?.Revenue?.last_month
									? '$' + indianNumberFormat(formatValue(summaryData?.[0]?.Revenue?.last_month))
									: '-'}
							</div>
						</div>
					</div>
				),
				accessorKey: 'last_month_original',
				size: 95,
				cell: ({ row }) => {
					const app = row.original;
					return (
						<div
							className='last-month-cell no-select'
							title={indianNumberFormat(formatTooltipValue(app?.last_month_original))}
							onDoubleClick={handleDoubleClick}
							style={{ cursor: 'pointer' }}
						>
							<div className='primary-percentage-label last-month-column'>
								{app.last_month_original ? indianNumberFormat(formatValue(app.last_month_original)) : '-'}
							</div>
						</div>
					);
				},
				sortingFn: numericSortingFn,
				meta: {
					omit: !checkMark?.some((item) => item.type_auto_name == 'Last Month'),
					omitValue: 'Last Month',
				},
			},
			{
				id: 'this_month',
				header: () => (
					<div className='table-title this_month'>
						<div className='table-left-header'>
							<div style={{ marginLeft: '5px' }}>This</div>
							<div>Month</div>
						</div>
						<div className='this-month-percentage'>
							<div className='this-month-field'>
								<div
									className='primary-percentage-label'
									title={
										'$' +
										indianNumberFormat(formatTooltipValue(String(summaryData?.[0]?.Revenue?.this_month)))
									}
								>
									{summaryData?.[0]?.Revenue?.this_month
										? '$' + indianNumberFormat(formatValue(String(summaryData?.[0]?.Revenue?.this_month)))
										: '-'}
								</div>
							</div>
							<div className='secondary-percentage-label' id='this-month-percentage'>
								{percentageValue ? displayNumber(Math.abs(percentageValue)) + '%' : '-'}
							</div>
						</div>
					</div>
				),
				accessorKey: 'this_month_original',
				size: 120,
				cell: ({ row }) => {
					const app = row.original;
					let cssClass = '';
					let percentageValueLocal = 0;

					// EXACT behaviour from your old non-TanStack column: single metric
					const yesterdayValue = parseFloat(
						String(app?.last_month_original ?? '').replace(/[^\d.-]/g, '')
					);
					const currentValue = parseFloat(
						String(app?.this_month_original ?? '').replace(/[^\d.-]/g, '')
					);
					let percentChange = 0;
					if (yesterdayValue !== 0) {
						percentChange = (currentValue / Math.abs(yesterdayValue)) * 100;
					} else {
						percentChange = currentValue === 0 ? 0 : 100;
					}
					percentageValueLocal = percentChange;

					if (currentValue - yesterdayValue >= 10 || currentValue - yesterdayValue < 10) {
						if (percentChange >= 110) {
							cssClass += ' revenue-increase';
						}
					}
					app.percentage_change = String(percentChange ? percentChange : '0');

					return (
						<div
							className='this-month-cell no-select'
							title={indianNumberFormat(formatTooltipValue(app?.this_month_original))}
							onDoubleClick={handleDoubleClick}
							style={{ cursor: 'pointer' }}
						>
							<div className='primary-percentage-label'>
								{app.this_month_original ? indianNumberFormat(formatValue(app.this_month_original)) : '-'}
							</div>
							{
								<div className={`secondary-percentage-label ${cssClass}`}>
									{percentageValueLocal ? displayNumber(Math.abs(percentageValueLocal)) + '%' : '-'}
								</div>
							}
						</div>
					);
				},
				sortingFn: numericSortingFn,
				meta: {
					omit: !checkMark?.some((item) => item.type_auto_name == 'This Month'),
					omitValue: 'This Month',
				},
			},
		],
		[checkMark, handleDoubleClick, summaryData, percentageInfo, percentageValue]
	);

	const dynamicColumns = useMemo(() => {
		return Array.from({ length: diffDays }, (_, index) => {
			const currentDate = monthFilterActive
				? new Date(firstDate.getFullYear(), firstDate.getMonth() + (diffDays - index - 1), 1)
				: yearFilterActive
				? new Date(firstDate.getFullYear() + (diffDays - index - 1), 0, 1)
				: weekFilterActive
				? moment(firstDate)
						.add(diffDays - index - 1, 'weeks')
						.startOf('isoWeek')
						.toDate()
				: new Date(firstDate.getTime() + (diffDays - index - 1) * 24 * 3600 * 1000);

			const formattedDate = currentDate.toLocaleDateString('en-GB', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			});

			let formattedDateOutput;
			const currentYear = new Date().getFullYear();
			const dateYear = currentDate.getFullYear();
			if (currentYear === dateYear) {
				formattedDateOutput = currentDate.toLocaleDateString('en-GB', {
					day: '2-digit',
					month: '2-digit',
				});
			} else {
				formattedDateOutput = currentDate.toLocaleDateString('en-GB', {
					day: '2-digit',
					month: '2-digit',
					year: '2-digit',
				});
			}
			if (monthFilterActive) {
				formattedDateOutput = moment(currentDate).format('MMM YY');
			} else if (yearFilterActive) {
				formattedDateOutput = moment(currentDate).format('YYYY');
			} else if (weekFilterActive) {
				formattedDateOutput = moment(currentDate).format('GGGG[W]WW');
			}

			const formattedDay = currentDate.toLocaleDateString('en-GB', {
				weekday: 'short',
			});
			let firstLetterOfWeek = formattedDay.substring(0, 3);
			if (formattedDay.toLowerCase() === 'sun') {
				firstLetterOfWeek = formattedDay.substring(0, 3);
			}

			const responseformatDateOutput = monthFilterActive
				? formattedDate.split('/').reverse().join('-').substring(0, 7)
				: yearFilterActive
				? formattedDate.split('/').reverse().join('-').substring(0, 4)
				: weekFilterActive
				? moment(currentDate).format('GGGG-[W]WW')
				: formattedDate.split('/').reverse().join('-');

			const isDatePresent = appList?.some((app) =>
				app.data_by_date?.some((data) => data.report_date === responseformatDateOutput)
			);

			const dateObjects = summaryDateWise?.map((obj) => {
				const dateString = Object.keys(obj)[0];
				if (monthFilterActive) {
					const [year, month] = dateString.split('-');
					return { date: new Date(year, month - 1), data: obj[dateString] };
				} else if (yearFilterActive) {
					const [year] = dateString.split('-');
					return { date: new Date(year), data: obj[dateString] };
				} else if (weekFilterActive) {
					const m = moment(dateString, 'GGGG-[W]WW');
					return { date: m.toDate(), data: obj[dateString] };
				} else {
					const [day, month, year] = dateString.split('/');
					return { date: new Date(year, month - 1, day), data: obj[dateString] };
				}
			});

			dateObjects?.sort((a, b) => b.date - a.date);
			const sortedSummaryDateWise = dateObjects?.map((item) => {
				const year = item?.date?.getFullYear();
				const month = String(item?.date?.getMonth() + 1).padStart(2, '0');
				let dateString;
				if (monthFilterActive) {
					dateString = `${year}-${month}`;
				} else if (yearFilterActive) {
					dateString = `${year}`;
				} else if (weekFilterActive) {
					dateString = moment(item?.date).format('GGGG-[W]WW');
				} else {
					const day = String(item?.date?.getDate()).padStart(2, '0');
					dateString = `${year}-${month}-${day}`;
				}
				return { [dateString]: item?.data };
			});

			let data = sortedSummaryDateWise?.[index];
			let cssClass = '';
			let percentageChange = 0;
			let currentDateTotal;
			let currentRevenue;
			let revenueValue;

			if (data) {
				const dateKey = Object.keys(data)[0];
				const { revenue } = data[dateKey];
				revenueValue = revenue;

				currentDateTotal = dateKey;
				currentRevenue = microValueConvert(data[currentDateTotal].revenue);

				let inputDateObject;
				if (currentDateTotal) {
					if (weekFilterActive && /^\d{4}-W\d{2}$/.test(currentDateTotal)) {
						const [year, week] = currentDateTotal.split('-W');
						inputDateObject = moment().year(parseInt(year)).week(parseInt(week)).startOf('week').toDate();
					} else {
						inputDateObject = new Date(currentDateTotal);
					}
				}

				if (currentRevenue) {
					let previousDateValue = null;
					for (const item of sortedSummaryDateWise) {
						const dateKey2 = Object.keys(item)[0];
						const dateRegex = monthFilterActive
							? /^\d{4}-\d{2}$/
							: yearFilterActive
							? /^\d{4}$/
							: weekFilterActive
							? /^\d{4}-W\d{2}$/
							: /^\d{4}-\d{2}-\d{2}$/;

						let currentDateObject;
						if (dateRegex.test(dateKey2)) {
							if (weekFilterActive) {
								const [year, week] = dateKey2.split('-W');
								currentDateObject = moment()
									.year(parseInt(year))
									.week(parseInt(week))
									.startOf('week')
									.toDate();
							} else {
								currentDateObject = new Date(dateKey2);
							}
							if (currentDateObject < inputDateObject) {
								const previousDateObject = item[dateKey2];
								previousDateValue = microValueConvert(previousDateObject.revenue);
								break;
							}
						}
					}

					if (previousDateValue !== 0 && previousDateValue !== null) {
						percentageChange = (currentRevenue / Math.abs(previousDateValue)) * 100;
					} else {
						percentageChange =
							currentRevenue === 0
								? 0
								: monthFilterActive || yearFilterActive || weekFilterActive
								? null
								: 100;
					}

					const formattedDateOutputLocal = inputDateObject?.toLocaleDateString('en-GB', {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric',
					});
					const responseformatDateOutput2 = formattedDateOutputLocal.split('/').reverse().join('-');

					if (
						lastDateInDashFormat !== responseformatDateOutput2 &&
						startDateInDashFormat !== responseformatDateOutput2
					) {
						if (currentRevenue - previousDateValue >= 10 || currentRevenue - previousDateValue <= -10) {
							if (percentageChange >= 110) {
								cssClass += ' revenue-increase';
							} else if (percentageChange <= 90) {
								cssClass += ' revenue-decrease';
							}
						}
					} else if (
						lastDateInDashFormat === responseformatDateOutput2 &&
						startDateInDashFormat === responseformatDateOutput2
					) {
						if (currentRevenue - previousDateValue >= 10) {
							if (percentageChange >= 110) {
								cssClass += ' revenue-increase';
							}
						}
					}
				}
			}

			if (!isDatePresent) return null;

			// previous-year class on sort icon (same as old table)
			const [day, month, year] = selectedStartDate.split('/');
			const selectedYear = parseInt(year, 10);
			const currentYear2 = new Date().getFullYear();
			const isPreviousYear = selectedYear !== currentYear2;
			const elements = document.querySelectorAll('.__rdt_custom_sort_icon__');
			if (isPreviousYear) {
				elements.forEach((el) => el.classList.add('previous-year'));
			} else {
				elements.forEach((el) => el.classList.remove('previous-year'));
			}

			return {
				id: `date_${responseformatDateOutput}`,
				header: () => (
					<div className={`table-title ${isPreviousYear ? 'previous-year' : ''}`}>
						<div className='table-header'>
							<span className='table-date'>{formattedDateOutput}</span>
							{finalShowFilter.includes('DAY') && (
								<span className='table-day'>{'(' + firstLetterOfWeek + ')'}</span>
							)}
						</div>
						<div key={index} className='datewise-summary'>
							<div className='datewise-cell'>
								<div
									className='primary-percentage-label'
									title={indianNumberFormat(formatTooltipValue(String(revenueValue)))}
								>
									{revenueValue ? '$' + indianNumberFormat(formatValue(revenueValue)) : '-'}
								</div>
							</div>
							{
								<div className={`secondary-percentage-label ${cssClass}`}>
									{percentageChange ? displayNumber(Math.abs(percentageChange)) + '%' : '-'}
								</div>
							}
						</div>
					</div>
				),
				accessorFn: (row) => row.data_by_date?.find((d) => d.report_date === responseformatDateOutput),
				sortUndefined: -1,
				minSize: 115,
				meta: { isDynamic: true },
				sortingFn: numericSortingFn,
				cell: ({ row }) => {
					const app = row.original;
					const matchingData = app?.data_by_date?.find(
						(data) => data?.report_date === responseformatDateOutput
					);
					if (!matchingData) return <div>-</div>;

					let cssClassLocal = '';
					let percentageValueLocal = 0;

					// EXACTLY your old non-TanStack cell logic (single metric)
					const currentReportDate = matchingData?.report_date;

					const yesterdayData = monthFilterActive
						? app?.data_by_date.find((prevData) => {
								const prevDate = new Date(currentReportDate);
								prevDate.setMonth(prevDate.getMonth() - 1);
								const lastDayOfPrevMonth = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0);
								return (
									new Date(prevData.report_date) <= lastDayOfPrevMonth &&
									new Date(prevData.report_date) >
										new Date(
											new Date(currentReportDate).getFullYear(),
											new Date(currentReportDate).getMonth() - 1,
											1
										)
								);
						  })
						: yearFilterActive
						? app?.data_by_date.find((prevData) => {
								const prevYearDate = new Date(currentReportDate);
								prevYearDate.setFullYear(prevYearDate.getFullYear() - 1);
								return new Date(prevData.report_date).getFullYear() === prevYearDate.getFullYear();
						  })
						: weekFilterActive
						? app?.data_by_date.find((prevData) => {
								const prevWeek = moment(currentReportDate, 'GGGG-[W]WW')
									.subtract(1, 'weeks')
									.format('GGGG-[W]WW');
								return prevData.report_date === prevWeek;
						  })
						: app?.data_by_date.find(
								(prevData) =>
									new Date(prevData.report_date) < new Date(currentReportDate) &&
									new Date(prevData.report_date).getTime() ===
										new Date(currentReportDate).getTime() - 24 * 3600 * 1000
						  );

					if (yesterdayData && matchingData) {
						const yesterdayValue = parseFloat(
							String(yesterdayData?.report_value_original ?? '').replace(/[^\d.-]/g, '')
						);
						const currentValue = parseFloat(
							String(matchingData?.report_value_original ?? '').replace(/[^\d.-]/g, '')
						);
						let percentChange = 0;
						if (yesterdayValue !== 0 && yesterdayValue !== null) {
							percentChange = (currentValue / Math.abs(yesterdayValue)) * 100;
						} else {
							percentChange = currentValue === 0 ? 0 : 100;
						}
						percentageValueLocal = percentChange;

						if (lastDateInDashFormat !== matchingData?.report_date) {
							if (currentValue - yesterdayValue >= 10 || currentValue - yesterdayValue <= -10) {
								if (percentChange >= 110) {
									cssClassLocal += ' revenue-increase';
								} else if (percentChange <= 90) {
									cssClassLocal += ' revenue-decrease';
								}
							}
						} else if (lastDateInDashFormat === matchingData?.report_date) {
							if (currentValue - yesterdayValue >= 10 || currentValue - yesterdayValue <= -10) {
								if (percentChange >= 110) {
									cssClassLocal += ' revenue-increase';
								}
							}
						}
						matchingData.percentage_change = String(percentChange ? percentChange : '0');
					}

					return (
						<div
							className='table-report-value no-select'
							style={{ justifyContent: 'center' }}
							onDoubleClick={handleDoubleClick}
						>
							<div
								className='primary-percentage-label'
								title={indianNumberFormat(formatTooltipValue(matchingData?.report_value_original))}
							>
								{matchingData?.report_value_original
									? indianNumberFormat(formatValue(matchingData?.report_value_original))
									: '-'}
							</div>
							{
								<div className={`secondary-percentage-label ${cssClassLocal}`}>
									{percentageValueLocal ? displayNumber(Math.abs(percentageValueLocal)) + '%' : '-'}
								</div>
							}
						</div>
					);
				},
			};
		}).filter(Boolean);
	}, [
		diffDays,
		appList,
		firstDate,
		monthFilterActive,
		yearFilterActive,
		weekFilterActive,
		finalShowFilter,
		handleDoubleClick,
	]);

	return [...staticColumns, ...dynamicColumns];
}
