// /** @format */

// // ✅ Use moment for ALL date logic (no manual date parsing)
// import moment from 'moment';

// const nfIN = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

// const indianNumberFormat = (v) => {
//     if (v == null || v === '') return '0';
//     const n = Number(String(v).replace(/[$,%\s,]/g, ''));
//     if (!Number.isFinite(n)) return String(v);
//     if (Math.abs(n % 1) > 0) return nfIN.format(Number(n.toFixed(2)));
//     return nfIN.format(n);
// };

// const parseMoney = (v) => {
//     if (v == null) return 0;
//     const n = Number(String(v).replace(/[$,]/g, ''));
//     return Number.isFinite(n) ? n : 0;
// };
// const parseIntSafe = (v) => {
//     if (v == null) return 0;
//     const n = Number(String(v).replace(/,/g, ''));
//     return Number.isFinite(n) ? n : 0;
// };
// const parsePercent = (v) => {
//     if (v == null) return 0;
//     const n = Number(String(v).replace('%', ''));
//     return Number.isFinite(n) ? n : 0;
// };

// function renderSearchDimension(dimension) {
//     switch (dimension) {
//         case 'MONTH':
//         case 'WEEK':
//         case 'YEAR':
//             return 'report_date';
//         case 'AD_UNIT':
//             return 'au_display_name';
//         case 'COUNTRY':
//             return 'country_name';
//         case 'FORMAT':
//             return 'au_format';
//         case 'MOBILE_OS_VERSION':
//             return 'mobile_os_version';
//         case 'GMA_SDK_VERSION':
//             return 'gma_sdk_version';
//         case 'APP_VERSION_NAME':
//             return 'app_version';
//         case 'ALL_APPS':
//             return 'app_display_name';
//         default:
//             return null;
//     }
// }

// function formatDimensionValue(dimension, value) {
//     if (!value) return '';
//     switch (dimension) {
//         case 'MONTH':
//             return moment(value, 'YYYYMM').format('MMM YY');
//         case 'WEEK':
//             return moment(value, 'YYYYMMDD').format('YYYY[W]WW');
//         case 'YEAR':
//             return moment(value, ['YYYYMMDD', 'YYYYMM']).format('YYYY');
//         default:
//             return String(value);
//     }
// }

// const CSV_KEY_MAPPING = {
//     app_display_name: 'App Name',
//     report_date: 'Date',
//     au_display_name: 'Ad Unit',
//     au_format: 'Format',
//     country_name: 'Country',
//     gma_sdk_version: 'GMA SDK Version',
//     mobile_os_version: 'Mobile OS Version',
//     app_version: 'App Version',
//     cost: 'Cost (USD)',
//     estimated_earnings: 'Actual Earnings (USD)',
//     roas: 'Actual ROAS',
//     fsr: 'Cumulative Earnings (USD)',
//     cumulative_roas: 'Cumulative ROAS',
//     profit: 'Profit (USD)',
//     observed_ecpm: 'Observed eCPM (USD)',
//     ad_requests: 'Requests',
//     matched_requests: 'Matched requests',
//     match_rate: 'Match rate (%)',
//     impressions: 'Impressions',
//     show_rate: 'Show rate (%)',
//     clicks: 'Clicks',
//     impression_ctr: 'CTR (%)',
// };

// function filterDataByDimensions(data, firstDimension, secondDimension, searchValue) {
//     const firstKey = renderSearchDimension(firstDimension);
//     const secondKey = renderSearchDimension(secondDimension);
//     if (!firstKey && !secondKey) return [];

//     const lower = String(searchValue ?? '').toLowerCase();

//     const isAllApps = firstDimension === 'ALL_APPS' || secondDimension === 'ALL_APPS';

//     if (firstDimension?.includes('YEAR') || secondDimension?.includes('YEAR')) {
//         const yearMap = new Map();

//         for (const row of data) {
//             // ✅ moment handles year extraction (report_date can be YYYYMM or YYYYMMDD)
//             const year = moment(String(row.report_date ?? ''), ['YYYYMM', 'YYYYMMDD']).format('YYYY');

//             const k1 = firstDimension.includes('YEAR') ? year : row[renderSearchDimension(firstDimension)];
//             const k2 = secondDimension?.includes('YEAR')
//                 ? year
//                 : row[renderSearchDimension(secondDimension)];

//             const mapKey = secondDimension ? `${k1}-${k2}` : k1;

//             if (!yearMap.has(mapKey)) {
//                 yearMap.set(mapKey, {
//                     report_date: firstDimension.includes('YEAR') ? year : row.report_date,
//                     [renderSearchDimension(firstDimension)]: k1,
//                     ...(secondDimension && { [renderSearchDimension(secondDimension)]: k2 }),

