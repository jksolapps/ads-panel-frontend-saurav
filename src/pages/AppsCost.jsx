/** @format */

import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import AppsCostBox from '../components/AppsCost/AppsCostBox';
import TopBar from '../components/TopBar';

const AppsCost = () => {
  return (
    <>
      <Helmet>
        <title>Apps Cost</title>
      </Helmet>
      <div className='main-wrapper new_parent_wrap general-wrapper'>
        <Sidebar />
        <div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
          <TopBar />
          <AppsCostBox />
        </div>
      </div>
    </>
  );
};

export default AppsCost;
