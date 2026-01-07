import React, { useEffect, useState } from "react";
import UserCanvasChartItem from "../ChartComponents/UserMetricGraph";
import { MdHelpOutline } from "react-icons/md";
import useApi from "../../hooks/useApi";
import { useParams } from "react-router-dom";
import { useQueryFetch } from "../../hooks/useQueryFetch";

const parseSafeInt = (val, fallback = 0) => {
  const num = parseInt(val, 10);
  return isNaN(num) ? fallback : num;
};

const parseSafeFloat = (val, fallback = 0) => {
  const num = parseFloat(val);
  return isNaN(num) ? fallback : num;
};

const UserMetricsPerformance = ({ overviewSelect, setIsAppLoaderVisible }) => {
  const { id } = useParams();
  const [userMetricsData, setUserMetricsData] = useState({});
  const [graphData, setGraphData] = useState({});

  const formatDate = (dateValue) => {
    const year = dateValue?.substring(0, 4);
    const month = dateValue?.substring(4, 6);
    const day = dateValue?.substring(6, 8);
    const date = new Date(year, month - 1, day);
    const currentYear = new Date().getFullYear();
    const options = { day: "2-digit", month: "short" };
    if (date?.getFullYear() !== currentYear) options.year = "2-digit";
    return date.toLocaleDateString("en-US", options);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
  };

  const buildDataPoints = (
    source,
    computeFn,
    valueLabel,
    formatFn = (val) => val
  ) =>
    source.map((item, i) => {
      const rawValue = computeFn(item, i);
      const formatted = formatFn(rawValue);
      return {
        label: formatDate(item.pd_date),
        y: rawValue,
        value: valueLabel,
        displayValue: formatted,
        tooltipDisplayValue: formatted,
        x: i,
      };
    });

  const buildGraph = (
    currentArr,
    compareArr,
    computeFn,
    valueLabel,
    formatFn
  ) => {
    const currentPoints = buildDataPoints(
      currentArr,
      computeFn,
      valueLabel,
      formatFn
    );
    const comparePoints = buildDataPoints(
      compareArr,
      computeFn,
      valueLabel,
      formatFn
    );

    return [
      {
        type: "line",
        name: "Current",
        markerSize: currentPoints.length === 1 ? 3 : 0,
        color: "#1a73e8",
        dataPoints: currentPoints,
      },
      {
        type: "line",
        name: "Previous",
        markerSize: comparePoints.length === 1 ? 3 : 0,
        color: "#1a73e835",
        dataPoints: comparePoints,
      },
    ];
  };

  const formData = new FormData();
  formData.append("user_id", localStorage.getItem("id"));
  formData.append("user_token", localStorage.getItem("token"));
  formData.append("app_auto_id", id);
  formData.append("type", overviewSelect);

  const { data: apiResponse, isSuccess: apiSuccess } = useQueryFetch(
    ["app-get-user-metrics", id, overviewSelect],
    "get-user-metrics",
    formData,
    {
      enabled: !!id,
      staleTime: 1000 * 60,
			refetchOnMount: 'ifStale',
    }
  );
  useEffect(() => {
    if (!apiResponse || !apiSuccess) return;

    const current = apiResponse?.current || [];
    const compare = apiResponse?.compare || [];
    const activity = apiResponse?.activity_performance || {};

    setUserMetricsData(activity);
    setIsAppLoaderVisible((prev) => ({
      ...prev,
      UserMetricsPerformance: false,
    }));

    // Sessions per Active User
    const sessionPerAU = buildGraph(
      current,
      compare,
      (item) => {
        const au = parseSafeInt(item.pd_active_users, 1);
        const sessions = parseSafeInt(item.pd_sessions);
        return sessions / au;
      },
      "session",
      (val) => val.toFixed(2)
    );

    // Average Session Duration (in seconds, formatted as mm:ss)
    const avgSessionDuration = buildGraph(
      current,
      compare,
      (item) => {
        const sessions = parseSafeInt(item.pd_sessions, 1);
        const duration = parseSafeInt(item.pd_user_ed);
        return duration / sessions; // this returns seconds
      },
      "duration",
      (val) => formatDuration(val) // converts to 0m 37s
    );

    // Ad Exposure per Session (as a percentage)
    const adExposure = buildGraph(
      current,
      compare,
      (item) => {
        const user_ed = parseSafeInt(item.pd_user_ed, 1);
        const adExposure = parseSafeInt(item.pd_ad_unit_exposure);
        return (adExposure / 1000 / user_ed) * 100;
      },
      "matchrate",
      (val) => `${val.toFixed(2)}%`
    );

    // Active Users
    const activeUsers = buildGraph(
      current,
      compare,
      (item) => parseInt(item?.pd_active_users || 0),
      "users",
      (val) => val
    );

    // Overall ARPU
    const arpu = buildGraph(
      current,
      compare,
      (item) => parseSafeFloat(item.pd_arpu),
      "estimate",
      (val) => `${val.toFixed(2)}`
    );

    // Overall ARPPU
    const arppu = buildGraph(
      current,
      compare,
      (item) => parseFloat(item?.pd_arppu || 0),
      "estimate",
      (val) => `${val.toFixed(2)}`
    );
    setGraphData({
      session_au: sessionPerAU,
      asv: avgSessionDuration,
      ad_ex: adExposure,
      active_users: activeUsers,
      overall_arpu: arpu,
      overall_arppu: arppu,
    });
  }, [apiResponse, apiSuccess]);

  const renderMetricCard = (
    title,
    key,
    tooltipTitle,
    tooltipDesc,
    chart,
    index
  ) => (
    <div className="box2 graph-height" key={key}>
      <div className="scorecard-name">
        {title}
        <div className="tooltip-row">
          <MdHelpOutline className="help_icon" />
          <div className={`tooltip-box ${index % 2 === 1 ? "left-tool" : ""}`}>
            <div className="content-container">
              <h4>{tooltipTitle}</h4>
              <p>{tooltipDesc}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="scorecard">
        <div className="text-box copy-text value-tooltip">
          <div
            className="label-value"
            dangerouslySetInnerHTML={{
              __html: userMetricsData?.[key]?.value || "",
            }}
          ></div>
          <div className="copyMessage">
            <div>Current: {userMetricsData?.[key]?.tooltip_current}</div>
            <div>Previous: {userMetricsData?.[key]?.tooltip_previous}</div>
          </div>
        </div>
        <div className="line-chart">
          <div className="line-chart-box">
            <UserCanvasChartItem chartData={chart} />
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <>
      {
        <>
          {/* {renderMetricCard(
            "Ad exposure/session",
            "ad_ex",
            "Ad exposure / session",
            <>
              Total <span style={{ color: "#9b51e0" }}>ad exposure</span> time
              over the selected date range divided by the total engagement over
              the selected date range.
            </>,
            graphData.ad_ex,
            1
          )} */}

          {renderMetricCard(
            "Active users (AU)",
            "active_users",
            "Active users (AU)",
            <>
              The number of unique users who have opened the app.
              <br />
              <br />
              Active users is sometimes known as DAU (daily active users) when
              aggregated by date.
            </>,
            graphData.active_users,
            0
          )}
        </>
      }
    </>
  );
};

export default UserMetricsPerformance;
