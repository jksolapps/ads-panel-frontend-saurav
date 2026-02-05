/** @format */

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import Footer from '../Footer';
import Spinner from 'react-bootstrap/Spinner';
import DateRangePopup from './Popups/DateRangePopup';
import AppPopup from './Popups/AppPopup';
import CountryPopup from './Popups/CountryPopup';
import FormatPopup from './Popups/FormatPopup';
import AppVersion from './Popups/AppVersion';
import PlatformPopup from './Popups/PlatformPopup';
import { ReportContext } from '../../context/ReportContext';
import 'bootstrap/dist/css/bootstrap.css';
import useGeneratePagination from '../../hooks/useGeneratePagination';
import AdUnitsPopup from './Popups/AdUnitsPopup';
import DimensionBox from './DimensionBox';
import { MdMoreVert } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import MatrixBox from './MatrixBox';
import AccountSelectPopup from './Popups/AccountSelectPopup';
import { CSVLink } from 'react-csv';
import { FiDownload } from 'react-icons/fi';
import { MdOutlineEdit } from 'react-icons/md';
import filterUtilsPopupData from '../../utils/report_filter.json';
import GroupByFilter from './Popups/GroupByFilter';
import moment from 'moment';
import { indianNumberFormat } from '../../utils/helper';
import { BiGitCompare } from 'react-icons/bi';
import useStickyOnScroll from '../../hooks/useStickyOnScroll';
import GeneralTinyAppBox from '../GeneralComponents/GeneralTinyAppBox';
import { useGroupSettings } from '../../context/GroupSettingsContext';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import GeneralDateRange from '../GeneralFilters/GeneralDateRange';

import { all_ad_formats } from '../../utils/filter_list.json';
import GeneralDataFilter from '../GeneralFilters/GeneralDataFilter';
import GeneralCountry from '../GeneralFilters/GeneralCountry';
import GeneralPlatform from '../GeneralFilters/GeneralPlatform';
import useReorderedFilterOrder from '../../hooks/useReorderedFilterOrder';
import Tippy from '@tippyjs/react';

