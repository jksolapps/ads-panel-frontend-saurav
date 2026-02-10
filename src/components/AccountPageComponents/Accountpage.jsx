/** @format */

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { DataContext } from '../../context/DataContext';
import { ReportContext } from '../../context/ReportContext';
import { useLocation } from 'react-router-dom';
import DateRangePopupNew from './Popups/DateRangePopupNew';
import TypePopup from './Popups/TypePopup';
import AppAccountPopup from './Popups/AppAccountPopup';
import AccountPageAccountPopup from './Popups/AccountPageAccountPopup';
import AccountPlatFormPopup from './Popups/AccountPlatFormPopup';
import OrderBy from './Popups/OrderBy';
import CheckMark from './Popups/CheckMark';
import { MdMoreVert } from 'react-icons/md';
import { CSVLink } from 'react-csv';
import { indianNumberFormat, microValueConvert } from '../../utils/helper';
import Swal from 'sweetalert2';
import { FiDownload } from 'react-icons/fi';
import AccountInfoModal from './AccountInfoModal';
import { LuInfo } from 'react-icons/lu';
import { AiOutlinePercentage } from 'react-icons/ai';
import ShowByFilter from './Popups/ShowByFilter';
import moment from 'moment';
import { useAccountColumns } from './useAccountColumn';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useGroupSettings } from '../../context/GroupSettingsContext';

