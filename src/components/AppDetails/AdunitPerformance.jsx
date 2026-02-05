/** @format */

import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ReactComponent as EmptyTableIcon } from '../../assets/images/empty-table-icon.svg';
import useApi from '../../hooks/useApi';
import Select from 'react-select';
import { Spinner } from 'react-bootstrap';
import CanvasChartItem from '../ChartComponents/AreaChartForRightBox';
import { microValueConvert } from '../../utils/helper';
import { IoIosArrowBack, IoMdClose } from 'react-icons/io';
import { IoIosArrowForward } from 'react-icons/io';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { IoAdd, IoCaretDown } from 'react-icons/io5';
import { BsPlus } from 'react-icons/bs';
import { FaCaretDown } from 'react-icons/fa';
import { MdOutlineClose } from 'react-icons/md';

const AdunitPerformance = ({
  overviewSelect,
  isAppLoaderVisible,
  setIsAppLoaderVisible,
  admobID,
  setAdmobid,
  isAnalyticsApp,
}) => {
  const { id } = useParams();
  const [adUnitPerformanceData, setAdUnitPerformanceData] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const [firstTimecss, setFirsttimecss] = useState(true);
  const [performanceSelect, setPerformanceSelect] = useState('top_performer');
  const [extraMetric, setExtraMetric] = useState(null);
  const [impressionMetric, setImpressionMetric] = useState('impr');
  const [showImpressionDropdown, setShowImpressionDropdown] = useState(false);
  const [showPlusDropdown, setShowPlusDropdown] = useState(false);
  const [showExtraDropdown, setShowExtraDropdown] = useState(false);

  const plusDropdownRef = useRef(null);
  const extraDropdownRef = useRef(null);
  const impressionDropdownRef = useRef(null);

  const metricListFromUser = [
    { api_key: 'cost', key: 'Cost', api_Value: 'COST' },
    { api_key: 'a_roas', key: 'A.ROAS', api_Value: 'A_ROAS' },
    { api_key: 'profit', key: 'Profit', api_Value: 'PROFIT' },
    { api_key: 'ecpm', key: 'eCPM', api_Value: 'ECPM' },
    { api_key: 'requests', key: 'Requests', api_Value: 'REQUESTS' },
    { api_key: 'match_rate', key: 'Match rate', api_Value: 'MATCH_RATE' },
    { api_key: 'show_rate', key: 'Show rate', api_Value: 'SHOW_RATE' },
    { api_key: 'clicks', key: 'Clicks', api_Value: 'CLICKS' },
    { api_key: 'ctr', key: 'CTR', api_Value: 'CTR' },
    { api_key: 'impr', key: 'Impressions', api_Value: 'IMPR' },
  ];

  const metricOptions = metricListFromUser.map((m) => ({
    key: m.api_key,
    label: m.key,
    apiValue: m.api_Value,
  }));

  const getAvailableOptions = () => {
    return metricOptions.filter((opt) => opt.key !== extraMetric && opt.key !== impressionMetric);
  };

  const plusDropdownOptions = getAvailableOptions();
  const extraColumnDropdownOptions = getAvailableOptions();
  const impressionDropdownOptions = getAvailableOptions();

  const onPlusSelect = (key) => setExtraMetric(key);
  const onExtraColumnSelect = (key) => setExtraMetric(key);
  const onImpressionSelect = (key) => setImpressionMetric(key);

  const removeExtraMetric = () => setExtraMetric(null);

  const getMetricValueForApp = (app, metricKey) => {
    if (!app || !metricKey) return '';
    return app?.[metricKey] ?? '';
  };

  const formData = new FormData();
  if (window?.innerWidth < 767) formData.append('is_mobile_device', 'true');
  formData.append('user_id', localStorage.getItem('id'));
  formData.append('user_token', localStorage.getItem('token'));
  formData.append('app_auto_id', id);
  formData.append('type', overviewSelect);

  const navigate = useNavigate();
  // format date
  function formatDate(dateValue) {
    // Parse the date string
    const year = dateValue?.substring(0, 4);
    const month = dateValue?.substring(4, 6);
    const day = dateValue?.substring(6, 8);
    const date = new Date(year, month - 1, day);

    // Format the date string
    const currentYear = new Date().getFullYear();
    const options = { day: '2-digit', month: 'short' };
    let formattedDate = '';

    if (date?.getFullYear() === currentYear) {
      formattedDate = date.toLocaleDateString('en-US', options);
    } else {
      options.year = '2-digit';
      formattedDate = date.toLocaleDateString('en-US', options);
    }

    return formattedDate;
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusDropdownRef.current && !plusDropdownRef.current.contains(e.target))
        setShowPlusDropdown(false);

      if (extraDropdownRef.current && !extraDropdownRef.current.contains(e.target))
        setShowExtraDropdown(false);

      if (impressionDropdownRef.current && !impressionDropdownRef.current.contains(e.target))
        setShowImpressionDropdown(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function addChartData(data) {
    const categories = ['top_performer', 'top_movers', 'bottom_movers'];

    categories.forEach((category) => {
      if (data[category]) {
        data[category] = data[category]?.map((app, index) => {
          if (app) {
            const dataPointsCurrent = app?.date_wise_revenue_current?.map(
              ([date, revenue], index) => ({
                label: formatDate(date),
                y: microValueConvert(revenue),
                x: index,
              })
            );
            const dataPointsCompare = app?.date_wise_revenue_compare?.map(
              ([date, revenue], index) => ({
                label: formatDate(date),
                y: microValueConvert(revenue),
                x: index,
              })
            );
            const chartData = [
              {
                index: index + 1,
                type: 'line',
                name: 'Current',
                markerSize: dataPointsCurrent?.length === 1 ? 3 : 0,
                color: '#1a73e8',
                dataPoints: dataPointsCurrent,
              },
              {
                type: 'line',
                name: 'Previous',
                markerSize: dataPointsCompare?.length === 1 ? 3 : 0,
                color: '#1a73e835',
                dataPoints: dataPointsCompare,
              },
            ];

            return { ...app, chartData };
          }
          return app;
        });
      }
    });

    return data;
  }

  const {
    data: apiResponse,
    isSuccess: apiSuccess,
    isLoading,
    isFetching,
  } = useQueryFetch(
    ['app-ads-performance-data', id, overviewSelect],
    'app-overview-ads-performance-list',
    formData,
    {
      enabled: !!id,
      staleTime: 1000 * 60,
      refetchOnMount: 'ifStale',
    }
  );

  useEffect(() => {
    if (!apiResponse || !apiSuccess) return;
    setIsAppLoaderVisible((prev) => ({
      ...prev,
      unitPerformance: false,
    }));
    const updatedData = addChartData(apiResponse);
    setAdUnitPerformanceData(updatedData);
  }, [apiResponse, apiSuccess, performanceSelect]);

  const performanceOption = [
    { value: '1', label: 'Top performers', name: 'top_performer' },
    { value: '2', label: 'Top Mover', name: 'top_movers' },
    { value: '3', label: 'Bottom movers', name: 'bottom_movers' },
  ];

  const customStyles = {
    option: (provided) => ({
      ...provided,
      color: 'black',
    }),
  };

  const handleChange = (e) => {
    setFirsttimecss(false);
    setSpinner(true);
    setPerformanceSelect(e.name);
    setTimeout(() => {
      setSpinner(false);
    }, 250);
  };
  const handleNavigate = (data) => {
    navigate('/reports', {
      state: {
        data: data?.au_display_name,
        auto_app_id: id,
        date: overviewSelect,
        admob_app_id: data?.admob_app_id,
        click: true,
        au_id: data?.au_id,
      },
    });
  };

  const computedMaxHeight = (() => {
    const isSmall = window.innerWidth < 530;
    if (isAnalyticsApp) {
      return isSmall ? '295px' : '290px';
    }
    return isSmall ? '353px' : '350px';
  })();

  const computedMMinHeight = (() => {
    const isSmall = window.innerWidth < 530;
    if (isAnalyticsApp) {
      return isSmall ? '295px' : '283px';
    }
    return isSmall ? '353px' : '330px';
  })();

  const hasData =
    adUnitPerformanceData &&
    Array.isArray(adUnitPerformanceData?.[performanceSelect]) &&
    adUnitPerformanceData[performanceSelect].length > 0;

  const showMainLoader = isLoading && !hasData;
  const showOverlayLoader = isFetching && hasData;

  return (
    <div
      className={`box-row box2 app-performance-box ${
        adUnitPerformanceData?.[performanceSelect]?.length < 5 &&
        adUnitPerformanceData?.[performanceSelect]?.length !== 0
          ? ' less_data'
          : ' app-overview-box adunit-performance'
      }`}
      style={{ overflow: 'hidden' }}
    >
      {showOverlayLoader && (
        <div className="shimmer-spinner overlay-spinner">
          <Spinner animation="border" variant="secondary" />
        </div>
      )}
      <div className="home-flex app-performance-popup ">
        <div className="dropdown-row ">
          <div
            className={`performance-select app-performance ${firstTimecss ? 'first-select-css' : ''}`}
          >
            <Select
              defaultValue={performanceOption[0]}
              placeholder={<div className="select-placeholder">Top performers</div>}
              value={performanceOption.name}
              options={performanceOption}
              onChange={(e) => handleChange(e)}
              className="ad-unit-overview overview-select "
              classNamePrefix="custom-overview-select"
              styles={customStyles}
              isSearchable={false}
              theme={(theme) => ({
                ...theme,
                borderRadius: 0,
                border: 0,
                fontSize: 14,
                colors: {
                  ...theme.colors,
                  primary25: '#eee',
                  primary: '#eee',
                },
              })}
            />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="sm-title app-performance-heading" style={{ marginTop: '5px' }}>
            Ad unit performance
          </div>
        </div>
      </div>
      <div className="table-wrap app-overview-table">
        {showMainLoader ? (
          <div className="shimmer-spinner blue-spinner app-performance">
            <Spinner animation="border" variant="secondary" />
          </div>
        ) : !hasData ? (
          <div className="particle-table-placeholder">
            <EmptyTableIcon />
            <div className="empty-table-text">No data to display</div>
          </div>
        ) : (
          <div
            className="scroll-container"
            style={{
              overflowY: 'auto',
              maxHeight: computedMaxHeight,
              minHeight: computedMMinHeight
            }}
          >
            <table className="app-performance-table ad-unit-performance adunit-table-row">
              <thead className="adunit-table-headrow" style={{ paddingTop: '0px' }}>
                <tr>
                  <th>Id</th>
                  <th>Ad unit</th>
                  <th></th>
                  <th>Est. earnings</th>

                  <th>
                    <div className="metric-header-wrap" ref={impressionDropdownRef}>
                      <span
                        className="metric-main-label"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPlusDropdown(false);
                          setShowImpressionDropdown((prev) => !prev);
                        }}
                      >
                        {metricOptions.find((m) => m.key === impressionMetric)?.label ||
                          'Impressions'}
                      </span>

                      <span
                        className="metric-dropdown-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPlusDropdown(false);
                          setShowImpressionDropdown((prev) => !prev);
                        }}
                      >
                        <FaCaretDown size={14} />
                      </span>

                      {showImpressionDropdown && (
                        <ul className="metric-dropdown-menu">
                          {impressionDropdownOptions.map((opt) => (
                            <li
                              key={opt.key}
                              onClick={() => {
                                onImpressionSelect(opt.key);
                                setShowImpressionDropdown(false);
                              }}
                            >
                              {opt.label}
                            </li>
                          ))}
                        </ul>
                      )}

                      {!extraMetric && (
                        <div ref={plusDropdownRef}>
                          <span
                            className="metric-plus-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowImpressionDropdown(false);
                              setShowPlusDropdown((prev) => !prev);
                            }}
                          >
                            <IoAdd size={14} />
                          </span>

                          {showPlusDropdown && (
                            <ul className="metric-dropdown-menu">
                              {plusDropdownOptions.map((opt) => (
                                <li
                                  key={opt.key}
                                  onClick={() => {
                                    onPlusSelect(opt.key);
                                    setShowPlusDropdown(false);
                                  }}
                                >
                                  {opt.label}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </th>

                  {extraMetric && (
                    <th>
                      <div ref={extraDropdownRef} className="metric-header-wrap">
                        <span
                          className="metric-main-label"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowExtraDropdown((prev) => !prev);
                          }}
                        >
                          {metricOptions.find((m) => m.key === extraMetric)?.label}
                        </span>

                        <span
                          className="metric-dropdown-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowExtraDropdown((prev) => !prev);
                          }}
                        >
                          <FaCaretDown size={14} />
                        </span>

                        <span
                          className="metric-close-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeExtraMetric();
                          }}
                        >
                          <MdOutlineClose size={14} />
                        </span>

                        {showExtraDropdown && (
                          <ul className="metric-dropdown-menu">
                            {extraColumnDropdownOptions.map((opt) => (
                              <li
                                key={opt.key}
                                onClick={() => {
                                  onExtraColumnSelect(opt.key);
                                  setShowExtraDropdown(false);
                                }}
                              >
                                {opt.label}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {adUnitPerformanceData[performanceSelect]?.map((data, index) => (
                  <tr
                    key={index}
                    className={`app-info-dashboard ${(index + 1) % 5 === 1 ? 'special-row' : ''}`}
                  >
                    <td>{index + 1}</td>
                    <td>
                      <div
                        className="app-overview-name"
                        dangerouslySetInnerHTML={{
                          __html: data?.au_display_name,
                        }}
                        onClick={() => handleNavigate(data)}
                        style={{ cursor: 'pointer' }}
                      />
                      <div
                        className="app-overview-format"
                        dangerouslySetInnerHTML={{
                          __html: data?.au_format,
                        }}
                      />
                    </td>
                    <td className="line-chart">
                      <div className="line-chart-box adunit-line-chart">
                        <CanvasChartItem chartData={data?.chartData} />
                      </div>
                    </td>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: data?.est_earnings,
                      }}
                    ></td>

                    <td
                      dangerouslySetInnerHTML={{
                        __html: getMetricValueForApp(data, impressionMetric),
                      }}
                    />

                    {extraMetric && (
                      <td
                        dangerouslySetInnerHTML={{
                          __html: getMetricValueForApp(data, extraMetric),
                        }}
                      />
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card-footer box-footer">
        <Link to={`/reports?appId=${id}&adId=${admobID}`} className="content-btn search-query-btn">
          View report
        </Link>
      </div>
    </div>
  );
};

export default AdunitPerformance;
