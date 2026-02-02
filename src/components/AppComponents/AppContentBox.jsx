/** @format */

import { useQueryClient } from '@tanstack/react-query';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import DataTable from 'react-data-table-component';
import { ReactComponent as TableSortArrow } from '../../assets/images/arrow-dwon.svg';
import { DataContext } from '../../context/DataContext';
import { useGroupSettings } from '../../context/GroupSettingsContext';
import useAppsApi from '../../hooks/useAppsApi';
import useGeneratePagination from '../../hooks/useGeneratePagination';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { flushAllCachesExcept } from '../../lib/reactQueryUtils';
import AccountPageAccountPopup from '../AccountPageComponents/Popups/AccountPageAccountPopup';
import AppAccountPopup from '../AccountPageComponents/Popups/AppAccountPopup';
import CustomPaginationComponent from '../CustomPaginationComponent';
import CustomLoadingIndicator from '../DataTableComponents/CustomLoadingIndicator';
import CustomNoDataComponent from '../DataTableComponents/CustomNoDataComponent';
import AppInfoBox from '../GeneralComponents/AppInfoBox';

const AppContentBox = () => {
  const { setAddAppFlag, addAppFlag } = useContext(DataContext);
  const { selectedGroup } = useGroupSettings();
  const queryClient = useQueryClient();

  const [appPageNumber, setAppPageNumber] = useState(1);
  const [appPageLength] = useState(100);
  const [appTotalPages, setAppTotalPages] = useState('');
  const [appPaginationList, setAppPaginationList] = useState([]);
  const [appOrder, setAppOrder] = useState('');
  const [appColumnName, setAppColumnName] = useState('');
  const [selectedFilterOrder, setSelectedFilterOrder] = useState([]);
  const [filterAccountData, setFilterAccountData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [accountAdmob, setAccountAdmob] = useState(() => {
    const stored = sessionStorage.getItem('app_content_admob_filter');
    return stored ? JSON.parse(stored) : [];
  });
  const [accountNewApp, setAccountNewApp] = useState(() => {
    const stored = sessionStorage.getItem('app_content_app_filter');
    return stored ? JSON.parse(stored) : [];
  });

  const APPS_LIST_QUERY_KEY = useMemo(
    () => [
      'apps-list-table',
      appPageNumber,
      String(selectedGroup || ''),
      appOrder,
      appColumnName,
      accountAdmob.map((a) => a.admob_auto_id).join('|'),
      accountNewApp.map((a) => a.app_auto_id).join('|'),
    ],
    [appPageNumber, selectedGroup, appOrder, appColumnName, accountAdmob, accountNewApp]
  );

  const formData = useMemo(() => {
    const fd = new FormData();

    fd.append('user_id', localStorage.getItem('id'));
    fd.append('user_token', localStorage.getItem('token'));
    fd.append('start', appPageLength * (appPageNumber - 1));
    fd.append('length', appPageLength);

    if (selectedGroup?.length > 0) fd.append('gg_id', selectedGroup);
    fd.append('iSortCol_0', appColumnName);
    if (appOrder?.length > 0) {
      fd.append('sSortDir_0', appOrder);
    }

    if (accountAdmob?.length > 0) {
      fd.append('selected_admob_auto_id', accountAdmob.map((a) => a.admob_auto_id).join(','));
    }

    if (accountNewApp?.length > 0) {
      fd.append('selected_app_auto_id', accountNewApp.map((a) => a.app_auto_id).join(','));
    }

    return fd;
  }, [appPageNumber, appOrder, appColumnName, selectedGroup, accountAdmob, accountNewApp]);

  useEffect(() => {
    setAppPageNumber(1);
  }, [JSON.stringify(accountAdmob), JSON.stringify(accountNewApp)]);

  const customSort = (column, sortDirection) => {
    setAppColumnName(column.id - 2);
    setAppOrder(sortDirection.toUpperCase());
  };

  const {
    data: appList,
    isLoading,
    isFetching,
    isSuccess,
  } = useQueryFetch(APPS_LIST_QUERY_KEY, 'apps-list', formData, {
    staleTime: 1000 * 60 * 5,
    refetchOnMount: 'ifStale',
    placeholderData: (prev) => prev,
  });

  const filterAccData = useMemo(() => {
    const fd = new FormData();
    fd?.append('user_id', localStorage.getItem('id'));
    fd?.append('user_token', localStorage.getItem('token'));
    if (selectedGroup?.length > 0) {
      fd.append('gg_id', selectedGroup);
    }
    return fd;
  }, [selectedGroup]);

  // const { data: appResponse, isSuccess: isAppSuccess } = useQueryFetch(
  //   ['account-filter-data', 'group_select', selectedGroup],
  //   'get-analytics-filtering-data',
  //   filterAccData,
  //   {
  //     staleTime: 60 * 1000,
  //     refetchOnMount: 'ifStale',
  //   }
  // );

  // useEffect(() => {
  //   if (!isAppSuccess || !appResponse) return;
  //   const response = appResponse;
  //   const uniqueAppData = response?.all_app_list
  //   ?.filter((v, i, self) => self?.findIndex((t) => t?.admob_email === v?.admob_email) === i)
  //   .map((v, i) => ({
  //     ...v,
  //     item_checked: false,
  //     id: i,
  //   }));

  //   let data = response?.all_app_list;

  //   const uniqueAppAutoIdObjects = [];
  //   Object?.keys(data)?.forEach((key) => {
  //     const entry = data[key];

  //     if (!uniqueAppAutoIdObjects.some((obj) => obj?.app_auto_id === entry?.app_auto_id)) {
  //       uniqueAppAutoIdObjects?.push(entry);
  //     }
  //   });

  //   setFilterData(uniqueAppAutoIdObjects);
  //   setFilterAccountData(uniqueAppData);
  // }, [appResponse, isAppSuccess]);

  const { data: appResponse, isSuccess: isAppSuccess } = useQueryFetch(
    ['group_select', selectedGroup],
    'setting-apps-list',
    filterAccData,
    {
      staleTime: 60 * 1000,
      refetchOnMount: 'ifStale',
    }
  );

  useEffect(() => {
    if (!isAppSuccess || !appResponse) return;
    const response = appResponse;
    const uniqueAppData = response?.aaData
    ?.filter((v, i, self) => self?.findIndex((t) => t?.app_admob_email === v?.app_admob_email) === i)
    .map((v, i) => ({
      ...v,
      item_checked: false,
      admob_email: v?.app_admob_email,
      id: i,
    }));
    console.log("🚀 ~ AppContentBox ~ uniqueAppData:", uniqueAppData)

    let data = response?.aaData;

    const uniqueAppAutoIdObjects = [];
    Object?.keys(data)?.forEach((key) => {
      const entry = data[key];

      if (!uniqueAppAutoIdObjects.some((obj) => obj?.app_auto_id === entry?.app_auto_id)) {
        uniqueAppAutoIdObjects?.push(entry);
      }
    });

    setFilterData(uniqueAppAutoIdObjects);
    setFilterAccountData(uniqueAppData);
  }, [appResponse, isAppSuccess]);

  useEffect(() => {
    if (!isSuccess || !appList) return;
    const totalPages = Math.ceil(appList?.iTotalRecords / appPageLength);
    setAppTotalPages(totalPages);
  }, [isSuccess, appList]);

  useEffect(() => {
    const paginationLinks = useGeneratePagination(appTotalPages);
    setAppPaginationList(paginationLinks);
  }, [appTotalPages]);

  const handleToggleVisibility = async (appAutoId, currentVisibility) => {
    const nextVisibility = currentVisibility ? 0 : 1;

    try {
      queryClient.setQueryData(APPS_LIST_QUERY_KEY, (oldData) => {
        if (!oldData?.aaData) return oldData;

        return {
          ...oldData,
          aaData: oldData.aaData.map((app) =>
            Number(app.app_auto_id) === Number(appAutoId)
              ? { ...app, app_visibility: nextVisibility }
              : app
          ),
        };
      });

      queryClient.setQueriesData({ queryKey: ['global-app-list'], exact: false }, (oldData) => {
        if (!oldData?.aaData) return oldData;

        return {
          ...oldData,
          aaData: oldData.aaData.map((app) =>
            Number(app.app_auto_id) === Number(appAutoId)
              ? { ...app, app_visibility: nextVisibility }
              : app
          ),
        };
      });

      queryClient.setQueriesData({ queryKey: ['account-filter-data'], exact: false }, (oldData) => {
        if (!oldData?.all_app_list) return oldData;

        return {
          ...oldData,
          all_app_list: oldData.all_app_list.map((app) =>
            Number(app.app_auto_id) === Number(appAutoId)
              ? { ...app, app_visibility: nextVisibility }
              : app
          ),
        };
      });

      // Update account-filter-data cache
      queryClient.setQueriesData({ queryKey: ['global-campaign-list'], exact: false }, (oldData) => {
        if (!oldData?.list_apps) return oldData;

        return {
          ...oldData,
          list_apps: oldData.list_apps.map((app) =>
            Number(app.app_auto_id) === Number(appAutoId)
              ? { ...app, app_visibility: nextVisibility }
              : app
          ),
        };
      });

      const payload = new FormData();
      payload.append('user_id', localStorage.getItem('id'));
      payload.append('user_token', localStorage.getItem('token'));
      payload.append('app_auto_id', appAutoId);

      await useAppsApi('toggle-app-visibility', payload);

      flushAllCachesExcept(queryClient, [
        'apps-list-table',
        'global-app-list',
        'group_select',
        'global-campaign-list',
        'setting-apps-list',
      ]);
    } catch (err) {
      console.error(err);
      queryClient.invalidateQueries(['apps-list-table']);
    }
  };

  const columns = [
    {
      name: 'Id',
      selector: (row) => row['increment_id'],
      cell: (app) => <span>{app?.increment_id}</span>,
      sortable: false,
      width: '60px',
    },
    {
      name: 'App',
      selector: (row) => row['app_display_name'],
      cell: (app) => (
        <AppInfoBox
          app_auto_id={app?.app_auto_id}
          app_icon={app?.app_icon}
          app_platform={app?.app_platform}
          app_display_name={app?.app_display_name}
          app_console_name={app?.app_console_name}
          app_store_id={app?.app_store_id}
        />
      ),
      width: '300px',
      sortable: true,
    },
    {
      name: 'Admob Email Id',
      selector: (row) => row['app_admob_email'],
      cell: (app) => <span className="text">{app?.app_admob_email}</span>,
      sortable: true,
    },
    {
      name: 'Ad units',
      selector: (row) => row['total_ad_units'],
      cell: (app) => <span className="app-units">{app?.total_ad_units?.split(' ')[0]} active</span>,
      sortable: false,
      width: '150px',
    },
    {
      name: 'App Visibility',
      selector: (row) => row['app_visibility'],
      cell: (app) => {
        const isVisible = Number(app?.app_visibility) === 1;

        return (
          <label className="switch toggle-icon" style={{ width: 34 }}>
            <input
              type="checkbox"
              id="checkbox"
              onChange={() => handleToggleVisibility(app.app_auto_id, isVisible)}
              checked={isVisible}
            />
            <div className="slider round"></div>
          </label>
        );
      },
      sortable: false,
      width: '150px',
    },
  ];

  const allFilterNames = ['AccountPageAccountPopup', 'AppAccountPopup'];

  const filterStates = {
    AccountPageAccountPopup: !!accountAdmob?.length,
    AppAccountPopup: !!accountNewApp?.length,
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

  const selectedFilters = selectedFilterOrder.filter((name) => filterStates[name]);
  const remainingFilters = allFilterNames.filter((name) => !selectedFilters.includes(name));
  const dynamicFilterOrder = [...selectedFilters, ...remainingFilters];

  const isFirstLoad = isLoading && !appList;
  const showMainLoader = isFirstLoad;
  const showOverlayLoader = isFetching && !!appList;

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
            setIsReportLoaderVisible={() => {}}
            setCurrentUnitPage={() => {}}
            setAccountNewApp={setAccountNewApp}
            setAccountPlatform={() => {}}
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
            selectedAccountData={accountAdmob}
            setPageNumber={setAppPageNumber}
            setIsReportLoaderVisible={() => {}}
            setCurrentUnitPage={() => {}}
            setGroupValue={() => {}}
          />
        );
      default:
        return null;
    }
  };

  const renderedComponents = dynamicFilterOrder?.map((filterName, index) => (
    <React.Fragment key={filterName + index}>{renderComponent(filterName)}</React.Fragment>
  ));

  return (
    <div className="right-box-wrap">
      <div className="table-box-wrap main-box-wrapper pdglr24 view-all-apps-table">
        <div className="userBoxWrap user-section-wrapper">
          <div className={`account-page-topbar`}>
            <div className="button-top-wrap">
              <div className="filter-bar-wrap">
                <div className="filter-box" id="filter-box">
                  {renderedComponents}
                </div>
              </div>
            </div>
          </div>
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
            <>
              <div className="table-container custom_table_container_border ad-units-box user-table-box">
                <DataTable
                  className="view-all-apps"
                  columns={columns}
                  data={appList?.aaData}
                  pagination
                  paginationPerPage={100}
                  fixedHeader
                  fixedHeaderScrollHeight={'81.1vh'}
                  paginationServer
                  progressPending={false}
                  paginationComponent={() => (
                    <CustomPaginationComponent
                      pageNumber={appPageNumber}
                      paginationList={appPaginationList}
                      setPageNumber={setAppPageNumber}
                    />
                  )}
                  progressComponent={<CustomLoadingIndicator />}
                  noDataComponent={<CustomNoDataComponent />}
                  onSort={customSort}
                  sortServer
                  sortIcon={<TableSortArrow />}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppContentBox;
