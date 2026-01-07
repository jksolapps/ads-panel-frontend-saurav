/** @format */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose, MdSearch, MdExpandMore } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import filterPopupData from '../../../utils/report_filter.json';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import EmptyListBox from '../../GeneralComponents/EmptyListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const AppVersion = ({
	AppVersion,
	setIsReportLoaderVisible = () => {},
	setCurrentUnitPage,
	setPageNumber,
}) => {
	const {
		popupFlags,
		setPopupFlags,
		appVersionData,
		setappVersionData,
		allAppVersionData,
		setallAppVersionData,
		filteredAppVersionData,
		setfilteredAppVersionData,
		checkedAppVersion,
		setcheckedAppVersion,
		AppVersionbool,
		setReportSelectedFilter,
	} = useContext(ReportContext);

	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		if (AppVersion) {
			const initialFormatData = AppVersion?.map((v) => {
				v.versions.forEach((ele) => {
					const matchedAppVersion = appVersionData.find(
						(item) => item.app_display_name === v.app_display_name && item.name === ele.name
					);
					if (matchedAppVersion) {
						ele.item_checked = true;
					}
				});
				return v;
			});

			setallAppVersionData(initialFormatData);
			setfilteredAppVersionData(initialFormatData);
		}
	}, [AppVersion]);

	const updateCheckedVersions = (allAppVersionData, appVersionData) => {
		return allAppVersionData?.map((app) => {
			const matchedVersions = appVersionData.filter(
				(version) => version.name === app.versions[0].name
			);
			return {
				...app,
				versions: app.versions?.map((version) => {
					const matchingVersion = matchedVersions.find((match) => match.name === version.name);
					return {
						...version,
						item_checked: matchingVersion?.item_checked || false, // Set default to false if no match
					};
				}),
			};
		});
	};
	useEffect(() => {
		const checkedUnits = allAppVersionData?.flatMap((app) =>
			app?.versions.filter((unit) => unit.item_checked)
		);
		setcheckedAppVersion(checkedUnits);
	}, [appVersionData, allAppVersionData, filteredAppVersionData]);

	useEffect(() => {
		if (appVersionData?.length > 0) {
			const checkedAppVersionData = updateCheckedVersions(allAppVersionData, appVersionData);
			const checkedUnits = checkedAppVersionData?.flatMap((app) =>
				app?.versions.filter((unit) => unit.item_checked)
			);
			setcheckedAppVersion(checkedUnits);
			setallAppVersionData(checkedAppVersionData);
			setfilteredAppVersionData(checkedAppVersionData);
		}
	}, []);

	const handleCheckboxChange = (appIndex, unitIndex, unit_auto_id) => {
		const updatedUnitData = filteredAppVersionData?.map((app, index) => {
			if (index === appIndex) {
				const updatedUnits = app.versions?.map((unit, idx) => {
					if (unit_auto_id === unit.name) {
						return {
							...unit,
							item_checked: !unit.item_checked,
						};
					}
					return unit;
				});
				return {
					...app,
					versions: updatedUnits,
				};
			}
			return app;
		});
		setfilteredAppVersionData(updatedUnitData);

		const updatedAllData = allAppVersionData?.map((item) => {
			if (item.app_display_name === updatedUnitData[appIndex].app_display_name) {
				return {
					...item,
					versions: item.versions?.map((unit, idx) => {
						if (unit_auto_id === unit.name) {
							return {
								...unit,
								item_checked: !unit.item_checked,
							};
						}
						return unit;
					}),
				};
			}
			return item;
		});
		setallAppVersionData(updatedAllData);
	};

	const handleApply = (e, close) => {
		e.preventDefault();
		close();
		setReportSelectedFilter('AppVersion');
		setSearchText('');
		setfilteredAppVersionData(allAppVersionData);
		setIsReportLoaderVisible(true);
		setPageNumber(1);
		setappVersionData(checkedAppVersion);
		setPopupFlags(!popupFlags);
		setCurrentUnitPage(1);
		sessionStorage.setItem('app_version_filter', JSON.stringify(checkedAppVersion));
	};

	const handleClose = (item) => {
		const updatedFormat = allAppVersionData?.map((app) => {
			const updatedApp = { ...app };
			const updatedUnits = updatedApp.versions?.map((u) => {
				if (u.id === item.id) {
					return { ...u, item_checked: !u.item_checked };
				}
				return u;
			});
			updatedApp.versions = updatedUnits;
			return updatedApp;
		});
		setallAppVersionData(updatedFormat);
		setfilteredAppVersionData(updatedFormat);
	};

	const handleClear = () => {
		setSearchText('');
		const clearAppData = AppVersion.map((item) => ({
			...item,
			versions: item.versions.map((ele) => ({
				...ele,
				item_checked: false,
			})),
		}));
		setallAppVersionData(clearAppData);
		setfilteredAppVersionData(clearAppData);
	};

	const handleSearch = (e) => {
		const searchText = e.target.value.toLowerCase();
		const originalText = e.target.value;
		setSearchText(originalText);
		const filteredData = allAppVersionData?.map((app) => ({
			...app,
			versions: app.versions.filter(
				(unit) =>
					unit.name.toLowerCase().includes(searchText) ||
					app.app_display_name.toLowerCase().includes(searchText)
			),
		}));
		setfilteredAppVersionData(filteredData);
	};

	const groupedCheckedUnit = checkedAppVersion?.reduce((acc, curr) => {
		const existingAppIndex = acc.findIndex(
			(item) => item?.app_display_name === curr?.app_display_name
		);
		if (existingAppIndex !== -1) {
			acc[existingAppIndex].versions.push(curr);
		} else {
			acc.push({
				app_display_name: curr?.app_display_name,
				app_platform: curr?.app_platform,
				versions: [curr],
			});
		}
		return acc;
	}, []);

	return (
		<Popover className='check-wrapper app-select-popup custom_app_version_filter'>
			<PopoverTrigger>
				<a
					className={
						appVersionData?.length > 0
							? 'popover_filter filter-btn btn-active'
							: 'popover_filter filter-btn'
					}
				>
					<span>App Version</span>
					{appVersionData?.length > 0 && (
						<>
							<ul className='selected-item'>
								:
								{appVersionData
									?.map((item) => {
										return item?.name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item}
										</li>
									))}
								{appVersionData?.length > 2 && <span>+{appVersionData?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter' id='Lorems'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>App Version</span>
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
											id='searchInput394'
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
												setfilteredAppVersionData(allAppVersionData);
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
										{filteredAppVersionData?.length === 0 ? (
											<div className='noResult'>
												<p>No Result Found</p>
											</div>
										) : (
											filteredAppVersionData?.map((app, appIndex) => {
												return (
													app?.versions?.length > 0 && (
														<div
															className={
																searchText?.length > 0
																	? 'box-check select-dropdown active'
																	: 'box-check select-dropdown'
															}
															key={appIndex}
														>
															<label>
																<span>
																	<span className='search-title'>{app?.app_display_name}</span>
																	<div className='secondary-label'>
																		Free | {app?.app_platform || app?.app_platform}
																	</div>
																</span>
															</label>
															<a className='arrow-btn'>
																<MdExpandMore className='material-icons' />
															</a>
															<div className='select-dropdown-box'>
																{app?.versions?.map((item, unitIndex) => (
																	<div className='box-check' key={unitIndex}>
																		<label>
																			<input
																				type='checkbox'
																				name={item?.id}
																				value={item?.name}
																				className='ckkBox val'
																				checked={item.item_checked}
																				onChange={() => handleCheckboxChange(appIndex, unitIndex, item?.name)}
																			/>
																			<span className='search-title'>{item?.name}</span>
																		</label>
																	</div>
																))}
															</div>
														</div>
													)
												);
											})
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
														<label className='filter-adunitbox-label' style={{ marginBottom: '5px' }}>
															<span>
																<span className='search-title filter-adunitbox-span'>{app?.app_display_name}</span>
																<div className='secondary-label'>Free | {app?.app_platform}</div>
															</span>
														</label>
														<a className='arrow-btn'>
															<MdExpandMore className='material-icons' />
														</a>
														<ul className='select-dropdown-box'>
															{app?.versions?.map((item, unitIndex) => (
																<div
																	className=' adunit-filter-children'
																	key={unitIndex}
																	onClick={() => handleClose(item)}
																>
																	<li
																		className='search-title'
																		style={{
																			marginLeft: '24px',
																			fontSize: '12px',
																		}}
																	>
																		<IoIosCloseCircleOutline
																			className='material-icons'
																			style={{
																				fontSize: '18px',
																				cursor: 'pointer',
																				marginRight: '6px',
																			}}
																		/>
																		{item?.name}
																	</li>
																</div>
															))}
														</ul>
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

export default AppVersion;
