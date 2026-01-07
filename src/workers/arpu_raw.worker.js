/** @format */

import {
	diffDaysYMD,
	todayYMD,
	diffDaysDates,
	formatYMD,
	toDateDMY,
	toDateYMD,
} from '../utils/pureHelper';
import { all_countries } from '../utils/report_filter.json';

const averageRetentionCache = new Map();
const formatRetentionCache = new Map();

const memoizedCalculateAverageRetention = (mainData, diffDays, STATIC_INR) => {
	const appIds = mainData
		?.map((item) => item.app_auto_id)
		.sort()
		.join(',');
	const installDates = mainData
		?.map((item) => item.ar_install_date)
		.sort()
		.join(',');
	const countries = mainData
		?.map((item) => item.country)
		.sort()
		.join(',');
	const key = `${appIds}-${installDates}-${countries}-${mainData.length}-${diffDays}-${STATIC_INR}`;
	if (averageRetentionCache.has(key)) return averageRetentionCache.get(key);

	let finalCumulativeLTV = 0;
	let totalRevenueSum = 0;
	let final_total_user = 0;
	let is_available_count = 0;

	const todayStr = todayYMD();
	const baseUsersPerDay = Array(diffDays).fill(0);

	let uniqueEntryCostSum = 0;

	for (const entry of mainData) {
		if (!entry.ar_install_date || !entry.day_wise_retention) continue;

		const installDateStr = entry.ar_install_date;

		const dayIndexMap = {};
		let day1RecordAny = null;

		let firstWithInstallDate = null;
		const firstRecord = entry.day_wise_retention[0];

		for (const rec of entry.day_wise_retention) {
			const d = parseInt(rec.day, 10);
			if (Number.isNaN(d)) continue;

			if (rec.installDate) {
				if (!dayIndexMap[d]) {
					dayIndexMap[d] = rec;
				}
				if (!firstWithInstallDate) {
					firstWithInstallDate = rec;
				}
			}
			if (d === 1 && !day1RecordAny) {
				day1RecordAny = rec;
			}
		}

		entry._dayIndexMap = dayIndexMap;

		// ----- baseUsersPerDay (strict "before today" like original) -----
		const day1Record = day1RecordAny;
		if (day1Record) {
			const baseUser = Number(day1Record.arc_retained_users) || 0;

			const diffToToday = diffDaysYMD(installDateStr, todayStr);

			if (diffToToday > 0) {
				const limit = Math.min(diffDays, diffToToday);
				for (let day = 1; day <= limit; day++) {
					baseUsersPerDay[day - 1] += baseUser;
				}
			}
		}

		// ----- uniqueEntryCostSum (exact same as original oneCostRecord chain) -----
		if (!entry?.day_wise_retention?.length) continue;

		let oneCostRecord =
			entry.day_wise_retention.find((d) => parseInt(d.day, 10) === 1 && d.installDate) ||
			firstWithInstallDate ||
			firstRecord;

		if (oneCostRecord) {
			uniqueEntryCostSum += Number(oneCostRecord.arc_total_cost || 0);
		}
	}

	// ----- Second pass: per-day aggregation (using indexed maps) -----
	const result = Array(diffDays)
		.fill(null)
		.map((_, idx) => {
			const day = idx + 1;
			let total_user = 0,
				total_revenue = 0,
				total_cost = 0,
				total_cumulative_ltv_revenue = 0;

			for (const entry of mainData) {
				const map = entry._dayIndexMap;
				if (!map) continue;
				const record = map[day]; // equivalent of .find(... day && d.installDate)
				if (!record) continue;

				const retainedUsers = Number(record.arc_retained_users) || 0;
				const revenue = Number(record.arc_total_revenue) || 0;
				const cost = Number(record.arc_total_cost) || 0;
				const ltv = Number(record.cumulative_ltv_revenue) || 0;

				total_user += retainedUsers;
				total_revenue += revenue;
				total_cumulative_ltv_revenue += ltv;
				total_cost += cost;
			}

			if (total_user > 0) is_available_count++;

			const baseUserForDay = baseUsersPerDay[idx];
			const average_retention = baseUserForDay ? (total_user / baseUserForDay) * 100 : 0;
			const final_ltv_rev =
				total_user > 0 ? (total_revenue / total_user) * (average_retention / 100) : 0;

			finalCumulativeLTV += final_ltv_rev;
			totalRevenueSum += total_revenue;
			final_total_user += total_user;

			return {
				day,
				base_user: baseUserForDay,
				total_user,
				total_revenue,
				total_cost,
				total_cumulative_ltv_revenue,
				average_retention,
				final_ltv_rev,
				final_cumulative_ltv_rev: finalCumulativeLTV,
			};
		});

	// cleanup temporary maps
	for (const entry of mainData) {
		if (entry._dayIndexMap) delete entry._dayIndexMap;
	}

	const finalResult = {
		averageRetention: result,
		totalSummary: {
			totalRevenueSum,
			totalCostSum: uniqueEntryCostSum,
			baseUser: result[0]?.base_user || 0,
			final_total_user,
			is_available_count,
			avg_user: is_available_count > 0 ? final_total_user / is_available_count : 0,
		},
	};

	averageRetentionCache.set(key, finalResult);
	return finalResult;
};

