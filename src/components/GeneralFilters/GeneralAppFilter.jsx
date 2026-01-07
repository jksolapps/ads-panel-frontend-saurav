/** @format */

import React, { useContext, useState, useEffect } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { ReportContext } from '../../context/ReportContext';
import AccountPageAppBox from '../GeneralComponents/AccountPageAppBox';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import useSelectAll from '../../hooks/useSelectAll';
import { useLocation, useNavigate } from 'react-router-dom';
import EmptyListBox from '../GeneralComponents/EmptyListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/Popover';

const GeneralAppFilter = ({
	uniqueIdentifier,
	filterAppList,
	selectedApp,
	setSelectedApp,
	setFetchFlags = () => {},
	fetchFlags = false,
	setIsTableLoaderVisible = () => {},
	setFirstColumnDimension,
	setSecondColumnDimension,
	setAppVersionValue,
	setCountryValue,
}) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { state } = location || { app_auto_id: '' };
	const { setReportSelectedFilter } = useContext(ReportContext);
	const [allAppData, setAllAppData] = useState([]);
	const [filteredAppData, setFilteredAppData] = useState([]);
	const [checkedApp, setCheckedApp] = useState([]);
	const [searchText, setSearchText] = useState('');
	const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_app_filter'));

	useEffect(() => {
		if (!filterAppList || filterAppList.length === 0) {
			if (selectedApp.length > 0) {
				setSelectedApp([]);
				sessionStorage.removeItem(uniqueIdentifier + '_app_filter');
			}
		}
		if (uniqueIdentifier == 'retention_pp' || (uniqueIdentifier == 'cost' && state)) {
			filterAppList?.forEach((item) => {
				if (item.app_auto_id == state?.app_auto_id) {
					item.item_checked = true;
					sessionStorage.setItem(uniqueIdentifier + '_app_filter', JSON.stringify([item]));
					setFetchFlags(!fetchFlags);
					setSelectedApp([item]);
				}
			});
		} else if (localData) {
			filterAppList?.forEach((item) => {
				const isChecked = localData?.some((app) => app.app_auto_id == item.app_auto_id);
				item.item_checked = isChecked;
			});
		} else if ((uniqueIdentifier = 'date_wise_campaign' && !localData)) {
			filterAppList?.forEach((item, index) => {
				item.item_checked = false;
			});
		} else {
			filterAppList?.forEach((item, index) => {
				index === 1 ? (item.item_checked = true) : (item.item_checked = false);
			});
		}

		setAllAppData(filterAppList);
		setFilteredAppData(filterAppList);
	}, [filterAppList]);

	useEffect(() => {
		const filterChecked = allAppData?.filter((item) => item.item_checked);
		setCheckedApp(filterChecked);
		// setSelectedApp(filterChecked);
	}, [allAppData]);

	const handleCheckboxChange = (app, index) => {
		const updatedFilteredData = filteredAppData.map((item) =>
			item.app_auto_id === app.app_auto_id ? { ...item, item_checked: !item.item_checked } : item
		);
		setFilteredAppData(updatedFilteredData);

		const updatedAllData = allAppData.map((item) =>
			item.app_auto_id === updatedFilteredData[index].app_auto_id
				? { ...updatedFilteredData[index] }
				: { ...item }
		);
		setAllAppData(updatedAllData);
		sessionStorage.removeItem('appID');
	};

	const handleApply = (e, close) => {
		e.preventDefault();
		close();
		// setPageNumber(1);
		setReportSelectedFilter('AppPopup');
		setSearchText('');
		setFilteredAppData(allAppData);
		setIsTableLoaderVisible(true);
		setSelectedApp(checkedApp);
		sessionStorage.removeItem('appID');
		sessionStorage.setItem(uniqueIdentifier + '_app_filter', JSON.stringify(checkedApp));

		if (uniqueIdentifier === 'app-insights') {
			setTimeout(() => {
				setIsTableLoaderVisible(false);
			}, 300);
			return;
		} else {
			setFetchFlags(!fetchFlags);
		}

		if (uniqueIdentifier == 'date_wise_campaign') {
			setDynamicSelectedFilter('GeneralAppFilter');
		}
		if (uniqueIdentifier == 'retention') {
			if (checkedApp.length != 1) {
				setFirstColumnDimension('INSTALL_DATE');
				setSecondColumnDimension(null);
			}
			sessionStorage.removeItem('retention_app_version_list');
			setAppVersionValue([]);
			setCountryValue([]);
		}
	};

	const handleClose = (item) => {
		const updatedApp = allAppData?.map((app) =>
			app.app_auto_id === item.app_auto_id ? { ...app, item_checked: !app.item_checked } : app
		);
		setAllAppData(updatedApp);
		setFilteredAppData(updatedApp);
		if (uniqueIdentifier === 'cost') {
			navigate(location.pathname + location.search, {
				replace: true,
				state: null,
			});
		}
	};

	const handleClear = () => {
		const resetData = filterAppList?.map((v) => ({
			...v,
			item_checked: false,
		}));
		const resetDataFilter = filteredAppData?.map((v) => ({
			...v,
			item_checked: false,
		}));
		setAllAppData(resetData);
		setFilteredAppData(resetDataFilter);

		if (uniqueIdentifier === 'cost') {
			navigate(location.pathname + location.search, {
				replace: true,
				state: null,
			});
		}
	};

	const handleSearch = (e) => {
		const searchText = e.target.value?.toLowerCase();
		const originalText = e.target.value;
		setSearchText(originalText);
		const updatedFilteredData = allAppData.filter(
			(item) =>
				item?.app_display_name?.toLowerCase()?.includes(searchText) ||
				item?.app_console_name?.toLowerCase()?.includes(searchText)
		);
		setFilteredAppData(updatedFilteredData);
	};

	const { areAllCheckedIn, handleSelectAll } = useSelectAll({
		allItemData: allAppData,
		filterItemData: filteredAppData,
		setAllItemData: setAllAppData,
		setAllFilterData: setFilteredAppData,
		uniqueId: 'app_auto_id',
	});

	return (
		<Popover className='check-wrapper statistics_app_filter custom_app_filter_popup'>
			<PopoverTrigger>
				<a
					className={
						selectedApp?.length > 0 ? 'popover_filter filter-btn btn-active' : 'popover_filter filter-btn'
					}
				>
					<span>App</span>
					{selectedApp?.length > 0 ? (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{selectedApp
									?.map((item) => {
										return item?.app_display_name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item}
										</li>
									))}
								{selectedApp?.length > 2 && <span>+{selectedApp?.length - 2} more </span>}
							</ul>
						</>
					) : null}
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
											onClick={() => {
												setSearchText('');
												setFilteredAppData(allAppData);
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
										{filteredAppData?.length === 0 ? (
											<div className='noResult'>
												<p>No Result Found</p>
											</div>
										) : (
											<>
												<div className='box-check'>
													<label>
														<input
															type='checkbox'
															className='ckkBox val'
															checked={areAllCheckedIn()}
															onChange={(event) => handleSelectAll(event)}
														/>
														<span className='search-title'>Select All</span>
													</label>
												</div>
												{filteredAppData?.map((app, index) => (
													<div className='box-check' key={index}>
														<label>
															<input
																type='checkbox'
																name={app?.app_auto_id}
																value={app?.app_display_name}
																className='ckkBox val'
																checked={app.item_checked}
																onChange={() => handleCheckboxChange(app, index)}
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
												))}
											</>
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
									<a className='custom-clear-all' onClick={handleClear}>
										Clear all
									</a>
								</div>
								<div className='right-result-row'>
									{checkedApp?.length === 0 && <EmptyListBox />}
									{checkedApp?.map((item, index) => (
										<div className='result-box' key={index} onClick={() => handleClose(item)}>
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
															<div target='_blank'>
																<span className='secondary-label' style={{ cursor: 'pointer' }}>
																	{item?.app_console_name}
																</span>
															</div>
														</span>
													)}
												</div>
												<a href='#' className='result-cancel-btn i-btn'>
													<IoIosCloseCircleOutline className='material-icons' />
												</a>
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

export default GeneralAppFilter;
