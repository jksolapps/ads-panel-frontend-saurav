/** @format */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';
import useSelectAll from '../../hooks/useSelectAll';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/Popover';
import { safeJsonParse } from '../../utils/pureHelper';

const GeneralPlatform = ({
	uniqueIdentifier,
	setPageNumber = () => {},
	setIsLoaderVisible = () => {},
	fetchFlags = false,
	setFetchFlags = () => {},
	finalItem,
	setFinalItem,
}) => {
	const initialPlatformList = useMemo(
		() => [
			{ id: '1', display_name: 'IOS', item_checked: false, value: 'iOS' },
			{ id: '2', display_name: 'Android', item_checked: false, value: 'Android' },
		],
		[]
	);

	const STORAGE_KEY = useMemo(() => `${uniqueIdentifier}_platform_filter`, [uniqueIdentifier]);

	const [allItemData, setAllItemData] = useState([]);
	const [filteredItemData, setFilteredItemData] = useState([]);
	const [searchText, setSearchText] = useState('');

	// Derived: checked items should not be its own state
	const checkedItem = useMemo(() => allItemData.filter((item) => item.item_checked), [allItemData]);

	// Init once
	useEffect(() => {
		const localData = safeJsonParse(sessionStorage.getItem(STORAGE_KEY));
		const updated = initialPlatformList.map((item) => {
			const isChecked = localData?.some((x) => String(x.id) === String(item.id));
			return { ...item, item_checked: Boolean(isChecked) };
		});

		setAllItemData(updated);
		setFilteredItemData(updated);
		setFinalItem(updated.filter((x) => x.item_checked));
	}, []);

	const setCheckedById = useCallback((id, nextChecked) => {
		setAllItemData((prev) =>
			prev.map((x) => (x.id === id ? { ...x, item_checked: nextChecked } : x))
		);
		setFilteredItemData((prev) =>
			prev.map((x) => (x.id === id ? { ...x, item_checked: nextChecked } : x))
		);
	}, []);

	const handleCheckboxChange = useCallback(
		(platform) => {
			setCheckedById(platform.id, !platform.item_checked);
		},
		[setCheckedById]
	);

	const handleSearch = useCallback(
		(e) => {
			const raw = e.target.value;
			const q = raw.trim().toLowerCase();
			setSearchText(raw);

			if (!q) {
				setFilteredItemData(allItemData);
				return;
			}

			setFilteredItemData(allItemData.filter((item) => item.display_name.toLowerCase().includes(q)));
		},
		[allItemData]
	);

	const handleClearSearch = useCallback(() => {
		setSearchText('');
		setFilteredItemData(allItemData);
	}, [allItemData]);

	const handleApply = useCallback(
		(e, close) => {
			e.preventDefault();
			close();

			setSearchText('');
			setFilteredItemData(allItemData);

			setIsLoaderVisible(true);
			setPageNumber(1);

			setFinalItem(checkedItem);
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItem));

			if (uniqueIdentifier === 'app-insights') {
				setTimeout(() => setIsLoaderVisible(false), 300);
				return;
			}
			setFetchFlags(!fetchFlags);
		},
		[
			allItemData,
			checkedItem,
			close,
			fetchFlags,
			setFetchFlags,
			setFinalItem,
			setIsLoaderVisible,
			setPageNumber,
			STORAGE_KEY,
			uniqueIdentifier,
		]
	);

	const { areAllCheckedIn, handleSelectAll } = useSelectAll({
		allItemData,
		filterItemData: filteredItemData,
		setAllItemData,
		setAllFilterData: setFilteredItemData,
	});

	return (
		<Popover className='check-wrapper platform-size platform-filter'>
			<PopoverTrigger>
				<a
					className={
						finalItem?.length > 0 ? 'popover_filter filter-btn btn-active' : 'popover_filter filter-btn'
					}
				>
					<span>Platform</span>

					{finalItem?.length > 0 && (
						<ul className='selected-item'>
							<li className='selected-item-value'>:</li>

							{finalItem
								.map((x) => x.display_name)
								.slice(0, 2)
								.map((name, index) => (
									<li className='selected-item-value' key={index}>
										{name}{' '}
									</li>
								))}

							{finalItem?.length > 2 && <span>+{finalItem.length - 2} more </span>}
						</ul>
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
											id='searchInput88'
											onChange={handleSearch}
											value={searchText}
											required
											placeholder='Search'
											autoComplete='off'
										/>
										<a href='#' className='clear-icon-btn i-btn' onClick={handleClearSearch}>
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
										{filteredItemData?.length === 0 ? (
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
															onChange={handleSelectAll}
														/>
														<span className='search-title'>Select All</span>
													</label>
												</div>

												{filteredItemData.map((platform) => (
													<div className='box-check' key={platform.id}>
														<label>
															<input
																type='checkbox'
																name={platform.id}
																value={platform.display_name}
																className='ckkBox val'
																checked={platform.item_checked}
																onChange={() => handleCheckboxChange(platform)}
															/>
															<span>
																<span className='search-title'>{platform.display_name}</span>
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

export default GeneralPlatform;
