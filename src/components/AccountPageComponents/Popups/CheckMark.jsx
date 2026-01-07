/* @format */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const CheckMark = ({
	setPageNumber,
	setIsReportLoaderVisible,
	setCurrentUnitPage,
	uniqueIdentifier,
}) => {
	const { popupFlags, setPopupFlags, checkMark, setcheckMark, accountType, setSelectedFilter } =
		useContext(ReportContext);
	//filtering_data
	const [windowWidth] = useState(window.innerWidth);
	const [initialData, setInitialData] = useState(
		uniqueIdentifier != 'cost_checkmark'
			? [
					{
						type_auto_id: '1',
						type_auto_name: 'Last Updated',
						item_checked: false,
					},
					{
						type_auto_id: '2',
						type_auto_name: 'Type',
						item_checked: false,
					},
					{
						type_auto_id: '3',
						type_auto_name: 'Last Month',
						item_checked: true,
					},
					{
						type_auto_id: '4',
						type_auto_name: 'This Month',
						item_checked: true,
					},
			  ]
			: [
					{
						type_auto_id: '1',
						type_auto_name: 'Last Updated',
						item_checked: false,
					},
					{
						type_auto_id: '3',
						type_auto_name: 'Last Month',
						item_checked: true,
					},
					{
						type_auto_id: '4',
						type_auto_name: 'This Month',
						item_checked: true,
					},
			  ]
	);

	useEffect(() => {
		const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_filter'));
		if (windowWidth <= 767) {
			const updatedInitialData = initialData.map((item) => ({
				...item,
				item_checked: false,
			}));
			const updatedData = updatedInitialData?.map((item) => {
				const isChecked = localData?.some((app) => app.type_auto_id == item.type_auto_id);
				return { ...item, item_checked: isChecked ? isChecked : item?.item_checked };
			});
			setInitialData(updatedData);
			setFilteredPlatformData(updatedData);
			setcheckMark(updatedData.filter((item) => item.item_checked));
		} else {
			const updatedInitialData = initialData.map((item, index) => {
				let shouldCheck = false;
				if (!localData) {
					if (uniqueIdentifier === 'account_checkmark') {
						shouldCheck = index === 2 || index === 3;
					} else if (uniqueIdentifier === 'cost_checkmark') {
						shouldCheck = index === 1 || index === 2;
					}
				}
				return {
					...item,
					item_checked: shouldCheck,
				};
			});
			const updatedData = updatedInitialData?.map((item) => {
				const isChecked = localData?.some((app) => app.type_auto_id == item.type_auto_id);
				return { ...item, item_checked: isChecked ? isChecked : item?.item_checked };
			});
			setInitialData(updatedData);
			setFilteredPlatformData(updatedData);
			setcheckMark(updatedData.filter((item) => item.item_checked));
		}
	}, [windowWidth]);

	const [filteredPlatformData, setFilteredPlatformData] = useState([]);
	const [checkedPlatform, setCheckedPlatform] = useState([]);

	useEffect(() => {
		setCheckedPlatform(initialData.filter((item) => item.item_checked));
	}, [initialData, filteredPlatformData]);

	const handleCheckboxChange = (platform, index) => {
		const updatedFilteredData = filteredPlatformData.map((item) =>
			item.type_auto_id === platform.type_auto_id
				? { ...item, item_checked: !item.item_checked }
				: item
		);

		setFilteredPlatformData(updatedFilteredData);
		const updatedAllData = initialData.map((item) =>
			item.type_auto_id === updatedFilteredData[index].type_auto_id
				? { ...updatedFilteredData[index] }
				: { ...item }
		);
		setInitialData(updatedAllData);
	};

	const handleApply = (e, close) => {
		setSelectedFilter('CheckMark');
		e.preventDefault();
		setIsReportLoaderVisible(true);
		setTimeout(() => {
			setIsReportLoaderVisible(false);
		}, 500);
		setPageNumber(1);
		setcheckMark(checkedPlatform);
		sessionStorage.setItem(uniqueIdentifier + '_filter', JSON.stringify(checkedPlatform));
		// setCurrentUnitPage(1);
		close();
	};

	const popupLabelData = checkMark?.filter((item) => {
		if (item?.item_checked) {
			return item?.type_auto_name;
		}
	});

	//Select all
	const areAllCheckedIn = () => {
		return initialData?.every((app) => app.item_checked);
	};
	const handleSelectAll = (event) => {
		const isChecked = event.target.checked;
		const updatedSelectAll = initialData?.map((app) => ({
			...app,
			item_checked: isChecked,
		}));
		setInitialData(updatedSelectAll);
		setFilteredPlatformData(updatedSelectAll);
		setCheckedPlatform(updatedSelectAll);
	};

	return (
		<Popover className='check-wrapper select-account-wrapper last-updated-height column-filter'>
			<PopoverTrigger>
				<a
					className={
						popupLabelData?.length > 0
							? 'popover_filter filter-btn btn-active'
							: 'popover_filter filter-btn'
					}
				>
					<span>Columns</span>
					{popupLabelData?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{popupLabelData?.slice(0, 2)?.map((item, index) => (
									<li className='selected-item-value' key={index}>
										{' '}
										{item?.type_auto_name}{' '}
									</li>
								))}
								{popupLabelData?.length > 2 && <li>+{popupLabelData?.length - 2} more </li>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>
			<PopoverContent>
				{({ close }) => (
					<div className={'checkbox_popover full-and-multi-filter'}>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Columns</span>
							<a className='close-filter' onClick={close}>
								<MdClose className='material-icons' />
							</a>
						</div>
						<div className='check-boxes-inner'>
							<div className='left-check-box box2'>
								<div className='all-select-row'>
									<form id='report-account-class' onSubmit={(e) => handleApply(e, close)}>
										{filteredPlatformData?.length === 0 ? (
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
												{filteredPlatformData?.map((platform, index) => (
													<div className='box-check' key={index}>
														<label>
															<input
																type='checkbox'
																name={platform?.type_auto_id}
																value={platform.item_checked ? platform.item_checked : index == 0}
																checked={platform.item_checked || ''}
																onChange={() => handleCheckboxChange(platform, index)}
															/>
															<span>
																<span className='search-title'>{platform?.type_auto_name}</span>
															</span>
														</label>
													</div>
												))}
											</>
										)}
										<div className='apply-btn-wrap text-right'>
											<button
												type='submit'
												className='apply-btn'
												disabled={filteredPlatformData?.length === 0 ?? true}
											>
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

export default CheckMark;
