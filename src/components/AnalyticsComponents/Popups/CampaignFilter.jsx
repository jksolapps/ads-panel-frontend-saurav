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
const CampaignFilter = ({
	filterPopupData,
	initialApp,
	setIsReportLoaderVisible = () => {},
	analyticsData,
	countryValue,
}) => {
	const {
		analyticsApp,
		campaignId,
		setCampaignID,
		analyticsPopupFlags,
		setAnalyticsPopupFlags,
		filterFlag,
		setFilterFlag,
		accountData,
		propertyData,
		setGroupData,
		setToggleResizeAnalytics,
		setResizeSticky,
	} = useContext(ReportContext);

	const [allCampaginAppData, setallCampaginAppData] = useState([]);
	const [filteredCampaginAppData, setfilteredCampaginAppData] = useState([]);
	const [checkedCamapaginApp, setcheckedCamapaginApp] = useState([]);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		if (filterPopupData?.length > 0) {
			let filteredAppData = filterPopupData.filter((item) =>
				analyticsApp?.length > 0
					? analyticsApp.some((ele) => ele?.app_auto_id == item?.ap_app_auto_id)
					: initialApp.some((ele) => ele?.app_auto_id == item?.ap_app_auto_id)
			);
			filteredAppData.sort((a, b) => {
				const aCost =
					analyticsData?.find((data) => data.firstUserCampaignId === a.campaign_id)?.advertiserAdCost ||
					0;
				const bCost =
					analyticsData?.find((data) => data.firstUserCampaignId === b.campaign_id)?.advertiserAdCost ||
					0;
				return bCost - aCost;
			});
			const appID = analyticsApp?.[0]?.app_auto_id;
			sessionStorage.setItem(appID + '_sorted_campaign_list', JSON.stringify(filteredAppData));
			const initialAppData = filteredAppData.map((v, index) => {
				return {
					...v,
					item_checked: false,
				};
			});
			const localData = JSON.parse(sessionStorage.getItem('analytic_campaign_filter'));
			initialAppData.forEach((item) => {
				const isChecked = localData?.some((ele) => ele.campaign_auto_id == item.campaign_auto_id);
				item.item_checked = isChecked;
			});
			setallCampaginAppData(initialAppData);
			setfilteredCampaginAppData(initialAppData);
		}
	}, [filterPopupData, analyticsApp, analyticsData]);

	useEffect(() => {
		setcheckedCamapaginApp(allCampaginAppData?.filter((item) => item.item_checked));
	}, [allCampaginAppData, filteredCampaginAppData]);

	const handleCheckboxChange = (app, index) => {
		const updatedFilteredData = filteredCampaginAppData.map((item) =>
			item?.campaign_auto_id === app?.campaign_auto_id
				? { ...item, item_checked: !item.item_checked }
				: item
		);
		setfilteredCampaginAppData(updatedFilteredData);
		setcheckedCamapaginApp(updatedFilteredData?.filter((item) => item.item_checked));
		const updatedAllData = allCampaginAppData.map((item) =>
			item.campaign_auto_id === updatedFilteredData[index].campaign_auto_id
				? { ...updatedFilteredData[index] }
				: { ...item }
		);
		setallCampaginAppData(updatedAllData);
	};
	const handleApply = (e, close) => {
		setToggleResizeAnalytics(true);
		setResizeSticky(false);
		e.preventDefault();
		setSearchText('');
		setfilteredCampaginAppData(allCampaginAppData);
		setIsReportLoaderVisible(true);
		setFilterFlag(!filterFlag);
		setAnalyticsPopupFlags(!analyticsPopupFlags);
		setCampaignID(checkedCamapaginApp);
		sessionStorage.setItem('analytic_campaign_filter', JSON.stringify(checkedCamapaginApp));
		close();
	};
	const handleClose = (item) => {
		const updatedApp = allCampaginAppData?.map((app) =>
			app.campaign_auto_id === item.campaign_auto_id
				? { ...app, item_checked: !app.item_checked }
				: app
		);
		setallCampaginAppData(updatedApp);
		setfilteredCampaginAppData(updatedApp);
	};
	const handleClear = () => {
		const resetData = filteredCampaginAppData?.map((v) => ({
			...v,
			item_checked: false,
		}));
		const resetDataForAll = allCampaginAppData?.map((v) => ({
			...v,
			item_checked: false,
		}));
		setallCampaginAppData(resetDataForAll);
		setfilteredCampaginAppData(resetData);
	};
	const handleSearch = (e) => {
		const searchText = e.target.value.toLowerCase();
		const originalText = e.target.value;
		setSearchText(originalText);
		const updatedFilteredData = allCampaginAppData.filter((item) =>
			item.campaign_name.toLowerCase().includes(searchText)
		);

		setfilteredCampaginAppData(updatedFilteredData);
	};

	//SelectAll
	const { areAllCheckedIn, handleSelectAll } = useSelectAll({
		allItemData: allCampaginAppData,
		filterItemData: filteredCampaginAppData,
		setAllItemData: setallCampaginAppData,
		setAllFilterData: setfilteredCampaginAppData,
		uniqueId: 'campaign_auto_id',
	});

	return (
		<Popover className={`check-wrapper column-filter custom_campaign_filter_popup campagin-filter`}>
			<PopoverTrigger>
				<a
					className={
						campaignId?.length > 0 ? 'popover_filter filter-btn btn-active' : 'popover_filter filter-btn'
					}
				>
					<span>Campaign</span>
					{campaignId?.length > 0 ? (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{campaignId
									?.map((item) => {
										return item?.campaign_name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item}{' '}
										</li>
									))}
								{campaignId?.length > 2 && <span>+{campaignId?.length - 2} more </span>}
							</ul>
						</>
					) : null}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter ' id='Lorems'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Campaign</span>
							<a className='close-filter' onClick={close}>
								<MdClose className='material-icons' />
							</a>
						</div>
						<div className='check-boxes-inner'>
							<div className='left-check-box box2 campaign-left-box'>
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
												setfilteredCampaginAppData(allCampaginAppData);
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
										{filteredCampaginAppData?.length === 0 ? (
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
												{filteredCampaginAppData?.map((app, index) => (
													<div className='box-check' key={index}>
														<label>
															<input
																type='checkbox'
																name={app?.campaign_auto_id}
																value={app?.campaign_name}
																className='ckkBox val'
																checked={app.item_checked || ''}
																onChange={() => handleCheckboxChange(app, index)}
															/>
															<div className='label-container'>
																<div className='primary-label-wrap'>
																	<div title={app?.campaign_name} className='primary-label'>
																		<span>{app?.campaign_name}</span>
																	</div>
																</div>
															</div>
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
							<div className='right-result-box box2 campaign-right-box'>
								<div className='none-selected-text'>
									<span></span>
									<a className='custom-clear-all' onClick={handleClear}>
										Clear all
									</a>
								</div>
								<div className='right-result-row'>
									{checkedCamapaginApp?.length === 0 && <EmptyListBox />}
									{checkedCamapaginApp?.map((app, index) => (
										<div className='result-box' key={index} onClick={() => handleClose(app)}>
											<div className='result-box'>
												<div className='permission-app app-item custom-app-box'>
													<div className='label-container'>
														<div className='primary-label-wrap'>
															<div title={app?.campaign_name} className='primary-label'>
																<span>{app?.campaign_name}</span>
															</div>
														</div>
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

export default CampaignFilter;