const Accountpage = () => {
  const { dateRangeforacct } = useContext(DataContext);
  const { selectedGroup } = useGroupSettings();
  const { popupFlags, accountType, accountOrder, checkMark, performanceData } =
    useContext(ReportContext);
  // all state
  const [appList, setAppList] = useState([]);
  const [fetchdata, setfetchdata] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [appPageNumber, setAppPageNumber] = useState(1);
  const [mainLoaderVisible, setMainLoaderVisible] = useState(true);
  const [isReportLoaderVisible, setIsReportLoaderVisible] = useState(false);
  const [filterAccountData, setFilterAccountData] = useState([]);
  const [filterPopupData, setFilterPopupData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [currentUnitPage, setCurrentUnitPage] = useState(1);
  const [summaryData, setSummaryData] = useState([]);
  const [summaryDateWise, setSummaryDateWise] = useState([]);
  const [updateTableNewData, setUpdatedTableNewData] = useState([]);
  const [sortedArray, setSortedArray] = useState([]);
  const [isDataPresent, setIsDataPresent] = useState(false);
  const [percentageInfo, setPercentageInfo] = useState(false);
  const [totalFlag, setTotalFlag] = useState(false);
  const [ispercentage, setIsPercentage] = useState(false);
  const location = useLocation();
  const performanceFlag = location?.state?.data?.performanceId;
  const perfermanceDateRange = location?.state?.data?.overviewSelect;

  //Handle show hide
  const TOGGLE_KEY = 'isPercentageCheck';
  const VIS_KEY = 'visibilityState';
  const VIS_STATES = ['value', 'percentage', 'both'];
  const [isPercentageBool, setIsPercentageBool] = useState(() => {
    const s = localStorage.getItem(TOGGLE_KEY);
    if (s == null) return false;
    try {
      return JSON.parse(s);
    } catch {
      return s === 'true';
    }
  });

  //New Filter
  const localShowFilter = JSON.parse(sessionStorage.getItem('apps_revenue_show_by_filter'));
  const [showByFilter, setShowByFilter] = useState(localShowFilter ? localShowFilter : []);

  const finalShowFilter = useMemo(() => {
    return showByFilter?.map((item) => item?.value);
  }, [showByFilter]);

  const monthFilterActive = useMemo(() => finalShowFilter?.includes('MONTH'), [finalShowFilter]);
  const yearFilterActive = useMemo(() => finalShowFilter?.includes('YEAR'), [finalShowFilter]);
  const weekFilterActive = useMemo(() => finalShowFilter?.includes('WEEK'), [finalShowFilter]);

  const [accountPlatform, setAccountPlatform] = useState(() => {
    const stored = sessionStorage.getItem('account_platform_filter');
    return stored ? JSON.parse(stored) : [];
  });
  const [accountNewApp, setAccountNewApp] = useState(() => {
    const stored = sessionStorage.getItem('account_app_filter');
    return stored ? JSON.parse(stored) : [];
  });

  const [accountAdmob, setAccountAdmob] = useState(() => {
    const stored = sessionStorage.getItem('account_admob_filter');
    return stored ? JSON.parse(stored) : [];
  });

  //checking type
  // setting formdata
  const newStartDate = new Date(dateRangeforacct[0]?.startDate);
  newStartDate.setHours(0, 0, 0, 0);
  const selectedStartDate = newStartDate.toLocaleDateString('en-GB');
  const newEndDate = new Date(dateRangeforacct[0]?.endDate);
  newEndDate.setHours(23, 59, 59, 999);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (newEndDate > today) {
    newEndDate.setTime(today.getTime());
  }
  const selectedEndDate = newEndDate.toLocaleDateString('en-GB');

  const firstData = selectedStartDate;
  const startDateformat = convertDateStringToTuple(firstData);
  const firstDate = new Date(startDateformat[0], startDateformat[1], startDateformat[2]);
  const endData = selectedEndDate;
  const endDateformat = convertDateStringToTuple(endData);
  const secondDate = new Date(endDateformat[0], endDateformat[1], endDateformat[2]);

  const lastDate = newEndDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const startDate = newStartDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  //final date for css conditioning
  const lastDateInDashFormat = yearFilterActive
    ? moment(lastDate, 'DD/MM/YYYY').format('YYYY')
    : monthFilterActive
      ? moment(lastDate, 'DD/MM/YYYY').format('YYYY-MM')
      : weekFilterActive
        ? moment(lastDate, 'DD/MM/YYYY').format('GGGG-[W]WW')
        : moment(lastDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
  const startDateInDashFormat = yearFilterActive
    ? moment(startDate, 'DD/MM/YYYY').format('YYYY')
    : monthFilterActive
      ? moment(startDate, 'DD/MM/YYYY').format('YYYY-MM')
      : weekFilterActive
        ? moment(startDate, 'DD/MM/YYYY').format('GGGG-[W]WW')
        : moment(startDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
  const oneDay = 24 * 60 * 60 * 1000;
  let diffDays;
  if (monthFilterActive) {
    diffDays =
      (secondDate.getFullYear() - firstDate.getFullYear()) * 12 +
      (secondDate.getMonth() - firstDate.getMonth()) +
      1;
  } else if (weekFilterActive) {
    diffDays =
      moment(secondDate).startOf('isoWeek').diff(moment(firstDate).startOf('isoWeek'), 'weeks') + 1;
  } else if (yearFilterActive) {
    diffDays = secondDate.getFullYear() - firstDate.getFullYear() + 1;
  } else {
    diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay) + 1);
  }

  const startSelection = dateRangeforacct[0]?.startDate;
  const newStartRangeDate = new Date(startSelection); // Change this line
  newStartRangeDate.setDate(startSelection?.getDate() - 1);
  const selectedNewStartDate = newStartRangeDate.toLocaleDateString('en-GB');

  const endSelection = dateRangeforacct[0]?.endDate;
  endSelection?.setHours(0, 0, 0, 0);

  let typeIndex = [];
  typeIndex = accountType?.map((value) => value?.type_auto_id);

  //get-analytics-api call
  const filterAccData = useMemo(() => {
    const fd = new FormData();
    fd?.append('user_id', localStorage.getItem('id'));
    fd?.append('user_token', localStorage.getItem('token'));
    if (selectedGroup?.length > 0) {
      fd.append('gg_id', selectedGroup);
    }
    return fd;
  }, [selectedGroup]);
  const [allAppList, setAllAppList] = useState([]);

  const { data: appResponse, isSuccess: isAppSuccess } = useQueryFetch(
    ['account-filter-data', 'group_select', selectedGroup],
    'get-analytics-filtering-data',
    filterAccData,
    {
      staleTime: 60 * 1000,
      refetchOnMount: 'ifStale',
    }
  );

  useEffect(() => {
    if (!isAppSuccess || !appResponse) return;
    const response = appResponse;

    // Filter only visible apps (app_visibility === "1" or 1)
    const visibleApps = response?.all_app_list?.filter((app) => Number(app.app_visibility) === 1);

    const uniqueAppData = visibleApps
      ?.filter((v, i, self) => self?.findIndex((t) => t?.admob_email === v?.admob_email) === i)
      .map((v, i) => ({
        ...v,
        item_checked: false,
        id: i,
      }));

    const uniqueAppAutoIdObjects = [];
    Object?.keys(visibleApps || {})?.forEach((key) => {
      const entry = visibleApps[key];

      if (!uniqueAppAutoIdObjects.some((obj) => obj?.app_auto_id === entry?.app_auto_id)) {
        uniqueAppAutoIdObjects?.push(entry);
      }
    });

    setAllAppList(uniqueAppAutoIdObjects);
    setFilterData(uniqueAppAutoIdObjects);
    setFilterAccountData(uniqueAppData);
    setFilterPopupData(response);
    setIsDataPresent(true);
  }, [appResponse, isAppSuccess]);

  useEffect(() => {
    if (accountAdmob.length > 0) {
      const updatedApp = allAppList?.filter((item) => {
        const isMatched = accountAdmob?.some((innerItem) => {
          return item.admob_auto_id == innerItem.admob_auto_id;
        });
        if (isMatched) {
          const accountAppMatch = accountNewApp?.find((accountItem) => {
            return item.app_auto_id === accountItem.app_auto_id;
          });
          if (accountAppMatch) {
            item.item_checked = true;
          }
        }
        return isMatched;
      });
      setFilterData(updatedApp);
    } else {
      setFilterData(allAppList);
    }
  }, [accountAdmob, popupFlags, allAppList]);

  //api call
  const formData = useMemo(() => {
    const fd = new FormData();
    fd.append('user_id', localStorage.getItem('id'));
    fd.append('user_token', localStorage.getItem('token'));
    if (selectedGroup?.length > 0) {
      fd.append('gg_id', selectedGroup);
    }
    // Only append date range if present
    if (dateRangeforacct?.length > 0) {
      fd.append('analytics_date_range', `${selectedNewStartDate}-${selectedEndDate}`);
    }
    const sortingColumn = accountOrder?.map((item) => item?.sorting_column);
    const sortingOrder = accountOrder?.map((item) => item?.sorting_order);
    if (sortingColumn?.length > 0) fd.append('sorting_column', sortingColumn.join(','));
    if (sortingOrder?.length > 0) fd.append('sorting_order', sortingOrder.join(','));

    const finalApp = accountNewApp?.map((item) => item?.app_auto_id);
    if (finalApp?.length > 0) fd.append('selected_app_auto_id', finalApp.join(','));

    let finalType;
    if (accountType?.length > 0) {
      finalType = accountType?.map((item) => item?.type_auto_id);
    }
    if (finalType?.length > 0) fd.append('selected_types', finalType.join(','));

    if (accountAdmob?.length > 0) {
      const finalSelectedAccount = accountAdmob?.map((item) => item?.admob_auto_id).join(',');
      const finalSelectedAccountArray = finalSelectedAccount?.split(',')?.map(Number);
      fd.append('selected_admob_auto_id', finalSelectedAccountArray.join(','));
    }

    const finalPlatform = accountPlatform?.map((item) => item?.platform_value);
    if (finalPlatform?.length > 0) fd.append('selected_app_platform', finalPlatform.join(','));

    return fd;
  }, [
    popupFlags,
    dateRangeforacct,
    selectedNewStartDate,
    selectedEndDate,
    accountOrder,
    accountNewApp,
    accountType,
    accountAdmob,
    accountPlatform,
    selectedGroup,
  ]);

  const hasDateRange = Array.isArray(dateRangeforacct) && dateRangeforacct.length > 0;
  const shouldFetch = hasDateRange;

  // 2) Build stable primitive keys from arrays/objects
  const orderKey = useMemo(
    () =>
      (accountOrder || [])
        .map((o) => `${o?.sorting_column || ''}:${o?.sorting_order || ''}`)
        .join('|'),
    [accountOrder]
  );

  const appKey = useMemo(
    () => (accountNewApp || []).map((a) => a?.app_auto_id ?? '').join('|'),
    [accountNewApp]
  );

  const typeKey = useMemo(
    () => (accountType || []).map((t) => t?.type_auto_id ?? '').join('|'),
    [accountType]
  );

  const admobKey = useMemo(
    () => (accountAdmob || []).map((a) => a?.admob_auto_id ?? '').join('|'),
    [accountAdmob]
  );

  const platformKey = useMemo(
    () => (accountPlatform || []).map((p) => p?.platform_value ?? '').join('|'),
    [accountPlatform]
  );

  // 3) Final queryKey – only primitives, so it's stable across refresh
  const queryKey = useMemo(
    () => [
      'account-table',
      'group_select',
      hasDateRange ? `${selectedNewStartDate}-${selectedEndDate}` : 'no-date',
      orderKey,
      appKey,
      typeKey,
      admobKey,
      platformKey,
      selectedGroup,
    ],
    [
      hasDateRange,
      selectedNewStartDate,
      selectedEndDate,
      orderKey,
      appKey,
      typeKey,
      admobKey,
      platformKey,
      selectedGroup,
    ]
  );

  //use query fetch
  const {
    data: response,
    isLoading,
    isFetching,
    isSuccess,
  } = useQueryFetch(queryKey, 'list-admob-revenue', formData, {
    enabled: shouldFetch,
    staleTime: 60 * 1000,
    refetchOnMount: 'ifStale',
  });

  useEffect(() => {
    if (!isSuccess || !response) return;
    const data = response?.info;
    // Deep-clone response entries to avoid mutating cached objects
    const resonseInArray = Object.values(data || {}).map((entry) => ({
      ...entry,
      data_by_date: Array.isArray(entry?.data_by_date)
        ? entry.data_by_date.map((d) => ({ ...d }))
        : [],
    }));
    const startDate = new Date(selectedStartDate.split('/').reverse().join('-'));
    const endDate = new Date(selectedEndDate.split('/').reverse().join('-'));
    // if (monthFilterActive) {
    //   resonseInArray.forEach((app) => {
    //     const monthlyData = {};
    //     app.data_by_date?.forEach((entry) => {
    //       const reportDate = new Date(entry.report_date);
    //       const monthKey = entry.report_date.substring(0, 7);
    //       if (!monthlyData[monthKey]) {
    //         monthlyData[monthKey] = {
    //           report_value_original: 0,
    //           report_value: 0,
    //         };
    //       }
    //       if (reportDate >= startDate && reportDate <= endDate) {
    //         monthlyData[monthKey].report_value_original += Number(
    //           entry.report_value_original.replace('$', '').replace(',', '')
    //         );
    //         const cleanedValue = entry.report_value.replace(/[^0-9.-]+/g, '');
    //         monthlyData[monthKey].report_value += Number(cleanedValue);
    //       }
    //     });
    //     app.data_by_date = Object.keys(monthlyData)
    //       .filter((month) => {
    //         const monthDate = new Date(month + '-01');
    //         const monthStartDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    //         const monthEndDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    //         return (
    //           (monthStartDate >= startDate && monthStartDate <= endDate) ||
    //           (monthEndDate >= startDate && monthEndDate <= endDate) ||
    //           (monthStartDate <= startDate && monthEndDate >= endDate)
    //         );
    //       })
    //       .map((month) => ({
    //         report_date: month,
    //         report_value_original:
    //           app?.row_type == 'Impressions'
    //             ? monthlyData[month].report_value_original.toFixed(2)
    //             : `$${monthlyData[month].report_value_original.toFixed(2)}`,
    //         report_value: `${monthlyData[month].report_value}`,
    //       }));
    //   });
    // } else if (weekFilterActive) {
    //   const startM = moment(selectedStartDate.split('/').reverse().join('-'));
    //   const endM = moment(selectedEndDate.split('/').reverse().join('-'));
    //   resonseInArray.forEach((app) => {
    //     const weeklyData = {};
    //     app.data_by_date?.forEach((entry) => {
    //       const entryM = moment(entry.report_date, 'YYYY-MM-DD');
    //       const weekKey = entryM.format('GGGG-[W]WW');
    //       if (!weeklyData[weekKey]) {
    //         weeklyData[weekKey] = {
    //           report_value_original: 0,
    //           report_value: 0,
    //         };
    //       }
    //       if (entryM.isSameOrAfter(startM) && entryM.isSameOrBefore(endM)) {
    //         weeklyData[weekKey].report_value_original += Number(
    //           entry.report_value_original.replace('$', '').replace(',', '')
    //         );
    //         const cleanedValue = entry.report_value.replace(/[^0-9.-]+/g, '');
    //         weeklyData[weekKey].report_value += Number(cleanedValue);
    //       }
    //     });
    //     app.data_by_date = Object.keys(weeklyData).map((week) => ({
    //       report_date: week,
    //       report_value_original:
    //         app?.row_type == 'Impressions'
    //           ? weeklyData[week].report_value_original.toFixed(2)
    //           : `$${weeklyData[week].report_value_original.toFixed(2)}`,
    //       report_value: `${weeklyData[week].report_value}`,
    //     }));
    //   });
    // } else if (yearFilterActive) {
    //   const startYear = new Date(selectedStartDate.split('/').reverse().join('-')).getFullYear();
    //   const endYear = new Date(selectedEndDate.split('/').reverse().join('-')).getFullYear();

    //   resonseInArray.forEach((app) => {
    //     const yearlyData = {};
    //     app.data_by_date?.forEach((entry) => {
    //       const reportDate = new Date(entry.report_date);
    //       const yearKey = reportDate.getFullYear();
    //       if (!yearlyData[yearKey]) {
    //         yearlyData[yearKey] = {
    //           report_value_original: 0,
    //           report_value: 0,
    //         };
    //       }
    //       if (reportDate >= startDate && reportDate <= endDate) {
    //         yearlyData[yearKey].report_value_original += Number(
    //           entry.report_value_original.replace('$', '').replace(',', '')
    //         );
    //         const cleanedValue = entry.report_value.replace(/[^0-9.-]+/g, '');
    //         yearlyData[yearKey].report_value += Number(cleanedValue);
    //       }
    //     });
    //     app.data_by_date = Object.keys(yearlyData)
    //       .filter((year) => {
    //         return year >= startYear && year <= endYear;
    //       })
    //       .map((year) => ({
    //         report_date: year,
    //         report_value_original: typeIndex?.includes('3')
    //           ? yearlyData[year].report_value_original.toFixed(2)
    //           : `$${yearlyData[year].report_value_original.toFixed(2)}`,
    //         report_value: `${yearlyData[year].report_value}`,
    //       }));
    //   });
    // }

    if (monthFilterActive) {
      resonseInArray.forEach((app) => {
        const monthlyData = {};
        app.data_by_date?.forEach((entry) => {
          const reportDate = new Date(entry.report_date);
          const monthKey = entry.report_date.substring(0, 7);
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              report_value_original: 0,
              report_value: 0,
            };
          }
          if (reportDate >= startDate && reportDate <= endDate) {
            // Handle all data types properly - remove ALL non-numeric characters
            const cleanedOriginal = String(entry.report_value_original).replace(/[^0-9.-]+/g, '');
            monthlyData[monthKey].report_value_original += Number(cleanedOriginal) || 0;

            const cleanedValue = String(entry.report_value).replace(/[^0-9.-]+/g, '');
            monthlyData[monthKey].report_value += Number(cleanedValue) || 0;
          }
        });
        app.data_by_date = Object.keys(monthlyData)
          .filter((month) => {
            const monthDate = new Date(month + '-01');
            const monthStartDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
            const monthEndDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
            return (
              (monthStartDate >= startDate && monthStartDate <= endDate) ||
              (monthEndDate >= startDate && monthEndDate <= endDate) ||
              (monthStartDate <= startDate && monthEndDate >= endDate)
            );
          })
          .map((month) => ({
            report_date: month,
            // Keep as numeric string for impressions, add $ for revenue
            report_value_original:
              app?.row_type === 'Impressions'
                ? monthlyData[month].report_value_original.toFixed(0)
                : `$${monthlyData[month].report_value_original.toFixed(2)}`,
            // Always numeric string
            report_value: monthlyData[month].report_value.toFixed(0),
          }));
      });
    } else if (weekFilterActive) {
      const startM = moment(selectedStartDate.split('/').reverse().join('-'));
      const endM = moment(selectedEndDate.split('/').reverse().join('-'));
      resonseInArray.forEach((app) => {
        const weeklyData = {};
        app.data_by_date?.forEach((entry) => {
          const entryM = moment(entry.report_date, ['YYYY-MM-DD', 'GGGG-[W]WW']);
          const weekKey = entryM.format('GGGG-[W]WW');
          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = {
              report_value_original: 0,
              report_value: 0,
            };
          }
          if (entryM.isSameOrAfter(startM) && entryM.isSameOrBefore(endM)) {
            // Clean ALL non-numeric characters for both types
            const cleanedOriginal = String(entry.report_value_original).replace(/[^0-9.-]+/g, '');
            weeklyData[weekKey].report_value_original += Number(cleanedOriginal) || 0;

            const cleanedValue = String(entry.report_value).replace(/[^0-9.-]+/g, '');
            weeklyData[weekKey].report_value += Number(cleanedValue) || 0;
          }
        });
        app.data_by_date = Object.keys(weeklyData).map((week) => ({
          report_date: week,
          report_value_original:
            app?.row_type === 'Impressions'
              ? weeklyData[week].report_value_original.toFixed(0)
              : `$${weeklyData[week].report_value_original.toFixed(2)}`,
          report_value: weeklyData[week].report_value.toFixed(0),
        }));
      });
    } else if (yearFilterActive) {
      const startYear = new Date(selectedStartDate.split('/').reverse().join('-')).getFullYear();
      const endYear = new Date(selectedEndDate.split('/').reverse().join('-')).getFullYear();

      resonseInArray.forEach((app) => {
        const yearlyData = {};
        app.data_by_date?.forEach((entry) => {
          const reportDate = new Date(entry.report_date);
          const yearKey = reportDate.getFullYear();
          if (!yearlyData[yearKey]) {
            yearlyData[yearKey] = {
              report_value_original: 0,
              report_value: 0,
            };
          }
          if (reportDate >= startDate && reportDate <= endDate) {
            // Clean ALL non-numeric characters
            const cleanedOriginal = String(entry.report_value_original).replace(/[^0-9.-]+/g, '');
            yearlyData[yearKey].report_value_original += Number(cleanedOriginal) || 0;

            const cleanedValue = String(entry.report_value).replace(/[^0-9.-]+/g, '');
            yearlyData[yearKey].report_value += Number(cleanedValue) || 0;
          }
        });
        app.data_by_date = Object.keys(yearlyData)
          .filter((year) => {
            return year >= startYear && year <= endYear;
          })
          .map((year) => ({
            report_date: year,
            report_value_original:
              app?.row_type === 'Impressions'
                ? yearlyData[year].report_value_original.toFixed(0)
                : `$${yearlyData[year].report_value_original.toFixed(2)}`,
            report_value: yearlyData[year].report_value.toFixed(0),
          }));
      });
    }

    const totals = {};

    resonseInArray?.forEach((item) => {
      const {
        row_type,
        this_month,
        last_month,
        total_month,
        previous_month,
        total_previous_month,
      } = item;
      const convertedThismonth = this_month;
      const convertedLastmonth = last_month;
      const convertedTotalmonth = total_month;
      const convertedPreviousmonth = previous_month;
      const convertedTotalPreviousmonth = total_previous_month;

      const thisMonthCount = +convertedThismonth ? +convertedThismonth : 0;
      const lastMonthCount = +convertedLastmonth ? +convertedLastmonth : 0;
      const totalMonthCount = +convertedTotalmonth ? +convertedTotalmonth : 0;
      const previousMonthCount = +convertedPreviousmonth ? +convertedPreviousmonth : 0;
      const totalPreviousMonthCount = +convertedTotalPreviousmonth
        ? +convertedTotalPreviousmonth
        : 0;

      if (!totals[row_type]) {
        totals[row_type] = {
          this_month: 0,
          last_month: 0,
          total_month: 0,
          previous_month: 0,
          total_previous_month: 0,
        };
      }
      totals[row_type].this_month += thisMonthCount;
      totals[row_type].last_month += lastMonthCount;
      totals[row_type].total_month += totalMonthCount;
      totals[row_type].previous_month += previousMonthCount;
      totals[row_type].total_previous_month += totalPreviousMonthCount;
    });
    const this_month =
      (totals?.Revenue?.this_month_original / totals?.Impressions?.this_month_original) * 1000;
    const last_month =
      (totals?.Revenue?.last_month_original / totals?.Impressions?.last_month_original) * 1000;
    const total_month =
      (totals?.Revenue?.total_month_original / totals?.Impressions?.total_month_original) * 1000;
    // date wise
    // Function to calculate total revenue, eCPM, and impressions
    const groupedData = {};
    const totalImpressions = {};
    let totalRevenue = 0;

    resonseInArray?.forEach((item) => {
      item?.data_by_date?.forEach((entry) => {
        const { report_date, report_value_original } = entry;
        const convertValue = report_value_original
          ? report_value_original?.replace(/[^0-9.-]+/g, '')
          : 0;
        const value = +convertValue ? +convertValue : 0;

        if (!isNaN(value)) {
          const currentDate = new Date(report_date);
          // Convert newStartDate and newEndDate to monthYear format
          const startMonthYear = `${newStartDate.getFullYear()}-${String(
            newStartDate.getMonth() + 1
          ).padStart(2, '0')}`;
          const endMonthYear = `${newEndDate.getFullYear()}-${String(
            newEndDate.getMonth() + 1
          ).padStart(2, '0')}`;

          // Format report_date for monthYear comparison
          const reportDate = new Date(report_date);
          const monthYear = `${reportDate.getFullYear()}-${String(
            reportDate.getMonth() + 1
          ).padStart(2, '0')}`;

          if (monthFilterActive) {
            // Compare monthYear instead of full date
            if (monthYear >= startMonthYear && monthYear <= endMonthYear) {
              // Use "YYYY-MM" for monthly aggregation
              if (!groupedData[monthYear]) {
                groupedData[monthYear] = { revenue: 0, impressions: 0 };
              }

              switch (item.row_type) {
                case 'Revenue':
                  groupedData[monthYear].revenue += value;
                  totalRevenue += value;
                  break;
                case 'Impressions':
                  groupedData[monthYear].impressions += value;
                  totalImpressions[monthYear] = (totalImpressions[monthYear] || 0) + value;
                  break;
                default:
                  break;
              }
            }
          } else if (weekFilterActive) {
            const weekKey = moment(report_date, ['YYYY-MM-DD', 'GGGG-[W]WW']).format('GGGG-[W]WW');
            if (!groupedData[weekKey]) {
              groupedData[weekKey] = { revenue: 0, impressions: 0 };
            }
            // Compare using ISO week boundaries so weekly strings are handled correctly
            const entryWeekStart = moment(report_date, ['YYYY-MM-DD', 'GGGG-[W]WW'])
              .startOf('isoWeek')
              .toDate();
            const rangeStart = moment(newStartDate).startOf('isoWeek').toDate();
            const rangeEnd = moment(newEndDate).endOf('isoWeek').toDate();
            if (entryWeekStart >= rangeStart && entryWeekStart <= rangeEnd) {
              switch (item.row_type) {
                case 'Revenue':
                  groupedData[weekKey].revenue += value;
                  totalRevenue += value;
                  break;
                case 'Impressions':
                  groupedData[weekKey].impressions += value;
                  totalImpressions[weekKey] = (totalImpressions[weekKey] || 0) + value;
                  break;
                default:
                  break;
              }
            }
          } else if (yearFilterActive) {
            if (
              currentDate.getFullYear() >= newStartDate.getFullYear() &&
              currentDate.getFullYear() <= newEndDate.getFullYear()
            ) {
              const formattedYear = report_date.split('-')[0];
              if (!groupedData[formattedYear]) {
                groupedData[formattedYear] = { revenue: 0, impressions: 0 };
              }

              switch (item.row_type) {
                case 'Revenue':
                  groupedData[formattedYear].revenue += value;
                  totalRevenue += value;
                  break;
                case 'Impressions':
                  groupedData[formattedYear].impressions += value;
                  totalImpressions[formattedYear] = (totalImpressions[formattedYear] || 0) + value;
                  break;
                default:
                  break;
              }
            }
          } else {
            // For daily data comparison
            if (currentDate >= newStartDate && currentDate <= newEndDate) {
              const formattedDate = report_date?.split('-')?.reverse()?.join('/'); // For daily data

              if (!groupedData[formattedDate]) {
                groupedData[formattedDate] = { revenue: 0, impressions: 0 };
              }

              switch (item.row_type) {
                case 'Revenue':
                  groupedData[formattedDate].revenue += value;
                  totalRevenue += value;
                  break;
                case 'Impressions':
                  groupedData[formattedDate].impressions += value;
                  totalImpressions[formattedDate] = (totalImpressions[formattedDate] || 0) + value;
                  break;
                default:
                  break;
              }
            }
          }
        }
      });
    });
    const totalECPM = {};
    for (const date in groupedData) {
      if (groupedData?.hasOwnProperty(date) && totalImpressions[date]) {
        totalECPM[date] = (groupedData[date].revenue / totalImpressions[date]) * 1000;
      }
    }
    const total = [];
    const dates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));
    dates?.forEach((date) => {
      const { revenue, impressions } = groupedData[date];
      const ecpm = totalECPM[date] || 0;
      total.push({ [date]: { revenue, ecpm, impressions } });
    });
    setSummaryDateWise(total);
    setSummaryData([
      { Revenue: totals?.Revenue },
      { Impressions: totals?.Impressions },
      { ecpm: { this_month, last_month, total_month } },
    ]);

    setAppList(resonseInArray);
    setIsReportLoaderVisible(false);
    setTimeout(() => {
      setMainLoaderVisible(false);
    }, 300);
    setTotalFlag(!totalFlag);
  }, [
    response,
    finalShowFilter,
    weekFilterActive,
    monthFilterActive,
    yearFilterActive,
    accountOrder,
  ]);

  function convertDateStringToTuple(dateString) {
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return [year, month, day];
  }

  //longest length
  let longestLength = 0;
  let longestDataArray = null;
  const updatedAppList = appList?.map((app) => {
    return {
      ...app,
      data_by_date: app.data_by_date?.filter((entry) => {
        const entryDate = new Date(entry.report_date);
        return entryDate >= newStartDate && entryDate <= endSelection;
      }),
    };
  });

  for (const app of updatedAppList) {
    const dataByDate = app?.data_by_date;
    const currentLength = dataByDate?.length ?? 0; // Handle potential undefined values

    if (currentLength > longestLength) {
      longestLength = currentLength;
      longestDataArray = dataByDate;
    }
  }

  // dynamic-width of column
  const firstSixResults = [];
  const elements = document.querySelectorAll('.rdt_TableCol[data-column-id]');
  if (elements.length > 0) {
    for (let i = 0; i < elements.length && i < 6; i++) {
      const element = elements[i];
      const dataColumnId = parseInt(element?.dataset?.columnId, 10);
      if (Number.isInteger(dataColumnId) && dataColumnId >= 1 && dataColumnId <= 6) {
        const rect = element?.getBoundingClientRect();
        const width = rect?.width;
        const value = element?.textContent?.trim();
        firstSixResults?.push({ width, value, dataColumnId });
      }
    }
  }

  let cssClass = '';
  let percentageValue = 0;
  const impressionData = summaryData[1]?.Impressions;
  const revenueData = summaryData[0]?.Revenue;
  const currentImpressionValue = microValueConvert(impressionData?.this_month);
  const previousImpressionValue = microValueConvert(impressionData?.last_month);

  const currentrevenueDataValue = microValueConvert(revenueData?.this_month);
  const previousrevenueDataValue = microValueConvert(revenueData?.last_month);
  if (typeIndex?.includes('3')) {
    if (previousImpressionValue !== 0 && previousImpressionValue !== null) {
      percentageValue = (currentImpressionValue / Math.abs(previousImpressionValue)) * 100;
    } else {
      percentageValue = currentImpressionValue === 0 ? 0 : 100;
    }
    if (
      currentImpressionValue - previousImpressionValue >= 5000 ||
      currentImpressionValue - previousImpressionValue <= -5000
    ) {
      if (percentageValue >= 50) {
        cssClass += 'impression-increase';
      } else {
        cssClass += 'impression-decrease';
      }
    }
  } else if (typeIndex?.includes('1') || typeIndex?.length === 0) {
    if (previousrevenueDataValue !== 0 && previousrevenueDataValue !== null) {
      percentageValue = (currentrevenueDataValue / Math.abs(previousrevenueDataValue)) * 100;
    } else {
      percentageValue = currentrevenueDataValue === 0 ? 0 : 100;
    }
    if (
      currentrevenueDataValue - previousrevenueDataValue >= 10 ||
      currentrevenueDataValue - previousrevenueDataValue <= -10
    ) {
      if (percentageValue >= 110) {
        cssClass += 'revenue-increase';
      } else {
        cssClass += 'revenue-decrease';
      }
    }
  }

  //handle double click on  columns
  const applyState = useCallback((state) => {
    document.documentElement.setAttribute('data-vis', state);
    localStorage.setItem(VIS_KEY, state);
    setIsPercentage(state === 'percentage');
  }, []);

  const getSavedVis = () => {
    const s = localStorage.getItem(VIS_KEY);
    return VIS_STATES.includes(s) ? s : 'value';
  };

  // hydrate on load
  useEffect(() => {
    applyState(getSavedVis());
    document.documentElement.setAttribute(
      'data-per',
      isPercentageBool ? 'per_check_off' : 'per_check_on'
    );
    localStorage.setItem(TOGGLE_KEY, String(isPercentageBool));
  }, []);

  // keep data-per + LS in sync whenever toggle changes
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-per',
      isPercentageBool ? 'per_check_off' : 'per_check_on'
    );
    localStorage.setItem(TOGGLE_KEY, String(isPercentageBool));
  }, [isPercentageBool]);

  const handlePercentageCheck = () => {
    setIsPercentageBool(!isPercentageBool);
  };

  const handleDoubleClick = () => {
    const cur = getSavedVis();
    const next = VIS_STATES[(VIS_STATES.indexOf(cur) + 1) % VIS_STATES.length];

    if ((next === 'percentage' || next === 'both') && isPercentageBool) {
      setIsPercentageBool(false);
      localStorage.setItem(TOGGLE_KEY, 'false');
      document.documentElement.setAttribute('data-per', 'per_check_on');
    }

    if (next !== 'percentage') {
      setIsPercentageBool(true);
      localStorage.setItem(TOGGLE_KEY, 'true');
      document.documentElement.setAttribute('data-per', 'per_check_off');
    }

    if (next == 'value') {
      setIsPercentageBool(false);
      localStorage.setItem(TOGGLE_KEY, 'false');
      document.documentElement.setAttribute('data-per', 'per_check_on');
    }
    applyState(next);
  };

  //table
  const columns = useAccountColumns({
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
    summaryData,
    percentageValue,
    handleDoubleClick,
  });

  //add css in header
  useEffect(() => {
    if (sortedArray && cssClass) {
      const headerClass = document?.getElementById('this-month-percentage');
      if (headerClass?.classList) {
        headerClass?.classList?.add(cssClass ? cssClass : '');
      }
    }
  }, [sortedArray, cssClass]);

  //summary scroll
  function syncSummaryRefScroll(scrollLeft) {
    const summaryDiv = document?.querySelector('.accpage');
    if (summaryDiv) {
      summaryDiv.scrollLeft = scrollLeft;
    }
  }
  // Function to get the scroll position of a target element
  function getScrollX(targetElement) {
    if (targetElement) {
      const scrollLeft = targetElement?.scrollLeft;
      syncSummaryRefScroll(scrollLeft);
    }
  }
  const targetElement = document?.querySelector('.Account-table-scroll');
  useEffect(() => {
    // Add event listener to handle scroll
    const handleScroll = () => {
      const targetElement = document?.querySelector('.Account-table-scroll');
      getScrollX(targetElement);
    };
    if (targetElement) {
      targetElement.addEventListener('scroll', () => handleScroll());
    }
    // Remove event listener when component unmounts
    return () => {
      if (targetElement) {
        targetElement.removeEventListener('scroll', () => handleScroll());
      }
    };
  }, [targetElement]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // const calculateDifference = (current, compare) => (current - compare);
  const calculateDifference = (current, compare) => {
    if (compare === 0) {
      return 0;
    }
    return (current - compare).toFixed(3);
  };
  const reorderApps = (apps, flag) => {
    switch (flag) {
      case 'Top performers':
        return apps.sort((a, b) => parseFloat(b.current) - parseFloat(a.current));
      case 'Top Mover':
        return apps.sort((a, b) => parseFloat(b.difference) - parseFloat(a.difference));
      case 'Bottom movers':
        return apps.sort((a, b) => parseFloat(a.difference) - parseFloat(b.difference));
      // default:
      //   return apps; // Return the original array if the flag is not recognized
    }
  };

  useEffect(() => {
    if (performanceData?.length > 0 && updateTableNewData) {
      const reorderedApps = reorderApps(updateTableNewData, performanceData[0]?.platform_value);
      setSortedArray([]);
      setUpdatedTableNewData(reorderedApps);
    }
  }, [updateTableNewData, performanceData]);

  useEffect(() => {
    if (appList?.length > 0) {
      const compareRangeStart = new Date(selectedNewStartDate);
      const compareRangeEnd = new Date(newStartDate);
      compareRangeEnd.setDate(compareRangeEnd.getDate() - 1);

      appList?.forEach((app) => {
        const { data_by_date } = app;
        const compareRangeTotal = data_by_date?.reduce((total, entry) => {
          const entryDate = new Date(entry.report_date);
          entryDate?.setHours(0, 0, 0, 0);
          if (entryDate >= newStartRangeDate && entryDate <= compareRangeEnd) {
            const { report_value_original } = entry;
            const value = parseFloat(report_value_original.replace('$', ''));
            return total + value;
          }
          return total;
        }, 0);
        const currentRangeTotal = data_by_date?.reduce((total, entry) => {
          const entryDate = new Date(entry.report_date);
          entryDate?.setHours(0, 0, 0, 0);
          if (entryDate >= newStartDate && entryDate <= newEndDate) {
            const { report_value_original } = entry;
            const value = parseFloat(report_value_original);
            return total + value;
          }
          return total;
        }, 0);
        app.compare = Number(compareRangeTotal).toFixed(2);
        app.current = Number(currentRangeTotal).toFixed(2);
      });
      appList?.forEach((app) => {
        app.difference = calculateDifference(parseFloat(app.current), parseFloat(app.compare));
      });
      setSortedArray([]);

      setUpdatedTableNewData(appList ? appList : []);
    } else {
      setSortedArray([]);
      setUpdatedTableNewData([]);
    }
  }, [appList, performanceData]);

  useEffect(() => {
    // Logic to select elements and check conditions
    const elements = document?.querySelectorAll('.rdt_TableCell');

    elements?.forEach((element) => {
      const textContent = element?.textContent.toLowerCase();
      if (typeIndex?.length === 0 || typeIndex === undefined) {
        // If typeIndex is not provided, apply default behavior
        if (textContent.includes('revenue')) {
          element.parentElement.classList.add('revenue');
        } else if (textContent.includes('ecpm')) {
          element.parentElement.classList.add('ecpm');
        } else if (textContent.includes('impressions')) {
          element.parentElement.classList.add('impressions');
        }
      } else {
        // If typeIndex is provided, apply custom behavior based on typeIndex
        if (typeIndex.includes('1') && textContent.includes('revenue')) {
          element.parentElement.classList.add('revenue');
          element.parentElement.classList.remove('ecpm', 'impressions');
        } else if (typeIndex.includes('2') && textContent.includes('ecpm')) {
          element.parentElement.classList.add('ecpm');
          element.parentElement.classList.remove('revenue', 'impressions');
        } else if (typeIndex.includes('3') && textContent.includes('impressions')) {
          element.parentElement.classList.add('impressions');
          element.parentElement.classList.remove('revenue', 'ecpm');
        }
      }
    });
  }, [isAppSuccess, appResponse]);

  const convertToDesiredDateFormat = (date) => {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`; // Convert DD/MM/YYYY to YYYY-MM-DD
  };

  //CSV Account Report
  const csvData = sortedArray?.length > 0 ? sortedArray : updateTableNewData;

  let formattedStartDate, formattedEndDate;
  if (monthFilterActive) {
    formattedStartDate = moment(selectedStartDate, 'DD/MM/YYYY').format('YYYY-MM');
    formattedEndDate = moment(selectedEndDate, 'DD/MM/YYYY').format('YYYY-MM');
  } else if (weekFilterActive) {
    formattedStartDate = moment(selectedStartDate, 'DD/MM/YYYY').format('GGGG-[W]WW');
    formattedEndDate = moment(selectedEndDate, 'DD/MM/YYYY').format('GGGG-[W]WW');
  } else if (yearFilterActive) {
    formattedStartDate = moment(selectedStartDate, 'DD/MM/YYYY').format('YYYY');
    formattedEndDate = moment(selectedEndDate, 'DD/MM/YYYY').format('YYYY');
  } else {
    formattedStartDate = convertToDesiredDateFormat(selectedStartDate);
    formattedEndDate = convertToDesiredDateFormat(selectedEndDate);
  }

  const csvFilter = csvData.map((item) => {
    const filteredDataByDate = item.data_by_date?.filter((entry) => {
      const reportDate = entry.report_date;
      if (weekFilterActive) {
        // reportDate will be in GGGG-[W]WW for week mode
        return reportDate >= formattedStartDate && reportDate <= formattedEndDate;
      }
      return reportDate >= formattedStartDate && reportDate <= formattedEndDate;
    });
    return {
      ...item,
      data_by_date: filteredDataByDate,
    };
  });
  const transformedData = csvFilter?.map((item, index) => {
    const rowData = {
      Id: String(index + 1),
      'App Name': item.app_display_name,
      'Console Name': item.app_console_name,
      'Package id': item.app_store_id ? item.app_store_id : '-',
      'Last Updated': item.report_updated_at,
      Type: item.row_type,
      'Last Month': indianNumberFormat(item.last_month_original.replace('$', '')),
      'This Month': indianNumberFormat(item.this_month_original?.replace('$', '')),
      Total: indianNumberFormat(item.total_month_original?.replace('$', '')),
      ...item.data_by_date
        .sort((a, b) => {
          if (weekFilterActive) {
            return (
              moment(b.report_date, 'GGGG-[W]WW').toDate() -
              moment(a.report_date, 'GGGG-[W]WW').toDate()
            );
          }
          return new Date(b.report_date) - new Date(a.report_date);
        })
        .reduce((acc, curr) => {
          const monthDay = monthFilterActive
            ? moment(curr.report_date).format('MM/YYYY')
            : yearFilterActive
              ? moment(curr.report_date, 'YYYY').format(' YYYY')
              : weekFilterActive
                ? moment(curr.report_date, 'GGGG-[W]WW').format('GGGG[W]WW')
                : moment(curr.report_date, 'YYYY-MM-DD').format('DD/MM');
          // acc[monthDay] = indianNumberFormat(curr.report_value_original);
          acc[monthDay] = indianNumberFormat(curr.report_value?.replace(/[\$,]/g, ''));
          return acc;
        }, {}),
    };
    return rowData;
  });

  var convertedData = transformedData?.map((item) => {
    const newItem = {};
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        const newKey = key;
        newItem[newKey] = item[key];
      }
    }
    return newItem;
  });

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

  dateObjects.sort((a, b) => b.date - a.date);

  const sortedSummaryDateWise = dateObjects.map((item) => {
    let dateString;
    if (monthFilterActive) {
      const year = item.date.getFullYear();
      const month = item.date.getMonth() + 1; // Months are zero-indexed
      dateString = `${year}-${month < 10 ? '0' + month : month}`; // Format as YYYY-MM
    } else if (weekFilterActive) {
      dateString = moment(item.date).format('GGGG-[W]WW');
    } else if (yearFilterActive) {
      const year = item.date.getFullYear();
      dateString = `${year}`; // Format as YYYY
    } else {
      dateString = `${item?.date?.getDate()}/${item.date.getMonth() + 1}/${item.date.getFullYear()}`; // Default format as DD/MM/YYYY
    }
    return { [dateString]: item.data };
  });

  function formatTableDate(dateString) {
    if (monthFilterActive) {
      const [year, month] = dateString.split('-');
      return `${month}/${year}`; // Format as MM/YYYY
    } else if (weekFilterActive) {
      return moment(dateString, 'GGGG-[W]WW').format('GGGG[W]WW');
    } else if (yearFilterActive) {
      return dateString; // Just return the year
    } else {
      const [day, month, year] = dateString.split('/').map((part) => parseInt(part));
      return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
    }
  }

  var totalAccountData = [];
  if (typeIndex?.includes('1')) {
    const revenueData = sortedSummaryDateWise.map((item) => ({
      date: formatTableDate(Object.keys(item)[0]),
      revenue: microValueConvert(item[Object.keys(item)[0]].revenue),
    }));
    const LastMonthRevenue = microValueConvert(summaryData[0]?.Revenue?.last_month).toFixed(2);
    const ThisMonthRevenue = microValueConvert(summaryData[0]?.Revenue?.this_month).toFixed(2);
    totalAccountData.push({
      Id: 'Total Revenue',
      'App Name': '-',
      'Console Name': '-',
      'Package id': '-',
      'Last Updated': '-',
      Type: '-',
      'Last Month': indianNumberFormat(+LastMonthRevenue),
      'This Month': indianNumberFormat(+ThisMonthRevenue),
      ...revenueData.reduce((acc, item) => {
        const monthDay = yearFilterActive
          ? moment(item.date, 'YYYY').format(' YYYY')
          : item.date.split('/').splice(0, 2).join('/');
        acc[monthDay] = indianNumberFormat(`${item.revenue.toFixed(2)}`);
        return acc;
      }, {}),
    });
  } else if (typeIndex.length == 1 && (typeIndex = '3')) {
    const impressionsData = sortedSummaryDateWise.map((item) => ({
      date: formatTableDate(Object.keys(item)[0]),
      impressions: item[Object.keys(item)[0]].impressions,
    }));
    const lastMonthImpression = microValueConvert(summaryData?.[1]?.Impressions?.last_month);
    const thisMonthImpression = microValueConvert(summaryData?.[1]?.Impressions?.this_month);
    totalAccountData.push({
      Id: 'Total Impressions',
      'App Name': '-',
      'Console Name': '-',
      'Package id': '-',
      'Last Updated': '-',
      Type: '-',
      'Last Month': indianNumberFormat(+lastMonthImpression),
      'This Month': indianNumberFormat(+thisMonthImpression),
      ...impressionsData.reduce((acc, item) => {
        const monthDay = yearFilterActive
          ? moment(item.date, 'YYYY').format(' YYYY')
          : item.date.split('/').splice(0, 2).join('/');
        acc[monthDay] = indianNumberFormat(item.impressions);
        return acc;
      }, {}),
    });
  }
  totalAccountData.forEach(function (obj) {
    convertedData?.push(obj);
  });
  //csv data of omitted column
  const keysToRemove = checkMark?.map((item) => {
    if (item?.item_checked === false) {
      return item?.type_auto_name;
    }
  });
  const finalConvertedData = convertedData?.map((obj) => {
    let newObj = { ...obj };
    keysToRemove.forEach((key) => delete newObj[key]);
    return newObj;
  });

  let diffInDays = Math.abs(Math.round((newStartDate - newEndDate) / (1000 * 60 * 60 * 24)));
  //popup for error
  if (fetchdata?.status_code == 0 && diffInDays > 60) {
    Swal.fire({
      title: fetchdata.msg,
      width: 450,
      icon: 'warning',
      focusConfirm: false,
      confirmButtonColor: '#1967d2',
      confirmButtonText: 'Okay',
    }).then((result) => {
      if (result.isConfirmed) {
      }
    });
  }

  const defaultShortValue = accountOrder?.map((item) => {
    return item?.sorting_order;
  });

  //info modal
  const [groupByData, setGroupByData] = useState([]);

  const selectListFormData = new FormData();
  selectListFormData.append('user_id', localStorage.getItem('id'));
  selectListFormData.append('user_token', localStorage.getItem('token'));
  const { data: groupAppResponse, isSuccess: isGroupSuccess } = useQueryFetch(
    'account-group',
    'list-my-active-group',
    selectListFormData,
    {
      enabled: isDataPresent,
      staleTime: 60 * 1000,
    }
  );

  useEffect(() => {
    if (!groupAppResponse && !isGroupSuccess) return;
    const groupData = groupAppResponse?.info;
    const appDataMap = new Map(filterPopupData?.all_app_list?.map((app) => [app.app_auto_id, app]));
    const updatedGroupData = groupData?.map((group) => {
      const appIds = group.group_app_ids.split(',');
      const groupApps = appIds.map((appId) => appDataMap.get(appId)).filter(Boolean);
      return {
        ...group,
        group_apps: groupApps,
      };
    });
    setGroupByData(updatedGroupData);
  }, [groupAppResponse, isGroupSuccess, filterPopupData]);

  const [updateProfileShow, setUpdateProfileShow] = useState(false);

  // filter order
  const [selectedFilterOrder, setSelectedFilterOrder] = useState([]);
  const allFilterNames = [
    'AccountPageAccountPopup',
    'AppAccountPopup',
    'TypePopup',
    'OrderBy',
    'CheckMark',
    'AccountPlatFormPopup',
    'ShowBy',
  ];

  const filterStates = {
    AccountPageAccountPopup: !!accountAdmob?.length,
    AppAccountPopup: !!accountNewApp?.length,
    TypePopup: !!accountType?.length,
    OrderBy: !!accountOrder?.length,
    CheckMark: !!checkMark?.length,
    AccountPlatFormPopup: !!accountPlatform?.length,
    ShowBy: !!showByFilter?.length,
  };
  useEffect(() => {
    const selectedNow = Object.entries(filterStates)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => key);

    setSelectedFilterOrder((prevOrder) => {
      const stillSelected = prevOrder.filter((name) => selectedNow.includes(name));
      selectedNow.forEach((filter) => {
        if (!stillSelected.includes(filter)) {
          stillSelected.push(filter);
        }
      });
      return stillSelected;
    });
  }, [JSON.stringify(filterStates)]);

  // Final dynamic order
  const selectedFilters = selectedFilterOrder.filter((name) => filterStates[name]);
  const remainingFilters = allFilterNames.filter((name) => !selectedFilters.includes(name));
  const dynamicFilterOrder = [...selectedFilters, ...remainingFilters];

  const renderComponent = (componentName) => {
    switch (componentName) {
      case 'AccountPageAccountPopup':
        return (
          <AccountPageAccountPopup
            uniqueIdentifier="account"
            filterPopupData={filterAccountData}
            selectedAccountData={accountAdmob}
            setAccountAdmob={setAccountAdmob}
            setPageNumber={setAppPageNumber}
            setIsReportLoaderVisible={setIsReportLoaderVisible}
            setCurrentUnitPage={setCurrentUnitPage}
            setAccountNewApp={setAccountNewApp}
            setAccountPlatform={setAccountPlatform}
            setAccountGroupBy={() => {}}
          />
        );
      case 'AppAccountPopup':
        return (
          <AppAccountPopup
            uniqueIdentifier="account"
            accountApp={accountNewApp}
            setaccountApp={setAccountNewApp}
            filterPopupData={filterData}
            selectedAccountData={setAccountAdmob}
            setPageNumber={setAppPageNumber}
            setIsReportLoaderVisible={setIsReportLoaderVisible}
            setCurrentUnitPage={setCurrentUnitPage}
          />
        );
      case 'AccountPlatFormPopup':
        return (
          <AccountPlatFormPopup
            uniqueIdentifier="account"
            platformValue={accountPlatform}
            setPlatformValue={setAccountPlatform}
            setPageNumber={setAppPageNumber}
            setIsReportLoaderVisible={setIsReportLoaderVisible}
            setCurrentUnitPage={setCurrentUnitPage}
          />
        );
      case 'TypePopup':
        return (
          <TypePopup
            uniqueIdentifier="account"
            setPageNumber={setAppPageNumber}
            setIsReportLoaderVisible={setIsReportLoaderVisible}
            setCurrentUnitPage={setCurrentUnitPage}
            setSortedArray={setSortedArray}
          />
        );
      case 'OrderBy':
        return (
          <OrderBy
            uniqueIdentifier="account"
            setPageNumber={setAppPageNumber}
            setIsReportLoaderVisible={setIsReportLoaderVisible}
            setCurrentUnitPage={setCurrentUnitPage}
            filterPopupData={filterPopupData}
          />
        );
      case 'CheckMark':
        return (
          <CheckMark
            uniqueIdentifier="account_checkmark"
            setPageNumber={setAppPageNumber}
            setIsReportLoaderVisible={setIsReportLoaderVisible}
            setCurrentUnitPage={setCurrentUnitPage}
            windowWidth={windowWidth}
          />
        );
      case 'ShowBy':
        return (
          <ShowByFilter
            uniqueIdentifier="apps_revenue"
            setIsReportLoaderVisible={setIsReportLoaderVisible}
            showByFilter={showByFilter}
            setShowByFilter={setShowByFilter}
          />
        );
      default:
        return null;
    }
  };

  const renderedComponents = dynamicFilterOrder?.map((filterName, index) => (
    <React.Fragment key={filterName + index}>{renderComponent(filterName)}</React.Fragment>
  ));

  // FIX #1: Improved loader logic - show overlay when fetching (including filter changes)
  // Only show main loader on very first load (no data exists yet)
  const isFirstLoad = isLoading && !response && updateTableNewData.length === 0;
  // Show overlay loader when we have existing data and are fetching new data
  const showOverlayLoader = isFetching && (!!response || updateTableNewData.length > 0);

  return (
    <div className="right-box-wrap">
      <div className={`table-box-wrap main-box-wrapper pdglr24`}>
        <div className="userBoxWrap user-section-wrapper">
          <div className={`account-page-topbar`}>
            <div className="button-top-wrap">
              <div className="filter-bar-wrap">
                <div className="filter-box" id="filter-box">
                  <DateRangePopupNew
                    perfermanceDateRange={perfermanceDateRange}
                    selectedStartDate={selectedStartDate}
                    selectedEndDate={selectedEndDate}
                    setPageNumber={setAppPageNumber}
                    setIsReportLoaderVisible={setIsReportLoaderVisible}
                    setCurrentUnitPage={setCurrentUnitPage}
                  />
                  {renderedComponents}
                </div>
                <div className="more-button three-icon-button">
                  <MdMoreVert className="material-icons" />
                  <div className="more-box">
                    <div className="border-box">
                      <CSVLink
                        className="downloadbtn"
                        filename="account-report.csv"
                        data={finalConvertedData ? finalConvertedData : []}
                      >
                        <span className="material-icons">
                          <FiDownload style={{ marginTop: '6px' }} />
                        </span>
                        Download CSV
                      </CSVLink>
                    </div>
                    <div className="border-box">
                      <div
                        className="downloadbtn"
                        style={{
                          color: '#5f6368',
                          fontWeight: '100',
                          fontSize: '15px',
                        }}
                        onClick={() => setUpdateProfileShow(true)}
                      >
                        <span className="material-icons">
                          <LuInfo
                            style={{
                              marginTop: '-2px',
                              marginRight: '12px',
                              fontSize: '20px',
                            }}
                          />
                        </span>
                        Calculation Info
                      </div>
                    </div>
                    {!ispercentage && (
                      <div
                        className="border-box  percentage-box"
                        style={{ display: 'flex', padding: '6px 12px' }}
                      >
                        <span
                          className="material-icons"
                          style={{
                            padding: '0px 12px',
                            fontSize: '20px',
                            marginTop: '-4px',
                          }}
                        >
                          <AiOutlinePercentage />
                        </span>
                        <div className="show-button percentage-btn">Percentage</div>
                        <label className="switch toggle-icon" style={{ position: 'relative' }}>
                          <input
                            type="checkbox"
                            id="checkbox"
                            onChange={handlePercentageCheck}
                            checked={isPercentageBool}
                          />
                          <div className="slider round"></div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <>
            <div className={`Account-Table ${defaultShortValue}`}>
              <div className={`table-container ad-units-box user-table-box `}>
                {/* FIX #1: Use combined showOverlayLoader for overlay spinner */}
                {showOverlayLoader && (
                  <div className="shimmer-spinner overlay-spinner">
                    <Spinner animation="border" variant="secondary" />
                  </div>
                )}
                <div
                  className={`fixed-columns hover-table ${
                    checkMark?.length > 0
                      ? checkMark[0]?.type_auto_name === 'Hide'
                        ? 'same-column'
                        : 'extra-column'
                      : 'same-column'
                  }`}
                >
                  {isFirstLoad ? (
                    <div className="shimmer-spinner">
                      <Spinner animation="border" variant="secondary" />
                    </div>
                  ) : (
                    <GeneralTanStackTable
                      data={updateTableNewData}
                      columns={columns}
                      enableResize={false}
                      stickyColumns={7}
                      enableVirtualization
                      height={50 * 15 + 110}
                      variant="normal"
                    />
                  )}
                </div>
              </div>
              <AccountInfoModal
                show={updateProfileShow}
                onHide={() => setUpdateProfileShow(false)}
              />
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default Accountpage;
