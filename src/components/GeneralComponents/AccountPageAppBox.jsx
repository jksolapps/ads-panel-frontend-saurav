/** @format */

import PlayStoreIcon from "../../assets/images/playstore.png";
import AppStoreIcon from "../../assets/images/appstore.png";

const AppInfoBox = ({ app_auto_id, app_icon, app_platform, app_display_name, app_console_name, app_store_id, appTab, paramsId, appId, setIsAppLoaderVisible }) => {
  return (
    <div className="permission-app app-item custom-app-box" style={{ width: "auto" }}>
      <div className="app-img">
        <img
          alt=""
          aria-hidden="true"
          loading="lazy"
          className={app_icon?.length == 0 || app_icon == undefined ? "app-icon default-icon" : "app-icon"}
          src={(app_icon?.length == 0 && app_platform == 2) || app_icon == undefined || app_icon == "" ? PlayStoreIcon : app_icon?.length == 0 && app_platform == 1 ? AppStoreIcon : app_icon}
        />
      </div>
      <div className="label-container">
        <div className="primary-label-wrap">
          <div title={app_display_name} className="primary-label">
            <span>{app_display_name}</span>
          </div>
        </div>
        {app_console_name && (
          <div className="secondary-label-wrap">
            <span>
              <span className="secondary-label" style={{ cursor: "pointer", width: "auto" }}>
                {app_console_name}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppInfoBox;
