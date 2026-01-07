/** @format */

import React, { useContext, useState, useEffect } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import AccountPageAppBox from '../../GeneralComponents/AccountPageAppBox';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import useSelectAll from '../../../hooks/useSelectAll';
import { useLocation, useNavigate } from 'react-router-dom';
import { DataContext } from '../../../context/DataContext';
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import EmptyListBox from '../../GeneralComponents/EmptyListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const AppFilter = ({
	filterPopupData,
	setPageNumber,
	setIsReportLoaderVisible = () => {},
	setCurrentUnitPage,
	setSelectedActivity,
	setSortState,
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
		checkedAccountCamp,
		setcheckedAccountCamp,
		allUnitData,
		setAllUnitData,
		searchAllUnitData,
		setSearchAllUnitData,
		checkedUnit,
		setCheckedUnit,
		setGroupValue,
		setSelectedFilter,
		analyticsApp,
		setAnalyticsApp,
		setCampaignID,
		setToggleResizeAnalytics,
		setResizeSticky,
		dimensionList,
		setDimensionList,
		setFilteredDimension,
	} = useContext(ReportContext);

	const { setDateRangeforAnalytics } = useContext(DataContext);

	const [searchText, setSearchText] = useState('');
	const { state } = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (state) {
			filterPopupData?.forEach((item, index) => {
				item.id = index + 1;
				if (item.app_auto_id == state?.app_auto_id) {
					item.item_checked = true;
					sessionStorage.setItem('analytic_app_filter', JSON.stringify([item]));
					navigate('/analytics', { replace: true });
				} else {
					item.item_checked = false;
				}
			});
		} else if (filterPopupData) {
			const localAnalyticsApp = JSON.parse(sessionStorage.getItem('analytic_app_filter'));
			filterPopupData?.forEach((item, index) => {
				const isChecked = localAnalyticsApp?.some((app) => app.app_auto_id == item.app_auto_id);
				item.item_checked = isChecked ? isChecked : false;
				item.id = index + 1;
			});
		}
		setAnalyticsApp(filterPopupData?.filter((item) => item?.item_checked));
		setallAccounAppData(filterPopupData);
		setfilteredAccountAppData(filterPopupData);
	}, [filterPopupData]);

	useEffect(() => {
		setcheckedAccountCamp(allAccounAppData?.filter((item) => item.item_checked));
	}, [allAccounAppData, filteredAccountAppData]);

	const handleCheckboxChange = (app, index) => {
		const updatedFilteredData = filteredAccountAppData.map((item) =>
			item?.app_auto_id === app?.app_auto_id ? { ...item, item_checked: !app.item_checked } : item
		);
		setfilteredAccountAppData(updatedFilteredData);
		setcheckedAccountCamp(updatedFilteredData?.filter((item) => item.item_checked));
		const updatedAllData = allAccounAppData.map((item) =>
			item.app_auto_id === updatedFilteredData[index].app_auto_id
				? { ...updatedFilteredData[index] }
				: item
		);
		setallAccounAppData(updatedAllData);
	};

	const handleApply = (e, close) => {
		e.preventDefault();
		setSearchText('');
		setToggleResizeAnalytics(true);
		setResizeSticky(false);
		setSelectedFilter('AppAccountPopup');
		setfilteredAccountAppData(allAccounAppData);
		setIsReportLoaderVisible(true);
		setFilterFlag(!filterFlag);
		setAnalyticsApp(checkedAccountCamp);
		sessionStorage.setItem('analytic_app_filter', JSON.stringify(checkedAccountCamp));

		// Update newDimensionData based on the number of selected apps
		if (checkedAccountCamp.length !== 1) {
			setDimensionList((prevData) => {
				const updatedData = prevData.map((dimension) => {
					if (dimension.value === 'CAMPAIGN_NAME' && dimension.matrix_checked) {
						return {
							...dimension,
							matrix_checked: false,
						};
					}
					return dimension;
				});
				sessionStorage.setItem('new_dimension_list', JSON.stringify(updatedData));
				return updatedData;
			});
			// setFilteredDimension([])
			// sessionStorage.setItem('new_checked_dimension', JSON.stringify([]));
			setSelectedActivity([]);
			sessionStorage.setItem('analytics_activity_filter', JSON.stringify([]));
		} else {
			setDimensionList((prevData) => {
				const updatedData = prevData.map((dimension) => {
					if (dimension.value === 'CAMPAIGN_NAME' && dimension.matrix_checked) {
						return {
							...dimension,
							matrix_checked: true,
						};
					}
					return dimension;
				});
				sessionStorage.setItem('new_dimension_list', JSON.stringify(updatedData));
				return updatedData;
			});
		}

		if (
			checkedAccountCamp.length == 1 &&
			!dimensionList.some((dimension) => dimension.matrix_checked)
		) {
			const dateDimension = [
				{
					matrix_auto_id: '2',
					matrix_display_name: 'Date',
					matrix_checked: true,
					value: 'DATE',
					data_column_id: '2',
					key: 'Date',
					name: 'Date',
					sortValue: 'DATE',
				},
			];
			setFilteredDimension(dateDimension);
			sessionStorage.setItem('new_checked_dimension', JSON.stringify(dateDimension));
			const lastSortedColumn = {
				name: { sortValue: 'DATE' },
				key: 'desc',
			};
			setSortState(lastSortedColumn);
			sessionStorage.setItem('lastSortedColumn', JSON.stringify(lastSortedColumn));
			setDimensionList((prevData) => {
				const updatedData = prevData.map((dimension) => {
					if (dimension.value === 'DATE' && !dimension.matrix_checked) {
						return {
							...dimension,
							matrix_checked: true,
						};
					}
					return dimension;
				});
				sessionStorage.setItem('new_dimension_list', JSON.stringify(updatedData));
				return updatedData;
			});

			// Set date range for analytics to this month using date-fns
			const now = new Date();
			const startDate = startOfDay(startOfMonth(now));
			const endDate = endOfDay(endOfMonth(now));
			const selectedDateRange = [{ startDate, endDate, key: 'selection' }];
			setDateRangeforAnalytics(selectedDateRange);
			sessionStorage.setItem('analytics_date_range', JSON.stringify(selectedDateRange));
		}

		localStorage.setItem(
			'analytcis_camp_id',
			checkedAccountCamp.map((item) => item?.app_auto_id)
		);
		setCampaignID([]);
		close();
	};
	const handleClose = (item) => {
		const updatedApp = allAccounAppData?.map((app) =>
			app.app_auto_id === item.app_auto_id ? { ...app, item_checked: !app.item_checked } : app
		);
		setallAccounAppData(updatedApp);
		setfilteredAccountAppData(updatedApp);
	};

	const handleClear = () => {
		const resetData = filterPopupData?.map((v, i) => ({
			...v,
			item_checked: false,
		}));
		const resetDataFilter = filteredAccountAppData?.map((v, i) => ({
			...v,
			item_checked: false,
		}));
		setallAccounAppData(resetData);
		setfilteredAccountAppData(resetDataFilter);
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
		<Popover className='check-wrapper app-filter custom_app_filter_popup'>
			<PopoverTrigger>
				<a
					className={
						analyticsApp?.length > 0
							? 'popover_filter filter-btn btn-active'
							: 'popover_filter filter-btn'
					}
				>
					<span>App</span>
					{analyticsApp?.length > 0 ? (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{analyticsApp
									?.map((item) => {
										return item?.app_display_name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{' '}
											{item}{' '}
										</li>
									))}
								{analyticsApp?.length > 2 && <span>+{analyticsApp?.length - 2} more </span>}
							</ul>
						</>
					) : null}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter ' id='Lorems'>
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
									{checkedAccountCamp?.length === 0 && <EmptyListBox />}
									{checkedAccountCamp?.map((item, index) => (
										<div className='result-box' key={index} onClick={() => handleClose(item)}>
											<div className='result-box' key={index}>
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

export default AppFilter;
