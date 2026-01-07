import React, { useEffect, useState } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import { displayNumber, formatValue, indianNumberFormat } from "../../utils/helper";
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default function CanvasChartItem({ chartData }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const root = document.getElementById("root");
    return (
      root?.classList.contains("dark_mode") ||
      document.body.classList.contains("dark_mode") ||
      localStorage.getItem("theme") === "dark"
    );
  });

  useEffect(() => {
    const root = document.getElementById("root");

    const checkDarkMode = () => {
      const newDarkModeState =
        root?.classList.contains("dark_mode") ||
        document.body.classList.contains("dark_mode") ||
        localStorage.getItem("theme") === "dark";
      setIsDarkMode(newDarkModeState);
    };

    checkDarkMode();

    const observer = new MutationObserver(() => {
      checkDarkMode();
    });

    if (root) {
      observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    }
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    const handleStorageChange = () => {
      checkDarkMode();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);


  const formatValueForGraph = (value, type = "") => {
    const number = parseFloat(value);
    if (isNaN(number)) return "-";

    const absNumber = Math.abs(number);
    const formatted = indianNumberFormat(formatValue(displayNumber(absNumber)));
    const sign = number < 0 ? "-" : "";

    const normalizedType = type.toLowerCase();
    const isCurrency =
      ["estimate", "earnings", "est_earnings", "ecpm", "profit", "revenue", "cost"].some((key) =>
        normalizedType.includes(key)
      );

    const prefix = isCurrency ? "$" : "";
    const suffix = normalizedType.includes("match_rate") ? "%" : "";

    return `${sign}${prefix}${formatted}${suffix}`;
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
    backgroundColor: isDarkMode ? "#252728" : "#fff",
    animationEnabled: true,
    toolTip: {
      animationEnabled: false,
      shared: true,
      fontColor: isDarkMode ? "#ffffff" : "#333333",
      content: function (e) {
        const dataPoint1 = e.entries[0];
        const dataPoint2 = e.entries[1];
        const name1 = dataPoint1?.dataPoint?.metricType || dataPoint1?.dataPoint?.value
        const name2 = dataPoint2?.dataPoint?.metricType || dataPoint2?.dataPoint?.value

        return `<div class='tooltip-inner'>
          <div class='tooltip-value'>
            <div>
              <span class='prefix ${dataPoint2?.dataPoint?.y ? "first" : ""}'>
                ${dataPoint2?.dataPoint?.label || "-"}
              </span>
              <span>
                ${dataPoint2?.dataPoint?.y ? formatValueForGraph(dataPoint2?.dataPoint?.y, name1) : "-"}
              </span>
            </div>
            <div>
              <span class='prefix ${dataPoint1?.dataPoint?.y ? "second" : ""}'>
                ${dataPoint1?.dataPoint?.label || "-"}
              </span>
              <span>
                ${dataPoint1?.dataPoint?.y ? formatValueForGraph(dataPoint1?.dataPoint?.y, name2) : "-"}
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