/** @format */

import { format, startOfMonth, endOfMonth, eachDayOfInterval, min as dateMin } from 'date-fns';
import {
	displayNumber,
	displayNumberRoas,
	formatNumberToKMB,
	indianNumberFormat,
} from '../../utils/helper';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { xirr } from '../../utils/lib';

const CalendarHeatMap = ({ data }) => {
	const [isDarkMode, setIsDarkMode] = useState(
		document.documentElement.classList.contains('dark_mode') ||
			document.body.classList.contains('dark_mode') ||
			localStorage.getItem('theme') === 'dark'
	);

	useEffect(() => {
		const observer = new MutationObserver(() => {
			const newDarkModeState =
				document.documentElement.classList.contains('dark_mode') ||
				document.body.classList.contains('dark_mode') ||
				localStorage.getItem('theme') === 'dark';
			setIsDarkMode(newDarkModeState);
		});

		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
		observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

		const handleStorageChange = () => {
			const newDarkModeState = localStorage.getItem('theme') === 'dark';
			setIsDarkMode(newDarkModeState);
		};
		window.addEventListener('storage', handleStorageChange);

		return () => {
			observer.disconnect();
			window.removeEventListener('storage', handleStorageChange);
		};
	}, []);

	const getIntensityColor = (roas) => {
		if (roas === null || roas === undefined || roas === 0) {
			return isDarkMode ? 'rgba(120, 120, 120, 0.05)' : 'rgba(224, 224, 224, 0.19)';
		}
		let baseColor, opacity;
		if (isDarkMode) {
			if (roas > 5) {
				baseColor = '0, 255, 0';
				opacity = Math.min(0.25 + ((roas - 5) / 5) * 0.5, 0.7);
			} else if (roas >= 1 && roas <= 5) {
				baseColor = '0, 200, 0';
				opacity = ((roas - 1) / 4) * 0.5 + 0.2;
			} else {
				baseColor = '255, 80, 80';
				opacity = (1 - roas) * 0.6 + 0.3;
			}
		} else {
			if (roas > 5) {
				baseColor = '0, 110, 0';
				opacity = Math.min(0.85 + ((roas - 5) / 5) * 0.3, 1);
			} else if (roas >= 1 && roas <= 5) {
				baseColor = '0, 128, 0';
				opacity = ((roas - 1) / 4) * 0.8 + 0.1;
			} else {
				baseColor = '255, 0, 0';
				opacity = (1 - roas) * 0.85 + 0.15;
			}
		}

		return `rgba(${baseColor}, ${opacity})`;
	};

	const uniqueMonths = useMemo(
		() =>
			Array.from(
				new Set(
					data.map((entry) => {
						const date = moment(entry.date);
						return date.format('YYYY-MM');
					})
				)
			),
		[data]
	);

	// XIRR Calculation
	const byDate = useMemo(() => {
		const m = new Map();
		for (const d of data) m.set(d.date, d);
		return m;
	}, [data]);

	function computeMonthAnnualReturn(year, month) {
		const monthStart = startOfMonth(new Date(year, month - 1));
		const monthEnd = endOfMonth(monthStart);
		const today = new Date();

		const base = monthStart;

		let monthTotalRevenue = 0;
		let monthTotalCost = 0;
		const cashflows = [];

		// push each day’s COST (negative) on its actual day within the month
		for (const day of eachDayOfInterval({ start: monthStart, end: monthEnd })) {
			const key = format(day, 'yyyy-MM-dd');
			const row = byDate.get(key);
			if (!row) continue;

			const cost = +row.advertiserAdCost || 0;
			const rev = +row.totalAdRevenue || 0;

			monthTotalCost += cost;
			monthTotalRevenue += rev;

			if (cost) cashflows.push({ date: day, amount: -cost });
		}

		if (monthTotalRevenue) {
			cashflows.push({ date: today, amount: monthTotalRevenue });
		}
		const r = xirr(cashflows, base);
		return {
			monthTotalRevenue,
			monthTotalCost,
			annualReturnPct: Number.isFinite(r) ? r * 100 : -100,
		};
	}

	const generateMonthHeatmap = (monthKey) => {
		const [year, month] = monthKey.split('-').map(Number);
		const firstDayOfMonth = startOfMonth(new Date(year, month - 1));
		const lastDayOfMonth = endOfMonth(new Date(year, month - 1));

		const startDayOfWeek = firstDayOfMonth.getDay();

		const leadingEmptyDays = Array.from({ length: startDayOfWeek }, (_, index) => (
			<div
				className={`calendar-hover`}
				key={`empty-leading-${index}`}
				style={{
					width: '100%',
					height: '50px',
					backgroundColor: 'transparent',
					padding: '10px',
					textAlign: 'center',
					fontSize: 'smaller',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					position: 'relative',
				}}
			></div>
		));

		let monthTotalRevenue = 0;
		let monthTotalCost = 0;
		const daysInMonth = eachDayOfInterval({
			start: firstDayOfMonth,
			end: lastDayOfMonth,
		});

		const weeks = [];
		let week = [...leadingEmptyDays];
		let weekTotalRevenue = 0;
		let weekTotalCost = 0;

		daysInMonth.forEach((day, index) => {
			const dateStr = format(day, 'yyyy-MM-dd');
			const match = data.find((d) => d.date === dateStr);
			const roas = match ? match.roas : null;
			const revenue = match ? +match.totalAdRevenue : null;
			const cost = match ? +match.advertiserAdCost : null;

			// Accumulate monthly totals
			monthTotalRevenue += revenue;
			monthTotalCost += cost;

			// Accumulate weekly totals
			weekTotalRevenue += revenue;
			weekTotalCost += cost;

			week.push(
				<div
					className={`calendar-hover ${Number(displayNumberRoas(roas)) == 0 ? 'zero-val' : ''}`}
					key={dateStr}
					style={{
						width: '100%',
						height: '50px',
						backgroundColor: getIntensityColor(roas),
						padding: '10px',
						textAlign: 'center',
						fontSize: 'smaller',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						position: 'relative',
					}}
				>
					<div className='calendar-date'>{day.getDate()}</div>
					<div className='label-value copy-text'>
						<div className='cost-revenue' style={{ color: '#000', fontSize: '14px' }}>
							{formatNumberToKMB(Number(displayNumberRoas(roas)), 'heatmap')}
						</div>
						<div className='copyMessage'>
							<div className='copyMessage_inner' style={{ marginBottom: '4px' }}>
								<div>Cost : </div>
								<div>{'$' + indianNumberFormat(displayNumber(cost))}</div>
							</div>
							<div className='copyMessage_inner'>
								<div style={{ width: '33.2px', justifyContent: 'end' }}>Rev : </div>
								<div>{'$' + indianNumberFormat(displayNumber(revenue))}</div>
							</div>
						</div>
					</div>
				</div>
			);

			if (day.getDay() === 6 || index === daysInMonth?.length - 1) {
				const weekTotalBlock = (
					<div key={`week-total-${weeks?.length}`} className='calendar-hover weekly_total'>
						<div className='label-value copy-text'>
							<div className='cost-revenue' style={{ color: '#000', fontSize: '14px' }}>
								{weekTotalCost != 0
									? formatNumberToKMB(Number(+weekTotalRevenue / +weekTotalCost), 'heatmap')
									: '0'}
							</div>
							<div className='copyMessage'>
								<div className='copyMessage_inner' style={{ marginBottom: '4px' }}>
									<div>Cost : </div>
									<div>{'$' + indianNumberFormat(displayNumber(weekTotalCost))}</div>
								</div>
								<div className='copyMessage_inner'>
									<div style={{ width: '33.2px', justifyContent: 'end' }}>Rev : </div>
									<div>{'$' + indianNumberFormat(displayNumber(weekTotalRevenue))}</div>
								</div>
							</div>
						</div>
					</div>
				);

				weeks.push([weekTotalBlock, ...week]);
				week = [];
				weekTotalRevenue = 0;
				weekTotalCost = 0;
			}
		});

		if (week.length > 0) {
			const trailingEmptyDays = Array.from({ length: 8 - week?.length }, (_, index) => (
				<div
					className='calendar-hover'
					key={`empty-trailing-${index}`}
					style={{
						width: '100%',
						height: '50px',
						backgroundColor: 'transparent',
						padding: '10px',
						textAlign: 'center',
						fontSize: 'smaller',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						position: 'relative',
					}}
				></div>
			));
			week = [...week, ...trailingEmptyDays];
			weeks.push(week);
		}
		const {
			monthTotalRevenue: mtRev,
			monthTotalCost: mtCost,
			annualReturnPct,
		} = computeMonthAnnualReturn(year, month);
		return {
			monthTotalRevenue: mtRev,
			monthTotalCost: mtCost,
			annualReturn: annualReturnPct,
			weeks,
		};
	};

	//sort
	// const sortedUniqueMonths = uniqueMonths.sort((a, b) => {
	// 	const [yearA, monthA] = a.split('-');
	// 	const [yearB, monthB] = b.split('-');
	// 	if (yearA !== yearB) {
	// 		return yearB - yearA;
	// 	}
	// 	return monthB - monthA;
	// });

	const sortedUniqueMonths = useMemo(() => {
		return [...uniqueMonths].sort((a, b) => {
			const [yearA, monthA] = a.split('-').map(Number);
			const [yearB, monthB] = b.split('-').map(Number);
			if (yearA !== yearB) {
				return yearB - yearA;
			}
			return monthB - monthA;
		});
	}, [uniqueMonths]);

	const months = useMemo(
		() => sortedUniqueMonths.map((monthKey) => generateMonthHeatmap(monthKey)),
		[sortedUniqueMonths, data]
	);

	// Vertical scroll
	const [currentBatch, setCurrentBatch] = useState(1);
	const [visibleData, setVisibleData] = useState([]);
	const batchSize = 3;
	const isMobile = window.innerWidth <= 576;

	useEffect(() => {
		setCurrentBatch(1);

		if (isMobile) {
			setVisibleData(months.slice(0, batchSize));
		} else {
			setVisibleData(months);
		}
	}, [months, isMobile]);

	useEffect(() => {
		if (!isMobile) return;

		const tableElement = document.querySelector('#root');
		if (!tableElement) return;

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = tableElement;
			const nextBatchStart = currentBatch * batchSize;

			if (scrollHeight - scrollTop <= clientHeight * 1.2 && nextBatchStart < months.length) {
				setVisibleData((prevData) => [
					...prevData,
					...months.slice(nextBatchStart, nextBatchStart + batchSize),
				]);
				setCurrentBatch((prevBatch) => prevBatch + 1);
			}
		};

		tableElement.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			tableElement.removeEventListener('scroll', handleScroll);
		};
	}, [currentBatch, months, isMobile]);

	return (
		<div
			className='calendar-main-box'
			style={{ gap: '18px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}
		>
			{visibleData?.map((monthHeatmap, index) => {
				const monthlyProfit = monthHeatmap?.monthTotalRevenue - monthHeatmap?.monthTotalCost;
				return (
					<div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
						<div className='header_top_bar'>
							<h6 className='header_title'>
								{moment(`${sortedUniqueMonths[index]}`, 'YYYY-MM-DD').format('MMMM YYYY')}
							</h6>
						</div>
						<div className='header_bottom_bar'>
							<div className='header_value'>
								<span className='week-title'>Rev : </span>
								<span>
									{' '}
									{'$' + indianNumberFormat(Number(monthHeatmap?.monthTotalRevenue)?.toFixed(2))}
								</span>
							</div>
							<div className='header_value'>
								<span className='week-title'>Cost : </span>
								<span>{'$' + indianNumberFormat(Number(monthHeatmap?.monthTotalCost)?.toFixed(2))}</span>
							</div>
							<div className='header_value calendar-rows'>
								<div className='label-value copy-text'>
									<div className='cost-roas' style={{ fontSize: '14px' }}>
										<span className='week-title'>ROAS : </span>
										<span>
											{monthHeatmap?.monthTotalCost != 0
												? Number(monthHeatmap?.monthTotalRevenue / monthHeatmap?.monthTotalCost)?.toFixed(2)
												: '0'}
										</span>
									</div>
									<div className='copyMessage'>
										<div className='copyMessage_inner'>
											<span>Profit :</span>
											<span>
												{(monthlyProfit < 0 ? '- $' : '$') +
													indianNumberFormat(+Math.abs(monthlyProfit)?.toFixed(2))}
											</span>
										</div>
										<div className='copyMessage_inner' style={{ marginTop: 5 }}>
											<span>XIRR :</span>
											<span>{Number(monthHeatmap.annualReturn).toFixed(2) + '%'}</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className='custom_week_header'>
							{['Week', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayLabel, index) => (
								<div key={index} style={{ textAlign: 'center' }}>
									{dayLabel}
								</div>
							))}
						</div>

						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								width: '100%',
								borderBottom: ' 1.5px solid rgba(0, 0, 0, 0.18)',
								borderLeft: ' 1.5px solid rgba(0, 0, 0, 0.18)',
								borderRight: ' 1.5px solid rgba(0, 0, 0, 0.18)',
								borderTop: ' 1px solid rgba(0, 0, 0, 0.18)',
							}}
							className='custom_week_body'
						>
							{monthHeatmap?.weeks?.map((week, weekIndex) => {
								const paddedWeek = [...week, ...Array(8 - week?.length).fill(null)].slice(0, 8);
								return (
									<div
										className={`calendar-rows${
											weekIndex === monthHeatmap.weeks.length - 1 ? ' last_week' : ''
										}`}
										key={weekIndex}
										style={{
											display: 'grid',
											gridTemplateColumns: '0.7fr repeat(7, 1fr)',
										}}
									>
										{paddedWeek.map((day, dayIndex) => {
											const isFirstNull =
												day === null && paddedWeek.slice(0, dayIndex).some((d) => d === null);
											const lastIndex = paddedWeek.reduce(
												(lastIdx, day, index) => (day?.key.includes('empty-leading') ? index : lastIdx),
												-1
											);
											return day ? (
												<div
													key={dayIndex}
													className={`day${day?.key.includes('empty-leading') ? ` empty_day ${day?.key}` : ''} `}
												>
													{day}
												</div>
											) : (
												<div
													key={dayIndex}
													className={`day ${isFirstNull ? 'empty_day' : 'empty_day first_null'}`}
												></div>
											);
										})}
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default CalendarHeatMap;
