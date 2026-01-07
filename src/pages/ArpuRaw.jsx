/** @format */

import React from 'react';
import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import TopBar from '../components/TopBar';
import ArpuRawBox from '../components/ArpuRaw/ArpuRawBox';

const ArpuRaw = () => {
   return (
      <>
         <Helmet>
            <title>ARPU Raw</title>
         </Helmet>
         <div className='main-wrapper new_parent_wrap'>
            <Sidebar />
            <div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
               <TopBar />
               <ArpuRawBox />
               {/* <OldArpuRawBox /> */}
            </div>
         </div>
      </>
   );
};

export default ArpuRaw;