//                     ...(isAllApps && {
//                         app_auto_id: row.app_auto_id,
//                         app_icon: row.app_icon,
//                         app_platform: row.app_platform,
//                         app_display_name: row.app_display_name,
//                         app_console_name: row.app_console_name,
//                         app_store_id: row.app_store_id,
//                     }),

//                     estimated_earnings: 0,
//                     fsr: 0,
//                     ad_requests: 0,
//                     cost: 0,
//                     matched_requests: 0,
//                     impressions: 0,
//                     clicks: 0,
//                     count: 0,
//                     // keep dimension fields if present
//                     au_display_name: row.au_display_name,
//                     country_name: row.country_name,
//                     au_format: row.au_format,
//                     mobile_os_version: row.mobile_os_version,
//                     gma_sdk_version: row.gma_sdk_version,
//                     app_version: row.app_version,
//                 });
//             }

//             const cur = yearMap.get(mapKey);
//             cur.estimated_earnings += parseMoney(row.estimated_earnings);
//             cur.fsr += row?.fsr ? parseMoney(row.fsr) : 0;
//             cur.cost += row?.cost ? parseMoney(row.cost) : 0;
//             cur.ad_requests += parseIntSafe(row.ad_requests);
//             cur.matched_requests += parseIntSafe(row.matched_requests);
//             cur.impressions += parseIntSafe(row.impressions);
//             cur.clicks += parseIntSafe(row.clicks);
//             cur.count += 1;
//         }

//         data = Array.from(yearMap.values()).map((d) => {
//             const observed = d.impressions > 0 ? (d.estimated_earnings / d.impressions) * 1000 : 0;

//             return {
//                 ...(isAllApps && {
//                     app_auto_id: d.app_auto_id,
//                     app_icon: d.app_icon,
//                     app_platform: d.app_platform,
//                     app_display_name: d.app_display_name,
//                     app_console_name: d.app_console_name,
//                     app_store_id: d.app_store_id,
//                 }),
//                 report_date: d.report_date,
//                 ...(d.au_display_name && { au_display_name: d.au_display_name }),
//                 ...(d.country_name && { country_name: d.country_name }),
//                 ...(d.au_format && { au_format: d.au_format }),
//                 ...(d.mobile_os_version && { mobile_os_version: d.mobile_os_version }),
//                 ...(d.gma_sdk_version && { gma_sdk_version: d.gma_sdk_version }),
//                 ...(d.app_version && { app_version: d.app_version }),
//                 estimated_earnings: `$${indianNumberFormat(d.estimated_earnings.toFixed(2))}`,
//                 fsr: d?.fsr ? `$${indianNumberFormat(d.fsr.toFixed(2))}` : 0,
//                 cost: d?.cost ? `$${Number(d.cost).toFixed(2)}` : 0,
//                 observed_ecpm: `$${Number(observed).toFixed(2)}`,
//                 ad_requests: indianNumberFormat(d.ad_requests),
//                 matched_requests: indianNumberFormat(d.matched_requests),
//                 match_rate: `${
//                     d.ad_requests > 0 ? ((d.matched_requests / d.ad_requests) * 100).toFixed(2) : '0.00'
//                 }%`,
//                 show_rate: `${
//                     d.matched_requests > 0 ? ((d.impressions / d.matched_requests) * 100).toFixed(2) : '0.00'
//                 }%`,
//                 impressions: indianNumberFormat(d.impressions),
//                 clicks: indianNumberFormat(d.clicks),
//                 impression_ctr: `${
//                     d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(2) : '0.00'
//                 }%`,
//             };
//         });
//     }

//     // search filter
//     return data.filter((item) => {
//         const v1 = firstKey ? formatDimensionValue(firstDimension, item[firstKey]) : null;
//         const v2 = secondKey ? formatDimensionValue(secondDimension, item[secondKey]) : null;
//         return (v1 && v1.toLowerCase().includes(lower)) || (v2 && v2.toLowerCase().includes(lower));
//     });
// }

// function totalRecordsSum(data) {
//     const acc = data.reduce(
//         (a, curr) => {
//             a.total_estimated_earnings += parseMoney(curr?.estimated_earnings);
//             a.total_fsr += curr?.fsr ? parseMoney(curr?.fsr) : 0;
//             a.total_cost += curr?.cost ? parseMoney(curr?.cost) : 0;

//             a.total_ad_requests += parseIntSafe(curr?.ad_requests);
//             a.total_matched_requests += parseIntSafe(curr?.matched_requests);
//             a.total_impressions += parseIntSafe(curr?.impressions);

//             a.total_clicks += parseIntSafe(curr?.clicks);

//             a.total_show_rate += parsePercent(curr?.show_rate);
//             a.total_impression_ctr += parsePercent(curr?.impression_ctr);

