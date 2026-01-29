/** @format */

import React, { useEffect, useState } from 'react';
import {
  MdEventNote,
  MdOutlineCalendarMonth,
  MdOutlineSmartphone,
  MdOutlineSpeed,
  MdSettingsApplications,
} from 'react-icons/md';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useAppsApi from '../../hooks/useAppsApi';
import Footer from '../Footer';
import ActivityPerformance from './ActivityPerformance';
import AdunitPerformance from './AdunitPerformance';
import { Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { overViewSelectOption } from '../../utils/helper';
import { useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import AppDetailAppInfo from '../GeneralComponents/AppDetailAppInfo';
import AppDetailsTable from './AppDetailsTable';
import { IoAnalytics } from 'react-icons/io5';
import { IoMdArrowDropdown } from 'react-icons/io';
import SearchBar from '../GeneralComponents/SearchBar';
import UserCountryBox from './UserCountryBox';
import { ReactComponent as RetentionPlusPlusIcon } from '../../assets/images/retention_pp.svg';
import { ReactComponent as AllInOneIcon } from '../../assets/images/app_all_in_one.svg';
import CostRevenueBox from './CostRevenueBox';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import Tippy from '@tippyjs/react';
import { BsThreeDotsVertical } from 'react-icons/bs';

const AppDetailsContentBox = ({ appInfo }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [overviewSelect, setOverviewSelect] = useState(3);
  const [admobId, setAdmobid] = useState('');
  const {
    role,
    isAppLoaderVisible,
    appTab,
    setIsAppLoaderVisible,
    setIsSearched,
    setAppTab,
    isDarkMode,
  } = useContext(DataContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const formData = new FormData();
  formData.append('user_id', localStorage.getItem('id'));
  formData.append('user_token', localStorage.getItem('token'));
  formData.append('app_auto_id', id);

  const { data: appOverviewData } = useQueryFetch(
    ['app-overview-data', id, overviewSelect],
    'app-overview',
    formData,
    {
      enabled: !!id,
      staleTime: 1000 * 60,
      refetchOnMount: 'ifStale',
    }
  );

  const customStyles = {
    option: (provided) => ({
      ...provided,
      color: 'black',
    }),
  };

  useEffect(() => {
    if (appInfo.status_code === 1) {
      const data = appInfo.app_info;
      document.title = data.app_display_name + ' | App Details' || 'App Details';
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = data.app_icon;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const originalSize = 32;
        const iconSize = 30;
        const padding = (originalSize - iconSize) / 2;

        canvas.width = originalSize;
        canvas.height = originalSize;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, padding, padding, iconSize, iconSize);

        const resizedFavicon = canvas.toDataURL('image/png');

        const faviconLink =
          document.querySelector("link[rel='icon']") || document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.href = resizedFavicon;
        document.head.appendChild(faviconLink);
      };
    }
  }, [appInfo]);

  return (
    <div
      className={`right-box-wrap ${
        appInfo?.app_info?.is_app_property == '1' ? 'custom_analytics_app' : 'custom_normal_app'
      }`}
    >
      {appOverviewData?.status_code !== 1 && appInfo?.status_code !== 1 ? (
        <div className="shimmer-spinner home-main-spinner">
          <Spinner animation="border" variant="secondary" />
        </div>
      ) : (
        <div className="main-box-wrapper pdglr24 app-overview">
          <div className="main-box-row">
            <div className="custom_app_details_top">
              <div className="app-info">
                <AppDetailAppInfo
                  app_auto_id={appInfo?.app_info?.app_auto_id}
                  app_icon={appInfo?.app_info?.app_icon}
                  app_platform={appInfo?.app_info?.app_platform}
                  app_display_name={appInfo?.app_info?.app_display_name}
                  app_console_name={appInfo?.app_info?.app_console_name}
                  app_store_id={appInfo?.app_info?.app_store_id}
                  admob_email={appInfo?.app_info?.admob_email}
                />
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
              </div>
            </div>
            <div className="box-row grey-box app-details-grey-box">
              {appOverviewData?.status_code !== 1 || isAppLoaderVisible?.activityPerformance ? (
                <div className="shimmer-spinner overlay-spinner white-spinner">
                  <Spinner animation="border" variant="secondary" />
                </div>
              ) : null}
              <div className="sub-title pdglr16 pdgtb16 w-color">Total estimated earnings</div>
              <div className="box-wrap pdglr16">
                <div className="scorecard">
                  <div className="label-name">Today so far</div>

                  <div className="label-value copy-text">
                    <span>
                      {appOverviewData?.status_code !== 1
                        ? '$0.00'
                        : appOverviewData?.app_info_eastimated_earnings?.app_info_today_so_far}
                    </span>
                    <div className="copyMessage">
                      {appOverviewData?.app_info_eastimated_earnings?.app_info_today_so_far_tooltip}
                    </div>
                  </div>
                </div>
                <div className="scorecard">
                  <div className="label-name">Yesterday so far</div>
                  <div className="label-value copy-text">
                    <span>
                      {appOverviewData?.status_code !== 1
                        ? '$0.00'
                        : appOverviewData?.app_info_eastimated_earnings?.app_info_yesterday_so_far}
                    </span>
                    <div className="copyMessage">
                      {
                        appOverviewData?.app_info_eastimated_earnings
                          ?.app_info_yesterday_so_far_tooltip
                      }
                    </div>
                  </div>
                </div>
                <div className="scorecard">
                  <div className="label-name">This Month so far</div>
                  <div className="label-value copy-text">
                    <span>
                      {appOverviewData?.status_code !== 1
                        ? '$0.00'
                        : appOverviewData?.app_info_eastimated_earnings?.app_info_this_month_so_far}
                    </span>
                    <div className="copyMessage">
                      {
                        appOverviewData?.app_info_eastimated_earnings
                          ?.app_info_this_month_so_far_tooltip
                      }
                    </div>
                  </div>
                </div>
                <div className="scorecard">
                  <div className="label-name">Last Month so far</div>
                  <div className="label-value copy-text">
                    <span>
                      {appOverviewData?.status_code !== 1
                        ? '$0.00'
                        : appOverviewData?.app_info_eastimated_earnings?.app_info_last_month_so_far}
                    </span>
                    <div className="copyMessage">
                      {
                        appOverviewData?.app_info_eastimated_earnings
                          ?.app_info_last_month_so_far_tooltip
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="dropdown-row mrgt16 mrgb16">
              <div className="mui-select home_date_select">
                <MdEventNote className="note_icon" />
                <Select
                  placeholder={
                    <div className="select-placeholder">Last 7 days vs previous 7 days</div>
                  }
                  defaultValue={overViewSelectOption[2]}
                  value={overViewSelectOption.value}
                  options={overViewSelectOption}
                  onChange={(e) => {
                    if (e.value === overviewSelect) {
                      return;
                    }
                    setOverviewSelect(e.value);
                    setIsAppLoaderVisible({
                      unitPerformance: true,
                      activityPerformance: true,
                      UserMetricsPerformance: true,
                    });
                  }}
                  components={{
                    IndicatorSeparator: () => null,
                    DropdownIndicator: () => <IoMdArrowDropdown />,
                  }}
                  className="overview-select"
                  classNamePrefix="custom-overview-select"
                  styles={customStyles}
                  isSearchable={false}
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 0,
                    border: 0,
                    colors: {
                      ...theme.colors,
                      primary25: '#eee',
                      primary: '#e8f0fe',
                    },
                  })}
                />
              </div>
            </div>
            <div className="feed-cards stretched_card">
              <ActivityPerformance
                overviewSelect={overviewSelect}
                isAppLoaderVisible={isAppLoaderVisible}
                setIsAppLoaderVisible={setIsAppLoaderVisible}
                appInfo={appInfo}
              />
              <AdunitPerformance
                overviewSelect={overviewSelect}
                admobID={appInfo?.app_info?.admob_auto_id}
                isAppLoaderVisible={isAppLoaderVisible}
                setIsAppLoaderVisible={setIsAppLoaderVisible}
                setAdmobid={setAdmobid}
                isAnalyticsApp={appInfo?.app_info?.is_app_property == '1'}
              />
            </div>
            <div className="single_app_report_table">
              <AppDetailsTable appId={id} appInfo={appInfo} />
            </div>
            {appInfo?.app_info?.is_app_property == '1' && (
              <>
                <div className="single_app_user_graph">
                  <UserCountryBox appId={id} overviewSelect={overviewSelect} />
                </div>
                <CostRevenueBox appId={appInfo?.app_info?.app_auto_id} />
              </>
            )}
          </div>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default AppDetailsContentBox;
