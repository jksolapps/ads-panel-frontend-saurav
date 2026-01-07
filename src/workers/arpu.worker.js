/** @format */

const formatRetentionPlusCache = new Map();
const buildPrecomputedMapsCache = new Map();

const memoizedFormatRetentionPlusData = (inputData, filterData) => {
	const appIds =
		inputData
			?.map((item) => item.asc_app_auto_id)
			.filter(Boolean)
			.sort()
			.join(',') || '';
	const countries =
		inputData
			?.map((item) => item.asc_country)
			.filter(Boolean)
			.sort()
			.join(',') || '';
	const key = `${appIds}-${countries}-${inputData?.length || 0}-${
		filterData?.list_apps?.length || 0
	}`;
	if (formatRetentionPlusCache.has(key)) return formatRetentionPlusCache.get(key);
	const grouped = new Map();
	const maxDay = 180;

	inputData.forEach(
		({
			asc_app_auto_id,
			asc_country,
			asc_total_retained_user,
			asc_total_revenue,
			asc_day_number,
			asc_avg_retained_users_pct,
			asc_avg_arpu,
			asc_cost,
		}) => {
			const key = `${asc_app_auto_id}|${asc_country}`;
			if (!grouped.has(key)) grouped.set(key, new Map());
			grouped.get(key).set(+asc_day_number, {
				asc_avg_retained_users_pct: Number(asc_avg_retained_users_pct),
				asc_avg_arpu: Number(asc_avg_arpu),
				asc_total_retained_user: Number(asc_total_retained_user),
				asc_total_revenue: Number(asc_total_revenue),
				asc_cost: Number(asc_cost),
				is_available: true,
			});
		}
	);

	grouped.forEach((daysMap) => {
		for (let i = 0; i < maxDay; i++) {
			if (!daysMap.has(i)) {
				daysMap.set(i, {
					asc_avg_retained_users_pct: 0,
					asc_avg_arpu: 0,
					asc_total_retained_user: 0,
					asc_total_revenue: 0,
					asc_cost: 0,
					is_available: false,
				});
			}
		}
	});

	const result = Array.from(grouped.entries()).map(([key, daysMap], idx) => {
		const [app_auto_id, country] = key.split('|');

		let lastKnown = null;
		let cumulativeLTV = 0;
		let cumulativeRevenue = 0;
		let is_available_count = 0;
		let lastAvailableSnapshot = null;

		const day_wise_retention = Array.from({ length: maxDay }, (_, i) => {
			lastKnown = daysMap.get(i) ?? lastKnown;
			if (!lastKnown) return null;
			const {
				asc_avg_arpu,
				asc_avg_retained_users_pct,
				asc_total_retained_user,
				asc_total_revenue,
				asc_cost,
				is_available,
			} = lastKnown;
			if (!is_available) return null;
			const ltv_revenue = (+asc_avg_arpu * +asc_avg_retained_users_pct) / 100;
			if (is_available) {
				cumulativeLTV += ltv_revenue;
				cumulativeRevenue += Number(asc_total_revenue);
				is_available_count += 1;
				lastAvailableSnapshot = {
					day: String(i + 1),
					asc_avg_retained_users_pct: Number(asc_avg_retained_users_pct),
					asc_avg_arpu: Number(asc_avg_arpu),
					asc_cost: Number(asc_cost),
					ltv_revenue,
					cumulative_ltv_revenue: cumulativeLTV,
					asc_total_retained_user,
					asc_total_revenue,
					total_cumulative_revenue: cumulativeRevenue,
					is_available,
					is_available_count,
				};
			}
			return {
				day: String(i + 1),
				asc_avg_retained_users_pct: Number(asc_avg_retained_users_pct),
				asc_avg_arpu: Number(asc_avg_arpu),
				asc_cost: Number(asc_cost),
				ltv_revenue: is_available ? ltv_revenue : null,
				cumulative_ltv_revenue: is_available ? cumulativeLTV : null,
				asc_total_retained_user: is_available ? asc_total_retained_user : null,
				asc_total_revenue: is_available ? asc_total_revenue : null,
				total_cumulative_revenue: is_available ? cumulativeRevenue : null,
				is_available,
			};
		}).filter(Boolean);

		const day1 = day_wise_retention.find((item) => +item.day == 1);
		const totalRevenue = day_wise_retention.reduce(
			(sum, item) => sum + (+item.asc_total_revenue || 0),
			0
		);
		const totalCost = day_wise_retention.reduce((sum, item) => sum + (+item.asc_cost || 0), 0);
		const totalUser = day_wise_retention.reduce(
			(sum, item) => sum + (+item.asc_total_retained_user || 0),
			0
		);
		const last = day_wise_retention.at(-1);
		const retainedUsers = +day1?.asc_total_retained_user || 0;
		const cumulativeLTVFinal = +(last?.cumulative_ltv_revenue || 0);
		const avgUser = totalUser / (lastAvailableSnapshot?.is_available_count || 1);
		const average_retention = retainedUsers ? (avgUser / retainedUsers) * 100 : 0;
		const cumulative_arpu = retainedUsers ? totalRevenue / retainedUsers : 0;

		const totalSummary = {
			asc_total_retained_user: retainedUsers,
			asc_total_revenue: totalRevenue,
			asc_cost: totalCost,
			asc_avg_arpu: cumulative_arpu,
			cumulative_ltv_revenue: cumulativeLTVFinal,
			country: country || '-',
			asc_avg_retained_users_pct: average_retention,
		};

		const appDetails = filterData.list_apps?.find((app) => app.app_auto_id == app_auto_id) || {};
		return {
			_index: idx + 1,
			country,
			day_wise_retention,
			last_available: lastAvailableSnapshot,
			totalSummary,
			app_auto_id,
			...(({ app_campaigns, item_checked, ...rest }) => rest)(appDetails),
		};
	});

	formatRetentionPlusCache.set(key, result);
	return result;
};

