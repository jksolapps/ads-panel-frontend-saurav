/** @format */

import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaCaretDown } from 'react-icons/fa';
import { RiArrowRightSFill } from 'react-icons/ri';
import { IoIosCloseCircleOutline, IoIosSearch } from 'react-icons/io';
import { ReportContext } from '../../../context/ReportContext';
import { MdOutlineClose } from 'react-icons/md';

const SecondColumnFilter = ({
	availableFilters,
	firstColumnDimension,
	secondColumnDimension,
	setSecondColumnDimension,
	secondArrow,
	setSecondArrow,
	fetchFlag,
	setFetchFlag,
	setSearchText,
}) => {
	const { setToggleResizeAnalytics } = useContext(ReportContext);

	const toggleDropdown = (e) => {
		e.stopPropagation();
		setSecondArrow(!secondArrow);
	};

	const handleSecondColumn = (filter) => {
		setSecondColumnDimension(filter.api_Value);
		setToggleResizeAnalytics(true);
		setFetchFlag(!fetchFlag);
		setSecondArrow(false);
	};

	//available filter
	const excludedValue =
		firstColumnDimension === 'MONTH' || secondColumnDimension === 'MONTH'
			? ['WEEK', 'YEAR']
			: firstColumnDimension === 'WEEK' || secondColumnDimension === 'WEEK'
				? ['MONTH', 'YEAR']
				: firstColumnDimension === 'YEAR' || secondColumnDimension === 'YEAR'
					? ['MONTH', 'WEEK']
					: null;

	const filteredCategories = availableFilters?.filter(
		(filter) =>
			filter.api_Value !== firstColumnDimension &&
			filter.api_Value !== secondColumnDimension &&
			!excludedValue?.includes(filter.api_Value)
	);

	useEffect(() => {
		const handleClickOutside = (event) => {
			const dimensionColumn = document.querySelector('.dimension-column.extra_column');

			if (!dimensionColumn || !dimensionColumn.contains(event.target)) {
				setSecondArrow(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [secondArrow]);

	const handleCloseClick = (e) => {
		e.stopPropagation();
		setSecondColumnDimension(null);
		setFetchFlag(!fetchFlag);
	};

	//column name
	const secondColumnName = availableFilters?.find(
		(item) => item?.api_Value === secondColumnDimension
	)?.key;

	return (
		<div style={{ display: 'inline-block' }} onClick={(e) => e.stopPropagation}>
			<span
				className='report_column_title'
				onClick={toggleDropdown}
				style={{ cursor: 'pointer', marginRight: '5px' }}
			>
				{secondColumnName}
			</span>
			<button
				onClick={toggleDropdown}
				style={{
					backgroundColor: '#fff',
					padding: '0px 0px',
					cursor: 'pointer',
					fontSize: '14px',
					borderRadius: '4px',
					color: 'black',
					float: 'none',
				}}
			>
				<FaCaretDown />
			</button>
			<button
				onClick={handleCloseClick}
				style={{
					backgroundColor: 'white',
					padding: '0px 0px',
					cursor: 'pointer',
					fontSize: '14px',
					borderRadius: '4px',
					color: 'black',
					float: 'right',
				}}
			>
				<MdOutlineClose className='custom_column_icon' />
			</button>
			{secondArrow && (
				<div className='second-column-btn-inner extra_column'>
					<div
						className='dimension-filter-box'
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<div
							style={{ width: '170px' }}
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							{filteredCategories?.length > 0 ? (
								filteredCategories?.map((filter) => (
									<div
										key={filter.key}
										onClick={(e) => {
											e.stopPropagation();
											handleSecondColumn(filter);
										}}
										className={`category-item`}
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
					</div>
				</div>
			)}
		</div>
	);
};

export default SecondColumnFilter;
