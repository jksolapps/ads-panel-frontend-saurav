/** @format */

import moment from 'moment/moment';
import { all_countries } from '../utils/report_filter.json';

function indianNumberFormat(value) {
	if (!value) {
		return '0';
	} else if (value === '$0') {
		return '-';
	}
	const parts = value.toString().split('.');
	const integer = parts[0];
	const decimal = parts.length > 1 ? '.' + parts[1] : '';
	const formattedInteger = integer.replace(/(\d)(?=(\d\d)+\d$)/g, '$1,');
	return formattedInteger + decimal;
}

function buildCsvData(result, totals, dimension, monthRange, monthlyTotal) {
	if (!Array.isArray(result) || result.length === 0) return [];

	const hasApps = dimension.includes('Apps');
	const hasMonth = dimension.includes('Month');
	const hasCountry = dimension.includes('Country');

	const keyMapping = {
		app_display_name: 'Apps',
		app_console_name: 'Console Name',
		app_store_id: 'Package Name',
		country: 'Country',
		advertiserAdCost: 'Total Cost ($)',
		totalAdRevenue: 'Total Revenue ($)',
		returnOnAdSpend: 'ROAS',
		baseMonth: 'Month',
	};

	// How many month buckets?
	let diffMonths = 0;

	if (Array.isArray(monthlyTotal) && monthlyTotal.length) {
		diffMonths = monthlyTotal.length;
	} else if (typeof monthRange === 'string' && monthRange.includes('-')) {
		const [startStr, endStrRaw] = monthRange.split('-');
		const endStr = endStrRaw || startStr;
		const startMomentLocal = moment(startStr, 'YYYY-MM').startOf('month');
		const endMomentLocal = moment(endStr, 'YYYY-MM').startOf('month');
		diffMonths = endMomentLocal.diff(startMomentLocal, 'months') + 1;
	}

	if (!diffMonths || diffMonths < 0) diffMonths = 0;

	const csvMonthLabels = Array.from({ length: diffMonths }, (_, idx) => `Month ${idx}`);

	// ----- Per-row CSV -----
	const converted = result.map((item) => {
		const row = {};

		if (hasApps) {
			row[keyMapping.app_display_name] = item.app_display_name || '';
			row[keyMapping.app_console_name] = item.app_console_name || '';
			row[keyMapping.app_store_id] = item.app_store_id || '';
		}
		if (hasMonth) {
			row[keyMapping.baseMonth] = item.baseMonth
				? moment(
						item.baseMonth,
						['YYYY-MM-DD', 'YYYY-MM', 'DD/MM/YYYY', 'MMM YY', moment.ISO_8601],
						true
				  ).format('MMM YY')
				: '';
		}
		if (hasCountry) {
			row[keyMapping.country] = item.country || '-';
		}

		const cost = Number(item.advertiserAdCost || 0);
		row[keyMapping.advertiserAdCost] = cost ? indianNumberFormat(cost.toFixed(2)) : '';

		const totalRev = Number(item.totalAdRevenue || 0);
		row[keyMapping.totalAdRevenue] = totalRev ? indianNumberFormat(totalRev.toFixed(2)) : '';

		const roas = Number(item.returnOnAdSpend || 0) * 100;
		row[keyMapping.returnOnAdSpend] = roas ? roas.toFixed(2) : '';

		// Month-wise ROAS columns
		const arr = item.month_wise_total || [];
		if (arr.length && diffMonths > 0) {
			arr.forEach((m) => {
				const idx = Number(m.month);
				if (Number.isNaN(idx)) return;
				if (idx < 0 || idx >= diffMonths) return;

				const label = csvMonthLabels[idx];
				if (!label) return;

				const pct = (Number(m.roas) || 0) * 100;
				row[label] = pct ? pct.toFixed(2) : '';
			});
		}

		return row;
	});

	// ----- Total row -----
	const totalRow = {};

	if (hasApps) {
		totalRow[keyMapping.app_display_name] = 'Total';
		totalRow[keyMapping.app_console_name] = '';
		totalRow[keyMapping.app_store_id] = '';
	}
	if (hasMonth) {
		totalRow[keyMapping.baseMonth] = '';
	}
	if (hasCountry) {
		totalRow[keyMapping.country] = '';
	}

	const totalCost = Number(totals?.advertiserAdCost || 0);
	const totalRev = Number(totals?.totalAdRevenue || 0);
	const totalRoas = totalCost > 0 ? (totalRev / totalCost) * 100 : 0;

	totalRow[keyMapping.advertiserAdCost] = totalCost ? indianNumberFormat(totalCost.toFixed(2)) : '';
	totalRow[keyMapping.totalAdRevenue] = totalRev ? indianNumberFormat(totalRev.toFixed(2)) : '';
	totalRow[keyMapping.returnOnAdSpend] = totalRoas ? totalRoas.toFixed(2) : '';

	// Month columns in total row – use monthlyTotal (already aggregated in worker)
	if (Array.isArray(monthlyTotal) && monthlyTotal.length) {
		monthlyTotal.forEach((mt) => {
			const idx = Number(mt.month);
			if (Number.isNaN(idx)) return;
			if (idx < 0 || idx >= diffMonths) return;

			const label = csvMonthLabels[idx];
			if (!label) return;

			const pct = (Number(mt.raw_roas) || 0) * 100;
			totalRow[label] = pct ? pct.toFixed(2) : '';
		});
	}

	converted.push(totalRow);
	return converted;
}

