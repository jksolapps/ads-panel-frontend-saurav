import React, { useEffect, useState } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import { displayNumber, formatValue, indianNumberFormat } from "../../utils/helper";
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const CanvasChartItem = ({ chartData }) => {
  const [isDarkMode, setIsDarkMode] = useState(document.getElementById("root")?.classList.contains("dark_mode"));

  useEffect(() => {
    const root = document.getElementById("root");
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDarkMode(root.classList.contains("dark_mode"));
        }
      });
    });

    if (root) observer.observe(root, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const formatValueForGraph = (value) => {
    if (value === "" || value == null || isNaN(value)) return "-";
    const number = parseFloat(value);
    const sign = number < 0 ? "-" : "";
    const absFormatted = indianNumberFormat(formatValue(displayNumber(number)));
    return `${sign}$${absFormatted}`;
  };

  const updatedChartData = chartData?.map((series) => {
    if (series.name === "Previous") {
      return {
        ...series,
        color: isDarkMode ? "#a3c0f9" : "#1a73e835",
      };
    }
    return series;
  });

  const options = {
    backgroundColor: isDarkMode ? "#252728" : "transparent",
    animationEnabled: true,
    toolTip: {
      animationEnabled: false,
      shared: true,
      fontColor: isDarkMode ? "#ffffff" : "#333333",
      content: function (e) {
        const dataPoint1 = e.entries[0];
        const dataPoint2 = e.entries[1];
        return `<div class='tooltip-inner'> 
          <div class='tooltip-value'>
            <div>
              <span class='prefix ${dataPoint2?.dataPoint?.y ? "first" : ""}'>
                ${dataPoint2?.dataPoint?.label || "-"}
              </span>
              <span>${formatValueForGraph(dataPoint2?.dataPoint?.y)}</span>
            </div>
            <div>
              <span class='prefix ${dataPoint1?.dataPoint?.y ? "second" : ""}'>
                ${dataPoint1?.dataPoint?.label || "-"}
              </span>
              <span>${formatValueForGraph(dataPoint1?.dataPoint?.y)}</span>
            </div>
          </div>
        </div>`;
      },
    },
    theme: "light2",
    axisY: {
      includeZero: true,
      labelFormatter: () => " ",
      gridThickness: 0,
      tickLength: 0,
      lineThickness: 0,
    },
    axisX: {
      crosshair: {
        enabled: true,
        snapToDataPoint: false,
      },
      labelFormatter: () => " ",
      gridThickness: 0,
      tickLength: 0,
      lineThickness: 0,
      valueFormatString: "DD MMM",
    },
    data: updatedChartData,
  };

  return (
    <div className="line-chart-box">
      <CanvasJSChart options={options} />
    </div>
  );
};

export default CanvasChartItem;
