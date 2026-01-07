/** @format */

import PlayStoreIcon from "../../assets/images/playstore.png";
import AppStoreIcon from "../../assets/images/appstore.png";
import { useEffect, useRef } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { Link } from "react-router-dom";
import { LuExternalLink } from "react-icons/lu";

const AppInsightsInfoBox = ({
  uniqueIdentifier,
  app_auto_id,
  app_icon,
  app_platform,
  app_display_name,
  app_console_name,
  app_store_id,
  appTab,
  paramsId,
  appId,
  setIsAppLoaderVisible,
  percentageInfo = true,
  isLastRow = false,
}) => {
  const appItemRef = useRef(null);
  const labelContainerRef = useRef(null);
  useEffect(() => {
    if (appItemRef.current && labelContainerRef.current) {
      const labelWidth = labelContainerRef.current.offsetWidth;
      appItemRef.current.style.width = `${labelWidth}px !important`;
    }
  }, [app_display_name, app_console_name, percentageInfo]);


  return (
    <div className={`app-item custom-app-box  ${isLastRow ? "last-app-cell" : ""} `} ref={appItemRef}>
      <Link to={app_auto_id?.length > 0 ? "/single-app-insights/" + app_auto_id : "#"}
        className="app-img"
        title={app_display_name}>
        <img
          alt=""
          aria-hidden="true"
          loading="lazy"
          className={app_icon?.length == 0 || app_icon == undefined ? "app-icon default-icon" : "app-icon"}
          src={(app_icon?.length == 0 && app_platform == 2) || app_icon == undefined || app_icon == "" ? PlayStoreIcon : app_icon?.length == 0 && app_platform == 1 ? AppStoreIcon : app_icon}
        />
      </Link>

      <div className="label-container" ref={labelContainerRef}>
        <div className="primary-label-wrap">
          <div className="primary-label">
            {!percentageInfo ? (
              <Tippy
                content={
                  <div className="copyMessage custom_tooltip_content">
                    <div className="tooltip_left">
                      <img
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className={app_icon?.length == 0 || app_icon == undefined ? "app-icon default-icon" : "app-icon"}
                        src={(app_icon?.length == 0 && app_platform == 2) || app_icon == undefined || app_icon == "" ? PlayStoreIcon : app_icon?.length == 0 && app_platform == 1 ? AppStoreIcon : app_icon}
                      />
                    </div>
                    <div className="tooltip_right">
                      <div className="primary_label">{app_display_name}</div>
                      <div className="secondary_label">{app_console_name}</div>
                    </div>
                  </div>
                }
                placement="top"
                arrow={true}
                duration={0}
                className="custom-tooltip"
              >
                <span className="app-tooltip-display" style={{ cursor: "pointer" }}>
                  {app_display_name}
                </span>
              </Tippy>
            ) : (
              <span className="app-tooltip-display" title={app_display_name}>
                {app_display_name}
              </span>
            )}
          </div>
          {app_store_id?.length > 0 && (
            uniqueIdentifier == "app_insights" ?
              <Link
                to={app_platform == "Android" ? `https://play.google.com/store/apps/details?id=${app_store_id}` : `https://apps.apple.com/app/${app_store_id}`}
                target="_blank"
                className="external-link-icon"
              >
                <LuExternalLink />
              </Link> :
              <Link
                to={app_platform == "2" ? `https://play.google.com/store/apps/details?id=${app_store_id}` : `https://apps.apple.com/app/${app_store_id}`}
                target="_blank"
                className="external-link-icon"
              >
                <LuExternalLink />
              </Link>
          )}
        </div>
        {percentageInfo && app_console_name && (
          <div className="secondary-label-wrap">
            <span>
              <span className="secondary-label" style={{ cursor: "pointer", width: "auto" }} title={percentageInfo && app_console_name}>
                {app_console_name}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppInsightsInfoBox;
