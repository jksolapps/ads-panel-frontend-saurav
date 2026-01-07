/** @format */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { ReportContext } from '../../context/ReportContext';
import filterPopupData from '../../utils/report_filter.json';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import useSelectAll from '../../hooks/useSelectAll';
import EmptyListBox from '../GeneralComponents/EmptyListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/Popover';

const GeneralDayColumnFilter = ({
	uniqueIdentifier,
	columnCount = 180,
	dayCheckedColumn,
	setDayCheckedColumn,
	setPageNumber,
	setIsReportLoaderVisible = () => {},
}) => {
	const { setReportSelectedFilter } = useContext(ReportContext);

	const [allFormatData, setAllFormatData] = useState([]);
	const [filteredFormatData, setFilteredFormatData] = useState([]);
	const [checkedFormat, setCheckedFormat] = useState([]);
	const [searchText, setSearchText] = useState('');

	const specialDays = new Set(['1', '2', '3', '7', '14', '30', '60', '90', '180']);

	const initialArray = Array.from({ length: columnCount }, (_, i) => {
		const day = (i + 1).toString();
		return {
			id: day,
			name: `D${day}`,
			value: day,
			item_checked: specialDays.has(day),
		};
	});
	const localFilterList = JSON.parse(
		sessionStorage.getItem(uniqueIdentifier + '_day_column_list_new')
	);
	const [initialFilterData, setInitialFilterData] = useState(
		localFilterList ? localFilterList : initialArray
	);

	useEffect(() => {
		const initialFormatData = initialFilterData?.map((v) => ({
			...v,
		}));
		const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_day_column_filter'));
		initialFormatData?.forEach((item) => {
			const isChecked = localData?.some((app) => app.id == item.id);
			item.item_checked = isChecked ? isChecked : item.item_checked;
		});
		setAllFormatData(initialFormatData);
		setFilteredFormatData(initialFormatData);
		const initialChecked = initialFormatData.filter((item) => item.item_checked);
		setDayCheckedColumn(initialChecked);
		sessionStorage.setItem(uniqueIdentifier + '_day_column_filter', JSON.stringify(initialChecked));
	}, [filterPopupData]);

	useEffect(() => {
		setCheckedFormat(allFormatData.filter((item) => item.item_checked));
	}, [allFormatData, filteredFormatData]);

	const handleCheckboxChange = (format, index) => {
		const updatedFilteredData = filteredFormatData.map((item) =>
			item.id === format.id ? { ...item, item_checked: !item.item_checked } : item
		);
		setFilteredFormatData(updatedFilteredData);

		const updatedAllData = allFormatData.map((item) =>
			item.id === updatedFilteredData[index].id ? { ...updatedFilteredData[index] } : { ...item }
		);
		setAllFormatData(updatedAllData);
	};

	const handleApply = (e, close) => {
		close();
		setReportSelectedFilter('DayColumnFilter');
		setSearchText('');
		setFilteredFormatData(allFormatData);
		e.preventDefault();
		setIsReportLoaderVisible(true);
		setTimeout(() => {
			setIsReportLoaderVisible(false);
		}, 300);
		if (uniqueIdentifier != 'retention_pp') {
			setPageNumber(1);
		}
		setInitialFilterData(allFormatData);
		setDayCheckedColumn(checkedFormat);
		// setPopupFlags(!popupFlags);
		sessionStorage.setItem(uniqueIdentifier + '_day_column_filter', JSON.stringify(checkedFormat));
		sessionStorage.setItem(uniqueIdentifier + '_day_column_list', JSON.stringify(allFormatData));
	};

	const handleClose = (item) => {
		const updatedFormat = allFormatData?.map((format) =>
			format.id === item.id ? { ...format, item_checked: !format.item_checked } : format
		);
		setAllFormatData(updatedFormat);
		setFilteredFormatData(updatedFormat);
	};

	const handleClear = () => {
		const resetData = initialFilterData?.map((v) => ({
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

	//Select all
	const { areAllCheckedIn, handleSelectAll } = useSelectAll({
		allItemData: allFormatData,
		filterItemData: filteredFormatData,
		setAllItemData: setAllFormatData,
		setAllFilterData: setFilteredFormatData,
	});

	//Reset
	const handleResetDay = (e) => {
		e.preventDefault();
		setAllFormatData(initialArray);
		setFilteredFormatData(initialArray);
	};

	return (
		<Popover className='check-wrapper app-select-popup custom_small_filter'>
			<PopoverTrigger>
				<a
					className={
						dayCheckedColumn?.length > 0
							? 'popover_filter filter-btn btn-active'
							: 'popover_filter filter-btn'
					}
				>
					<span>Days</span>
					{dayCheckedColumn?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{dayCheckedColumn
									?.map((item) => {
										return item?.name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item.slice(0, 8)}{' '}
										</li>
									))}
								{dayCheckedColumn?.length > 2 && <span>+{dayCheckedColumn?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>
			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter' id='Lorems'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Days</span>
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
											id='searchInput3'
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
												{filteredFormatData?.map((format, index) => (
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
												))}
											</>
										)}
										<div className='apply-btn-wrap text-right'>
											{
												<button onClick={handleResetDay} className='day_reset_btn'>
													Reset
												</button>
											}
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
									<a className='custom-clear-all' onClick={handleClear}>
										Clear All
									</a>
								</div>
								<div className='right-result-row'>
									{checkedFormat?.length === 0 && <EmptyListBox />}
									{checkedFormat?.length > 0 &&
										checkedFormat?.map((item, index) => (
											<div className='result-box' key={index} onClick={() => handleClose(item)}>
												<span>
													<span>{item?.name}</span>
												</span>
												<a className='result-cancel-btn i-btn'>
													<IoIosCloseCircleOutline className='material-icons' />
												</a>
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

export default GeneralDayColumnFilter;
