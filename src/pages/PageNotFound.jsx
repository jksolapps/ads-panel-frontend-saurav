/** @format */

import React from "react";
import Sidebar from "../components/Sidebar";
import { Helmet } from "react-helmet-async";
import TopBar from "../components/TopBar";

const PageNotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found</title>
      </Helmet>
      <div className="main-wrapper new_parent_wrap">
        <Sidebar />
        <div className={`custom_right_box ${window.innerWidth < 570 ? "header_show" : ""}`}>
          <TopBar />
          <div className="right-box-wrap">
            <div className="table-box-wrap main-box-wrapper pdglr24 not-found-wrap">
              <div className="userBoxWrap user-section-wrapper">
                <div className="button-top-wrap">
                  <h1 className="title">Page Not Found</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageNotFound;