//             a.count += 1;
//             return a;
//         },
//         {
//             total_estimated_earnings: 0,
//             total_observed_ecpm: 0,
//             total_ad_requests: 0,
//             total_matched_requests: 0,
//             total_impressions: 0,
//             total_clicks: 0,
//             total_match_rate: 0,
//             total_show_rate: 0,
//             total_impression_ctr: 0,
//             total_cost: 0,
//             total_roas: 0,
//             total_profit: 0,
//             total_fsr: 0,
//             total_cumulative_roas: 0,
//             count: 0,
//         }
//     );

//     acc.total_observed_ecpm = (acc.total_estimated_earnings / acc.total_impressions) * 1000 || 0;
//     acc.total_match_rate = (acc.total_matched_requests / acc.total_ad_requests) * 100 || 0;
//     acc.total_show_rate = (acc.total_impressions / acc.total_matched_requests) * 100 || 0;
//     acc.total_impression_ctr = (acc.total_clicks / acc.total_impressions) * 100 || 0;

//     acc.total_roas = acc.total_cost
//         ? Number(acc.total_estimated_earnings / acc.total_cost).toFixed(2)
//         : 0.0;
//     acc.total_cumulative_roas = acc.total_cost
//         ? Number(acc.total_fsr / acc.total_cost).toFixed(2)
//         : 0.0;
//     acc.total_profit = Number(acc.total_estimated_earnings - acc.total_cost).toFixed(2);

//     acc.total_estimated_earnings = `$${Number(acc.total_estimated_earnings).toFixed(2)}`;
//     acc.total_fsr = `$${Number(acc.total_fsr).toFixed(2)}`;
//     acc.total_cost = `$${Number(acc.total_cost).toFixed(2)}`;
//     acc.total_observed_ecpm = `$${Number(acc.total_observed_ecpm).toFixed(2)}`;
//     acc.total_match_rate = `${Number(acc.total_match_rate).toFixed(2)}%`;
//     acc.total_show_rate = `${Number(acc.total_show_rate).toFixed(2)}%`;
//     acc.total_impression_ctr = `${Number(acc.total_impression_ctr).toFixed(2)}%`;

//     return acc;
// }

// function computeCsvRows({
//     csvData,
//     firstColumnDimension,
//     secondColumnDimension,
//     isOnlyMonthYearSelected,
//     totalRecordsData,
//     visibleCsvKeys = {},
// }) {
//     const km = { ...CSV_KEY_MAPPING };

//     if (firstColumnDimension === 'MONTH' || secondColumnDimension === 'MONTH')
//         km.report_date = 'Month';
//     else if (firstColumnDimension === 'WEEK' || secondColumnDimension === 'WEEK')
//         km.report_date = 'Week';
//     else if (firstColumnDimension === 'YEAR' || secondColumnDimension === 'YEAR')
//         km.report_date = 'Year';

//     const sanitizedData = (csvData || []).map((item) => {
//         let formattedDate = item.report_date;

//         if (firstColumnDimension === 'MONTH' || secondColumnDimension === 'MONTH') {
//             formattedDate = moment(item.report_date, 'YYYYMM').format('MMM YY');
//         } else if (firstColumnDimension === 'WEEK' || secondColumnDimension === 'WEEK') {
//             formattedDate = moment(item.report_date, 'YYYYMMDD').format('YYYY[W]WW');
//         } else if (firstColumnDimension === 'YEAR' || secondColumnDimension === 'YEAR') {
//             formattedDate = moment(item.report_date, ['YYYYMMDD', 'YYYYMM']).format('YYYY');
//         }

//         const updated = {
//             ...item,
//             report_date: formattedDate,
//             estimated_earnings: String(item.estimated_earnings ?? '').replace('$', ''),
//             observed_ecpm: String(item.observed_ecpm ?? '').replace('$', ''),
//         };

//         // Compute values but only include in CSV if visible
//         const costVal = parseMoney(item.cost);
//         const earnVal = parseMoney(item.estimated_earnings);
//         const fsrVal = parseMoney(item.fsr);

//         if (visibleCsvKeys.cost) {
//             updated.cost = indianNumberFormat(String(item.cost ?? '').replace('$', ''));
//         } else {
//             delete updated.cost;
//         }

//         if (visibleCsvKeys.fsr) {
//             updated.fsr = indianNumberFormat(String(item.fsr ?? '').replace('$', ''));
//         } else {
//             delete updated.fsr;
//         }

//         if (visibleCsvKeys.roas) {
//             updated.roas = costVal ? (earnVal / costVal).toFixed(2) : '0.00';
//         } else {
//             delete updated.roas;
//         }

//         if (visibleCsvKeys.cumulative_roas) {
//             updated.cumulative_roas = costVal ? (fsrVal / costVal).toFixed(2) : '0.00';
//         } else {
//             delete updated.cumulative_roas;
//         }

//         if (visibleCsvKeys.profit) {
//             updated.profit = indianNumberFormat((earnVal - costVal).toFixed(2));
//         } else {
//             delete updated.profit;
//         }

