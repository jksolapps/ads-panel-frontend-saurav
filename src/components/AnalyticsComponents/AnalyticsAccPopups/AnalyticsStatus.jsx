/** @format */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import { DataContext } from '../../../context/DataContext';
import { IoCloseOutline } from 'react-icons/io5';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const AnalyticsStatus = ({ setIsReportLoaderVisible = () => {} }) => {
	const { statusData, setStatusData } = useContext(ReportContext);
	const { addUserFlag, setAddUserFlag } = useContext(DataContext);
	//filtering_data
	const initialData = [
		{ status_id: '0', status_name: 'All', item_checked: true },
		{ status_id: '1', status_name: 'Active', value: '1', item_checked: false },
		{ status_id: '2', status_name: 'Inactive', value: '0', item_checked: false },
	];

	const [searchText, setSearchText] = useState('');
	const [allAccountData, setallAccountData] = useState(initialData || []);
	const [filteredAccountData, setfilteredAccountData] = useState(initialData || []);
	const [checkedAccount, setcheckedAccount] = useState([]);

	useEffect(() => {
		setcheckedAccount(allAccountData?.filter((item) => item.item_checked));
	}, [allAccountData, filteredAccountData]);

	const handleCheckboxChange = (platform, index) => {
		const updatedFilteredData = filteredAccountData.map((item) =>
			item.status_id === platform.status_id
				? { ...item, item_checked: true }
				: { ...item, item_checked: false }
		);
		setfilteredAccountData(updatedFilteredData);
		const updatedAllData = allAccountData.map((item) =>
			item.status_id === updatedFilteredData[index].status_id
				? { ...updatedFilteredData[index] }
				: { ...item, item_checked: false }
		);
		setallAccountData(updatedAllData);
	};
	const handleApply = (e, close) => {
		e.preventDefault();
		close();
		setSearchText('');
		setfilteredAccountData(allAccountData);
		setIsReportLoaderVisible(true);
		setAddUserFlag(!addUserFlag);
		setStatusData(checkedAccount);
	};

	const handleSearch = (e) => {
		const searchText = e.target.value.toLowerCase();
		setSearchText(searchText);
		const updatedFilteredData = allAccountData.filter((item) =>
			item.status_name.toLowerCase().includes(searchText)
		);

		setfilteredAccountData(updatedFilteredData);
	};
	return (
		<Popover className='check-wrapper select-account-wrapper account-orderby-filter'>
			<PopoverTrigger>
				<a
					className={
						statusData?.length > 0 ? 'popover_filter filter-btn btn-active' : 'popover_filter filter-btn'
					}
				>
					<span>Status</span>
					{statusData?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{statusData
									?.map((item) => {
										return item?.status_name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{item}
										</li>
									))}
								{statusData?.length > 2 && <span>+{statusData?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className={'checkbox_popover full-and-multi-filter account-page-act-filter'}>
						<div className='filter-title-box'>
							<span className='predicate-field-label'> Status</span>
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
											id='searchInput99'
											onChange={handleSearch}
											value={searchText || ''}
											required
											placeholder='Search'
											autoComplete='off'
										/>
										<a
											href='#'
											className='clear-icon-btn i-btn'
											onClick={() => {
												setSearchText('');
												setcheckedAccount(allAccountData);
												setfilteredAccountData(allAccountData);
											}}
										>
											<IoCloseOutline className='material-icons' />
										</a>
										<a href='#' className='search-icon-btn i-btn'>
											<MdSearch className='material-icons' />
										</a>
										<div className='border-active'></div>
									</div>
								</div>
								<div className='all-select-row'>
									<form id='report-account-class' onSubmit={(e) => handleApply(e, close)}>
										{filteredAccountData?.length === 0 ? (
											<div className='noResult'>
												<p>No Result Found</p>
											</div>
										) : (
											filteredAccountData?.map((platform, index) => (
												<div className='box-check' key={index}>
													<label>
														<input
															type='checkbox'
															name={platform?.status_id}
															value={platform?.platform_display_name || ''}
															checked={platform.item_checked || ''}
															onChange={() => handleCheckboxChange(platform, index)}
														/>
														<span>
															<span className='search-title'>{platform?.status_name}</span>
														</span>
													</label>
												</div>
											))
										)}
										<div className='apply-btn-wrap text-right'>
											<button
												type='submit'
												className='apply-btn'
												disabled={filteredAccountData?.length === 0 ?? true}
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

export default AnalyticsStatus;
