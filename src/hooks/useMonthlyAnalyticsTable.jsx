import { createColumnHelper } from '@tanstack/react-table';
import moment from 'moment';
import Tippy from '@tippyjs/react';
import { indianNumberFormat, displayNumber, formatValue } from '../utils/helper';
import GeneralTinyAppBox from '../components/GeneralComponents/GeneralTinyAppBox';
import { useEffect, useMemo, useState } from 'react';

const columnHelper = createColumnHelper();

export const useAnalyticsColumns = ({
   totals,
   omittedColumnNames,
   monthlyTotal,
   mainData,
   finalMonthRange,
}) => {
   // --- STATIC COLUMNS ---
   const staticColumns = useMemo(
      () => [
         columnHelper.accessor('app_display_name', {
            id: 'apps',
            header: () => (
               <div className="report-title" data-sort-value="APP">
                  <div className="report-header-dimension">Apps</div>
               </div>
            ),
            cell: (info) => {
               const app = info.row.original;
               return (
                  <GeneralTinyAppBox
                     uniqueIdentifier="monthly_analytics"
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
            meta: { title: 'Apps', width: 150, sticky: true },
         }),

         columnHelper.accessor('country', {
            id: 'country',
            header: () => (
               <div className="report-title">
                  <div className="report-header-dimension">Country</div>
               </div>
            ),
            cell: (info) => (
               <div className="campaign-column country-text">
                  <div>{info.getValue() || '-'}</div>
               </div>
            ),
            enableSorting: true,
            meta: { title: 'Country', width: 120 },
         }),

         columnHelper.accessor('baseMonth', {
            id: 'month',
            header: () => (
               <div className="report-title">
                  <div className="report-header-dimension">Month</div>
               </div>
            ),
            cell: (info) => (
               <div className="campaign-column country-text">
                  <div>{moment(info.getValue()).format('MMM YY')}</div>
               </div>
            ),
            enableSorting: true,
            meta: { title: 'Month', width: 80 },
         }),

         columnHelper.accessor('advertiserAdCost', {
            id: 'totalCost',
            header: () => (
               <div className="report-title">
                  <div className="analytics-header-dimension">Total Cost</div>
                  <div className="report-total-dimension">
                     {totals?.advertiserAdCost
                        ? '$' +
                        indianNumberFormat(Number(totals?.advertiserAdCost).toFixed(2))
                        : '-'}
                  </div>
               </div>
            ),
            cell: (info) => {
               const val = info.getValue();
               if (!val) return <div>-</div>;
               const finalCost = indianNumberFormat(displayNumber(val));
               const formatted =
                  Number.isInteger(Number(finalCost)) ? finalCost + '.00' : finalCost;
               return <div>{'$' + formatted}</div>;
            },
            enableSorting: true,
            meta: { title: 'Total Cost', width: 120 },
         }),

         columnHelper.accessor('totalAdRevenue', {
            id: 'totalRevenue',
            header: () => (
               <div className="report-title">
                  <div className="analytics-header-dimension">Total Revenue</div>
                  <div className="report-total-dimension">
                     {totals?.totalAdRevenue
                        ? '$' +
                        indianNumberFormat(Number(totals?.totalAdRevenue).toFixed(2))
                        : '-'}
                  </div>
               </div>
            ),
            cell: (info) => {
               const val = info.getValue();
               if (!val) return <div>-</div>;
               const finalRevenue = indianNumberFormat(displayNumber(val));
               const formatted =
                  Number.isInteger(Number(finalRevenue))
                     ? finalRevenue + '.00'
                     : finalRevenue;
               return <div>{'$' + formatted}</div>;
            },
            enableSorting: true,
            meta: { title: 'Total Revenue', width: 122 },
         }),

         columnHelper.accessor('returnOnAdSpend', {
            id: 'roas',
            header: () => (
               <div className="report-title">
                  <div className="analytics-header-dimension">ROAS</div>
                  <Tippy
                     content={<>{totals?.roas ? Number(totals?.roas).toFixed(2) : '-'}</>}
                     placement="top"
                     arrow
                     duration={0}
                     className="new_custom_tooltip"
                  >
                     <div className="report-total-dimension">
                        {totals?.roas
                           ? Number(totals?.roas * 100).toFixed(1) + '%'
                           : '-'}
                     </div>
                  </Tippy>
               </div>
            ),
            cell: (info) => {
               const raw = info.getValue();
               let roasValue = '-';
               if (raw != null && raw !== '') {
                  const num = Number(raw);
                  roasValue = isNaN(num) ? '-' : num;
               }
               return (
                  <Tippy
                     content={<>{Number(roasValue).toFixed(2)}</>}
                     placement="top"
                     arrow
                     duration={0}
                     className="new_custom_tooltip"
                  >
                     <div className="report-total-dimension">
                        {Number(roasValue * 100).toFixed(1) + '%'}
                     </div>
                  </Tippy>
               );
            },
            enableSorting: true,
            meta: { title: 'ROAS', width: 85 },
         }),
      ].map((col) => ({
         ...col,
         meta: {
            ...col.meta,
            omit: omittedColumnNames.includes(col.meta?.title),
         },
      })),
      [totals, omittedColumnNames]
   );
   // --- DYNAMIC COLUMNS ---
   const dynamicColumns = useMemo(() => {
      if (!mainData?.length || !finalMonthRange) return [];

      const start = moment(finalMonthRange[0]).startOf('month');
      const end = moment();
      const diffMonths = end.diff(start, 'months') + 1;

      const availableMonths = new Set();
      mainData.forEach((app) => {
         app.month_wise_total?.forEach((d) => availableMonths.add(+d.month + 1));
      });

      const cols = [];
      for (let month = 1; month <= diffMonths; month++) {
         if (!availableMonths.has(month)) continue;

         const columnIndex = month - 1;
         const totalValue = monthlyTotal.find((d) => +d?.month === columnIndex);

         cols.push(
            columnHelper.display({
               id: `month-${columnIndex}`,
               header: () => (
                  <div className="report-title" data-sort-value={columnIndex}>
                     <div className="analytics-header-dimension">{totalValue?.label}</div>
                     <Tippy
                        content={
                           <div className="monthly_tooltip">
                              <div>ROAS : {Number(totalValue?.average).toFixed(2)}</div>
                              <div>
                                 Revenue :{' '}
                                 {'$' + indianNumberFormat(totalValue?.revenue?.toFixed(2) || 0)}
                              </div>
                           </div>
                        }
                        placement="top"
                        arrow
                        duration={0}
                        className="new_custom_tooltip"
                     >
                        <div className="report-total-dimension">
                           {totalValue?.average
                              ? Number(totalValue?.average * 100).toFixed(1) + '%'
                              : '-'}
                        </div>
                     </Tippy>
                  </div>
               ),
               cell: ({ row }) => {
                  const data = row.original.month_wise_total?.find(
                     (d) => +d?.month === columnIndex
                  );
                  if (!data || +data.value === 0) {
                     return (
                        <div className="no-select" style={{ justifyContent: 'center' }}>
                           <div className="primary-percentage-label roas-text roas-label">-</div>
                           <div className="primary-percentage-label roas-text roas-label demo-rev">-</div>
                        </div>
                     );
                  }
                  const roas = Number(data.cumulative_roas).toFixed(2);
                  const finalPercentage = Number(data.cumulative_roas * 100).toFixed(1);
                  const value = '$' + indianNumberFormat(formatValue(+data.value));
                  return (
                     <div className="no-select" style={{ justifyContent: 'center' }}>
                        <Tippy
                           content={<>ROAS : {data.cumulative_roas === 0 ? '0.00' : roas}</>}
                           placement="top"
                           arrow
                           duration={0}
                           className="new_custom_tooltip"
                        >
                           <div className="primary-percentage-label roas-text roas-label">
                              {finalPercentage + '%'}
                           </div>
                        </Tippy>
                        <div className="primary-percentage-label roas-text roas-label demo-rev">{value}</div>
                     </div>
                  );
               },
               enableSorting: true,
               meta: {
                  title: `Month-${columnIndex}`,
                  minWidth: 105,
                  width: 120,
                  alignMent: 'right',
               },
            })
         );
      }

      return cols;
   }, [mainData, finalMonthRange, monthlyTotal]);

   return useMemo(() => [...staticColumns, ...dynamicColumns], [staticColumns, dynamicColumns]);
};
