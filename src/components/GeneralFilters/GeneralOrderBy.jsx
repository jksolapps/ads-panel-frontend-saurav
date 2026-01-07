/** @format */

import React, { useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';
import useSelectAll from '../../hooks/useSelectAll';

const GeneralOrderBy = ({
	uniqueIdentifier,
	setIsLoaderVisible = () => {},
	fetchFlags,
	setFetchFlags,
	finalItem,
	setFinalItem,
	viewType,
}) => {
	//All Filter Popup Data

	const sortOptionsList = [
		{
			id: 'totalDAU_asc',
			display_name: 'Total DAU (Asc)',
			item_checked: false,
			value: 'totalDAU_asc',
			key: 'dau_asc',
		},
		{
			id: 'totalDAU_desc',
			display_name: 'Total DAU (Desc)',
			item_checked: false,
			value: 'totalDAU_desc',
			key: 'dau_desc',
		},
		{
			id: 'newUsers_asc',
			display_name: 'New Users (Asc)',
			item_checked: false,
			value: 'newUsers_asc',
			key: 'new_users_asc',
		},
		{
			id: 'newUsers_desc',
			display_name: 'New Users (Desc)',
			item_checked: false,
			value: 'newUsers_desc',
			key: 'new_users_desc',
		},
		{
			id: 'revenue_asc',
			display_name: 'Revenue (Asc)',
			item_checked: false,
			value: 'revenue_asc',
			key: 'total_revenue_asc',
		},
		{
			id: 'revenue_desc',
			display_name: 'Revenue (Desc)',
			item_checked: false,
			value: 'revenue_desc',
			key: 'total_revenue_desc',
		},
		{
			id: 'profit_asc',
			display_name: 'Profit (Asc)',
			item_checked: false,
			value: 'profit_asc',
			key: 'profit_asc',
		},
		{
			id: 'profit_desc',
			display_name: 'Profit (Desc)',
			item_checked: false,
			value: 'profit_desc',
			key: 'profit_desc',
		},
		{
			id: 'retention_asc',
			display_name: 'Retention (Asc)',
			item_checked: false,
			value: 'retention_asc',
			key: 'retention_rate_asc',
		},
		{
			id: 'retention_desc',
			display_name: 'Retention (Desc)',
			item_checked: false,
			value: 'retention_desc',
			key: 'retention_rate_desc',
		},
		{
			id: 'arpDau_asc',
			display_name: 'ARPDAU (Asc)',
			item_checked: false,
			value: 'arpDau_asc',
			key: 'arpu_asc',
		},
		{
			id: 'arpDau_desc',
			display_name: 'ARPDAU (Desc)',
			item_checked: false,
			value: 'arpDau_desc',
			key: 'arpu_desc',
		},
		{
			id: 'ecpm_asc',
			display_name: 'eCPM (Asc)',
			item_checked: false,
			value: 'ecpm_asc',
			key: 'ecpm_asc',
		},
		{
			id: 'ecpm_desc',
			display_name: 'eCPM (Desc)',
			item_checked: false,
			value: 'ecpm_desc',
			key: 'ecpm_desc',
		},
		{
			id: 'sessionDau_asc',
			display_name: 'Session DAU (Asc)',
			item_checked: false,
			value: 'sessionDau_asc',
			key: 'sessions_asc',
		},
		{
			id: 'sessionDau_desc',
			display_name: 'Session DAU (Desc)',
			item_checked: false,
			value: 'sessionDau_desc',
			key: 'sessions_desc',
		},
	];

	const [allItemData, setAllItemData] = useState([]);
	const [filteredItemData, setFilteredItemData] = useState([]);
	const [checkedItem, setCheckedItem] = useState([]);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		const savedFromSession = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_order_filter'));
		const existingFinal = finalItem?.length > 0 ? finalItem : savedFromSession;

		const updatedData = sortOptionsList.map((item) => {
			const isChecked = existingFinal?.some((f) => f.id === item.id);
			return {
				...item,
				item_checked: isChecked || false,
			};
		});

		setAllItemData(updatedData);
		setFilteredItemData(updatedData);
	}, [finalItem]);

	useEffect(() => {
		setCheckedItem(allItemData.filter((item) => item.item_checked));
	}, [allItemData, filteredItemData]);

	const handleCheckboxChange = (platform, index) => {
		const updatedFilteredData = filteredItemData.map((item) => ({
			...item,
			item_checked: item.id === platform.id ? !item.item_checked : false,
		}));

		setFilteredItemData(updatedFilteredData);
		const updatedAllData = allItemData.map((item) => {
			const matchingFilteredItem = updatedFilteredData.find(
				(filteredItem) => filteredItem.id === item.id
			);
			return matchingFilteredItem ? { ...matchingFilteredItem } : { ...item };
		});

		setAllItemData(updatedAllData);
	};

	const handleApply = (e) => {
		e.preventDefault();
		// setSelectedFilter("AccountPlatFormPopup")
		setSearchText('');
		setFilteredItemData(allItemData);
		setIsLoaderVisible(true);
		setFinalItem(checkedItem);
		if (uniqueIdentifier === 'app-insights') {
			setTimeout(() => {
				setIsLoaderVisible(false);
			}, 300);

			return;
		} else {
			setFetchFlags(!fetchFlags);
		}
	};

	const handleSearch = (e) => {
		const searchText = e.target.value.toLowerCase();
		const originalText = e.target.value;
		setSearchText(originalText);
		const updatedFilteredData = allItemData.filter((item) =>
			item.display_name.toLowerCase().includes(searchText)
		);
		setFilteredItemData(updatedFilteredData);
	};

	const { areAllCheckedIn, handleSelectAll } = useSelectAll({
		allItemData: allItemData,
		filterItemData: filteredItemData,
		setAllItemData: setAllItemData,
		setAllFilterData: setFilteredItemData,
	});

	return (
		<div className='check-wrapper platform-size platform-filter orderby-filter'>
			<button className='toggle-next filter-btn active'>
				Order By: <span className='ellipsis'></span>
			</button>
			<a
				className={finalItem?.length > 0 ? 'add-filter filter-btn btn-active' : 'add-filter filter-btn'}
			>
				Order By
				{finalItem?.length > 0 && (
					<>
						<span className='selected-item'>
							:
							{finalItem
								?.map((item) => {
									return item?.display_name;
								})
								?.slice(0, 2)
								?.map((item, index) => (
									<span className='selected-item-value' key={index}>
										{' '}
										{item}{' '}
									</span>
								))}
							{finalItem?.length > 2 && <span>+{finalItem?.length - 2} more </span>}
						</span>
					</>
				)}
			</a>
			<div className={'checkboxes full-and-multi-filter'}>
				<div className='filter-title-box'>
					<span className='predicate-field-label'>Order By</span>
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
										setFilteredItemData(allItemData);
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
							<form onSubmit={handleApply}>
								{filteredItemData?.length === 0 ? (
									<div className='noResult'>
										<p>No Result Found</p>
									</div>
								) : (
									<>
										{filteredItemData?.map((platform, index) => (
											<div className='box-check' key={index}>
												<label>
													<input
														type='checkbox'
														name={platform?.id}
														value={platform?.display_name}
														className='ckkBox val'
														checked={platform.item_checked}
														onChange={() => handleCheckboxChange(platform, index)}
													/>
													<span>
														<span className='search-title'>{platform?.display_name}</span>
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
		</div>
	);
};

export default GeneralOrderBy;
