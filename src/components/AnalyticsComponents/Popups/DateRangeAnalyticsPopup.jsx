/** @format */

import React, { useContext, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { DataContext } from '../../../context/DataContext';
import { ReportContext } from '../../../context/ReportContext';
import {
	addDays,
	isSameDay,
	startOfDay,
	endOfDay,
	subDays,
	startOfYear,
	endOfYear,
} from 'date-fns';

import { DateRangePicker, defaultStaticRanges } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useEffect } from 'react';
import moment from 'moment';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

function normalizeDateRange(rangeArr) {
	if (!Array.isArray(rangeArr)) return [];
	return rangeArr.map((range) => ({
		...range,
		startDate: range.startDate instanceof Date ? range.startDate : new Date(range.startDate),
		endDate: range.endDate instanceof Date ? range.endDate : new Date(range.endDate),
	}));
}

const DateRangeAnalyticsPopup = ({
	selectedStartDate,
	selectedEndDate,
	setIsAnalyticsLoaderVisible = () => {},
}) => {
	const today = new Date();
	const { dateRangeforAnalytics, setDateRangeforAnalytics } = useContext(DataContext);
	const {
		popupFlags,
		setPopupFlags,
		setCampaignData,
		campaignLastToggledFlag,
		setCampaingLastToggledFlag,
		setToggleResizeAnalytics,
	} = useContext(ReportContext);

	const sessionDateRange = JSON.parse(sessionStorage.getItem('analytics_date_range'));

	let updateSessionDate;
	if (sessionDateRange) {
		const { startDate, endDate, key } = sessionDateRange[0];

		const sessionStart = moment(startDate).local();
		const sessionEnd = moment(endDate).local();
		const today = moment().local();
		const startDiff = sessionStart.diff(today, 'days');
		const endDiff = sessionEnd.diff(today, 'days');
		updateSessionDate = [
			{
				startDate: startOfDay(addDays(new Date(), startDiff)),
				endDate: endOfDay(addDays(new Date(), endDiff)),
				key,
			},
		];
	}
	const [selectedDateRange, setSelectedDateRange] = useState(
		sessionDateRange
			? normalizeDateRange(updateSessionDate)
			: [
					{
						startDate: startOfDay(today),
						endDate: endOfDay(today),
						key: 'selection',
					},
			  ]
	);

	//handle range for single app select
	useEffect(() => {
		if (dateRangeforAnalytics && dateRangeforAnalytics?.length > 0) {
			setSelectedDateRange(normalizeDateRange(dateRangeforAnalytics));
		}
	}, [dateRangeforAnalytics]);

	useEffect(() => {
		setDateRangeforAnalytics(selectedDateRange);
		sessionStorage.setItem('analytics_date_range', JSON.stringify(selectedDateRange));
	}, []);

	const handleSelect = (ranges) => {
		setSelectedDateRange([ranges.selection]);
	};

	const handleApplyButton = (close) => {
		setToggleResizeAnalytics(true);
		setIsAnalyticsLoaderVisible(true);
		setDateRangeforAnalytics(selectedDateRange);
		sessionStorage.setItem('analytics_date_range', JSON.stringify(selectedDateRange));
		setCampaignData([]);
		setCampaingLastToggledFlag(!campaignLastToggledFlag);
		setPopupFlags(!popupFlags);
		close();
	};

	return (
		<Popover className='check-wrapper analytics-date-range'>
			<PopoverTrigger>
				<a className='popover_filter filter-btn btn-active'>
					Date range:
					<span className=' date-range-font'> {`${selectedStartDate}-${selectedEndDate}`}</span>
				</a>
			</PopoverTrigger>
			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter custom-date-picker' id='Lorems'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Date range:</span>
							<a className='close-filter' onClick={close}>
								<MdClose className='material-icons' />
							</a>
						</div>
						<div className='check-boxes-inner'>
							<div className='all-select-row'>
								<DateRangePicker
									onChange={handleSelect}
									showSelectionPreview={true}
									moveRangeOnFirstSelection={false}
									months={2}
									minDate={new Date(2014, 0, 1)}
									maxDate={new Date()}
									ranges={selectedDateRange}
									direction='horizontal'
									staticRanges={[
										...defaultStaticRanges,
										{
											label: 'Last 7 days',
											range: () => ({
												startDate: addDays(new Date(), -7),
												endDate: addDays(new Date(), -1),
											}),
											isSelected(range) {
												const definedRange = this.range();
												return (
													isSameDay(range.startDate, definedRange.startDate) &&
													isSameDay(range.endDate, definedRange.endDate)
												);
											},
										},
										{
											label: 'Last 15 days',
											range: () => ({
												startDate: subDays(new Date(), 15),
												endDate: subDays(new Date(), 1),
											}),
											isSelected(range) {
												const definedRange = this.range();
												return (
													isSameDay(range.startDate, definedRange.startDate) &&
													isSameDay(range.endDate, definedRange.endDate)
												);
											},
										},
										{
											label: 'Last 30 days',
											range: () => ({
												startDate: subDays(new Date(), 30),
												endDate: subDays(new Date(), 1),
											}),
											isSelected(range) {
												const definedRange = this.range();
												return (
													isSameDay(range.startDate, definedRange.startDate) &&
													isSameDay(range.endDate, definedRange.endDate)
												);
											},
										},
										{
											label: 'Last 60 days',
											range: () => ({
												startDate: subDays(new Date(), 60),
												endDate: subDays(new Date(), 1),
											}),
											isSelected(range) {
												const definedRange = this.range();
												return (
													isSameDay(range.startDate, definedRange.startDate) &&
													isSameDay(range.endDate, definedRange.endDate)
												);
											},
										},
										{
											label: 'Last 90 days',
											range: () => ({
												startDate: subDays(new Date(), 90),
												endDate: subDays(new Date(), 1),
											}),
											isSelected(range) {
												const definedRange = this.range();
												return (
													isSameDay(range.startDate, definedRange.startDate) &&
													isSameDay(range.endDate, definedRange.endDate)
												);
											},
										},
										{
											label: 'Last 180 days',
											range: () => ({
												startDate: subDays(new Date(), 180),
												endDate: subDays(new Date(), 1),
											}),
											isSelected(range) {
												const definedRange = this.range();
												return (
													isSameDay(range.startDate, definedRange.startDate) &&
													isSameDay(range.endDate, definedRange.endDate)
												);
											},
										},
										{
											label: 'Last 12 months',
											range: () => ({
												startDate: subDays(new Date(), 365),
												endDate: new Date(),
											}),
											isSelected(range) {
												const r = this.range();
												return isSameDay(range.startDate, r.startDate) && isSameDay(range.endDate, r.endDate);
											},
										},
										{
											label: 'Last Calendar Year',
											range: () => ({
												startDate: startOfYear(subDays(new Date(), 365)),
												endDate: endOfYear(subDays(new Date(), 365)),
											}),
											isSelected(range) {
												const r = this.range();
												return isSameDay(range.startDate, r.startDate) && isSameDay(range.endDate, r.endDate);
											},
										},
										{
											label: 'This Year (Jan - Today)',
											range: () => ({
												startDate: startOfYear(new Date()),
												endDate: new Date(),
											}),
											isSelected(range) {
												const r = this.range();
												return isSameDay(range.startDate, r.startDate) && isSameDay(range.endDate, r.endDate);
											},
										},
									]}
								/>
							</div>
						</div>
						<div className='apply-btn-wrap text-right'>
							<button href='#' className='apply-btn' onClick={() => handleApplyButton(close)}>
								Apply
							</button>
						</div>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default DateRangeAnalyticsPopup;
