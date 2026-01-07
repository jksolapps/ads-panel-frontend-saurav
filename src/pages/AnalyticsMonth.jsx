/** @format */

import React from "react";
import Sidebar from "../components/Sidebar";
import { Helmet } from "react-helmet-async";
import TopBar from "../components/TopBar";
import AnalyticsMonthBox from "../components/AnalyticsMonth/AnalyticsMonthBox";

const AnalyticsMonth = () => {
   return (
      <>
         <Helmet>
            <title>Cohort</title>
         </Helmet>
         <div className='main-wrapper new_parent_wrap'>
            <Sidebar />
            <div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
               <TopBar />
               <AnalyticsMonthBox />
            </div>
         </div>
      </>
   );
};

export default AnalyticsMonth;
