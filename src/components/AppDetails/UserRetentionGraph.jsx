/** @format */
import React from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import moment from "moment";
import CustomNoDataComponent from "../DataTableComponents/CustomNoDataComponent";
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const UserRetentionGraph = ({graphData}) => {

  const options = {
    animationEnabled: true,
    theme: "light2",
    toolTip: {
      shared: true,
      // content: (e) => {
      //   const day1DataPoint = e.entries?.[0]?.dataPoint;
      //   const day7DataPoint = e.entries?.[1]?.dataPoint;
      //   const day30DataPoint = e.entries?.[2]?.dataPoint;

      //   const day1Date = moment(day1DataPoint?.date).format("DD MMM YYYY");
      //   const day7Date = moment(day7DataPoint?.date).format("DD MMM YYYY");
      //   const day30Date = moment(day30DataPoint?.date).format("DD MMM YYYY");

      //   return `
      //     <div class='custom_chart_tooltip custom_single_chart_wrap'>
      //       <div class='tooltip_date'>
      //         <span></span>
      //         <span class='custom_prefix'>${day1Date}</span>
      //         <span class='custom_prefix'>${day7Date}</span>
      //         <span class='custom_prefix'>${day30Date}</span>
      //       </div>
      //       <div class='tooltip_value'>
      //           <span></span> 
      //       </div>
      //       <div class='tooltip_value'>
      //           <span></span> 
      //       </div>
      //       <div class='tooltip_value'>
      //           <span></span> 
      //       </div>
      //     </div>
      //   `;
      // },
    },
    axisY: {
      gridThickness: 0.3,
      tickThickness: 0,
    },
    axisX: {
      tickThickness: 0,
      crosshair: {
        enabled: true,
        snapToDataPoint: true,
      },
    },
    data: [
      {
        type: "line",
        lineColor: "#ff3399" ,
        markerColor:"#ff3399",
        dataPoints: graphData,
      },
    ],
  };

  return (
    <>
      {graphData?.length == 0 ? (
        <CustomNoDataComponent />
      ) : (
        <CanvasJSChart options={options} />
      )}
    </>
  );
};

export default UserRetentionGraph;
