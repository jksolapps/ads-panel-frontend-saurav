/**
 * eslint-disable no-restricted-globals
 *
 * @format
 */

import moment from 'moment';

self.onmessage = function (e) {
	const { type, payload } = e.data;

	switch (type) {
		case 'FORMAT_RETENTION': {
			const result = formatRetentionData(payload);
			self.postMessage({ type: 'FORMAT_RETENTION_DONE', result });
			break;
		}

		case 'CSV_DATA': {
			const result = getCsvData(payload);
			self.postMessage({ type: 'CSV_DATA_DONE', result });
			break;
		}

		case 'CSV_HEADERS': {
			const result = getCsvHeaders(payload);
			self.postMessage({ type: 'CSV_HEADERS_DONE', result });
			break;
		}

		default:
			break;
	}
};

/* ================= FORMAT RETENTION ================= */
function formatRetentionData({
	data,
	isWeekSelected,
	isMonthSelected,
	isCountrySelected,
	isAppVersionSelected,
	isDateSelected,
	isGroupSelected,
	filterData,
}) {
	const retentionMap = new Map();

	data.forEach((entry) => {
		const {
			ar_install_date,
			ar_retention_date,
			ar_app_auto_id,
			ar_retained_users,
			country,
			appVersion,
		} = entry;

		let installDate, groupKey, diff;

		if (isWeekSelected) {
			installDate = moment(ar_install_date).startOf('isoWeek').add(1, 'days').format('YYYY[W]WW');
			diff = moment(ar_retention_date).diff(moment(ar_install_date).startOf('isoWeek'), 'weeks');
		} else if (isMonthSelected) {
			installDate = moment(ar_install_date).startOf('month').format('MMM YY');
			diff = moment(ar_retention_date).diff(moment(ar_install_date).startOf('months'), 'months');
		} else {
			installDate = moment(ar_install_date).format('YYYY-MM-DD');
			diff = moment(ar_retention_date).diff(moment(installDate), 'days');
		}

		if ((isCountrySelected || isAppVersionSelected) && !isDateSelected) {
			groupKey = `${ar_app_auto_id}|${undefined}|${country}|${appVersion}`;
		} else if (!isGroupSelected) {
			groupKey = `${ar_app_auto_id}|${undefined}|${country}|${appVersion}`;
		} else {
			groupKey = `${ar_app_auto_id}|${installDate}|${country}|${appVersion}`;
		}

		if (!retentionMap.has(groupKey)) retentionMap.set(groupKey, {});
		const retentionData = retentionMap.get(groupKey);

		retentionData[diff] = (retentionData[diff] || 0) + Number(ar_retained_users || 0);
	});

	return Array.from(retentionMap.entries()).map(([key, days]) => {
		const [appId, installDateString, countryString, appVersionString] = key.split('|');

		const baseUsers = days[0] || 0;

		const day_wise_retention = Object.entries(days).map(([day, count]) => ({
			day: `${+day + 1}`,
			ar_retained_users: count,
			retention_rate: baseUsers > 0 ? ((count / baseUsers) * 100).toFixed(2) + '%' : '-',
		}));

		const appDetails = filterData.list_apps?.find((a) => a.app_auto_id == appId) || {};

		return {
			ar_install_date: installDateString === 'undefined' ? '-' : installDateString,
			country: countryString === 'undefined' ? '-' : countryString,
			app_version: appVersionString === 'undefined' ? '-' : appVersionString,
			day_wise_retention,
			...(({ app_campaigns, item_checked, ...rest }) => rest)(appDetails),
		};
	});
}

/* ================= CSV DATA ================= */
function getCsvData({ rows, isWeekSelected, isMonthSelected }) {
	if (!rows?.length) return [];

	const periodLabel = isWeekSelected ? 'Week' : isMonthSelected ? 'Month' : 'Day';

	const maxIndex = Math.max(
		...rows.map((r) => Math.max(...(r.day_wise_retention || []).map((d) => +d.day)))
	);

	const hasCountry = rows.some((r) => r.country && r.country !== '-');
	const hasAppVersion = rows.some((r) => r.app_version && r.app_version !== '-');
	const hasDate = rows.some((r) => r.ar_install_date && r.ar_install_date !== '-');

	const csvRows = rows.map((item) => {
		const base = {
			Apps: item.app_display_name ?? '-',
			'Console Name': item.app_console_name ?? '-',
			'Package Name': item.app_store_id ?? '-',
		};

		if (hasDate) base.Date = item.ar_install_date ?? '-';
		if (hasCountry) base.Country = item.country ?? '-';
		if (hasAppVersion) base['App Version'] = item.app_version ?? '-';

		const map = new Map((item.day_wise_retention || []).map((d) => [+d.day, d]));

		for (let i = 1; i <= maxIndex; i++) {
			base[`${periodLabel} ${i}`] = map.get(i)?.retention_rate ?? '-';
		}

		return base;
	});

	return csvRows;
}

/* ================= CSV HEADERS ================= */
function getCsvHeaders({ rows, isWeekSelected, isMonthSelected }) {
	const periodLabel = isWeekSelected ? 'Week' : isMonthSelected ? 'Month' : 'Day';

	const headers = [
		{ label: 'Apps', key: 'Apps' },
		{ label: 'Console Name', key: 'Console Name' },
		{ label: 'Package Name', key: 'Package Name' },
	];

	const hasCountry = rows.some((r) => r.country && r.country !== '-');
	const hasAppVersion = rows.some((r) => r.app_version && r.app_version !== '-');
	const hasDate = rows.some((r) => r.ar_install_date && r.ar_install_date !== '-');

	if (hasDate) headers.push({ label: 'Date', key: 'Date' });
	if (hasCountry) headers.push({ label: 'Country', key: 'Country' });
	if (hasAppVersion) headers.push({ label: 'App Version', key: 'App Version' });

	const maxIndex = Math.max(
		...rows.map((r) => Math.max(...(r.day_wise_retention || []).map((d) => +d.day)))
	);

	for (let i = 1; i <= maxIndex; i++) {
		headers.push({
			label: `${periodLabel} ${i}`,
			key: `${periodLabel} ${i}`,
		});
	}

	return headers;
}
