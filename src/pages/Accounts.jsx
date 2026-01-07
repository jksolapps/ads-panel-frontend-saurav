/** @format */

import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import TopBar from '../components/TopBar';
import Accountpage from '../components/AccountPageComponents/Accountpage';

const Accounts = () => {
  return (
    <>
      <Helmet>
        <title>Accounts</title>
      </Helmet>
      <div className='main-wrapper new_parent_wrap'>
        <Sidebar />
        <div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
          <TopBar />
          <Accountpage />
        </div>
      </div>
    </>
  );
};

export default Accounts;
