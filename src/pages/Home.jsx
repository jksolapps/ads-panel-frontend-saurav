/** @format */

import React from 'react';
import RightContentBox from '../components/HomeComponent/RightContentBox';
import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import TopBar from '../components/TopBar';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>JKSOL Ads</title>
      </Helmet>
      <div className='main-wrapper new_parent_wrap'>
        <Sidebar />
        <div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
          <TopBar />
          <RightContentBox />
        </div>
      </div>
    </>
  );
};

export default Home;
