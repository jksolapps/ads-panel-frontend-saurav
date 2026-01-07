import React, { useMemo } from "react";
import moment from "moment";

const PerformanceCalendarHeatmap = ({ startDate, endDate, data }) => {
  const dataByDate = useMemo(() => {
    if (!data) return {};
    return data.reduce((acc, item) => {
      acc[item.installDate] = item.roas;
      return acc;
    }, {});
  }, [data]);

  const getRoasColor = (roas) => {
    if (roas === undefined) return "#e0e0e0"; // Grey for no data
    if (roas < 1.0) return "#ff6b6b"; // Poor (Red)
    if (roas >= 1.0 && roas < 1.2) return "#ffda63"; // Average (Yellow)
    if (roas >= 1.2 && roas < 1.4) return "#63d471"; // Good (Light Green)
    if (roas >= 1.4) return "#48c648"; // Excellent (Green)
    return "#e0e0e0"; // Default grey
  };

  const renderMonthCalendar = (month) => {
    const startOfCalendarMonth = moment(month).startOf("month");
    const endOfCalendarMonth = moment(month).endOf("month");

    const start = moment(startDate, "DD/MM/YYYY");
    const end = moment(endDate, "DD/MM/YYYY");

    // Determine the actual start and end days to render for this specific month
    const renderStartDate = moment.max(startOfCalendarMonth, start);
    const renderEndDate = moment.min(endOfCalendarMonth, end);

    if (renderStartDate.isAfter(renderEndDate)) {
      // This month is entirely outside the selected range, don't render
      return null;
    }

    const days = [];
    let currentDate = moment(startOfCalendarMonth);

    // Generate all days of the month
    while (currentDate.isSameOrBefore(endOfCalendarMonth, "day")) {
      const dateString = currentDate.format("YYYY-MM-DD");
      const roas = dataByDate[dateString];
      const isInRange = currentDate.isSameOrAfter(renderStartDate) && currentDate.isSameOrBefore(renderEndDate);
      const color = isInRange ? getRoasColor(roas) : "#f0f0f0";

      days.push(
        <div
          key={dateString}
          className={`day-box${!isInRange ? " out-of-range" : ""}`}
          style={{ backgroundColor: color }}
        >
          <div className="day-number">{currentDate.date()}</div>
          {isInRange && roas !== undefined && (
            <div className="roas-value">
              <span>{roas.toFixed(2)}</span>

            </div>
          )}
        </div>
      );
      currentDate.add(1, "day");
    }

    return (
      <div key={month.format("YYYY-MM")} className="month-row">
        <div className="month-header">
          <div className="month-name">{month.format("MMMM YYYY")}</div>
          <div className="month_total_value">
            <span>Revenue : $9,230</span>
            <span>Cost : $8,760</span>
            <span>ROAS : 0.91</span>
          </div>
        </div>
        <div className="days-container">
          {days}
        </div>
      </div>
    );
  };

  const monthsToRender = useMemo(() => {
    if (!startDate || !endDate) return [];

    const start = moment(startDate, "DD/MM/YYYY");
    const end = moment(endDate, "DD/MM/YYYY");

    if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
      return [];
    }

    const months = [];
    let currentMonth = moment(start).startOf("month");

    while (currentMonth.isSameOrBefore(end, "month")) {
      months.push(moment(currentMonth));
      currentMonth.add(1, "month");
    }

    return months;
  }, [startDate, endDate]);

  return (
    <div className="performance-calendar-heatmap">
      <h5 style={{ width: "auto", marginBottom: 15 }}>Heatmap</h5>
      <div className="calendar-container">
        {monthsToRender.map((month) => renderMonthCalendar(month))?.reverse()}
      </div>
      <div className="legend">
        <div className="legend-item">
          <span className="color-box poor"></span> Poor (&lt; 1.0)
        </div>
        <div className="legend-item">
          <span className="color-box average"></span> Average (1.0-1.2)
        </div>
        <div className="legend-item">
          <span className="color-box good"></span> Good (1.2-1.4)
        </div>
        <div className="legend-item">
          <span className="color-box excellent"></span> Excellent (&ge; 1.4)
        </div>
      </div>
    </div>
  );
};

export default PerformanceCalendarHeatmap;
