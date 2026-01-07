/** @format */
/** @format */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import filterPopupData from '../../utils/report_filter.json';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import EmptyListBox from '../GeneralComponents/EmptyListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/Popover';

const GeneralGroupBy = ({
	uniqueIdentifier,
	groupByFilterList = filterPopupData.all_group_by,
	filterName = 'Group By',
	groupBy,
	setGroupBy,
	setIsTableLoaderVisible = () => {},
	fetchFlags,
	setFetchFlags,
}) => {
	const [allFormatData, setAllFormatData] = useState([]);
	const [filteredFormatData, setFilteredFormatData] = useState([]);
	const [checkedFormat, setCheckedFormat] = useState([]);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		const initialGroupData = groupByFilterList.map((v) => ({
			...v,
		}));
		const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_group_filter'));
		const updatedData = initialGroupData?.map((item) => {
			const isChecked = localData?.some((app) => app.id == item.id);
			return {
				...item,
				// item_checked: isChecked ? isChecked : false
				item_checked: localData ? (isChecked ? isChecked : false) : item.item_checked,
			};
		});
		setAllFormatData(updatedData);
		setFilteredFormatData(updatedData);
		setGroupBy(updatedData.filter((item) => item.item_checked));
	}, [groupByFilterList]);

	useEffect(() => {
		setCheckedFormat(allFormatData.filter((item) => item.item_checked));
	}, [allFormatData, filteredFormatData]);

	const handleCheckboxChange = (format, index) => {
		const updatedFilteredData = filteredFormatData.map((item) =>
			item.id === format.id ? { ...item, item_checked: true } : { ...item, item_checked: false }
		);
		setFilteredFormatData(updatedFilteredData);

		const updatedAllData = allFormatData.map((item) =>
			item.id === updatedFilteredData[index].id
				? { ...updatedFilteredData[index] }
				: { ...item, item_checked: false }
		);
		setAllFormatData(updatedAllData);
	};

	const handleApply = (e, close) => {
		//setReportSelectedFilter('FormatPopup')
		e.preventDefault();
		close();
		setSearchText('');
		setFilteredFormatData(allFormatData);
		setIsTableLoaderVisible(true);
		//setPageNumber(1);
		setGroupBy(checkedFormat);
		setFetchFlags(!fetchFlags);
		sessionStorage.setItem(uniqueIdentifier + '_group_filter', JSON.stringify(checkedFormat));
	};

	const handleClose = (item) => {
		const updatedFormat = allFormatData?.map((format) =>
			format.id === item.id ? { ...format, item_checked: !format.item_checked } : format
		);
		setAllFormatData(updatedFormat);
		setFilteredFormatData(updatedFormat);
	};

	const handleClear = () => {
		const resetData = groupByFilterList?.map((v) => ({
			...v,
			item_checked: false,
		}));
		const resetDataFilter = filteredFormatData?.map((v) => ({
			...v,
			item_checked: false,
		}));
		setAllFormatData(resetData);
		setFilteredFormatData(resetDataFilter);
	};

	const handleSearch = (e) => {
		const searchText = e.target.value.toLowerCase();
		const originalText = e.target.value;
		setSearchText(originalText);
		const updatedFilteredData = allFormatData.filter((item) =>
			item.name.toLowerCase().includes(searchText)
		);
		setFilteredFormatData(updatedFilteredData);
	};
	return (
		<Popover
			className={`check-wrapper custom_small_new_filter app-select-popup report_group_by_filter ${
				uniqueIdentifier == 'retention' ? 'retention_group_by' : ''
			}`}
		>
			<PopoverTrigger>
				<a
					className={
						groupBy?.length > 0 ? 'popover_filter filter-btn btn-active' : 'popover_filter filter-btn'
					}
				>
					<span>{filterName}</span>
					{groupBy?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{groupBy
									?.map((item) => {
										return item?.name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item}{' '}
										</li>
									))}
								{groupBy?.length > 2 && <span>+{groupBy?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter' id='Lorems'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>{filterName}</span>
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
												setFilteredFormatData(allFormatData);
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
										{filteredFormatData?.length === 0 ? (
											<div className='noResult'>
												<p>No Result Found</p>
											</div>
										) : (
											filteredFormatData?.map((format, index) => (
												<div className='box-check' key={index}>
													<label>
														<input
															type='checkbox'
															name={format?.id}
															value={format?.name}
															className='ckkBox val'
															checked={format.item_checked}
															onChange={() => handleCheckboxChange(format, index)}
														/>
														<span className='search-title'>{format?.name}</span>
													</label>
												</div>
											))
										)}
										<div className='apply-btn-wrap text-right'>
											<button type='submit' className='apply-btn'>
												Apply
											</button>
										</div>
									</form>
								</div>
							</div>
							<div className='right-result-box box2'>
								<div className='none-selected-text'>
									<span></span>
									{uniqueIdentifier == 'retention' && (
										<a className='custom-clear-all' onClick={handleClear}>
											Clear all
										</a>
									)}
								</div>
								<div className='right-result-row'>
									{checkedFormat?.length === 0 && <EmptyListBox />}
									{checkedFormat?.length > 0 &&
										checkedFormat?.map((item, index) => (
											<div
												className='result-box'
												key={index}
												onClick={() => {
													if (uniqueIdentifier == 'retention') {
														return handleClose(item);
													}
												}}
											>
												<span>
													<span>{item?.name}</span>
												</span>
												{uniqueIdentifier == 'retention' && (
													<a className='result-cancel-btn i-btn'>
														<IoIosCloseCircleOutline className='material-icons' />
													</a>
												)}
											</div>
										))}
								</div>
							</div>
						</div>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default GeneralGroupBy;
