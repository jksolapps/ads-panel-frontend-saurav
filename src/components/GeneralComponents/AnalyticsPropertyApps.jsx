/** @format */

import { Link } from "react-router-dom";
import { DataContext } from "../../context/DataContext";
import { useContext } from "react";

const AnalyticsPropertyApps = ({
    app_auto_id,
    app_icon,
    app_platform,
    app_display_name,
    app_console_name,
    app_store_id,
    paramsId,
    appId,
    setIsAppLoaderVisible,
}) => {
    const {
        setAppTab,
        appTab,
    } = useContext(DataContext);
    return (
        <div className="app-item custom-app-box" onClick={() => {
            setAppTab({
                detailsPage: true,
                settingPage: false,
                unitPage: false,
            })
        }}>
            <Link
                className="app-img"
            >
                <img
                    alt=""
                    loading="lazy"
                    aria-hidden="true"
                    className={
                        app_icon?.length == 0 || app_icon == undefined
                            ? "app-icon "
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
                    src={app_icon}
                />
            </Link>
            <div className="label-container">
                <div className="primary-label-wrap">
                    <Link
                        title={app_display_name}
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

                </div>
                {app_console_name && (
                    <div className="secondary-label-wrap">
                        <span>
                            <Link
                                title={app_console_name}
                                className="primary-label"
                            >
                                <span
                                    className="secondary-label"
                                    style={{ cursor: "pointer" }}
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
                                    {app_console_name}
                                </span>
                            </Link>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPropertyApps;
