/** @format */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import EmptyListBox from '../../GeneralComponents/EmptyListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const MatrixFilter = ({ setPageNumber, setIsReportLoaderVisible = () => {} }) => {
	const {
		filteredMatrix,
		setFilteredMatrix,
		allAnalyticsMatrixData,
		setallAnalyticsMatrixData,
		setReportSelectedFilter,
		popupFlags,
		setPopupFlags,
	} = useContext(ReportContext);

	const localData = JSON.parse(sessionStorage.getItem('analytics_matrix'));
	const [allFormatData, setAllFormatData] = useState([]);
	const [filteredFormatData, setFilteredFormatData] = useState([]);
	const [checkedFormat, setCheckedFormat] = useState([]);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		const initialFormatData = [...allAnalyticsMatrixData];
		initialFormatData?.forEach((item) => {
			const isChecked = localData?.some(
				(app) => app.matrix_auto_id == item.matrix_auto_id && app.matrix_checked
			);
			item.matrix_checked = isChecked ? isChecked : item.matrix_checked;
		});
		setAllFormatData(initialFormatData);
		setFilteredFormatData(initialFormatData);
		setFilteredMatrix(initialFormatData.filter((item) => item.matrix_checked));
	}, [allAnalyticsMatrixData]);

	useEffect(() => {
		setCheckedFormat(allFormatData?.filter((item) => item.matrix_checked));
	}, [allFormatData, filteredFormatData]);

	const handleCheckboxChange = (format, index) => {
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
	};

	const handleApply = (e, close) => {
		setSearchText('');
		e.preventDefault();
		setReportSelectedFilter('MatrixFilter');
		setFilteredFormatData(allFormatData);
		setIsReportLoaderVisible(true);
		setTimeout(() => {
			setIsReportLoaderVisible(false);
		}, 300);
		setPageNumber(1);
		setallAnalyticsMatrixData(allFormatData);
		setFilteredMatrix(checkedFormat);
		sessionStorage.setItem('new_checked_matrix', JSON.stringify(checkedFormat));
		sessionStorage.setItem('analytics_matrix', JSON.stringify(allFormatData));
		// setPopupFlags(!popupFlags);
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
		const resetData = allAnalyticsMatrixData.map((v) => ({
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
		<Popover className='check-wrapper app-select-popup metrics_filter custom_small_filter custom_small_height custom_small_new_filter'>
			<PopoverTrigger>
				<a
					className={
						filteredMatrix?.length > 0
							? 'popover_filter filter-btn btn-active'
							: 'popover_filter filter-btn'
					}
				>
					<span>Metrics</span>
					{filteredMatrix?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{filteredMatrix
									?.map((item) => {
										return item?.matrix_display_name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item}
										</li>
									))}
								{filteredMatrix?.length > 2 && <span>+{filteredMatrix?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter' id='Lorems'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Metrics</span>
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
												{/* <div className='box-check'>
                                 <label>
                                    <input
                                       type='checkbox'
                                       className='ckkBox val'
                                       checked={areAllCheckedIn()}
                                       onChange={(event) => handleSelectAll(event)}
                                    />
                                    <span className='search-title'>Select All</span>
                                 </label>
                              </div> */}
												{filteredFormatData?.map((format, index) => {
													return (
														<div className={'box-check'} key={index}>
															<label>
																<input
																	type='checkbox'
																	name={format?.matrix_auto_id}
																	value={format?.name}
																	className='ckkBox val'
																	checked={format.matrix_checked}
																	onChange={() => handleCheckboxChange(format, index)}
																/>
																<span className='search-title'>{format?.matrix_display_name}</span>
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
													<span>{item?.matrix_display_name}</span>
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

export default MatrixFilter;