//         if (Object.prototype.hasOwnProperty.call(updated, 'au_id')) delete updated.au_id;

//         return updated;
//     });

//     // active columns - respect metric visibility and restrict dimensions to the selected ones
//     const activeColumns = new Set();
//     const dimKeys = new Set([
//         'app_display_name',
//         'report_date',
//         'au_display_name',
//         'au_format',
//         'country_name',
//         'gma_sdk_version',
//         'mobile_os_version',
//         'app_version',
//     ]);
//     const allowedDimensionKeys = new Set();
//     // Always include report_date (represents Month/Week/Year)
//     allowedDimensionKeys.add('report_date');
//     const firstKey = renderSearchDimension(firstColumnDimension);
//     const secondKey = renderSearchDimension(secondColumnDimension);
//     if (firstKey) allowedDimensionKeys.add(firstKey);
//     if (secondKey) allowedDimensionKeys.add(secondKey);

//     sanitizedData.forEach((item) => {
//         Object.keys(km).forEach((key) => {
//             // Metrics governed by visibility map
//             if (!dimKeys.has(key)) {
//                 if (Object.prototype.hasOwnProperty.call(visibleCsvKeys, key)) {
//                     if (!visibleCsvKeys[key]) return;
//                 }
//             } else {
//                 // Dimension fields: only include if part of the selected dimensions
//                 if (!allowedDimensionKeys.has(key)) return;
//             }
//             const label = km[key];
//             if (item[key] != null && String(item[key]).trim() !== '') activeColumns.add(label);
//         });
//     });

//     const finalData = sanitizedData.map((item) => {
//         const out = {};
//         Object.keys(km).forEach((key) => {
//             const label = km[key];
//             if (activeColumns.has(label)) out[label] = item[key] ?? '';
//         });
//         return out;
//     });

//     const formatValue = (value) => {
//         const s = String(value ?? '');
//         if (s.includes('$')) return indianNumberFormat(s.replace('$', ''));
//         if (s.startsWith('-')) return '-' + indianNumberFormat(s.replace('-', ''));
//         const n = Number(s);
//         if (Number.isFinite(n)) return indianNumberFormat(n);
//         return s;
//     };

//     const firstColumnKey = finalData.length > 0 ? Object.keys(finalData[0])?.[0] : km.report_date;
//     const totalRow = { [firstColumnKey]: 'Total' };

//     // ✅ Always ensure totals exist (compute if not passed)
//     const ensuredTotals = totalRecordsData || totalRecordsSum(csvData || []);

//     if (ensuredTotals) {
//         for (const key in ensuredTotals) {
//             const newKey = key.replace('total_', '');
//             if (!km[newKey]) continue;

//             // add totals only for visible columns
//             if (Object.prototype.hasOwnProperty.call(visibleCsvKeys, newKey)) {
//                 if (!visibleCsvKeys[newKey]) continue;
//             }
//             totalRow[km[newKey]] = formatValue(ensuredTotals[key]);
//         }
//     }

//     finalData.push(totalRow);
//     return finalData;
// }

// self.onmessage = async (e) => {
//     const { type, requestId, payload } = e.data || {};

//     try {
//         if (type === 'PROCESS_TABLE') {
//             const {
//                 aaData,
//                 firstColumnDimension,
//                 secondColumnDimension,
//                 isOnlyMonthYearSelected,
//                 visibleCsvKeys,
//                 searchText,
//             } = payload;

//             const filtered = filterDataByDimensions(
//                 aaData || [],
//                 firstColumnDimension,
//                 secondColumnDimension,
//                 searchText
//             );
//             const totals = totalRecordsSum(filtered || []);

//             const finalCsvData = computeCsvRows({
//                 csvData: filtered,
//                 firstColumnDimension,
//                 secondColumnDimension,
//                 isOnlyMonthYearSelected,
//                 totalRecordsData: totals,
//                 visibleCsvKeys,
//             });

//             self.postMessage({
//                 type: 'PROCESS_TABLE_DONE',
//                 requestId,
//                 data: { filtered, totals, finalCsvData },
//             });
//             return;
//         }

//         self.postMessage({ type: 'ERROR', requestId, error: 'Unknown message type' });
//     } catch (err) {
//         self.postMessage({
//             type: 'ERROR',
//             requestId,
//             error: err?.message || String(err),
//         });
//     }
// };


/** @format */

import moment from 'moment';

const nfIN = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

const indianNumberFormat = (v) => {
    if (v == null || v === '') return '0';
    const n = Number(String(v).replace(/[$,%\s,]/g, ''));
    if (!Number.isFinite(n)) return String(v);
    if (Math.abs(n % 1) > 0) return nfIN.format(Number(n.toFixed(2)));
    return nfIN.format(n);
};

const parseMoney = (v) => {
    if (v == null) return 0;
    const n = Number(String(v).replace(/[$,]/g, ''));
    return Number.isFinite(n) ? n : 0;
};

