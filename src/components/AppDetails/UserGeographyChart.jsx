/** @format */
import React, { useState, useEffect, useMemo } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import { abbreviateNumber } from "../../utils/helper";
import { FiCheck } from "react-icons/fi";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const UserGeographyChart = ({ data, isDarkMode }) => {
   const [hiddenCountries, setHiddenCountries] = useState(new Set());

   const colorPalette = [
      "#8e64eb", // Purple
      "#ff59ac", // Pink 
      "#30c4af", // Teal 
      "#529aff", // Blue 
      "#ffc165", // Amber
      "#ff8282", // Red 
      "#868686", // Gray 
      "#40a6be", // Cyan 
      "#ffaa40", // Orange
      "#a6d6be", // Mint 
   ];


   const topCountries = useMemo(() => {
      const totals = {};
      data?.forEach(({ arc_country, total_users }) => {
         const country = arc_country || "Unknown";
         totals[country] = (totals[country] || 0) + Number(total_users || 0);
      });
      return Object.entries(totals)
         .sort((a, b) => b[1] - a[1])
         .slice(0, 5)
         .map(([country]) => country);
   }, [data]);

   const countryTotals = useMemo(() => {
      const totals = {};
      data?.forEach(({ arc_country, total_users }) => {
         const country = arc_country || "Unknown";
         totals[country] = (totals[country] || 0) + Number(total_users || 0);
      });
      return totals;
   }, [data]);

   useEffect(() => {
      setHiddenCountries(new Set());
   }, [topCountries]);

   const getCountryColor = (country) => {
      const idx = Math.max(0, topCountries.indexOf(country));
      return colorPalette[idx % colorPalette.length] || "#999999";
   };

   const formatFullDate = (date) => {
      return date.toLocaleDateString("en-US", {
         weekday: "long",
         day: "2-digit",
         month: "long",
         year: "numeric",
      });
   };

   const prepareChartData = () => {
      const groupedByCountry = {};
      data?.forEach(({ arc_country, arc_install_date, total_users }) => {
         const country = arc_country || "Unknown";
         const date = arc_install_date;
         const count = Number(total_users);

         if (!groupedByCountry[country]) groupedByCountry[country] = {};
         groupedByCountry[country][date] = (groupedByCountry[country][date] || 0) + count;
      });

      const allDates = [...new Set(data?.map((d) => d.arc_install_date))].sort();

      return topCountries.map((country) => ({
         type: "line",
         name: country,
         showInLegend: false,
         lineThickness: 2,
         markerSize: 0,
         color: getCountryColor(country),
         visible: !hiddenCountries.has(country),
         dataPoints: allDates.map((date) => ({
            x: new Date(date),
            y: groupedByCountry[country]?.[date] || 0,
         })),
      }));
   };

   const chartOptions = {
      animationEnabled: true,
      animationDuration: 1200,
      backgroundColor: isDarkMode ? "#252728" : "#fff",
      height: 280,
      axisX: {
         valueFormatString: "DD MMM",
         labelFontColor: isDarkMode ? "#e5e5e5" : "#222",
         lineColor: isDarkMode ? "#374151" : "#E5E7EB",
         tickColor: isDarkMode ? "#374151" : "#E5E7EB",
         gridColor: isDarkMode ? "#1f2937" : "#F3F4F6",
         labelFontSize: 14,
         lineThickness: 1,
         crosshair: { enabled: true, snapToDataPoint: true },
      },
      axisY: {
         labelFormatter: (e) => abbreviateNumber(e.value),
         labelFontColor: isDarkMode ? "#e5e5e5" : "#222",
         lineColor: isDarkMode ? "#374151" : "#E5E7EB",
         tickColor: isDarkMode ? "#374151" : "#E5E7EB",
         gridColor: isDarkMode ? "#1f2937" : "#F3F4F6",
         labelFontSize: 14,
         lineThickness: 1,
      },
      toolTip: {
         shared: true,
         backgroundColor: isDarkMode ? "#252728" : "#fff",
         fontColor: isDarkMode ? "#ffffff" : "#333333",
         borderColor: isDarkMode ? "#374151" : "#E5E7EB",
         cornerRadius: 6,
         contentFormatter: (e) => {
            const date = formatFullDate(e.entries[0].dataPoint.x);
            let content = `<div style="padding:12px">`;
            content += `<div style="font-weight:600;margin-bottom:12px;">${date}</div>`;
            const countryList = e.entries.sort((a, b) => b.dataPoint.y - a.dataPoint.y)
            countryList.forEach((entry) => {
               const color = entry.dataSeries.color || "#ccc";
               const country = entry.dataSeries.name;
               const value = abbreviateNumber(entry.dataPoint.y);
               content += `
               <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:4px;">
                 <span style="display:flex;align-items:center;gap:8px;">
                   <span style="width:8px;height:8px;border-radius:50%;background-color:${color};display-inline-block;"></span>
                   <span>${country}</span>
                 </span>
                 <span>${value}</span>
               </div>`;
            });
            content += `</div>`;
            return content;
         },
      },
      data: prepareChartData(),
   };


   return (
      <div
         className="metrics-graph-container user_country_graph"
         style={{
            background: isDarkMode ? "#252728" : "#fff",
            border: `1px solid ${isDarkMode ? "#374151" : "#E5E7EB"}`,
            color: isDarkMode ? "#fff" : "#000",
         }}
      >
         <div className="graph_title" style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>
            User Geography
         </div>
         <div style={{ height: 284 }}>
            <CanvasJSChart
               options={chartOptions}
            />
         </div>
         <div className="country-toggle-wrap">
            {topCountries.map((country) => {
               const isHidden = hiddenCountries.has(country);
               const dotColor = isHidden ? "#9CA3AF" : getCountryColor(country);
               const totalUsers = countryTotals[country] || 0;
               return (
                  <button
                     key={country}
                     type="button"
                     className="country-toggle-btn"
                     onClick={() =>
                        setHiddenCountries((prev) => {
                           const next = new Set(prev);
                           if (next.has(country)) next.delete(country);
                           else next.add(country);
                           return next;
                        })
                     }
                     style={{
                        border: 0,
                        background: "none",
                        color: isHidden ? (isDarkMode ? "#9CA3AF" : "#6B7280") : (isDarkMode ? "#E5E7EB" : "#000000de"),
                     }}
                     title={country}
                  >
                     <span
                        role="checkbox"
                        aria-checked={!isHidden}
                        tabIndex={0}
                        onClick={(e) => {
                           e.stopPropagation();
                           setHiddenCountries((prev) => {
                              const next = new Set(prev);
                              if (isHidden) next.delete(country);
                              else next.add(country);
                              return next;
                           });
                        }}
                        className="custom_check"
                        style={{
                           background: isHidden ? "transparent" : dotColor,
                           border: `1px solid ${dotColor}`,
                        }}
                     >
                        {!isHidden && <FiCheck size={12} color="#ffffff" />}
                     </span>
                     <span className="country-toggle-title">
                        {country}
                     </span>
                     <span>
                        ({abbreviateNumber(totalUsers)})
                     </span>
                  </button>
               );
            })}
         </div>
      </div>
   );
};

export default UserGeographyChart;