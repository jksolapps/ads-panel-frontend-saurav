/** @format */

import React, { useContext, useState, useEffect } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import AccountPageAppBox from '../../GeneralComponents/AccountPageAppBox';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import useSelectAll from '../../../hooks/useSelectAll';
import EmptyListBox from '../../GeneralComponents/EmptyListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const AppPopup = ({
	filterPopupData,
	setPageNumber,
	setIsReportLoaderVisible = () => {},
	selectedAccountData,
	setCurrentUnitPage,
	setDisabled,
	filteredAppData,
	setFilteredAppData,
	checkedApp,
	setCheckedApp,
	allAppData,
	setAllAppData,
}) => {
	const {
		appValue,
		setAppValue,
		popupFlags,
		setPopupFlags,
		filterFlag,
		setFilterFlag,
		setReportSelectedFilter,
	} = useContext(ReportContext);

	const [searchText, setSearchText] = useState('');

	var queryString = window.location.search;
	var queryParams = {};
	if (queryString) {
		queryString = queryString.substring(1);
		var paramPairs = queryString.split('&');
		for (var i = 0; i < paramPairs.length; i++) {
			var pair = paramPairs[i].split('=');
			var paramName = decodeURIComponent(pair[0]);
			var paramValue = decodeURIComponent(pair[1]);
			queryParams[paramName] = paramValue;
		}
	}
	const { appId } = queryParams;

	useEffect(() => {
		const localData = JSON.parse(sessionStorage.getItem('app_filter'));
		filterPopupData?.forEach((item) => {
			const isChecked = localData?.some((app) => app.app_auto_id == item.app_auto_id);
			item.item_checked = isChecked;
		});
		setAllAppData(filterPopupData);
		setFilteredAppData(filterPopupData);

		if (appId) {
			const initialFilterPopupData = filterPopupData?.map((item) =>
				item.app_auto_id == appId ? { ...item, item_checked: true } : { ...item, item_checked: false }
			);
			setAppValue(initialFilterPopupData?.filter((item) => item.item_checked));
			setAllAppData(initialFilterPopupData);
			setFilteredAppData(initialFilterPopupData);
		}
	}, [filterPopupData]);

	useEffect(() => {
		setCheckedApp(allAppData?.filter((item) => item.item_checked));
	}, [allAppData, filteredAppData]);

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
		setReportSelectedFilter('AppPopup');
		setSearchText('');
		setFilteredAppData(allAppData);
		setIsReportLoaderVisible(true);
		setFilterFlag(!filterFlag);
		setAppValue(checkedApp);
		setPopupFlags(!popupFlags);
		setCurrentUnitPage(1);
		sessionStorage.removeItem('appID');
		sessionStorage.setItem('app_filter', JSON.stringify(checkedApp));
	};

	const handleClose = (item) => {
		const updatedApp = allAppData?.map((app) =>
			app.app_auto_id === item.app_auto_id ? { ...app, item_checked: !app.item_checked } : app
		);
		setAllAppData(updatedApp);
		setFilteredAppData(updatedApp);
	};

	const handleClear = () => {
		const resetData = filterPopupData?.map((v) => ({
			...v,
			item_checked: false,
		}));
		const resetDataFilter = filteredAppData?.map((v) => ({
			...v,
			item_checked: false,
		}));
		setAllAppData(resetData);
		setFilteredAppData(resetDataFilter);
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

	//Select all
	const { areAllCheckedIn, handleSelectAll } = useSelectAll({
		allItemData: allAppData,
		filterItemData: filteredAppData,
		setAllItemData: setAllAppData,
		setAllFilterData: setFilteredAppData,
	});

	return (
		<Popover className='check-wrapper app-select-popup custom_app_filter_popup'>
			<PopoverTrigger>
				<a
					className={
						appValue?.length > 0 ? 'popover_filter filter-btn btn-active' : 'popover_filter filter-btn'
					}
				>
					<span>App</span>
					{appValue?.length > 0 ? (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{appValue
									?.map((item) => {
										return item?.app_display_name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item}
										</li>
									))}
								{appValue?.length > 2 && <span>+{appValue?.length - 2} more </span>}
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
											className='clear-icon-btn i-btn'
											onClick={() => {
												setSearchText('');
												setFilteredAppData(allAppData);
											}}
										>
											<IoCloseOutline className='material-icons' />
										</a>
										<a className='search-icon-btn i-btn'>
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
											<button type='submit' className='apply-btn' onClick={() => setDisabled(true)}>
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
															<div
																target='_blank'
																// className="external-link-icon"
															>
																<span className='secondary-label' style={{ cursor: 'pointer' }}>
																	{item?.app_console_name}
																</span>
															</div>
														</span>
													)}
												</div>
												<a className='result-cancel-btn i-btn'>
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

export default AppPopup;
