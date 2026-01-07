/** @format */

import React, { useState } from "react";
import { MdHelpOutline, MdContentCopy, MdCheckCircle } from "react-icons/md";
import Footer from "../Footer";
import { Spinner } from "react-bootstrap";
import { LuExternalLink } from "react-icons/lu";

const AppSettingsContentBox = ({ settingsData }) => {
  //Copy text
  const [copyAppId, setCopyAppId] = useState("");
  const handleCopyText = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopyAppId(id);
      setTimeout(() => {
        setCopyAppId(null);
      }, 1500);
    } catch (err) {
      throw new Error(err);
    }
  };
  return (
    <div className="right-box-wrap app-setting-wrap">
      <div className="main-box-wrapper pdglr24">
        <div className="main-box-row">
          <div className="top-bar">
            <h1 className="title">App settings</h1>
          </div>
          <div className="info-box-wrap">
            {settingsData?.app_info?.length === 0 ? (
              <div className="shimmer-spinner">
                <Spinner animation="border" variant="secondary" />
              </div>
            ) : (
              <div className="box-wrapper">
                <div className="box">
                  <div className="title-box">
                    <div>
                      App name
                      <div className="tooltip-row">
                        <MdHelpOutline className="material-icons" />
                        <div className="tooltip-box mini-tooltip">
                          <div className="content-container">
                            <h4>App name</h4>
                            <p>The name of your app.</p>
                            <p>
                              If your app is listed on the Google Play or Apple
                              app store, this is automatically populated.&nbsp;
                            </p>
                            <p>
                              <strong>Note</strong>: We recommend matching your
                              app name with the app store listing.&nbsp;&nbsp;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-box">
                    <p className="app_display_name">
                      {settingsData?.app_info?.app_display_name}
                    </p>
                  </div>
                </div>
                <div className="box">
                  <div className="title-box">
                    <div>
                      App ID
                      <div className="tooltip-row">
                        <MdHelpOutline className="material-icons" />
                        <div className="tooltip-box mini-tooltip">
                          <div className="content-container">
                            <h4>App ID</h4>
                            <p>The Id of your app.</p>
                            <p>
                              If your app is listed on the Google Play or Apple
                              app store, this is automatically populated.&nbsp;
                            </p>
                            <p>
                              <strong>Note</strong>: We recommend matching your
                              app Id with the app store listing.&nbsp;&nbsp;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {settingsData?.app_info?.app_admob_app_id?.length > 0 ? (
                    <div className="content-box">
                      <div className="copy-text color-1" id="color-1">
                        <div className="copy" id="copy-1">
                          <button
                            className="copy-btn"
                            onClick={() =>
                              handleCopyText(
                                settingsData?.app_info?.app_admob_app_id
                              )
                            }
                          >
                            <MdContentCopy className="material-icons" />
                            {settingsData?.app_info?.app_admob_app_id}
                          </button>
                          {settingsData?.app_info?.app_admob_app_id ==
                            copyAppId && (
                              <div className="copyMessage">Copied</div>
                            )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    "-"
                  )}
                </div>
                <div className="box">
                  <div className="title-box app-store-details">
                    <div>
                      App store details
                      <div className="tooltip-row">
                        <MdHelpOutline className="material-icons" />
                        <div className="tooltip-box mini-tooltip">
                          <div className="content-container">
                            <h4>App store details</h4>
                            <p>The Id of your App Store.</p>
                            <p>
                              If your app is listed on the Google Play or Apple
                              app store, this is automatically populated.&nbsp;
                            </p>
                            <p>
                              <strong>Note</strong>: We recommend matching your
                              App Store Id with the app store
                              listing.&nbsp;&nbsp;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {settingsData?.app_info?.app_store_id?.length > 0 ? (
                    <div className="content-box">
                      <p>Google Play</p>
                      <div className="copy-link-wrap">
                        <div
                          className="copy-text color-2"
                          id="color-2"
                          onClick={() =>
                            handleCopyText(settingsData?.app_info?.app_store_id)
                          }
                        >
                          <div className="copy" id="copy-2">
                            <button className="copy-btn">
                              <MdContentCopy className="material-icons" />
                              {settingsData?.app_info?.app_store_id}
                            </button>
                            {settingsData?.app_info?.app_store_id ==
                              copyAppId && (
                                <div className="copyMessage">Copied</div>
                              )}
                          </div>
                        </div>
                        <a
                          href={
                            settingsData?.app_info?.app_platform == 2
                              ? `https://play.google.com/store/apps/details?id=${settingsData?.app_info?.app_store_id}`
                              : `https://apps.apple.com/app/${settingsData?.app_info?.app_store_id}`
                          }
                          target="_blank"
                          className="external-link-icon"
                        >
                          <LuExternalLink />
                        </a>
                      </div>
                    </div>
                  ) : (
                    "-"
                  )}
                </div>
                <div className="box">
                  <div className="title-box console-name">
                    <div>
                      Console Name
                      <div className="tooltip-row">
                        <MdHelpOutline className="material-icons" />
                        <div className="tooltip-box mini-tooltip">
                          <div className="content-container">
                            <h4>Console Name</h4>
                            <p>The name of your app.</p>
                            <p>
                              If your app is listed on the Google Play or Apple
                              app store, this is automatically populated.&nbsp;
                            </p>
                            <p>
                              <strong>Note</strong>: We recommend matching your
                              app name with the app store listing.&nbsp;&nbsp;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-box ">
                    <p className="app_display_name">
                      {settingsData?.app_info?.app_console_name
                        ? settingsData?.app_info?.app_console_name
                        : "-"}
                      <a
                        href={
                          settingsData?.app_info?.app_platform == 2
                            ? `https://play.google.com/store/apps/developer?id=${settingsData?.app_info?.app_console_name?.replaceAll(
                              " ",
                              "+"
                            )}`
                            : `https://apps.apple.com/developer/id${settingsData?.app_info?.app_console_name}`
                        }
                        target="_blank"
                        className="external-link-icon"
                      >
                        <LuExternalLink />
                      </a>
                    </p>
                  </div>
                </div>
                <div className="box">
                  <div className="title-box approval-status">
                    <div>
                      Approval status
                      <div className="tooltip-row">
                        <MdHelpOutline className="material-icons" />
                        <div className="tooltip-box mini-tooltip">
                          <div className="content-container">
                            <h4>Approval status</h4>
                            <p>The name of your app.</p>
                            <p>
                              If your app is listed on the Google Play or Apple
                              app store, this is automatically populated.&nbsp;
                            </p>
                            <p>
                              <strong>Note</strong>: We recommend matching your
                              app name with the app store listing.&nbsp;&nbsp;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-box">
                    {settingsData?.app_info?.app_approval_state == 1 ? (
                      <div className="ready">
                        <MdCheckCircle className="material-icons" /> Ready
                      </div>
                    ) : (
                      <div> Pending</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AppSettingsContentBox;
