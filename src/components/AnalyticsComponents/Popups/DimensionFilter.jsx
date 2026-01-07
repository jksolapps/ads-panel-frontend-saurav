/** @format */

import React, { useContext, useRef, useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import EmptyListBox from '../../GeneralComponents/EmptyListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const DimensionFilter = ({
	setPageNumber,
	setIsReportLoaderVisible = () => {},
	setCountryValue,
}) => {
	const {
		analyticsApp,
		filteredDimension,
		setFilteredDimension,
		dimensionList,
		setDimensionList,
		setReportSelectedFilter,
		popupFlags,
		setPopupFlags,
		setCampaignID,
	} = useContext(ReportContext);

	const localData = JSON.parse(sessionStorage.getItem('new_dimension_list'));
	const [allFormatData, setAllFormatData] = useState([]);
	const [filteredFormatData, setFilteredFormatData] = useState([]);
	const [checkedFormat, setCheckedFormat] = useState([]);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		const initialFormatData = [...dimensionList];
		initialFormatData?.forEach((item) => {
			const isChecked = localData?.some(
				(app) => app.matrix_auto_id == item.matrix_auto_id && app.matrix_checked
			);
			item.matrix_checked = isChecked ? isChecked : item.matrix_checked;
		});
		setAllFormatData(initialFormatData);
		setFilteredFormatData(initialFormatData);
		setFilteredDimension(initialFormatData.filter((item) => item.matrix_checked));
	}, [dimensionList]);

	useEffect(() => {
		const checkItem = allFormatData.filter((item) => item.matrix_checked);
		setCheckedFormat(checkItem);
	}, [allFormatData, filteredFormatData]);

	const handleCheckboxChange = (format, index) => {
		if (format.value === 'DATE' || format.value === 'MONTH') {
			const otherValue = format.value === 'DATE' ? 'MONTH' : 'DATE';
			const updatedFilteredData = filteredFormatData.map((item) => {
				if (item.value === otherValue) {
					return { ...item, matrix_checked: false };
				}
				return item.matrix_auto_id === format.matrix_auto_id
					? { ...item, matrix_checked: !item.matrix_checked }
					: item;
			});
			setFilteredFormatData(updatedFilteredData);

			const updatedAllData = allFormatData.map((item) => {
				if (item.matrix_auto_id === updatedFilteredData[index].matrix_auto_id) {
					return { ...updatedFilteredData[index] };
				}
				if (item.value === otherValue) {
					return { ...item, matrix_checked: false };
				}
				return item;
			});
			setAllFormatData(updatedAllData);
		} else if (format.value === 'CAMPAIGN_NAME') {
			const otherValue = format.name === 'Campaign' ? 'Country' : 'Campaign';
			const updatedFilteredData = filteredFormatData.map((item) => {
				if (item.name === otherValue) {
					return { ...item, matrix_checked: false };
				}
				return item.matrix_auto_id === format.matrix_auto_id
					? { ...item, matrix_checked: !item.matrix_checked }
					: item;
			});
			setFilteredFormatData(updatedFilteredData);
			const updatedAllData = allFormatData.map((item) => {
				if (item.matrix_auto_id === updatedFilteredData[index].matrix_auto_id) {
					return { ...updatedFilteredData[index] };
				}
				if (item.name === otherValue) {
					return { ...item, matrix_checked: false };
				}
				return item;
			});
			setAllFormatData(updatedAllData);
		} else {
			const updatedFilteredData = filteredFormatData.map((item) =>
				item.matrix_auto_id === format.matrix_auto_id
					? { ...item, matrix_checked: !item.matrix_checked }
					: item
			);
			setFilteredFormatData(updatedFilteredData);

			const updatedAllData = allFormatData.map((item) =>
				item.matrix_auto_id === updatedFilteredData[index].matrix_auto_id
					? { ...updatedFilteredData[index] }
					: { ...item }
			);
			setAllFormatData(updatedAllData);
		}
	};

	const handleApply = (e, close) => {
		setSearchText('');
		e.preventDefault();
		setReportSelectedFilter('DimensionFilter');
		setIsReportLoaderVisible(true);
		setPageNumber(1);
		setDimensionList(allFormatData);
		setFilteredFormatData(allFormatData);
		setFilteredDimension(checkedFormat);

		if (checkedFormat.some((dim) => dim.name == 'Country')) {
			setCampaignID([]);
			sessionStorage.removeItem('analytic_campaign_filter');
		} else if (checkedFormat.some((dim) => dim.name == 'Campaign')) {
			setCountryValue([]);
			sessionStorage.removeItem('analytics_country_filter');
		}

		sessionStorage.setItem('new_checked_dimension', JSON.stringify(checkedFormat));
		sessionStorage.setItem('new_dimension_list', JSON.stringify(allFormatData));
		setPopupFlags(!popupFlags);
		close();
	};

	const handleClose = (item) => {
		const updatedFormat = allFormatData?.map((format) =>
			format.matrix_auto_id === item.matrix_auto_id
				? { ...format, matrix_checked: !format.matrix_checked }
				: format
		);
		setAllFormatData(updatedFormat);
		setFilteredFormatData(updatedFormat);
	};

	const handleClear = () => {
		const resetData = dimensionList?.map((v) => ({
			...v,
			matrix_checked: false,
		}));
		const resetDataFilter = filteredFormatData?.map((v) => ({
			...v,
			matrix_checked: false,
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
		<Popover className='check-wrapper app-select-popup custom_small_filter custom_small_height custom_small_new_filter'>
			<PopoverTrigger>
				<a
					className={
						filteredDimension?.length > 0
							? 'popover_filter filter-btn btn-active'
							: 'popover_filter filter-btn'
					}
				>
					<span>Dimension</span>
					{filteredDimension?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{filteredDimension
									?.map((item) => {
										return item?.matrix_display_name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item.slice(0, 8)}{' '}
										</li>
									))}
								{filteredDimension?.length > 2 && <span>+{filteredDimension?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter' id='Lorems'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Dimension</span>
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
											<>
												{filteredFormatData?.map((format, index) => {
													const isCampaignDisable =
														analyticsApp?.length != 1 && format.sortValue == 'CAMPAIGN_NAME';
													return (
														<div
															className={`box-check ${isCampaignDisable ? 'disable_dimension' : ''}`}
															key={index}
														>
															<label>
																<input
																	type='checkbox'
																	name={format?.matrix_auto_id}
																	value={format?.name}
																	className='ckkBox val'
																	checked={format.matrix_checked}
																	onChange={() => handleCheckboxChange(format, index)}
																/>
																<span className='search-title'>{format?.name}</span>
															</label>
														</div>
													);
												})}
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

export default DimensionFilter;
