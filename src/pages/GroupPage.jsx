/** @format */

import React from 'react';
import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import TopBar from '../components/TopBar';
import GroupSettingBox from '../components/GroupSettings/GroupSettingBox';

const GroupPage = () => {
   return (
      <>
         <Helmet>
            <title>Group</title>
         </Helmet>
         <div className='main-wrapper new_parent_wrap'>
            <Sidebar />
            <div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
               <TopBar />
               <GroupSettingBox />
            </div>
         </div>
      </>
   );
};

export default GroupPage;
