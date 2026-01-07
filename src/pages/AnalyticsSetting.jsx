/** @format */

import React from "react";
import Sidebar from "../components/Sidebar";
import { Helmet } from "react-helmet-async";
import AnalyticsSettings from "../components/AnalyticsComponents/AnalyticsSettings";
import TopBar from "../components/TopBar";

const AnalyticsSetting = () => {
    return (
        <>
            <Helmet>
                <title>Analytics</title>
            </Helmet>
            <div className='main-wrapper new_parent_wrap'>
                <Sidebar />
                <div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
                    <TopBar />
                    <AnalyticsSettings />
                </div>
            </div>
        </>
    );
};

export default AnalyticsSetting;