const memoizedFormatAPIData = (inputData, filterData, monthRange, dimension, selectedMonth) => {
	if (!inputData?.data?.length) return { result: [] };

	const isAppDimension = dimension.includes('Apps');
	const isCountryDimension = dimension.includes('Country');
	const isMonthDimension = dimension.includes('Month');

	const alpha2ToName = Object.fromEntries(all_countries.map((c) => [c.alpha2_code, c.name]));

	const APP_ALL = '__ALL_APPS__';
	const MONTH_ALL = '__ALL_MONTHS__';
	const COUNTRY_ALL = '__ALL_COUNTRIES__';

	const endMoment = moment().endOf('month');

	const selectedSet =
		Array.isArray(selectedMonth) && selectedMonth.length
			? new Set(selectedMonth.map((m) => String(m.item_value)))
			: null;

	const buildKey = (appId, month, country) => {
		const a = isAppDimension ? String(appId) : APP_ALL;
		const m = isMonthDimension ? String(month) : MONTH_ALL;
		const c = isCountryDimension ? String(country) : COUNTRY_ALL;
		return [a, m, c].join('_');
	};

	// ---- Cost lookup ----
	const costLookup = new Map();
	for (const c of inputData.costData || []) {
		const month = String(c.acbc_date);
		if (selectedSet && !selectedSet.has(month)) continue;
		const appId = String(c.app_auto_id);
		const country = String(c.country);
		const key = buildKey(appId, month, country);
		costLookup.set(key, (Number(c.cost) || 0) + (costLookup.get(key) || 0));
	}

	// ---- Grouping ----
	const grouped = new Map();
	for (const row of inputData.data) {
		const appId = String(row.app_auto_id);
		const baseMonth = String(row.csm_month);

		if (selectedSet && !selectedSet.has(baseMonth)) continue;

		const countryCode = String(row.csm_country_code || row.csm_country || '');
		const groupKey = buildKey(appId, baseMonth, countryCode);

		if (!grouped.has(groupKey)) {
			const matchedCost = costLookup.get(groupKey) || 0;
			grouped.set(groupKey, {
				app_auto_id: appId,
				baseMonth: baseMonth || undefined,
				country: isCountryDimension ? String(alpha2ToName[row.csm_country_code]) : undefined,
				cost: matchedCost,
				rows: [],
			});
		}

		const g = grouped.get(groupKey);

		if (isMonthDimension) {
			g.rows.push({
				month: Number(row.diff),
				revenue: Number(row.revenue) || 0,
			});
		} else {
			const revenueMonth = moment(
				baseMonth,
				['YYYY-MM-DD', 'YYYY-MM', 'DD/MM/YYYY', 'MMM YY', moment.ISO_8601],
				true
			).isValid()
				? moment(baseMonth, ['YYYY-MM-DD', 'YYYY-MM', 'DD/MM/YYYY', 'MMM YY', moment.ISO_8601], true)
						.startOf('month')
						.add(Number(row.diff) || 0, 'months')
				: moment(baseMonth)
						.startOf('month')
						.add(Number(row.diff) || 0, 'months');

			const bucket = Math.max(0, endMoment.diff(revenueMonth, 'months'));

			g.rows.push({
				month: bucket,
				revenue: Number(row.revenue) || 0,
			});
		}
	}

	// ---- Normalize / aggregate rows ----
	for (const g of grouped.values()) {
		if (!g.rows.length) continue;

		if (isMonthDimension) {
			const months = g.rows.map((r) => r.month);
			const maxMonth = Math.max(...months);
			const minMonth = Math.min(...months);
			const normalizedAgg = new Map();

			for (const r of g.rows) {
				const normalized = maxMonth - (r.month - minMonth);
				normalizedAgg.set(normalized, (normalizedAgg.get(normalized) || 0) + r.revenue);
			}

			g.rows = Array.from(normalizedAgg.entries())
				.sort((a, b) => a[0] - b[0])
				.map(([m, rev]) => ({ month: Number(m), revenue: rev }));
		} else {
			const byBucket = new Map();
			for (const r of g.rows) {
				byBucket.set(r.month, (byBucket.get(r.month) || 0) + r.revenue);
			}
			g.rows = Array.from(byBucket.entries())
				.sort((a, b) => a[0] - b[0])
				.map(([m, rev]) => ({ month: Number(m), revenue: rev }));
		}
	}

	const result = [];

	// ---- Build final rows ----
	for (const g of grouped.values()) {
		const { app_auto_id, baseMonth, rows, cost, country } = g;
		const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);

		let remaining = totalRevenue;
		const lastIndex = rows.length - 1;

		const month_wise_total = rows.map((r, idx) => {
			const currentRevenue = r.revenue;
			const nextOlderRevenue = rows[idx + 1]?.revenue; // month to the right (older)

			const roas = cost ? currentRevenue / cost : 0;
			const cumulative_roas = cost ? remaining / cost : 0;

			let percentageValue;

			if (idx === lastIndex) {
				// baseline
				percentageValue = 100;
			} else if (nextOlderRevenue == null) {
				percentageValue = 100;
			} else if (nextOlderRevenue === 0) {
				// avoid infinity; treat as 100 to keep stable
				percentageValue = currentRevenue === 0 ? 100 : 100;
			} else {
				percentageValue = (currentRevenue / Math.abs(nextOlderRevenue)) * 100;
			}

			let cssClass = 'revenue-normal';

			if (idx !== lastIndex && nextOlderRevenue != null) {
				const diff = currentRevenue - nextOlderRevenue;

				if (Math.abs(diff) >= 10) {
					if (percentageValue >= 110) {
						cssClass = 'revenue-increase';
					} else if (percentageValue <= 90) {
						cssClass = 'revenue-decrease';
					}
				}
			}

			remaining -= currentRevenue;

			return {
				month: String(r.month),
				value: currentRevenue,
				roas,
				cumulative_roas,
				percentage_change: percentageValue,
				class: cssClass,
			};
		});

		const appDetails = filterData?.list_apps?.find((a) => a.app_auto_id == app_auto_id) || {};

		result.push({
			...(isAppDimension && { app_auto_id }),
			...(isCountryDimension && { country }),
			baseMonth,
			month_wise_total,
			totalAdRevenue: totalRevenue,
			advertiserAdCost: cost,
			returnOnAdSpend: cost ? totalRevenue / cost : 0,
			...(({ app_campaigns, item_checked, ...rest }) => rest)(appDetails),
		});
	}

	// ---- Totals ----
	const totals = (() => {
		let totalAdRevenue = 0;
		let advertiserAdCost = 0;
		for (const item of result) {
			totalAdRevenue += Number(item.totalAdRevenue) || 0;
			advertiserAdCost += Number(item.advertiserAdCost) || 0;
		}
		return {
			totalAdRevenue,
			advertiserAdCost,
			roas: advertiserAdCost ? totalAdRevenue / advertiserAdCost : 0,
		};
	})();

	// ---- Monthly total (global) ----
	function calculateMonthlyTotal(data, monthRange) {
		const [startStr] = monthRange.split('-');
		const startMoment = moment(startStr.trim(), 'DD/MM/YYYY').startOf('month');
		const endMomentLocal = moment().endOf('month');
		const diffMonths = endMomentLocal.diff(startMoment, 'months') + 1;

		const revenueByMonth = Array(diffMonths).fill(0);
		const totalCost = data.reduce((acc, obj) => acc + (obj?.advertiserAdCost || 0), 0);

		for (const obj of data) {
			for (const mt of obj?.month_wise_total || []) {
				const idx = Number(mt.month);
				if (idx < diffMonths) revenueByMonth[idx] += mt.value;
			}
		}

		let cumulative = 0;
		const cumulativeMap = Array(diffMonths).fill(0);
		const roasMap = Array(diffMonths).fill(0);

		for (let i = diffMonths - 1; i >= 0; i--) {
			cumulative += revenueByMonth[i];
			cumulativeMap[i] = totalCost > 0 ? cumulative / totalCost : 0;
			roasMap[i] = totalCost > 0 ? revenueByMonth[i] / totalCost : 0;
		}

		const monthlyTotal = [];
		for (let i = 0; i < diffMonths; i++) {
			const labelMoment = endMomentLocal.clone().subtract(i, 'months');
			monthlyTotal.push({
				month: i,
				label: labelMoment.format('MMM YY'),
				average: cumulativeMap[i],
				raw_roas: roasMap[i],
				revenue: revenueByMonth[i],
				cost: totalCost,
			});
		}
		return monthlyTotal;
	}

	const monthlyTotal = calculateMonthlyTotal(result, monthRange);
	const csvData = buildCsvData(result, totals, dimension, monthRange, monthlyTotal);

	return { result, totals, monthlyTotal, csvData };
};

onmessage = function (e) {
	const { type, payload } = e.data;
	if (type === 'processData') {
		const { apiResponseData, filterData, monthRange, dimension, selectedMonth } = payload;

		const finalData = memoizedFormatAPIData(
			apiResponseData,
			filterData,
			monthRange,
			dimension,
			selectedMonth
		);

		postMessage({
			type: 'dataProcessed',
			payload: { finalData },
		});
	}
};