const buildPrecomputedMaps = (processedData, isDollarCheck, finalMetrics) => {
	const STATIC_INR = isDollarCheck ? 1 : 86;
	const selectedMetric = finalMetrics?.[0] || 'dailyLTVRevenue';
	const appIds =
		processedData
			?.map((item) => item.app_auto_id)
			.filter(Boolean)
			.sort()
			.join(',') || '';
	const countries =
		processedData
			?.map((item) => item.country)
			.filter(Boolean)
			.sort()
			.join(',') || '';
	const key = `${appIds}-${countries}-${
		processedData?.length || 0
	}-${isDollarCheck}-${selectedMetric}`;
	if (buildPrecomputedMapsCache.has(key)) return buildPrecomputedMapsCache.get(key);

	const lastAvailableMap = {};
	const columnWidths = {};

	for (let i = 0; i < (processedData || []).length; i++) {
		const row = processedData[i];
		const rowKey = `${row.app_auto_id}|${row.country}`;
		const daywise = row.day_wise_retention || [];
		const lastDay = row.last_available || {};

		for (let j = 0; j < daywise.length; j++) {
			const d = daywise[j];
			const dayNum = +d.day;
			let formatted = formatMetricValue(d, selectedMetric, STATIC_INR, isDollarCheck);
			const len = String(formatted).length;
			columnWidths[dayNum] = Math.max(columnWidths[dayNum] || 0, Math.max(100, len * 8 + 35));
		}

		if (Object.keys(lastDay).length > 0) {
			let formattedTotal = formatMetricValue(lastDay, selectedMetric, STATIC_INR, isDollarCheck);
			const lenTotal = String(formattedTotal).length;
			const multiplyBy = selectedMetric === 'totalRevenue' || selectedMetric === 'totalCost' ? 20 : 10;
			columnWidths['total'] = Math.max(
				columnWidths['total'] || 0,
				Math.max(100, lenTotal * multiplyBy + 35)
			);
		}

		for (let j = daywise.length - 1; j >= 0; j--) {
			const itm = daywise[j];
			if (itm.is_available) {
				lastAvailableMap[rowKey] = {
					day: +itm.day,
					data: {
						retention: +itm.asc_avg_retained_users_pct || 0,
						users: +itm.asc_total_retained_user || 0,
						revenue: +itm.asc_total_revenue || 0,
						ltv: +itm.cumulative_ltv_revenue || 0,
						total_cumulative_revenue: +itm.total_cumulative_revenue || 0,
					},
				};
				break;
			}
		}
	}

	const columnWidthsPx = {};
	for (const k in columnWidths) columnWidthsPx[k] = `${columnWidths[k]}px`;

	const result = { lastAvailableMap, columnWidths: columnWidthsPx };
	buildPrecomputedMapsCache.set(key, result);
	return result;
};

