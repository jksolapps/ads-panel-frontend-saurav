/** @format */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import filterPopupData from '../../../utils/report_filter.json';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import EmptyListBox from '../../GeneralComponents/EmptyListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const GroupByFilter = ({ setIsReportLoaderVisible = () => {} }) => {
	const { popupFlags, setPopupFlags, groupByValue, setGroupByValue } = useContext(ReportContext);

	const [allFormatData, setAllFormatData] = useState([]);
	const [filteredFormatData, setFilteredFormatData] = useState([]);
	const [checkedFormat, setCheckedFormat] = useState([]);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		const initialGroupData = filterPopupData.all_group_by.map((v) => ({
			...v,
			item_checked: false,
		}));
		const localData = JSON.parse(sessionStorage.getItem('group_filter'));
		const updatedData = initialGroupData?.map((item) => {
			const isChecked = localData?.some((app) => app.id == item.id);
			return { ...item, item_checked: isChecked || false };
		});
		setAllFormatData(updatedData);
		setFilteredFormatData(updatedData);
	}, [filterPopupData]);

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
		e.preventDefault();
		close();
		setSearchText('');
		setFilteredFormatData(allFormatData);
		setIsReportLoaderVisible(true);
		setGroupByValue(checkedFormat);
		setPopupFlags(!popupFlags);
		sessionStorage.setItem('group_filter', JSON.stringify(checkedFormat));
	};

	const handleClose = (item) => {
		const updatedFormat = allFormatData?.map((format) =>
			format.id === item.id ? { ...format, item_checked: !format.item_checked } : format
		);
		setAllFormatData(updatedFormat);
		setFilteredFormatData(updatedFormat);
	};

	const handleClear = () => {
		const resetData = filterPopupData.all_group_by?.map((v) => ({
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
		<Popover className='check-wrapper app-select-popup report_group_by_filter'>
			<PopoverTrigger>
				<a
					className={
						groupByValue?.length > 0
							? 'popover_filter filter-btn btn-active'
							: 'popover_filter filter-btn'
					}
				>
					<span>Group By</span>
					{groupByValue?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{groupByValue
									?.map((item) => {
										return item?.name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item.slice(0, 8)}
										</li>
									))}
								{groupByValue?.length > 2 && <span>+{groupByValue?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Group By</span>
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
									<a className='custom-clear-all' onClick={handleClear}>
										Clear
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

export default GroupByFilter;
