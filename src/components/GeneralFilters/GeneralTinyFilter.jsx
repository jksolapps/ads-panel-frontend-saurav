/** @format */
/** @format */

import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/Popover';
const GeneralTinyFilter = ({
	uniqueIdentifier,
	filterName,
	className = '',
	filterPopupData,
	finalSelectData,
	setFinalSelectData,
	fetchFlag,
	setFetchFlag,
	setIsLoaderVisible = () => {},
	isSingleSelect = true,
	isMonthFilterSelected = false,
	isCountryFilterSelected = false,
}) => {
	const [allData, setAllData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [checkedItem, setCheckedItem] = useState([]);

	useEffect(() => {
		if (filterPopupData?.length > 0) {
			const localData = JSON.parse(sessionStorage.getItem(`${uniqueIdentifier}_filter`));

			const initialAppData = filterPopupData.map((item) => {
				let isChecked = item?.item_checked === true;

				if (localData && Array.isArray(localData)) {
					isChecked = localData.some((ele) => ele.item_id == item.item_id);
				}
				return { ...item, item_checked: isChecked };
			});
			setAllData(initialAppData);
			setFilteredData(initialAppData);
			setFinalSelectData(initialAppData.filter((item) => item.item_checked));
			setCheckedItem(initialAppData.filter((item) => item.item_checked));
		} else {
			setFilteredData([]);
			setAllData([]);
			setFinalSelectData([]);
		}
	}, [isMonthFilterSelected, isCountryFilterSelected]);

	const handleCheckboxChange = (app) => {
		const updatedAllData = allData.map((item) => {
			if (item.item_id !== app.item_id) {
				return isSingleSelect ? { ...item, item_checked: false } : item;
			}
			// clicked item
			return isSingleSelect
				? { ...item, item_checked: true } // single: force true
				: { ...item, item_checked: !item.item_checked }; // multi: toggle
		});

		setAllData(updatedAllData);
		setFilteredData(updatedAllData);
		setCheckedItem(updatedAllData.filter((item) => item.item_checked));
	};

	const handleApply = (e, close) => {
		e.preventDefault();
		setFilteredData(allData);
		setIsLoaderVisible(true);
		setFinalSelectData(checkedItem);
		sessionStorage.setItem(uniqueIdentifier + '_filter', JSON.stringify(checkedItem));
		setFetchFlag(!fetchFlag);
		close();
	};

	return (
		<Popover className={`check-wrapper column-filter general_tiny_filter ${className}`}>
			<PopoverTrigger>
				<a
					className={
						finalSelectData?.length > 0
							? 'popover_filter filter-btn btn-active'
							: 'popover_filter filter-btn'
					}
				>
					{filterName}
					{finalSelectData?.length > 0 ? (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{finalSelectData
									?.map((item) => {
										return item?.item_name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item}
										</li>
									))}
								{finalSelectData?.length > 2 && <span>+{finalSelectData?.length - 2} more </span>}
							</ul>
						</>
					) : null}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter ' id='Lorems'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>{filterName}</span>
							<a className='close-filter' onClick={close}>
								<MdClose className='material-icons' />
							</a>
						</div>
						<div className='check-boxes-inner'>
							<div className='left-check-box box2 campaign-left-box'>
								<div className='all-select-row'>
									<form onSubmit={(e) => handleApply(e, close)}>
										{filteredData?.length === 0 ? (
											<div className='noResult'>
												<p>No Result Found</p>
											</div>
										) : (
											<>
												{filteredData?.map((app, index) => (
													<div className='box-check' key={index}>
														<label>
															<input
																type='checkbox'
																name={app?.item_id}
																value={app?.item_name}
																className='ckkBox val'
																checked={app.item_checked || ''}
																onChange={() => handleCheckboxChange(app, index)}
															/>
															<div className='label-container'>
																<div className='primary-label-wrap'>
																	<div title={app?.item_name} className='primary-label'>
																		{app?.item_name}
																	</div>
																</div>
															</div>
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

export default GeneralTinyFilter;
