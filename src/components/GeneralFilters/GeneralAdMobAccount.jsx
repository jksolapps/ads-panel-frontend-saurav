/**
 * @format
 * @Platform
 */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { IoCloseOutline } from 'react-icons/io5';
import useSelectAll from '../../hooks/useSelectAll';
import { ReportContext } from '../../context/ReportContext';

const GeneralAdMobAccount = ({
	filterPopupData,
	setPageNumber,
	setIsReportLoaderVisible,
	selectedAccountData,
	setCurrentUnitPage,
	setRouteChange,
}) => {
	const {
		popupFlags,
		setPopupFlags,
		allAccountData,
		setallAccountData,
		filteredAccountData,
		setfilteredAccountData,
		checkedAccount,
		setcheckedAccount,
		setaccountApp,
		setUnitValue,
		setPlatformValue,
		setaccountOrder,
		setOrderToggle,
		allAccounAppData,
		setallAccounAppData,
		filteredAccountAppData,
		setfilteredAccountAppData,
		setcheckedAccountApp,
		allAccountPlatformData,
		setallAccountPlatformData,
		filteredAccountPlatformData,
		setfilteredAccountPlatformData,
		setcheckedAccountPlatform,
		allUnitData,
		setAllUnitData,
		searchAllUnitData,
		setSearchAllUnitData,
		checkedUnit,
		setCheckedUnit,
		setGroupValue,

		allAccountFilterPerformanceData,
		setallAccountFilterPerformanceData,
		filteredAccountFilterPerformanceData,
		setfilteredAccountFilterPerformanceData,
		checkedAccountFilterPerformance,
		setcheckedAccountFilterPerformance,
		setPerformanceData,
		setSelectedFilter,
		setaccountPageAccountData,
		accountpageAccountData,
	} = useContext(ReportContext);

	//filtering_data

	const [searchText, setSearchText] = useState('');
	const location = useLocation();

	useEffect(() => {
		setallAccountData(filterPopupData);
		setfilteredAccountData(filterPopupData);
	}, [filterPopupData]);

	useEffect(() => {
		setcheckedAccount(allAccountData?.filter((item) => item.item_checked));
	}, [filteredAccountData]);

	const handleCheckboxChange = (platform, index) => {
		const updatedFilteredData = filteredAccountData.map((item) =>
			item.admob_auto_id === platform.admob_auto_id
				? { ...item, item_checked: !item.item_checked }
				: item
		);
		setfilteredAccountData(updatedFilteredData);
		setcheckedAccount(updatedFilteredData.filter((item) => item.item_checked));

		const updatedAllData = allAccountData.map((item) =>
			item.admob_auto_id === updatedFilteredData[index].admob_auto_id
				? { ...updatedFilteredData[index] }
				: { ...item }
		);
		setallAccountData(updatedAllData);
	};
	const handleApply = (e) => {
		e.preventDefault();
		setSelectedFilter('AccountPageAccountPopup');
		setSearchText('');
		setIsReportLoaderVisible(true);
		setPageNumber(1);
		setaccountPageAccountData(checkedAccount);
		setPopupFlags(!popupFlags);
		setaccountApp(null);
		setPlatformValue(null);
		setUnitValue(null);
		setaccountOrder(null);
		setOrderToggle(false);
		setCurrentUnitPage(1);
		setfilteredAccountAppData(
			filteredAccountAppData.map((item) => ({ ...item, item_checked: false }))
		);
		setallAccounAppData(allAccounAppData.map((item) => ({ ...item, item_checked: false })));
		setcheckedAccountApp(null);
		setfilteredAccountFilterPerformanceData(
			filteredAccountFilterPerformanceData.map((item) => ({ ...item, item_checked: false }))
		);
		setallAccountFilterPerformanceData(
			allAccountFilterPerformanceData.map((item) => ({ ...item, item_checked: false }))
		);
		setcheckedAccountFilterPerformance(null);
		setPerformanceData();
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
		setSearchAllUnitData(
			searchAllUnitData?.map((group) => ({
				...group,
				ad_units: group.ad_units.map((unit) => ({
					...unit,
					unit_checked: false,
				})),
			}))
		);
		setAllUnitData(
			allUnitData?.map((group) => ({
				...group,
				ad_units: group.ad_units.map((unit) => ({
					...unit,
					unit_checked: false,
				})),
			}))
		);
		setCheckedUnit(null);
		setGroupValue([]);
	};

	const handleSearch = (e) => {
		const searchText = e.target.value.toLowerCase();
		const originalText = e.target.value;
		setSearchText(originalText);
		const updatedFilteredData = allAccountData.filter((item) =>
			item.admob_email.toLowerCase().includes(searchText)
		);

		setfilteredAccountData(updatedFilteredData);
	};

	//Select all
	const { areAllCheckedIn, handleSelectAll } = useSelectAll({
		allItemData: allAccountData,
		filterItemData: filteredAccountData,
		setAllItemData: setallAccountData,
		setAllFilterData: setfilteredAccountData,
	});

	return (
		<div className='check-wrapper select-account-wrapper account-orderby-filter'>
			<a
				className={
					selectedAccountData?.length > 0 ? 'add-filter filter-btn btn-active' : 'add-filter filter-btn'
				}
			>
				Account
				{selectedAccountData?.length > 0 && (
					<>
						<span className='selected-item'>
							:
							{selectedAccountData
								?.map((item) => {
									return item?.admob_email;
								})
								?.slice(0, 2)
								?.map((item, index) => (
									<span className='selected-item-value' key={index}>
										{' '}
										{item}{' '}
									</span>
								))}
							{selectedAccountData?.length > 2 && <span>+{selectedAccountData?.length - 2} more </span>}
						</span>
					</>
				)}
			</a>
			<div className={'checkboxes full-and-multi-filter account-page-act-filter'}>
				<div className='filter-title-box'>
					<span className='predicate-field-label'>Admob Account</span>
					<a className='close-filter'>
						<MdClose className='material-icons' />
					</a>
				</div>
				<div className='check-boxes-inner'>
					<div className='left-check-box box2'>
						<div className='search-input'>
							<div className='box'>
								<input
									className='input search-btn-input focus-border'
									id='searchInput99'
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
										setcheckedAccount(allAccountData);
										setfilteredAccountData(allAccountData);
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
							<form id='report-account-class' onSubmit={handleApply}>
								{filteredAccountData?.length === 0 ? (
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
										{filteredAccountData?.map((platform, index) => (
											<div className='box-check' key={index}>
												<label>
													<input
														type='checkbox'
														name={platform?.admob_auto_id}
														value={platform.item_checked ? platform.item_checked : index == 0}
														checked={platform.item_checked}
														onChange={() => handleCheckboxChange(platform, index)}
													/>
													<span>
														<span className='search-title'>{platform?.admob_email}</span>
													</span>
												</label>
											</div>
										))}
									</>
								)}
								<div className='apply-btn-wrap text-right'>
									<button
										type='submit'
										className='apply-btn'
										disabled={filteredAccountData?.length === 0 ?? true}
									>
										Apply
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GeneralAdMobAccount;
