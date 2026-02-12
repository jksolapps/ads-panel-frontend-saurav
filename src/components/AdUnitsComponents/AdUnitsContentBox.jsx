/** @format */

import React, { useContext, useEffect, useRef, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import {
  MdContentCopy,
  MdOutlineCalendarMonth,
  MdOutlineSmartphone,
  MdOutlineSpeed,
  MdSettingsApplications,
} from 'react-icons/md';
import Footer from '../Footer';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import CustomLoadingIndicator from '../DataTableComponents/CustomLoadingIndicator';
import CustomNoDataComponent from '../DataTableComponents/CustomNoDataComponent';
import { Spinner } from 'react-bootstrap';
import { ReactComponent as TableSortArrow } from '../../assets/images/arrow-dwon.svg';
import CustomUnitPagination from './CustomUnitPagination';
import { IoSearch } from 'react-icons/io5';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import Tippy from '@tippyjs/react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import AppDetailAppInfo from '../GeneralComponents/AppDetailAppInfo';
import SearchBar from '../GeneralComponents/SearchBar';
import { ReactComponent as RetentionPlusPlusIcon } from '../../assets/images/retention_pp.svg';
import { ReactComponent as AllInOneIcon } from '../../assets/images/app_all_in_one.svg';
import { IoAnalytics } from 'react-icons/io5';

const AdUnitsContentBox = ({ appInfo }) => {
  const { role, searchUnitId, appTab, setAppTab, setIsAppLoaderVisible, setIsSearched } =
    useContext(DataContext);
  const { id } = useParams();
  const [adUnitData, setAdUnitData] = useState([]);
  const [spinnerFlag, setSpinnerFlag] = useState(true);
  const [totalUnitData, setTotalUnitData] = useState(100);
  const [adSearchUnitData, setAdSearchUnitData] = useState([]);
  const [responseData, setResponse] = useState([]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const appFormData = new FormData();
  appFormData.append('user_id', localStorage.getItem('id'));
  appFormData.append('user_token', localStorage.getItem('token'));
  appFormData.append('app_auto_id', id);

  const { data: apiResponse, isSuccess: apiSucesss } = useQueryFetch(
    ['app-ad-units', id],
    'list-app-ad-units',
    appFormData,
    {
      enabled: !!id,
      staleTime: 60 * 1000,
      refetchOnMount: 'ifStale',
    }
  );

  useEffect(() => {
    if (!apiResponse || !apiSucesss) return;
    const initialData = apiResponse?.info?.map((item, index) => ({
      ...item,
      increment_id: index + 1,
    }));
    setAdUnitData(initialData === undefined ? [] : initialData);
    setAdSearchUnitData(initialData === undefined ? [] : initialData);
    setResponse(apiResponse);
    if (apiResponse?.status_code === 1) {
      setSpinnerFlag(false);
      setTotalUnitData(apiResponse?.info?.length);
    }
  }, [apiResponse, apiSucesss, id]);

  //Copy text
  const [copyId, setCopyId] = useState('');
  const handleCopyText = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopyId(id);
      setTimeout(() => {
        setCopyId(null);
      }, 1500);
    } catch (err) {
      throw new Error(err);
    }
  };

  //Search
  const [searchText, setSearchText] = useState('');
  const handleSearch = (e) => {
    e.preventDefault();
    const searchText = e.target.value;
    setSearchText(searchText);
    setAdUnitData(
      adSearchUnitData.filter((app) => {
        return (
          app?.au_format_display_name.toLowerCase().includes(searchText) ||
          app?.au_id.toLowerCase().includes(searchText)
        );
      })
    );
  };

  // Table Data
  const columns = [
    {
      name: 'Id',
      selector: (row) => row['increment_id'],
      sortable: false,
      width: '70px',
    },
    {
      name: 'Ad units',
      selector: (row) => row['au_id'],
      cell: (units) => (
        <div className="copy-text ad-units">
          <div className="copy-box">
            <div className="unit-name">{units?.au_display_name}</div>
            <span className="id-text" onClick={() => handleCopyText(units?.au_id)}>
              {units?.au_id}
              <MdContentCopy className="material-icons" />
              {units?.au_id == copyId && <div className="copyMessage ad-unit">Copied </div>}
            </span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Ad format',
      selector: (row) => row['au_format_display_name'],
      sortable: true,
    },
  ];

  const [currentUnitPage, setCurrentUnitPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const totalUnitPage = totalUnitData / itemsPerPage;

  const indexOfLastItem = currentUnitPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAdUnitData = adUnitData?.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div
      className={`right-box-wrap ${
        appInfo?.app_info?.is_app_property == '1' ? 'custom_analytics_app' : 'custom_normal_app'
      }`}
    >
      <div className="main-box-wrapper pdglr24 app-overview">
        <div className="main-box-row">
          <div className="custom_app_details_top">
            <div
              className="app-info"
              style={
                windowWidth <= 417
                  ? {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }
                  : {}
              }
            >
              <AppDetailAppInfo
                app_auto_id={appInfo?.app_info?.app_auto_id}
                app_icon={appInfo?.app_info?.app_icon}
                app_platform={appInfo?.app_info?.app_platform}
                app_display_name={appInfo?.app_info?.app_display_name}
                app_console_name={appInfo?.app_info?.app_console_name}
                app_store_id={appInfo?.app_info?.app_store_id}
                admob_email={appInfo?.app_info?.admob_email}
              />

              {windowWidth <= 417 && (
                <Tippy
                  content={
                    <div className="custom_extra_menu_wrapper tippy_extra_submenu">
                      <div className="custom_extra_menu">
                        <Link
                          onClick={() => {
                            setAppTab({
                              detailsPage: true,
                              settingPage: false,
                              unitPage: false,
                            });
                            closeMenu();
                          }}
                          className={appTab?.detailsPage ? 'section-menu active' : 'section-menu'}
                        >
                          <MdOutlineSpeed />
                          <span className="menu-item-label">App Overview</span>
                        </Link>

                        <Link
                          onClick={() => {
                            setAppTab({
                              detailsPage: false,
                              settingPage: false,
                              unitPage: true,
                            });
                            closeMenu();
                          }}
                          className={appTab.unitPage ? 'section-menu active' : 'section-menu'}
                        >
                          <MdOutlineSmartphone />
                          <span className="menu-item-label">Ad Units</span>
                        </Link>

                        <Link
                          onClick={() => {
                            setAppTab({
                              detailsPage: false,
                              settingPage: true,
                              unitPage: false,
                            });
                            closeMenu();
                          }}
                          className={appTab.settingPage ? 'section-menu active' : 'section-menu'}
                        >
                          <MdSettingsApplications />
                          <span className="menu-item-label">App Settings</span>
                        </Link>
                      </div>
                    </div>
                  }
                  placement="right-start"
                  interactive
                  visible={isMenuOpen}
                  onClickOutside={closeMenu}
                  appendTo={() => document.body}
                >
                  <div className="three-dot-menu" onClick={toggleMenu}>
                    <BsThreeDotsVertical size={20} />
                  </div>
                </Tippy>
              )}
            </div>
            <SearchBar
              id={id}
              appTab={appTab}
              setIsAppLoaderVisible={setIsAppLoaderVisible}
              setIsSearched={setIsSearched}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              {appInfo?.app_info?.is_app_property == '1' && role == '1' ? (
                <div className="redirect_link_wrap">
                  <div
                    className="redirect_btn"
                    onClick={() =>
                      navigate('/arpu', {
                        state: { app_auto_id: appInfo?.app_info?.app_auto_id },
                      })
                    }
                  >
                    <RetentionPlusPlusIcon className="app_details_icon" />
                    <span>ARPU</span>
                  </div>
                  <div
                    className="redirect_btn"
                    onClick={() =>
                      navigate('/arpu-raw', {
                        state: { app_auto_id: appInfo?.app_info?.app_auto_id },
                      })
                    }
                  >
                    <AllInOneIcon className="app_details_icon" />
                    <span>ARPU Raw</span>
                  </div>
                  <div
                    className="redirect_btn"
                    onClick={() =>
                      navigate('/analytics', {
                        state: { app_auto_id: appInfo?.app_info?.app_auto_id },
                      })
                    }
                  >
                    <IoAnalytics />
                    <span>Analytics</span>
                  </div>
                  <div
                    className="redirect_btn"
                    onClick={() =>
                      navigate('/heatmap', {
                        state: { app_auto_id: appInfo?.app_info?.app_auto_id },
                      })
                    }
                  >
                    <MdOutlineCalendarMonth />
                    <span>Heatmap</span>
                  </div>
                </div>
              ) : (
                <div />
              )}

              {windowWidth >= 418 && (
                <Tippy
                  content={
                    <div className="custom_extra_menu_wrapper tippy_extra_submenu">
                      <div className="custom_extra_menu">
                        <Link
                          onClick={() => {
                            setAppTab({
                              detailsPage: true,
                              settingPage: false,
                              unitPage: false,
                            });
                            closeMenu();
                          }}
                          className={appTab?.detailsPage ? 'section-menu active' : 'section-menu'}
                        >
                          <MdOutlineSpeed />
                          <span className="menu-item-label">App Overview</span>
                        </Link>

                        <Link
                          onClick={() => {
                            setAppTab({
                              detailsPage: false,
                              settingPage: false,
                              unitPage: true,
                            });
                            closeMenu();
                          }}
                          className={appTab.unitPage ? 'section-menu active' : 'section-menu'}
                        >
                          <MdOutlineSmartphone />
                          <span className="menu-item-label">Ad Units</span>
                        </Link>

                        <Link
                          onClick={() => {
                            setAppTab({
                              detailsPage: false,
                              settingPage: true,
                              unitPage: false,
                            });
                            closeMenu();
                          }}
                          className={appTab.settingPage ? 'section-menu active' : 'section-menu'}
                        >
                          <MdSettingsApplications />
                          <span className="menu-item-label">App Settings</span>
                        </Link>
                      </div>
                    </div>
                  }
                  placement="right-start"
                  interactive
                  visible={isMenuOpen}
                  onClickOutside={closeMenu}
                  appendTo={() => document.body}
                >
                  <div className="three-dot-menu" onClick={toggleMenu}>
                    <BsThreeDotsVertical size={20} />
                  </div>
                </Tippy>
              )}
            </div>
          </div>

          <>
            <div className="top-bar">
              <h1 className="title">Ad units</h1>
            </div>
            <div className="table-container custom_table_container_border ad-units-box unit-table">
              <div className="custom-search-filter unit-search">
                <form>
                  <IoSearch className="top_search_icon" />
                  <input
                    type="search"
                    value={searchText}
                    onChange={(e) => handleSearch(e, searchUnitId)}
                    placeholder="Search for ad units by ad unit name or ad format"
                  />
                </form>
              </div>
              {responseData?.status_code === 0 ? (
                <div className="shimmer-spinner">
                  <CustomNoDataComponent />
                </div>
              ) : spinnerFlag ? (
                <div className="shimmer-spinner">
                  <Spinner animation="border" variant="secondary" />
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={currentAdUnitData}
                  className="ad-unit-table"
                  pagination={true}
                  paginationPerPage={100}
                  progressPending={false}
                  fixedHeader
                  fixedHeaderScrollHeight={'68.1vh'}
                  progressComponent={<CustomLoadingIndicator />}
                  noDataComponent={<CustomNoDataComponent />}
                  sortIcon={<TableSortArrow />}
                  paginationComponent={() => (
                    <CustomUnitPagination
                      totalUnitPage={Math.ceil(totalUnitPage)}
                      currentUnitPage={currentUnitPage}
                      setCurrentUnitPage={setCurrentUnitPage}
                    />
                  )}
                />
              )}
            </div>
          </>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdUnitsContentBox;
