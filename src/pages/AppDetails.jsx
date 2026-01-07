/** @format */

import React, { useContext, useState } from 'react';
import AppDetailsContentBox from '../components/AppDetails/AppDetailsContentBox';
import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import AppSettingsContentBox from '../components/AppSettings/AppSettingsContentBox';
import AppUnitsContentBox from '../components/AdUnitsComponents/AdUnitsContentBox';
import { DataContext } from '../context/DataContext';
import TopBar from '../components/TopBar';

const AppDetails = () => {
  const { appTab, setAppTab } = useContext(DataContext);

  const [appInfo, setAppInfo] = useState([]);
  const appInfoDataFunction = (data) => {
    setAppInfo(data);
  };

  return (
    <>
      <Helmet>
        <title>App Details</title>
      </Helmet>
      <div className='main-wrapper new_parent_wrap'>
        <Sidebar
          appTab={appTab}
          setAppTab={setAppTab}
          appInfoDataFunction={appInfoDataFunction}
        />
        <div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
          <TopBar />
          {appTab.detailsPage && <AppDetailsContentBox appInfo={appInfo} />}
          {appTab.settingPage && <AppSettingsContentBox settingsData={appInfo} />}
          {appTab.unitPage && <AppUnitsContentBox />}
        </div>
      </div>
    </>
  );
};

export default AppDetails;
