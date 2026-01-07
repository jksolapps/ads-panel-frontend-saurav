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
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const DateRangePopupNew = ({
	selectedStartDate,
	selectedEndDate,
	setPageNumber,
	setIsReportLoaderVisible,
	setCurrentUnitPage,
	perfermanceDateRange,
}) => {
	const { setDateRangeForAcct } = useContext(DataContext);
	const { popupFlags, setPopupFlags } = useContext(ReportContext);
	// const [selectedDateRange, setSelectedDateRange] = useState([
	// 	{
	// 		startDate: subDays(new Date(), 14),
	// 		endDate: subDays(new Date(), 0),
	// 		key: 'selection',
	// 	},
	// ]);

	const [selectedDateRange, setSelectedDateRange] = useState(() => {
	const today = new Date();
	const dayOfMonth = today.getDate();

	if (dayOfMonth <= 15) {
		return [
		{
			startDate: startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)),
			endDate: endOfDay(today),
			key: 'selection',
		},
		];
	}

	return [
		{
		startDate: startOfDay(subDays(today, 14)),
		endDate: endOfDay(today),
		key: 'selection',
		},
	];
	});

	useEffect(() => {
		setDateRangeForAcct(selectedDateRange);
	}, [popupFlags]);

	const handleSelect = (ranges) => {
		setSelectedDateRange([ranges.selection]);
	};
	const handleApplyButton = (close) => {
		setIsReportLoaderVisible(true);
		setPageNumber(1);
		setDateRangeForAcct(selectedDateRange);
		setPopupFlags(!popupFlags);
		setCurrentUnitPage(1);
		close();
	};
	useEffect(() => {
		if (perfermanceDateRange) {
			switch (String(perfermanceDateRange)) {
				case '1': // Today so far
					setSelectedDateRange([
						{ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()), key: 'selection' },
					]);
					break;
				case '2': // Yesterday vs same day last week
					setSelectedDateRange([
						{
							startDate: startOfDay(subDays(new Date(), 1)),
							endDate: endOfDay(subDays(new Date(), 1)),
							key: 'selection',
						},
					]);
					break;
				case '3':
					// Last 7 days vs previous 7 days
					setSelectedDateRange([
						{ startDate: addDays(new Date(), -7), endDate: addDays(new Date(), -1), key: 'selection' },
					]);
					break;
				case '4': // Last 28 days vs previous 28 days
					setSelectedDateRange([
						{
							startDate: subDays(startOfDay(new Date()), 28),
							endDate: endOfDay(new Date()),
							key: 'selection',
						},
					]);
					break;
				case '5': // Last 28 days vs previous 28 days
					setSelectedDateRange([
						{
							startDate: subDays(startOfDay(new Date()), 14),
							endDate: endOfDay(new Date()),
							key: 'selection',
						},
					]);
					break;
				default:
					break;
			}
			setPageNumber(1);
			setDateRangeForAcct(selectedDateRange);
			setPopupFlags(!popupFlags);
			setCurrentUnitPage(1);
		}
	}, []);
	return (
		<Popover className='check-wrapper date-range-reponsive'>
			<PopoverTrigger>
				<a className='popover_filter filter-btn btn-active'>
					Date range:
					<span className='date-range-font'> {`${selectedStartDate}-${selectedEndDate}`}</span>
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

export default DateRangePopupNew;