const calculateRowWiseTotals = (mainData, STATIC_INR = 1) => {
	const totalsByKey = {};
	mainData?.forEach(({ app_auto_id, country, day_wise_retention = [], last_available }) => {
		const key = `${app_auto_id}|${country}`;
		const day1 = day_wise_retention.find((item) => +item.day == 1);
		const totalRevenue = day_wise_retention.reduce(
			(sum, item) => sum + (+item.asc_total_revenue || 0),
			0
		);
		const totalCost = day_wise_retention.reduce((sum, item) => sum + (+item.asc_cost || 0), 0);
		const totalUser = day_wise_retention.reduce(
			(sum, item) => sum + (+item.asc_total_retained_user || 0),
			0
		);
		const cumulative_arpu = totalUser ? totalRevenue / totalUser : 0;
		const last = day_wise_retention.at(-1);
		const retainedUsers = +day1?.asc_total_retained_user || 0;
		const cumulativeLTV = +(last?.cumulative_ltv_revenue || 0);
		const avgUser = totalUser / last_available?.is_available_count;
		const average_retention = retainedUsers ? (avgUser / retainedUsers) * 100 : 0;

		if (!totalsByKey[key]) {
			totalsByKey[key] = {
				total_user: 0,
				total_revenue: 0,
				total_cost: 0,
				final_cumulative_ltv_rev: 0,
				country: country || '-',
			};
		}
		totalsByKey[key].total_user += retainedUsers;
		totalsByKey[key].total_revenue += totalRevenue * STATIC_INR;
		totalsByKey[key].total_cost += totalCost * STATIC_INR;
		totalsByKey[key].final_cumulative_ltv_rev += cumulativeLTV * STATIC_INR;
		totalsByKey[key].cumulative_arpu = cumulative_arpu;
		totalsByKey[key].average_retention = average_retention;
	});

	return totalsByKey;
};

function getMetricRawValue(d, selectedMetric, STATIC_INR) {
	switch (selectedMetric) {
		case 'finalRetention':
			return +d.asc_avg_retained_users_pct || 0;
		case 'totalActiveUsers':
			return +d.asc_total_retained_user || 0;
		case 'totalRevenue':
			return (+d.asc_total_revenue || 0) * STATIC_INR;
		case 'totalCost':
			return (+d.asc_cost || 0) * STATIC_INR;
		case 'totalRevUser':
			return (+d.asc_avg_arpu || 0) * STATIC_INR;
		case 'dailyLTVRevenue':
		default:
			return (+d.cumulative_ltv_revenue || 0) * STATIC_INR;
	}
}

const getCsvData = (
	mainDataLocal,
	dayCheckedColumnLocal,
	isDollarCheckLocal,
	finalMetrics,
	rowWiseTotals
) => {
	const STATIC_INR = isDollarCheckLocal ? 1 : 86;
	const selectedMetric = finalMetrics?.[0] || 'dailyLTVRevenue';

	const diffDays = mainDataLocal.reduce(
		(max, record) => Math.max(max, ...record.day_wise_retention.map((item) => parseInt(item.day))),
		0
	);

	const metricSuffix =
		selectedMetric === 'finalRetention'
			? ' (%)'
			: selectedMetric === 'totalActiveUsers'
			? ''
			: isDollarCheckLocal
			? ' ($)'
			: ' (₹)';

	const keyMapping = {
		app_display_name: 'Apps',
		app_console_name: 'Console Name',
		app_store_id: 'Package Name',
		country: 'Country',
	};

	const selectedDayNums = dayCheckedColumnLocal.map((d) => +d.value);
	const generatedDayNums = selectedDayNums.filter((n) => n <= diffDays);
	const dayNames = new Set(generatedDayNums.map((n) => `D${n}`));

	const dataRows = mainDataLocal.map((item) => {
		const row = {};
		const dayMap = new Map();

		// Row key (to match rowWiseTotals)
		const rowKey = `${item.app_auto_id}|${item.country}`;
		const totals = rowWiseTotals?.[rowKey] || {};

		item.day_wise_retention?.forEach((d) => {
			const dayNum = +d.day;
			const key = `D${dayNum}`;
			const value = getMetricRawValue(d, selectedMetric, STATIC_INR);
			if (dayNames.has(key)) dayMap.set(key, value);
		});

		// Calculate TOTAL based on selected metric
		let totalValue = '';
		switch (selectedMetric) {
			case 'finalRetention':
				totalValue = (totals.average_retention || 0).toFixed(2);
				break;
			case 'totalActiveUsers':
				totalValue = totals.total_user || 0;
				break;
			case 'totalRevenue':
				totalValue = (totals.total_revenue || 0).toFixed(2);
				break;
			case 'totalCost':
				totalValue = (totals.total_cost || 0).toFixed(2);
				break;
			case 'totalRevUser':
				totalValue = (totals.total_user ? totals.total_revenue / totals.total_user : 0).toFixed(2);
				break;
			case 'dailyLTVRevenue':
			default:
				totalValue = (totals.final_cumulative_ltv_rev || 0).toFixed(2);
				break;
		}

		row.Total = totalValue;

		// Copy basic item info
		Object.entries(item).forEach(([key, value]) => {
			if (key !== 'day_wise_retention') row[key] = value;
		});
		dayMap.forEach((value, key) => (row[key] = value));

		return row;
	});

	const converted = dataRows.map((row) => {
		const csvRow = {};
		Object.entries(keyMapping).forEach(([orig, renamed]) => {
			csvRow[renamed] = row[orig] || '';
			if (orig === 'country') {
				csvRow['Total' + metricSuffix] = row.Total || '';
			}
		});
		Object.keys(row)
			.filter((key) => key.startsWith('D') && dayNames.has(key))
			.forEach((key) => {
				csvRow[key.replace('D', 'Day ') + metricSuffix] = row[key];
			});
		return csvRow;
	});

	return converted;
};

