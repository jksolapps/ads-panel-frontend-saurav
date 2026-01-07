/** @format */
import React, { useContext, useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import filterPopupData from '../../../utils/report_filter.json';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import EmptyListBox from '../../GeneralComponents/EmptyListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const CountryPopup = ({
	setPageNumber,
	setIsReportLoaderVisible = () => {},
	setCurrentUnitPage,
	setDisabled,
	filterData,
	countryWiseSorting,
	countryFlag,
}) => {
	const { countryValue, setCountryValue, setPopupFlags, popupFlags, setReportSelectedFilter } =
		useContext(ReportContext);
	const [allCountryData, setAllCountryData] = useState([]);
	const [filteredCountryData, setFilteredCountryData] = useState([]);
	const [checkedCountry, setCheckedCountry] = useState([]);
	const [searchText, setSearchText] = useState('');

	let data;
	if (countryWiseSorting?.length > 0 || countryFlag) {
		data = countryWiseSorting;
	} else {
		data = filterPopupData?.all_countries;
	}

	useEffect(() => {
		const localData = JSON.parse(sessionStorage.getItem('country_filter'));
		const initialCountryData = data?.map((v) => {
			const isChecked = localData?.some((app) => app.id == v.id);
			return {
				...v,
				item_checked: isChecked,
			};
		});
		setCountryValue(initialCountryData.filter((item) => item.item_checked));
		setAllCountryData(initialCountryData);
		setFilteredCountryData(initialCountryData);
	}, [countryWiseSorting, filterPopupData, data?.length > 0]);

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
		e.preventDefault();
		close();
		setReportSelectedFilter('CountryPopup');
		setSearchText('');
		setFilteredCountryData(allCountryData);
		setIsReportLoaderVisible(true);
		setPageNumber(1);
		setCountryValue(checkedCountry);
		setPopupFlags(!popupFlags);
		setCurrentUnitPage(1);
		sessionStorage.setItem('country_filter', JSON.stringify(checkedCountry));
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

	const handleSearch = (e) => {
		const searchText = e.target.value.toLowerCase();
		const originalText = e.target.value;
		setSearchText(originalText);
		const updatedFilteredData = allCountryData.filter((item) =>
			item.name.toLowerCase().includes(searchText)
		);

		setFilteredCountryData(updatedFilteredData);
	};

	//select all
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
		<Popover className='check-wrapper app-select-popup custom_country_filter_popup'>
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
								:
								{countryValue
									?.map((item) => {
										return item?.name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item?.slice(0, 8)}
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
											id='searchInput2'
											onChange={handleSearch}
											value={searchText || ''}
											required
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
																	// checked={isAppChecked(country)}
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
											<button type='submit' className='apply-btn ' onClick={() => setDisabled(true)}>
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

export default CountryPopup;