const ReportContentBox = () => {
  const { sharedData, sharedMatrixData } = useContext(DataContext);

  const {
    appValue,
    popupFlags,
    setPopupFlags,
    dimensionValue,
    unitValue,
    setAppValue,
    setUnitValue,
    allMatrixData,
    selectedAccountData,
    setSelectedAccountData,
    appVersionData,
    setappVersionData,
    allAppVersionData,
    setallAppVersionData,
    filteredAppVersionData,
    setfilteredAppVersionData,
    setcheckedAppVersion,
    selectedReportFilter,
    setToggleResize,
    groupByValue,
  } = useContext(ReportContext);

  const { selectedGroup } = useGroupSettings();
  const [tableNewData, setTableNewData] = useState([]);
  const [mainLoaderVisible, setMainLoaderVisible] = useState(true);
  const [SummaryData, setSummaryData] = useState({});
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLength, setPageLength] = useState(10);
  const [currentUnitPage, setCurrentUnitPage] = useState(1);
  const [totalPages, setTotalPages] = useState('');
  const [order, setOrder] = useState('');
  const [columnName, setColumnName] = useState('');
  const [totalRecordsData, setTotalRecordsData] = useState([]);

  // Small helpers to keep metric cell rendering consistent and concise
  const ConditionalTippy = ({ isUnitSwitch, previous, children }) =>
    isUnitSwitch ? (
      <Tippy
        content={<>{previous}</>}
        placement="top"
        duration={0}
        offset={[0, 2]}
        className="custom_black_tippy"
      >
        {children}
      </Tippy>
    ) : (
      children
    );

  const MetricCell = ({ isUnitSwitch, current, previous, highlightClass, percentageMove }) => (
    <ConditionalTippy isUnitSwitch={isUnitSwitch} previous={previous}>
      <div className="report_column_box">
        <div className="report_main_value">{current}</div>
        <div className={`report_prev_value ${highlightClass}`}>{percentageMove}</div>
      </div>
    </ConditionalTippy>
  );
  const [prevTotalRecordsData, setPrevTotalRecordsData] = useState([]);
  const [isReportLoaderVisible, setIsReportLoaderVisible] = useState(false);
  const [accountChecked, setAccountChecked] = useState(false);
  const [disable, setDisabled] = useState(false);
  const [appVersion, setAppVersion] = useState(false);
  const [isFilterDataLoaded, setIsFilterDataLoaded] = useState(false);

  const reportlocation = useLocation();
  const app_id = reportlocation?.state?.auto_app_id;
  const au_id = reportlocation?.state?.au_id;
  const filterData = reportlocation?.state?.filterData;
  // Report-account-api-calling
  const [filterAccountData, setFilterAccountData] = useState([]);
  const [filterAppData, setFilterAppData] = useState([]);
  const [filterAdUnitData, setFilteAdUnitData] = useState([]);
  const [adUnitId, setAdUnitId] = useState('');
  const [filterPopupData, setFilterPopupData] = useState([]);
  const [countryWiseSorting, setSortingCountryWise] = useState([]);
  const [isAdUnitClick, setIsAdUnitClick] = useState(false);
  const localUnitSwitch = JSON.parse(localStorage.getItem('unit_switch'));

  const [isUnitSwitch, setIsUnitSwitch] = useState(localUnitSwitch ? localUnitSwitch : false);
  const [filteredAppData, setFilteredAppData] = useState([]);
  const [checkedApp, setCheckedApp] = useState([]);
  const [allAppData, setAllAppData] = useState([]);

  //New State
  const [sortingColumn, setSortingColumn] = useState({
    id: 'DATE',
    desc: true,
  });
  const [dateRange, setDateRange] = useState('');
  const [formatValue, setFormatValue] = useState(() => {
    const stored = sessionStorage.getItem('report_format_filter');
    return stored ? JSON.parse(stored) : [];
  });
  const [countryValue, setCountryValue] = useState(() => {
    const stored = sessionStorage.getItem('report_country_filter');
    return stored ? JSON.parse(stored) : [];
  });
  const [platformValue, setPlatformValue] = useState(() => {
    const stored = sessionStorage.getItem('report_platform_filter');
    return stored ? JSON.parse(stored) : [];
  });

  // const finalApp = appValue?.map((item) => {
  // 	return item?.app_auto_id;
  // });
  // const finalCountry = countryValue?.map((item) => {
  // 	return item?.alpha2_code;
  // });
  // const finalFormat = formatValue?.map((item) => item?.type);
  // const finalPlatform = platformValue?.map((item) => item?.platform_value);

  const finalVersion = appVersionData?.map((item) => {
    return {
      app_display_name: item.app_display_name,
      name: item.name,
    };
  });
  const refUnit = (unitValue ?? [])
    .filter((u) => u?.unit_checked && u?.unit_auto_id != null && u?.unit_auto_id !== '')
    .map((u) => u.unit_auto_id);

  useEffect(() => {
    const unit_flag = dimensionValue?.some((item) => {
      return item?.id == 'AD_UNIT' && item?.dimension_checked ? true : false;
    });
    setIsAdUnitClick(unit_flag);
  }, [dimensionValue]);

  const finalDimension = dimensionValue
    ?.filter((item) => item?.dimension_checked && item.id !== 'DAY')
    ?.map((item) => item?.id)
    ?.join(',');

  const [finalSelectedAccount, setFinalSelectedAccount] = useState('');

  useEffect(() => {
    setFinalSelectedAccount(
      selectedAccountData
        ?.map((item) => {
          return item?.admob_auto_id;
        })
        .join(',')
    );
  }, [selectedAccountData]);

  const finalGroupValue = groupByValue?.map((item) => {
    return item?.value;
  });

  //First API call
  const filterAccData = useMemo(() => {
    const fd = new FormData();
    fd?.append('user_id', localStorage.getItem('id'));
    fd?.append('user_token', localStorage.getItem('token'));
    if (selectedGroup?.length > 0) {
      fd.append('gg_id', selectedGroup);
    }
    return fd;
  }, [selectedGroup]);

  const { data: apiResponse, isSuccess: isApiSuccess } = useQueryFetch(
    ['report-filter-data', 'group_select', selectedGroup],
    'get-analytics-filtering-data',
    filterAccData,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnMount: 'ifStale',
    }
  );

  // useEffect(() => {
  // 	if (!isApiSuccess || !apiResponse || apiResponse.status_code !== 1) return;

  // 	const allApps = apiResponse.all_app_list || [];

  // 	// read localStorage safely
  // 	let selectedAppId = null;
  // 	const raw = localStorage.getItem('accountId');
  // 	if (raw) {
  // 		try {
  // 			selectedAppId = JSON.parse(raw);
  // 		} catch {
  // 			selectedAppId = raw;
  // 		}
  // 	}

  // 	// unique by email
  // 	const uniqueAppData = allApps.filter(
  // 		(app, idx, arr) => arr.findIndex((t) => t.admob_email === app.admob_email) === idx
  // 	);

  // 	// map with check flags
  // 	const withCheckFlags = uniqueAppData.map((app, index) => {
  // 		const isSelected = selectedAppId != null && app.admob_auto_id == selectedAppId;
  // 		return {
  // 			...app,
  // 			item_checked: selectedAppId != null ? isSelected : index === 0,
  // 			id: index + 1,
  // 		};
  // 	});

  // 	setFilterAccountData(withCheckFlags);
  // 	setFilterPopupData(apiResponse);

  // 	// derive finalSelectedAccount from checked apps
  // 	const checkedAccounts = withCheckFlags
  // 		.filter((app) => app.item_checked)
  // 		.map((app) => app.admob_auto_id);

  // 	let resolvedAccount = undefined;

  // 	if (checkedAccounts.length > 0) {
  // 		resolvedAccount = checkedAccounts.join(',');
  // 	} else if (withCheckFlags.length > 0) {
  // 		resolvedAccount = String(withCheckFlags[0].admob_auto_id);
  // 	}

  // 	if (resolvedAccount !== undefined) {
  // 		localStorage.setItem('accountId', JSON.stringify(resolvedAccount));
  // 		setFinalSelectedAccount(resolvedAccount);
  // 	} else {
  // 		setFinalSelectedAccount('');
  // 	}

  // 	setIsFilterDataLoaded(true);
  // }, [isApiSuccess, apiResponse]);

  useEffect(() => {
    if (!isApiSuccess || !apiResponse || apiResponse.status_code !== 1) return;

    const allApps = apiResponse.all_app_list || [];

    // Filter only visible apps (app_visibility === "1" or 1)
    const visibleApps = allApps.filter((app) => Number(app.app_visibility) === 1);

    // read localStorage safely
    let selectedAppId = null;
    const raw = localStorage.getItem('accountId');
    if (raw) {
      try {
        selectedAppId = JSON.parse(raw);
      } catch {
        selectedAppId = raw;
      }
    }

    // unique by email from visible apps only
    const uniqueAppData = visibleApps.filter(
      (app, idx, arr) => arr.findIndex((t) => t.admob_email === app.admob_email) === idx
    );

    // map with check flags
    const withCheckFlags = uniqueAppData.map((app, index) => {
      const isSelected = selectedAppId != null && app.admob_auto_id == selectedAppId;
      return {
        ...app,
        item_checked: selectedAppId != null ? isSelected : index === 0,
        id: index + 1,
      };
    });

    setFilterAccountData(withCheckFlags);

    // Update filterPopupData with visible apps only
    setFilterPopupData({
      ...apiResponse,
      all_app_list: visibleApps,
    });

    // derive finalSelectedAccount from checked apps
    const checkedAccounts = withCheckFlags
      .filter((app) => app.item_checked)
      .map((app) => app.admob_auto_id);

    let resolvedAccount = undefined;

    if (checkedAccounts.length > 0) {
      resolvedAccount = checkedAccounts.join(',');
    } else if (withCheckFlags.length > 0) {
      resolvedAccount = String(withCheckFlags[0].admob_auto_id);
    }

    if (resolvedAccount !== undefined) {
      localStorage.setItem('accountId', JSON.stringify(resolvedAccount));
      setFinalSelectedAccount(resolvedAccount);
    } else {
      setFinalSelectedAccount('');
    }

    setIsFilterDataLoaded(true);
  }, [isApiSuccess, apiResponse]);

  useEffect(() => {
    if (!apiResponse?.all_app_list || !finalSelectedAccount) return;

    const allApps = apiResponse.all_app_list;

    const accountArray = finalSelectedAccount
      .split(',')
      .map((account) => account.trim())
      .filter(Boolean);

    const uniqueAppList = allApps
      .filter((item) => accountArray.includes(String(item.admob_auto_id)))
      .map((item, i) => ({
        ...item,
        item_checked: false,
        id: i + 1,
      }));

    // Build ad-unit structure
    const initialData = uniqueAppList.map((app) => ({
      ...app,
      ad_units: (app?.ad_units ?? '')
        .split(',')
        .filter(Boolean)
        .map((unitStr) => {
          const [unit_auto_id, unit_display_name, ad_unit_id] = unitStr.split('#');

          return {
            unit_auto_id,
            unit_display_name,
            unit_checked: app?.app_auto_id === app_id && au_id === ad_unit_id,
            app_name: app?.app_display_name,
            app_platform: app?.app_platform,
            ad_unit_id,
          };
        }),
    }));

    // If we came from a link with au_id, clear app filters once.
    if (au_id) {
      sessionStorage.removeItem('app_filter');
      setAppValue([]);
    }

    // Read local unit filter safely
    let localData = null;
    try {
      const raw = sessionStorage.getItem('unit_filter');
      localData = raw ? JSON.parse(raw) : null;
    } catch {
      localData = null;
    }

    // Merge selected units from local storage
    initialData.forEach((app) => {
      let appChecked = false;

      app.ad_units?.forEach((unit) => {
        const matchedUnit = localData?.find(
          (localUnit) => localUnit.unit_auto_id == unit.unit_auto_id
        );

        if (matchedUnit) {
          unit.unit_checked = true;
          appChecked = true;
        }
      });

      if (appChecked) {
        app.item_checked = true;
      }
    });

    // Collect all checked units
    const checkedUnits =
      initialData.flatMap((app) => app.ad_units?.filter((u) => u.unit_checked) ?? []) ?? [];

    if (checkedUnits.length === 0) {
      setUnitValue([
        {
          unit_auto_id: null,
          unit_display_name: '',
          unit_checked: false,
          app_name: null,
          app_platform: null,
          ad_unit_id: null,
        },
      ]);
    } else {
      setUnitValue(checkedUnits);
    }

    // First selected ad unit id (if any)
    const adUnitIds =
      initialData.flatMap(
        (app) => app.ad_units?.filter((u) => u.unit_checked).map((u) => u.unit_auto_id) ?? []
      ) ?? [];

    setAdUnitId(adUnitIds[0] ?? null);
    setFilteAdUnitData(initialData);
    setFilterAppData(uniqueAppList);
  }, [finalSelectedAccount, apiResponse, au_id, app_id, selectedGroup]);

  const newStartDate = new Date(dateRange[0]?.startDate);
  const selectedStartDate = newStartDate.toLocaleDateString('en-GB');
  const newEndDate = new Date(dateRange[0]?.endDate);
  const selectedEndDate = newEndDate.toLocaleDateString('en-GB');

  var queryString = window.location.search;
  var queryParams = {};
  if (queryString) {
    queryString = queryString.substring(1);
    var paramPairs = queryString.split('&');
    for (var i = 0; i < paramPairs?.length; i++) {
      var pair = paramPairs[i].split('=');
      var paramName = decodeURIComponent(pair[0]);
      var paramValue = decodeURIComponent(pair[1]);
      queryParams[paramName] = paramValue;
    }
  }
  const { appId } = queryParams;

  const finalApp = useMemo(
    () => (appValue?.map((item) => item?.app_auto_id) || []).slice().sort().join(','),
    [appValue]
  );
  const finalCountry = useMemo(
    () => (countryValue?.map((item) => item?.alpha2_code) || []).slice().sort().join(','),
    [countryValue]
  );
  const finalFormat = useMemo(
    () => (formatValue?.map((item) => item?.type) || []).slice().sort().join(','),
    [formatValue]
  );

  const finalPlatform = useMemo(
    () =>
      (platformValue?.map((item) => item?.platform_value || item?.value) || [])
        .slice()
        .sort()
        .join(','),
    [platformValue]
  );
  const finalUnit = useMemo(() => (refUnit || []).slice().sort().join(','), [refUnit]);

  const finalGroup = useMemo(() => {
    return (groupByValue || [])
      .map((g) => g?.value)
      .sort()
      .join(',');
  }, [groupByValue]);

  const sortingColumnValue = useMemo(() => {
    const isValidDimension = dimensionValue?.some(
      (d) => d?.dimension_checked && d.id === sortingColumn.id
    );

    const isValidMatrix = allMatrixData?.some(
      (m) => m?.matrix_checked && m.name === sortingColumn.id
    );

    if (groupByValue?.length > 0) {
      const key = groupByValue.map((i) => i?.value);
      return key == 'QUARTER' ? 'MONTH' : key.join(',');
    }

    if (sortingColumn.id && (isValidDimension || isValidMatrix)) return sortingColumn.id;

    return finalDimension?.includes('DATE') ? 'DATE' : '';
  }, [dimensionValue, allMatrixData, groupByValue, sortingColumn.id, finalDimension]);

  //FormData for api
  const reportFormData = useMemo(() => {
    const fd = new FormData();

    fd.append('user_id', localStorage.getItem('id'));
    fd.append('user_token', localStorage.getItem('token'));
    fd.append('sorting_order', sortingColumn.desc ? 'DESCENDING' : 'ASCENDING');
    if (sortingColumnValue) fd.append('sorting_column', sortingColumnValue);
    if (selectedGroup) fd.append('gg_id', selectedGroup);

    if (finalCountry) fd.append('selected_country', finalCountry);
    if (finalFormat) fd.append('selected_ad_format', finalFormat);
    if (finalPlatform) fd.append('selected_app_platform', finalPlatform);
    if (finalUnit) fd.append('selected_ad_units', finalUnit);

    if (dateRange?.length > 0) {
      fd.append('analytics_date_range', `${selectedStartDate}-${selectedEndDate}`);
    }
    if (finalDimension?.length > 0) {
      fd.append('selected_dimension', finalDimension);
    }
    if (finalApp) {
      fd.append('selected_apps', finalApp);
    } else if (appId && !accountChecked) {
      fd.append('selected_apps', appId);
    }
    if (finalSelectedAccount) fd.append('admob_auto_id', finalSelectedAccount);
    if (finalGroup) fd.append('groupBy', finalGroup);
    if (isUnitSwitch === true) fd.append('ad_unit_comparison', isUnitSwitch);

    return fd;
  }, [
    selectedGroup,
    finalCountry,
    finalFormat,
    finalPlatform,
    finalUnit,
    order,
    sortingColumnValue,
    dateRange,
    selectedStartDate,
    selectedEndDate,
    finalDimension,
    finalApp,
    appId,
    accountChecked,
    finalSelectedAccount,
    finalGroup,
    isUnitSwitch,
    sortingColumn,
  ]);

  //Prev Data add
  const format = 'DD/MM/YYYY';
  const rangeDiff =
    moment(selectedEndDate, format).diff(moment(selectedStartDate, format), 'days') + 1;

  //consolidateData
  function consolidateData(data) {
    const mergedData = {};

    data.forEach((entry) => {
      const key = `${entry.au_display_name}_${entry?.au_id}`;
      if (!mergedData[key]) {
        mergedData[key] = {
          ...entry,
          estimated_earnings: parseFloat(entry.estimated_earnings.replace('$', '')),
          ad_requests: parseInt(entry.ad_requests.replace(/,/g, ''), 10),
          matched_requests: parseInt(entry.matched_requests.replace(/,/g, ''), 10),
          impressions: parseInt(entry.impressions.replace(/,/g, ''), 10),
          clicks: parseInt(entry.clicks.replace(/,/g, ''), 10),
          match_rate: parseFloat(entry.match_rate.replace('%', '')),
          show_rate: parseFloat(entry.show_rate.replace('%', '')),
          impression_ctr: parseFloat(entry.impression_ctr.replace('%', '')),
          observed_ecpm: parseFloat(entry.observed_ecpm.replace('$', '')),
          count: 1,
        };
      } else {
        const existing = mergedData[key];
        // Aggregate numeric values
        existing.estimated_earnings += parseFloat(entry.estimated_earnings.replace('$', ''));
        existing.ad_requests += parseInt(entry.ad_requests.replace(/,/g, ''), 10);
        existing.matched_requests += parseInt(entry.matched_requests.replace(/,/g, ''), 10);
        existing.impressions += parseInt(entry.impressions.replace(/,/g, ''), 10);
        existing.clicks += parseInt(entry.clicks.replace(/,/g, ''), 10);
        existing.match_rate += parseFloat(entry.match_rate.replace('%', ''));
        existing.show_rate += parseFloat(entry.show_rate.replace('%', ''));
        existing.impression_ctr += parseFloat(entry.impression_ctr.replace('%', ''));
        existing.observed_ecpm += parseFloat(entry.observed_ecpm.replace('$', ''));

        existing.count += 1;
      }
    });

    // Compute averages and return consolidated data
    return Object.values(mergedData).map((entry) => {
      const { estimated_earnings, ad_requests, matched_requests, impressions, clicks } = entry;

      return {
        ...entry,
        au_display_name: entry.au_display_name,
        estimated_earnings: `$${estimated_earnings.toFixed(2)}`,
        ad_requests: ad_requests.toLocaleString(),
        matched_requests: matched_requests.toLocaleString(),
        impressions: impressions.toLocaleString(),
        clicks: clicks.toLocaleString(),
        match_rate: `${((matched_requests / ad_requests) * 100).toFixed(2)}%`,
        show_rate: `${((impressions / matched_requests) * 100).toFixed(2)}%`,
        impression_ctr: `${((clicks / impressions) * 100).toFixed(2)}%`,
        observed_ecpm: `$${((estimated_earnings / impressions) * 1000).toFixed(2)}`,
      };
    });
  }

  // const isAccountReady = finalSelectedAccount !== undefined;
  // const isQueryEnabled = isAccountReady && !!dateRange && isFilterDataLoaded;

  const isAccountReady = finalSelectedAccount !== undefined && finalSelectedAccount !== '' && finalSelectedAccount !== null;