const memoizedFormatRetentionData = (
	apiResponse,
	selectedStartDate,
	finalAppId,
	filterData,
	finalCountry = []
) => {
	const data = apiResponse?.data || [];
	const costData = apiResponse?.cost_data || [];

	const alpha2ToName = Object.fromEntries(all_countries.map((c) => [c.alpha2_code, c.name]));

	const appIds =
		data
			?.map((item) => item.arc_app_auto_id || item.app_auto_id)
			.filter(Boolean)
			.sort()
			.join(',') || '';
	const installDates =
		data
			?.map((item) => item.arc_install_date)
			.filter(Boolean)
			.sort()
			.join(',') || '';
	const countries =
		data
			?.map((item) => item.arc_country)
			.filter(Boolean)
			.sort()
			.join(',') || '';

	const countryFilterKey = Array.isArray(finalCountry)
		? [...finalCountry].sort().join(',')
		: String(finalCountry || '');

	const key = `${appIds}-${installDates}-${countries}-${data.length || 0}-${
		selectedStartDate || ''
	}-${finalAppId || ''}-CF:${countryFilterKey}`;

	if (formatRetentionCache.has(key)) return formatRetentionCache.get(key);

	// build cost index: appId|date|country -> cost (same semantics)
	const costIndex = new Map();
	for (const cd of costData || []) {
		const appId = String(cd.acbc_app_auto_id ?? '').trim();
		if (!appId) continue;
		const d = toDateYMD(cd.acbc_date);
		if (!d) continue;
		const date = formatYMD(d);
		const countryCode = cd.acbc_country || null;
		if (!countryCode) continue;
		const k = `${appId}|${date}|${countryCode}`;
		const v = Number(cd.acbc_cost || 0);
		costIndex.set(k, (costIndex.get(k) || 0) + v);
	}

	for (const entry of data) {
		const installDate = entry.arc_install_date ? formatYMD(toDateYMD(entry.arc_install_date)) : null;
		const countryCode = entry.arc_country_code || null;
		const k = `${finalAppId}|${installDate}|${countryCode}`;
		entry.arc_total_cost = costIndex.get(k) || 0;
	}

	const todayStr = todayYMD();
	const retentionMap = new Map();

	for (const entry of data) {
		const {
			arc_install_date,
			arc_retention_date,
			arc_retained_users,
			arc_total_revenue,
			arc_country_code,
			arc_total_cost,
		} = entry;

		const retentionYMD = formatYMD(toDateYMD(arc_retention_date));
		if (!retentionYMD) continue;
		if (retentionYMD === todayStr) continue;

		const installYMD = formatYMD(toDateYMD(arc_install_date));
		if (!installYMD) continue;

		// original: diff = abs(moment(arc_retention_date).diff(moment(installDate), 'days'))
		const diff = Math.abs(diffDaysYMD(installYMD, retentionYMD));
		const groupKey = `${finalAppId}|${installYMD}|${arc_country_code}`;

		if (!retentionMap.has(groupKey)) {
			retentionMap.set(groupKey, { users: {}, revenue: {}, cost: {}, dates: {} });
		}

		const grouped = retentionMap.get(groupKey);
		const users = Number(arc_retained_users || 0);
		const revenue = Number(arc_total_revenue || 0);
		const cost = Number(arc_total_cost || 0);

		grouped.users[diff] = (grouped.users[diff] || 0) + users;
		grouped.revenue[diff] = (grouped.revenue[diff] || 0) + revenue;
		if (grouped.cost[0] == null && cost) {
			grouped.cost[0] = cost;
		}
		grouped.dates[diff] = retentionYMD;
	}

	const todayDate = new Date();
	const startDate = toDateDMY(selectedStartDate);
	const totalDiffRaw = startDate ? diffDaysDates(startDate, todayDate) : 0;
	const totalDiff = Math.min(Math.max(totalDiffRaw, 0), 180);

	const result = Array.from(retentionMap.entries()).map(([keyStr, grouped]) => {
		const [appId, installDateString, countryString] = keyStr.split('|');
		const installDate = installDateString === 'undefined' ? null : installDateString;
		const country = countryString === 'undefined' ? null : countryString;
		const baseUsers = grouped.users[0] || 0;
		const baseCostForInstallDate = grouped.cost[0] || 0;

		let prev = {
			count: grouped.users[0] || 0,
			revenue: grouped.revenue[0] || 0,
			cost: baseCostForInstallDate || 0,
			ltv_rev: 0,
			ltv_cost: 0,
			cur_ltv_rev: 0,
		};
		let is_available_count = 0;

		const dayWiseRetention = Array.from({ length: totalDiff }, (_, i) => {
			const day = i + 1;

			// original: if (moment(grouped.dates[i]).format('YYYY-MM-DD') === today) return null;
			// because retentionMap never stores "today" dates, this effectively means:
			//   if grouped.dates[i] is falsy/undefined -> skip
			const dateStr = grouped.dates[i];
			if (!dateStr) return null;

			const isPresent = grouped.users[i] !== undefined;
			const count = isPresent ? grouped.users[i] : 0;
			if (isPresent) is_available_count += 1;

			const finalRevenue = isPresent ? grouped.revenue[i] || 0 : 0;
			const finalCost = baseCostForInstallDate || 0;

			const finalRetentionRate = baseUsers > 0 ? (count / baseUsers) * 100 : 0;
			const ltvRetentionRate = finalRetentionRate / 100;

			const currentLTVRevenue = isPresent
				? i === 0
					? finalRevenue && count
						? finalRevenue / count
						: 0
					: finalRevenue && count
					? ltvRetentionRate * (finalRevenue / count)
					: 0
				: prev.cur_ltv_rev;

			const cumulativeLTVRevenue = isPresent ? prev.ltv_rev + currentLTVRevenue : prev.ltv_rev;

			prev = {
				count,
				revenue: finalRevenue,
				cost: finalCost,
				ltv_rev: cumulativeLTVRevenue,
				cur_ltv_rev: currentLTVRevenue,
			};

			return {
				day: `${day}`,
				installDate: dateStr || null,
				arc_retained_users: count,
				arc_total_revenue: finalRevenue,
				arc_total_cost: finalCost,
				ltv_revenue: currentLTVRevenue,
				cumulative_ltv_revenue: cumulativeLTVRevenue,
				retention_rate: baseUsers > 0 ? `${finalRetentionRate}%` : '0%',
			};
		}).filter(Boolean);

		const appDetails = filterData?.find((app) => app.app_auto_id == appId) || {};

		return {
			ar_install_date: installDate || '-',
			country: alpha2ToName[country] || '-',
			is_available_count,
			day_wise_retention: dayWiseRetention,
			...(({ app_campaigns, item_checked, ...rest }) => rest)(appDetails),
		};
	});

	formatRetentionCache.set(key, result);
	return result;
};

