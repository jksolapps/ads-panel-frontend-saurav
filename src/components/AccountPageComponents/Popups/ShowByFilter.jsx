/** @format */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const ShowByFilter = ({
	uniqueIdentifier,
	showByFilter,
	setShowByFilter,
	setIsReportLoaderVisible,
}) => {
	const { popupFlags, setPopupFlags } = useContext(ReportContext);
	const [allFormatData, setAllFormatData] = useState([]);
	const [filteredFormatData, setFilteredFormatData] = useState([]);
	const [checkedFormat, setCheckedFormat] = useState([]);
	const [searchText, setSearchText] = useState('');

	const initialFilter = [
		{
			id: '1',
			name: 'Day',
			value: 'DAY',
			item_checked: true,
		},
		{
			id: '2',
			name: 'Week',
			value: 'WEEK',
			item_checked: false,
		},
		{
			id: '3',
			name: 'Month',
			value: 'MONTH',
			item_checked: false,
		},
		{
			id: '4',
			name: 'Year',
			value: 'YEAR',
			item_checked: false,
		},
	];
	const localFilterList = JSON.parse(
		sessionStorage.getItem(uniqueIdentifier + '_show_by_filter_list')
	);
	const [filterList] = useState(localFilterList ? localFilterList : initialFilter);

	useEffect(() => {
		const initialGroupData = filterList.map((v) => ({
			...v,
		}));
		const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_show_by_filter'));
		const updatedData = initialGroupData?.map((item) => {
			const isChecked = localData?.some((app) => app.id == item.id);
			return { ...item, item_checked: isChecked || item.item_checked };
		});
		setAllFormatData(updatedData);
		setFilteredFormatData(updatedData);
		setShowByFilter(updatedData.filter((item) => item.item_checked));
	}, [filterList]);

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
		// setReportSelectedFilter('ShowBy')
		e.preventDefault();
		setSearchText('');
		setFilteredFormatData(allFormatData);
		setIsReportLoaderVisible(true);
		setShowByFilter(checkedFormat);
		setPopupFlags(!popupFlags);
		sessionStorage.setItem(uniqueIdentifier + '_show_by_filter', JSON.stringify(checkedFormat));
		sessionStorage.setItem(uniqueIdentifier + '_show_by_filter_list', JSON.stringify(allFormatData));
		close();
	};
	return (
		<Popover className='check-wrapper app-select-popup report_group_by_filter show_by_filter custom_small_new_filter'>
			<PopoverTrigger>
				<a
					className={
						showByFilter?.length > 0
							? 'popover_filter filter-btn btn-active'
							: 'popover_filter filter-btn'
					}
				>
					<span>Show By</span>
					{showByFilter?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{showByFilter
									?.map((item) => {
										return item?.name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{' '}
											{item.slice(0, 8)}{' '}
										</li>
									))}
								{showByFilter?.length > 2 && <span>+{showByFilter?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter' id='Lorems'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Show By</span>
							<a className='close-filter' onClick={close}>
								<MdClose className='material-icons' />
							</a>
						</div>
						<div className='check-boxes-inner'>
							<div className='left-check-box box2'>
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
						</div>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default ShowByFilter;
