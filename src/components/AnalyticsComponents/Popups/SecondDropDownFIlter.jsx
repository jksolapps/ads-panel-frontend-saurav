/** @format */

import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaCaretDown } from 'react-icons/fa';
import { RiArrowRightSFill } from 'react-icons/ri';
import { IoIosSearch } from 'react-icons/io';
import { ReportContext } from '../../../context/ReportContext';

const SecondDropDownFIlter = ({
	columnName,
	applyFilter,
	setIsReportLoaderVisible,
	setDisabled,
	showFilterDropdown,
	setnewColumn,
	filterValues,
	availableFiltersForSecond,
	setAvailableFiltersForSecond,
	addHidebutton,
	crossBtn,
}) => {
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedItem, setSelectedItem] = useState(null);
	const [searchText, setSearchText] = useState('');

	const {
		analyticsDimensionValue,
		setanalyticsDimensionValue,
		setToggleResizeAnalytics,
		popupFlags,
		setPopupFlags,

		newColumnFilter,
		setNewColumnFilter,
		extraColumnFilter,
		setExtraColumnFilter,
		secondIsOpen,
		setSecondsecondIsOpen,
		isOpen,
		setIsOpen,
		categoryClick,
		setCategorClick,
		setShowFilterDropdown,
	} = useContext(ReportContext);
	const toggleDropdown = () => {
		setSecondsecondIsOpen(!secondIsOpen);
		setIsOpen(false);
	};
	const handleFilterApplied = (filter, columnKey) => {
		if (showFilterDropdown) {
			setnewColumn();
		}
		if (columnKey === 'ExtraColumn') {
			setExtraColumnFilter(filter); // Update ExtraColumn filter
		}
		// Toggle popup and apply loader/resize states
		setPopupFlags(!popupFlags);
		applyFilter(filter); // Apply the selected filter
		setIsReportLoaderVisible(true);
		setDisabled(true);
		setToggleResizeAnalytics(true);

		setSecondsecondIsOpen(false);
	};

	const handleMainSearch = (e) => {
		setSearchText(e.target.value);
	};
	const newColumnId = filterValues?.NewColumn?.parent_id
		? filterValues?.NewColumn?.parent_id
		: filterValues?.NewColumn?.id;

	const filteredCategories = availableFiltersForSecond?.filter(
		(filter) =>
			filter?.key?.toLowerCase()?.includes(searchText.toLowerCase()) && filter.id !== newColumnId // Exclude ExtraColumn id
	);

	const filteredItems = selectedCategory?.value || []; // Get subcategories if present
	useEffect(() => {
		if (showFilterDropdown) {
			setSecondsecondIsOpen(true);
		} else {
			setSecondsecondIsOpen(false);
		}
	}, [showFilterDropdown]);

	const boxRef = useRef(null); // Ref to track main-dimension-filter-box
	const anotherRef = useRef(null); // Ref to track main-dimension-filter-box

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				boxRef.current &&
				!boxRef.current.contains(event.target) &&
				anotherRef.current &&
				!anotherRef.current.contains(event.target) &&
				!event.target.classList.contains('dimension-column') &&
				!event.target.classList.contains('second-column-btn')
			) {
				setSecondsecondIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [setSecondsecondIsOpen]);

	useEffect(() => {
		const filterWithSelectedChildren = availableFiltersForSecond?.find(
			(f) => f.child === true && f.selected === true
		);
		if (filterWithSelectedChildren && Array.isArray(filterWithSelectedChildren.value)) {
			setSelectedCategory(filterWithSelectedChildren);
		}
	}, [availableFiltersForSecond]);

	return (
		<div
			style={{ display: 'inline-block' }}
			className='second-column-btn'
			ref={anotherRef}
			onClick={(e) => e.stopPropagation}
		>
			{localStorage.getItem('second-col') && !crossBtn && (
				<>
					<span
						onClick={(e) => {
							toggleDropdown();
							e.stopPropagation(); // Prevent sorting when button is clicked
						}}
						style={{ cursor: 'pointer', marginRight: '3px' }}
					>
						{columnName}
					</span>
					<button
						onClick={(e) => {
							toggleDropdown();
							e.stopPropagation(); // Prevent sorting when button is clicked
						}}
						style={{
							backgroundColor: 'white',
							padding: '0px 0px',
							cursor: 'pointer',
							fontSize: '14px',
							borderRadius: '4px',
							color: 'black',
						}}
					>
						<FaCaretDown />
					</button>
				</>
			)}
			{secondIsOpen && (
				<div className='second-column-btn-inner' ref={boxRef}>
					<div
						style={{
							padding: '10px',
							borderBottom: '1px solid #ddd',
						}}
						className='search-dimension-top'
					>
						<div className='search-dimension'>
							<IoIosSearch />
						</div>
						<input
							type='text'
							value={searchText}
							onChange={handleMainSearch}
							placeholder='Search items'
							style={{
								width: '100%',
								fontSize: '14px',
								border: 'unset',
							}}
							onClick={(e) => {
								e.stopPropagation(); // Prevent sorting when button is clicked
							}}
						/>
					</div>
					<div
						className='dimension-filter-box'
						onClick={(e) => {
							e.stopPropagation(); // Prevent sorting when button is clicked
						}}
					>
						<div
							style={{ width: '170px' }}
							onClick={(e) => {
								e.stopPropagation(); // Prevent sorting when button is clicked
							}}
						>
							{filteredCategories?.length > 0 ? (
								filteredCategories?.map((filter) => (
									<div
										key={filter.key}
										onClick={(e) => {
											if (!filter.selected) {
												if (!filter.value) {
													handleFilterApplied(filter); // Apply filter directly if no subcategories
												}
												setSelectedCategory(filter);
												setCategorClick(true);
												setShowFilterDropdown(false);
											}
											e.stopPropagation();
										}}
										className={`category-item ${filter.selected === true ? 'selected' : ''}`}
										style={{
											fontWeight: 'bold',
											cursor: 'pointer',
											padding: '10px',
										}}
									>
										<div
											className='category-list'
											style={{
												display: 'flex',
												justifyContent: 'space-between',
											}}
										>
											<div>{filter.key}</div>
											{filter.value && (
												<div className='right-icon-arrow'>
													<RiArrowRightSFill />
												</div>
											)}
										</div>
									</div>
								))
							) : (
								<div style={{ padding: '10px', color: '#aaa' }}>No results found</div>
							)}
						</div>

						<div
							style={{
								width: '330px',
								borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
								minHeight: '350px',
							}}
							onClick={(e) => {
								e.stopPropagation(); // Prevent sorting when button is clicked
							}}
						>
							{selectedCategory && selectedCategory?.value ? (
								filteredItems?.length > 0 ? (
									<ul
										style={{
											listStyleType: 'none',
											padding: '0',
											margin: '0',
										}}
									>
										{filteredItems?.map((item) => (
											<li
												key={item.id}
												onClick={(e) => {
													if (!item.selected) {
														setSelectedCategory(item);
														if (!item.value) {
															handleFilterApplied(item); // Apply filter directly if no subcategories
														}
													}
													e.stopPropagation();
												}}
												className={`subcategory-item ${item.selected === true ? 'selected' : ''}`}
												style={{
													cursor: 'pointer',
													borderRadius: '4px',
												}}
											>
												<span
													style={{
														padding: '10px',
														display: 'block',
														width: '100%',
														textAlign: 'left',
													}}
												>
													{item.name || item.id} {/* Return name or id */}
												</span>
											</li>
										))}
									</ul>
								) : (
									<div style={{ padding: '10px', color: '#aaa' }}>No subcategories found</div>
								)
							) : (
								<div className='select-category' style={{ color: '#aaa' }}></div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SecondDropDownFIlter;
