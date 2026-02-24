/** @format */

import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
	MdHome,
	MdApps,
	MdAssessment,
	MdOutlineSpeed,
	MdOutlineSmartphone,
	MdSettingsApplications,
	MdOutlineAccountBalance,
	MdOutlineCalendarMonth,
} from 'react-icons/md';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { DataContext } from '../context/DataContext';
import AppInfoBox from './GeneralComponents/AppInfoBox';
import SideBarAppInfo from './GeneralComponents/SideBarAppInfo';
import Profile from '../assets/images/login-icon.webp';
import Swal from 'sweetalert2';
import useUserApi from '../hooks/useUserApi';
import { ReactComponent as AppCostIcon } from '../assets/images/app_cost.svg';
import { ReactComponent as CampaignIcon } from '../assets/images/app_campaign.svg';
import { ReactComponent as MetricsIcon } from '../assets/images/app_metrics.svg';
import { ReactComponent as RetentionIcon } from '../assets/images/app_retention.svg';
import { ReactComponent as AnalyticsIcon } from '../assets/images/app_analytics.svg';
import { ReactComponent as RetentionPlusPlusIcon } from '../assets/images/retention_pp.svg';
import { ReactComponent as AllInOneIcon } from '../assets/images/app_all_in_one.svg';
import { ReactComponent as MonthlyAnalyticsIcon } from '../assets/images/monthly_analytics.svg';
import Tippy from '@tippyjs/react';
import { useAppList } from '../context/AppListContext';
import { useQueryFetch } from '../hooks/useQueryFetch';
import SidebarProfile from './GeneralComponents/SidebarProfile';
import { useQueryClient } from '@tanstack/react-query';
import { useGroupSettings } from '../context/GroupSettingsContext';
import { makeGroupLogo, splitGroups } from '../utils/domHelper';
import { GeneralTooltip } from '../ui/tooltip';

function formatGroupTooltip(groupName) {
	const groups = splitGroups(groupName);
	if (groups.length === 0) return '';
	return (
		<div className='group-tooltip'>
			<div className='group-tooltip-list'>
				{groups.map((g, i) => (
					<div key={`${g}-${i}`} className='group-tooltip-item'>
						{groups.length > 1 ? `${i + 1}.` : ''} {g}
					</div>
				))}
			</div>
		</div>
	);
}

