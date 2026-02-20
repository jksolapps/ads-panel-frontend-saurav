/** @format */
import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { MdHelpOutline } from 'react-icons/md';
import CanvasChartItem from '../ChartComponents/AreaChartSmall';
import { microValueConvert } from '../../utils/helper';
import { Link } from 'react-router-dom';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useGroupSettings } from '../../context/GroupSettingsContext';

const HomeActivityPerformance = ({ overviewSelect }) => {
  const [activityPerformanceData, setActivityPerformanceData] = useState([]);
  const [charts, setCharts] = useState({});
  const { selectedGroup } = useGroupSettings();

  const formData = new FormData();
  formData.append('user_id', localStorage.getItem('id'));
  formData.append('user_token', localStorage.getItem('token'));
  formData.append('type', overviewSelect);
  if (selectedGroup?.length > 0) {
    formData.append('gg_id', selectedGroup);
  }

  const { data: activityData, isFetching } = useQueryFetch(
    ['home-activity-performance', 'group_select', overviewSelect, selectedGroup],
    'get-dashboard-performances',
    formData,
    {
      staleTime: 60 * 1000,
      refetchOnMount: 'ifStale',
    }
  );

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    const year = dateValue.substring(0, 4);
    const month = dateValue.substring(4, 6);
    const day = dateValue.substring(6, 8);
    const date = new Date(year, month - 1, day);
    const currentYear = new Date().getFullYear();
    const options = { day: '2-digit', month: 'short' };
    if (date.getFullYear() !== currentYear) options.year = '2-digit';
    return date.toLocaleDateString('en-US', options);
  };

  const convertArray1ToArray2 = (array1) => {
    const transform = (data) =>
      data?.map((item) => ({
        row: {
          dimensionValues: {
            DATE: { value: item?.report_date?.replace(/-/g, '') },
          },
          metricValues: {
            MATCHED_REQUESTS: { integerValue: item.report_matched_requests },
            ESTIMATED_EARNINGS: { microsValue: String(item.report_estimated_earnings) },
            AD_REQUESTS: { integerValue: item.report_ad_requests },
            IMPRESSIONS: { integerValue: item.report_impressions },
            COST: { integerValue: item.report_cost },
            ACTIVE_USERS: { integerValue: item.pd_active_users },
            IMPR_PER_USER: { integerValue: item.impr_per_user },
            CROAS: { integerValue: item.roas },
          },
        },
      })) || [];

    return {
      current: transform(array1?.current),
      compare: transform(array1?.compare),
    };
  };

  const buildChart = (metricType, current, compare, calcFn) => {
    const currentPoints = current.map((entry) => ({
      label: formatDate(entry.row.dimensionValues.DATE.value),
      y: calcFn(entry.row.metricValues, 'current'),
      metricType,
    }));

    const comparePoints = compare.map((entry) => ({
      label: formatDate(entry.row.dimensionValues.DATE.value),
      y: calcFn(entry.row.metricValues, 'compare'),
      metricType,
    }));

    return [
      {
        type: 'line',
        name: 'Current',
        metricType,
        markerSize: currentPoints.length === 1 ? 3 : 0,
        color: '#1a73e8',
        dataPoints: currentPoints,
      },
      {
        type: 'line',
        name: 'Previous',
        metricType,
        markerSize: comparePoints.length === 1 ? 3 : 0,
        color: '#1a73e835',
        dataPoints: comparePoints,
      },
    ];
  };

  useEffect(() => {
    if (!activityData) return;

    setActivityPerformanceData(activityData);

    const offlineData = convertArray1ToArray2(activityData);
    const { current, compare } = offlineData;

    setCharts({
      estimateEarnings: buildChart('Earnings', current, compare, (m) =>
        microValueConvert(m.ESTIMATED_EARNINGS?.microsValue)
      ),
      requestData: buildChart('Requests', current, compare, (m) =>
        Number(m.AD_REQUESTS?.integerValue)
      ),
      Impression: buildChart('Impressions', current, compare, (m) =>
        Number(m.IMPRESSIONS?.integerValue)
      ),
      matchRate: buildChart('match_rate', current, compare, (m) => {
        const matched = Number(m.MATCHED_REQUESTS?.integerValue);
        const req = Number(m.AD_REQUESTS?.integerValue);
        return req ? (matched / req) * 100 : 0;
      }),
      ecpm: buildChart('eCPM', current, compare, (m) => {
        const e = microValueConvert(m.ESTIMATED_EARNINGS?.microsValue);
        const imp = Number(m.IMPRESSIONS?.integerValue);
        return imp ? (e / imp) * 1000 : 0;
      }),
      cost: buildChart('cost', current, compare, (metrics) => {
        const cost = Number(metrics.COST?.integerValue);
        return cost ? cost : 0;
      }),
      active_users: buildChart('active_users', current, compare, (metrics) => {
        const active_users = Number(metrics.ACTIVE_USERS?.integerValue);
        return active_users ? active_users : 0;
      }),
      impr_per_user: buildChart('impr_per_user', current, compare, (metrics) => {
        const impr_per_user = Number(metrics.IMPR_PER_USER?.integerValue);
        return impr_per_user ? impr_per_user : 0;
      }),
      croas: buildChart('croas', current, compare, (metrics) => {
        const croas = Number(metrics.CROAS?.integerValue);
        return croas ? croas : 0;
      }),
    });
  }, [activityData]);

  /** -------- Render -------- */
  const renderCard = (title, tooltip, chartKey, htmlValue, tooltips = {}, link = null, hasEcpmHoverBox = false, leftToolCondition = null) => (
    // <div className='box2 graph-height'>
    <div className="box2 graph-est">
      <div className="scorecard-name">
        {link ? <Link to={link}>{title}</Link> : title}
        <div className={`tooltip-row${hasEcpmHoverBox ? ' ecpm-hover-box' : ''}`}>
          <MdHelpOutline className="help_icon" />
          <div className={`tooltip-box${leftToolCondition !== null ? (leftToolCondition ? ' left-tool' : '') : ''}`}>
            <div className="content-container">{tooltip}</div>
          </div>
        </div>
      </div>
      <div className="scorecard">
        {link ? (
          <Link to={link} className="text-box copy-text value-tooltip">
            <div className="label-value">
              <div dangerouslySetInnerHTML={{ __html: htmlValue }} />
            </div>
            <div className="copyMessage">
              <div>Current : {tooltips.current}</div>
              <div>Previous : {tooltips.previous}</div>
            </div>
          </Link>
        ) : (
          <div className="text-box copy-text value-tooltip">
            <div className="label-value">
              <div dangerouslySetInnerHTML={{ __html: htmlValue }} />
            </div>
            <div className="copyMessage">
              <div>Current : {tooltips.current}</div>
              <div>Previous : {tooltips.previous}</div>
            </div>
          </div>
        )}
        <div className="line-chart">
          <div className="line-chart-box">
            <CanvasChartItem chartData={charts[chartKey]} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="box-row box2 activity-performance">
      {isFetching && (
        <div className="shimmer-spinner overlay-spinner">
          <Spinner animation="border" variant="secondary" />
        </div>
      )}

      <div className="sm-title">Ads activity performance</div>

      <div className="card-content pdglr16 is_analytics_app">
        {renderCard(
          'Est. earnings',
          <>
            <h4>Estimated earnings</h4>
            <p>
              Your earnings accrued so far. This amount is an estimate that is subject to change
              when your earnings are verified for accuracy at the end of every month.
            </p>
          </>,
          'estimateEarnings',
          activityPerformanceData?.activity_performance?.est_earnings
            ?.dashboard_performance_est_earnings,
          {
            current:
              activityPerformanceData?.activity_performance?.est_earnings
                ?.total_estimated_earnings_tooltip_current,
            previous:
              activityPerformanceData?.activity_performance?.est_earnings
                ?.total_estimated_earnings_tooltip_previous,
          }
        )}

        {renderCard(
          'Requests',
          <>
            <h4>Requests</h4>
            <p>The total number of ad requests received from your apps.</p>
          </>,
          'requestData',
          activityPerformanceData?.activity_performance?.requests?.dashboard_performance_requests,
          {
            current:
              activityPerformanceData?.activity_performance?.requests
                ?.total_estimated_requests_tooltip_current,
            previous:
              activityPerformanceData?.activity_performance?.requests
                ?.total_estimated_requests_tooltip_previous,
          },
          null,
          false,
          false
        )}

        {renderCard(
          'Impr.',
          <>
            <h4>Impressions</h4>
            <p>
              The total number of ads shown to users across all of your ad units and apps through
              waterfall and bidding mediation. Includes a period-over-period comparison.
            </p>
          </>,
          'Impression',
          activityPerformanceData?.activity_performance?.impr?.dashboard_performance_impr,
          {
            current:
              activityPerformanceData?.activity_performance?.impr
                ?.total_estimated_impr_tooltip_current,
            previous:
              activityPerformanceData?.activity_performance?.impr
                ?.total_estimated_impr_tooltip_previous,
          },
          null,
          false,
          false
        )}

        {renderCard(
          'Match rate',
          <>
            <h4>Match rate (%)</h4>
            <p>The percentage of ad requests that received a response from an ad source.</p>
            <p>Match rate is&nbsp;calculated by dividing matched requests by requests:</p>
            <p>
              <em>(Matched requests / Requests) * 100%</em>
            </p>
          </>,
          'matchRate',
          activityPerformanceData?.activity_performance?.match_rate
            ?.dashboard_performance_match_rate,
          {
            current:
              activityPerformanceData?.activity_performance?.match_rate
                ?.total_estimated_match_rate_tooltip_current,
            previous:
              activityPerformanceData?.activity_performance?.match_rate
                ?.total_estimated_match_rate_tooltip_previous,
          },
          null,
          false,
          false
        )}

        {renderCard(
          'eCPM',
          <>
            <h4>eCPM</h4>
            <p>eCPM Effective cost per thousand impressions.</p>
            <p>
              An estimate of the revenue you receive for every thousand ad impressions. eCPM is
              calculated as {'('} Total Earnings / Impressions {')'} x 1000.
            </p>
            <p>
              <b>Note</b>: When optimization is enabled, this value is updated automatically by
              AdMob based on the ad network's historical eCPM data.
            </p>
            <p>Effective cost per thousand impressions.</p>
          </>,
          'ecpm',
          activityPerformanceData?.activity_performance?.ecpm?.dashboard_performance_ecpm,
          {
            current:
              activityPerformanceData?.activity_performance?.ecpm
                ?.total_estimated_ecpm_tooltip_current,
            previous:
              activityPerformanceData?.activity_performance?.ecpm
                ?.total_estimated_ecpm_tooltip_previous,
          },
         null,
          true,
          false
        )}

        {renderCard(
          'Cost',
          <>
            <h4>Cost</h4>
            <p>Cost is the total amount spent on ads during the selected time period.</p>
          </>,
          'cost',
          activityPerformanceData?.activity_performance?.cost?.dashboard_performance_cost,
          {
            current:
              activityPerformanceData?.activity_performance?.cost
                ?.total_estimated_cost_tooltip_current,
            previous:
              activityPerformanceData?.activity_performance?.cost
                ?.total_estimated_cost_tooltip_previous,
          },
         null,
          false,
          false
        )}

        {renderCard(
          'Active users (AU)',
          <>
            <h4>Active users (AU)</h4>
            <p>The number of unique users who have opened the app.</p>
            <p>
              Active users is sometimes known as DAU (daily active users) when aggregated by date.
            </p>
          </>,
          'active_users',
          activityPerformanceData?.activity_performance?.active_users
            ?.dashboard_performance_active_users,
          {
            current:
              activityPerformanceData?.activity_performance?.active_users
                ?.total_active_users_tooltip_current,
            previous:
              activityPerformanceData?.activity_performance?.active_users
                ?.total_active_users_tooltip_previous,
          }
          ,
          null,
          true
        )}

        {renderCard(
          'Impr./User',
          <>
            <h4>Ad Impression/User</h4>
            <p>
              Ad Impression per User measures the average number of ads served to each user during
              the selected date range.
            </p>
            <p>It is calculated by dividing total ad impressions by total active users.</p>
            <p>(Total Impressions/Active Users)</p>
          </>,
          'impr_per_user',
          activityPerformanceData?.activity_performance?.impr_per_user
            ?.dashboard_performance_impr_per_user,
          {
            current:
              activityPerformanceData?.activity_performance?.impr_per_user
                ?.total_impr_per_user_tooltip_current,
            previous:
              activityPerformanceData?.activity_performance?.impr_per_user
                ?.total_impr_per_user_tooltip_previous,
          },
          null,
          true
        )}

        {renderCard(
          'C.ROAS',
          <>
            <h4>C.ROAS</h4>
            <p>
              C.ROAS is a marketing metric that measures the revenue earned for every dollar spent
              on advertising.
            </p>
            <p>C.ROAS is simple to calculate by dividing revenue by ad spend.</p>
            <p>(Revenue/Cost)</p>
          </>,
          'croas',
          activityPerformanceData?.activity_performance?.roas?.dashboard_performance_roas,
          {
            current:
              activityPerformanceData?.activity_performance?.roas?.total_roas_tooltip_current,
            previous:
              activityPerformanceData?.activity_performance?.roas?.total_roas_tooltip_previous,
          },
          null,
          true
        )}
      </div>
    </div>
  );
};

export default HomeActivityPerformance;
