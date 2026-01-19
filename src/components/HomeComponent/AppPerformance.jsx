/** @format */

import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as EmptyTableIcon } from '../../assets/images/empty-table-icon.svg';
import Select from 'react-select';
import { Spinner } from 'react-bootstrap';
import AppInfoBox from '../GeneralComponents/AppInfoBox';
import { DataContext } from '../../context/DataContext';
import CanvasChartItem from '../ChartComponents/AreaChartForRightBox';
import { formatDate, microValueConvert } from '../../utils/helper';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useGroupSettings } from '../../context/GroupSettingsContext';
import { BsPlus } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';
import { IoAdd, IoCaretDown } from 'react-icons/io5';
import { FaCaretDown } from 'react-icons/fa';
import { MdOutlineClose } from 'react-icons/md';

const AppPerformance = ({ overviewSelect }) => {
  const { setData } = useContext(DataContext);
  const { selectedGroup } = useGroupSettings();
  const isMobile = window.innerWidth < 768;

  const [appPerformanceData, setAppPerformanceData] = useState([]);
  const [firstTimecss, setFirsttimecss] = useState(true);
  const [performanceSelect, setPerformanceSelect] = useState('top_performer');
  const [performanceId, setPerformanceId] = useState('Top performers');
  const [showPlusDropdown, setShowPlusDropdown] = useState(false);
  const [showExtraDropdown, setShowExtraDropdown] = useState(false);
  const [showImpressionDropdown, setShowImpressionDropdown] = useState(false);
  const [extraMetric, setExtraMetric] = useState(null);
  const [impressionMetric, setImpressionMetric] = useState('impr');

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

  const formData = new FormData();
  if (window?.innerWidth < 767) formData.append('is_mobile_device', 'true');
  formData.append('user_id', localStorage.getItem('id'));
  formData.append('user_token', localStorage.getItem('token'));
  formData.append('type', overviewSelect);
  if (selectedGroup?.length > 0) {
    formData.append('gg_id', selectedGroup);
  }

  function addChartData(data) {
    const categories = ['top_performer', 'top_movers', 'bottom_movers'];

    categories.forEach((category) => {
      if (data[category]) {
        data[category] = data[category]?.map((app, index) => {
          if (app) {
            const dataPointsCurrent =
              app?.date_wise_revenue_current?.map(([date, revenue], idx) => ({
                label: formatDate(date),
                y: microValueConvert(revenue),
                x: idx,
              })) || [];

            const dataPointsCompare =
              app?.date_wise_revenue_compare?.map(([date, revenue], idx) => ({
                label: formatDate(date),
                y: microValueConvert(revenue),
                x: idx,
              })) || [];

            const chartData = [
              {
                index: index + 1,
                type: 'line',
                name: 'Current',
                markerSize: dataPointsCurrent.length === 1 ? 3 : 0,
                color: '#1a73e8',
                dataPoints: dataPointsCurrent,
              },
              {
                type: 'line',
                name: 'Previous',
                markerSize: dataPointsCompare.length === 1 ? 3 : 0,
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

  const { data: performanceData, isFetching } = useQueryFetch(
    ['home-app-performance', 'group_select', overviewSelect, selectedGroup],
    'dashboard-app-performance-list',
    formData,
    {
      staleTime: 60 * 1000,
      refetchOnMount: 'ifStale',
    }
  );

  useEffect(() => {
    if (!performanceData) return;
    const updatedData = addChartData({ ...performanceData });
    setAppPerformanceData(updatedData);
  }, [performanceData]);

  const performanceOption = [
    { value: '1', label: 'Top performers', name: 'top_performer', acctData: 'Top performers' },
    { value: '2', label: 'Top Mover', name: 'top_movers', acctData: 'Top Mover' },
    { value: '3', label: 'Bottom movers', name: 'bottom_movers', acctData: 'Bottom movers' },
  ];

  const customStyles = {
    option: (provided) => ({
      ...provided,
      color: 'black',
    }),
  };

  const handleClick = () => {
    setData(true);
  };

  const handleChange = (e) => {
    setFirsttimecss(false);
    setPerformanceSelect(e.name);
    setPerformanceId(e.acctData);
  };

  const getMetricValueForApp = (app, metricKey) => {
    if (!app || !metricKey) return '';
    return app?.[metricKey] ?? '';
  };

  const onPlusSelect = (key) => setExtraMetric(key);
  const onExtraColumnSelect = (key) => setExtraMetric(key);
  const onImpressionSelect = (key) => setImpressionMetric(key);

  const removeExtraMetric = () => setExtraMetric(null);

  const shouldRenderChartColumn = !isMobile;
  const shouldKeepChartPlaceholder = isMobile;

  const computedMaxHeight = (() => {
    const isSmall = window.innerWidth < 530;
    return isSmall ? '353px' : '362px';
  })();

  return (
    <div
      className={`box-row box2 ${
        appPerformanceData?.[performanceSelect]?.length < 5 ? '' : 'app-performance-box'
      }`}
    >
      {isFetching && (
        <div className="shimmer-spinner overlay-spinner ">
          <Spinner animation="border" variant="secondary" />
        </div>
      )}

      <div
        className="home-flex app-performance-popup app-perfomance-header"
        style={{ marginTop: '15px' }}
      >
        <div className="dropdown-row ">
          <div
            className={`performance-select app-performance ${
              firstTimecss ? 'first-select-css' : ''
            }`}
          >
            <Select
              defaultValue={performanceOption[0]}
              placeholder={<div className="select-placeholder">Top performers</div>}
              value={performanceOption.name}
              options={performanceOption}
              onChange={handleChange}
              className="overview-select"
              classNamePrefix={`custom-overview-select`}
              styles={customStyles}
              isSearchable={false}
              theme={(theme) => ({
                ...theme,
                borderRadius: 0,
                border: 0,
                fontSize: 15,
                colors: {
                  ...theme.colors,
                  primary25: '#eee',
                  primary: '#eee',
                },
              })}
            />
          </div>
        </div>
        <div
          className="sm-title "
          style={{ padding: '0px', marginTop: '10px', marginRight: '75px', textAlign: 'right' }}
        >
          App Performance
        </div>
      </div>

      <div className={'table-wrap app-performance-table-wrap'}>
        {appPerformanceData?.[performanceSelect]?.length === 0 ? (
          <div className="particle-table-placeholder">
            <EmptyTableIcon />
            <div className="empty-table-text">No data to display</div>
          </div>
        ) : (
          <>
            <div
              className="scroll-container"
              style={{
                overflowY: 'auto',
                minHeight: computedMaxHeight,
                maxHeight: computedMaxHeight,
              }}
            >
              <table className={'app-performance-table adunit-table-row'}>
                <thead className="adunit-table-headrow" style={{ paddingTop: '0px' }}>
                  <tr>
                    <th>Id</th>
                    <th>App</th>
                    {(shouldRenderChartColumn || shouldKeepChartPlaceholder) && (
                      <th className="chart-col"></th>
                    )}
                    <th>Est. earnings</th>

                    <th>
                      <div ref={impressionDropdownRef} className="metric-header-wrap">
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
                  {appPerformanceData?.[performanceSelect]?.map((app, index) => {
                    return (
                      <tr key={index} className="app-info-dashboard">
                        <td>{index + 1}</td>
                        <td onClick={handleClick}>
                          <AppInfoBox
                            app_auto_id={app?.app_auto_id}
                            app_icon={app?.app_icon}
                            app_platform={app?.app_platform}
                            app_display_name={app?.app_display_name}
                            app_console_name={app?.app_console_name}
                            app_store_id={app?.app_store_id}
                          />
                        </td>
                        {(shouldRenderChartColumn || shouldKeepChartPlaceholder) && (
                          <td className="line-chart">
                            {shouldRenderChartColumn ? (
                              <div className="line-chart-box adunit-line-chart">
                                <CanvasChartItem chartData={app?.chartData} />
                              </div>
                            ) : null}
                          </td>
                        )}
                        <td
                          dangerouslySetInnerHTML={{
                            __html: app?.est_earnings,
                          }}
                        ></td>
                        <td
                          dangerouslySetInnerHTML={{
                            __html: getMetricValueForApp(app, impressionMetric),
                          }}
                        />
                        {extraMetric && (
                          <td
                            dangerouslySetInnerHTML={{
                              __html: getMetricValueForApp(app, extraMetric),
                            }}
                          />
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="card-footer box-footer show-more-btn">
        <Link
          to="/accounts"
          className="content-btn"
          id="viewReport"
          state={{ data: { performanceId, overviewSelect } }}
        >
          View report
        </Link>
      </div>
    </div>
  );
};

export default AppPerformance;