const Sidebar = ({ appInfoDataFunction }) => {
	const queryClient = useQueryClient();
	const {
		role,
		sidebarSelectApp,
		setSidebarSelectApp,
		setIsGuideVisible,
		setIsAppLoaderVisible,
		setAppTab,
		appTab,
		setData,
		setGuideStart,
	} = useContext(DataContext);

	const { selectedGroup, groupName } = useGroupSettings();
	const [sidebarApp, setSidebarApp] = useState([]);
	const [newSelectedApp, setNewSelectedApp] = useState('');
	const [SidbarApp, sortedSidbarApp] = useState([]);

	const { id } = useParams();
	const location = useLocation();
	const navigate = useNavigate();

	const userId = localStorage.getItem('id') || '';
	const token = localStorage.getItem('token') || '';

	const { appList } = useAppList();

	const MENU_ITEMS = useMemo(
		() => [
			{
				key: 'home',
				label: 'Home',
				to: '/',
				Icon: MdHome,
				show: true,
				extraClass: '',
				onLabelClick: () => setData(false),
			},
			{
				key: 'apps',
				type: 'apps-popup', // special rendering
				label: 'Apps',
				to: '/apps',
				Icon: MdApps,
				show: true,
			},
			{
				key: 'accounts',
				label: 'Accounts',
				to: '/accounts',
				Icon: MdOutlineAccountBalance,
				show: role == 1,
				extraClass: 'report-nav',
			},
			{
				key: 'reports',
				label: 'Reports',
				to: '/reports',
				Icon: MdAssessment,
				show: true,
				extraClass: 'report-nav report-sidebar',
			},
		],
		[role, setData]
	);

	const ADMIN_REPORT_ITEMS = useMemo(
		() => [
			{
				key: 'insights',
				label: ' Insights',
				to: '/app-insights',
				Icon: MetricsIcon,
				iconClass: 'sidebar_icon new_icon matrix_icon',
				extraClass: 'report-nav report-sidebar',
			},
			{
				key: 'analytics',
				label: 'Analytics',
				to: '/analytics',
				Icon: AnalyticsIcon,
				iconClass: 'sidebar_icon new_icon',
				extraClass: 'report-nav',
				linkId: 'analyticsElement',
			},
			{
				key: 'cohort',
				label: 'Cohort',
				to: '/cohort',
				Icon: MonthlyAnalyticsIcon,
				iconClass: 'sidebar_icon new_icon',
				extraClass: 'report-nav',
				linkId: 'analyticsElement',
			},
			{
				key: 'heatmap',
				label: 'Heatmap',
				to: '/heatmap',
				Icon: MdOutlineCalendarMonth,
				iconClass: 'sidebar_icon',
				extraClass: 'report-nav report-sidebar',
			},
			{
				key: 'arpu',
				label: 'ARPU',
				to: '/arpu',
				Icon: RetentionPlusPlusIcon,
				iconClass: 'sidebar_icon new_icon',
				extraClass: 'report-nav report-sidebar',
			},
			{
				key: 'arpu-raw',
				label: 'ARPU Raw',
				to: '/arpu-raw',
				Icon: AllInOneIcon,
				iconClass: 'sidebar_icon new_icon',
				extraClass: 'report-nav report-sidebar',
			},
			{
				key: 'apps-cost',
				label: 'App Cost',
				to: '/apps-cost',
				Icon: AppCostIcon,
				iconClass: 'sidebar_icon new_icon',
				extraClass: 'report-nav',
			},
			{
				key: 'campaign',
				label: 'Campaign',
				to: '/campaign',
				Icon: CampaignIcon,
				iconClass: 'sidebar_icon new_icon',
				extraClass: 'report-nav report-sidebar',
			},
			{
				key: 'retention',
				label: 'Retention',
				to: '/retention',
				Icon: RetentionIcon,
				iconClass: 'sidebar_icon new_icon',
				extraClass: 'report-nav report-sidebar',
			},
		],
		[]
	);
	useEffect(() => {
		if (!appList) return;
		const list = appList?.aaData ?? appList;
		setSidebarApp(list);
		setSidebarSelectApp(list);
	}, [appList, setSidebarSelectApp]);

	const appInfoFormData = useMemo(() => {
		const formData = new FormData();
		formData.append('user_id', userId);
		formData.append('user_token', token);
		formData.append('app_auto_id', id);
		return formData;
	}, [id, userId, token]);

	const { data: appInfoData, isSuccess: isInfoSuccess } = useQueryFetch(
		['app-info-data', id],
		'app-info',
		appInfoFormData,
		{
			enabled: !!id,
			staleTime: 1000 * 60,
			refetchOnMount: 'ifStale',
		}
	);

	useEffect(() => {
		if (!isInfoSuccess || !appInfoData) return;
		setNewSelectedApp(appInfoData?.app_info);
		appInfoDataFunction(appInfoData);
	}, [isInfoSuccess, appInfoData, appInfoDataFunction]);

	useEffect(() => {
		const onGestureStart = (e) => e.preventDefault();
		document.addEventListener('gesturestart', onGestureStart, { passive: false });
		return () => document.removeEventListener('gesturestart', onGestureStart);
	}, []);

	const useLocalStorage = (key, initialValue) => {
		const [value, setValue] = useState(() => {
			const storedValue = localStorage.getItem(key);
			return storedValue ? JSON.parse(storedValue) : initialValue;
		});

		useEffect(() => {
			localStorage.setItem(key, JSON.stringify(value));
		}, [key, value]);

		return [value, setValue];
	};

	const app_id = localStorage.getItem('app_auto_id');
	const [selectedIds, setSelectedIds] = useLocalStorage('selectedIds', []);
	const prevAppIdRef = useRef(null);

	useEffect(() => {
		if (prevAppIdRef.current !== app_id) {
			if (!selectedIds.includes(app_id)) {
				setSelectedIds([app_id, ...selectedIds]);
			} else {
				const index = selectedIds.findIndex((x) => x === app_id);
				const reorderedIds = [
					selectedIds[index],
					...selectedIds.slice(0, index),
					...selectedIds.slice(index + 1),
				];
				setSelectedIds(reorderedIds);
			}
			prevAppIdRef.current = app_id;
		}
	}, [app_id, selectedIds, setSelectedIds]);

	useEffect(() => {
		// if (!sidebarSelectApp) return;
		// if (!Array.isArray(sidebarSelectApp)) return;
		if (!Array.isArray(sidebarSelectApp) || !Array.isArray(selectedIds)) return;

		const presentInSelectedIds = sidebarSelectApp?.filter((item) =>
			selectedIds.includes(item.app_auto_id)
		);
		const notInSelectedIds = sidebarSelectApp?.filter(
			(item) => !selectedIds.includes(item.app_auto_id)
		);

		const orderedPresentInSelectedIds = selectedIds?.flatMap((sid) =>
			presentInSelectedIds.filter((item) => item.app_auto_id === sid)
		);

		const resultArray = [...orderedPresentInSelectedIds, ...notInSelectedIds];
		sortedSidbarApp(resultArray);
	}, [sidebarSelectApp, app_id, selectedIds]);

	const faviconLink = document.querySelector("link[rel='icon']") || document.createElement('link');

	useEffect(() => {
		faviconLink.rel = 'icon';
		faviconLink.href = '/favicon_jk.ico';
		document.head.appendChild(faviconLink);
	}, []);

	const getLogoutIconHtml = () => {
		return `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M255.15 468.625H63.787c-11.737 0-21.262-9.526-21.262-21.262V64.638c0-11.737 9.526-21.262 21.262-21.262H255.15c11.758 0 21.262-9.504 21.262-21.262S266.908.85 255.15.85H63.787C28.619.85 0 29.47 0 64.638v382.724c0 35.168 28.619 63.787 63.787 63.787H255.15c11.758 0 21.262-9.504 21.262-21.262 0-11.758-9.504-21.262-21.262-21.262z" fill="#9a9a9a" opacity="1" data-original="#9a9a9a"></path><path d="M505.664 240.861 376.388 113.286c-8.335-8.25-21.815-8.143-30.065.213s-8.165 21.815.213 30.065l92.385 91.173H191.362c-11.758 0-21.262 9.504-21.262 21.262 0 11.758 9.504 21.263 21.262 21.263h247.559l-92.385 91.173c-8.377 8.25-8.441 21.709-.213 30.065a21.255 21.255 0 0 0 15.139 6.336c5.401 0 10.801-2.041 14.926-6.124l129.276-127.575A21.303 21.303 0 0 0 512 255.998c0-5.696-2.275-11.118-6.336-15.137z" fill="#9a9a9a" opacity="1" data-original="#9a9a9a"></path></g></svg>`;
	};

	const handleSignOut = async () => {
		try {
			const logoutData = new FormData();
			logoutData.append('user_id', localStorage.getItem('id'));
			logoutData.append('user_token', localStorage.getItem('token'));
			const response = await useUserApi('web-logout', logoutData);

			if (response.status_code) {
				faviconLink.rel = 'icon';
				faviconLink.href = '/favicon_jk.ico';
				document.head.appendChild(faviconLink);
			}
			return response.status_code;
		} catch (error) {
			return 0;
		}
	};

	const handleAlert = () => {
		Swal.fire({
			title: 'Are you sure you want to logout?',
			width: 450,
			iconHtml: getLogoutIconHtml(),
			focusConfirm: false,
			showCancelButton: true,
			confirmButtonColor: '#1967d2',
			cancelButtonColor: '#5f6368',
			confirmButtonText: 'Yes',
			customClass: {
				popup: 'custom_logout_modal',
			},
			allowOutsideClick: () => !Swal.isLoading(),
			preConfirm: async () => {
				const confirmButton = Swal.getConfirmButton();
				confirmButton.innerHTML = `<div class="logout_spinner"></div>`;
				const apiStatus = await handleSignOut();

				if (apiStatus === 1) {
					(function clearLocalStorageExcept() {
						const preserveKeys = new Set([
							'isSwitchBoxlocal',
							'visibilityState',
							'isPercentageCheck',
							'dashboard_view_type',
							'isAppInsightsPercentageCheck',
							'theme',
							'id',
							'main_app_group',
						]);

						for (let i = localStorage.length - 1; i >= 0; i--) {
							const key = localStorage.key(i);
							if (!preserveKeys.has(key)) localStorage.removeItem(key);
						}
					})();

					queryClient.clear();
					sessionStorage.clear();
					setGuideStart(false);
					setIsGuideVisible(false);
					navigate('/login');
				} else {
					Swal.showValidationMessage('Please try again');
				}
			},
		});
	};

	const [visible, setVisible] = useState(false);
	const show = () => setVisible(true);
	const hide = () => setVisible(false);

	const [visibleTwo, setVisibleTwo] = useState(false);
	const showTwo = () => setVisibleTwo(true);
	const hideTwo = () => setVisibleTwo(false);

	const isPathActive = (to) => location.pathname === to;
	const getLinkClass = (baseClass, extraClass, active) => {
		const a = active ? 'active' : '';
		const e = extraClass ? extraClass : '';
		return `${baseClass} ${e} ${a}`.trim();
	};

	const renderStandardLink = (item) => {
		const { key, to, label, Icon, extraClass, linkId, onLabelClick } = item;
		const active = isPathActive(to);

		return (
			<Link key={key} to={to} id={linkId} className={getLinkClass('section-menu', extraClass, active)}>
				<Icon className='sidebar_icon' />
				<span className='menu-item-label' onClick={onLabelClick}>
					{label}
				</span>
			</Link>
		);
	};

	const renderAdminLink = (item) => {
		const { key, to, label, Icon, extraClass, iconClass, linkId } = item;
		const active = isPathActive(to);

		return (
			<Link key={key} to={to} id={linkId} className={getLinkClass('section-menu', extraClass, active)}>
				<Icon className={iconClass || 'sidebar_icon'} />
				<span className='menu-item-label'>{label}</span>
			</Link>
		);
	};

	const groupLogo = useMemo(() => makeGroupLogo(groupName), [groupName]);
	const groupTooltipContent = useMemo(() => formatGroupTooltip(groupName), [groupName]);

	return (
		<>
			<div className={`sidebar-wrap ${window.innerWidth > 569 ? 'open-menu' : ''}`}>
				<div className='sidebar-menu'>
					<div className='logo-menu-box'>
						<Link to='/'>
							{selectedGroup ? (
								<GeneralTooltip
									content={groupTooltipContent}
									placement='right'
									arrow={false}
									bg='#fff'
									textColor='#3c4043'
									maxWidth={240}
									offsetPx={groupLogo?.count == 3 ? 15 : 24}
									padding='6px'
								>
									{groupLogo?.element}
								</GeneralTooltip>
							) : (
								<img src={Profile} alt='logo' />
							)}
						</Link>
					</div>

					<div className='sidebar-open'>
						<div className='menu-box'>
							{MENU_ITEMS.map((item) => {
								if (!item.show) return null;

								if (item.type === 'apps-popup') {
									return (
										<div key={item.key} className='menu-popup-box'>
											<Tippy
												content={
													<div className='tippy_content_submenu' onClick={hide} style={{
											overflow: 'hidden'
										}}>
														{SidbarApp?.length === 0 ? (
															<div className='app-list no-data-found'>
																<div className='app-item'>
																	<div className='label-container'>
																		<span className='primary-label'>No App Found</span>
																	</div>
																</div>
															</div>
														) : (
																SidbarApp
																	?.filter(app => Number(app?.app_visibility) === 1)
																	?.slice(0, 5)
																	?.map((app) => (
																<div className='app-list' key={app?.increment_id}>
																	<SideBarAppInfo
																		app_auto_id={app?.app_auto_id}
																		app_icon={app?.app_icon}
																		app_platform={app?.app_platform}
																		app_display_name={app?.app_display_name}
																		app_console_name={app?.app_console_name}
																		app_store_id={app?.app_store_id}
																		appTab={appTab}
																		paramsId={id}
																		appId={app?.app_auto_id}
																		setIsAppLoaderVisible={setIsAppLoaderVisible}
																	/>
																</div>
															))
														)}

														{sidebarApp?.length > 0 && (
															<div className='popup-footer'>
																<div className='app-picker-footer'>
																	<Link to='/apps' className='d-content-btn view-all-app'>
																		View all apps
																	</Link>
																</div>
															</div>
														)}
													</div>
												}
												placement='right-start'
												interactive={true}
												visible={visible}
												onClickOutside={hide}
												appendTo={() => document.body}
												className='side_bar_tippy'
											>
												<div
													onClick={visible ? hide : show}
													className={
														isPathActive('/apps')
															? 'section-menu active with-submenu'
															: 'section-menu with-submenu'
													}
												>
													<MdApps className='sidebar_icon active' />
													<span className='menu-item-label'>Apps</span>
												</div>
											</Tippy>

											{/* {newSelectedApp && !location.pathname.includes('single-app-insights') && (
												<Tippy
													content={
														<div className='custom_extra_menu_wrapper tippy_extra_submenu'>
															<div className='custom_extra_menu' onClick={hideTwo}>
																<Link
																	onClick={() => {
																		setAppTab({
																			detailsPage: true,
																			settingPage: false,
																			unitPage: false,
																		});
																	}}
																	className={appTab?.detailsPage ? 'section-menu active' : 'section-menu'}
																>
																	<MdOutlineSpeed className='material-icons' />
																	<span className='menu-item-label'>App Overview</span>
																</Link>

																<Link
																	onClick={() => {
																		setAppTab({
																			detailsPage: false,
																			settingPage: false,
																			unitPage: true,
																		});
																	}}
																	className={appTab.unitPage ? 'section-menu active' : 'section-menu'}
																>
																	<MdOutlineSmartphone className='material-icons' />
																	<span className='menu-item-label'>Ad Units</span>
																</Link>

																<Link
																	onClick={() => {
																		setAppTab({
																			detailsPage: false,
																			settingPage: true,
																			unitPage: false,
																		});
																	}}
																	className={appTab.settingPage ? 'section-menu active' : 'section-menu'}
																>
																	<MdSettingsApplications className='material-icons' />
																	<span className='menu-item-label'>App Settings</span>
																</Link>
															</div>
														</div>
													}
													placement='right-start'
													interactive={true}
													visible={visibleTwo}
													onClickOutside={hideTwo}
													appendTo={() => document.body}
												>
													<div className='sub-menu-box' onClick={visibleTwo ? hideTwo : showTwo}>
														<AppInfoBox
															app_auto_id={newSelectedApp?.app_auto_id}
															app_icon={newSelectedApp?.app_icon}
															app_platform={newSelectedApp?.app_platform}
															app_display_name={newSelectedApp?.app_display_name}
															app_console_name={newSelectedApp?.app_console_name}
															app_store_id={newSelectedApp?.app_store_id}
														/>
													</div>
												</Tippy>
											)} */}
										</div>
									);
								}
								return renderStandardLink(item);
							})}

							{role == 1 && (
								<div className='section-container'>{ADMIN_REPORT_ITEMS.map(renderAdminLink)}</div>
							)}
							<SidebarProfile handleAlert={handleAlert} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Sidebar;
