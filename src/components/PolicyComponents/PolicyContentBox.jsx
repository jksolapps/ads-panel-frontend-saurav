/** @format */

import React, { useContext } from "react";
import Footer from "../Footer";
import { DataContext } from "../../context/DataContext";
import IssuesContentBox from "./IssuesContentBox";
import DisapproveContentBox from "./DisapproveContentBox";

const PolicyContentBox = () => {
  const { policytab, setTabForPolicy } = useContext(DataContext);
  return (
    <div className={`right-box-wrap`}>
      <div className="table-box-wrap main-box-wrapper pdglr24">
        <div className="userBoxWrap user-section-wrapper">
          <div className="button-top-wrap">
            <h1 className="title">Policy Center</h1>
          </div>
          <div className="tab-container ad-units-box user-table-box">
            <div className="tab-top-bar">
              <div
                onClick={() => {
                  setTabForPolicy({
                    IssuesTab: true,
                    DisapproveTab: false,
                  });
                }}
                className={`tab-item ${policytab.IssuesTab && "tab-active"} `}
              >
                Issues
              </div>
              <div
                onClick={() => {
                  setTabForPolicy({
                    IssuesTab: false,
                    DisapproveTab: true,
                  });
                }}
                className={`tab-item ${
                  policytab.DisapproveTab && "tab-active"
                } `}
              >
                Disapproved apps
              </div>
            </div>
            <div className="tab-content">
              {policytab.IssuesTab && <IssuesContentBox />}
              {policytab.DisapproveTab && <DisapproveContentBox />}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default PolicyContentBox;