const buildPrecomputedMaps = (processedData, isDollarCheck) => {
	const STATIC_INR = isDollarCheck ? 1 : 86;
	const lastAvailableMap = {};
	const columnWidths = {};

	for (let i = 0; i < (processedData || []).length; i++) {
		const row = processedData[i];
		const key =
			row.country && row.country !== '-'
				? `${row.ar_install_date}|${row.country}`
				: row.ar_install_date;

		const daywise = row.day_wise_retention || [];
		for (let j = 0; j < daywise.length; j++) {
			const d = daywise[j];
			const dayNum = +d.day;
			const ltv = +d.cumulative_ltv_revenue || 0;

			const formatted =
				(isDollarCheck ? '$' : '₹') + indianNumberFormat((ltv * STATIC_INR).toFixed(2));
			const len = String(formatted).length;
			columnWidths[dayNum] = Math.max(columnWidths[dayNum] || 0, Math.max(100, len * 8 + 35));
		}

		for (let j = daywise.length - 1; j >= 0; j--) {
			const itm = daywise[j];
			if (+itm.arc_retained_users > 0 || +itm.arc_total_revenue > 0) {
				lastAvailableMap[key] = {
					day: +itm.day,
					data: {
						retention: +(itm.retention_rate?.replace('%', '') || 0),
						users: +itm.arc_retained_users || 0,
						revenue: +itm.arc_total_revenue || 0,
						ltv: +itm.cumulative_ltv_revenue || 0,
						installDate: itm.installDate || null,
					},
				};
				break;
			}
		}
	}

	const columnWidthsPx = {};
	for (const k in columnWidths) {
		columnWidthsPx[k] = `${columnWidths[k]}px`;
	}

	return { lastAvailableMap, columnWidths: columnWidthsPx };
};

