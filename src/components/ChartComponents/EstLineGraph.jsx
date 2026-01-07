/** @format */

import React from "react";
import CanvasJSReact from "@canvasjs/react-charts";
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default function CanvasChartItem({ chartData }) {
    const formatValue = (value) => {
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


    const options = {
        animationEnabled: true,
        toolTip: {
            animationEnabled: false,
            shared: true,
            fontColor: "#333333",
            //     content: function (e) {
            //         const dataPoint1 = e.entries[0];
            //         const dataPoint2 = e.entries[1];
            //         return `<div class='tooltip-inner' >
            // <div class='tooltip-value'>
            //  <div> 
            //           <span class='prefix ${dataPoint2?.dataPoint?.y ? "first" : ""
            //             }'> 
            //             ${dataPoint2?.dataPoint?.label ? dataPoint2?.dataPoint?.label : "-"
            //             } 
            //           </span>
            //           <span>
            //           ${(dataPoint2?.dataPoint?.value === "estimate" && dataPoint2?.dataPoint?.y) ||
            //                 (dataPoint2?.dataPoint?.value === "ecpm" && dataPoint2?.dataPoint?.y)
            //                 ? "$"
            //                 : ""
            //             }${dataPoint2?.dataPoint?.y ? formatValue(dataPoint2?.dataPoint?.y) : "-"
            //             }${dataPoint2?.dataPoint?.value === "matchrate" ? "%" : ""
            //             }  
            //           </span>
            //     </div> 
            //  <div>  
            // <span class='prefix ${dataPoint1?.dataPoint?.y ? "second" : ""
            //             }'> 
            //   ${dataPoint1?.dataPoint?.label ? dataPoint1?.dataPoint?.label : "-"
            //             } </span> 
            //   <span>
            //   ${(dataPoint1?.dataPoint?.value === "estimate" && dataPoint1?.dataPoint?.y) ||
            //                 (dataPoint1?.dataPoint?.value === "ecpm" && dataPoint1?.dataPoint?.y)
            //                 ? "$"
            //                 : ""
            //             }${dataPoint1?.dataPoint?.y ? formatValue(dataPoint1?.dataPoint?.y) : "-"
            //             }${dataPoint1?.dataPoint?.value === "matchrate" ? "%" : ""
            //             } </span>
            //    </div>
            // </div>
            // </div>`;
            //     },
        },
        theme: "light2",
        axisY: {
            includeZero: false,
            labelFormatter: function () {
                return " ";
            },
            // gridThickness: 0,
            tickLength: 0,
            lineThickness: 0,
            // minimum: minValue,
            // maximum: maxValue,
        },
        axisX: {
            labelFormatter: function () {
                return " ";
            },
            // gridThickness: 0,
            tickLength: 0,
            lineThickness: 0,
            valueFormatString: "DD MMM",
        },
        data: chartData,
    };

    return <CanvasJSChart options={options} />;
}
