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
const TypePopup = ({
	uniqueIdentifier,
	setPageNumber,
	setIsReportLoaderVisible,
	setCurrentUnitPage,
	setSortedArray,
}) => {
	const {
		accountType,
		setaccountType,
		popupFlags,
		setPopupFlags,
		setaccountOrder,
		setOrderToggle,
		setSelectedFilter,
	} = useContext(ReportContext);

	//All Filter Popup Data
	const initialData = [
		{ type_auto_id: '1', type_auto_name: 'Revenue', item_checked: true, order_id: '1' },
		{ type_auto_id: '2', type_auto_name: 'eCPM', item_checked: false, order_id: '2' },
		{ type_auto_id: '3', type_auto_name: 'Impressions', item_checked: false, order_id: '3' },
	];

	const [allPlatformData, setAllPlatformData] = useState([]);
	const [filteredPlatformData, setFilteredPlatformData] = useState([]);
	const [checkedPlatform, setCheckedPlatform] = useState([]);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_type_filter'));
		const initialUpdatedData = initialData.map((item, index) => {
			return {
				...item,
				item_checked: !localData && index == 0 ? true : false,
			};
		});
		const updatedData = initialUpdatedData?.map((item) => {
			const isChecked = localData?.some((app) => app.type_auto_id == item.type_auto_id);
			return { ...item, item_checked: isChecked ? isChecked : item?.item_checked };
		});
		setAllPlatformData(updatedData);
		setFilteredPlatformData(updatedData);
		if (!localData) {
			const filterChecked = updatedData?.filter((item) => item?.item_checked);
			setaccountType(filterChecked);
			sessionStorage.setItem(uniqueIdentifier + '_type_filter', JSON.stringify(filterChecked));
		}
	}, [uniqueIdentifier]);

	useEffect(() => {
		setCheckedPlatform(allPlatformData.filter((item) => item.item_checked));
	}, [allPlatformData, filteredPlatformData]);

	const handleCheckboxChange = (platform, index) => {
		const updatedFilteredData = filteredPlatformData.map((item) =>
			item.type_auto_id === platform.type_auto_id
				? { ...item, item_checked: !item.item_checked }
				: item
		);
		setFilteredPlatformData(updatedFilteredData);

		const updatedAllData = allPlatformData.map((item) =>
			item.type_auto_id === updatedFilteredData[index].type_auto_id
				? { ...updatedFilteredData[index] }
				: { ...item }
		);
		setAllPlatformData(updatedAllData);
	};

	const handleApply = (e, close) => {
		setSelectedFilter('TypePopup');
		setSearchText('');
		setFilteredPlatformData(allPlatformData);
		e.preventDefault();
		setIsReportLoaderVisible(true);
		// setPageNumber(1);
		setaccountType(checkedPlatform);
		sessionStorage.setItem(uniqueIdentifier + '_type_filter', JSON.stringify(checkedPlatform));

		setSortedArray([]);
		setPopupFlags(!popupFlags);
		// setCurrentUnitPage(1);
		setaccountOrder([]);
		sessionStorage.setItem(uniqueIdentifier + '_order_filter', JSON.stringify([]));

		setOrderToggle(false);
		close();
	};
	const handleClose = (item) => {
		const updatedPlatform = allPlatformData.map((platform) =>
			platform.type_auto_id === item.type_auto_id
				? { ...platform, item_checked: !platform.item_checked }
				: platform
		);
		setAllPlatformData(updatedPlatform);
		setFilteredPlatformData(updatedPlatform);
	};

	const handleClear = () => {
		setSearchText('');
		const resetData = initialData.map((v) => ({
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
			item.type_auto_name.toLowerCase().includes(searchText)
		);

		setFilteredPlatformData(updatedFilteredData);
	};

	//Select all
	const { areAllCheckedIn, handleSelectAll } = useSelectAll({
		allItemData: allPlatformData,
		filterItemData: filteredPlatformData,
		setAllItemData: setAllPlatformData,
		setAllFilterData: setFilteredPlatformData,
		uniqueId: 'type_auto_id',
	});

	return (
		<Popover className='check-wrapper type-order-size custom_small_new_filter'>
			<PopoverTrigger>
				<a
					className={
						accountType?.length > 0 ? 'popover_filter filter-btn btn-active' : 'popover_filter filter-btn'
					}
				>
					<span>Type</span>
					{accountType?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{accountType
									?.map((item) => {
										return item?.type_auto_name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{' '}
											{item}{' '}
										</li>
									))}
								{accountType?.length > 2 && <span>+{accountType?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className={'checkbox_popover full-and-multi-filter account-type-filter'}>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Type</span>
							<a className='close-filter' onClick={close}>
								<MdClose className='material-icons' />
							</a>
						</div>
						<div className='check-boxes-inner'>
							<div className='left-check-box box2'>
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
																name={platform?.type_auto_id}
																value={platform?.type_auto_name}
																className='ckkBox val'
																checked={platform.item_checked || ''}
																onChange={() => handleCheckboxChange(platform, index)}
															/>
															<span>
																<span className='search-title'>{platform?.type_auto_name}</span>
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

export default TypePopup;
