/** @format */

import { useMemo, useState } from 'react';
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

export function useAccountColumns({
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
  typeIndex,
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
      // Try common keys you use in this file
      const candidate =
        raw.report_value_original ??
        raw.report_value ??
        raw.this_month_original ??
        raw.last_month_original ??
        raw.total_month_original ??
        raw.value ??
        raw.amount ??
        raw.metric ??
        null;

      if (candidate != null) {
        return parseMetricValue(candidate); // recurse once into actual value
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
    // (removes currency symbols, commas, spaces, %, etc.)
    v = v.replace(/[^0-9.+-]/g, '');
    if (!v) return 0;

    const num = parseFloat(v);
    if (!Number.isFinite(num)) return 0;

    let value = num;

    // Convert percent → 0–1 range so 50% == 0.5 for sorting consistency
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

  const today = moment().startOf('day');
  const start = moment(selectedStartDate, 'DD/MM/YYYY').startOf('day');
  const end = moment().endOf('day');

  const selectedDays = end.diff(start, 'days') + 1;

  const isDefaultRange =
    today.date() <= 15 &&
    start.isSame(today.clone().startOf('month'), 'day') &&
    end.isSame(today, 'day');

  const isLast15Days = selectedDays <= 15;

  const isThisMonth =
    start.isSame(today.clone().startOf('month'), 'day') && end.isSame(today, 'day');

  const shouldShowTotalMonth = !isDefaultRange && !isLast15Days && !isThisMonth;

  const staticColumns = useMemo(
    () => [
      {
        id: 'id',
        header: () => <div className="table-left-header">Id</div>,
        cell: ({ row }) => <div>{row.index + 1}</div>,
        size: 48,
      },
      {
        id: 'app',
        header: () => <div className="table-left-header">App</div>,
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
        header: () => <div className="table-left-header">Last Updated</div>,
        accessorKey: 'report_updated_at',
        size: 120,
        cell: ({ row }) => {
          const [dateString, timeString] = analyticFormatDate(
            row.original?.report_updated_at
          ).split(',');
          return (
            <div
              title={row.original?.report_updated_at}
              className={`report-updated-value text-center`}
            >
              <div>{dateString?.trim()}</div>
              <div style={{ marginLeft: '10px', marginTop: '2px' }}>{timeString?.trim()}</div>
            </div>
          );
        },
        meta: {
          omit: !checkMark.some((item) => item.type_auto_name == 'Last Updated'),
          omitValue: 'Last Updated',
        },
      },
      {
        id: 'type',
        header: () => <div className="table-left-header">Type</div>,
        accessorKey: 'row_type',
        size: 80,
        cell: ({ row }) => <div>{row.original.row_type}</div>,
        meta: { omit: !checkMark.some((item) => item.type_auto_name == 'Type'), omitValue: 'Type' },
      },

      {
    id: 'last_month',
    header: () => {
        const isImpression = typeIndex?.length === 1 && typeIndex?.includes('3');

        const currentValue = microValueConvert(
            isImpression
                ? summaryData?.[1]?.Impressions?.last_month
                : summaryData?.[0]?.Revenue?.last_month
        );

        const previousValue = microValueConvert(
            isImpression
                ? summaryData?.[1]?.Impressions?.previous_month
                : summaryData?.[0]?.Revenue?.previous_month
        );

        // Formula: (current / previous) × 100
        let percentageVal = 0;
        if (previousValue !== 0 && previousValue != null && !isNaN(previousValue)) {
            percentageVal = (currentValue / Math.abs(previousValue)) * 100;
        } else {
            percentageVal = currentValue === 0 ? 0 : 100;
        }

        // CSS class for color
        let cssClass = '';
        const diff = currentValue - previousValue;
        if (!isImpression) {
            // Revenue: green if >= 110%, red if < 110%
            if (diff >= 10 || diff <= -10) {
                cssClass = percentageVal >= 110 ? 'revenue-increase' : 'revenue-decrease';
            }
        } else {
            // Impressions: green if >= 50%, red if < 50%
            if (diff >= 5000 || diff <= -5000) {
                cssClass = percentageVal >= 50 ? 'impression-increase' : 'impression-decrease';
            }
        }

        return (
            <div className="table-title">
                <div className="table-left-header">
                    <div>Last</div>
                    <div>Month</div>
                </div>

                <div className="primary-percentage-label">
                    {currentValue
                        ? (isImpression ? '' : '$') + indianNumberFormat(formatValue(currentValue))
                        : '-'}
                </div>

                <div className={`secondary-percentage-label ${cssClass}`}>
                    {percentageVal ? displayNumber(Math.abs(percentageVal)) + '%' : '-'}
                </div>
            </div>
        );
    },
    accessorKey: 'last_month_original',
    size: 95,
    cell: ({ row }) => {
        const app = row.original;

        // Get values
        const lastMonth = parseFloat(String(app?.last_month_original).replace(/[^\d.-]/g, ''));
        const previousMonth = parseFloat(String(app?.previous_month_original ?? 0).replace(/[^\d.-]/g, ''));

        // Calculate percentage: (last_month / previous_month) × 100
        let percentageValue = 0;
        if (previousMonth !== 0 && previousMonth != null && !isNaN(previousMonth)) {
            percentageValue = (lastMonth / Math.abs(previousMonth)) * 100;
        } else {
            percentageValue = lastMonth === 0 ? 0 : 100;
        }

        // Determine CSS class based on row_type
        let cssClass = '';
        const diff = lastMonth - previousMonth;

        if (app.row_type === 'Revenue') {
            if (diff >= 10 || diff <= -10) {
                cssClass = percentageValue >= 110 ? 'revenue-increase' : 'revenue-decrease';
            }
        } else if (app.row_type === 'eCPM') {
            cssClass = percentageValue >= 50 ? 'ecpm-increase' : 'ecpm-decrease';
        } else if (app.row_type === 'Impressions') {
            if (diff >= 5000 || diff <= -5000) {
                cssClass = percentageValue >= 50 ? 'impression-increase' : 'impression-decrease';
            }
        }

        return (
            <div
                className="last-month-cell no-select cursor-pointer"
                onDoubleClick={handleDoubleClick}
            >
                <div className="primary-percentage-label last-month-column">
                    {app.last_month_original
                        ? indianNumberFormat(formatValue(app.last_month_original))
                        : '-'}
                </div>

                <div className={`secondary-percentage-label ${cssClass}`}>
                    {percentageValue ? displayNumber(Math.abs(percentageValue)) + '%' : '-'}
                </div>
            </div>
        );
    },
    sortingFn: numericSortingFn,
    meta: {
        omit: !checkMark.some((item) => item.type_auto_name == 'Last Month'),
        omitValue: 'Last Month',
    },
},

      {
        id: 'this_month',
        header: () => (
          <div className="table-title this_month">
            <div className="table-left-header">
              <div style={{ marginLeft: '5px' }}>This</div>
              <div>Month</div>
            </div>
            <div className="this-month-percentage">
              {typeIndex == undefined || typeIndex?.length == 0 ? (
                <>
                  <div className="this-month-field">
                    <div
                      className="primary-percentage-label"
                      title={
                        '$' +
                        indianNumberFormat(
                          formatTooltipValue(
                            String(microValueConvert(summaryData?.[0]?.Revenue?.this_month))
                          )
                        )
                      }
                    >
                      {summaryData?.[0]?.Revenue?.this_month
                        ? '$' +
                          indianNumberFormat(
                            formatValue(
                              String(microValueConvert(summaryData?.[0]?.Revenue?.this_month))
                            )
                          )
                        : '-'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {typeIndex?.length == 1 && typeIndex?.includes('1') && (
                    <div className="this-month-field">
                      <div
                        className="primary-percentage-label"
                        title={
                          formatTooltipValue(
                            String(microValueConvert(summaryData?.[0]?.Revenue?.this_month))
                          ) > 1e5
                            ? '$' +
                              indianNumberFormat(
                                formatTooltipValue(
                                  String(microValueConvert(summaryData?.[0]?.Revenue?.this_month))
                                )
                              )
                            : null
                        }
                      >
                        {summaryData?.[0]?.Revenue?.this_month
                          ? '$' +
                            indianNumberFormat(
                              formatValue(
                                String(microValueConvert(summaryData?.[0]?.Revenue?.this_month))
                              )
                            )
                          : '-'}
                      </div>
                    </div>
                  )}
                  {typeIndex?.length == 1 && typeIndex?.includes('3') && (
                    <div className="this-month-field">
                      <div
                        className="primary-percentage-label"
                        title={indianNumberFormat(
                          formatTooltipValue(
                            String(microValueConvert(summaryData?.[1]?.Impressions?.this_month))
                          )
                        )}
                      >
                        {summaryData?.[1]?.Impressions?.this_month
                          ? '$' +
                            indianNumberFormat(
                              formatValue(
                                String(microValueConvert(summaryData?.[1]?.Impressions?.this_month))
                              )
                            )
                          : '-'}
                      </div>
                    </div>
                  )}
                  {typeIndex?.length > 1 && typeIndex?.includes('1') && (
                    <div
                      className="this-month-field"
                      title={
                        '$' +
                        indianNumberFormat(
                          formatTooltipValue(
                            String(microValueConvert(summaryData?.[0]?.Revenue?.this_month))
                          )
                        )
                      }
                    >
                      <div className="primary-percentage-label">
                        {summaryData?.[0]?.Revenue?.this_month
                          ? '$' +
                            indianNumberFormat(
                              formatValue(
                                String(microValueConvert(summaryData?.[0]?.Revenue?.this_month))
                              )
                            )
                          : '-'}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className={`secondary-percentage-label`} id="this-month-percentage">
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
          let percentageValue = 0;
          if (app.row_type === 'Revenue') {
            const yesterdayValue = parseFloat(app?.last_month_original?.replace(/[^\d.-]/g, ''));
            const currentValue = parseFloat(app?.this_month_original?.replace(/[^\d.-]/g, ''));
            let percentChange = 0;
            if (yesterdayValue !== 0) {
              percentChange = (currentValue / Math.abs(yesterdayValue)) * 100;
            } else {
              percentChange = currentValue === 0 ? 0 : 100;
            }
            percentageValue = percentChange;
            if (currentValue - yesterdayValue >= 10 || currentValue - yesterdayValue < 10) {
              if (percentChange >= 110) {
                cssClass += ' revenue-increase';
              }
            }
            app.percentage_change = String(percentChange ? percentChange : '0');
          } else if (app?.row_type === 'eCPM') {
            const yesterdayValue = parseFloat(app?.last_month_original?.replace(/[^\d.-]/g, ''));
            const currentValue = parseFloat(app?.this_month_original?.replace(/[^\d.-]/g, ''));
            let percentChange = 0;
            if (yesterdayValue !== 0) {
              percentChange = (currentValue / Math.abs(yesterdayValue)) * 100;
            } else {
              percentChange = currentValue === 0 ? 0 : 100;
            }
            percentageValue = percentChange;
            if (percentChange >= 50) {
              cssClass += ' ecpm-increase';
            }
            app.percentage_change = String(percentChange ? percentChange : '0');
          } else if (app.row_type === 'Impressions') {
            const yesterdayValue = parseFloat(app?.last_month_original?.replace(/[^\d.-]/g, ''));
            const currentValue = parseFloat(app?.this_month_original?.replace(/[^\d.-]/g, ''));
            let percentChange = 0;
            if (yesterdayValue !== 0) {
              percentChange = (currentValue / Math.abs(yesterdayValue)) * 100;
            } else {
              percentChange = currentValue === 0 ? 0 : 100;
            }
            percentageValue = percentChange;
            if (currentValue - yesterdayValue >= 5000 || currentValue - yesterdayValue <= -5000) {
              if (percentChange >= 50) {
                cssClass += ' impression-increase';
              }
            }
            app.percentage_change = String(percentChange ? percentChange : '0');
          }
          return (
            <div
              className={`this-month-cell no-select cursor-pointer`}
              onDoubleClick={handleDoubleClick}
            >
              <div className="primary-percentage-label">
                {app.this_month_original
                  ? indianNumberFormat(formatValue(app.this_month_original))
                  : '-'}
              </div>
              {
                <div className={`secondary-percentage-label ${cssClass}`}>
                  {percentageValue ? displayNumber(Math.abs(percentageValue)) + '%' : '-'}
                </div>
              }
            </div>
          );
        },
        sortingFn: numericSortingFn,
        meta: {
          omit: !checkMark.some((item) => item.type_auto_name == 'This Month'),
          omitValue: 'This Month',
        },
      },

      {
    id: 'total_month',
    header: () => {
        const isImpression = typeIndex?.length === 1 && typeIndex?.includes('3');

        const currentValue = microValueConvert(
            isImpression
                ? summaryData?.[1]?.Impressions?.total_month
                : summaryData?.[0]?.Revenue?.total_month
        );

        const previousValue = microValueConvert(
            isImpression
                ? summaryData?.[1]?.Impressions?.total_previous_month
                : summaryData?.[0]?.Revenue?.total_previous_month
        );

        // Formula: (current / previous) × 100
        let percentageVal = 0;
        if (previousValue !== 0 && previousValue != null && !isNaN(previousValue)) {
            percentageVal = (currentValue / Math.abs(previousValue)) * 100;
        } else {
            percentageVal = currentValue === 0 ? 0 : 100;
        }

        // CSS class for color
        let cssClass = '';
        const diff = currentValue - previousValue;
        if (!isImpression) {
            // Revenue: green if >= 110%, red if < 110%
            if (diff >= 10 || diff <= -10) {
                cssClass = percentageVal >= 110 ? 'revenue-increase' : 'revenue-decrease';
            }
        } else {
            // Impressions: green if >= 50%, red if < 50%
            if (diff >= 5000 || diff <= -5000) {
                cssClass = percentageVal >= 50 ? 'impression-increase' : 'impression-decrease';
            }
        }

        return (
            <div className="table-title">
                <div className="table-left-header">Total</div>

                <div className="primary-percentage-label">
                    {currentValue
                        ? (isImpression ? '' : '$') + indianNumberFormat(formatValue(currentValue))
                        : '-'}
                </div>

                <div className={`secondary-percentage-label ${cssClass}`}>
                    {percentageVal ? displayNumber(Math.abs(percentageVal)) + '%' : '-'}
                </div>
            </div>
        );
    },
    accessorKey: 'total_month_original',
    size: 95,
    cell: ({ row }) => {
        const app = row.original;

        // Get values
        const totalMonth = parseFloat(String(app?.total_month_original).replace(/[^\d.-]/g, ''));
        const totalPreviousMonth = parseFloat(String(app?.total_previous_month_original ?? 0).replace(/[^\d.-]/g, ''));

        // Calculate percentage: (total_month / total_previous_month) × 100
        let percentageValue = 0;
        if (totalPreviousMonth !== 0 && totalPreviousMonth != null && !isNaN(totalPreviousMonth)) {
            percentageValue = (totalMonth / Math.abs(totalPreviousMonth)) * 100;
        } else {
            percentageValue = totalMonth === 0 ? 0 : 100;
        }

        // Determine CSS class based on row_type
        let cssClass = '';
        const diff = totalMonth - totalPreviousMonth;

        if (app.row_type === 'Revenue') {
            if (diff >= 10 || diff <= -10) {
                cssClass = percentageValue >= 110 ? 'revenue-increase' : 'revenue-decrease';
            }
        } else if (app.row_type === 'eCPM') {
            cssClass = percentageValue >= 50 ? 'ecpm-increase' : 'ecpm-decrease';
        } else if (app.row_type === 'Impressions') {
            if (diff >= 5000 || diff <= -5000) {
                cssClass = percentageValue >= 50 ? 'impression-increase' : 'impression-decrease';
            }
        }

        app.total_percentage_change = String(percentageValue || '0');

        return (
            <div
                className="last-month-cell no-select cursor-pointer"
                onDoubleClick={handleDoubleClick}
            >
                <div className="primary-percentage-label last-month-column">
                    {app.total_month_original
                        ? indianNumberFormat(formatValue(app.total_month_original))
                        : '-'}
                </div>

                <div className={`secondary-percentage-label ${cssClass}`}>
                    {percentageValue ? displayNumber(Math.abs(percentageValue)) + '%' : '-'}
                </div>
            </div>
        );
    },
    sortingFn: numericSortingFn,
    meta: {
        omit:
            !shouldShowTotalMonth ||
            checkMark.some((item) => item.type_auto_name === 'Total'),
        omitValue: 'Total',
    },
},
    ],
    [handleDoubleClick, percentageInfo, checkMark]
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
      const formattedDay = currentDate.toLocaleDateString('en-GB', { weekday: 'short' });
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

      const isDatePresent =
        appList?.some((app) =>
          app.data_by_date?.some((data) => data.report_date === responseformatDateOutput)
        ) || [];

      const dateObjects = summaryDateWise?.map((obj) => {
        const dateString = Object.keys(obj)[0];
        if (monthFilterActive) {
          const [year, month] = dateString.split('-');
          return { date: new Date(year, month - 1), data: obj[dateString] }; // Only use year and month
        } else if (weekFilterActive) {
          const m = moment(dateString, 'GGGG-[W]WW');
          return { date: m.toDate(), data: obj[dateString] };
        } else if (yearFilterActive) {
          const [year] = dateString.split('-');
          return { date: new Date(year), data: obj[dateString] }; // Only use year
        } else {
          const [day, month, year] = dateString.split('/');
          return { date: new Date(year, month - 1, day), data: obj[dateString] }; // Use day, month, and year
        }
      });

      dateObjects?.sort((a, b) => b.date - a.date);
      const sortedSummaryDateWise = dateObjects?.map((item) => {
        const year = item?.date?.getFullYear();
        const month = String(item?.date?.getMonth() + 1).padStart(2, '0');
        let dateString;
        if (monthFilterActive) {
          dateString = `${year}-${month}`; // Only use year and month
        } else if (weekFilterActive) {
          dateString = moment(item?.date).format('GGGG-[W]WW');
        } else if (yearFilterActive) {
          dateString = `${year}`; // Only use year and month
        } else {
          const day = String(item?.date?.getDate()).padStart(2, '0');
          dateString = `${year}-${month}-${day}`; // Use year, month, and day
        }
        return { [dateString]: item?.data };
      });

      let data = sortedSummaryDateWise?.[index];
      let date;
      let cssClass = '';
      let percentageChange = 0;
      let currentDateTotal;
      let currentRevenue;
      let currentImpressions;
      let revenueValue;
      let ecpmValue;
      let impressionsValue;
      if (data) {
        date = Object?.keys(data)?.[0];
        let { revenue, ecpm, impressions } = data[date];
        revenueValue = revenue;
        ecpmValue = ecpm;
        impressionsValue = impressions;
        //total summary
        currentDateTotal = Object?.keys(data)[0];
        currentRevenue = microValueConvert(data[currentDateTotal].revenue);
        currentImpressions = microValueConvert(data[currentDateTotal].impressions);

        let inputDateObject;
        // if (day && month && year) {
        if (currentDateTotal) {
          if (weekFilterActive && /^\d{4}-W\d{2}$/.test(currentDateTotal)) {
            // Parse week format (YYYY-Www) using moment.js
            const [year, week] = currentDateTotal.split('-W');
            inputDateObject = moment()
              .year(parseInt(year))
              .week(parseInt(week))
              .startOf('week')
              .toDate();
          } else {
            inputDateObject = new Date(currentDateTotal);
          }
        }
        if (currentRevenue) {
          let previousDateObject = null;
          let previousDateValue = null;

          for (const item of sortedSummaryDateWise) {
            const dateKey = Object.keys(item)[0];
            const dateRegex = monthFilterActive
              ? /^\d{4}-\d{2}$/
              : yearFilterActive
              ? /^\d{4}$/
              : weekFilterActive
              ? /^\d{4}-W\d{2}$/
              : /^\d{4}-\d{2}-\d{2}$/;
            let currentDateObject;
            if (dateRegex.test(dateKey)) {
              if (weekFilterActive) {
                const [year, week] = dateKey.split('-W');
                currentDateObject = moment()
                  .year(parseInt(year))
                  .week(parseInt(week))
                  .startOf('week')
                  .toDate();
              } else {
                currentDateObject = new Date(dateKey);
              }
              if (currentDateObject < inputDateObject) {
                previousDateObject = item[dateKey];
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
          let formattedDateOutput;
          formattedDateOutput = inputDateObject?.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
          const responseformatDateOutput2 = formattedDateOutput.split('/').reverse().join('-');
          if (
            lastDateInDashFormat !== responseformatDateOutput2 &&
            startDateInDashFormat !== responseformatDateOutput2
          ) {
            if (
              currentRevenue - previousDateValue >= 10 ||
              currentRevenue - previousDateValue <= -10
            ) {
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
                cssClass += 'revenue-increase';
              }
            }
          }
        } else if (currentImpressions) {
          let previousDateObject = null;
          let previousDateValue = null;
          for (const item of sortedSummaryDateWise) {
            const dateKey = Object.keys(item)[0];
            const dateRegex = monthFilterActive
              ? /^\d{4}-\d{2}$/
              : yearFilterActive
              ? /^\d{4}$/
              : weekFilterActive
              ? /^\d{4}-W\d{2}$/
              : /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(dateKey)) {
              let currentDateObject;
              if (weekFilterActive) {
                const [year, week] = dateKey.split('-W');
                currentDateObject = moment()
                  .year(parseInt(year))
                  .week(parseInt(week))
                  .startOf('week')
                  .toDate();
              } else {
                currentDateObject = new Date(dateKey);
              }
              if (currentDateObject < inputDateObject) {
                previousDateObject = item[dateKey];
                previousDateValue = microValueConvert(previousDateObject.impressions);
                break;
              }
            }
          }
          if (previousDateValue !== 0 && previousDateValue !== null) {
            percentageChange = (currentImpressions / Math.abs(previousDateValue)) * 100;
          } else {
            percentageChange =
              currentImpressions === 0
                ? 0
                : monthFilterActive || yearFilterActive || weekFilterActive
                ? null
                : 100;
          }
          let formattedDateOutput;
          formattedDateOutput = inputDateObject?.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
          const responseformatDateOutput3 = formattedDateOutput.split('/').reverse().join('-');

          if (
            lastDateInDashFormat !== responseformatDateOutput3 &&
            startDateInDashFormat !== responseformatDateOutput3
          ) {
            if (
              currentImpressions - previousDateValue >= 5000 ||
              currentImpressions - previousDateValue <= -5000
            ) {
              if (percentageChange >= 50) {
                cssClass += ' impression-increase';
              } else if (percentageChange < 50) {
                cssClass += ' impression-decrease';
              }
            }
          } else if (
            lastDateInDashFormat === responseformatDateOutput3 &&
            startDateInDashFormat === responseformatDateOutput3
          ) {
            if (currentRevenue - previousDateValue >= 5000) {
              if (percentageChange >= 50) {
                cssClass += ' impression-increase';
              }
            }
          }
        }
      }

      if (!isDatePresent) return null;

      const [day, month, year] = selectedStartDate.split('/');
      const isPreviousYear = parseInt(year) !== currentYear;
      const elements = document.querySelectorAll('.__rdt_custom_sort_icon__');

      if (isPreviousYear) {
        elements.forEach((element) => {
          element.classList.add('previous-year');
        });
      } else {
        elements.forEach((element) => {
          element.classList.remove('previous-year');
        });
      }

      return {
        id: `date_${index}`,
        header: () => (
          <div className={`table-title ${isPreviousYear ? 'previous-year' : ''}`}>
            <div className="table-header">
              <span className="table-date">{formattedDateOutput}</span>
              {finalShowFilter.includes('DAY') && (
                <span className="table-day">{'(' + firstLetterOfWeek + ')'}</span>
              )}
            </div>
            <div key={index} className={`datewise-summary`}>
              {typeIndex == undefined || typeIndex?.length == 0 ? (
                <>
                  <div className="datewise-cell">
                    <div
                      className="primary-percentage-label"
                      title={
                        '$' +
                        indianNumberFormat(
                          formatTooltipValue(String(microValueConvert(revenueValue)))
                        )
                      }
                    >
                      {' '}
                      {revenueValue
                        ? '$' +
                          indianNumberFormat(formatValue(String(microValueConvert(revenueValue))))
                        : '-'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {typeIndex?.length == 1 && typeIndex?.includes('1') && (
                    <div className="datewise-cell">
                      <div
                        className="primary-percentage-label"
                        title={
                          microValueConvert(revenueValue) > 1e5
                            ? '$' +
                              indianNumberFormat(
                                formatTooltipValue(String(microValueConvert(revenueValue)))
                              )
                            : null
                        }
                      >
                        {' '}
                        {revenueValue
                          ? '$' +
                            indianNumberFormat(formatValue(String(microValueConvert(revenueValue))))
                          : '-'}
                      </div>
                    </div>
                  )}
                  {typeIndex?.length == 1 && typeIndex?.includes('3') && (
                    <div className="datewise-cell">
                      <div
                        className="primary-percentage-label"
                        title={indianNumberFormat(formatTooltipValue(String(impressionsValue)))}
                      >
                        {' '}
                        {impressionsValue
                          ? indianNumberFormat(formatValue(String(impressionsValue)))
                          : '-'}
                      </div>
                    </div>
                  )}
                  {typeIndex?.length > 1 && typeIndex?.includes('1') && (
                    <div className="datewise-cell">
                      {' '}
                      <div
                        className="primary-percentage-label"
                        title={
                          '$' +
                          indianNumberFormat(
                            formatTooltipValue(String(microValueConvert(revenueValue)))
                          )
                        }
                      >
                        {revenueValue
                          ? '$' + indianNumberFormat(formatValue(microValueConvert(revenueValue)))
                          : '-'}
                      </div>
                    </div>
                  )}
                </>
              )}
              {
                <div className={`secondary-percentage-label ${cssClass}`}>
                  {percentageChange ? displayNumber(Math.abs(percentageChange)) + '%' : '-'}
                </div>
              }
            </div>
          </div>
        ),
        sortingFn: numericSortingFn,
        minSize: 115,
        sortUndefined: -1,
        meta: { isDynamic: true },
        accessorFn: (row) =>
          row.data_by_date?.find((d) => d.report_date === responseformatDateOutput),
        cell: ({ row }) => {
          const app = row.original;
          const matchingData = app?.data_by_date?.find(
            (d) => d.report_date === responseformatDateOutput
          );
          if (!matchingData) return <div>-</div>;
          let cssClass = '';
          let percentageValue = 0;
          if (app.row_type === 'Revenue') {
            const currentReportDate = matchingData?.report_date;

            const yesterdayData = monthFilterActive
              ? app?.data_by_date.find((prevData) => {
                  const prevDate = new Date(currentReportDate);
                  prevDate.setMonth(prevDate?.getMonth() - 1); // Set to the previous month
                  const lastDayOfPrevMonth = new Date(
                    prevDate?.getFullYear(),
                    prevDate?.getMonth() + 1,
                    0
                  ); // Get the last day of the previous month
                  return (
                    new Date(prevData.report_date) <= lastDayOfPrevMonth &&
                    new Date(prevData.report_date) >
                      new Date(
                        new Date(currentReportDate)?.getFullYear(),
                        new Date(currentReportDate).getMonth() - 1,
                        1
                      )
                  ); // Ensure it's within the previous month
                })
              : yearFilterActive
              ? app?.data_by_date.find((prevData) => {
                  const prevYearDate = new Date(currentReportDate);
                  prevYearDate.setFullYear(prevYearDate.getFullYear() - 1); // Set to the previous year
                  return (
                    new Date(prevData.report_date).getFullYear() === prevYearDate.getFullYear()
                  ); // Ensure it's within the previous year
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
                    new Date(prevData.report_date)?.getTime() ===
                      new Date(currentReportDate)?.getTime() - 24 * 3600 * 1000
                );

            if (yesterdayData && matchingData) {
              const yesterdayValue = parseFloat(
                String(yesterdayData?.report_value_original).replace(/[^0-9.-]/g, '')
              );
              const currentValue = parseFloat(
                String(matchingData?.report_value_original).replace(/[^0-9.-]/g, '')
              );
              let percentChange = 0;
              if (yesterdayValue !== 0 && yesterdayValue !== null) {
                percentChange = (currentValue / Math.abs(yesterdayValue)) * 100;
              } else {
                percentChange = currentValue === 0 ? 0 : 100;
              }
              percentageValue = percentChange;
              if (lastDateInDashFormat !== matchingData?.report_date) {
                if (currentValue - yesterdayValue >= 10 || currentValue - yesterdayValue <= -10) {
                  if (percentChange >= 110) {
                    cssClass += ' revenue-increase';
                  } else if (percentChange <= 90) {
                    cssClass += ' revenue-decrease';
                  }
                }
              } else if (lastDateInDashFormat === matchingData?.report_date) {
                if (currentValue - yesterdayValue >= 10 || currentValue - yesterdayValue <= -10) {
                  if (percentChange >= 110) {
                    cssClass += ' revenue-increase';
                  }
                }
              }
              matchingData.percentage_change = String(percentChange ? percentChange : '0');
            }
          } else if (app?.row_type === 'eCPM') {
            const currentReportDate = matchingData?.report_date;
            const yesterdayData = monthFilterActive
              ? app?.data_by_date.find((prevData) => {
                  const prevDate = new Date(currentReportDate);
                  prevDate.setMonth(prevDate?.getMonth() - 1); // Set to the previous month
                  const lastDayOfPrevMonth = new Date(
                    prevDate?.getFullYear(),
                    prevDate?.getMonth() + 1,
                    0
                  ); // Get the last day of the previous month
                  return (
                    new Date(prevData.report_date) <= lastDayOfPrevMonth &&
                    new Date(prevData.report_date) >
                      new Date(
                        new Date(currentReportDate)?.getFullYear(),
                        new Date(currentReportDate).getMonth() - 1,
                        1
                      )
                  ); // Ensure it's within the previous month
                })
              : yearFilterActive
              ? app?.data_by_date.find((prevData) => {
                  const prevYearDate = new Date(currentReportDate);
                  prevYearDate.setFullYear(prevYearDate.getFullYear() - 1); // Set to the previous year
                  return (
                    new Date(prevData.report_date).getFullYear() === prevYearDate.getFullYear()
                  ); // Ensure it's within the previous year
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
                    new Date(prevData.report_date)?.getTime() ===
                      new Date(currentReportDate)?.getTime() - 24 * 3600 * 1000
                );

            if (yesterdayData && matchingData) {
              const yesterdayValue = parseFloat(
                yesterdayData?.report_value_original?.replace(/[^\d.-]/g, '')
              );
              const currentValue = parseFloat(
                matchingData?.report_value_original?.replace(/[^\d.-]/g, '')
              );
              let percentChange = 0;
              if (yesterdayValue !== 0 && yesterdayValue !== null) {
                percentChange = (currentValue / Math.abs(yesterdayValue)) * 100;
              } else {
                percentChange = currentValue === 0 ? 0 : 100; // If yesterdayValue is 0, set percentChange to 100 if currentValue is not 0
              }
              percentageValue = percentChange;
              if (lastDateInDashFormat !== matchingData?.report_date) {
                if (percentChange >= 50) {
                  cssClass += 'ecpm-increase';
                } else if (percentChange < 50) {
                  cssClass += 'ecpm-decrease';
                }
              } else if (lastDateInDashFormat === matchingData?.report_date) {
                if (percentChange >= 50) {
                  cssClass += ' ecpm-increase';
                }
              }
              matchingData.percentage_change = String(percentChange ? percentChange : '0');
            }
          } else if (app.row_type === 'Impressions') {
            const currentReportDate = matchingData?.report_date;
            const yesterdayData = monthFilterActive
              ? app?.data_by_date.find((prevData) => {
                  const prevDate = new Date(currentReportDate);
                  prevDate.setMonth(prevDate?.getMonth() - 1); // Set to the previous month
                  const lastDayOfPrevMonth = new Date(
                    prevDate?.getFullYear(),
                    prevDate?.getMonth() + 1,
                    0
                  ); // Get the last day of the previous month
                  return (
                    new Date(prevData.report_date) <= lastDayOfPrevMonth &&
                    new Date(prevData.report_date) >
                      new Date(
                        new Date(currentReportDate)?.getFullYear(),
                        new Date(currentReportDate).getMonth() - 1,
                        1
                      )
                  ); // Ensure it's within the previous month
                })
              : yearFilterActive
              ? app?.data_by_date.find((prevData) => {
                  const prevYearDate = new Date(currentReportDate);
                  prevYearDate.setFullYear(prevYearDate.getFullYear() - 1); // Set to the previous year
                  return (
                    new Date(prevData.report_date).getFullYear() === prevYearDate.getFullYear()
                  ); // Ensure it's within the previous year
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
                    new Date(prevData.report_date)?.getTime() ===
                      new Date(currentReportDate)?.getTime() - 24 * 3600 * 1000
                );

            if (yesterdayData && matchingData) {
              // const yesterdayValue = parseFloat(
              //   yesterdayData?.report_value?.replace(/[^\d.-]/g, "")
              // );
              const yesterdayValue = parseFloat(
                yesterdayData?.report_value_original?.replace(/[^\d.-]/g, '')
              );

              const currentValue = parseFloat(
                matchingData?.report_value_original?.replace(/[^\d.-]/g, '')
              );

              let percentChange = 0;
              if (yesterdayValue !== 0 && yesterdayValue !== null) {
                percentChange = (currentValue / Math.abs(yesterdayValue)) * 100;
              } else {
                percentChange = currentValue === 0 ? 0 : 100; // If yesterdayValue is 0, set percentChange to 100 if currentValue is not 0
              }
              percentageValue = percentChange;
              if (lastDateInDashFormat !== matchingData?.report_date) {
                if (
                  currentValue - yesterdayValue >= 5000 ||
                  currentValue - yesterdayValue <= -5000
                ) {
                  if (percentChange >= 50) {
                    cssClass += ' impression-increase';
                  } else if (percentChange < 50) {
                    cssClass += ' impression-decrease';
                  }
                }
              } else if (lastDateInDashFormat === matchingData?.report_date) {
                if (
                  currentValue - yesterdayValue >= 5000 ||
                  currentValue - yesterdayValue <= -5000
                ) {
                  if (percentChange >= 50) {
                    cssClass += ' impression-increase';
                  }
                }
              }
              matchingData.percentage_change = String(percentChange ? percentChange : '0');
            }
          }

          const tooltipValue =
            app.row_type === 'Revenue'
              ? '$' +
                indianNumberFormat(
                  microValueConvert(matchingData?.report_value_original).toFixed(2)
                )
              : indianNumberFormat(matchingData?.report_value_original);
          return (
            <div className="table-report-value no-select" onDoubleClick={handleDoubleClick}>
              <div
                className="primary-percentage-label"
                title={
                  microValueConvert(matchingData?.report_value_original) > 1e5 ? tooltipValue : null
                }
              >
                {matchingData?.report_value_original
                  ? app.row_type === 'Revenue'
                    ? '$' +
                      indianNumberFormat(
                        formatValue(microValueConvert(matchingData?.report_value_original))
                      )
                    : indianNumberFormat(formatValue(matchingData?.report_value_original))
                  : '-'}
              </div>
              {
                <div className={`secondary-percentage-label ${cssClass}`}>
                  {percentageValue ? displayNumber(Math.abs(percentageValue)) + '%' : '-'}
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