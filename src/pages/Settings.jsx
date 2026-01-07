/** @format */

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Helmet } from "react-helmet-async";
import SettingsContentBox from "../components/SettingsComponents/SettingsContentBox";
import TopBar from "../components/TopBar";

const Settings = () => {

  return (
    <>
      <Helmet>
        <title>Settings</title>
      </Helmet>
      <div className="main-wrapper new_parent_wrap profile-page">
        <Sidebar />
        <div className={`custom_right_box ${window.innerWidth < 570 ? "header_show" : ""}`}>
          <TopBar />
          <SettingsContentBox />
        </div>
      </div>
    </>
  );
};

export default Settings;
