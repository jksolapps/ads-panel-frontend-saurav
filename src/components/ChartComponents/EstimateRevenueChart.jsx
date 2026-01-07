/** @format */

import React from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default function EstimateRevenueChart() {
  const options = {
    axisY: {
      valueFormatString: 'US$#.00',
    },
    data: [
      {
        type: 'area',
        color: '#3367d6',
        dataPoints: [
          { label: '28 Sept', y: 4 },
          { label: '29 Sept', y: 4 },
          { label: '30 Sept', y: 2 },
          { label: '1 Oct', y: 3 },
          { label: '2 Oct', y: 3 },
          { label: '3 Oct', y: 2 },
          { label: '4 Oct', y: 0 },
        ],
      },
    ],
  };

  return <CanvasJSChart options={options} />;
}
