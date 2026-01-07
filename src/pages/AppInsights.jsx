/** @format */

import React from "react";
import Sidebar from "../components/Sidebar";
import { Helmet } from "react-helmet-async";
import TopBar from "../components/TopBar";
import AppDashboard from "../components/AppInsightsComponents/AppDashboard";

const AppInsights = () => {
  return (
    <>
      <Helmet>
        <title>Insights</title>
      </Helmet>
      <div className="main-wrapper new_parent_wrap app-insights-page">
        <Sidebar />
        <div className={`custom_right_box ${window.innerWidth < 570 ? "header_show" : ""}`}>
          <TopBar />
          <AppDashboard />
        </div>
      </div>
    </>
  );
};

export default AppInsights;