const calculateRowWiseTotals = (mainData) => {
	const totalsByDate = {};
	mainData?.forEach(({ ar_install_date, country, day_wise_retention = [], is_available_count }) => {
		const key = country && country !== '-' ? `${ar_install_date}|${country}` : ar_install_date;
		const day1 = day_wise_retention.find((item) => +item.day === 1);
		const totalRevenue = day_wise_retention.reduce(
			(sum, item) => sum + (+item.arc_total_revenue || 0),
			0
		);
		const totalUser = day_wise_retention.reduce(
			(sum, item) => sum + (+item.arc_retained_users || 0),
			0
		);
		const cumulative_arpu = totalUser ? totalRevenue / totalUser : 0;
		const last = day_wise_retention.at(-1);

		const retainedUsers = +day1?.arc_retained_users || 0;
		const cumulativeLTV = +(last?.cumulative_ltv_revenue || 0);
		const totalCost = +(last?.arc_total_cost || 0);

		totalsByDate[key] = {
			total_revenue: totalRevenue,
			total_user: totalUser,
			cumulative_arpu,
			retained_users: retainedUsers,
			cumulative_ltv_revenue: cumulativeLTV,
			total_cost: totalCost,
			is_available_count,
		};
	});

	return totalsByDate;
};

const generateCsvData = (
	mainDataLocal,
	dayCheckedColumnLocal,
	isDollarCheckLocal,
	averageRetentionLocal = []
) => {
	if (!Array.isArray(mainDataLocal) || mainDataLocal.length === 0) return [];

	const diffDaysLocal = mainDataLocal.reduce((max, record) => {
		const arr = record.day_wise_retention || [];
		if (!arr.length) return max;
		const localMax = Math.max(
			max,
			...arr.map((item) => {
				const d = parseInt(item.day, 10);
				return Number.isNaN(d) ? 0 : d;
			})
		);
		return localMax;
	}, 0);

	const currencySymbol = isDollarCheckLocal ? ' ($)' : ' (₹)';
	const STATIC_INR = isDollarCheckLocal ? 1 : 86;

	const keyMapping = {
		app_display_name: 'Apps',
		app_console_name: 'Console Name',
		app_store_id: 'Package Name',
		ar_install_date: 'Date',
		country: 'Country',
	};

	const selectedDayNums = (dayCheckedColumnLocal || []).map(
		(d) => +String(d.name || '').replace('D', '')
	);
	const generatedDayNums = selectedDayNums.filter(
		(n) => !Number.isNaN(n) && n > 0 && n <= diffDaysLocal
	);
	const dayNames = new Set(generatedDayNums.map((n) => `D${n}`));

	const dataRows = mainDataLocal.map((item) => {
		const row = { Cost: '', Total: '' };
		const dayMap = new Map();
		let lastValidLtv = '';
		let lastValidCost = '';

		(item.day_wise_retention || []).forEach(
			({ day, arc_retained_users, cumulative_ltv_revenue, arc_total_cost }) => {
				const dayNum = +day;
				const key = `D${dayNum}`;
				const retained = +arc_retained_users || 0;
				const value = +cumulative_ltv_revenue || 0;
				const cost = +arc_total_cost || 0;

				const finalValue = retained ? (value * STATIC_INR).toFixed(2) : '';

				if (dayNames.has(key)) dayMap.set(key, finalValue);

				if (retained && dayNum <= diffDaysLocal) {
					lastValidLtv = finalValue;
					lastValidCost = (cost * STATIC_INR).toFixed(2);
				}
			}
		);

		row.Total = lastValidLtv;
		row.Cost = lastValidCost;

		for (const k in item) {
			if (k !== 'day_wise_retention') {
				row[k] = item[k];
			}
		}

		dayMap.forEach((value, key) => {
			row[key] = value;
		});

		return row;
	});

	const converted = dataRows.map((row) => {
		const csvRow = {};
		Object.entries(keyMapping).forEach(([orig, renamed]) => {
			csvRow[renamed] = row[orig] || '';
			if (orig === 'country') {
				csvRow['Cost' + currencySymbol] = row.Cost || '';
				csvRow['Total' + currencySymbol] = row.Total || '';
			}
		});

		Object.keys(row)
			.filter((key) => key.startsWith('D') && dayNames.has(key))
			.forEach((key) => {
				csvRow[key.replace('D', 'Day ') + currencySymbol] = row[key];
			});

		return csvRow;
	});

	const totalRow = { Apps: 'Summary' };
	Object.entries(keyMapping).forEach(([_, renamed]) => {
		if (renamed !== 'Apps') totalRow[renamed] = '';
	});

	const avgList = averageRetentionLocal || [];

	generatedDayNums.forEach((dayNum) => {
		const match = avgList.find((d) => d.day === dayNum);
		totalRow[`Day ${dayNum}${currencySymbol}`] = match
			? (match.final_cumulative_ltv_rev * STATIC_INR).toFixed(2)
			: '';
	});

	let dLastAvg = null;
	for (const d of avgList) {
		if (d.day <= diffDaysLocal && (!dLastAvg || d.day > dLastAvg.day)) {
			dLastAvg = d;
		}
	}

	const totalCostValue = dataRows.reduce((sum, r) => {
		const c = r.Cost ? parseFloat(r.Cost) : 0;
		return sum + (Number.isNaN(c) ? 0 : c);
	}, 0);

	totalRow['Total' + currencySymbol] = dLastAvg
		? (dLastAvg.final_cumulative_ltv_rev * STATIC_INR).toFixed(2)
		: '';
	totalRow['Cost' + currencySymbol] = totalCostValue.toFixed(2);

	converted.push(totalRow);

	return converted;
};

