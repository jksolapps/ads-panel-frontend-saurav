/**
 * @format
 * @Platform
 * @platform
 * @platform
 * @platform
 * @platform
 */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import { IoCloseOutline } from 'react-icons/io5';
import useSelectAll from '../../../hooks/useSelectAll';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';
const AccountPlatFormPopup = ({
	uniqueIdentifier,
	platformValue,
	setPlatformValue,
	setPageNumber,
	setIsReportLoaderVisible,
	setCurrentUnitPage,
	setAccountGroupBy,
}) => {
	const {
		popupFlags,
		setPopupFlags,
		allAccountPlatformData,
		setallAccountPlatformData,
		filteredAccountPlatformData,
		setfilteredAccountPlatformData,
		checkedAccountPlatform,
		setcheckedAccountPlatform,
		initialAccountPlatformData,
		allUnitData,
		setAllUnitData,
		searchAllUnitData,
		setSearchAllUnitData,
		checkedUnit,
		setCheckedUnit,
		selectedFilter,
		setSelectedFilter,
	} = useContext(ReportContext);

	//All Filter Popup Data

	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_platform_filter'));
		const updatedData = initialAccountPlatformData?.map((item) => {
			const isChecked = localData?.some((app) => app.platform_auto_id == item.platform_auto_id);
			return { ...item, item_checked: isChecked ? isChecked : item?.item_checked };
		});
		setfilteredAccountPlatformData(updatedData);
		setallAccountPlatformData(updatedData);
	}, []);

	useEffect(() => {
		setcheckedAccountPlatform(allAccountPlatformData.filter((item) => item.item_checked));
	}, [allAccountPlatformData, filteredAccountPlatformData]);

	const handleCheckboxChange = (platform, index) => {
		const updatedFilteredData = filteredAccountPlatformData.map((item) =>
			item.platform_auto_id === platform.platform_auto_id
				? { ...item, item_checked: !item.item_checked }
				: item
		);
		setfilteredAccountPlatformData(updatedFilteredData);

		const updatedAllData = allAccountPlatformData.map((item) =>
			item.platform_auto_id === updatedFilteredData[index].platform_auto_id
				? { ...updatedFilteredData[index] }
				: { ...item }
		);
		setallAccountPlatformData(updatedAllData);
	};

	const handleApply = (e, close) => {
		setSearchText('');
		setfilteredAccountPlatformData(allAccountPlatformData);
		e.preventDefault();
		setIsReportLoaderVisible(true);
		setPageNumber(1);
		setPlatformValue(checkedAccountPlatform);
		sessionStorage.setItem(
			uniqueIdentifier + '_platform_filter',
			JSON.stringify(checkedAccountPlatform)
		);
		setPopupFlags(!popupFlags);
		setCurrentUnitPage(1);
		setSearchAllUnitData(() => {
			const data = searchAllUnitData?.map((group) => ({
				...group,
				group_apps: group.group_apps.map((unit) => ({
					...unit,
					unit_checked: false,
				})),
			}));
			return data;
		});
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

	const handleClose = (item) => {
		const updatedPlatform = allAccountPlatformData.map((platform) =>
			platform.platform_auto_id === item.platform_auto_id
				? { ...platform, item_checked: !platform.item_checked }
				: platform
		);
		setallAccountPlatformData(updatedPlatform);
		setfilteredAccountPlatformData(updatedPlatform);
	};
	const handleClear = () => {
		setSearchText('');
		const resetData = initialAccountPlatformData?.map((v) => ({
			...v,
			item_checked: false,
		}));
		setallAccountPlatformData(resetData);
		setfilteredAccountPlatformData(resetData);
	};

	const handleSearch = (e) => {
		const searchText = e.target.value.toLowerCase();
		const originalText = e.target.value;
		setSearchText(originalText);
		const updatedFilteredData = allAccountPlatformData.filter((item) =>
			item.platform_display_name.toLowerCase().includes(searchText)
		);

		setfilteredAccountPlatformData(updatedFilteredData);
	};

	const { areAllCheckedIn, handleSelectAll } = useSelectAll({
		allItemData: allAccountPlatformData,
		filterItemData: filteredAccountPlatformData,
		setAllItemData: setallAccountPlatformData,
		setAllFilterData: setfilteredAccountPlatformData,
		uniqueId: 'platform_auto_id',
	});

	return (
		<Popover className='check-wrapper platform-size platform-filter'>
			<PopoverTrigger>
				<a
					className={
						platformValue?.length > 0
							? 'popover_filter filter-btn btn-active'
							: 'popover_filter filter-btn'
					}
				>
					<span>Platform</span>
					{platformValue?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{platformValue
									?.map((item) => {
										return item?.platform_display_name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{' '}
											{item}{' '}
										</li>
									))}
								{platformValue?.length > 2 && <span>+{platformValue?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className={'checkbox_popover full-and-multi-filter account-platform-filter'}>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Platform</span>
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
											id='searchInput88'
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
												setfilteredAccountPlatformData(allAccountPlatformData);
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
										{filteredAccountPlatformData?.length === 0 ? (
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
												{filteredAccountPlatformData?.map((platform, index) => (
													<div className='box-check' key={index}>
														<label>
															<input
																type='checkbox'
																name={platform?.platform_auto_id}
																value={platform?.platform_display_name}
																className='ckkBox val'
																checked={platform.item_checked}
																onChange={() => handleCheckboxChange(platform, index)}
															/>
															<span>
																<span className='search-title'>{platform?.platform_display_name}</span>
															</span>
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
						</div>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default AccountPlatFormPopup;
