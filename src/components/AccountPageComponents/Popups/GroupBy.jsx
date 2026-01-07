/** @format */

import React, { useContext, useState, useEffect } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import EmptyListBox from '../../GeneralComponents/EmptyListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';
const GroupBy = ({
	uniqueIdentifier,
	groupByData,
	filterPopupData,
	setPageNumber,
	setIsReportLoaderVisible,
	setCurrentUnitPage,
	setSelectedAccountData,
	groupValue,
	setGroupValue,
	setAccountNewApp,
	setAccountPlatform,
}) => {
	const {
		popupFlags,
		setPopupFlags,
		allUnitData,
		setAllUnitData,
		searchAllUnitData,
		setSearchAllUnitData,
		checkedUnit,
		setCheckedUnit,
		allAccounAppData,
		setallAccounAppData,
		filteredAccountAppData,
		setfilteredAccountAppData,
		setcheckedAccountApp,
		setaccountApp,
		allAccountPlatformData,
		setallAccountPlatformData,
		filteredAccountPlatformData,
		setfilteredAccountPlatformData,
		setcheckedAccountPlatform,
		setPlatformValue,
		allAccountData,
		setallAccountData,
		filteredAccountData,
		setfilteredAccountData,
		checkedAccount,
		setcheckedAccount,
		setSelectedFilter,
	} = useContext(ReportContext);

	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		if (groupByData?.length > 0) {
			const initialData = groupByData?.map((app) => {
				return {
					...app,
					group_apps: app?.group_apps?.map((unit) => {
						return {
							...unit,
							unit_checked: false,
						};
					}),
				};
			});
			const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_group_filter'));
			const updatedData = initialData?.map((item) => {
				const updatedGroupApps = item.group_apps?.map((unit) => {
					const isChecked = localData?.some((app) => app.app_auto_id == unit.app_auto_id);
					return { ...unit, unit_checked: isChecked ? isChecked : false };
				});
				return { ...item, group_apps: updatedGroupApps };
			});
			setCheckedUnit(
				updatedData?.flatMap((app) => app?.group_apps?.filter((unit) => unit?.unit_checked))
			);

			setAllUnitData(updatedData);
			setSearchAllUnitData(updatedData);
		}
	}, [groupByData, filterPopupData]);

	useEffect(() => {
		const checkedUnits = allUnitData?.flatMap((app) =>
			app?.group_apps?.filter((unit) => unit?.unit_checked)
		);
		setCheckedUnit(checkedUnits);
	}, [allUnitData, searchAllUnitData]);

	const handleClose = (unit) => {
		const updatedUnitData = allUnitData?.map((app) => {
			const updatedApp = { ...app };
			const updatedUnits = updatedApp.group_apps.map((u) => {
				if (u.app_auto_id === unit.app_auto_id) {
					return { ...u, unit_checked: false };
				}
				return u;
			});
			updatedApp.group_apps = updatedUnits;
			return updatedApp;
		});
		setAllUnitData(updatedUnitData);
		setSearchAllUnitData(updatedUnitData);
	};

	const handleSearch = (e) => {
		const searchText = e.target.value?.toLowerCase();
		const originalText = e.target.value;
		setSearchText(originalText);
		const updatedFilteredData = allUnitData.filter((item) =>
			item?.group_name?.toLowerCase()?.includes(searchText)
		);
		setSearchAllUnitData(updatedFilteredData);
	};

	const handleClear = () => {
		setSearchText('');
		const resetData = groupByData?.map((app) => {
			return {
				...app,
				group_apps: app?.group_apps?.map((unit) => {
					return {
						...unit,
						unit_checked: false,
					};
				}),
			};
		});
		setAllUnitData(resetData);
		setSearchAllUnitData(resetData);
	};

	const handleApply = (e, close) => {
		setSelectedFilter('GroupBy');
		setSearchText('');
		setSearchAllUnitData(allUnitData);
		e.preventDefault();
		setIsReportLoaderVisible(true);
		setPageNumber(1);
		setGroupValue(checkedUnit);
		sessionStorage.setItem(uniqueIdentifier + '_group_filter', JSON.stringify(checkedUnit));

		setPopupFlags(!popupFlags);
		setCurrentUnitPage(1);
		setAccountNewApp([]);
		sessionStorage.removeItem(uniqueIdentifier + '_app_filter');

		setfilteredAccountAppData(
			filteredAccountAppData?.map((item) => ({ ...item, item_checked: false }))
		);
		setallAccounAppData(allAccounAppData?.map((item) => ({ ...item, item_checked: false })));
		setcheckedAccountApp(null);

		setfilteredAccountPlatformData(
			filteredAccountPlatformData.map((item) => ({
				...item,
				item_checked: false,
			}))
		);
		setallAccountPlatformData(
			allAccountPlatformData.map((item) => ({ ...item, item_checked: false }))
		);
		setcheckedAccountPlatform(null);
		setAccountPlatform([]);
		sessionStorage.removeItem(uniqueIdentifier + '_platform_filter');

		setfilteredAccountData(
			filteredAccountData.map((item) => ({
				...item,
				item_checked: false,
			}))
		);
		setallAccountData(allAccountData.map((item) => ({ ...item, item_checked: false })));
		setcheckedAccount(null);
		setSelectedAccountData([]);
		sessionStorage.removeItem(uniqueIdentifier + '_admob_filter');
		close();
	};

	const groupedCheckedUnit = checkedUnit?.reduce((acc, curr) => {
		const existingAppIndex = acc?.findIndex(
			(item) => item?.app_display_name === curr?.app_display_name
		);
		if (existingAppIndex !== -1) {
			acc[existingAppIndex]?.group_apps.push(curr);
		} else {
			acc.push({
				app_display_name: curr?.app_display_name,
				app_platform: curr?.app_platform,
				group_apps: [curr],
				group_id: curr?.group_id,
			});
		}
		return acc;
	}, []);

	const toggleUnitCheckedState = (data, targetGroupId) => {
		return data.map((appItem) => {
			const isTargetGroup = appItem.group_id === targetGroupId;
			const isCurrentlyChecked = isTargetGroup
				? appItem.group_apps.some((unit) => unit.unit_checked)
				: false;

			return {
				...appItem,
				group_apps: appItem.group_apps.map((unit) => ({
					...unit,
					unit_checked: isTargetGroup ? !isCurrentlyChecked : false,
				})),
			};
		});
	};

	const handleAppCheckboxChange = (app) => {
		const targetGroupId = app?.group_id;
		setAllUnitData((prevData) => toggleUnitCheckedState(prevData, targetGroupId));
		setSearchAllUnitData((prevData) => toggleUnitCheckedState(prevData, targetGroupId));
	};

	const handleBackspace = (event) => {
		if (event.keyCode === 8 && searchText === '') {
			setSearchAllUnitData(allUnitData);
		}
	};

	return (
		<Popover className='check-wrapper group-filter'>
			<PopoverTrigger>
				<a
					className={
						groupValue?.length > 0 ? 'popover_filter filter-btn btn-active' : 'popover_filter filter-btn'
					}
				>
					<span>Group</span>
					{groupValue?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{groupValue
									?.map((item) => {
										return item?.app_display_name;
									})
									?.slice(0, 1)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{' '}
											{item}{' '}
										</li>
									))}
								{groupValue?.length > 2 && <span>+{groupValue?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className='group-by-filter checkbox_popover full-and-multi-filter' id='Lorems'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Group</span>
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
											id='searchInput11'
											onChange={handleSearch}
											value={searchText}
											required
											placeholder='Search'
											autoComplete='off'
											onKeyUp={handleBackspace}
										/>
										<a
											href='#'
											className='clear-icon-btn i-btn'
											onClick={() => {
												setSearchText('');
												setSearchAllUnitData(allUnitData);
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
										{searchAllUnitData?.length === 0 ||
										searchAllUnitData?.every((item) => item.group_apps?.length === 0) ? (
											<div className='noResult'>
												<p>No Result Found</p>
											</div>
										) : (
											<>
												{searchAllUnitData?.map((app, appIndex) => {
													return (
														app?.group_apps?.length > 0 && (
															<div
																className={
																	searchText?.length > 0
																		? `box-check select-dropdown active 
                                  `
																		: `box-check select-dropdown 
                                  `
																}
																key={appIndex}
															>
																<div className='box-check'>
																	<label>
																		<input
																			type='checkbox'
																			className='ckkBox val'
																			checked={app?.group_apps?.some((unit) => unit.unit_checked)}
																			onChange={() => handleAppCheckboxChange(app)}
																		/>
																		<span>
																			<span className='search-title'>{app?.group_name}</span>
																			<span className='mx-1'>{'(' + app?.group_apps?.length + '  apps' + ')'}</span>
																		</span>
																	</label>
																</div>
															</div>
														)
													);
												})}
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
									{groupedCheckedUnit?.length === 0 && <EmptyListBox />}
									{groupedCheckedUnit?.length > 0 &&
										groupedCheckedUnit?.map((app, appIndex) => {
											return (
												groupedCheckedUnit?.length > 0 && (
													<div
														className={
															searchText?.length > 0
																? 'box-check select-dropdown active'
																: 'box-check select-dropdown'
														}
														key={appIndex}
													>
														{app?.group_apps?.map((item, unitIndex) => (
															<div className='result-box' key={unitIndex} onClick={() => handleClose(item)}>
																<div className='permission-app app-item custom-app-box'>
																	<div className='app-img' style={{ marginLeft: '10px' }}>
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
												)
											);
										})}
								</div>
							</div>
						</div>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default GroupBy;
