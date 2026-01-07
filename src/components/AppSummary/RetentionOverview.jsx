import React, { useState } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import CircleProgressBar from "./CircleProgressBar";
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

// Helper for gauge color
const getGaugeColor = (value) => {
  if (value >= 15) return "#4caf50"; // green
  if (value >= 8) return "#ffc107"; // yellow
  if (value >= 4) return "#ff9800"; // orange
  return "#f44336"; // red
};

const gaugeTargets = [
  { label: "Day 1 Retention", key: "day1", target: 100 },
  { label: "Day 3 Retention", key: "day3", target: 30 },
  { label: "Day 7 Retention", key: "day7", target: 15 },
  { label: "Day 10 Retention", key: "day10", target: 10 },
  { label: "Day 14 Retention", key: "day14", target: 8 },
  { label: "Day 30 Retention", key: "day30", target: 5 },
];

const RetentionOverview = ({ data }) => {
  const [tab, setTab] = useState(0);

  const getAvg = (key) => {
    const vals = data.map((d) => parseFloat(d[key]?.percent)).filter((v) => !isNaN(v));
    if (!vals.length) return 0;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const renderOverviewCards = () => (
    <div className="retention_summary_box">
      {gaugeTargets.map((gt) => {
        const avg = getAvg(gt.key);
        const color = getGaugeColor(avg);
        return (
          <div key={gt.key} className="custom_blue_box">
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>{gt.label}</div>
            <div className="info_progress_box ">
              <div className="info_left">
                <div style={{ fontSize: 36, fontWeight: 700, color: getGaugeColor(getAvg(gt.key)) }}>{getAvg(gt.key)}%</div>
                <div style={{ marginTop: 10, fontSize: 13, color: "#555" }}>Users: {data.reduce((sum, d) => sum + (parseInt(d[gt.key]?.users) || 0), 0)}</div>
              </div>
              <CircleProgressBar progress={getAvg(gt.key)} indicatorColor={getGaugeColor(getAvg(gt.key))} />
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderChart = () => {
    const chartData = gaugeTargets.map((gt) => ({
      type: "column",
      name: gt.label,
      markerType: "circle",
      markerSize: 0,
      dataPoints: data.map((d) => ({ x: new Date(d.installDate), y: parseFloat(d[gt.key]?.percent) || 0 })),
    }));
    const options = {
      animationEnabled: true,
      theme: "light2",
      axisX: {
        valueFormatString: "DD-MM",
        labelFontColor: "#222",
        lineColor: "#E5E7EB",
        tickColor: "#E5E7EB",
        gridColor: "#F3F4F6",
        labelFontSize: 14,
        crosshair: {
          enabled: true,
          snapToDataPoint: true,
        },
      },
      axisY: {
        title: "Retention %",
        includeZero: true,
        maximum: 100,
        suffix: "%",
        lineColor: "#E5E7EB",
        tickColor: "#E5E7EB",
        gridColor: "#F3F4F6",
        labelFontColor: "#222",
        labelFontSize: 14,
      },
      toolTip: {
        shared: true,
        content: function (e) {
          let content = `<div style="padding: 12px 16px; background: #fff; border-radius: 10px;">`;
          content += `<div style="font-weight: 500; margin-bottom: 8px;">${e.entries[0].dataPoint.x.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>`;
          e.entries.forEach((entry) => {
            content += `<div style="display: flex; justify-content: space-between; gap: 12px; margin: 4px 0;">
                     <span style="color: ${entry.dataSeries.color}">${entry.dataSeries.name}</span>
                     <span style="font-weight: 500">${entry.dataPoint.y}%</span>
                  </div>`;
          });
          content += `</div>`;
          return content;
        },
      },
      legend: {
        verticalAlign: "top",
        horizontalAlign: "center",
        fontSize: 14,
        itemWidth: 120,
      },
      data: chartData,
    };
    return (
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #0001", padding: 24, marginTop: 24 }}>
        <CanvasJSChart options={options} />
      </div>
    );
  };

  return (
    <div className="retention-overview-container">
      <h5 style={{ width: "auto", clear: "both", float: "none", marginBottom: 15 }}>Retention Overview</h5>
      {/* <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {['Overview', 'Chart'].map((t, i) => (
               <button
                  key={t}
                  onClick={() => setTab(i)}
                  style={{
                     padding: '10px 24px',
                     borderRadius: 8,
                     border: 'none',
                     background: tab === i ? '#222' : '#e0e7ef',
                     color: tab === i ? '#fff' : '#333',
                     fontWeight: 600,
                     fontSize: 16,
                     cursor: 'pointer',
                     boxShadow: tab === i ? '0 2px 8px #0002' : 'none',
                     transition: 'all 0.2s',
                  }}
               >
                  {t}
               </button>
            ))}
         </div> */}
      {tab === 0 && renderOverviewCards()}
      {/* {tab === 1 && renderChart()} */}
    </div>
  );
};

export default RetentionOverview;
