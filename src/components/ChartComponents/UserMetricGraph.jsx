import React, { useEffect, useState } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default function UserCanvasChartItem({ chartData }) {
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

  const formatValue = (value, contextValueType) => {
    if (contextValueType === "duration") {
      const totalSeconds = parseFloat(value);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
    }
    if (Number.isInteger(value)) {
      return value?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    if (value >= 1e9) {
      return (value / 1e9).toFixed(2) + "B";
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(2) + "M";
    } else if (value === "") {
      return "";
    } else {
      return value?.toFixed(2);
    }
  };

  const adjustViewportRange = (data) => {
    let minValue = Infinity;
    let maxValue = -Infinity;
    data?.forEach((series) => {
      series?.dataPoints?.forEach((pt) => {
        const y = pt?.y;
        minValue = Math.min(minValue, y);
        maxValue = Math.max(maxValue, y);
      });
    });
    return { minValue, maxValue };
  };

  const { minValue, maxValue } = adjustViewportRange(chartData);

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
    backgroundColor: isDarkMode ? "#252728" : "#ffffff",
    animationEnabled: true,
    toolTip: {
      animationEnabled: false,
      shared: true,
      fontColor: isDarkMode ? "#ffffff" : "#333333",
      content: function (e) {
        const dp1 = e.entries[0];
        const dp2 = e.entries[1];
        return `<div class='tooltip-inner' >
          <div class='tooltip-value'>
            <div>
              <span class='prefix ${dp2?.dataPoint?.y ? "first" : ""}'>
                ${dp2?.dataPoint?.label || "-"}
              </span>
              <span>
                ${(dp2?.dataPoint?.value === "estimate" || dp2?.dataPoint?.value === "ecpm") && dp2?.dataPoint?.y ? "$" : ""}
                ${dp2?.dataPoint?.y ? formatValue(dp2?.dataPoint?.y, dp2?.dataPoint?.value) : "-"}
                ${dp2?.dataPoint?.value === "matchrate" ? "%" : ""}
              </span>
            </div>
            <div>
              <span class='prefix ${dp1?.dataPoint?.y ? "second" : ""}'>
                ${dp1?.dataPoint?.label || "-"}
              </span>
              <span>
                ${(dp1?.dataPoint?.value === "estimate" || dp1?.dataPoint?.value === "ecpm") && dp1?.dataPoint?.y ? "$" : ""}
                ${dp1?.dataPoint?.y ? formatValue(dp1?.dataPoint?.y, dp1?.dataPoint?.value) : "-"}
                ${dp1?.dataPoint?.value === "matchrate" ? "%" : ""}
              </span>
            </div>
          </div>
        </div>`;
      },
    },
    theme: "light2",
    axisY: {
      includeZero: false,
      labelFormatter: () => " ",
      gridThickness: 0,
      tickLength: 0,
      lineThickness: 0,
    },
    axisX: {
      crosshair: {
        enabled: true,
        snapToDataPoint: true,
      },
      labelFormatter: () => " ",
      gridThickness: 0,
      tickLength: 0,
      lineThickness: 0,
      valueFormatString: "DD MMM",
    },
    data: updatedChartData,
  };

  return <CanvasJSChart options={options} />;
}
