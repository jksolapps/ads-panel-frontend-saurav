/** @format */

import React from 'react';
import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import PolicyContentBox from '../components/PolicyComponents/PolicyContentBox';
import TopBar from '../components/TopBar';
const PolicyCenter = () => {
  return (
    <>
      <Helmet>
        <title>Policy Center</title>
      </Helmet>
      <div className='main-wrapper new_parent_wrap'>
        <Sidebar />
        <div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
          <TopBar />
          <PolicyContentBox />
        </div>
      </div>
    </>
  );
};

export default PolicyCenter;
