/** @format */

import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaCaretDown } from 'react-icons/fa';
import { RiArrowRightSFill } from 'react-icons/ri';
import { IoIosSearch } from 'react-icons/io';
import { ReportContext } from '../../../context/ReportContext';

const FilterHeaderDropdown = ({
	columnName,
	applyFilter,
	setIsReportLoaderVisible,
	setDisabled,
	filterValues,
	availableFilters,
	setAvailableFilters,
	setAnalyticsData,
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
		isOpen,
		setIsOpen,
		showFilterDropdown,
		setShowFilterDropdown,
		secondIsOpen,
		setSecondsecondIsOpen,
	} = useContext(ReportContext);

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
		setShowFilterDropdown(false);
		setSecondsecondIsOpen(false);
	};
	const handleFilterApplied = (filter, columnKey) => {
		if (columnKey === 'NewColumn') {
			setNewColumnFilter(filter); // Update NewColumn filter
		}
		// Toggle popup and apply loader/resize states
		setPopupFlags(!popupFlags);
		applyFilter(filter); // Apply the selected filter
		setIsReportLoaderVisible(true);
		setDisabled(true);
		setToggleResizeAnalytics(true);
		setIsOpen(false);
	};

	const handleMainSearch = (e) => {
		setSearchText(e.target.value);
	};
	// Extract the id from NewColumn in filterValues
	const newColumnId2 = filterValues?.ExtraColumn?.parent_id
		? filterValues?.ExtraColumn?.parent_id
		: filterValues?.ExtraColumn?.id; // Get ExtraColumn id
	const filteredCategories = availableFilters?.filter(
		(filter) =>
			filter?.key?.toLowerCase()?.includes(searchText.toLowerCase()) &&
			// Exclude NewColumn id
			filter.id !== newColumnId2 // Exclude ExtraColumn id
	);

	const filteredItems = selectedCategory?.value || []; // Get subcategories if present
	// useEffect(() => {
	//   if (showFilterDropdown) {
	//     setIsOpen(true);
	//   } else {
	//     setIsOpen(false);
	//   }
	// }, [showFilterDropdown]);
	useEffect(() => {
		const handleClickOutside = (event) => {
			// Check if the clicked element is outside of the dimension-column class
			const dimensionColumn = document.querySelector('.dimension-column');

			if (!dimensionColumn || !dimensionColumn.contains(event.target)) {
				setIsOpen(false); // Close the dropdown if clicked outside
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [setIsOpen]);

	useEffect(() => {
		const filterWithSelectedChildren = availableFilters.find(
			(f) => f.child === true && f.selected === true
		);
		if (filterWithSelectedChildren && Array.isArray(filterWithSelectedChildren.value)) {
			setSelectedCategory(filterWithSelectedChildren);
		}
	}, [availableFilters]);

	return (
		<div style={{ display: 'inline-block' }} onClick={(e) => e.stopPropagation}>
			<span
				onClick={(e) => {
					e.stopPropagation(); // Prevent sorting when button is clicked
					toggleDropdown();
				}}
				style={{ cursor: 'pointer', marginRight: '5px' }}
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

			{isOpen && (
				<div
					style={{
						position: 'absolute',
						backgroundColor: 'white',
						border: '1px solid #ccc',
						boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
						borderRadius: '6px',
						zIndex: 1000,
						width: '500px',
						minHeight: '350px',
						marginTop: '8px',
					}}
					className='main-dimension-filter-box'
				>
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
											}
											e.stopPropagation(); // Prevent sorting when button is clicked
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

export default FilterHeaderDropdown;
