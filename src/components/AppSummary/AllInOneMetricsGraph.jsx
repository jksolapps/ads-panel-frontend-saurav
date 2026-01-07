import React from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const AllInOneMetricsGraph = ({ data }) => {
   // Prepare data for all metrics and retention days
   const dataPoints = data.map(item => ({
      x: new Date(item.installDate),
      revenue: item.revenue,
      cost: item.cost,
      roas: item.roas,
      showRate: parseFloat(item.showRate),
      matchedRate: parseFloat(item.matchedRate),
      ctr: parseFloat(item.str),
      day2Retention: parseFloat(item.day2?.percent) || null,
      retentionDays: [
         { label: 'Day 1', value: item.day1?.percent },
         { label: 'Day 2', value: item.day2?.percent },
         { label: 'Day 3', value: item.day3?.percent },
         { label: 'Day 4', value: item.day4?.percent },
         { label: 'Day 5', value: item.day5?.percent },
         { label: 'Day 6', value: item.day6?.percent },
         { label: 'Day 7', value: item.day7?.percent },
         { label: 'Day 8', value: item.day8?.percent },
      ]
   }));

   const colorMap = {
      revenue: '#7a45e6',      // Purple
      cost: '#ff3399',         // Pink
      roas: '#0fbda0',         // Teal
      showRate: '#3388ff',     // Blue
      matchedRate: '#ffb851',  // Orange
      ctr: '#ff6b6b',          // Red
      day2Retention: '#3388ff',// Blue for Day 2 retention
   };

   const metricLabels = {
      revenue: 'Revenue',
      cost: 'Cost',
      roas: 'ROAS',
      showRate: 'Show Rate',
      matchedRate: 'Matched Rate',
      ctr: 'CTR',
      day2Retention: 'Retention',
   };

   const options = {
      theme: "light2",
      backgroundColor: "#fff",
      animationEnabled: true,
      axisX: {
         valueFormatString: "DD-MM",
         labelFontColor: '#222',
         lineColor: '#E5E7EB',
         tickColor: '#E5E7EB',
         gridColor: '#F3F4F6',
         labelFontSize: 14,
         crosshair: {
            enabled: true,
            snapToDataPoint: true,
         },
      },
      axisY: {
         title: "",
         includeZero: false,
         lineColor: '#E5E7EB',
         tickColor: '#E5E7EB',
         gridColor: '#F3F4F6',
         labelFontColor: '#222',
         labelFontSize: 14,
      },
      axisY2: {
         title: "",
         includeZero: false,
         suffix: "%",
         maximum: 100,
         lineColor: '#E5E7EB',
         tickColor: '#E5E7EB',
         gridColor: '#F3F4F6',
         labelFontColor: '#222',
         labelFontSize: 14,
      },
      toolTip: {
         shared: true,
         backgroundColor: '#fff',
         borderColor: '#E5E7EB',
         cornerRadius: 10,
         fontColor: '#222',
         content: function (e) {
            // Find the hovered data point
            const dp = dataPoints.find(d => d.x.getTime() === e.entries[0].dataPoint.x.getTime());
            let content = `<div style=\"padding: 12px 16px; background: #fff; border-radius: 10px; min-width: 260px;\">`;
            content += `<div style='font-weight: 500; font-size: 15px; margin-bottom: 8px;'>${e.entries[0].dataPoint.x.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>`;

            // Create a flex container for metrics and retention
            content += `<div style='display: flex; gap: 20px;'>`;

            // Metrics section (revenue, cost, etc.) - Left side
            content += `<div style='flex: 1;'>`;

            // Analytics section (revenue, cost, roas)
            content += `<div style='font-weight: 500; font-size: 14px; margin-bottom: 4px;'>Analytics</div>`;
            content += `<div style='display: grid; grid-template-columns: 1fr auto; row-gap: 6px; column-gap: 12px; margin-bottom: 12px;'>`;
            e.entries.forEach(entry => {
               if (entry.dataSeries.name !== 'day2Retention' && ['revenue', 'cost', 'roas'].includes(entry.dataSeries.name)) {
                  let value = entry.dataPoint.y;
                  let name = metricLabels[entry.dataSeries.name] || entry.dataSeries.name;
                  let suffix = '';
                  if (entry.dataSeries.name === 'revenue' || entry.dataSeries.name === 'cost') suffix = '$';
                  content +=
                     `
                      <div class='tooltip_prefix_wrap'>
                         <span class='tooltip_prefix' style='background:${entry.dataSeries.color};'> </span>
                         <span>${name}</span>
                      </div>
                      <div style='text-align:right;'>${value}${suffix}</div>
                     `;
               }
            });
            content += `</div>`;

            // Report section (show rate, matched rate, ctr)
            content += `<div style='font-weight: 500; font-size: 14px; margin-bottom: 4px;'>Report</div>`;
            content += `<div style='display: grid; grid-template-columns: 1fr auto; row-gap: 6px; column-gap: 12px;'>`;
            e.entries.forEach(entry => {
               if (entry.dataSeries.name !== 'day2Retention' && ['showRate', 'matchedRate', 'ctr'].includes(entry.dataSeries.name)) {
                  let value = entry.dataPoint.y;
                  let name = metricLabels[entry.dataSeries.name] || entry.dataSeries.name;
                  let suffix = '%';
                  content +=
                     `
                      <div class='tooltip_prefix_wrap'>
                         <span class='tooltip_prefix' style='background:${entry.dataSeries.color};'> </span>
                         <span>${name}</span>
                      </div>
                      <div style='text-align:right;'>${value}${suffix}</div>
                     `;
               }
            });
            content += `</div></div>`;

            if (dp && dp.retentionDays) {
               content += `<div class='tooltip_right' style='flex: 1; border-left: 1px solid #eee; padding-left: 20px;'>`;
               content += `<div style='font-weight: 500; font-size: 14px; margin-bottom: 4px;'>Retention</div>`;
               content += `<div style='display: grid; grid-template-columns: 1fr auto; row-gap: 4px; column-gap: 12px;'>`;
               dp.retentionDays.forEach((day, idx) => {
                  if (day.value && day.value !== '') {
                     content += `<div style='color:"#888"}; font-weight:500;'>${day.label}</div><div style='text-align:right;'>${day.value}</div>`;
                  }
               });
               content += `</div></div>`;
            }

            content += `</div></div>`;
            return content;
         }
      },
      legend: false,
      data: [
         {
            type: "spline",
            name: "revenue",
            markerType: "circle",
            markerSize: 0,
            lineThickness: 3,
            dataPoints: dataPoints.map(point => ({ x: point.x, y: point.revenue })),
            color: colorMap.revenue
         },
         {
            type: "spline",
            name: "cost",
            markerType: "circle",
            markerSize: 0,
            lineThickness: 3,
            dataPoints: dataPoints.map(point => ({ x: point.x, y: point.cost })),
            color: colorMap.cost
         },
         {
            type: "spline",
            name: "roas",
            markerType: "circle",
            markerSize: 0,
            lineThickness: 3,
            dataPoints: dataPoints.map(point => ({ x: point.x, y: point.roas })),
            color: colorMap.roas
         },
         {
            type: "spline",
            name: "showRate",
            axisYType: "secondary",
            markerType: "circle",
            markerSize: 0,
            lineThickness: 3,
            dataPoints: dataPoints.map(point => ({ x: point.x, y: point.showRate })),
            color: colorMap.showRate
         },
         {
            type: "spline",
            name: "matchedRate",
            axisYType: "secondary",
            markerType: "circle",
            markerSize: 0,
            lineThickness: 3,
            dataPoints: dataPoints.map(point => ({ x: point.x, y: point.matchedRate })),
            color: colorMap.matchedRate
         },
         {
            type: "spline",
            name: "ctr",
            axisYType: "secondary",
            markerType: "circle",
            markerSize: 0,
            lineThickness: 3,
            dataPoints: dataPoints.map(point => ({ x: point.x, y: point.ctr })),
            color: colorMap.ctr
         },
         {
            type: "spline",
            name: "day2Retention",
            axisYType: "secondary",
            markerType: "circle",
            markerSize: 0,
            lineThickness: 3,
            dataPoints: dataPoints.map(point => ({ x: point.x, y: point.day2Retention })),
            color: colorMap.day2Retention
         }
      ]
   };

   return (
      <div className="metrics-graph-container" style={{ background: '#fff', clear: 'both', border: '1px solid #E5E7EB', borderRadius: 6, padding: 20, marginTop: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
         <h5 style={{ width: 'auto', display: "block", marginBottom: 15 }}>Summary Graph</h5>
         <CanvasJSChart options={options} />
         <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #E5E7EB'
         }}>
            {Object.entries(metricLabels).map(([key, label]) => (
               <div key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
               }}>
                  <div style={{
                     width: '12px',
                     height: '12px',
                     borderRadius: '2px',
                     backgroundColor: colorMap[key]
                  }} />
                  <span style={{
                     fontSize: '14px',
                     color: '#374151'
                  }}>{label}</span>
               </div>
            ))}
         </div>
      </div>
   );
};

export default AllInOneMetricsGraph; 