/** @format */
/** @format */

import React, { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/Popover';

const UserCountFilter = ({
	uniqueIdentifier,
	filterName = 'Minimum User',
	minimumUser,
	setMinimumUser,
	setIsLoaderVisible = () => {},
	fetchFlags,
	setFetchFlags,
}) => {
	const [allFormatData, setAllFormatData] = useState([]);
	const [filteredFormatData, setFilteredFormatData] = useState([]);
	const [checkedFormat, setCheckedFormat] = useState([]);
	const [searchText, setSearchText] = useState('');
	const [customChecked, setCustomChecked] = useState(false);
	const [customValue, setCustomValue] = useState('');

	const filterList = [
		{
			id: 1,
			name: '1+',
			value: 1,
			item_checked: false,
		},
		{
			id: 2,
			name: '10+',
			value: 10,
			item_checked: false,
		},
		{
			id: 3,
			name: '100+',
			value: 100,
			item_checked: true,
		},
		{
			id: 4,
			name: '1,000+',
			value: 1000,
			item_checked: false,
		},
		{
			id: 5,
			name: '10,000+',
			value: 10000,
			item_checked: false,
		},
	];

	useEffect(() => {
		const initialGroupData = filterList.map((v) => ({
			...v,
		}));
		const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_minimum_user_filter'));
		const customItem = Array.isArray(localData)
			? localData.find((it) => String(it.id) === 'custom')
			: null;
		if (customItem) {
			setCustomChecked(true);
			setCustomValue(String(customItem.value || ''));
		}
		const updatedData = initialGroupData?.map((item) => {
			const isChecked = localData?.some((app) => app.id == item.id);
			return {
				...item,
				item_checked: localData ? (isChecked ? isChecked : false) : item.item_checked,
			};
		});
		setAllFormatData(updatedData);
		setFilteredFormatData(updatedData);
		setMinimumUser(customItem ? [customItem] : updatedData.filter((item) => item.item_checked));
	}, [uniqueIdentifier]);

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
		if (customChecked) setCustomChecked(false);
	};

	const handleApply = (e, close) => {
		e.preventDefault();
		close();
		setSearchText('');
		setFilteredFormatData(allFormatData);
		setIsLoaderVisible(true);
		let finalSelection = checkedFormat;
		if (customChecked) {
			const numeric = parseInt(customValue.replace(/,/g, ''), 10);
			if (Number.isFinite(numeric) && numeric > 0) {
				const customItem = {
					id: 'custom',
					name: `${numeric.toLocaleString()}+`,
					value: numeric,
					item_checked: true,
				};
				finalSelection = [customItem];
			}
		}
		setMinimumUser(finalSelection);
		setFetchFlags(!fetchFlags);
		sessionStorage.setItem(uniqueIdentifier + '_minimum_user_filter', JSON.stringify(finalSelection));
	};

	return (
		<Popover className={`check-wrapper app-select-popup custom_medium_filter`}>
			<PopoverTrigger>
				<a
					className={
						minimumUser?.length > 0 ? 'popover_filter filter-btn btn-active' : 'popover_filter filter-btn'
					}
				>
					<span>{filterName}</span>
					{minimumUser?.length > 0 && (
						<>
							<ul className='selected-item'>
								:
								{minimumUser
									?.map((item) => {
										return item?.name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item}{' '}
										</li>
									))}
								{minimumUser?.length > 2 && <span>+{minimumUser?.length - 2} more </span>}
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
										<div className='custom_min_user_wrap' key={'custom_min_user'}>
											<label>
												<input
													type='checkbox'
													name='custom_min_user'
													className='ckkBox val'
													checked={customChecked}
													onChange={() => {
														const newChecked = !customChecked;
														setCustomChecked(newChecked);
														if (newChecked) {
															const cleared = allFormatData.map((it) => ({ ...it, item_checked: false }));
															setAllFormatData(cleared);
															setFilteredFormatData(cleared);
														}
														if (!newChecked) {
															setCustomValue(''); // clear when unchecked manually
														}
													}}
												/>
												<input
													type='text'
													inputMode='numeric'
													className='input custom_min_user_count'
													placeholder='Enter number'
													value={customValue}
													onChange={(e) => {
														const onlyDigits = e.target.value.replace(/\D+/g, '');

														if (onlyDigits.length > 0 && !customChecked) {
															const cleared = allFormatData.map((it) => ({ ...it, item_checked: false }));
															setAllFormatData(cleared);
															setFilteredFormatData(cleared);
															setCustomChecked(true);
														}

														if (onlyDigits) {
															const formatted = new Intl.NumberFormat('en-IN').format(Number(onlyDigits));
															setCustomValue(formatted);
														} else {
															setCustomValue('');
															setCustomChecked(false);
														}
													}}
												/>
											</label>
											<span className='search-title'>+</span>
										</div>

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

export default UserCountFilter;