const parseIntSafe = (v) => {
    if (v == null) return 0;
    const n = Number(String(v).replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
};

function parseReportDate(value) {
    const s = String(value ?? '').trim();
    if (/^\d{8}$/.test(s)) return moment(s, 'YYYYMMDD');
    if (/^\d{6}$/.test(s)) return moment(s, 'YYYYMM');
    if (/^\d{4}$/.test(s)) return moment(s, 'YYYY');
    return moment.invalid();
}

export function weekKeyToSortInt(weekKey) {
    const match = String(weekKey ?? '').match(/^(\d{4})W(\d{2})$/);
    if (!match) return 0;
    return Number(match[1]) * 100 + Number(match[2]);
}

function renderSearchDimension(dimension) {
    switch (dimension) {
        case 'MONTH':
        case 'WEEK':
        case 'YEAR':
            return 'report_date';
        case 'AD_UNIT':
            return 'au_display_name';
        case 'COUNTRY':
            return 'country_name';
        case 'FORMAT':
            return 'au_format';
        case 'MOBILE_OS_VERSION':
            return 'mobile_os_version';
        case 'GMA_SDK_VERSION':
            return 'gma_sdk_version';
        case 'APP_VERSION_NAME':
            return 'app_version';
        case 'ALL_APPS':
            return 'app_display_name';
        default:
            return null;
    }
}

function formatDimensionValue(dimension, value) {
    if (!value) return '';
    switch (dimension) {
        case 'MONTH':
            return moment(String(value), 'YYYYMM').format('MMM YY');
        case 'WEEK':
            return String(value).replace('W', ' W');
        case 'YEAR': {
            const m = parseReportDate(value);
            return m.isValid() ? m.format('YYYY') : String(value);
        }
        default:
            return String(value);
    }
}

function formatRow(row) {
    const earnings = parseMoney(row.estimated_earnings);
    const adReq = parseIntSafe(row.ad_requests);
    const matched = parseIntSafe(row.matched_requests);
    const impr = parseIntSafe(row.impressions);
    const clks = parseIntSafe(row.clicks);
    const cost = parseMoney(row.cost);
    const fsr = parseMoney(row.fsr);

    const match_rate = adReq > 0 ? ((matched / adReq) * 100).toFixed(2) : '0.00';
    const show_rate = matched > 0 ? ((impr / matched) * 100).toFixed(2) : '0.00';
    const impression_ctr = impr > 0 ? ((clks / impr) * 100).toFixed(2) : '0.00';
    const ecpm = impr > 0 ? ((earnings / impr) * 1000).toFixed(2) : '0.00';

    return {
        ...row,
        estimated_earnings: `$${indianNumberFormat(earnings.toFixed(2))}`,
        cost: cost ? `$${Number(cost).toFixed(2)}` : 0,
        fsr: fsr ? `$${indianNumberFormat(fsr.toFixed(2))}` : 0,
        observed_ecpm: `$${Number(ecpm).toFixed(2)}`,
        ad_requests: indianNumberFormat(adReq),
        matched_requests: indianNumberFormat(matched),
        impressions: indianNumberFormat(impr),
        clicks: indianNumberFormat(clks),
        match_rate: `${match_rate}%`,
        show_rate: `${show_rate}%`,
        impression_ctr: `${impression_ctr}%`,
    };
}

function aggregateRows(data, getKey, getExtraFields) {
    const map = new Map();
    for (const row of data) {
        const key = getKey(row);
        if (!key) continue;
        if (!map.has(key)) {
            map.set(key, {
                ...getExtraFields(row, key),
                _earnings: 0, _fsr: 0, _cost: 0,
                _ad_requests: 0, _matched_requests: 0, _impressions: 0, _clicks: 0,
            });
        }
        const cur = map.get(key);
        cur._earnings += parseMoney(row.estimated_earnings);
        cur._fsr += row?.fsr ? parseMoney(row.fsr) : 0;
        cur._cost += row?.cost ? parseMoney(row.cost) : 0;
        cur._ad_requests += parseIntSafe(row.ad_requests);
        cur._matched_requests += parseIntSafe(row.matched_requests);
        cur._impressions += parseIntSafe(row.impressions);
        cur._clicks += parseIntSafe(row.clicks);
    }
    return map;
}

function accToDisplayRow(d, isAllApps) {
    const match_rate = d._ad_requests > 0
        ? ((d._matched_requests / d._ad_requests) * 100).toFixed(2) : '0.00';
    const show_rate = d._matched_requests > 0
        ? ((d._impressions / d._matched_requests) * 100).toFixed(2) : '0.00';
    const impression_ctr = d._impressions > 0
        ? ((d._clicks / d._impressions) * 100).toFixed(2) : '0.00';
    const ecpm = d._impressions > 0
        ? ((d._earnings / d._impressions) * 1000).toFixed(2) : '0.00';
    return {
        ...(isAllApps && {
            app_auto_id: d.app_auto_id, app_icon: d.app_icon,
            app_platform: d.app_platform, app_display_name: d.app_display_name,
            app_console_name: d.app_console_name, app_store_id: d.app_store_id,
        }),
        report_date: d.report_date,
        ...(d.au_display_name && { au_display_name: d.au_display_name }),
        ...(d.country_name && { country_name: d.country_name }),
        ...(d.au_format && { au_format: d.au_format }),
        ...(d.mobile_os_version && { mobile_os_version: d.mobile_os_version }),
        ...(d.gma_sdk_version && { gma_sdk_version: d.gma_sdk_version }),
        ...(d.app_version && { app_version: d.app_version }),
        estimated_earnings: `$${indianNumberFormat(d._earnings.toFixed(2))}`,
        fsr: d._fsr ? `$${indianNumberFormat(d._fsr.toFixed(2))}` : 0,
        cost: d._cost ? `$${Number(d._cost).toFixed(2)}` : 0,
        observed_ecpm: `$${Number(ecpm).toFixed(2)}`,
        ad_requests: indianNumberFormat(d._ad_requests),
        matched_requests: indianNumberFormat(d._matched_requests),
        match_rate: `${match_rate}%`,
        show_rate: `${show_rate}%`,
        impressions: indianNumberFormat(d._impressions),
        clicks: indianNumberFormat(d._clicks),
        impression_ctr: `${impression_ctr}%`,
    };
}

function filterDataByDimensions(data, firstDimension, secondDimension, searchValue) {
    const firstKey = renderSearchDimension(firstDimension);
    const secondKey = renderSearchDimension(secondDimension);
    if (!firstKey && !secondKey) return [];

    const lower = String(searchValue ?? '').toLowerCase();
    const isAllApps = firstDimension === 'ALL_APPS' || secondDimension === 'ALL_APPS';
    const hasYear = firstDimension?.includes('YEAR') || secondDimension?.includes('YEAR');

    let processedData;

    if (hasYear) {
        const yearMap = aggregateRows(
            data,
            (row) => {
                const m = parseReportDate(row.report_date);
                if (!m.isValid()) return null;
                const year = m.format('YYYY');
                const k1 = firstDimension.includes('YEAR')
                    ? year : row[renderSearchDimension(firstDimension)];
                const k2 = secondDimension?.includes('YEAR')
                    ? year : secondDimension ? row[renderSearchDimension(secondDimension)] : null;
                return secondDimension ? `${k1}|||${k2}` : k1;
            },
            (row) => {
                const m = parseReportDate(row.report_date);
                const year = m.isValid() ? m.format('YYYY') : String(row.report_date);
                const k1 = firstDimension.includes('YEAR')
                    ? year : row[renderSearchDimension(firstDimension)];
                const k2 = secondDimension?.includes('YEAR')
                    ? year : secondDimension ? row[renderSearchDimension(secondDimension)] : null;
                return {
                    report_date: firstDimension.includes('YEAR') ? year : row.report_date,
                    [renderSearchDimension(firstDimension)]: k1,
                    ...(secondDimension && { [renderSearchDimension(secondDimension)]: k2 }),
                    ...(isAllApps && {
                        app_auto_id: row.app_auto_id, app_icon: row.app_icon,
                        app_platform: row.app_platform, app_display_name: row.app_display_name,
                        app_console_name: row.app_console_name, app_store_id: row.app_store_id,
                    }),
                    au_display_name: row.au_display_name, country_name: row.country_name,
                    au_format: row.au_format, mobile_os_version: row.mobile_os_version,
                    gma_sdk_version: row.gma_sdk_version, app_version: row.app_version,
                };
            }
        );
        processedData = Array.from(yearMap.values()).map((d) => accToDisplayRow(d, isAllApps));
    } else {
        processedData = data.map(formatRow);
    }

    if (!lower) return processedData;

    return processedData.filter((item) => {
        const v1 = firstKey ? formatDimensionValue(firstDimension, item[firstKey]) : null;
        const v2 = secondKey ? formatDimensionValue(secondDimension, item[secondKey]) : null;
        return (v1 && v1.toLowerCase().includes(lower)) || (v2 && v2.toLowerCase().includes(lower));
    });
}

function totalRecordsSum(data) {
    const acc = data.reduce(
        (a, curr) => {
            a.total_estimated_earnings += parseMoney(curr?.estimated_earnings);
            a.total_fsr += curr?.fsr ? parseMoney(curr?.fsr) : 0;
            a.total_cost += curr?.cost ? parseMoney(curr?.cost) : 0;
            a.total_ad_requests += parseIntSafe(curr?.ad_requests);
            a.total_matched_requests += parseIntSafe(curr?.matched_requests);
            a.total_impressions += parseIntSafe(curr?.impressions);
            a.total_clicks += parseIntSafe(curr?.clicks);
            a.count += 1;
            return a;
        },
        {
            total_estimated_earnings: 0, total_observed_ecpm: 0,
            total_ad_requests: 0, total_matched_requests: 0,
            total_impressions: 0, total_clicks: 0,
            total_match_rate: 0, total_show_rate: 0, total_impression_ctr: 0,
            total_cost: 0, total_roas: 0, total_profit: 0,
            total_fsr: 0, total_cumulative_roas: 0, count: 0,
        }
    );
    acc.total_observed_ecpm = acc.total_impressions > 0
        ? (acc.total_estimated_earnings / acc.total_impressions) * 1000 : 0;
    acc.total_match_rate = acc.total_ad_requests > 0
        ? (acc.total_matched_requests / acc.total_ad_requests) * 100 : 0;
    acc.total_show_rate = acc.total_matched_requests > 0
        ? (acc.total_impressions / acc.total_matched_requests) * 100 : 0;
    acc.total_impression_ctr = acc.total_impressions > 0
        ? (acc.total_clicks / acc.total_impressions) * 100 : 0;
    acc.total_roas = acc.total_cost
        ? Number(acc.total_estimated_earnings / acc.total_cost).toFixed(2) : '0.00';
    acc.total_cumulative_roas = acc.total_cost
        ? Number(acc.total_fsr / acc.total_cost).toFixed(2) : '0.00';
    acc.total_profit = Number(acc.total_estimated_earnings - acc.total_cost).toFixed(2);
    acc.total_estimated_earnings = `$${Number(acc.total_estimated_earnings).toFixed(2)}`;
    acc.total_fsr = `$${Number(acc.total_fsr).toFixed(2)}`;
    acc.total_cost = `$${Number(acc.total_cost).toFixed(2)}`;
    acc.total_observed_ecpm = `$${Number(acc.total_observed_ecpm).toFixed(2)}`;
    acc.total_match_rate = `${Number(acc.total_match_rate).toFixed(2)}%`;
    acc.total_show_rate = `${Number(acc.total_show_rate).toFixed(2)}%`;
    acc.total_impression_ctr = `${Number(acc.total_impression_ctr).toFixed(2)}%`;
    acc.total_ad_requests = indianNumberFormat(acc.total_ad_requests);
    acc.total_matched_requests = indianNumberFormat(acc.total_matched_requests);
    acc.total_impressions = indianNumberFormat(acc.total_impressions);
    acc.total_clicks = indianNumberFormat(acc.total_clicks);
    return acc;
}

const CSV_KEY_MAPPING = {
    app_display_name: 'App Name',
    report_date: 'Date',
    au_display_name: 'Ad Unit',
    au_format: 'Format',
    country_name: 'Country',
    gma_sdk_version: 'GMA SDK Version',
    mobile_os_version: 'Mobile OS Version',
    app_version: 'App Version',
    cost: 'Cost (USD)',
    estimated_earnings: 'Actual Earnings (USD)',
    roas: 'Actual ROAS',
    fsr: 'Cumulative Earnings (USD)',
    cumulative_roas: 'Cumulative ROAS',
    profit: 'Profit (USD)',
    observed_ecpm: 'Observed eCPM (USD)',
    ad_requests: 'Requests',
    matched_requests: 'Matched requests',
    match_rate: 'Match rate (%)',
    impressions: 'Impressions',
    show_rate: 'Show rate (%)',
    clicks: 'Clicks',
    impression_ctr: 'CTR (%)',
};

function computeCsvRows({
    csvData, firstColumnDimension, secondColumnDimension,
    isOnlyMonthYearSelected, totalRecordsData, visibleCsvKeys = {},
}) {
    const km = { ...CSV_KEY_MAPPING };

    if (firstColumnDimension === 'MONTH' || secondColumnDimension === 'MONTH')
        km.report_date = 'Month';
    else if (firstColumnDimension === 'WEEK' || secondColumnDimension === 'WEEK')
        km.report_date = 'Week';
    else if (firstColumnDimension === 'YEAR' || secondColumnDimension === 'YEAR')
        km.report_date = 'Year';

    const sanitizedData = (csvData || []).map((item) => {
        let formattedDate = item.report_date;
        if (firstColumnDimension === 'MONTH' || secondColumnDimension === 'MONTH') {
            formattedDate = moment(String(item.report_date ?? ''), 'YYYYMM').format('MMM YY');
        } else if (firstColumnDimension === 'WEEK' || secondColumnDimension === 'WEEK') {
            formattedDate = String(item.report_date ?? '');
        } else if (firstColumnDimension === 'YEAR' || secondColumnDimension === 'YEAR') {
            const m = parseReportDate(item.report_date);
            formattedDate = m.isValid() ? m.format('YYYY') : String(item.report_date ?? '');
        }

        const updated = { ...item, report_date: formattedDate,
            estimated_earnings: String(item.estimated_earnings ?? '').replace('$', ''),
            observed_ecpm: String(item.observed_ecpm ?? '').replace('$', ''),
        };
        delete updated.week_start;
        delete updated.week_end;

        const costVal = parseMoney(item.cost);
        const earnVal = parseMoney(item.estimated_earnings);
        const fsrVal = parseMoney(item.fsr);

        if (visibleCsvKeys.cost) {
            updated.cost = indianNumberFormat(String(item.cost ?? '').replace('$', ''));
        } else { delete updated.cost; }
        if (visibleCsvKeys.fsr) {
            updated.fsr = indianNumberFormat(String(item.fsr ?? '').replace('$', ''));
        } else { delete updated.fsr; }
        if (visibleCsvKeys.roas) {
            updated.roas = costVal ? (earnVal / costVal).toFixed(2) : '0.00';
        } else { delete updated.roas; }
        if (visibleCsvKeys.cumulative_roas) {
            updated.cumulative_roas = costVal ? (fsrVal / costVal).toFixed(2) : '0.00';
        } else { delete updated.cumulative_roas; }
        if (visibleCsvKeys.profit) {
            updated.profit = indianNumberFormat((earnVal - costVal).toFixed(2));
        } else { delete updated.profit; }
        if (Object.prototype.hasOwnProperty.call(updated, 'au_id')) delete updated.au_id;
        return updated;
    });

    const activeColumns = new Set();
    const dimKeys = new Set([
        'app_display_name', 'report_date', 'au_display_name', 'au_format',
        'country_name', 'gma_sdk_version', 'mobile_os_version', 'app_version',
    ]);
    const allowedDimensionKeys = new Set(['report_date']);
    const firstKey = renderSearchDimension(firstColumnDimension);
    const secondKey = renderSearchDimension(secondColumnDimension);
    if (firstKey) allowedDimensionKeys.add(firstKey);
    if (secondKey) allowedDimensionKeys.add(secondKey);

    sanitizedData.forEach((item) => {
        Object.keys(km).forEach((key) => {
            if (!dimKeys.has(key)) {
                if (Object.prototype.hasOwnProperty.call(visibleCsvKeys, key)) {
                    if (!visibleCsvKeys[key]) return;
                }
            } else {
                if (!allowedDimensionKeys.has(key)) return;
            }
            const label = km[key];
            if (item[key] != null && String(item[key]).trim() !== '') activeColumns.add(label);
        });
    });

    const finalData = sanitizedData.map((item) => {
        const out = {};
        Object.keys(km).forEach((key) => {
            const label = km[key];
            if (activeColumns.has(label)) out[label] = item[key] ?? '';
        });
        return out;
    });

    const formatValue = (value) => {
        const s = String(value ?? '');
        if (s.includes('$')) return indianNumberFormat(s.replace('$', ''));
        if (s.startsWith('-')) return '-' + indianNumberFormat(s.replace('-', ''));
        const n = Number(s);
        if (Number.isFinite(n)) return indianNumberFormat(n);
        return s;
    };

    const firstColumnKey = finalData.length > 0 ? Object.keys(finalData[0])?.[0] : km.report_date;
    const totalRow = { [firstColumnKey]: 'Total' };
    const ensuredTotals = totalRecordsData || totalRecordsSum(csvData || []);
    if (ensuredTotals) {
        for (const key in ensuredTotals) {
            const newKey = key.replace('total_', '');
            if (!km[newKey]) continue;
            if (Object.prototype.hasOwnProperty.call(visibleCsvKeys, newKey)) {
                if (!visibleCsvKeys[newKey]) continue;
            }
            totalRow[km[newKey]] = formatValue(ensuredTotals[key]);
        }
    }
    finalData.push(totalRow);
    return finalData;
}

self.onmessage = async (e) => {
    const { type, requestId, payload } = e.data || {};
    try {
        if (type === 'PROCESS_TABLE') {
            const {
                aaData, firstColumnDimension, secondColumnDimension,
                isOnlyMonthYearSelected, visibleCsvKeys, searchText,
            } = payload;

            const filtered = filterDataByDimensions(
                aaData || [], firstColumnDimension, secondColumnDimension, searchText
            );
            const totals = totalRecordsSum(filtered || []);
            const finalCsvData = computeCsvRows({
                csvData: filtered, firstColumnDimension, secondColumnDimension,
                isOnlyMonthYearSelected, totalRecordsData: totals, visibleCsvKeys,
            });
            self.postMessage({ type: 'PROCESS_TABLE_DONE', requestId, data: { filtered, totals, finalCsvData } });
            return;
        }
        self.postMessage({ type: 'ERROR', requestId, error: 'Unknown message type' });
    } catch (err) {
        self.postMessage({ type: 'ERROR', requestId, error: err?.message || String(err) });
    }
};