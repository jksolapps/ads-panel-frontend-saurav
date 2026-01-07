/* @format */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';

const GeneralOmitColumn = ({
	uniqueIdentifier,
	title,
	columnList,
	setMainLoader,
	omittedColumn,
	setOmittedColumn,
	setDynamicSelectedFilter,
}) => {
	//filtering_data

	const [filteredPlatformData, setFilteredPlatformData] = useState([]);
	const [checkedPlatform, setCheckedPlatform] = useState([]);

	useEffect(() => {
		const localData = JSON.parse(sessionStorage.getItem(`${uniqueIdentifier}_filter_${title}`));
		columnList.forEach((item) => {
			const isChecked = localData?.some((ele) => ele.type_auto_id == item.type_auto_id);
			if (isChecked !== undefined) {
				item.item_checked = isChecked;
			}
		});
		setOmittedColumn(columnList.filter((item) => item.item_checked));
		setFilteredPlatformData(columnList);
	}, [columnList]);

	const handleCheckboxChange = (platform, index) => {
		const updatedFilteredData = filteredPlatformData.map((item) =>
			item.type_auto_id === platform.type_auto_id
				? { ...item, item_checked: !item.item_checked }
				: item
		);
		setFilteredPlatformData(updatedFilteredData);
		setCheckedPlatform(updatedFilteredData);
	};

	const handleApply = (e) => {
		e.preventDefault();
		setMainLoader(true);
		setTimeout(() => {
			setMainLoader(false);
		}, 500);
		setOmittedColumn(checkedPlatform.filter((item) => item.item_checked));
		sessionStorage.setItem(
			uniqueIdentifier + '_filter_' + title,
			JSON.stringify(checkedPlatform.filter((item) => item.item_checked))
		);
		if (uniqueIdentifier == 'date_wise_campaign' && title == 'Columns') {
			setDynamicSelectedFilter('GeneralColumnOmit');
		}
		if (uniqueIdentifier == 'date_wise_campaign' && title == 'Dimension') {
			setDynamicSelectedFilter('GeneralDimensionOmit');
		}
	};

	const popupLabelData = omittedColumn?.filter((item) => {
		if (item?.item_checked) {
			return item?.type_auto_name;
		}
	});

	return (
		<div
			className={`check-wrapper select-account-wrapper last-updated-height column-filter ${
				title == 'Columns' ? 'custom_omit_filter' : ''
			}`}
		>
			<a
				className={
					popupLabelData?.length > 0 ? 'add-filter filter-btn btn-active' : 'add-filter filter-btn'
				}
			>
				{title}
				{popupLabelData?.length > 0 && (
					<>
						<span className='selected-item'>
							:
							{popupLabelData?.slice(0, 2)?.map((item, index) => (
								<span className='selected-item-value' key={index}>
									{' '}
									{item?.type_auto_name}{' '}
								</span>
							))}
							{popupLabelData?.length > 2 && <span>+{popupLabelData?.length - 2} more </span>}
						</span>
					</>
				)}
			</a>
			<div className={'checkboxes full-and-multi-filter'}>
				<div className='filter-title-box'>
					<span className='predicate-field-label'>{title}</span>
					<a className='close-filter'>
						<MdClose className='material-icons' />
					</a>
				</div>
				<div className='check-boxes-inner'>
					<div className='left-check-box box2'>
						<div className='search-input show-modal'></div>
						<div className='all-select-row'>
							<form id='report-account-class' onSubmit={handleApply}>
								{filteredPlatformData?.length === 0 ? (
									<div className='noResult'>
										<p>No Result Found</p>
									</div>
								) : (
									filteredPlatformData?.map((platform, index) => (
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
									))
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
		</div>
	);
};

export default GeneralOmitColumn;
