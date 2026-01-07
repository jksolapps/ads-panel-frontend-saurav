import React, { useRef, useEffect } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import { formatValue, indianNumberFormat } from "../../utils/helper";

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default function CanvasChartItem({
    chartData,
    performanceSelect,
    overviewSelect,
}) {
    const chartRefs = useRef([null, null, null]);

    const isHovering = useRef(false);

    const handleMouseOut = () => {
        if (!isHovering.current) return; // Prevent unnecessary hiding on initial render
        isHovering.current = false;
        for (let i = 0; i < chartRefs.current.length; i++) {
            chartRefs.current[i].toolTip.hide();

        }
    };

    const showTooltip = (e) => {
        isHovering.current = true;
        for (let i = 0; i < chartRefs.current.length; i++) {
            if (chartRefs.current[i] !== e.chart) {
                chartRefs.current[i].toolTip.showAtX(e.entries[0].xValue);
            }
        }
    };

    const toggleDataSeries = (e) => {
        if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
    };

    const formatValueLabel = (value) => {
        if (performanceSelect === "impressions") {
            if (value >= 1e9) {
                return value / 1e9 + "B";
            } else if (value >= 1e6) {
                return value / 1e6 + "M";
            } else if (value >= 1e3) {
                return value / 1e3 + "K";
            } else {
                return value;
            }
        } else if (performanceSelect === "match_rate") {
            return value + "%";
        }
        if (value >= 1e9) {
            return "$" + value / 1e9 + "B";
        } else if (value >= 1e6) {
            return "$" + value / 1e6 + "M";
        } else if (value >= 1e3) {
            return "$" + value / 1e3 + "K";
        } else {
            return "$" + value;
        }
    };

    let CustomlabelAngle = 0;
    let Conditonalinterval = 1;

    if (performanceSelect === "rev_ecpm_imp" && Number(overviewSelect) > 3) {
        CustomlabelAngle = -60;
        Conditonalinterval = 2;
    }

    const commonYDataConfig = {
        includeZero: true,
        gridColor: "#dadce0",
        gridThickness: 1,
        tickThickness: 0,
        lineThickness: 0,
        labelFormatter: (e) => formatValueLabel(e.value),
    };


    const options1 = {
        animationDuration: 1500,
        height: 200,
        animationEnabled: true,
        backgroundColor: "#fff",
        dataPointMaxWidth: 30,
        toolTip: {
            shared: true,
            content: (e) => {
                const dataPoint = e.entries;
                dataPoint.sort((a, b) => b.dataPoint.y - a.dataPoint.y);
                let totalRevenue = 0;
                dataPoint.forEach((entry) => {
                    totalRevenue += entry.dataPoint.y || 0;
                });
                const date = dataPoint[0].dataPoint.x;
                const day = date.getDate();
                const getDay = date.getDay();
                const daysOfWeek = [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                ];
                const dayName = daysOfWeek[getDay];
                const month = date.toLocaleString("en", { month: "long" });
                const year = date.getFullYear();
                const formattedDate = `${day} ${month + ","} ${year}`;
                const formattedDay = `${dayName}`;
                let tooltipContent = `<div class='tooltip-date'> ${performanceSelect === "revenue" ||
                    performanceSelect === "impressions" ||
                    performanceSelect === "ecpm" ||
                    performanceSelect === "match_rate"
                    ? formattedDay
                    : formattedDate
                    }</div>`;
                dataPoint.forEach((entry) => {
                    const revenue = entry.dataPoint.y || 0;
                    const percentage =
                        performanceSelect === "rev_ecpm_imp"
                            ? ""
                            : Math.floor((revenue / totalRevenue) * 100);
                    tooltipContent += `
                        <div class='toolbox-inner'>
                            <div class='toolbox-value'>
                                <div class='country-label'>
                                    <span class='country-box' style='background-color: ${entry.dataSeries.color
                        }'></span>
                                    <span class='country-name'>${entry.dataPoint.name
                            ? entry.dataPoint.name
                            : "-"
                        }</span>
                                </div>
                                <div>
                                    <span class='primary-percentage-label'>${revenue
                            ? indianNumberFormat(
                                formatValue(revenue)
                            )
                            : "$0"
                        }</span>
                                    <span class='secondary-percentage-label ${performanceSelect === "rev_ecpm_imp"
                            ? "rev_ecpm_imp"
                            : ""
                        }'>${performanceSelect === "match_rate" ? "" : "(" + percentage + "% )"
                        }</span>
                                </div>
                            </div>
                        </div>
                    `;
                });

                return tooltipContent;
            },
            updated: showTooltip,
        },
        legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries,
            fontSize: 11,
            fontFamily: "verdana",
            fontWeight: "lighter",
        },
        axisY: commonYDataConfig,
        axisX: {
            crosshair: {
                enabled: true,
                opacity: 0.4,
                label: ''
            },
            gridThickness: 0,
            tickThickness: 0,
            lineThickness: 0,
            interval: Conditonalinterval,
            labelAngle: CustomlabelAngle,
            intervalType: "day",
            labelFormatter: (e) => {
                const date = new Date(e.value);
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                if (year === new Date().getFullYear()) {
                    return `${day}.${month}`;
                } else {
                    return `${day}.${month}.${year}`;
                }
            },
            mouseout: handleMouseOut,
        },
        data: chartData.slice(0, 1),
    };
    const options2 = {
        animationDuration: 1500,
        height: 200,
        animationEnabled: true,
        backgroundColor: "#fff",
        dataPointMaxWidth: 30,
        toolTip: {
            shared: true,
            content: (e) => {
                const dataPoint = e.entries;
                dataPoint.sort((a, b) => b.dataPoint.y - a.dataPoint.y);
                let totalRevenue = 0;
                dataPoint.forEach((entry) => {
                    totalRevenue += entry.dataPoint.y || 0;
                });
                const date = dataPoint[0].dataPoint.x;
                const day = date.getDate();
                const getDay = date.getDay();
                const daysOfWeek = [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                ];
                const dayName = daysOfWeek[getDay];
                const month = date.toLocaleString("en", { month: "long" });
                const year = date.getFullYear();
                const formattedDate = `${day} ${month + ","} ${year}`;
                const formattedDay = `${dayName}`;
                let tooltipContent = `<div class='tooltip-date'> ${performanceSelect === "revenue" ||
                    performanceSelect === "impressions" ||
                    performanceSelect === "ecpm" ||
                    performanceSelect === "match_rate"
                    ? formattedDay
                    : formattedDate
                    }</div>`;
                dataPoint.forEach((entry) => {
                    const revenue = entry.dataPoint.y || 0;
                    const percentage =
                        performanceSelect === "rev_ecpm_imp"
                            ? ""
                            : Math.floor((revenue / totalRevenue) * 100);
                    tooltipContent += `
                        <div class='toolbox-inner'>
                            <div class='toolbox-value'>
                                <div class='country-label'>
                                    <span class='country-box' style='background-color: ${entry.dataSeries.color
                        }'></span>
                                    <span class='country-name'>${entry.dataPoint.name
                            ? entry.dataPoint.name
                            : "-"
                        }</span>
                                </div>
                                <div>
                                    <span class='primary-percentage-label'>${revenue
                            ? indianNumberFormat(
                                formatValue(revenue)
                            )
                            : "$0"
                        }</span>
                                    <span class='secondary-percentage-label ${performanceSelect === "rev_ecpm_imp"
                            ? "rev_ecpm_imp"
                            : ""
                        }'>${performanceSelect === "match_rate" ? "" : "(" + percentage + "% )"
                        }</span>
                                </div>
                            </div>
                        </div>
                    `;
                });

                return tooltipContent;
            },
            updated: showTooltip,
        },
        legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries,
            fontSize: 11,
            fontFamily: "verdana",
            fontWeight: "lighter",
        },
        axisY: commonYDataConfig,
        axisX: {
            crosshair: {
                enabled: true,
                opacity: 0.4,
                label: ''
            },
            gridThickness: 0,
            tickThickness: 0,
            lineThickness: 0,
            interval: Conditonalinterval,
            labelAngle: CustomlabelAngle,
            intervalType: "day",
            labelFormatter: (e) => {
                const date = new Date(e.value);
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                if (year === new Date().getFullYear()) {
                    return `${day}.${month}`;
                } else {
                    return `${day}.${month}.${year}`;
                }

            },
            mouseout: handleMouseOut,
        },
        data: chartData.slice(1, 2),
    };
    const options3 = {
        animationDuration: 1500,
        height: 200,
        animationEnabled: true,
        backgroundColor: "#fff",
        dataPointMaxWidth: 30,
        toolTip: {
            shared: true,
            content: (e) => {
                const dataPoint = e.entries;
                dataPoint.sort((a, b) => b.dataPoint.y - a.dataPoint.y);
                let totalRevenue = 0;
                dataPoint.forEach((entry) => {
                    totalRevenue += entry.dataPoint.y || 0;
                });
                const date = dataPoint[0].dataPoint.x;
                const day = date.getDate();
                const getDay = date.getDay();
                const daysOfWeek = [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                ];
                const dayName = daysOfWeek[getDay];
                const month = date.toLocaleString("en", { month: "long" });
                const year = date.getFullYear();
                const formattedDate = `${day} ${month + ","} ${year}`;
                const formattedDay = `${dayName}`;
                let tooltipContent = `<div class='tooltip-date'> ${performanceSelect === "revenue" ||
                    performanceSelect === "impressions" ||
                    performanceSelect === "ecpm" ||
                    performanceSelect === "match_rate"
                    ? formattedDay
                    : formattedDate
                    }</div>`;
                dataPoint.forEach((entry) => {
                    const revenue = entry.dataPoint.y || 0;
                    const percentage =
                        performanceSelect === "rev_ecpm_imp"
                            ? ""
                            : Math.floor((revenue / totalRevenue) * 100);
                    tooltipContent += `
                        <div class='toolbox-inner'>
                            <div class='toolbox-value'>
                                <div class='country-label'>
                                    <span class='country-box' style='background-color: ${entry.dataSeries.color
                        }'></span>
                                    <span class='country-name'>${entry.dataPoint.name
                            ? entry.dataPoint.name
                            : "-"
                        }</span>
                                </div>
                                <div>
                                    <span class='primary-percentage-label'>${revenue
                            ? indianNumberFormat(
                                formatValue(revenue)
                            )
                            : "$0"
                        }</span>
                                    <span class='secondary-percentage-label ${performanceSelect === "rev_ecpm_imp"
                            ? "rev_ecpm_imp"
                            : ""
                        }'>${performanceSelect === "match_rate" ? "" : "(" + percentage + "% )"
                        }</span>
                                </div>
                            </div>
                        </div>
                    `;
                });

                return tooltipContent;
            },
            updated: showTooltip,
        },
        legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries,
            fontSize: 11,
            fontFamily: "verdana",
            fontWeight: "lighter",
        },
        axisY: commonYDataConfig,
        axisX: {
            crosshair: {
                enabled: true,
                opacity: 0.4,
                label: ''
            },
            gridThickness: 0,
            tickThickness: 0,
            lineThickness: 0,
            interval: Conditonalinterval,
            labelAngle: CustomlabelAngle,
            intervalType: "day",
            labelFormatter: (e) => {
                const date = new Date(e.value);
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                if (year === new Date().getFullYear()) {
                    return `${day}.${month}`;
                } else {
                    return `${day}.${month}.${year}`;
                }
            },
            mouseout: handleMouseOut,
        },
        data: chartData.slice(2, 3),
    };

    useEffect(() => {
        window.addEventListener("mouseout", handleMouseOut);
        return () => window.removeEventListener("mouseout", handleMouseOut);
    }, []);

    return (
        <div>
            <CanvasJSChart
                options={options1}
                onRef={(ref) => (chartRefs.current[0] = ref)}

            />
            <CanvasJSChart
                options={options2}
                onRef={(ref) => (chartRefs.current[1] = ref)}

            />
            <CanvasJSChart
                options={options3}
                onRef={(ref) => (chartRefs.current[2] = ref)}

            />

        </div>
    );
}