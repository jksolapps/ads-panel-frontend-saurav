import React from "react";

const AllInOneAnalyticsOverview = ({ groupBy }) => {
   // Dummy data for demonstration
   const analytics = {
      totalRevenue: 45234.89,
      totalCost: 15432.67,
      avgROAS: 2.9,
      revenueChange: 12.4,
      costChange: 12.4,
      roasChange: 12.4,
   };

   const topPerformers = [
      { label: "Day 1", revenue: 8234, cost: 2845, roas: 2.9 },
      { label: "Day 2", revenue: 9567, cost: 3201, roas: 3.0 },
      { label: "Day 3", revenue: 11234, cost: 3876, roas: 2.9 },
      { label: "Day 7", revenue: 12567, cost: 4234, roas: 3.0 },
      { label: "Day 14", revenue: 18567, cost: 7234, roas: 2.8 },
   ];

   const reportData = [
      {
         label: "Show Rate",
         value: "84.7%",
         change: 5.3,
         desc: "Avg across all periods",
         positive: true,
      },
      {
         label: "Matched Rate",
         value: "92.3%",
         change: 3.1,
         desc: "Consistently high performance",
         positive: true,
      },
      {
         label: "CTR",
         value: "4.8%",
         change: 0.9,
         desc: "Above industry average",
         positive: true,
      },
   ];

   const topReportPerformers = [
      { label: "Day 1", show_rate: "86.6%", matched_rate: "91.80%", ctr: "5.6%" },
      { label: "Day 2", show_rate: "84.2%", matched_rate: "90.10%", ctr: "4.9%" },
      { label: "Day 3", show_rate: "88.1%", matched_rate: "92.50%", ctr: "5.2%" },
      { label: "Day 7", show_rate: "85.7%", matched_rate: "89.90%", ctr: "5.0%" },
      { label: "Day 14", show_rate: "82.7%", matched_rate: "86.90%", ctr: "4.8%" },
   ];


   return (
      <div className="main_overview_box">
         <div className="first_analytics_box">
            <h5>Analytics Overview</h5>
            <div className="overview-row">
               <div className="custom_blue_box">
                  <div className="overview-label">Total Revenue</div>
                  <div className="overview-value">
                     ${analytics.totalRevenue.toLocaleString()}
                  </div>
                  <div className="overview-percent positive">
                     &#8599; +{analytics.revenueChange}%
                  </div>
                  <div className="report-desc">{'Avg across all periods'}</div>
               </div>
               <div className="custom_blue_box">
                  <div className="overview-label">Total Cost</div>
                  <div className="overview-value">
                     ${analytics.totalCost.toLocaleString()}
                  </div>
                  <div className="overview-percent negative">
                     &#8599; -{analytics.costChange}%
                  </div>
                  <div className="report-desc">{'Above industry average'}</div>
               </div>
               <div className="custom_blue_box">
                  <div className="overview-label">Average ROAS</div>
                  <div className="overview-value">
                     {analytics.avgROAS}
                  </div>
                  <div className="overview-percent positive">
                     &#8599; +{analytics.roasChange}%
                  </div>
                  <div className="report-desc">{'Consistently high performance'}</div>
               </div>
            </div>
            <h6>Analytics Performance</h6>
            <div className="overview-row mb-0">
               {topPerformers.map((item) => (
                  <div className="custom_white_box" key={item.label}>
                     <div className="box_label">{item.label}</div>
                     <div className="box_metrics">
                        <div>
                           <span style={{ color: "#0fbda0" }}>Revenue: </span>
                           <span >{item.revenue}</span>
                        </div>
                        <div><span style={{ color: "#ff3399" }}>Cost: </span><span>{item.cost}</span></div>
                        <div><span style={{ color: "#7a45e6" }}>ROAS: </span><span>{item.roas}</span></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
         <div className="second_report_box">
            <h5>Report Overview</h5>
            <div className="overview-row">
               {reportData.map((item) => (
                  <div className="custom_blue_box" key={item.label}>
                     <div className="report-label">{item.label}</div>
                     <div className="report-value">{item.value}</div>
                     <div className={`report-percent ${item.positive ? 'positive' : 'negative'}`}>{item.positive ? '↑' : '↓'} {item.change > 0 ? '+' : ''}{item.change}%</div>
                     <div className="report-desc">{item.desc}</div>
                  </div>
               ))}
            </div>
            <h6>Report Performance</h6>
            <div className="overview-row mb-0">
               {topReportPerformers.map((item) => (
                  <div className="custom_white_box" key={item.label}>
                     <div className="box_label">{item.label}</div>
                     <div className="box_metrics">
                        <div><span style={{ color: "#0fbda0" }}>Show Rate: </span><span >{item.show_rate}</span></div>
                        <div><span style={{ color: "#ff3399" }}>Matched Rate: </span><span>{item.matched_rate}</span></div>
                        <div><span style={{ color: "#7a45e6" }}>CTR: </span><span>{item.ctr}</span></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

export default AllInOneAnalyticsOverview;