/** @format */
import React, { useMemo, } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import Select from "react-select";
import moment from "moment";
import { abbreviateNumber } from "../../utils/helper";
import { all_countries } from "../../utils/report_filter.json";
import CustomNoDataComponent from "../DataTableComponents/CustomNoDataComponent";
import { MdHelpOutline } from "react-icons/md";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;


const CostRevenueGraph = (
  { isDarkMode, graphData, viewMode, setViewMode, country, setCountry }) => {

  const isXS = typeof window !== "undefined" ? window.innerWidth < 576 : false;
  // Dropdown options
  const viewOptions = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];
  const countryOptions = [
    { value: "", label: "All Countries" },
    ...all_countries.map((country) => ({
      value: country.alpha2_code,
      label: country.name,
    })),
  ];

  const selectedCountryName = React.useMemo(() => {
    const hit = countryOptions.find(o => o.value === country);
    return hit?.label || null;
  }, [country, countryOptions]);


  // Chart series
  const chartData = useMemo(() => {
    return [
      {
        type: "line",
        name: "Cost",
        lineThickness: 2,
        markerSize: 0,
        color: "#ff59ac",
        dataPoints: graphData.map((d) => ({
          x:
            viewMode === "week"
              ? moment(d.grp, "GGGGWW").startOf("isoWeek").toDate()
              : viewMode === "month"
                ? moment(d.grp, "YYYY-MM").startOf("month").toDate()
                : moment(d.grp).toDate(),
          y: Number(d.cost || 0),
        })),
      },
      {
        type: "line",
        name: "Revenue",
        lineThickness: 2,
        markerSize: 0,
        color: "#30c4af",
        dataPoints: graphData.map((d) => ({
          x:
            viewMode === "week"
              ? moment(d.grp, "GGGGWW").startOf("isoWeek").toDate()
              : viewMode === "month"
                ? moment(d.grp, "YYYY-MM").startOf("month").toDate()
                : moment(d.grp).toDate(),
          y: Number(d.revenue || 0),
        })),
      },
    ];
  }, [graphData, viewMode]);

  const chartOptions = {
    animationEnabled: true,
    animationDuration: 1200,
    backgroundColor: isDarkMode ? "#252728" : "#fff",
    height: 290,
    axisX: {
      valueFormatString:
        viewMode === "day" ? "DD-MM" : viewMode === "week" ? "DD-MM" : "MMM-YY",
      ...(viewMode === "month" ? { interval: isXS ? 2 : 1, intervalType: "month" } : {}),
      ...(viewMode === "week"
        ? {
          interval: 1,
          intervalType: "week",
          labelFormatter: (e) => {
            const m = moment(e.value).add(1, "day");
            return `W${String(m.isoWeek()).padStart(2, "0")}`;
          },
        }
        : {}),
      labelFontColor: isDarkMode ? "#e5e5e5" : "#222",
      lineColor: isDarkMode ? "#374151" : "#E5E7EB",
      tickColor: isDarkMode ? "#374151" : "#E5E7EB",
      gridColor: isDarkMode ? "#1f2937" : "#F3F4F6",
      labelFontSize: 14,
      lineThickness: 1,
      crosshair: { enabled: true, snapToDataPoint: true },
    },
    axisY: {
      labelFormatter: (e) => "$" + abbreviateNumber(e.value),
      labelFontColor: isDarkMode ? "#e5e5e5" : "#222",
      lineColor: isDarkMode ? "#374151" : "#E5E7EB",
      tickColor: isDarkMode ? "#374151" : "#E5E7EB",
      gridColor: isDarkMode ? "#1f2937" : "#F3F4F6",
      labelFontSize: 14,
      lineThickness: 1,
    },
    toolTip: {
      shared: true,
      backgroundColor: isDarkMode ? "#252728" : "#fff",
      fontColor: isDarkMode ? "#ffffff" : "#333333",
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
      cornerRadius: 6,
      contentFormatter: (e) => {
        const x = e.entries[0].dataPoint.x;
        const header =
          viewMode === "week"
            ? (() => {
              const m = moment(x).add(1, "day");
              return `${m.isoWeekYear()}W${String(m.isoWeek()).padStart(2, "0")}`;
            })()
            : moment(x).format(viewMode === "month" ? "MMMM YYYY" : "dddd, DD MMMM YYYY");

        let content = `<div style="padding:12px">`;

        if (selectedCountryName) {
          content += `<div style="font-weight:600;margin-bottom:5px;">${selectedCountryName}</div>`;
        }

        // Date/week line
        content += `<div style="font-weight:600;margin-bottom:15px;">${header}</div>`;
        e.entries.forEach((entry) => {
          const color = entry.dataSeries.color || "#ccc";
          const label = entry.dataSeries.name;
          const value = abbreviateNumber(entry.dataPoint.y);
          content += `
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:4px;">
              <span style="display:flex;align-items:center;gap:8px;">
                <span style="width:8px;height:8px;border-radius:50%;background-color:${color};display-inline-block;"></span>
                <span>${label}</span>
              </span>
              <span>$${value}</span>
            </div>`;
        });
        content += `</div>`;
        return content;
      },
    },

    legend: {
      fontColor: isDarkMode ? "#e5e5e5" : "#222",
      fontSize: 14,
      horizontalAlign: "center",
      verticalAlign: "bottom",
    },
    data: chartData,
  };

  const selectTheme = (theme) => ({
    ...theme,
    borderRadius: 4,
    border: 0,
    fontSize: 15,
    colors: {
      ...theme.colors,
      primary25: "#eee",
      primary: "#e0ebfc",
    },
  })

  return (
    <div
      className="metrics-graph-container custom_graph_box"
      style={{
        background: isDarkMode ? "#252728" : "#fff",
        borderRight: `1px solid ${isDarkMode ? "#374151" : "#E5E7EB"}`,
        color: isDarkMode ? "#fff" : "#000",
        position: "relative",
      }}
    >
      <div
        className="graph_header"
      >
        <div
          className="graph_title"
          style={{ color: isDarkMode ? "#ffffff" : "#000000", fontSize: 18 }}
        >
          Cost vs Revenue
          <div className="tooltip-row">
            <MdHelpOutline className="help_icon" />
            <div className="tooltip-box">
              <div className="content-container">
                <h4>Cost vs Revenue</h4>
                <p>
                  This graph shows the relationship between your ad spend (cost) and the revenue generated from Google Ads. Use this graph to track performance, compare spending against returns, and evaluate the efficiency of your ad campaigns.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="graph_filter">
          <Select
            className="graph_dropdown overview-select"
            classNamePrefix="custom-overview-select"
            options={countryOptions}
            defaultValue={countryOptions[0]}
            placeholder="Select Country"
            onChange={(opt) => setCountry(opt?.value)}
            components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
            isSearchable={false}
            isClearable
            theme={selectTheme}
            styles={{
              control: (provided) => ({
                ...provided,
                width: 150,
                cursor: "pointer",
                background: "transparent",
              }),
              menu: (provided) => ({
                ...provided,
                width: 150,
              }),
              menuList: (provided) => ({
                ...provided,
                maxHeight: 200,
                overflowY: "auto",
              }),
              option: (provided) => ({
                ...provided,
                color: "black",
                cursor: "pointer",
                fontSize: 14,
                padding: "5px 12px",
              }),
            }}
          />
          <Select
            className="graph_dropdown overview-select"
            classNamePrefix="custom-overview-select"
            options={viewOptions}
            defaultValue={viewOptions[0]}
            onChange={(opt) => setViewMode(opt.value)}
            components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
            isSearchable={false}
            theme={selectTheme}
            styles={{
              control: (provided) => ({
                ...provided,
                width: 100,
                cursor: "pointer",
                background: "transparent"
              }),
              menu: (provided) => ({
                ...provided,
                width: 100,
              }),
              option: (provided) => ({
                ...provided,
                color: "black",
                cursor: "pointer",
                fontSize: 14,
              }),
            }}
          />
        </div>
      </div>
      {
        graphData?.length > 0 ?
          <>
            <CanvasJSChart options={chartOptions} />
          </> : <CustomNoDataComponent />
      }
    </div>
  );
};

export default CostRevenueGraph;