onmessage = (e) => {
	const { type, payload } = e.data;
	if (type === 'processArpuData') {
		const {
			apiResponseData,
			selectedStartDate,
			finalAppId,
			filterData,
			isDollarCheck,
			finalCountry,
			dayCheckedColumn,
		} = payload;

		const processed = memoizedFormatRetentionData(
			apiResponseData,
			selectedStartDate,
			finalAppId,
			filterData,
			finalCountry
		);

		const diffDays = processed.reduce((max, record) => {
			const arr = record.day_wise_retention || [];
			return Math.max(max, ...arr.map((d) => +d.day || 0));
		}, 0);

		const STATIC_INR = isDollarCheck ? 1 : 86;
		const avgRes = memoizedCalculateAverageRetention(processed, diffDays, STATIC_INR);
		const maps = buildPrecomputedMaps(processed, isDollarCheck);
		const totals = calculateRowWiseTotals(processed);

		const csvData = generateCsvData(
			processed,
			dayCheckedColumn || [],
			isDollarCheck,
			avgRes.averageRetention || []
		);

		postMessage({
			type: 'arpuDataProcessed',
			payload: {
				processed,
				averageRetention: avgRes.averageRetention,
				totalSummary: avgRes.totalSummary,
				columnWidths: maps.columnWidths,
				lastAvailableMap: maps.lastAvailableMap,
				rowWiseTotals: totals,
				csvData,
			},
		});
	}
};

function indianNumberFormat(num) {
	if (num === null || num === undefined) return '';
	num = Number(num).toFixed(2);
	let [integer, decimal] = num.split('.');
	integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return `${integer}.${decimal}`;
}
