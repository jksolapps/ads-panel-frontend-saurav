import React, { useRef } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import { formatValue, indianNumberFormat } from "../../utils/helper";
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default function CanvasChartItem({ chartData, performanceSelect }) {
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
    if (value >= 1e9) {
      return value / 1e9 + "B";
    } else if (value >= 1e6) {
      return value / 1e6 + "M";
    } else if (value >= 1e3) {
      return value / 1e3 + "K";
    } else {
      return value;
    }
  };
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
        let tooltipContent = `<div class='tooltip-date'>${formattedDate}</div>`; // Parent div with date or day

        dataPoint.forEach((entry) => {
          const revenue = entry.dataPoint.y || 0;
          const markerColor = entry.dataPoint.markerColor || 0;
          const percentage = Math.floor((revenue / totalRevenue) * 100);
          const value =
            entry.dataPoint.name === "Revenue"
              ? "$" + indianNumberFormat(formatValue(revenue))
              : entry.dataPoint.name === "Eng. Rate"
              ? indianNumberFormat(formatValue(revenue) + "%")
              : indianNumberFormat(formatValue(revenue));
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
                                      revenue ? value : "$0"
                                    }</span>
                                  
                                </div>
                            </div>
                        </div>
                    `;
        });

        // Add the total revenue row if not one of the specified performance metrics

        // tooltipContent += `
        //                 <div class='total-row'>
        //                     <div class='country-label'>
        //                         <span>Total</span>
        //                     </div>
        //                     <div>
        //                         <span>${
        //                           totalRevenue
        //                             ? indianNumberFormat(
        //                                 formatValue(totalRevenue)
        //                               )
        //                             : "$0"
        //                         }</span>
        //                     </div>
        //                 </div>
        //             `;

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
    axisY: {
      includeZero: true,
      gridColor: "#dadce0",
      gridThickness: 1,
      tickThickness: 0,
      lineThickness: 0,
      labelFormatter: (e) => formatValueLabel(e.value),
    },
    axisX: {
      gridThickness: 0,
      tickThickness: 0,
      lineThickness: 0,
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
    data: chartData,
  };
  return (
    <CanvasJSChart
      options={options}
      onRef={(ref) => (chartRef.current = ref)}
    />
  );
}
