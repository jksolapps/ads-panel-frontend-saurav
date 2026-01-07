/**
 * @format
 * @Platform
 */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReportContext } from '../../../context/ReportContext';
import { IoCloseOutline } from 'react-icons/io5';
import useSelectAll from '../../../hooks/useSelectAll';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';
const AccountSelectPopup = ({
	filterPopupData,
	filterActualData,
	setPageNumber,
	setIsReportLoaderVisible = () => {},
	selectedAccountData,
	setSelectedAccountData,
	setCurrentUnitPage,
	setAccountChecked,
	filteredAppData,
	setFilteredAppData,
	setAllAppData,
	allAppData,
}) => {
	const {
		popupFlags,
		setPopupFlags,
		setAppValue,
		setUnitValue,
		setFormatValue,
		setPlatformValue,
		setFilteredPlatformData,
		filteredPlatformData,
		setCheckedPlatform,
		allPlatformData,
		setAllPlatformData,
		initialPlatformData,
		allFormatData,
		setAllFormatData,
		filteredFormatData,
		setFilteredFormatData,
		setCheckedFormat,
		setCheckedApp,
	} = useContext(ReportContext);

	//filtering_data

	const [allAccountData, setAccountData] = useState([]);
	const [filteredAccountData, setFilteredAccountData] = useState([]);
	const [checkedAccount, setcheckedAccount] = useState([]);
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

	const { adId } = queryParams;
	const reportlocation = useLocation();
	const navigate = useNavigate();
	const admob_app_id = reportlocation?.state?.admob_app_id;
	const admobIdByGraph = reportlocation?.state?.admob_id;

	function getUniqueAdmobIds(apps) {
		const uniqueIds = {};
		apps?.forEach((app) => {
			const admobId = app.admob_auto_id;
			if (!uniqueIds[admobId]) {
				uniqueIds[admobId] = app;
			} else {
				if (app.item_checked) {
					uniqueIds[admobId] = app;
				}
			}
		});

		return Object.values(uniqueIds);
	}

	useEffect(() => {
		setAccountData(filterPopupData);
		setFilteredAccountData(filterPopupData);
		const localData = JSON.parse(sessionStorage.getItem('report_admob_filter'));

		if (adId) {
			const initialFilterPopupData = filterPopupData.map((item) =>
				item.admob_auto_id == adId ? { ...item, item_checked: true } : { ...item, item_checked: false }
			);
			setSelectedAccountData(initialFilterPopupData?.filter((item) => item.item_checked));
			setFilteredAccountData(initialFilterPopupData);
		} else if (admob_app_id) {
			const initialFilterPopupData = filterActualData.all_app_list?.map((item) =>
				item.app_admob_app_id == admob_app_id
					? { ...item, item_checked: true }
					: { ...item, item_checked: false }
			);
			setSelectedAccountData(initialFilterPopupData?.filter((item) => item.item_checked));
			const uniqueFilterPopupData = getUniqueAdmobIds(initialFilterPopupData);
			setFilteredAccountData(uniqueFilterPopupData);
		} else if (admobIdByGraph) {
			const initialFilterPopupData = filterPopupData?.map((item) =>
				item.admob_auto_id == admobIdByGraph
					? { ...item, item_checked: true }
					: { ...item, item_checked: false }
			);
			setSelectedAccountData(initialFilterPopupData?.filter((item) => item.item_checked));
			setFilteredAccountData(initialFilterPopupData);
		} else {
			const updatedData = filterPopupData?.map((item) => {
				const isChecked = localData?.some((app) => app.admob_auto_id == item.admob_auto_id);
				return { ...item, item_checked: isChecked ? isChecked : item?.item_checked };
			});
			setAccountData(updatedData);
			setFilteredAccountData(updatedData);
			setSelectedAccountData(updatedData?.filter((item) => item.item_checked));
		}
	}, [filterPopupData, filterActualData]);
	var baseUrl = window.location.href.split('?')[0];

	const handleCheckboxChange = (platform, index) => {
		//clear search query
		history.pushState({}, document.title, baseUrl);

		setAccountChecked(true);
		const updatedFilteredData = filteredAccountData.map((item) =>
			item.admob_auto_id === platform.admob_auto_id
				? { ...item, item_checked: !item.item_checked }
				: item
		);
		setFilteredAccountData(updatedFilteredData);

		setAccountData(updatedFilteredData);
		setcheckedAccount(updatedFilteredData.filter((item) => item.item_checked));

		const updatedAllData = allAccountData.map((item) =>
			item.admob_auto_id === updatedFilteredData[index].admob_auto_id
				? { ...updatedFilteredData[index] }
				: { ...item }
		);
		setAccountData(updatedAllData);
	};

	const handleSearch = (e) => {
		const searchText = e?.target?.value?.toLowerCase();
		setSearchText(searchText);
		const updatedFilteredData = allAccountData?.filter((item) =>
			item?.admob_email?.toLowerCase()?.includes(searchText)
		);
		setFilteredAccountData(updatedFilteredData);
	};

	useEffect(() => {
		filterPopupData?.forEach((item) => {
			if (item?.item_checked) {
				const appIdsString = JSON?.stringify(item?.admob_auto_id);
				localStorage?.setItem('accountId', appIdsString);
			}
		});
	}, [filterPopupData]);
	const setAccountLocally = (data) => {
		data?.map((item) => {
			const idsString = JSON?.stringify(item?.admob_auto_id);
			localStorage?.setItem('accountId', idsString);
		});
	};

	const handleApply = (e, close) => {
		e.preventDefault();
		close();
		setSearchText('');
		setFilteredAccountData(allAccountData);
		setIsReportLoaderVisible(true);
		setPageNumber(1);
		setAccountLocally(checkedAccount);
		setUnitValue(null);
		navigate(reportlocation.pathname?.state === '');
		setAppValue(null);
		setFormatValue(null);
		setPlatformValue(null);
		setFilteredPlatformData(initialPlatformData);
		setAllPlatformData(initialPlatformData);
		setCheckedPlatform(null);
		setFilteredFormatData(filteredFormatData.map((item) => ({ ...item, item_checked: false })));
		setAllFormatData(allFormatData.map((item) => ({ ...item, item_checked: false })));
		setCheckedFormat(null);
		setFilteredAppData(filteredAppData.map((item) => ({ ...item, item_checked: false })));
		setAllAppData(allAppData.map((item) => ({ ...item, item_checked: false })));
		sessionStorage.setItem('app_filter', JSON.stringify([]));
		setCheckedApp([]);
		if (checkedAccount?.length === 0) {
			const customStoredData = allAccountData.filter((item) => item.item_checked);
			setSelectedAccountData(customStoredData);
			sessionStorage.setItem('report_admob_filter', JSON.stringify(customStoredData));
		} else {
			setSelectedAccountData(checkedAccount);
			sessionStorage.setItem('report_admob_filter', JSON.stringify(checkedAccount));
		}
		setPopupFlags(!popupFlags);
		setCurrentUnitPage(1);
	};

	//Select all
	const { areAllCheckedIn, handleSelectAll } = useSelectAll({
		allItemData: allAccountData,
		filterItemData: filteredAccountData,
		setAllItemData: setAccountData,
		setAllFilterData: setFilteredAccountData,
	});

	return (
		<Popover className='check-wrapper select-account-wrapper'>
			<PopoverTrigger>
				<a
					className={
						selectedAccountData?.length > 0
							? 'popover_filter filter-btn btn-active'
							: 'popover_filter filter-btn'
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
											{item}
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
											id='searchInput77'
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
												setFilteredAccountData(allAccountData);
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
									<form id='report-account-class'>
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
												onClick={(e) => handleApply(e, close)}
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

export default AccountSelectPopup;
