/** @format */

import { LuExternalLink } from 'react-icons/lu';
import PlayStoreIcon from '../../assets/images/playstore.png';
import AppStoreIcon from '../../assets/images/appstore.png';
import { Link } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';
import { useContext } from 'react';

const AppInfoBoxSearchBox = ({
	app_auto_id = '',
	app_icon,
	app_platform,
	app_display_name,
	app_console_name,
	app_store_id,
	paramsId,
	appId,
	setIsAppLoaderVisible = () => { },
	setSearchText,     // optional (kept, but not required)
	setSearchFlag,     // optional (kept, but not required)
	onSelect = () => { }// <- new prop from parent to close dropdown & clear input
}) => {
	const { setAppTab, appTab } = useContext(DataContext);

	const handleParentClick = () => {
		if (!app_auto_id) return;
		if (typeof setSearchText === 'function') setSearchText('');
		if (typeof setSearchFlag === 'function') setSearchFlag(true);
		onSelect(); // <- close list + clear input immediately

		localStorage.setItem('app_auto_id', app_auto_id);
		setAppTab({ detailsPage: true, settingPage: false, unitPage: false });

		if (
			appTab?.detailsPage &&
			paramsId !== appId &&
			window.location.pathname.includes('app-details')
		) {
			setIsAppLoaderVisible({ unitPerformance: true, activityPerformance: true });
		}
	};

	const iconSrc =
		(!app_icon && Number(app_platform) === 2) ? PlayStoreIcon :
			(!app_icon && Number(app_platform) === 1) ? AppStoreIcon :
				app_icon || PlayStoreIcon;

	const detailsTo = app_auto_id ? `/app-details/${app_auto_id}` : '#';

	const storeHref =
		Number(app_platform) === 2
			? `https://play.google.com/store/apps/details?id=${app_store_id}`
			: `https://apps.apple.com/app/${app_store_id}`;

	return (
		<Link to={detailsTo} onClick={handleParentClick} className="app-item custom-app-box" role="link">
			<div className="app-img">
				<img
					loading="lazy"
					aria-hidden="true"
					className={!app_icon ? 'app-icon default-icon' : 'app-icon'}
					src={iconSrc}
				/>
			</div>

			<div className="label-container">
				<div className="primary-label-wrap">
					<div title={app_display_name} className="primary-label">
						<span>{app_display_name}</span>
					</div>

					{app_store_id ? (
						<a
							href={storeHref}
							target="_blank"
							rel="noreferrer"
							className="external-link-icon"
							onClick={(e) => { e.stopPropagation(); onSelect(); }}   // optional: also close on external open
							onMouseDown={(e) => e.stopPropagation()}
						>
							<LuExternalLink />
						</a>
					) : null}
				</div>

				{app_console_name ? (
					<div className="secondary-label-wrap">
						<span>
							<div title={app_console_name} className="primary-label">
								<span className="secondary-label" style={{ cursor: 'pointer', width: 'auto' }}>
									{app_console_name}
								</span>
							</div>
						</span>
					</div>
				) : null}
			</div>
		</Link>
	);
};

export default AppInfoBoxSearchBox;
