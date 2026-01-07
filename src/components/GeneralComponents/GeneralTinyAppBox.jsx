/** @format */

import { LuExternalLink } from "react-icons/lu";
import PlayStoreIcon from "../../assets/images/playstore.png";
import AppStoreIcon from "../../assets/images/appstore.png";
import { Link } from "react-router-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const GeneralTinyAppBox = ({
   app_auto_id,
   app_icon,
   app_platform,
   app_display_name,
   app_console_name,
   app_store_id,
   paramsId,
   appTab,
   appId,
   setIsAppLoaderVisible,
}) => {
   return (
      <div className={`app-item custom-app-box custom-tiny-app-box ${window.location.pathname.includes('app-details') ? 'app_active' : ''}`}>
         <Link
            to={app_auto_id?.length > 0 ? "/app-details/" + app_auto_id : "#"}
            className="app-img"
            title={app_display_name}
         >
            <img
               alt=""
               loading="lazy"
               aria-hidden="true"
               className={
                  app_icon?.length == 0 || app_icon == undefined
                     ? "app-icon default-icon"
                     : "app-icon"
               }
               onClick={() => {
                  localStorage.setItem("app_auto_id", app_auto_id);
                  if (
                     appTab?.detailsPage &&
                     paramsId !== appId &&
                     window.location.pathname.includes("app-details")
                  ) {
                     setIsAppLoaderVisible({
                        unitPerformance: true,
                        activityPerformance: true,
                     });
                  }
               }}
               src={
                  (app_icon?.length == 0 && app_platform == 2) ||
                     app_icon == undefined
                     ? PlayStoreIcon
                     : app_icon?.length == 0 && app_platform == 1
                        ? AppStoreIcon
                        : app_icon
               }
            />
         </Link>
         <div className="label-container">
            <div className="primary-label-wrap">
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
                  zIndex={999999}
                  className="custom-tooltip"
               >
                  <Link
                     to={app_auto_id?.length > 0 ? "/app-details/" + app_auto_id : "#"}
                     className="primary-label"
                  >
                     <span
                        onClick={() => {
                           localStorage.setItem("app_auto_id", app_auto_id);
                           if (
                              appTab?.detailsPage &&
                              paramsId !== appId &&
                              window.location.pathname.includes("app-details")
                           ) {
                              setIsAppLoaderVisible({
                                 unitPerformance: true,
                                 activityPerformance: true,
                              });
                           }
                        }}
                     >
                        {app_display_name}
                     </span>
                  </Link>
               </Tippy>

               {app_store_id?.length > 0 && (
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
               )}
            </div>
         </div>
      </div>
   );
};

export default GeneralTinyAppBox;
