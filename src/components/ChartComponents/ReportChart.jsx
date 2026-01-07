/** @format */
// var React = require('react');
import React from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default function ReportChart({ options }) {
  return <CanvasJSChart options={options} />;
}
