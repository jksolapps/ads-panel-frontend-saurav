/** @format */

import { useState, useEffect } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import useSelectAll from '../../hooks/useSelectAll';
import EmptyListBox from '../GeneralComponents/EmptyListBox';
import { useGroupSettings } from '../../context/GroupSettingsContext';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/Popover';
const GeneralCampaign = ({
	uniqueIdentifier,
	filterPopupData,
	campaignId,
	setCampaignId,
	setIsLoaderVisible = () => {},
	fetchFlags,
	setFetchFlags,
	analyticsApp,
	initialApp,
	setCountryValue,
	isCountryChecked,
	isCampaignChecked,
	setIsCampaignChecked,
	setDynamicSelectedFilter,
	setIsCampaignApplied,
	setIsClearClicked,
}) => {
	const [allCampaignAppData, setAllCampaignAppData] = useState([]);
	const [filteredCampaignAppData, setFilteredCampaignAppData] = useState([]);
	const [checkedCampaignApp, setCheckedCampaignApp] = useState([]);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		if (filterPopupData?.length > 0) {
			let filteredAppData = filterPopupData.filter((item) =>
				analyticsApp?.length > 0
					? analyticsApp.some((ele) => ele?.app_auto_id == item?.ap_app_auto_id)
					: initialApp.some((ele) => ele?.app_auto_id == item?.ap_app_auto_id)
			);
			if (uniqueIdentifier == 'heatmap') {
				const appID = analyticsApp?.[0]?.app_auto_id;
				const localSortedFilterList = JSON.parse(
					sessionStorage.getItem(appID + '_sorted_campaign_list')
				);
				const isMatchFound = analyticsApp?.some((app) =>
					localSortedFilterList?.some((local) => local.ap_app_auto_id === app.app_auto_id)
				);
				if (isMatchFound) {
					filteredAppData = localSortedFilterList;
				}
			}
			const initialAppData = filteredAppData.map((v, index) => {
				return {
					...v,
					item_checked: false,
				};
			});
			const localData = JSON.parse(sessionStorage.getItem(`${uniqueIdentifier}_selected_item`));
			initialAppData.forEach((item) => {
				const isChecked = localData?.some((ele) => ele.campaign_auto_id == item.campaign_auto_id);
				item.item_checked = isChecked ? isChecked : false;
			});
			setCampaignId(initialAppData?.filter((item) => item.item_checked));
			setAllCampaignAppData(initialAppData);
			setFilteredCampaignAppData(initialAppData);
		} else {
			setAllCampaignAppData([]);
			setFilteredCampaignAppData([]);
		}
	}, [filterPopupData, analyticsApp, isCountryChecked]);

	useEffect(() => {
		setCheckedCampaignApp(allCampaignAppData?.filter((item) => item.item_checked));
	}, [allCampaignAppData, filteredCampaignAppData]);

	const handleCheckboxChange = (app, index) => {
		const updatedFilteredData = filteredCampaignAppData.map((item) =>
			item?.campaign_auto_id === app?.campaign_auto_id
				? { ...item, item_checked: !item.item_checked }
				: item
		);
		setFilteredCampaignAppData(updatedFilteredData);
		setCheckedCampaignApp(updatedFilteredData?.filter((item) => item.item_checked));
		const updatedAllData = allCampaignAppData.map((item) =>
			item.campaign_auto_id === updatedFilteredData[index].campaign_auto_id
				? { ...updatedFilteredData[index] }
				: { ...item }
		);
		setAllCampaignAppData(updatedAllData);
	};
	const handleApply = (e, close) => {
		e.preventDefault();
		close();
		setSearchText('');
		setFilteredCampaignAppData(allCampaignAppData);
		setIsLoaderVisible(true);
		setCampaignId(checkedCampaignApp);
		if (uniqueIdentifier == 'heatmap') {
			setCountryValue([]);
			sessionStorage.removeItem('heatmap_country_filter');
			setIsCampaignChecked(!isCampaignChecked);
			setDynamicSelectedFilter('GeneralCampaign');
			sessionStorage.setItem(`${uniqueIdentifier}_selected_item`, JSON.stringify(checkedCampaignApp));
		}
		if (uniqueIdentifier == 'main_campaign') {
			if (checkedCampaignApp.length == 0) {
				setIsClearClicked(true);
				setIsCampaignApplied(false);
			} else {
				setIsClearClicked(false);
				setIsCampaignApplied(true);
			}
			// sessionStorage.setItem(uniqueIdentifier + '_selected_item', JSON.stringify(checkedCampaignApp));
		}
		if (uniqueIdentifier != 'main_campaign') {
			setFetchFlags(!fetchFlags);
		}
		if (uniqueIdentifier == 'date_wise_campaign') {
			setDynamicSelectedFilter('GeneralCampaignFilter');
		}
	};
	const handleClose = (item) => {
		const updatedApp = allCampaignAppData?.map((app) =>
			app.campaign_auto_id === item.campaign_auto_id
				? { ...app, item_checked: !app.item_checked }
				: app
		);
		setAllCampaignAppData(updatedApp);
		setFilteredCampaignAppData(updatedApp);
	};
	const handleClear = () => {
		const resetData = filteredCampaignAppData?.map((v) => ({
			...v,
			item_checked: false,
		}));
		const resetDataForAll = allCampaignAppData?.map((v) => ({
			...v,
			item_checked: false,
		}));
		setAllCampaignAppData(resetDataForAll);
		setFilteredCampaignAppData(resetData);
	};
	const handleSearch = (e) => {
		const searchText = e.target.value.toLowerCase();
		const originalText = e.target.value;
		setSearchText(originalText);
		const updatedFilteredData = allCampaignAppData.filter((item) =>
			item.campaign_name.toLowerCase().includes(searchText)
		);
		setFilteredCampaignAppData(updatedFilteredData);
	};

	//SelectAll
	const { areAllCheckedIn, handleSelectAll } = useSelectAll({
		allItemData: allCampaignAppData,
		filterItemData: filteredCampaignAppData,
		setAllItemData: setAllCampaignAppData,
		setAllFilterData: setFilteredCampaignAppData,
		uniqueId: 'campaign_auto_id',
	});

	return (
		<Popover
			className={`check-wrapper column-filter custom_campaign_filter_popup campagin-filter ${uniqueIdentifier}-dynamic-filter`}
		>
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
								:
								{campaignId
									?.map((item) => {
										return item?.campaign_name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{' '}
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
												setFilteredCampaignAppData(allCampaignAppData);
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
										{filteredCampaignAppData?.length === 0 ? (
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
												{filteredCampaignAppData?.map((app, index) => (
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
									{checkedCampaignApp?.length === 0 && <EmptyListBox />}
									{checkedCampaignApp?.map((app, index) => (
										<div className='result-box' key={index} onClick={() => handleClose(app)}>
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

export default GeneralCampaign;