onmessage = function (e) {
	const { type, payload } = e.data;

	if (type === 'processRetentionData') {
		const { apiResponseData, filterData, isDollarCheck, finalMetrics, dayCheckedColumn } = payload;

		const retentionData = memoizedFormatRetentionPlusData(apiResponseData, filterData);
		const maps = buildPrecomputedMaps(retentionData, isDollarCheck, finalMetrics);
		const rowWiseTotals = calculateRowWiseTotals(retentionData, isDollarCheck ? 1 : 86);

		const csvData = getCsvData(
			retentionData,
			dayCheckedColumn || [],
			!!isDollarCheck,
			finalMetrics,
			rowWiseTotals
		);

		self._lastRetentionData = retentionData;
		self._lastDayCheckedColumn = dayCheckedColumn || [];

		postMessage({
			type: 'retentionDataProcessed',
			payload: { retentionData, maps, rowWiseTotals, csvData },
		});
	}

	if (type === 'recomputeWithDollarCheck') {
		const { isDollarCheck, finalMetrics, dayCheckedColumn } = payload;
		if (!self._lastRetentionData) return;

		const maps = buildPrecomputedMaps(self._lastRetentionData, isDollarCheck, finalMetrics);
		const rowWiseTotals = calculateRowWiseTotals(self._lastRetentionData, isDollarCheck ? 1 : 86);

		const finalDayChecked = dayCheckedColumn || self._lastDayCheckedColumn || [];

		const csvData = getCsvData(
			self._lastRetentionData,
			finalDayChecked,
			!!isDollarCheck,
			finalMetrics,
			rowWiseTotals
		);

		postMessage({
			type: 'recomputeWithDollarCheck',
			payload: { maps, rowWiseTotals, csvData },
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

function formatMetricValue(d, selectedMetric, STATIC_INR, isDollarCheck) {
	switch (selectedMetric) {
		case 'finalRetention':
			return `${(+d.asc_avg_retained_users_pct || 0).toFixed(2)}%`;
		case 'totalActiveUsers':
			return indianNumberFormat(+d.asc_total_retained_user || 0);
		case 'totalRevenue':
			return (
				(isDollarCheck ? '$' : '₹') +
				indianNumberFormat(((+d.asc_total_revenue || 0) * STATIC_INR).toFixed(2))
			);
		case 'totalCost':
			return (
				(isDollarCheck ? '$' : '₹') + indianNumberFormat(((+d.asc_cost || 0) * STATIC_INR).toFixed(2))
			);
		case 'totalRevUser':
			return (
				(isDollarCheck ? '$' : '₹') +
				indianNumberFormat(((+d.asc_avg_arpu || 0) * STATIC_INR).toFixed(2))
			);
		case 'dailyLTVRevenue':
		default:
			return (
				(isDollarCheck ? '$' : '₹') +
				indianNumberFormat(((+d.cumulative_ltv_revenue || 0) * STATIC_INR).toFixed(2))
			);
	}
}
