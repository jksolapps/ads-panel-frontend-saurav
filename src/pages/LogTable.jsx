/** @format */

import React from 'react';
import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import LogTableBox from '../components/LogTable/LogTableBox';
import TopBar from '../components/TopBar';

const LogTable = () => {
   return (
      <>
         <Helmet>
            <title>Log Table</title>
         </Helmet>
         <div className='main-wrapper new_parent_wrap'>
            <Sidebar />
            <div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
               <TopBar />
               <LogTableBox />
            </div>
         </div>
      </>
   );
};

export default LogTable;
