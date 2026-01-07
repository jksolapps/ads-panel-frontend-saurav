/** @format */
import React, { useContext, useEffect, useState, useRef } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import filterPopupData from '../../utils/report_filter.json';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { useLocation } from 'react-router-dom';
import EmptyListBox from '../GeneralComponents/EmptyListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/Popover';

const GeneralCountry = ({
	uniqueIdentifier,
	countryValue,
	setCountryValue,
	fetchFlag = false,
	setFetchFlag = () => {},
	setMainLoader = () => {},
	setCampaignId,
	isCountryChecked,
	setIsCountryChecked,
	isCampaignChecked,
	setDynamicSelectedFilter,
}) => {
	const { state } = useLocation();
	const [allCountryData, setAllCountryData] = useState([]);
	const [filteredCountryData, setFilteredCountryData] = useState([]);
	const [checkedCountry, setCheckedCountry] = useState([]);
	const [searchText, setSearchText] = useState('');

	const copyCountryList = JSON.parse(JSON.stringify(filterPopupData?.all_countries));
	let data = copyCountryList;

	if (uniqueIdentifier === 'campaign_tab') {
		const isAlreadyAdded = data.some(
			(item) => item.id === '0' && item.alpha2_code === 'ALL' && item.name === 'All Country'
		);
		if (!isAlreadyAdded) {
			data.unshift({ id: '0', alpha2_code: 'ALL', name: 'All Country' });
		}
	}

	useEffect(() => {
		const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_country_filter'));
		const initialCountryData = data?.map((v) => {
			let isInitialChecked = localData?.some((app) => app.id == v.id);
			if (
				(uniqueIdentifier === 'retention_pp' || uniqueIdentifier === 'retention_raw') &&
				!localData?.length &&
				v.name === 'United States'
			) {
				isInitialChecked = true;
			}
			if (uniqueIdentifier === 'retention_pp' && state) {
				isInitialChecked = false;
			}
			return {
				...v,
				item_checked: isInitialChecked ? isInitialChecked : false,
			};
		});

		setCountryValue(initialCountryData.filter((item) => item.item_checked));
		setAllCountryData(initialCountryData);
		setFilteredCountryData(initialCountryData);
	}, [filterPopupData, isCampaignChecked]);

	useEffect(() => {
		setCheckedCountry(allCountryData.filter((item) => item.item_checked));
	}, [allCountryData, filteredCountryData]);

	const handleCheckboxChange = (country, index) => {
		const updatedFilteredData = filteredCountryData.map((item) =>
			item.name === country.name ? { ...item, item_checked: !item.item_checked } : item
		);
		setFilteredCountryData(updatedFilteredData);
		const updatedAllData = allCountryData.map((item) =>
			item.id === updatedFilteredData[index].id ? { ...updatedFilteredData[index] } : { ...item }
		);
		setAllCountryData(updatedAllData);
	};

	const handleApply = (e, close) => {
		setSearchText('');
		setFilteredCountryData(allCountryData);
		e.preventDefault();
		setMainLoader(true);
		setCountryValue(checkedCountry);
		if (uniqueIdentifier == 'heatmap') {
			setCampaignId([]);
			sessionStorage.removeItem('heatmap_selected_item');
			setIsCountryChecked(!isCountryChecked);
			setDynamicSelectedFilter('GeneralCountry');
			sessionStorage.setItem('heatmap_country_filter', JSON.stringify(checkedCountry));
		}
		if (uniqueIdentifier == 'date_wise_campaign') {
			setDynamicSelectedFilter('GeneralCountryFilter');
		}
		if (
			uniqueIdentifier == 'analytics' ||
			uniqueIdentifier == 'retention' ||
			uniqueIdentifier == 'new_retention' ||
			uniqueIdentifier == 'retention_pp' ||
			uniqueIdentifier == 'retention_raw' ||
			uniqueIdentifier == 'monthly_analytics' ||
			uniqueIdentifier == 'report'
		) {
			sessionStorage.setItem(uniqueIdentifier + '_country_filter', JSON.stringify(checkedCountry));
		}
		setFetchFlag(!fetchFlag);
		close();
	};

	const handleClose = (item) => {
		const updatedCountry = allCountryData.map((country) =>
			country.id === item.id ? { ...country, item_checked: !country.item_checked } : country
		);
		setAllCountryData(updatedCountry);
		setFilteredCountryData(updatedCountry);
	};

	const handleClear = () => {
		const resetData = data?.map((v) => ({
			...v,
			item_checked: false,
		}));
		const resetDataFilter = filteredCountryData.map((v) => ({
			...v,
			item_checked: false,
		}));
		setAllCountryData(resetData);
		setFilteredCountryData(resetDataFilter);
	};

	// const handleSearch = (e) => {
	// 	const value = e.target.value;
	// 	setSearchText(value);
	// 	workerRef.current?.postMessage({
	// 		allCountryData,
	// 		query: value
	// 	});
	// };

	const handleSearch = (e) => {
		const searchText = e.target.value?.toLowerCase();
		const originalText = e.target.value;
		setSearchText(originalText);
		const updatedFilteredData = allCountryData.filter((item) =>
			item.name.toLowerCase().includes(searchText)
		);
		setFilteredCountryData(updatedFilteredData);
	};

	const areAllCheckedInAllApps = () => {
		return filteredCountryData?.every((app) => app.item_checked);
	};

	const handleSelectAllInAllApps = (event) => {
		const isChecked = event.target.checked;
		const updatedSearchAllUnitData = filteredCountryData.map((app) => ({
			...app,
			item_checked: isChecked,
		}));
		setFilteredCountryData(updatedSearchAllUnitData);
		const updatedAllCountryData = allCountryData.map((app) => {
			const found = updatedSearchAllUnitData.find((filteredApp) => filteredApp.id === app.id);
			return found ? { ...app, item_checked: isChecked } : app;
		});
		setAllCountryData(updatedAllCountryData);
	};

	return (
		<Popover className={`check-wrapper general_country_filter ${uniqueIdentifier}-dynamic-filter`}>
			<PopoverTrigger>
				<a
					className={
						countryValue?.length > 0
							? 'popover_filter filter-btn btn-active'
							: 'popover_filter filter-btn'
					}
				>
					<span>Country</span>
					{countryValue?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{countryValue
									?.map((item) => {
										return item?.name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item}
										</li>
									))}
								{countryValue?.length > 2 && <span>+{countryValue?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>
			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter' id='Lorems'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Country</span>
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
											id='searchInputCountry'
											placeholder='Search'
											autoComplete='off'
										/>
										<a
											className='clear-icon-btn i-btn'
											onClick={() => {
												setSearchText('');
												setFilteredCountryData(allCountryData);
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
										{filteredCountryData?.length === 0 ? (
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
															checked={areAllCheckedInAllApps()}
															onChange={(event) => handleSelectAllInAllApps(event)}
														/>
														<span className='search-title'>Select All</span>
													</label>
												</div>
												{filteredCountryData?.map((country, index) => {
													return (
														<div className='box-check' key={country?.id}>
															<label>
																<input
																	type='checkbox'
																	name={country?.id}
																	value={country?.name || ''}
																	className='ckkBox val'
																	checked={country.item_checked}
																	onChange={() => handleCheckboxChange(country, index)}
																/>
																<span>
																	<span className='search-title'>{country?.name}</span>
																</span>
															</label>
														</div>
													);
												})}
											</>
										)}
										<div className='apply-btn-wrap text-right'>
											<button type='submit' className='apply-btn '>
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
										Clear all
									</a>
								</div>
								<div className='right-result-row'>
									{checkedCountry?.length === 0 && <EmptyListBox />}
									{checkedCountry?.map((item, index) => (
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

export default GeneralCountry;
