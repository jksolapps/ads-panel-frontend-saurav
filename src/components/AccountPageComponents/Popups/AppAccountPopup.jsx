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

const AppAccountPopup = ({
	uniqueIdentifier,
	appId = null,
	filterPopupData,
	setPageNumber,
	setIsReportLoaderVisible,
	selectedAccountData,
	setCurrentUnitPage,
	accountApp,
	setaccountApp,
	setGroupValue,
}) => {
	const {
		popupFlags,
		setPopupFlags,
		filterFlag,
		setFilterFlag,
		allAccounAppData,
		setallAccounAppData,
		filteredAccountAppData,
		setfilteredAccountAppData,
		checkedAccountApp,
		setcheckedAccountApp,
		allUnitData,
		setAllUnitData,
		searchAllUnitData,
		setSearchAllUnitData,
		checkedUnit,
		setCheckedUnit,
		setSelectedFilter,
	} = useContext(ReportContext);

	const [searchText, setSearchText] = useState('');
	const [ignoreAppId, setIgnoreAppId] = useState(false);

	useEffect(() => {
  if (filterPopupData) {
    const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_app_filter'));

    // Only reinitialize if we don't already have data OR if filterPopupData changed
    // Skip reinitialization if user is just interacting with the popup
    if (allAccounAppData?.length > 0 && ignoreAppId) {
      // Don't reinitialize, user is interacting
      return;
    }

    const initialAppData = filterPopupData.map((v, index) => {
      const shouldUseAppId = appId && !ignoreAppId;
      const isSameAsProvidedId = shouldUseAppId && v.app_auto_id == appId;

      const isCheckedInLocal = localData?.some((app) => app.app_auto_id == v.app_auto_id);
      const isCheckedInAccountApp = accountApp.some(
        (app) => app.app_auto_id == v.app_auto_id && app.item_checked
      );
      const finalChecked = isSameAsProvidedId || isCheckedInLocal || isCheckedInAccountApp;
      return {
        ...v,
        item_checked: finalChecked,
        id: index + 1,
      };
    });

    const filterAppData = initialAppData?.filter((item) => item?.item_checked);
    setaccountApp(filterAppData);
    sessionStorage.setItem(uniqueIdentifier + '_app_filter', JSON.stringify(filterAppData));

    setallAccounAppData(initialAppData);
    setfilteredAccountAppData(initialAppData);
  }
}, [filterPopupData, appId]);

	useEffect(() => {
		setcheckedAccountApp(allAccounAppData?.filter((item) => item.item_checked));
	}, [allAccounAppData, filteredAccountAppData, appId]);

	const handleCheckboxChange = (app, index) => {
		const updatedFilteredData = filteredAccountAppData.map((item) =>
			item?.app_auto_id === app?.app_auto_id ? { ...item, item_checked: !item.item_checked } : item
		);
		setfilteredAccountAppData(updatedFilteredData);
		setcheckedAccountApp(updatedFilteredData?.filter((item) => item.item_checked));
		const updatedAllData = allAccounAppData.map((item) =>
			item.app_auto_id === updatedFilteredData[index].app_auto_id
				? { ...updatedFilteredData[index] }
				: { ...item }
		);
		setallAccounAppData(updatedAllData);
	};

	const handleApply = (e, close) => {
		setSelectedFilter('AppAccountPopup');
		e.preventDefault();
		close();
		setSearchText('');
		setfilteredAccountAppData(allAccounAppData);
		setIsReportLoaderVisible(true);
		setPageNumber(1);
		setFilterFlag(!filterFlag);
		setaccountApp(checkedAccountApp);
		sessionStorage.setItem(uniqueIdentifier + '_app_filter', JSON.stringify(checkedAccountApp));
		setPopupFlags(!popupFlags);
		setCurrentUnitPage(1);
		setSearchAllUnitData(
			searchAllUnitData?.map((group) => ({
				...group,
				group_apps: group.group_apps.map((unit) => ({
					...unit,
					unit_checked: false,
				})),
			}))
		);
		setAllUnitData(
			allUnitData?.map((group) => ({
				...group,
				group_apps: group.group_apps.map((unit) => ({
					...unit,
					unit_checked: false,
				})),
			}))
		);
		setCheckedUnit(null);
		setGroupValue([]);
		sessionStorage.removeItem(uniqueIdentifier + '_group_filter');
	};

	// FIXED: handleClose only updates the checked state, not accountApp or sessionStorage
	// Those will be updated when user clicks "Apply"
	const handleClose = (item) => {
		setIgnoreAppId(true);

		const updatedApp = allAccounAppData?.map((app) =>
			app.app_auto_id === item.app_auto_id ? { ...app, item_checked: false } : app
		);

		setallAccounAppData(updatedApp);
		setfilteredAccountAppData(updatedApp);

		// Only update checkedAccountApp - DON'T update accountApp or sessionStorage yet
		// Those will be updated when user clicks "Apply"
		setcheckedAccountApp(updatedApp?.filter((item) => item.item_checked));
	};

	const handleClear = () => {
		const resetData = allAccounAppData?.map((v) => ({  // Changed from filterPopupData
			...v,
			item_checked: false,
		}));
		const resetDataFilter = filteredAccountAppData?.map((v) => ({
			...v,
			item_checked: false,
		}));
		setallAccounAppData(resetData);
		setfilteredAccountAppData(resetDataFilter);
		setcheckedAccountApp([]);  // ADD THIS LINE
	};

	const handleSearch = (e) => {
		const searchText = e.target.value?.toLowerCase();
		const originalText = e.target.value;
		setSearchText(originalText);
		const updatedFilteredData = allAccounAppData.filter(
			(item) =>
				item?.app_display_name?.toLowerCase()?.includes(searchText) ||
				item?.app_console_name?.toLowerCase()?.includes(searchText)
		);
		setfilteredAccountAppData(updatedFilteredData);
	};

	//Select all
	const { areAllCheckedIn, handleSelectAll } = useSelectAll({
		allItemData: allAccounAppData,
		filterItemData: filteredAccountAppData,
		setAllItemData: setallAccounAppData,
		setAllFilterData: setfilteredAccountAppData,
	});

	return (
		<Popover className='check-wrapper column-filter app-account-filter custom_app_filter_popup'>
			<PopoverTrigger>
				<a
					className={
						accountApp?.length > 0 ? 'popover_filter filter-btn btn-active' : 'popover_filter filter-btn'
					}
				>
					<span>App</span>
					{accountApp?.length > 0 ? (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{accountApp
									?.map((item) => {
										return item?.app_display_name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item}{' '}
										</li>
									))}
								{accountApp?.length > 2 && <span>+{accountApp?.length - 2} more </span>}
							</ul>
						</>
					) : null}
				</a>
			</PopoverTrigger>
			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter app-filter' id='Lorems'>
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
											id='searchInput66'
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
												setfilteredAccountAppData(allAccounAppData);
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
										{filteredAccountAppData?.length === 0 ? (
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
												{filteredAccountAppData?.map((app, index) => (
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
															<AccountPageAppBox
																app_auto_id={app?.app_auto_id}
																app_icon={app?.app_icon}
																app_platform={app?.app_platform}
																app_display_name={app?.app_display_name}
																app_console_name={app?.app_console_name}
																app_store_id={app?.app_store_id}
															/>
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
									{checkedAccountApp?.length === 0 && <EmptyListBox />}
									{checkedAccountApp?.map((item, index) => (
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

export default AppAccountPopup;