const isQueryEnabled = isAccountReady && !!dateRange && isFilterDataLoaded;

  useEffect(() => {
  if (isQueryEnabled && !reportResponse) {
    setMainLoaderVisible(true);
  }
}, [isQueryEnabled]);

  const {
    data: reportResponse,
    isSuccess: isReportSuccess,
    isPending,
    isPlaceholderData,
    isFetching,
  } = useQueryFetch(
    [
      'report-table',
      finalApp,
      finalCountry,
      finalFormat,
      finalPlatform,
      finalVersion,
      finalUnit,
      finalDimension,
      // dimensionValue,
      groupByValue,
      isUnitSwitch,
      finalSelectedAccount,
      selectedStartDate,
      selectedEndDate,
      selectedGroup,
      sortingColumn,
    ],
    'analytics-list',
    reportFormData,
    {
      staleTime: 10 * 1000,
      refetchOnMount: 'ifStale',
      enabled: isQueryEnabled,
      placeholderData: (prev) => prev,
    }
  );

  useEffect(() => {
    if (!isReportSuccess || !reportResponse) return;
    setIsReportLoaderVisible(false);
    const currentData = reportResponse?.aaData;
    let prevData = reportResponse?.previous_aaData;

    currentData?.forEach((mainItem) => {
      const currentDate = mainItem.report_date;
      const admob_app_id = mainItem.app_admob_app_id;
      const au_id = mainItem.au_id;

      let prevDate;
      const prevStartDate = moment(selectedStartDate, format).subtract(rangeDiff, 'days');
      const prevEndDate = moment(selectedEndDate, format).subtract(rangeDiff, 'days');

      // if group by select
      if (finalGroupValue?.join('') == 'MONTH') {
        const current = prevStartDate.clone();
        const prevMonths = new Set();
        while (current.isSameOrBefore(prevEndDate)) {
          prevMonths.add(current.format('YYYYMM'));
          current.add(1, 'day');
        }
        prevDate = Array.from(prevMonths).join(',');

        if (Array.from(prevMonths)?.length > 1) {
          prevData = consolidateData(prevData);
        }
      } else if (finalGroupValue?.join('') == 'QUARTER') {
        const current = prevStartDate.clone();

        const prevQuarters = new Set();
        while (current.isSameOrBefore(prevEndDate)) {
          const quarter = Math.ceil((current.month() + 1) / 3);
          prevQuarters.add(`0${quarter}`);
          current.add(1, 'day');
        }
        prevDate = Array.from(prevQuarters).join(',');
        if (Array.from(prevQuarters)?.length > 1) {
          prevData = consolidateData(prevData);
        }
      } else {
        prevDate = moment(currentDate, 'YYYY-MM-DD').subtract(rangeDiff, 'days').format(format);
      }

      const matchedPrevItem = prevData.find((prevItem) => {
        if (finalGroupValue?.join('') == 'MONTH') {
          const prevMonth = moment(prevItem.report_date).format('YYYYMM');
          return (
            prevDate.includes(prevMonth) &&
            prevItem.app_admob_app_id == admob_app_id &&
            prevItem.au_id == au_id
          );
        }
        if (finalGroupValue?.join('') == 'QUARTER') {
          return (
            prevDate.includes(prevItem.report_date) &&
            prevItem.app_admob_app_id == admob_app_id &&
            prevItem.au_id == au_id
          );
        }
        return (
          moment(prevItem.report_date).format('DD/MM/YYYY') == prevDate &&
          prevItem.app_admob_app_id == admob_app_id &&
          prevItem.au_id == au_id
        );
      });

      if (matchedPrevItem) {
        const updatedPrevItem = Object.keys(matchedPrevItem).reduce((acc, key) => {
          acc[`prev_${key}`] = matchedPrevItem[key];
          return acc;
        }, {});
        Object.assign(mainItem, updatedPrevItem);
      }
    });

    const finalRecord = {
      aaData: currentData,
      iTotalRecords: reportResponse?.iTotalRecords,
      iTotalDisplayRecords: reportResponse?.iTotalDisplayRecords,
      status_code: reportResponse?.status_code,
      total_records_data: reportResponse?.total_records_data,
    };
    setTableNewData(finalRecord);
    let Data = currentData;
    if (reportResponse?.status_code === 1) {
      setToggleResize(true);

      setDisabled(false);
      const totalRecords = reportResponse?.total_records_data;
      if (totalRecords) {
        for (const item of dimensionValue) {
          if (item?.dimension_checked === true) {
            const firstDimensionKey = item?.key;
            const firstDimensionValue = 'Total';
            totalRecords[firstDimensionKey] = firstDimensionValue;
            break;
          }
        }
      }

      function organizeVersionsByApp(data) {
        const appVersionsMap = new Map();
        let autoId = 1;
        for (const item of data) {
          if (
            item?.hasOwnProperty('app_display_name') &&
            item?.hasOwnProperty('app_version') &&
            item?.app_version
          ) {
            const { app_display_name, app_version, app_platform } = item;
            const displayNameWithPlatform = `${app_display_name} (${app_platform})`;
            if (!appVersionsMap.has(displayNameWithPlatform)) {
              appVersionsMap.set(displayNameWithPlatform, [
                {
                  id: autoId++,
                  name: app_version,
                  item_checked: false,
                  app_display_name,
                  app_platform,
                },
              ]);
            } else {
              const versions = appVersionsMap.get(displayNameWithPlatform);
              const existingVersion = versions.find((version) => version.name === app_version);
              if (!existingVersion) {
                versions.push({
                  id: autoId++,
                  name: app_version,
                  item_checked: false,
                  app_display_name,
                  app_platform,
                });
              }
            }
          }
        }

        const organizedVersions = [];
        for (const [displayNameWithPlatform, versions] of appVersionsMap) {
          const [app_display_name, app_platform] = displayNameWithPlatform.split(' (');
          organizedVersions.push({
            app_display_name,
            app_platform: app_platform.slice(0, -1),
            versions,
          });
        }

        return organizedVersions;
      }
      if (finalDimension?.includes('COUNTRY')) {
        let sortedCountryFilter;
        const countryOrderMap = new Map();
        if (columnName?.includes('ESTIMATED_EARNINGS') && order?.includes('DESCENDING')) {
          Data?.forEach((item, index) => {
            if (!countryOrderMap.has(item.country_name)) {
              countryOrderMap.set(item.country_name, index);
            }
          });
          // Step 2: Sort filterArray based on the order of country names in dataArray
          sortedCountryFilter = filterUtilsPopupData?.all_countries?.sort((a, b) => {
            return (
              (countryOrderMap.get(a.name) ?? Infinity) - (countryOrderMap.get(b.name) ?? Infinity)
            );
          });
        } else {
          Data?.forEach((item, index) => {
            if (!countryOrderMap.has(item.country_name)) {
              countryOrderMap.set(item.country_name, index);
            }
          });
          // Step 2: Sort filterArray based on the order of country names in dataArray
          sortedCountryFilter = filterUtilsPopupData?.all_countries?.sort((a, b) => {
            return (
              (countryOrderMap.get(a.name) ?? Infinity) - (countryOrderMap.get(b.name) ?? Infinity)
            );
          });
        }
        setSortingCountryWise(sortedCountryFilter);
      }

      const organizedData = organizeVersionsByApp(Data);
      setAppVersion(organizedData);
      setSummaryData(totalRecords);
      setTotalRecordsData(reportResponse?.total_records_data);
      setPrevTotalRecordsData(reportResponse?.previous_total_records_data);
      setTotalPages(reportResponse.iTotalDisplayRecords / pageLength);
      setTimeout(() => {
        setMainLoaderVisible(false);
      }, 300);
    } else {
      setAppVersion([]);
      setIsReportLoaderVisible(false);
      setMainLoaderVisible(false);
      setDisabled(false);
      setToggleResize(true);
    }
  }, [isReportSuccess, reportResponse]);

  const [updateTableNewData, setUpdatedTableNewData] = useState([]);

  let adVersionBool = false;

  let adUnitBool = false;
  let dateBool = false;
  let appBool = false;
  let adUnitValue = false;

  // ad unit filter starts
  useEffect(() => {
    if (filterPopupData?.all_app_list?.length > 0 && tableNewData?.aaData?.length > 0) {
      const updatedTableNewData = tableNewData.aaData?.map((tableItem) => {
        const matchingPopupItem = filterPopupData?.all_app_list?.find(
          (popupItem) => popupItem?.app_admob_app_id === tableItem?.app_admob_app_id
        );
        if (matchingPopupItem) {
          return {
            ...tableItem,
            app_icon: matchingPopupItem?.app_icon !== undefined ? matchingPopupItem?.app_icon : '',
            app_platform: matchingPopupItem?.app_platform,
            app_auto_id: matchingPopupItem?.app_auto_id,
            app_console_name: matchingPopupItem?.app_console_name,
            app_store_id:
              matchingPopupItem?.app_store_id !== undefined ? matchingPopupItem?.app_store_id : '',
          };
        }
        return tableItem;
      });

      //data filtering for user for adunit
      const userRole = localStorage?.getItem('role');
      dimensionValue?.forEach((dimension) => {
        if (dimension.id === 'AD_UNIT' && dimension.dimension_checked === true) {
          adUnitBool = true;
        }
        if (dimension.id === 'DATE' && dimension.dimension_checked === true) {
          dateBool = true;
        }
        if (dimension.id === 'APP' && dimension.dimension_checked === true) {
          appBool = true;
        }
        if (dimension.id === 'APP_VERSION_NAME' && dimension.dimension_checked === true) {
          adVersionBool = true;
        }
        if (dimension.id === 'AD_UNIT' && dimension.dimension_checked === true) {
          adUnitValue = true;
        }
      });
      function removeIndianCommas(numberString) {
        return numberString?.replace(/\,/g, '');
      }
      function addDollars(value1, value2) {
        const num1 = parseFloat(removeIndianCommas(value1?.replace('$', '')));
        const num2 = parseFloat(removeIndianCommas(value2?.replace('$', '')));
        return '$' + (num1 + num2).toFixed(2);
      }
      let filterByadUnitData = [];

      if (userRole !== '1') {
        const map = new Map();
        updatedTableNewData.forEach((obj) => {
          let key;
          dimensionValue.forEach((dimension) => {
            if (dimension.dimension_checked) {
              key += obj[dimension.key];
            }
          });
          if (!map.has(key)) {
            map.set(key, {
              ...obj,
              total_ad_requests: parseInt(obj.ad_requests.replace(',', '')),
              total_estimated_earnings: parseFloat(obj.estimated_earnings.replace('$', '')),
              total_observed_ecpm: parseFloat(obj.observed_ecpm.replace('$', '')),
              total_matched_requests: parseInt(obj.matched_requests.replace(',', '')),
              total_impressions: parseInt(obj.impressions.replace(',', '')),
              total_clicks: parseInt(obj.clicks.replace(',', '')),
              total_match_rate: parseFloat(obj.match_rate),
              total_show_rate: parseFloat(obj.show_rate),
              //total_impression_ctr: parseInt(obj.impression_ctr),
              entryCount: 1,
            });
          } else {
            // Summing up ad_requests, estimated_earnings, and calculating total match_rate for duplicate entries
            const entry = map.get(key);
            const initial_ad_requests =
              parseInt(entry.ad_requests ? entry.ad_requests.replace(/\,/g, '') : 0) +
              parseInt(obj.ad_requests ? obj.ad_requests.replace(/\,/g, '') : 0);

            entry.ad_requests = initial_ad_requests.toLocaleString('en-IN');

            entry.estimated_earnings = addDollars(
              entry.estimated_earnings ? entry.estimated_earnings : 0,
              obj.estimated_earnings ? obj.estimated_earnings : 0
            );
            entry.total_observed_ecpm += parseFloat(obj.observed_ecpm ? obj.observed_ecpm : 0);
            entry.total_matched_requests += parseInt(
              obj.matched_requests ? obj.matched_requests.replace(/\,/g, '') : 0
            );
            entry.total_impressions += parseInt(
              obj.impressions ? obj.impressions.replace(/\,/g, '') : 0
            );
            entry.total_clicks += parseInt(obj.clicks ? obj.clicks.replace(/\,/g, '') : 0);
            entry.total_match_rate += parseFloat(obj.match_rate ? obj.match_rate : 0);
            entry.total_show_rate += parseFloat(obj.show_rate ? obj.show_rate : 0);

            entry.entryCount++;
            entry.match_rate = (entry.total_match_rate / entry.entryCount).toFixed(2) + '%';
            entry.show_rate = (entry.total_show_rate / entry.entryCount).toFixed(2) + '%';
            // entry.impression_ctr =
            //   (entry.total_impression_ctr / entry.entryCount).toFixed(2) + '%';
          }
        });
        map.forEach((value) => {
          value.additional_key = 'additional_value';
          value.clicks = value.total_clicks.toLocaleString('en-IN');
          value.impressions = value.total_impressions.toLocaleString('en-IN');
          value.ad_requests = value.ad_requests.toLocaleString('en-IN');
          value.matched_requests = value?.total_matched_requests.toLocaleString('en-IN');

          let finalObserver_ecpm = 0;
          if (
            value.estimated_earnings.replace('$', '') == 0 ||
            value.estimated_earnings.replace('$', '') == 0.0 ||
            value.estimated_earnings == null ||
            value.estimated_earnings == undefined ||
            value.total_impressions == 0 ||
            value.total_impressions == null ||
            value.total_impressions == undefined
          ) {
            finalObserver_ecpm = '$0';
          } else {
            finalObserver_ecpm =
              '$' +
              (
                (removeIndianCommas(value.estimated_earnings.replace('$', '')) /
                  value.total_impressions) *
                1000
              ).toFixed(2);
          }

          finalObserver_ecpm == '$0'
            ? (value.observed_ecpm = '$0')
            : (value.observed_ecpm = finalObserver_ecpm);

          let finalCTR = 0;
          if (
            value.total_clicks == 0 ||
            value.total_clicks == null ||
            value.total_clicks == undefined ||
            value.total_impressions == 0 ||
            value.total_impressions == null ||
            value.total_impressions == undefined
          ) {
            finalCTR = '0%';
          } else {
            finalCTR = ((value.total_clicks / value.total_impressions) * 100).toFixed(2) + '%';
          }

          finalCTR == '0.00%' ? (value.impression_ctr = '0%') : (value.impression_ctr = finalCTR);

          filterByadUnitData.push(value);
        });
        //adversion filtering of adunit filter data
        if (finalVersion?.length > 0 && adVersionBool) {
          const filteredData = filterByadUnitData.filter((item) =>
            finalVersion?.some(
              (versionItem) =>
                versionItem.app_display_name === item.app_display_name &&
                versionItem.name === item.app_version
            )
          );
          setUpdatedTableNewData(filteredData);
        } else {
          if (appVersionData?.length > 0) {
            setappVersionData([]);
            setallAppVersionData(
              allAppVersionData?.forEach((item) => {
                item?.versions?.forEach((version) => {
                  version.item_checked = false;
                });
              })
            );
            setfilteredAppVersionData(
              filteredAppVersionData?.forEach((item) => {
                item?.versions?.forEach((version) => {
                  version.item_checked = false;
                });
              })
            );
            setcheckedAppVersion(null);
          }

          setUpdatedTableNewData(filterByadUnitData);
        }
      } else if (unitValue?.length > 0) {
        // ad unit condtion
        const map = new Map();
        updatedTableNewData.forEach((obj) => {
          let key;
          dimensionValue.forEach((dimension) => {
            if (dimension.dimension_checked) {
              key += obj[dimension.key];
            }
          });
          if (!map.has(key)) {
            map.set(key, {
              ...obj,
              total_ad_requests: parseInt(obj.ad_requests.replace(/\,/g, '')),
              total_estimated_earnings: parseFloat(obj.estimated_earnings.replace('$', '')),
              total_observed_ecpm: parseFloat(obj.observed_ecpm.replace('$', '')),
              total_matched_requests: parseInt(obj.matched_requests.replace(/\,/g, '')),
              total_impressions: parseInt(obj.impressions.replace(/\,/g, '')),
              total_clicks: parseInt(obj.clicks.replace(/\,/g, '')),
              total_match_rate: parseFloat(obj.match_rate),
              total_show_rate: parseFloat(obj.show_rate),
              //total_impression_ctr: parseInt(obj.impression_ctr),
              entryCount: 1,
            });
          } else {
            // Summing up ad_requests, estimated_earnings, and calculating total match_rate for duplicate entries
            const entry = map.get(key);
            const initial_ad_requests =
              parseInt(entry.ad_requests ? entry.ad_requests.replace(/\,/g, '') : 0) +
              parseInt(obj.ad_requests ? obj.ad_requests.replace(/\,/g, '') : 0);

            entry.ad_requests = initial_ad_requests.toLocaleString('en-IN');

            entry.estimated_earnings = addDollars(
              entry.estimated_earnings ? entry.estimated_earnings : 0,
              obj.estimated_earnings ? obj.estimated_earnings : 0
            );
            entry.total_observed_ecpm += parseFloat(obj.observed_ecpm ? obj.observed_ecpm : 0);
            entry.total_matched_requests += parseInt(
              obj.matched_requests ? obj.matched_requests.replace(/\,/g, '') : 0
            );
            entry.total_impressions += parseInt(
              obj.impressions ? obj.impressions.replace(/\,/g, '') : 0
            );
            entry.total_clicks += parseInt(obj.clicks ? obj.clicks.replace(/\,/g, '') : 0);
            entry.total_match_rate += parseFloat(obj.match_rate ? obj.match_rate : 0);
            entry.total_show_rate += parseFloat(obj.show_rate ? obj.show_rate : 0);

            entry.entryCount++;
            entry.match_rate = (entry.total_match_rate / entry.entryCount).toFixed(2) + '%';
            entry.show_rate = (entry.total_show_rate / entry.entryCount).toFixed(2) + '%';
            // entry.impression_ctr =
            //   (entry.total_impression_ctr / entry.entryCount).toFixed(2) + '%';
          }
        });
        map.forEach((value) => {
          value.additional_key = 'additional_value';
          value.clicks = value.total_clicks.toLocaleString('en-IN');
          value.impressions = value.total_impressions.toLocaleString('en-IN');
          value.ad_requests = value.ad_requests.toLocaleString('en-IN');
          value.matched_requests = value?.total_matched_requests.toLocaleString('en-IN');

          let finalObserver_ecpm = 0;
          if (
            value.estimated_earnings.replace('$', '') == 0 ||
            value.estimated_earnings.replace('$', '') == 0.0 ||
            value.estimated_earnings == null ||
            value.estimated_earnings == undefined ||
            value.total_impressions == 0 ||
            value.total_impressions == null ||
            value.total_impressions == undefined
          ) {
            finalObserver_ecpm = '$0';
          } else {
            finalObserver_ecpm =
              '$' +
              (
                (removeIndianCommas(value.estimated_earnings.replace('$', '')) /
                  value.total_impressions) *
                1000
              ).toFixed(2);
          }

          finalObserver_ecpm == '$0'
            ? (value.observed_ecpm = '$0')
            : (value.observed_ecpm = finalObserver_ecpm);

          let finalCTR = 0;
          if (
            value.total_clicks == 0 ||
            value.total_clicks == null ||
            value.total_clicks == undefined ||
            value.total_impressions == 0 ||
            value.total_impressions == null ||
            value.total_impressions == undefined
          ) {
            finalCTR = '0%';
          } else {
            finalCTR = ((value.total_clicks / value.total_impressions) * 100).toFixed(2) + '%';
          }

          finalCTR == '0.00%' ? (value.impression_ctr = '0%') : (value.impression_ctr = finalCTR);

          filterByadUnitData.push(value);
        });
        if (finalVersion?.length > 0 && adVersionBool) {
          const filteredData = filterByadUnitData.filter((item) =>
            finalVersion?.some(
              (versionItem) =>
                versionItem.app_display_name === item.app_display_name &&
                versionItem.name === item.app_version
            )
          );
          setUpdatedTableNewData(filteredData);
        } else {
          if (appVersionData?.length > 0) {
            setappVersionData([]);
            setallAppVersionData(
              allAppVersionData?.forEach((item) => {
                item?.versions?.forEach((version) => {
                  version.item_checked = false;
                });
              })
            );
            setfilteredAppVersionData(
              filteredAppVersionData?.forEach((item) => {
                item?.versions?.forEach((version) => {
                  version.item_checked = false;
                });
              })
            );
            setcheckedAppVersion(null);
          }

          setUpdatedTableNewData(filterByadUnitData);
        }
      } else {
        //filter for appversion
        if (finalVersion?.length > 0 && adVersionBool) {
          const filteredData = updatedTableNewData?.filter((item) =>
            finalVersion?.some(
              (versionItem) =>
                versionItem.app_display_name === item.app_display_name &&
                versionItem.name === item.app_version
            )
          );

          const totalsMap = new Map([
            ['total_estimated_earnings', 0],
            ['total_observed_ecpm', 0],
            ['total_ad_requests', 0],
            ['total_match_rate', 0],
            ['total_matched_requests', 0],
            ['total_show_rate', 0],
            ['total_impressions', 0],
            ['total_impression_ctr', 0],
            ['total_clicks', 0],
            ['count', 0],
          ]);
          filteredData.forEach((item) => {
            totalsMap.set(
              'total_estimated_earnings',
              totalsMap.get('total_estimated_earnings') +
                parseFloat(item.estimated_earnings.replace(/[$,]/g, ''))
            );
            totalsMap.set(
              'total_observed_ecpm',
              totalsMap.get('total_observed_ecpm') +
                parseFloat(item.observed_ecpm.replace(/[$,]/g, ''))
            );
            totalsMap.set(
              'total_ad_requests',
              totalsMap.get('total_ad_requests') + parseInt(item.ad_requests.replace(/[,]/g, ''))
            );
            totalsMap.set(
              'total_match_rate',
              totalsMap.get('total_match_rate') + parseFloat(item.match_rate.replace(/[%]/g, ''))
            );
            totalsMap.set(
              'total_matched_requests',
              totalsMap.get('total_matched_requests') +
                parseInt(item.matched_requests.replace(/[,]/g, ''))
            );
            totalsMap.set(
              'total_show_rate',
              totalsMap.get('total_show_rate') +
                (item.show_rate.length > 0 ? parseFloat(item.show_rate.replace(/[%]/g, '')) : 0)
            );
            totalsMap.set(
              'total_impressions',
              totalsMap.get('total_impressions') + parseInt(item.impressions.replace(/[,]/g, ''))
            );
            if (item.impressions !== '0' && item.impression_ctr !== '-') {
              totalsMap.set(
                'total_impression_ctr',
                totalsMap.get('total_impression_ctr') +
                  parseFloat(item.impression_ctr.replace(/[%]/g, ''))
              );
              totalsMap.set('impression_ctr_count', totalsMap.get('impression_ctr_count') + 1);
            }
            totalsMap.set(
              'total_clicks',
              totalsMap.get('total_clicks') + parseInt(item.clicks.replace(/[,]/g, ''))
            );
            totalsMap.set('count', totalsMap.get('count') + 1);
          });
          const totalResults = {
            total_estimated_earnings: `$${totalsMap.get('total_estimated_earnings').toFixed(2)}`,
            total_observed_ecpm: `$${totalsMap.get('total_observed_ecpm').toFixed(2)}`,
            total_ad_requests: totalsMap.get('total_ad_requests').toLocaleString(),
            total_match_rate: `${(
              totalsMap.get('total_match_rate') / totalsMap.get('count')
            ).toFixed(2)}%`,
            total_matched_requests: totalsMap.get('total_matched_requests').toLocaleString(),
            total_show_rate: `${(totalsMap.get('total_show_rate') / totalsMap.get('count')).toFixed(2)}%`,
            total_impressions: totalsMap.get('total_impressions').toLocaleString(),
            total_impression_ctr:
              totalsMap.get('total_impressions') > 0
                ? `${(
                    (totalsMap.get('total_clicks') / totalsMap.get('total_impressions')) *
                    100
                  ).toFixed(2)}%`
                : '0.00%',
            total_clicks: totalsMap.get('total_clicks').toLocaleString(),
            admob_currency_code: 'USD',
            app_display_name: 'Total',
          };
          setUpdatedTableNewData(filteredData);
          setTotalRecordsData(totalResults);
        } else {
          if (appVersionData?.length > 0) {
            setappVersionData([]);
            setallAppVersionData(
              allAppVersionData?.forEach((item) => {
                item?.versions?.forEach((version) => {
                  version.item_checked = false;
                });
              })
            );
            setfilteredAppVersionData(
              filteredAppVersionData?.forEach((item) => {
                item?.versions?.forEach((version) => {
                  version.item_checked = false;
                });
              })
            );
            setcheckedAppVersion(null);
          }
          setUpdatedTableNewData(updatedTableNewData);
        }
      }
    } else {
      setUpdatedTableNewData([]);
    }
  }, [filterPopupData, tableNewData]);

  //Matrix report
  const finalMatrix = allMatrixData.map((data) => {
    return data.matrix_checked;
  });

  const getHighlightClass = (current, previous = '0', isPercentage = false) => {
    if (previous != null && previous != undefined) {
      const cleanPrevious = +previous.replace(/[$%,]/g, '');
      const cleanCurrent = +current.replace(/[$%,]/g, '');

      const diff = cleanCurrent - cleanPrevious;
      const threshold = isPercentage ? 0 : cleanPrevious * 0;
      if (Math.abs(diff) > threshold) {
        return diff > 0 ? 'highlight-positive' : 'highlight-negative';
      }
    } else {
      return '';
    }
  };

  function calculatePercentageChange(current, previous) {
    const currentValue = Number(current) || 0;
    const previousValue = Number(previous) || 0;
    if (previousValue === 0) {
      return currentValue > 0 ? '100%' : '0%';
    }
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return parseFloat(Math.abs(change.toFixed(2))) + '%';
  }

  function calculatePercentageChangeOfPercentage(current, previous) {
    const currentValue = Number(current) || 0;
    const previousValue = Number(previous) || 0;
    const change = currentValue - previousValue;
    return parseFloat(Math.abs(change.toFixed(2))) + '%';
  }

  // inside ReportContentBox.jsx
  const columns = useMemo(() => {
    // helper: dimension omit + pin_key coming from your dimensionValue
    const getDimMeta = (sortId) => {
      const d = (dimensionValue || []).find((x) => x?.id === sortId);
      return {
        omit: d ? !d?.dimension_checked : false, // SAME behavior as your old "Fixed Column" effect
        pin_key: d?.pin_key || false,
        data_column_id: d?.data_column_id,
      };
    };

    const getMatrixMeta = (matrixName, fallback = false) => {
      const m = (allMatrixData || []).find((x) => x?.name === matrixName);
      return {
        omit: m ? !m?.matrix_checked : fallback,
      };
    };

    const getHighlightedTotal = (current, previous, isPercentage = false) => {
      const highlightClass = getHighlightClass(
        String(current ?? ''),
        String(previous ?? ''),
        isPercentage
      );
      return (
        <>
          <span className="report_main_total">{indianNumberFormat(current)}</span>
          <span className={`report_prev_total ${highlightClass}`}>
            ({indianNumberFormat(previous)})
          </span>
        </>
      );
    };

    return [
      // ===== DIMENSIONS =====
      {
        id: 'APP',
        accessorKey: 'app_display_name',
        header: () => (
          <div className="report-title">
            <div className="report-header-dimension">Apps</div>
            {!!totalRecordsData && (
              <div className="report-total-dimension">
                {totalRecordsData?.total_app_display_name}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const app = row.original;
          return (
            <GeneralTinyAppBox
              uniqueIdentifier="report"
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
        size: 139,
        minSize: 139,
        meta: {
          sortValue: 'APP',
          headerClassName: 'sticky_cell',
          ...getDimMeta('APP'),
        },
      },

      {
        id: 'DATE',
        accessorKey: 'report_date',
        header: () => (
          <div className="report-title">
            <div className="report-header-dimension">Date</div>
            {!!totalRecordsData && (
              <div className="report-total-dimension">{totalRecordsData?.total_report_date}</div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;

          // your old groupBy effect for date formatting
          let customReportDate = r?.report_date;
          const groupFilterKey = (groupByValue || []).map((i) => i?.value).join('');

          if (groupFilterKey === 'WEEK') {
            const weekNum = moment(r?.report_date, 'YYYYMMDD').week().toString().padStart(2, '0');
            const year = moment(r?.report_date, 'YYYYMMDD').year();
            customReportDate = `${year}W${weekNum}`;
          } else if (groupFilterKey === 'MONTH') {
            const monthNum = (moment(r?.report_date, 'YYYYMM').month() + 1)
              .toString()
              .padStart(2, '0');
            const year = moment(r?.report_date, 'YYYYMM').year();
            customReportDate = `${year}M${monthNum}`;
          } else if (groupFilterKey === 'QUARTER') {
            const year = String(r?.report_date || '').slice(0, 4);
            const quarter = String(r?.report_date || '').slice(4);
            customReportDate = `${year}Q${quarter}`;
          }

          return (
            <div className="report_column_box">
              <div className="report_main_value">{customReportDate}</div>
              <div className="report_prev_value">{r?.prev_report_date}</div>
            </div>
          );
        },
        enableSorting: true,
        size: 120,
        minSize: 120,
        meta: {
          sortValue: 'DATE',
          customIndex: 'DATE',
          headerClassName: 'sticky_cell',
          ...getDimMeta('DATE'),
        },
      },

      {
        id: 'DAY',
        accessorKey: 'report_date',
        header: () => (
          <div className="report-title">
            <div className="report-header-dimension">Day</div>
            {!!totalRecordsData && (
              <div className="report-total-dimension">{totalRecordsData?.total_report_date}</div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const weekDay = moment(r?.report_date, 'YYYY-MM-DD').format('dddd');
          return (
            <div className="custom_day_column">{weekDay === 'Invalid date' ? '-' : weekDay}</div>
          );
        },
        enableSorting: true,
        size: 120,
        minSize: 120,
        meta: {
          sortValue: 'DAY',
          headerClassName: 'sticky_cell',
          ...getDimMeta('DAY'),
        },
      },

      {
        id: 'AD_UNIT',
        accessorKey: 'au_display_name',
        header: () => (
          <div className="report-title">
            <div className="report-header-dimension">Ad Unit</div>
            {!!totalRecordsData && (
              <div className="report-total-dimension">
                {totalRecordsData?.total_au_display_name}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="column-ellipsis" title={r?.au_display_name}>
              {r?.au_display_name}
            </div>
          );
        },
        enableSorting: true,
        size: 120,
        minSize: 120,
        meta: {
          sortValue: 'AD_UNIT',
          headerClassName: 'sticky_cell',
          isDynamic: true,
        },
      },

      {
        id: 'FORMAT',
        accessorKey: 'au_format',
        header: () => (
          <div className="report-title">
            <div className="report-header-dimension">Format</div>
            {!!totalRecordsData && (
              <div className="report-total-dimension">{totalRecordsData?.total_au_format}</div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="column-ellipsis" title={r?.au_format}>
              {r?.au_format?.replace('_', ' ').toUpperCase()}
            </div>
          );
        },
        enableSorting: true,
        size: 120,
        minSize: 120,
        meta: {
          sortValue: 'FORMAT',
          isDynamic: true,
          headerClassName: 'sticky_cell',
          ...getDimMeta('FORMAT'),
        },
      },

      {
        id: 'COUNTRY',
        accessorKey: 'country_name',
        header: () => (
          <div className="report-title">
            <div className="report-header-dimension">Country</div>
            {!!totalRecordsData && (
              <div className="report-total-dimension">{totalRecordsData?.total_country_name}</div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="column-ellipsis" title={r?.country_name}>
              {r?.country_name}
            </div>
          );
        },
        enableSorting: true,
        size: 120,
        minSize: 120,
        meta: {
          sortValue: 'COUNTRY',
          isDynamic: true,
          headerClassName: 'sticky_cell',
          ...getDimMeta('COUNTRY'),
        },
      },

      {
        id: 'APP_VERSION_NAME',
        accessorKey: 'app_version',
        header: () => (
          <div className="report-title">
            <div className="report-header-dimension">App Version</div>
            {!!totalRecordsData && (
              <div className="report-total-dimension">{totalRecordsData?.total_app_version}</div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="column-ellipsis" title={r?.app_version}>
              {r?.app_version}
            </div>
          );
        },
        enableSorting: true,
        size: 130,
        minSize: 130,
        meta: {
          sortValue: 'APP_VERSION_NAME',
          isDynamic: true,
          headerClassName: 'sticky_cell',
          ...getDimMeta('APP_VERSION_NAME'),
        },
      },

      // ===== METRICS (MATRIX) =====
      {
        id: 'ESTIMATED_EARNINGS',
        accessorKey: 'estimated_earnings',
        header: () => (
          <div className="report-title">
            <div className="report-header">Est. earnings</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_estimated_earnings,
                  prevTotalRecordsData?.total_estimated_earnings
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.estimated_earnings;
          const previous = r?.prev_estimated_earnings || '$0.00';
          const highlightClass = getHighlightClass(current, previous);

          const currentValue = Number(String(current || '').replace('$', ''));
          const previousValue = Number(String(previous || '').replace('$', ''));
          const percentageMove = calculatePercentageChange(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'ESTIMATED_EARNINGS',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('ESTIMATED_EARNINGS', false),
        },
      },

      {
        id: 'IMPRESSION_RPM', // NOTE: matches your old sortValue for eCPM
        accessorKey: 'observed_ecpm',
        header: () => (
          <div className="report-title">
            <div className="report-header">eCPM</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_observed_ecpm,
                  prevTotalRecordsData?.total_observed_ecpm
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.observed_ecpm || '$0.00';
          const previous = r?.prev_observed_ecpm || '$0.00';
          const highlightClass = getHighlightClass(current, previous);

          const currentValue = Number(String(current).replace('$', ''));
          const previousValue = Number(String(previous).replace('$', ''));
          const percentageMove = calculatePercentageChange(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'IMPRESSION_RPM',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('IMPRESSION_RPM', !finalMatrix?.[1]),
        },
      },

      {
        id: 'AD_REQUESTS',
        accessorKey: 'ad_requests',
        header: () => (
          <div className="report-title">
            <div className="report-header">Requests</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_ad_requests,
                  prevTotalRecordsData?.total_ad_requests
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.ad_requests || '0';
          const previous = r?.prev_ad_requests || '0';
          const highlightClass = getHighlightClass(current, previous);

          const currentValue = Number(String(current).replace(/,/g, ''));
          const previousValue = Number(String(previous).replace(/,/g, ''));
          const percentageMove = calculatePercentageChange(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'AD_REQUESTS',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('AD_REQUESTS', false),
        },
      },

      {
        id: 'MATCHED_REQUESTS',
        accessorKey: 'matched_requests',
        header: () => (
          <div className="report-title">
            <div className="report-header">Matched requests</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_matched_requests,
                  prevTotalRecordsData?.total_matched_requests
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.matched_requests || '0';
          const previous = r?.prev_matched_requests || '0';
          const highlightClass = getHighlightClass(current, previous);

          const currentValue = Number(String(current).replace(/,/g, ''));
          const previousValue = Number(String(previous).replace(/,/g, ''));
          const percentageMove = calculatePercentageChange(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 160,
        size: 160,
        meta: {
          sortValue: 'MATCHED_REQUESTS',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('MATCHED_REQUESTS', true),
        },
      },

      {
        id: 'MATCH_RATE',
        accessorKey: 'match_rate',
        header: () => (
          <div className="report-title">
            <div className="report-header">Match rate (%)</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_match_rate,
                  prevTotalRecordsData?.total_match_rate,
                  true
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.match_rate || '0.00%';
          const previous = r?.prev_match_rate || '0.00%';
          const highlightClass = getHighlightClass(current, previous, true);

          const currentValue = Number(String(current).replace('%', ''));
          const previousValue = Number(String(previous).replace('%', ''));
          const percentageMove = calculatePercentageChangeOfPercentage(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'MATCH_RATE',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('MATCH_RATE', false),
        },
      },

      {
        id: 'IMPRESSIONS',
        accessorKey: 'impressions',
        header: () => (
          <div className="report-title">
            <div className="report-header">Impressions</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_impressions,
                  prevTotalRecordsData?.total_impressions
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.impressions || '0';
          const previous = r?.prev_impressions || '0';
          const highlightClass = getHighlightClass(current, previous);

          const currentValue = Number(String(current).replace(/,/g, ''));
          const previousValue = Number(String(previous).replace(/,/g, ''));
          const percentageMove = calculatePercentageChange(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'IMPRESSIONS',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('IMPRESSIONS', false),
        },
      },

      {
        id: 'ACTIVE_USER',
        accessorKey: 'active_users',
        header: () => (
          <div className="report-title">
            <div className="report-header">Active users</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_active_users,
                  prevTotalRecordsData?.total_active_users
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.active_users || '0';
          const previous = r?.prev_active_users || '0';
          const highlightClass = getHighlightClass(current, previous);

          const currentValue = Number(String(current).replace(/,/g, ''));
          const previousValue = Number(String(previous).replace(/,/g, ''));
          const percentageMove = calculatePercentageChange(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'ACTIVE_USER',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('ACTIVE_USER', false),
        },
      },

      {
        id: 'ARPU',
        accessorKey: 'arpu',
        header: () => (
          <div className="report-title">
            <div className="report-header">ARPU</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_arpu,
                  prevTotalRecordsData?.total_arpu
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.arpu || '0';
          const previous = r?.prev_arpu || '0';
          const highlightClass = getHighlightClass(current, previous);

          const currentValue = Number(String(current).replace(/,/g, ''));
          const previousValue = Number(String(previous).replace(/,/g, ''));
          const percentageMove = calculatePercentageChange(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'ARPU',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('ARPU', false),
        },
      },

      {
        id: 'ARPDAU',
        accessorKey: 'arpdau',
        header: () => (
          <div className="report-title">
            <div className="report-header">ARPDAU</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_arpdau,
                  prevTotalRecordsData?.total_arpdau
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.arpdau || '0';
          const previous = r?.prev_arpdau || '0';
          const highlightClass = getHighlightClass(current, previous);

          const currentValue = Number(String(current).replace(/,/g, ''));
          const previousValue = Number(String(previous).replace(/,/g, ''));
          const percentageMove = calculatePercentageChange(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'ARPDAU',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('ARPDAU', false),
        },
      },

      {
        id: 'DAU_AV',
        accessorKey: 'dau_av',
        header: () => (
          <div className="report-title">
            <div className="report-header">DAU AV</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_dau_av,
                  prevTotalRecordsData?.total_dau_av
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.dau_av || '0';
          const previous = r?.prev_dau_av || '0';
          const highlightClass = getHighlightClass(current, previous);

          const currentValue = Number(String(current).replace(/,/g, ''));
          const previousValue = Number(String(previous).replace(/,/g, ''));
          const percentageMove = calculatePercentageChange(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'DAU_AV',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('DAU_AV', false),
        },
      },

      {
        id: 'AV_RATE',
        accessorKey: 'av_rate',
        header: () => (
          <div className="report-title">
            <div className="report-header">AV RATE</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_av_rate,
                  prevTotalRecordsData?.total_av_rate
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.av_rate || '0';
          const previous = r?.prev_av_rate || '0';
          const highlightClass = getHighlightClass(current, previous);

          const currentValue = Number(String(current).replace(/,/g, ''));
          const previousValue = Number(String(previous).replace(/,/g, ''));
          const percentageMove = calculatePercentageChange(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'AV_RATE',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('AV_RATE', false),
        },
      },

      {
        id: 'IMPR_PER_USER',
        accessorKey: 'impr_per_user',
        header: () => (
          <div className="report-title">
            <div className="report-header">Impression/User</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_impr_per_user,
                  prevTotalRecordsData?.total_impr_per_user
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.impr_per_user || '0';
          const previous = r?.prev_impr_per_user || '0';
          const highlightClass = getHighlightClass(current, previous);

          const currentValue = Number(String(current).replace(/,/g, ''));
          const previousValue = Number(String(previous).replace(/,/g, ''));
          const percentageMove = calculatePercentageChange(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'IMPR_PER_USER',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('IMPR_PER_USER', false),
        },
      },

      {
        id: 'SHOW_RATE',
        accessorKey: 'show_rate',
        header: () => (
          <div className="report-title">
            <div className="report-header">Show rate (%)</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_show_rate,
                  prevTotalRecordsData?.total_show_rate,
                  true
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.show_rate || '0.00%';
          const previous = r?.prev_show_rate || '0.00%';
          const highlightClass = getHighlightClass(current, previous, true);

          const currentValue = Number(String(current).replace('%', ''));
          const previousValue = Number(String(previous).replace('%', ''));
          const percentageMove = calculatePercentageChangeOfPercentage(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'SHOW_RATE',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('SHOW_RATE', false),
        },
      },

      {
        id: 'CLICKS',
        accessorKey: 'clicks',
        header: () => (
          <div className="report-title">
            <div className="report-header">Clicks</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_clicks,
                  prevTotalRecordsData?.total_clicks
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.clicks || '0';
          const previous = r?.prev_clicks || '0';
          const highlightClass = getHighlightClass(current, previous);

          const currentValue = Number(String(current).replace(/,/g, ''));
          const previousValue = Number(String(previous).replace(/,/g, ''));
          const percentageMove = calculatePercentageChange(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'CLICKS',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('CLICKS', false),
        },
      },

      {
        id: 'IMPRESSION_CTR',
        accessorKey: 'impression_ctr',
        header: () => (
          <div className="report-title">
            <div className="report-header">CTR (%)</div>
            {!!totalRecordsData && (
              <div className="report-total">
                {getHighlightedTotal(
                  totalRecordsData?.total_impression_ctr,
                  prevTotalRecordsData?.total_impression_ctr,
                  true
                )}
              </div>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const r = row.original;
          const current = r?.impression_ctr === '-' ? '0.00%' : r?.impression_ctr || '0.00%';
          const previous =
            r?.prev_impression_ctr === '-' ? '0.00%' : r?.prev_impression_ctr || '0.00%';

          const highlightClass = getHighlightClass(current, previous, true);
          const currentValue = Number(String(current).replace('%', ''));
          const previousValue = Number(String(previous).replace('%', ''));
          const percentageMove = calculatePercentageChangeOfPercentage(currentValue, previousValue);

          return (
            <MetricCell
              isUnitSwitch={isUnitSwitch}
              current={current}
              previous={previous}
              highlightClass={highlightClass}
              percentageMove={percentageMove}
            />
          );
        },
        enableSorting: true,
        minSize: 120,
        size: 120,
        meta: {
          sortValue: 'IMPRESSION_CTR',
          alignMent: 'right',
          isDynamic: true,
          ...getMatrixMeta('IMPRESSION_CTR', false),
        },
      },
    ];
  }, [
    dimensionValue,
    allMatrixData,
    totalRecordsData,
    prevTotalRecordsData,
    groupByValue,
    finalMatrix,
    getHighlightClass,
    calculatePercentageChange,
    calculatePercentageChangeOfPercentage,
    indianNumberFormat,
  ]);

  const columnById = useMemo(() => {
    const map = new Map();
    (columns || []).forEach((c) => map.set(c.id, c));
    return map;
  }, [columns]);

  const dimOrderSource = (sharedData?.columns?.length ? sharedData.columns : dimensionValue) || [];
  const matrixOrderSource =
    (sharedMatrixData?.columns?.length ? sharedMatrixData.columns : allMatrixData) || [];

  const orderedColumns = useMemo(() => {
    const orderedDims = dimOrderSource
      .filter((d) => d?.dimension_checked)
      .map((d) => columnById.get(d.id))
      .filter(Boolean);

    const orderedMatrix = matrixOrderSource
      .filter((m) => m?.matrix_checked)
      .map((m) => columnById.get(m.name))
      .filter(Boolean);

    // merge
    const merged = [...orderedDims, ...orderedMatrix];

    return merged.filter((c) => !c?.meta?.omit);
  }, [dimOrderSource, matrixOrderSource, columnById]);

  const stickyColumnIds = useMemo(() => {
    return (orderedColumns || []).filter((c) => c?.meta?.pin_key).map((c) => c.id);
  }, [orderedColumns]);

  //hide/show dimension
  const [isSwitch, setIsSwitch] = useState(true);
  const [isSwitchBox, setIsSwitchBox] = useState('');
  useEffect(() => {
    const changeValueString = localStorage?.getItem('isSwitchBoxlocal');
    if (changeValueString) {
      const changeValue = JSON?.parse(changeValueString);
      setIsSwitchBox(changeValue);
    } else {
      localStorage.setItem('isSwitchBoxlocal', true);
    }
  }, [reportResponse]);

  const handleChangeSwitch = () => {
    const switchBoxValuefromLocal = localStorage.getItem('isSwitchBoxlocal');
    if (switchBoxValuefromLocal === 'true') {
      const value = JSON?.parse(switchBoxValuefromLocal);
      setIsSwitchBox(!value);
      localStorage.setItem('isSwitchBoxlocal', !switchBoxValuefromLocal);
    } else {
      setIsSwitchBox(!isSwitchBox);
      localStorage.setItem('isSwitchBoxlocal', !isSwitchBox);
    }
  };

  //Ad unit show hide
  const handleUnitSwitch = () => {
    setIsReportLoaderVisible(true);
    setIsUnitSwitch(!isUnitSwitch);
    localStorage.setItem('unit_switch', JSON.stringify(!isUnitSwitch));
  };

  //csv
  const getReportCsvData = ({
    rows = [],
    summaryData = {},
    dimensionValue = [],
    allMatrixData = [],
  }) => {
    const keys = [];
    const dimensionKeys = (dimensionValue || []).filter((d) => d?.dimension_checked);
    const matrixKeys = allMatrixData || [];

    for (const d of dimensionKeys) {
      keys.push(d.key);
      if (d.key === 'app_display_name') keys.push('app_console_name', 'app_store_id');
    }
    for (const m of matrixKeys) keys.push(m.key);

    // filter rows and strip $ where needed (same as your code) :contentReference[oaicite:1]{index=1}
    const filteredRows = (rows || []).map((item) => {
      const out = {};
      keys.forEach((key) => {
        if (key === 'estimated_earnings' || key === 'observed_ecpm') {
          out[key] = item?.[key]?.replace?.('$', '') ?? item?.[key];
        } else {
          out[key] = item?.[key];
        }
      });
      return out;
    });

    // summary -> total row (same as your code idea) :contentReference[oaicite:2]{index=2}
    const updatedSummaryData = {};
    for (const key in summaryData) {
      if (Object.prototype.hasOwnProperty.call(summaryData, key)) {
        updatedSummaryData[key] = summaryData[key]?.replace?.('$', '') ?? summaryData[key];
      }
    }

    const totalCalObject = { ...updatedSummaryData };
    delete totalCalObject?.admob_currency_code;

    const totalRow = {};
    for (const key in totalCalObject) {
      const newKey = key?.replace?.('total_', '');
      totalRow[newKey] = totalCalObject[key];
    }

    // push total row + remove app_icon if present
    const merged = [...filteredRows, totalRow].map((row) => {
      const { app_icon, ...rest } = row || {};
      return rest;
    });

    // key mapping (same mapping as your code) :contentReference[oaicite:3]{index=3}
    const keyMapping = {
      app_display_name: 'Apps',
      app_console_name: 'Console Name',
      app_store_id: 'Package Name',
      report_date: 'Date',
      au_display_name: 'Ad Unit',
      au_format: 'Format',
      country_name: 'Country',
      app_version: 'App Version',
      estimated_earnings: 'Est. earnings (USD)',
      observed_ecpm: 'Observed eCPM (USD)',
      ad_requests: 'Requests',
      matched_requests: 'Matched requests',
      match_rate: 'Match rate (%)',
      impressions: 'Impressions',
      active_users: 'Active users',
      arpu: 'ARPU',
      arpdau: 'ARPDAU',
      dau_av: 'DAU_AV',
      av_rate: 'AV Rate',
      impr_per_user: 'Impression/User',
      show_rate: 'Show rate (%)',
      clicks: 'Clicks',
      impression_ctr: 'CTR (%)',
    };

    return merged.map((item) => {
      const out = {};
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          out[keyMapping[key] || key] = item[key];
        }
      }
      return out;
    });
  };

  const csvData = useMemo(() => {
    return getReportCsvData({
      rows: updateTableNewData,
      summaryData: SummaryData,
      dimensionValue,
      allMatrixData,
    });
  }, [updateTableNewData, SummaryData, dimensionValue, allMatrixData]);

  const renderComponent = (componentName) => {
    switch (componentName) {
      case 'AppPopup':
        return (
          <AppPopup
            disable={disable}
            filterPopupData={filterAppData}
            setPageNumber={setPageNumber}
            selectedAccountData={selectedAccountData}
            setIsReportLoaderVisible={setIsReportLoaderVisible}
            setCurrentUnitPage={setCurrentUnitPage}
            setDisabled={setDisabled}
            filteredAppData={filteredAppData}
            setFilteredAppData={setFilteredAppData}
            checkedApp={checkedApp}
            setCheckedApp={setCheckedApp}
            allAppData={allAppData}
            setAllAppData={setAllAppData}
          />
        );
      case 'AppVersion':
        return (
          <AppVersion
            AppVersion={appVersion}
            setPageNumber={setPageNumber}
            selectedAccountData={selectedAccountData}
            setIsReportLoaderVisible={setIsReportLoaderVisible}
            setCurrentUnitPage={setCurrentUnitPage}
            AppVersionbool={adVersionBool}
          />
        );
      case 'FormatPopup':
        return (
          <GeneralDataFilter
            uniqueIdentifier={'report_format'}
            filterName="Format"
            filterPopupData={all_ad_formats}
            finalSelectData={formatValue}
            setFinalSelectData={setFormatValue}
            fetchFlag={popupFlags}
            setFetchFlag={setPopupFlags}
          />
        );
      case 'AdUnitsPopup':
        return (
          <AdUnitsPopup
            setTableNewData={setTableNewData}
            filterPopupData={filterAdUnitData}
            setPageNumber={setPageNumber}
            selectedAccountData={selectedAccountData}
            setIsReportLoaderVisible={setIsReportLoaderVisible}
            setCurrentUnitPage={setCurrentUnitPage}
            disable={disable}
            setDisabled={setDisabled}
            filterData={filterData}
          />
        );
      case 'CountryPopup':
        return (
          <GeneralCountry
            uniqueIdentifier={'report'}
            countryValue={countryValue}
            setCountryValue={setCountryValue}
            fetchFlag={popupFlags}
            setFetchFlag={setPopupFlags}
          />
        );
      case 'PlatformPopup':
        return (
          <GeneralPlatform
            uniqueIdentifier={'report'}
            finalItem={platformValue}
            setFinalItem={setPlatformValue}
          />
        );
      case 'GroupByPopup':
        return <GroupByFilter setIsReportLoaderVisible={setIsReportLoaderVisible} />;
      default:
        return null;
    }
  };

  const baseFilterOrder = useMemo(() => {
    return appVersion?.length > 0
      ? [
          'AppPopup',
          'AppVersion',
          'FormatPopup',
          'AdUnitsPopup',
          'CountryPopup',
          'PlatformPopup',
          'GroupByPopup',
        ]
      : [
          'AppPopup',
          'FormatPopup',
          'AdUnitsPopup',
          'CountryPopup',
          'PlatformPopup',
          'GroupByPopup',
        ];
  }, [appVersion?.length]);

  const activeCounts = useMemo(
    () => ({
      AppPopup: appValue?.length || 0,
      AppVersion: appVersionData?.length || 0,
      FormatPopup: formatValue?.length || 0,
      AdUnitsPopup: unitValue?.length || 0,
      CountryPopup: countryValue?.length || 0,
      PlatformPopup: platformValue?.length || 0,
      GroupByPopup: groupByValue?.length || 0,
    }),
    [appValue, appVersionData, formatValue, unitValue, countryValue, platformValue, groupByValue]
  );

  const orderFilter = useReorderedFilterOrder({
    baseOrder: baseFilterOrder,
    activeCounts,
    selectedKey: selectedReportFilter,
    storageKey: 'reportState',
    persist: true,
  });
  const renderedComponents = useMemo(
    () => orderFilter.map((name) => renderComponent(name)).filter(Boolean),
    [orderFilter, renderComponent]
  );

  const { addClass } = useStickyOnScroll({ topSpace: 15 });

  // const showMainLoader = isPending && !isPlaceholderData;
  // const showOverlayLoader = isFetching && isPlaceholderData;

//   const showMainLoader = !isFilterDataLoaded || (isQueryEnabled && isPending && !isPlaceholderData) || (isQueryEnabled && !reportResponse && !isPlaceholderData);
// const showOverlayLoader = isFetching && isPlaceholderData;

const showMainLoader = mainLoaderVisible;
const showOverlayLoader = isFetching && !isPending;

  const handleSortingChange = (updater) => {
    setSortingColumn((prev) => {
      const nextArray = typeof updater === 'function' ? updater(prev ? [prev] : []) : updater;
      if (!nextArray || nextArray.length === 0) {
        return null;
      }
      const { id, desc } = nextArray[0];

      return { id, desc };
    });
  };

  return (
    <div className={`right-box-wrap`}>
      <div className="table-box-wrap main-box-wrapper pdglr24 report-table-box">
        <div className="userBoxWrap user-section-wrapper">
          <div className="popup-full-wrapper reports-popup-box active">
            <div
              className={`action-bar-container report-page-topbar ${addClass ? 'sticky_filter' : ''}`}
            >
              <div className="middle-section">
                <div className="filter-bar-wrap">
                  <div className={`${isFetching ? 'disabled-div' : ''} filter-box`}>
                    <GeneralDateRange
                      uniqueIdentifier={'main_report'}
                      selectedStartDate={selectedStartDate}
                      selectedEndDate={selectedEndDate}
                      setIsTableLoaderVisible={setIsReportLoaderVisible}
                      setMainDate={setDateRange}
                    />
                    <AccountSelectPopup
                      filterPopupData={filterAccountData}
                      filterActualData={filterPopupData}
                      selectedAccountData={selectedAccountData}
                      setSelectedAccountData={setSelectedAccountData}
                      setTableNewData={setTableNewData}
                      setPageNumber={setPageNumber}
                      setIsReportLoaderVisible={setIsReportLoaderVisible}
                      setCurrentUnitPage={setCurrentUnitPage}
                      setAccountChecked={setAccountChecked}
                      filteredAppData={filteredAppData}
                      setFilteredAppData={setFilteredAppData}
                      setCheckedApp={setCheckedApp}
                      allAppData={allAppData}
                      setAllAppData={setAllAppData}
                    />
                    {renderedComponents}
                  </div>
                </div>
              </div>
              <div className="more-button three-icon-button">
                <MdMoreVert className="material-icons" />
                <div className="more-box w-250">
                  <div className="border-box">
                    <CSVLink className="downloadbtn" filename="admob-report.csv" data={csvData}>
                      <span className="material-icons">
                        <FiDownload style={{ marginTop: '6px' }} />
                      </span>
                      Download CSV
                    </CSVLink>
                  </div>

                  <div
                    className="border-box"
                    style={{
                      display: 'flex',
                      padding: '6px 12px',
                    }}
                  >
                    <span
                      className="material-icons"
                      style={{
                        padding: '0px 10px',
                        fontSize: '20px',
                      }}
                    >
                      <MdOutlineEdit
                        style={{
                          fontSize: '24px',
                          color: 'grey',
                        }}
                      />
                    </span>

                    <div className="show-button">Dimension / Metrics</div>
                    <label
                      className="switch toggle-icon"
                      htmlFor="checkbox"
                      style={{ position: 'relative' }}
                    >
                      <input
                        type="checkbox"
                        id="checkbox"
                        value={!isSwitchBox}
                        onChange={handleChangeSwitch}
                        checked={isSwitchBox}
                      />
                      <div className="slider round"></div>
                    </label>
                  </div>

                  <div
                    className={`border-box unit_switch ${!isAdUnitClick ? 'switch_disabled' : ''}`}
                    style={{
                      display: 'flex',
                      padding: '6px 12px',
                    }}
                    title={!isAdUnitClick ? 'Select Ad Unit Dimension' : ''}
                  >
                    <span
                      className="material-icons"
                      style={{
                        padding: '0px 10px',
                        fontSize: '20px',
                      }}
                    >
                      <BiGitCompare
                        style={{
                          fontSize: '22px',
                          color: 'grey',
                        }}
                      />
                    </span>

                    <div className="show-button">Ad Unit Comparison</div>
                    <label
                      className={`switch toggle-icon`}
                      htmlFor="unit_checkbox"
                      style={{ position: 'relative' }}
                    >
                      <input
                        type="checkbox"
                        id="unit_checkbox"
                        value={isUnitSwitch}
                        onChange={handleUnitSwitch}
                        checked={isAdUnitClick && isUnitSwitch}
                        disabled={!isAdUnitClick}
                      />
                      <div className="slider round"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="popup-full-box form-box-wrap form-wizard">
              {isSwitch && (
                <div
                  className={`popup-box-wrapper ${
                    isSwitchBox ? 'show-dimension-Box' : ''
                  } report-table-popup-box ${sharedData?.length > 0 ? '' : 'emit-column-css'} `}
                >
                  <div className={`box-wrapper table-container `} style={{ zIndex: '8' }}>
                    {showOverlayLoader && (
                      <div className="shimmer-spinner overlay-spinner">
                        <Spinner animation="border" variant="secondary" />
                      </div>
                    )}
                    {showMainLoader ? (
                      <div className="shimmer-spinner">
                        <Spinner animation="border" variant="secondary" />
                      </div>
                    ) : (
                      <GeneralTanStackTable
                        data={updateTableNewData}
                        columns={orderedColumns}
                        stickyColumnIds={stickyColumnIds}
                        enableSorting
                        sorting={{
                          type: 'server',
                          state: sortingColumn ? [sortingColumn] : [],
                          onChange: handleSortingChange,
                        }}
                        enableResize={true}
                        enableVirtualization
                        rowHeight={36}
                        height={36 * 22}
                        defaultSortColumn={'report_date'}
                        className={`report-table-scroll ${
                          isAdUnitClick && isUnitSwitch ? 'custom_unit_select' : ''
                        }`}
                      />
                    )}
                  </div>
                  {isSwitchBox && (
                    <div className="matrix-box">
                      <DimensionBox
                        Data={updateTableNewData}
                        setPageNumber={setPageNumber}
                        setIsReportLoaderVisible={setIsReportLoaderVisible}
                        setCurrentUnitPage={setCurrentUnitPage}
                        isFetching={isFetching}
                        setIsUnitSwitch={setIsUnitSwitch}
                      />
                      <MatrixBox
                        setPageNumber={setPageNumber}
                        setIsReportLoaderVisible={setIsReportLoaderVisible}
                        setCurrentUnitPage={setCurrentUnitPage}
                        isFetching={isFetching}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ReportContentBox;
