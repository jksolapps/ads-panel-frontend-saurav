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
import { IoIosCloseCircleOutline } from 'react-icons/io';
import useSelectAll from '../../../hooks/useSelectAll';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const PlatformPopup = ({
	setTableNewData,
	setPageNumber,
	setIsReportLoaderVisible = () => {},
	setCurrentUnitPage,
	setDisabled,
}) => {
	const {
		platformValue,
		setPlatformValue,
		popupFlags,
		setPopupFlags,
		filteredPlatformData,
		setFilteredPlatformData,
		initialPlatformData,
		checkedPlatform,
		setCheckedPlatform,
		allPlatformData,
		setAllPlatformData,
		initialData,
		selectedReportFilter,
		setReportSelectedFilter,
	} = useContext(ReportContext);

	const [searchText, setSearchText] = useState('');
	useEffect(() => {
		setCheckedPlatform(allPlatformData?.filter((item) => item.item_checked));
	}, [allPlatformData, filteredPlatformData]);

	const handleCheckboxChange = (platform, index) => {
		const updatedFilteredData = filteredPlatformData.map((item) =>
			item.platform_auto_id === platform.platform_auto_id
				? { ...item, item_checked: !item.item_checked }
				: item
		);
		setFilteredPlatformData(updatedFilteredData);

		const updatedAllData = allPlatformData.map((item) =>
			item.platform_auto_id === updatedFilteredData[index].platform_auto_id
				? { ...updatedFilteredData[index] }
				: { ...item }
		);
		setAllPlatformData(updatedAllData);
	};

	const handleApply = (e, close) => {
		e.preventDefault();
		close();
		setReportSelectedFilter('PlatformPopup');
		setSearchText('');
		setFilteredPlatformData(allPlatformData);
		setIsReportLoaderVisible(true);
		setPageNumber(1);
		setPlatformValue(checkedPlatform);
		setPopupFlags(!popupFlags);
		setCurrentUnitPage(1);

		sessionStorage.setItem('platform_filter', JSON.stringify(checkedPlatform));
	};
	const handleClose = (item) => {
		const updatedPlatform = allPlatformData.map((platform) =>
			platform.platform_auto_id === item.platform_auto_id
				? { ...platform, item_checked: !platform.item_checked }
				: platform
		);
		setAllPlatformData(updatedPlatform);
		setFilteredPlatformData(updatedPlatform);
	};

	const handleClear = () => {
		setSearchText('');
		const resetData = filteredPlatformData?.map((v) => ({
			...v,
			item_checked: false,
		}));
		setAllPlatformData(resetData);
		setFilteredPlatformData(resetData);
	};

	const handleSearch = (e) => {
		const searchText = e.target.value.toLowerCase();
		const originalText = e.target.value;
		setSearchText(originalText);
		const updatedFilteredData = allPlatformData.filter((item) =>
			item.platform_display_name.toLowerCase().includes(searchText)
		);

		setFilteredPlatformData(updatedFilteredData);
	};

	//Select all
	const { areAllCheckedIn, handleSelectAll } = useSelectAll({
		allItemData: allPlatformData,
		filterItemData: filteredPlatformData,
		setAllItemData: setAllPlatformData,
		setAllFilterData: setFilteredPlatformData,
		uniqueId: 'platform_auto_id',
	});

	return (
		<Popover className='check-wrapper platform-size report_platform_filter'>
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
											{item.slice(0, 8)}
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
												setFilteredPlatformData(allPlatformData);
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
										{filteredPlatformData?.length === 0 ? (
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
												{filteredPlatformData?.map((platform, index) => (
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
											<button type='submit' className='apply-btn' onClick={() => setDisabled(true)}>
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

export default PlatformPopup;
