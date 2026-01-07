/** @format */

import React, { useState, useEffect, useMemo } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import AccountPageAppBox from '../GeneralComponents/AccountPageAppBox';
import { IoCloseOutline } from 'react-icons/io5';
import PlayStoreIcon from '../../assets/images/playstore.png';
import AppStoreIcon from '../../assets/images/appstore.png';
import { useLocation, useNavigate } from 'react-router-dom';
import EmptyListBox from '../GeneralComponents/EmptyListBox';
import { useGroupSettings } from '../../context/GroupSettingsContext';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/Popover';

const STORAGE_KEY = (id) => `${id}_app_filter`;

const GeneralSingleAppFilter = ({
	uniqueIdentifier,
	filterAppList,
	selectedApp,
	setSelectedApp,
	setMainLoader = () => {},
	setIsDateClicked,
}) => {
	const { state } = useLocation();
	const { selectedGroup } = useGroupSettings();
	const navigate = useNavigate();

	const [searchText, setSearchText] = useState('');
	const [pendingSelection, setPendingSelection] = useState(() => selectedApp || []);

	useEffect(() => {
		setPendingSelection(selectedApp || []);
	}, [selectedApp]);

	useEffect(() => {
		if (!filterAppList || filterAppList.length === 0) {
			if (pendingSelection.length > 0 || selectedApp.length > 0) {
				setPendingSelection([]);
				setSelectedApp([]);
				sessionStorage.removeItem(STORAGE_KEY(uniqueIdentifier));
			}
			return;
		}

		const apps = filterAppList;
		let initial = null;

		// 1) Deep link from route state
		if (
			state &&
			state.app_auto_id &&
			(uniqueIdentifier === 'heatmap' || uniqueIdentifier === 'retention_raw')
		) {
			const match = apps.find((a) => a.app_auto_id == state.app_auto_id);
			if (match) {
				initial = [match];
				if (uniqueIdentifier === 'heatmap') {
					navigate('/heatmap', { replace: true });
				} else if (uniqueIdentifier === 'retention_raw') {
					navigate('/arpu-raw', { replace: true });
				}
			}
		}
		// 2) Restore from sessionStorage
		if (!initial) {
			const storedRaw = sessionStorage.getItem(STORAGE_KEY(uniqueIdentifier));
			if (storedRaw) {
				try {
					const stored = JSON.parse(storedRaw);
					const availableIds = new Set(apps.map((a) => a.app_auto_id));
					const match = Array.isArray(stored)
						? stored.find((a) => availableIds.has(a.app_auto_id))
						: null;
					if (match) {
						initial = [match];
					}
				} catch {}
			}
		}
		// 3) Fallback default
		if (!initial) {
			const defaultIndex =
				uniqueIdentifier === 'main_campaign' || uniqueIdentifier === 'heatmap' ? 1 : 0;
			const idx = Math.min(defaultIndex, apps.length - 1);
			initial = [apps[idx]];
		}

		const currentId = selectedApp?.[0]?.app_auto_id ?? null;
		const nextId = initial?.[0]?.app_auto_id ?? null;
		setPendingSelection(initial);
		if (currentId === nextId) {
			return;
		}

		setSelectedApp(initial);
		sessionStorage.setItem(STORAGE_KEY(uniqueIdentifier), JSON.stringify(initial));
	}, [
		selectedGroup,
		filterAppList,
		uniqueIdentifier,
		navigate,
		state,
		selectedApp,
		pendingSelection.length,
	]);

	const pendingSelectedId = pendingSelection?.[0]?.app_auto_id ?? null;

	const listWithChecked = useMemo(
		() =>
			(filterAppList || []).map((app) => ({
				...app,
				item_checked: app.app_auto_id === pendingSelectedId,
			})),
		[filterAppList, pendingSelectedId]
	);

	// Apply search text (derived)
	const visibleApps = useMemo(() => {
		if (!searchText.trim()) return listWithChecked;
		const q = searchText.toLowerCase();
		return listWithChecked.filter(
			(item) =>
				item?.app_display_name?.toLowerCase()?.includes(q) ||
				item?.app_console_name?.toLowerCase()?.includes(q)
		);
	}, [listWithChecked, searchText]);

	// Right side preview simply mirrors pendingSelection
	const checkedApp = pendingSelection;

	const handleCheckboxChange = (app) => {
		setPendingSelection([app]);
		sessionStorage.removeItem('appID');
	};

	const handleApply = (e, close) => {
		e.preventDefault();
		close();
		setSearchText('');
		setMainLoader?.(true);

		setSelectedApp(pendingSelection);
		sessionStorage.removeItem('appID');
		sessionStorage.setItem(STORAGE_KEY(uniqueIdentifier), JSON.stringify(pendingSelection));

		if (uniqueIdentifier === 'main_campaign') {
			setIsDateClicked?.(false);
		}
	};

	const handleSearch = (e) => {
		const value = e.target.value || '';
		setSearchText(value);
	};
	const handleClearSearch = () => {
		setSearchText('');
	};

	return (
		<Popover className='check-wrapper statistics_app_filter single_app_filter custom_app_filter_popup'>
			<PopoverTrigger>
				<a
					className={
						selectedApp?.length > 0 ? 'popover_filter filter-btn btn-active' : 'popover_filter filter-btn'
					}
				>
					{selectedApp?.length > 0 ? null : 'App'}
					{selectedApp?.length > 0 && (
						<ul className='selected-item'>
							{selectedApp?.slice(0, 2).map((item, index) => (
								<li className='custom_single_app_box' key={index}>
									<img
										className='single_app_icon'
										loading='lazy'
										src={
											(item.app_icon?.length === 0 && item.app_platform === 2) || item.app_icon === undefined
												? PlayStoreIcon
												: item.app_icon?.length === 0 && item.app_platform === 1
												? AppStoreIcon
												: item.app_icon
										}
									/>
									<span className='single_app_title'>{item?.app_display_name}</span>
								</li>
							))}
							{selectedApp?.length > 2 && <span>+{selectedApp.length - 2} more</span>}
						</ul>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter' id='Lorems'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>App</span>
							<a className='close-filter' onClick={close}>
								<MdClose className='material-icons' />
							</a>
						</div>

						<div className='check-boxes-inner'>
							<div className='left-check-box box2'>
								{/* Search */}
								<div className='search-input'>
									<div className='box'>
										<input
											className='input search-btn-input focus-border'
											id='searchInput1'
											onChange={handleSearch}
											value={searchText}
											required
											placeholder='Search'
											autoComplete='off'
										/>
										<a
											href='#'
											className='clear-icon-btn i-btn'
											onClick={(e) => {
												e.preventDefault();
												handleClearSearch();
											}}
										>
											<IoCloseOutline className='material-icons' />
										</a>
										<a href='#' className='search-icon-btn i-btn'>
											<MdSearch className='material-icons' />
										</a>
										<div className='border-active'></div>
									</div>
								</div>

								<div className='all-select-row'>
									<form onSubmit={(e) => handleApply(e, close)}>
										{visibleApps?.length === 0 ? (
											<div className='noResult'>
												<p>No Result Found</p>
											</div>
										) : (
											visibleApps.map((app, index) => (
												<div className='box-check' key={app.app_auto_id ?? index}>
													<label>
														<input
															type='checkbox'
															name={app?.app_auto_id}
															value={app?.app_display_name}
															className='ckkBox val'
															checked={!!app.item_checked}
															onChange={() => handleCheckboxChange(app)}
														/>
														<span>
															<AccountPageAppBox
																app_auto_id={app?.app_auto_id}
																app_icon={app?.app_icon}
																app_platform={app?.app_platform}
																app_display_name={app?.app_display_name}
																app_console_name={app?.app_console_name}
																app_store_id={app?.app_store_id}
															/>
														</span>
													</label>
												</div>
											))
										)}

										<div className='apply-btn-wrap text-right'>
											<button type='submit' className='apply-btn'>
												Apply
											</button>
										</div>
									</form>
								</div>
							</div>

							<div className='right-result-box box2'>
								<div className='none-selected-text'>
									<span></span>
								</div>
								<div className='right-result-row'>
									{checkedApp?.length === 0 && <EmptyListBox />}
									{checkedApp?.map((item, index) => (
										<div className='result-box' key={item.app_auto_id ?? index}>
											<div className='permission-app app-item custom-app-box'>
												<div className='app-img' style={{ marginLeft: '24px' }}>
													<img alt='' loading='lazy' aria-hidden='true' src={item?.app_icon} />
												</div>
												<div className='label-container'>
													<div className='primary-label-wrap'>
														<div title={item?.app_display_name} className='primary-label'>
															<span>{item?.app_display_name}</span>
														</div>
													</div>
													{item?.app_console_name && (
														<span className='secondary-label-wrap'>
															<div>
																<span className='secondary-label' style={{ cursor: 'pointer' }}>
																	{item?.app_console_name}
																</span>
															</div>
														</span>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default GeneralSingleAppFilter;
