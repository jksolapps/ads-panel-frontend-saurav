import React, { useRef } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import { formatValue, indianNumberFormat } from "../../utils/helper";
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default function CanvasChartItem({
  chartData,
  performanceSelect,
  overviewSelect,
}) {
  const chartRef = useRef(null);
  const toggleDataSeries = (e) => {
    if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    chartRef.current.render();
  };
  const formatValueLabel = (value) => {
    if (performanceSelect === "impressions") {
      if (value >= 1e9) {
        return value / 1e9 + "B";
      } else if (value >= 1e6) {
        return value / 1e6 + "M";
      } else if (value >= 1e3) {
        return value / 1e3 + "K";
      } else {
        return value;
      }
    } else if (performanceSelect === "match_rate") {
      return value + "%";
    }
    if (value >= 1e9) {
      return "$" + value / 1e9 + "B";
    } else if (value >= 1e6) {
      return "$" + value / 1e6 + "M";
    } else if (value >= 1e3) {
      return "$" + value / 1e3 + "K";
    } else {
      return "$" + value;
    }
  };

  let CustomlabelAngle = 0;
  let Conditonalinterval = 1;
  if (performanceSelect === "country") {
    chartData?.map((series) => {
      if (series.dataPoints.length > 7) {
        CustomlabelAngle = -60;
        Conditonalinterval = 2;
      }
    });
  } else if (
    performanceSelect === "rev_ecpm_imp" &&
    Number(overviewSelect) > 3
  ) {
    CustomlabelAngle = -60;
  } else if (performanceSelect === "ad_unit" && Number(overviewSelect) > 3) {
    CustomlabelAngle = -60;
  } else if (
    performanceSelect === "impressions" &&
    Number(overviewSelect) > 3
  ) {
    CustomlabelAngle = -60;
  } else if (performanceSelect === "ecpm" && Number(overviewSelect) > 3) {
    CustomlabelAngle = -60;
  } else if (performanceSelect === "match_rate" && Number(overviewSelect) > 3) {
    CustomlabelAngle = -60;
  }

  const normalYdata = {
    includeZero: true,
    gridColor: "#dadce0",
    gridThickness: 1,
    tickThickness: 0,
    lineThickness: 0,
    labelFormatter: (e) => formatValueLabel(e.value),
  };
  let ImpRev2YData, ImpRevYdata, ImpRevData;
  let normalData;
  if (
    performanceSelect === "rev_ecpm_imp" &&
    chartData[0]?.name === "Revenue"
  ) {
    ImpRev2YData = {
      includeZero: true,
      title: "Revenue",
      gridColor: "#dadce0",
      lineColor: chartData[0].color,
      gridThickness: 0.5,
      tickThickness: 1,
      lineThickness: 1,
      labelFormatter: (e) => formatValueLabel(e.value),
    };
    ImpRevYdata = [
      {
        includeZero: true,
        title: "eCPM",
        gridColor: "#dadce0",
        lineColor: chartData[2]?.color,
        gridThickness: 0.5,
        tickThickness: 1,
        lineThickness: 1,
        labelFormatter: (e) => formatValueLabel(e.value),
      },
      {
        title: "Impressions",
        includeZero: true,
        gridColor: "#dadce0",
        lineColor: chartData[1]?.color,
        gridThickness: 0.5,
        tickThickness: 1,
        lineThickness: 1,
        labelFormatter: (e) => formatValueLabel(e.value),
      },
    ];
    ImpRevData = [
      {
        name: "Revenue",
        type: chartData[0]?.type,
        dataPoints: chartData[0]?.dataPoints,
        visible: chartData[0]?.visible,
        color: chartData[0]?.color,
        lineThickness: 2,
        markerSize: 7,
        axisYType: "secondary",
      },
      {
        name: "Impressions",
        type: chartData[2]?.type,
        dataPoints: chartData[2]?.dataPoints,
        visible: chartData[2]?.visible,
        color: chartData[2]?.color,
        lineThickness: 2,
        markerSize: 7,
        axisYIndex: 0,
      },
      {
        name: "eCPM",
        type: chartData[1]?.type,
        dataPoints: chartData[1]?.dataPoints,
        visible: chartData[1]?.visible,
        color: chartData[1]?.color,
        lineThickness: 2,
        markerSize: 7,
        axisYIndex: 1,
      },
    ];
    normalData = ImpRevData;
  } else {
    normalData = chartData;
  }
  const options = {
    animationDuration: 1500,
    height: 270,
    animationEnabled: true,
    backgroundColor: "#fff",
    dataPointMaxWidth: 30,

    toolTip: {
      shared: true,
      content: (e) => {
        const dataPoint = e.entries;

        dataPoint.sort((a, b) => b.dataPoint.y - a.dataPoint.y);
        let totalRevenue = 0;
        dataPoint.forEach((entry) => {
          const revenue = entry.dataPoint.y || 0;
          totalRevenue += revenue;
        });

        // Get the date or x-axis value for the tooltip
        const date = dataPoint[0].dataPoint.x;
        const day = date.getDate();
        const getDay = date.getDay();
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const dayName = daysOfWeek[getDay];

        const month = date.toLocaleString("en", { month: "long" });
        const year = date.getFullYear();
        const formattedDate = `${day} ${month + ","} ${year}`;
        const formattedDay = `${dayName}`;
        // Determine the tooltip header content based on the performance metric
        let tooltipContent = `<div class='tooltip-date'> ${
          performanceSelect === "revenue" ||
          performanceSelect === "impressions" ||
          performanceSelect === "ecpm" ||
          performanceSelect === "match_rate"
            ? formattedDay
            : formattedDate
        }</div>`;

        dataPoint.forEach((entry) => {
          const revenue = entry.dataPoint.y || 0;
          const markerColor = entry.dataPoint.markerColor || 0;
          let percentage;
          if (performanceSelect === "rev_ecpm_imp") {
            percentage = "";
          } else {
            percentage = Math.floor((revenue / totalRevenue) * 100);
          }
          tooltipContent += `
                        <div class='toolbox-inner'>
                            <div class='toolbox-value'>
                                <div class='country-label'>
                                    <span class='country-box' style='background-color: ${
                                      entry.dataSeries.color
                                    }'></span>
                                    <span class='country-name'>${
                                      entry.dataPoint.name
                                        ? entry.dataPoint.name
                                        : "-"
                                    }</span>
                                </div>
                                <div>
                                    <span class='primary-percentage-label'>${
                                      revenue
                                        ? indianNumberFormat(
                                            formatValue(revenue)
                                          )
                                        : "$0"
                                    }</span>
                                    <span class='secondary-percentage-label ${
                                      performanceSelect === "rev_ecpm_imp"
                                        ? "rev_ecpm_imp"
                                        : ""
                                    }'>${
            performanceSelect === "match_rate" ? "" : "(" + percentage + "% )"
          }</span>
                                </div>
                            </div>
                        </div>
                    `;
        });

        // Add the total revenue row if not one of the specified performance metrics
        if (
          !(
            performanceSelect === "revenue" ||
            performanceSelect === "impressions" ||
            performanceSelect === "ecpm" ||
            performanceSelect === "match_rate"
          )
        ) {
          tooltipContent += `
                        <div class='total-row'>
                            <div class='country-label'>
                                <span>Total</span>
                            </div>
                            <div>
                                <span>${
                                  totalRevenue
                                    ? indianNumberFormat(
                                        formatValue(totalRevenue)
                                      )
                                    : "$0"
                                }</span>
                            </div>
                        </div>
                    `;
        }

        return tooltipContent;
      },
    },
    legend: {
      cursor: "pointer",
      itemclick: toggleDataSeries,
      fontSize: 11,
      fontFamily: "verdana",
      fontWeight: "lighter",
    },
    axisY: performanceSelect === "rev_ecpm_imp" ? ImpRevYdata : normalYdata,
    axisY2: performanceSelect === "rev_ecpm_imp" && ImpRev2YData,
    axisX: {
      gridThickness: 0,
      tickThickness: 0,
      lineThickness: 0,
      interval: window.innerWidth < 530 ? Conditonalinterval : 1,
      labelAngle: CustomlabelAngle,
      intervalType: "day",
      labelFormatter: (e) => {
        const date = new Date(e.value);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        if (year === new Date().getFullYear()) {
          return `${day}.${month}`;
        } else {
          return `${day}.${month}.${year}`;
        }
      },
    },
    data: normalData,
  };
  return (
    <CanvasJSChart
      options={options}
      onRef={(ref) => (chartRef.current = ref)}
    />
  );
}
