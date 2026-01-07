/** @format */

import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import DatePicker, { Day } from 'react-multi-date-picker';

function GeneralSingleDatePicker({
	uniqueIdentifier,
	selectedDate,
	setSelectedDate,
	fetchFlags,
	setFetchFlags,
	monthRange,
	setDynamicSelectedFilter,
}) {
	const [tempSelectedDate, setTempSelectedDate] = useState(null);
	const [shouldCloseCalendar, setShouldCloseCalendar] = useState(false);

	const datePickerRef = useRef();
	useEffect(() => {
		const handleOutsideClick = (event) => {
			if (datePickerRef.current && !event.target.closest('.single-date-picker')) {
				setShouldCloseCalendar(true);
			} else {
				setShouldCloseCalendar(false);
			}
		};
		document.addEventListener('mousedown', handleOutsideClick);
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, []);

	function MyPlugin() {
		return (
			<div className='bottom_btn_wrap'>
				{selectedDate != null && (
					<div
						className='date-picker-apply apply-btn clear_btn'
						onClick={handleClear}
						style={{ width: '100%', cursor: 'pointer' }}
					>
						Clear
					</div>
				)}
				<div
					className='date-picker-apply apply-btn'
					onClick={handleApply}
					style={{ width: '100%', cursor: 'pointer' }}
				>
					Apply
				</div>
			</div>
		);
	}
	const handleApply = () => {
		// if (uniqueIdentifier == 'heatmap') {
		// 	setDynamicSelectedFilter('GeneralSingleDatePicker');
		// }
		setFetchFlags(!fetchFlags);
		setShouldCloseCalendar(true);
		setSelectedDate(tempSelectedDate);
	};
	const handleClear = () => {
		setFetchFlags(!fetchFlags);
		setTempSelectedDate(null);
		setSelectedDate(null);
		setShouldCloseCalendar(true);
	};

	return (
		<div
			className={`single-date-picker-wrap ${selectedDate != null ? 'date_selected' : ''
				} ${uniqueIdentifier}-dynamic-filter`}
		>
			{/* {{selectedDate && <span className='prefix_date'>Date :</span>} } */}
			<DatePicker
				ref={datePickerRef}
				value={selectedDate}
				onChange={(date) => setTempSelectedDate(date)}
				multiple={false}
				onOpen={() => setShouldCloseCalendar(false)}
				onClose={() => shouldCloseCalendar}
				className='single-date-picker'
				placeholder='Select Date'
				plugins={[<MyPlugin position='bottom' />]}
				mapDays={({ date, today }) => {
					let props = {};
					const [endMonth, startMonth] = monthRange.split(' - ');
					const startDate = moment(startMonth, 'MMM YYYY').startOf('month').toDate();
					const endDate = moment(endMonth, 'MMM YYYY').endOf('month').toDate();
					if (date < startDate || date > endDate || date > today) {
						props.disabled = true;
						props.style = { color: '#cccccc' };
					}
					return props;
				}}
				format='DD MMM YYYY'
			/>
		</div>
	);
}

export default GeneralSingleDatePicker;
