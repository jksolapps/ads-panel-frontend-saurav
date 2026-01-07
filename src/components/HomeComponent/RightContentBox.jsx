/** @format */

import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import { MdEventNote } from 'react-icons/md';
import { Spinner } from 'react-bootstrap';
import AppPerformance from './AppPerformance';
import HomeActivityPerformance from './HomeActivityPerformance';
import Select from 'react-select';
import { overViewSelectOption } from '../../utils/helper';
import { DataContext } from '../../context/DataContext';
import { IoMdArrowDropdown } from 'react-icons/io';
import { useParams } from 'react-router-dom';
import SearchBar from '../GeneralComponents/SearchBar';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { useGroupSettings } from '../../context/GroupSettingsContext';
import HomeTopBox from './HomeTopBox';
import PerformanceTable from './PerformanceTable';

const RightContentBox = () => {
	const { setIsAppLoaderVisible, setIsSearched, appTab } = useContext(DataContext);
	const { selectedGroup } = useGroupSettings();
	const { id } = useParams();
	const [estimatedEarningsSelect, setEstimatedEarningsSelect] = useState('3');
	const [isLoaderVisible, setIsLoaderVisible] = useState({
    	appPerformance: false,
    	activityPerformance: false,
    	totalEarnings: false,
  	});

	const [count, setCount] = useState(1);
	const intervalRef = useRef(null);

	const earningsFormData = useMemo(() => {
		const data = new FormData();
		data.append('user_id', localStorage.getItem('id'));
		data.append('user_token', localStorage.getItem('token'));
		if (selectedGroup?.length > 0) {
			data.append('gg_id', selectedGroup);
		}
		data.append('type', estimatedEarningsSelect);
		return data;
	}, [estimatedEarningsSelect, selectedGroup]);

	const {
		data: estimatedData,
		isLoading: isEarningsLoading,
		isSuccess: apiSuccess,
	} = useQueryFetch(
		['home-estimated-earnings', selectedGroup],
		'get-dashboard-eastimated-earnings',
		earningsFormData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
		}
	);

	const estimatedEarnings = estimatedData || {};
	const time = estimatedEarnings?.dashboard_data_last_updated_at;

	useEffect(() => {
		intervalRef.current = setInterval(() => {
			setCount((prevCount) => prevCount + 1);
		}, 1000);
		if (apiSuccess) {
			clearInterval(intervalRef.current);
			setCount(1);
		}
		return () => clearInterval(intervalRef.current);
	}, [apiSuccess]);

	function getRelativeTime(timestampStr) {
		if (!timestampStr) return '';
		const timestamp = /^\d+$/.test(timestampStr)
			? new Date(parseInt(timestampStr, 10))
			: new Date(timestampStr);

		const now = new Date();
		const delta = now - timestamp;

		const seconds = Math.floor(delta / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
		if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
		if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
		return seconds <= 0 ? 'Just now' : `${seconds} second${seconds > 1 ? 's' : ''} ago`;
	}

	const updatedAtLabel = useMemo(() => getRelativeTime(time), [time, count]);

	const customStyles = {
		option: (provided) => ({
			...provided,
			color: 'black',
		}),
	};

	const selectedOverviewOption = useMemo(
		() =>
			overViewSelectOption.find((opt) => opt.value === estimatedEarningsSelect) ||
			overViewSelectOption[2],
		[estimatedEarningsSelect]
	);

	return (
		<div className={`right-box-wrap home-overview`}>
			{isEarningsLoading ? (
				<div className='shimmer-spinner home-main-spinner loader-container'>
					<div className='spinner_inner'>
						<Spinner animation='border' variant='secondary' />
						<div id='countdown' className='countdown'>
							{count}
						</div>
					</div>
				</div>
			) : (
				<div className='main-box-wrapper pdglr24 app-overview'>
					<div>
						<div className='top-bar'>
							<h1 className='title'>
								Home <span className='time-stamp'>{'(' + 'updated ' + updatedAtLabel + ')'}</span>
							</h1>
							<SearchBar
								id={id}
								appTab={appTab}
								setIsAppLoaderVisible={setIsAppLoaderVisible}
								setIsSearched={setIsSearched}
							/>
							<div />
						</div>

						<div className='main-box-row'>
							<div className='box-row grey-box'>
								<div className='sub-title pdglr16 pdgtb16 w-color'>Total estimated earnings</div>

								<HomeTopBox estimatedEarnings={estimatedEarnings} />
							</div>

							{/* Date range selector */}
							<div className='dropdown-row mrgt16 mrgb16'>
								<div className='mui-select home_date_select'>
									<MdEventNote className='note_icon' />
									<Select
										placeholder={<div className='select-placeholder'>Last 7 days vs previous 7 days</div>}
										defaultValue={selectedOverviewOption}
										value={selectedOverviewOption}
										options={overViewSelectOption}
										onChange={(e) => {
											if (e.value === estimatedEarningsSelect) return;
											setEstimatedEarningsSelect(e.value);
										}}
										components={{
											IndicatorSeparator: () => null,
											DropdownIndicator: () => <IoMdArrowDropdown />,
										}}
										className='overview-select'
										classNamePrefix='custom-overview-select'
										styles={customStyles}
										isSearchable={false}
										theme={(theme) => ({
											...theme,
											borderRadius: 0,
											border: 0,
											colors: {
												...theme.colors,
												primary25: '#eee',
												primary: '#e8f0fe',
											},
										})}
									/>
								</div>
							</div>

							<div className='feed-cards'>
								<HomeActivityPerformance
									overviewSelect={estimatedEarningsSelect}
									isLoaderVisible={isLoaderVisible}
                  					setIsLoaderVisible={setIsLoaderVisible}
								/>
								<AppPerformance
									overviewSelect={estimatedEarningsSelect}
									isLoaderVisible={isLoaderVisible}
                                    setIsLoaderVisible={setIsLoaderVisible}
								/>
							</div>
							<div className="single_app_report_table">
								<PerformanceTable />
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RightContentBox;
