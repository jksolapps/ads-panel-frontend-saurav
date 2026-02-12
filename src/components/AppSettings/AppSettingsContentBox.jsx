/** @format */

import React, { useContext, useEffect, useState } from 'react';
import {
  MdHelpOutline,
  MdContentCopy,
  MdCheckCircle,
  MdOutlineSpeed,
  MdOutlineSmartphone,
  MdSettingsApplications,
  MdOutlineCalendarMonth,
} from 'react-icons/md';
import Footer from '../Footer';
import { Spinner } from 'react-bootstrap';
import { LuExternalLink } from 'react-icons/lu';
import Tippy from '@tippyjs/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { DataContext } from '../../context/DataContext';
import AppDetailAppInfo from '../GeneralComponents/AppDetailAppInfo';
import SearchBar from '../GeneralComponents/SearchBar';
import { ReactComponent as RetentionPlusPlusIcon } from '../../assets/images/retention_pp.svg';
import { ReactComponent as AllInOneIcon } from '../../assets/images/app_all_in_one.svg';
import { IoAnalytics } from 'react-icons/io5';

const AppSettingsContentBox = ({ settingsData }) => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { role, appTab, setAppTab, setIsAppLoaderVisible, setIsSearched } = useContext(DataContext);

  const [copyAppId, setCopyAppId] = useState('');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCopyText = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopyAppId(id);
      setTimeout(() => {
        setCopyAppId(null);
      }, 1500);
    } catch (err) {
      throw new Error(err);
    }
  };
  return (
    <div
      className={`right-box-wrap app-setting-wrap ${
        settingsData?.app_info?.is_app_property == '1'
          ? 'custom_analytics_app'
          : 'custom_normal_app'
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
                app_auto_id={settingsData?.app_info?.app_auto_id}
                app_icon={settingsData?.app_info?.app_icon}
                app_platform={settingsData?.app_info?.app_platform}
                app_display_name={settingsData?.app_info?.app_display_name}
                app_console_name={settingsData?.app_info?.app_console_name}
                app_store_id={settingsData?.app_info?.app_store_id}
                admob_email={settingsData?.app_info?.admob_email}
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
              {settingsData?.app_info?.is_app_property == '1' && role == '1' ? (
                <div className="redirect_link_wrap">
                  <div
                    className="redirect_btn"
                    onClick={() =>
                      navigate('/arpu', {
                        state: { app_auto_id: settingsData?.app_info?.app_auto_id },
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
                        state: { app_auto_id: settingsData?.app_info?.app_auto_id },
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
                        state: { app_auto_id: settingsData?.app_info?.app_auto_id },
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
                        state: { app_auto_id: settingsData?.app_info?.app_auto_id },
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
          <div className="top-bar">
            <h1 className="title">App settings</h1>
          </div>
          <div className="info-box-wrap">
            {settingsData?.app_info?.length === 0 ? (
              <div className="shimmer-spinner">
                <Spinner animation="border" variant="secondary" />
              </div>
            ) : (
              <div className="box-wrapper">
                <div className="box">
                  <div className="title-box">
                    <div>
                      App name
                      <div className="tooltip-row">
                        <MdHelpOutline className="material-icons" />
                        <div className="tooltip-box mini-tooltip">
                          <div className="content-container">
                            <h4>App name</h4>
                            <p>The name of your app.</p>
                            <p>
                              If your app is listed on the Google Play or Apple app store, this is
                              automatically populated.&nbsp;
                            </p>
                            <p>
                              <strong>Note</strong>: We recommend matching your app name with the
                              app store listing.&nbsp;&nbsp;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-box">
                    <p className="app_display_name">{settingsData?.app_info?.app_display_name}</p>
                  </div>
                </div>
                <div className="box">
                  <div className="title-box">
                    <div>
                      App ID
                      <div className="tooltip-row">
                        <MdHelpOutline className="material-icons" />
                        <div className="tooltip-box mini-tooltip">
                          <div className="content-container">
                            <h4>App ID</h4>
                            <p>The Id of your app.</p>
                            <p>
                              If your app is listed on the Google Play or Apple app store, this is
                              automatically populated.&nbsp;
                            </p>
                            <p>
                              <strong>Note</strong>: We recommend matching your app Id with the app
                              store listing.&nbsp;&nbsp;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {settingsData?.app_info?.app_admob_app_id?.length > 0 ? (
                    <div className="content-box">
                      <div className="copy-text color-1" id="color-1">
                        <div className="copy" id="copy-1">
                          <button
                            className="copy-btn"
                            onClick={() => handleCopyText(settingsData?.app_info?.app_admob_app_id)}
                          >
                            <MdContentCopy className="material-icons" />
                            {settingsData?.app_info?.app_admob_app_id}
                          </button>
                          {settingsData?.app_info?.app_admob_app_id == copyAppId && (
                            <div className="copyMessage">Copied</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    '-'
                  )}
                </div>
                <div className="box">
                  <div className="title-box app-store-details">
                    <div>
                      App store details
                      <div className="tooltip-row">
                        <MdHelpOutline className="material-icons" />
                        <div className="tooltip-box mini-tooltip">
                          <div className="content-container">
                            <h4>App store details</h4>
                            <p>The Id of your App Store.</p>
                            <p>
                              If your app is listed on the Google Play or Apple app store, this is
                              automatically populated.&nbsp;
                            </p>
                            <p>
                              <strong>Note</strong>: We recommend matching your App Store Id with
                              the app store listing.&nbsp;&nbsp;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {settingsData?.app_info?.app_store_id?.length > 0 ? (
                    <div className="content-box">
                      <p>Google Play</p>
                      <div className="copy-link-wrap">
                        <div
                          className="copy-text color-2"
                          id="color-2"
                          onClick={() => handleCopyText(settingsData?.app_info?.app_store_id)}
                        >
                          <div className="copy" id="copy-2">
                            <button className="copy-btn">
                              <MdContentCopy className="material-icons" />
                              {settingsData?.app_info?.app_store_id}
                            </button>
                            {settingsData?.app_info?.app_store_id == copyAppId && (
                              <div className="copyMessage">Copied</div>
                            )}
                          </div>
                        </div>
                        <a
                          href={
                            settingsData?.app_info?.app_platform == 2
                              ? `https://play.google.com/store/apps/details?id=${settingsData?.app_info?.app_store_id}`
                              : `https://apps.apple.com/app/${settingsData?.app_info?.app_store_id}`
                          }
                          target="_blank"
                          className="external-link-icon"
                        >
                          <LuExternalLink />
                        </a>
                      </div>
                    </div>
                  ) : (
                    '-'
                  )}
                </div>
                <div className="box">
                  <div className="title-box console-name">
                    <div>
                      Console Name
                      <div className="tooltip-row">
                        <MdHelpOutline className="material-icons" />
                        <div className="tooltip-box mini-tooltip">
                          <div className="content-container">
                            <h4>Console Name</h4>
                            <p>The name of your app.</p>
                            <p>
                              If your app is listed on the Google Play or Apple app store, this is
                              automatically populated.&nbsp;
                            </p>
                            <p>
                              <strong>Note</strong>: We recommend matching your app name with the
                              app store listing.&nbsp;&nbsp;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-box ">
                    <p className="app_display_name">
                      {settingsData?.app_info?.app_console_name
                        ? settingsData?.app_info?.app_console_name
                        : '-'}
                      <a
                        href={
                          settingsData?.app_info?.app_platform == 2
                            ? `https://play.google.com/store/apps/developer?id=${settingsData?.app_info?.app_console_name?.replaceAll(
                                ' ',
                                '+'
                              )}`
                            : `https://apps.apple.com/developer/id${settingsData?.app_info?.app_console_name}`
                        }
                        target="_blank"
                        className="external-link-icon"
                      >
                        <LuExternalLink />
                      </a>
                    </p>
                  </div>
                </div>
                <div className="box">
                  <div className="title-box approval-status">
                    <div>
                      Approval status
                      <div className="tooltip-row">
                        <MdHelpOutline className="material-icons" />
                        <div className="tooltip-box mini-tooltip">
                          <div className="content-container">
                            <h4>Approval status</h4>
                            <p>The name of your app.</p>
                            <p>
                              If your app is listed on the Google Play or Apple app store, this is
                              automatically populated.&nbsp;
                            </p>
                            <p>
                              <strong>Note</strong>: We recommend matching your app name with the
                              app store listing.&nbsp;&nbsp;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-box">
                    {settingsData?.app_info?.app_approval_state == 1 ? (
                      <div className="ready">
                        <MdCheckCircle className="material-icons" /> Ready
                      </div>
                    ) : (
                      <div> Pending</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AppSettingsContentBox;
