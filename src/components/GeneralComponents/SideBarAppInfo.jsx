/** @format */

import PlayStoreIcon from "../../assets/images/playstore.png";
import AppStoreIcon from "../../assets/images/appstore.png";
import { Link } from "react-router-dom";
import { DataContext } from "../../context/DataContext";
import { useContext } from "react";

const SideBarAppInfo = ({ app_auto_id, app_icon, app_platform, app_display_name, app_console_name, app_store_id, paramsId, appId, setIsAppLoaderVisible }) => {
  const { setAppTab, appTab } = useContext(DataContext);
  return (
    <Link
      to={app_auto_id?.length > 0 ? "/app-details/" + app_auto_id : "#"}
      className="app-item custom-app-box"
      onClick={() => {
        localStorage.setItem("app_auto_id", app_auto_id);
        setAppTab({
          detailsPage: true,
          settingPage: false,
          unitPage: false,
        });
        if (appTab?.detailsPage && paramsId !== appId && window.location.pathname.includes("app-details")) {
          setIsAppLoaderVisible({
            unitPerformance: true,
            activityPerformance: true,
            UserMetricsPerformance: true,
          });
        }
      }}
    >
      <div className="app-img">
        <img
          alt=""
          loading="lazy"
          aria-hidden="true"
          className={app_icon?.length == 0 || app_icon == undefined ? "app-icon default-icon" : "app-icon"}
          src={(app_icon?.length == 0 && app_platform == 2) || app_icon == undefined ? PlayStoreIcon : app_icon?.length == 0 && app_platform == 1 ? AppStoreIcon : app_icon}
        />
      </div>
      <div className="label-container">
        <div className="primary-label-wrap">
          <div title={app_display_name} className="primary-label">
            <span
              onClick={() => {
                localStorage.setItem("app_auto_id", app_auto_id);
                if (appTab?.detailsPage && paramsId !== appId && window.location.pathname.includes("app-details")) {
                  setIsAppLoaderVisible({
                    unitPerformance: true,
                    activityPerformance: true,
                  });
                }
              }}
            >
              {app_display_name}
            </span>
          </div>
          {/* {app_store_id?.length > 0 && (
            <Link
              to={
                app_platform == 2
                  ? `https://play.google.com/store/apps/details?id=${app_store_id}`
                  : `https://apps.apple.com/app/${app_store_id}`
              }
              target="_blank"
              className="external-link-icon"
            >
              <LuExternalLink />
            </Link>
          )} */}
        </div>
        {app_console_name && (
          <div className="secondary-label-wrap">
            <span>
              <div title={app_console_name} className="primary-label">
                <span
                  className="secondary-label"
                  style={{ cursor: "pointer", width: "auto" }}
                  onClick={() => {
                    localStorage.setItem("app_auto_id", app_auto_id);
                    if (appTab?.detailsPage && paramsId !== appId && window.location.pathname.includes("app-details")) {
                      setIsAppLoaderVisible({
                        unitPerformance: true,
                        activityPerformance: true,
                      });
                    }
                  }}
                >
                  {app_console_name}
                </span>
              </div>
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default SideBarAppInfo;
