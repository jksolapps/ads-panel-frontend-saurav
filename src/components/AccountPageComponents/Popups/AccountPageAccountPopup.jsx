/**
 * @format
 * @Platform
 */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import { useLocation } from 'react-router-dom';
import { IoCloseOutline } from 'react-icons/io5';
import useSelectAll from '../../../hooks/useSelectAll';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const AccountPageAccountPopup = ({
	uniqueIdentifier,
	filterPopupData,
	setPageNumber,
	setIsReportLoaderVisible,
	selectedAccountData,
	setCurrentUnitPage,
	setAccountAdmob,
	setAccountGroupBy,
	setAccountNewApp,
	setAccountPlatform,
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
		setUnitValue,
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

		allAccountFilterPerformanceData,
		setallAccountFilterPerformanceData,
		filteredAccountFilterPerformanceData,
		setfilteredAccountFilterPerformanceData,
		checkedAccountFilterPerformance,
		setcheckedAccountFilterPerformance,
		setPerformanceData,
		setSelectedFilter,
	} = useContext(ReportContext);

	//filtering_data

	const [searchText, setSearchText] = useState('');
	const location = useLocation();

	useEffect(() => {
		const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_admob_filter'));
		const updatedData = filterPopupData?.map((item) => {
			const isChecked = localData?.some((app) => app.admob_auto_id == item.admob_auto_id);
			return { ...item, item_checked: isChecked ? isChecked : item?.item_checked };
		});

		setallAccountData(updatedData);
		setfilteredAccountData(updatedData);
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
	const handleApply = (e, close) => {
		e.preventDefault();
		 close();
		setSelectedFilter('AccountPageAccountPopup');
		setSearchText('');
		setIsReportLoaderVisible(true);
		setPageNumber(1);
		setAccountAdmob(checkedAccount);
		sessionStorage.setItem(uniqueIdentifier + '_admob_filter', JSON.stringify(checkedAccount));
		setPopupFlags(!popupFlags);

		setAccountNewApp([]);
		sessionStorage.removeItem(uniqueIdentifier + '_app_filter');

		setAccountPlatform(null);
		sessionStorage.removeItem(uniqueIdentifier + '_platform_filter');

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
		setAccountGroupBy([]);
		sessionStorage.removeItem(uniqueIdentifier + '_group_filter');
		close();
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
		<Popover className='check-wrapper select-account-wrapper account-orderby-filter'>
			<PopoverTrigger>
				<a
					className={
						selectedAccountData?.length > 0 ? 'popover_filter filter-btn btn-active' : 'filter-btn'
					}
				>
					<span>Account</span>
					{selectedAccountData?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{selectedAccountData
									?.map((item) => {
										return item?.admob_email;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{' '}
											{item}{' '}
										</li>
									))}
								{selectedAccountData?.length > 2 && <span>+{selectedAccountData?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className={'checkbox_popover full-and-multi-filter account-page-act-filter'}>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Admob Account</span>
							<a className='close-filter'>
								<MdClose className='material-icons' onClick={close} />
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
									<form id='report-account-class' onSubmit={(e) => handleApply(e, close)}>
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
				)}
			</PopoverContent>
		</Popover>
	);
};

export default AccountPageAccountPopup;
