/** @format */

import React, { useContext, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { DataContext } from '../../../context/DataContext';
import { ReportContext } from '../../../context/ReportContext';
import {
	addDays,
	endOfDay,
	isSameDay,
	startOfDay,
	subDays,
	startOfYear,
	endOfYear,
} from 'date-fns';
import { DateRangePicker, defaultStaticRanges } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const DateRangePopup = ({
	selectedStartDate,
	selectedEndDate,
	setPageNumber,
	setIsReportLoaderVisible = () => {},
	setCurrentUnitPage,
	setDisabled,
	perfermanceDateRange,
}) => {
	const { setDateRange, dateRange } = useContext(DataContext);
	const { popupFlags, setPopupFlags } = useContext(ReportContext);

	const reportlocation = useLocation();
	const date = reportlocation?.state?.date;

	const get_date_range = (selection) => {
		if (selection === 1) {
			return [
				{
					startDate: addDays(new Date(), 0),
					endDate: addDays(new Date(), 0),
					key: 'selection',
				},
			];
		} else if (selection === 2) {
			return [
				{
					startDate: addDays(new Date(), -1),
					endDate: addDays(new Date(), -1),
					key: 'selection',
				},
			];
		} else if (selection === 3) {
			return [
				{
					startDate: addDays(new Date(), -7),
					endDate: addDays(new Date(), -1),
					key: 'selection',
				},
			];
		} else if (selection === 4) {
			// Last 28 days
			return [
				{
					startDate: addDays(new Date(), -28),
					endDate: addDays(new Date(), -1),
					key: 'selection',
				},
			];
		}
	};
	const sessionDateRange = JSON.parse(sessionStorage.getItem('report_date_range'));
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
				startDate: addDays(new Date(), startDiff),
				endDate: addDays(new Date(), endDiff),
				key,
			},
		];
	}

	const [selectedDateRange, setSelectedDateRange] = useState(
		sessionDateRange
			? updateSessionDate
			: [
					{
						startDate: addDays(new Date(), -7),
						endDate: addDays(new Date(), -1),
						key: 'selection',
					},
			  ]
	);

	useEffect(() => {
		const selectedDateFromDashboard = get_date_range(Number(date));
		if (selectedDateFromDashboard) {
			setDateRange(selectedDateFromDashboard);
			sessionStorage.setItem('report_date_range', JSON.stringify(selectedDateFromDashboard));
			setSelectedDateRange(selectedDateFromDashboard);
		} else if (perfermanceDateRange) {
			switch (String(perfermanceDateRange)) {
				case '1': // Today so far
					setSelectedDateRange([
						{ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()), key: 'selection' },
					]);
					setDateRange([
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
					setDateRange([
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
					setDateRange([
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
					setDateRange([
						{
							startDate: subDays(startOfDay(new Date()), 28),
							endDate: endOfDay(new Date()),
							key: 'selection',
						},
					]);
					break;
				case '5': // Last 15 days vs previous 15 days
					setSelectedDateRange([
						{
							startDate: subDays(startOfDay(new Date()), 14),
							endDate: endOfDay(new Date()),
							key: 'selection',
						},
					]);
					setDateRange([
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
		} else {
			setDateRange(selectedDateRange);
			sessionStorage.setItem('report_date_range', JSON.stringify(selectedDateRange));
		}
	}, [perfermanceDateRange]);

	const handleSelect = (ranges) => {
		setSelectedDateRange([ranges.selection]);
	};
	const handleApplyButton = (close) => {
		close();
		setDisabled(true);
		setIsReportLoaderVisible(true);
		setPageNumber(1);
		setDateRange(selectedDateRange);
		sessionStorage.setItem('report_date_range', JSON.stringify(selectedDateRange));
		setPopupFlags(!popupFlags);
		setCurrentUnitPage(1);
	};

	//jHOoac - fFBlx
	//jSsrJu - hFlTTV
	//grtkA - ddMYzF
	//TfOpe - dwTXNx

	return (
		<Popover className='check-wrapper date-range-reponsive'>
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
							<span className='predicate-field-label'>Date range</span>
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
									// direction="vertical"
									// scroll={{ enabled: true }}
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
						<div className={`apply-btn-wrap text-right`}>
							<button className='apply-btn' onClick={() => handleApplyButton(close)}>
								Apply
							</button>
						</div>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default DateRangePopup;
