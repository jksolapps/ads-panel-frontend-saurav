/** @format */

import React from 'react';
import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import TopBar from '../components/TopBar';
import ArpuMainBox from '../components/ArpuMain/ArpuMainBox';

const ArpuMain = () => {
   return (
      <>
         <Helmet>
            <title>ARPU</title>
         </Helmet>
         <div className='main-wrapper new_parent_wrap'>
            <Sidebar />
            <div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
               <TopBar />
               <ArpuMainBox />
            </div>
         </div>
      </>
   );
};

export default ArpuMain;
