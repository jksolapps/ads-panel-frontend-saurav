/** @format */

export const SITE_NAME = 'Jksol';

export const overViewSelectOption = [
	{ value: '1', label: 'Today so far' },
	{ value: '2', label: 'Yesterday vs same day last week' },
	{ value: '3', label: 'Last 7 days vs previous 7 days' },
	{ value: '5', label: 'Last 15 days vs previous 15 days' },
	{ value: '4', label: 'Last 30 days vs previous 30 days' },
];

//KMB method - Format Value
export function formatValue(value) {
	if (value === '-' || value === undefined || value === null || value === '') {
		return '-';
	}
	let valueInString = String(value);
	const numberValue = valueInString ? valueInString?.replace(/[^0-9.$]/g, '') : '';
	let hasDollarSign = numberValue?.includes('$');
	let finalNumber = numberValue?.replace('$', '');

	// let finalNumber = 1 * 99999;
	const units = [
		{ threshold: 1e9, abbreviation: 'B' },
		{ threshold: 1e6, abbreviation: 'M' },
		{ threshold: 1e3, abbreviation: 'K' },
	];
	// Handle negative numbers
	const isNegative = finalNumber < 0;
	finalNumber = Math.abs(finalNumber);
	const unit = units.find((unit) => finalNumber >= unit.threshold);

	let formattedNumber;
	if (unit?.abbreviation == 'K') {
		formattedNumber = (finalNumber / unit.threshold).toFixed(0) + unit.abbreviation;
	} else if (unit) {
		formattedNumber = (finalNumber / unit.threshold).toFixed(2) + unit.abbreviation;
	} else {
		formattedNumber = finalNumber.toFixed(2);
	}

	if (!Number.isInteger(finalNumber)) {
		finalNumber = finalNumber?.toFixed(2);
	} else {
		finalNumber = finalNumber?.toFixed(0);
	}

	if (finalNumber < 1e2) {
		let soFar = (isNegative ? '-' : '') + finalNumber;
		if (hasDollarSign) soFar = '$' + soFar;
		return soFar;
	} else if (finalNumber > 1e5 && finalNumber < 1e6) {
		let soFar = (isNegative ? '-' : '') + formattedNumber;
		if (hasDollarSign) soFar = '$' + soFar;
		return soFar;
	} else if (finalNumber > 1e6 && finalNumber < 1e9) {
		let soFar = (isNegative ? '-' : '') + formattedNumber;
		if (hasDollarSign) soFar = '$' + soFar;
		return soFar;
	} else if (finalNumber > 1e9) {
		let soFar = (isNegative ? '-' : '') + formattedNumber;
		if (hasDollarSign) soFar = '$' + soFar;
		return soFar;
	} else {
		if (!Number.isInteger(finalNumber)) {
			finalNumber = +finalNumber;
			finalNumber = displayNumber(finalNumber);
		} else {
			finalNumber = +finalNumber;
			finalNumber = finalNumber.toFixed(0);
		}
		let soFar = (isNegative ? '-' : '') + finalNumber;
		if (hasDollarSign) soFar = '$' + soFar;
		return soFar;
	}
}

//toolTip
export function formatTooltipValue(value) {
	if (value === '-' || value === undefined || value === null || value === '') {
		return '-';
	}
	const numberValue = value.replace(/[^0-9.$]/g, '');

	let hasDollarSign = numberValue?.includes('$');
	let finalNumber = numberValue?.replace('$', '');
	//let finalNumber = 1 * 1234567890.1235;
	// Handle negative numbers
	const isNegative = finalNumber < 0;
	finalNumber = Math.abs(finalNumber);

	let formattedNumber;
	if (!Number.isInteger(finalNumber)) {
		formattedNumber = finalNumber?.toFixed(2);
		finalNumber = finalNumber?.toFixed(2);
	} else {
		formattedNumber = finalNumber?.toString();
		finalNumber = finalNumber?.toFixed(0);
	}

	if (finalNumber < 1e2) {
		let soFar = (isNegative ? '-' : '') + finalNumber;
		if (hasDollarSign) soFar = '$' + soFar;
		return soFar;
	} else if (finalNumber > 1e5 && finalNumber < 1e6) {
		let soFar = (isNegative ? '-' : '') + formattedNumber;
		if (hasDollarSign) soFar = '$' + soFar;
		return soFar;
	} else if (finalNumber > 1e6 && finalNumber < 1e9) {
		let soFar = (isNegative ? '-' : '') + formattedNumber;
		if (hasDollarSign) soFar = '$' + soFar;
		return soFar;
	} else if (finalNumber > 1e9) {
		let soFar = (isNegative ? '-' : '') + formattedNumber;
		if (hasDollarSign) soFar = '$' + soFar;
		return soFar;
	} else {
		let soFar = (isNegative ? '-' : '') + finalNumber;
		if (hasDollarSign) soFar = '$' + soFar;
		return soFar;
	}
}

//remove trailing zero
export function displayNumber(num) {
	const isInteger = Number.isInteger(num);

	const roundedNumber = Math.round(num * 100) / 100;

	const isIntegerafterCal = Number.isInteger(roundedNumber);
	const formattedNumber = isInteger
		? num.toString()
		: isIntegerafterCal
		? roundedNumber.toFixed(0)
		: roundedNumber.toFixed(2);
	return formattedNumber;
}

export function displayNumberRoas(num) {
	const isInteger = Number.isInteger(num);
	const roundedNumber = Math.round(num * 100) / 100;
	const isIntegerafterCal = Number.isInteger(roundedNumber);

	const formattedNumber = isInteger
		? num.toString()
		: roundedNumber == 1
		? roundedNumber.toFixed(1)
		: isIntegerafterCal
		? roundedNumber.toFixed(0)
		: roundedNumber.toFixed(2);

	return formattedNumber;
}

// Indian Format
export function indianNumberFormat(value) {
	if (!value) {
		return '0';
	} else if (value === '$0') {
		return '-';
	}
	// Split the number into integer and decimal parts
	const parts = value.toString().split('.');
	const integer = parts[0];
	const decimal = parts.length > 1 ? '.' + parts[1] : '';
	// Add comma separators for thousands in the integer part, using a regex similar to the PHP code
	const formattedInteger = integer.replace(/(\d)(?=(\d\d)+\d$)/g, '$1,');
	// Combine the formatted integer and decimal parts
	return formattedInteger + decimal;
}
//fromat date
export function formatDate(dateValue) {
	// Parse the date string
	const year = dateValue?.substring(0, 4);
	const month = dateValue?.substring(4, 6);
	const day = dateValue?.substring(6, 8);
	const date = new Date(year, month - 1, day);

	// Format the date string
	const currentYear = new Date().getFullYear();
	const options = { day: '2-digit', month: 'short' };
	let formattedDate = '';

	if (date?.getFullYear() === currentYear) {
		formattedDate = date.toLocaleDateString('en-US', options);
	} else {
		options.year = '2-digit';
		formattedDate = date.toLocaleDateString('en-US', options);
	}

	return formattedDate;
}
//Value calculation functions

// export function microValueConvert(microValue) {
// 	// Check for non-numeric values
// 	if (isNaN(microValue)) {
// 		return 0; // Or throw an error, etc.
// 	}

// 	// Convert micro value to standard value if it's not zero
// 	if (microValue !== 0) {
// 		microValue = parseFloat(microValue) / 1000000;
// 	}
// 	return microValue;
// }

export function microValueConvert(microValue) {
	// Handle null/undefined early
	if (microValue == null || microValue === '') {
		return 0;
	}
	if (typeof microValue === 'string') {
		microValue = microValue.replace(/[^0-9.-]/g, '');
	}
	const numValue = Number(microValue);
	if (isNaN(numValue)) {
		return 0;
	}
	// Convert micro value to standard if not zero
	return numValue !== 0 ? numValue / 1_000_000 : 0;
}

export function calculateECPM(impressions, earnings) {
	// Handle potential errors due to zero or negative input values
	if (impressions <= 0 || earnings <= 0) {
		return 0; // Or return an error message or NaN if preferred
	}

	// Ensure numeric values using Number() or parseFloat() if necessary
	impressions = Number(impressions);
	earnings = Number(earnings);

	// Calculate eCPM using the correct formula
	const eCPM = (earnings / impressions) * 1000;

	return eCPM;
}

export const CalculationNumber = (value) => {
	if (value > 0) {
		const changeValue = indianNumberFormat(formatValue(String(value)));
		return '+' + changeValue;
	} else if (value < 0) {
		const changeValue = indianNumberFormat(formatValue(String(value)));
		return '-' + changeValue;
	} else {
		return '';
	}
};
export const CalculationNumberForTitle = (value) => {
	if (value > 0) {
		const changeValue = indianNumberFormat(formatTooltipValue(String(value)));
		return '+' + changeValue;
	} else if (value < 0) {
		const changeValue = indianNumberFormat(formatTooltipValue(String(value)));
		return '-' + changeValue;
	} else {
		return '';
	}
};
export const Calculation = (value) => {
	if (value > 0) {
		const changeValue = indianNumberFormat(formatValue(String(value)));
		return '+' + '$' + changeValue;
	} else if (value < 0) {
		const changeValue = indianNumberFormat(formatValue(String(value)));
		return '-' + '$' + changeValue;
	} else {
		return '';
	}
};

export const CalculationForTitle = (value) => {
	if (value > 0) {
		const changeValue = indianNumberFormat(formatTooltipValue(String(value)));
		return '+' + '$' + changeValue;
	} else if (value < 0) {
		const changeValue = indianNumberFormat(formatTooltipValue(String(value)));
		return '-' + '$' + changeValue;
	} else {
		return '';
	}
};

export const Calculationforpercent = (value) => {
	if (value > 0) {
		const changeValue = indianNumberFormat(formatValue(String(value)));
		return '(' + '+' + changeValue + '%' + ')';
	} else if (value < 0) {
		const changeValue = indianNumberFormat(formatValue(String(value)));
		return '(' + '-' + changeValue + '%' + ')';
	} else {
		return '';
	}
};

export const CalculationforpercentTitle = (value) => {
	if (value > 0) {
		const changeValue = indianNumberFormat(formatTooltipValue(String(value)));
		return '+' + changeValue + '%';
	} else if (value < 0) {
		const changeValue = indianNumberFormat(formatTooltipValue(String(value)));
		return '-' + changeValue + '%';
	} else {
		return '-';
	}
};

export function calculateTotals(data) {
	let totalAdRequests = 0;
	let totalEstimatedEarnings = 0;
	let totalImpressions = 0;
	let totalMatchedRequests = 0;

	data?.forEach((item) => {
		if (item.row) {
			totalAdRequests += parseInt(item.row.metricValues.AD_REQUESTS.integerValue);
			totalEstimatedEarnings += parseInt(item.row.metricValues.ESTIMATED_EARNINGS.microsValue);
			totalImpressions += parseInt(item.row.metricValues.IMPRESSIONS.integerValue);
			totalMatchedRequests += parseInt(item.row.metricValues.MATCHED_REQUESTS.integerValue);
		}
	});
	const TotalEstimatedEarnings = microValueConvert(totalEstimatedEarnings);
	const TotalMatchRate = (totalMatchedRequests / totalAdRequests) * 100;
	const TotalEcpm = calculateECPM(totalImpressions, TotalEstimatedEarnings);
	return {
		totalAdRequests,
		TotalEstimatedEarnings,
		totalImpressions,
		TotalMatchRate,
		TotalEcpm,
	};
}

export function calculateDifferenceAndPercentage(currentValue, summaryValue) {
	const difference = {};
	const percentageChange = {};

	// Calculate difference and percentage change for each property
	for (let key in currentValue) {
		if (currentValue.hasOwnProperty(key) && summaryValue.hasOwnProperty(key)) {
			if (!currentValue[key] || !summaryValue[key]) {
				continue;
			}
			const diff = currentValue[key] - summaryValue[key];
			const percentage = (diff / summaryValue[key]) * 100;

			difference[key] = diff;
			percentageChange[key] = percentage;
		}
	}

	return { difference, percentageChange };
}

export function analyticFormatDate(dateString) {
	if (!dateString) {
		return '-';
	}
	const currentDate = new Date();
	const inputDate = new Date(dateString);

	const currentYear = currentDate.getFullYear();
	const inputYear = inputDate.getFullYear();

	const currentMonth = currentDate.toLocaleString('default', {
		month: 'short',
	});
	const inputMonth = inputDate.toLocaleString('default', { month: 'short' });

	const currentDay = currentDate.getDate();
	const inputDay = inputDate.getDate();

	if (currentYear === inputYear && currentMonth === inputMonth && currentDay === inputDay) {
		// If the input date is today, display only the time in Indian Standard Time (IST)
		return inputDate.toLocaleTimeString('en-IN', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});
	} else {
		// If the input date is not today, display the date in "21 Jan 2021" format
		return inputDate.toLocaleString('en-IN', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});
	}
}

export const isValidDate = (d) => {
	return d instanceof Date && !isNaN(d);
};

// New custom date cell renderer function
export const customDateCell = (row) => {
	const date = new Date(row);
	const options = { day: '2-digit', month: 'short', year: 'numeric' };
	return isValidDate(date) ? date.toLocaleDateString('en-US', options) : 'Invalid Date';
};

//Jquery
import $ from 'jquery';
import moment from 'moment';

$(document).on('click', '.popup-wrapper.apps-popup', function (e) {
	if (!$(e.target).is('.secondary-label')) {
		$(this).parent().toggleClass('hover-active');
	}
	e.stopPropagation();
});

$(document).on('click', 'body', function (e) {
	if (!$(e.target).is('.secondary-label')) {
		$('.menu-popup-box.hover-active').removeClass('hover-active');
	}
});
$(document).on('click', function (e) {
	if (
		!(
			$(e.target).is('.toggle-next') ||
			$(e.target).closest('.checkboxes').length ||
			$(e.target).is('.selected-item, .selected-item-value')
		)
	) {
		$('.checkboxes.active').removeClass('active').slideUp(0);
	}
});

$(document).on('click', '.more-button', function (e) {
	$('.checkboxes.active').removeClass('active').slideUp(0);
});

$(document).on('click', '.input-box .input', function () {
	$(this).addClass('input-active');
});

$(document).on('click', 'body', function (e) {
	if (!$(e.target).is('.input-box .input')) $('.input-active').removeClass('input-active');
});
$(document).on('ready', '.input', function (e) {
	if ($('.input').val() != '') {
		$(this).removeClass('text-add');
	}
});
$(document).on('blur', '.input', function (e) {
	if ($(this).val() != '') {
		$(this).addClass('text-add');
		$(this).parents('.input-box').addClass('text-add-wrap');
	} else {
		$(this).removeClass('text-add');
	}
});
$(document).on('click', '.apply-btn', function () {
	$('.checkboxes.active').removeClass('active').slideUp(0);
});

$(document).on('click', '.more-button', function (e) {
	$(this).toggleClass('more-open');
	e.stopPropagation();
});

$(document).on('click', 'body:not(border-box)', function () {
	$('.more-button.more-open').removeClass('more-open');
});
$(document).on('click', '.select-dropdown .filter-adunitbox-label ', function () {
	$(this).parent().toggleClass('active');
});
$(document).on('click', '.select-dropdown .arrow-btn', function () {
	$(this).closest('.select-dropdown').toggleClass('active');
});
$(document).on('click', '.select-dropdown .ad-unit-input-field label', function () {
	$(this).closest('.select-dropdown').toggleClass('active');
});

// Report Filter
$(document).ready(function () {
	$('button.apply-btn').on('click', function () {
		$('.checkboxes.active').removeClass('active').slideUp(0);
	});
	$('a.apply-btn').on('click', function () {
		$(this)
			.parents('.none-selected-text')
			.parents('.right-result-box box2')
			.prev('.left-check-box')
			.find('input[type="checkbox"]')
			.removeAttr('checked');
	});
	$('input[type="checkbox"]').on('click', function () {
		$(this).attr('checked');
	});
});

$(document).ready(function () {
	function handleWindowResize() {
		if ($(window)?.width() > 570) {
			$('.sidebar-wrap').addClass('open-menu');
		}
	}
	handleWindowResize();
	$(window).on('resize', handleWindowResize);
});

$(document).ready(function () {
	function handleWindowResize() {
		if ($(window)?.width() < 570) {
			$('.sidebar-wrap').removeClass('open-menu');
			$('.right-box-wrap').removeClass('open-box');
		}
	}
	handleWindowResize();
	$(window).on('resize', handleWindowResize);
});

$(document).on('click', '.menu-btn', function () {
	if ($(window)?.width() < 570) {
		$('.sidebar-wrap').toggleClass('open-menu');
		$('.right-box-wrap').toggleClass('open-box');
	}
});

$(document).on('click', '.tippy_content_submenu', function () {
	$('.sidebar-wrap').removeClass('open-menu');
	$('.right-box-wrap').removeClass('open-box');
});
$(document).on('click', '.section-menu:not(.with-submenu)', function () {
	$('.sidebar-wrap').removeClass('open-menu');
	$('.right-box-wrap').removeClass('open-box');
});
$(document).on('click', '.main-wrapper .right-box-wrap', function () {
	if ($(window).width() <= 570) {
		$('.sidebar-wrap').removeClass('open-menu');
		$('.right-box-wrap').removeClass('open-box');
	}
});

$(document).on('click', '.report-table-scroll .rdt_TableCol', function () {
	$('.report-table-scroll .rdt_TableCol[data-column-id="2"]').addClass('active');
});
$(document).on('click', '.Account-Table .rdt_TableCol[data-column-id="7"]', function () {
	$('.Account-Table .rdt_TableCol[data-column-id="7"]').addClass('active');
});

$(document).on('click', '.Account-Table .rdt_TableCol:not([data-column-id="7"])', function () {
	$('.Account-Table .rdt_TableCol[data-column-id="7"]').removeClass('active');
});

$(document).on('click', '.report-table-scroll .rdt_TableCol[data-column-id="2"]', function () {
	$(this).removeClass('active');
});

$(document).on('click', '.app_metrics_table .rdt_TableCol', function () {
	$('.app_metrics_table .rdt_TableCol[data-column-id="1"]').addClass('active');
});
$(document).on('click', '.app_metrics_table .rdt_TableCol[data-column-id="1"]', function () {
	$(this).removeClass('active');
});

$(document).on('mouseenter mouseleave', 'rdt_TableCell', function () {
	var i = $(this).index() + 1;
	$('td:nth-child(' + i + ')').toggleClass('hover');
});

$(document).on('click', '#checkbox', function () {
	if (this.checked) {
		$('.secondary-percentage-label').removeClass('hide-percentage');
	} else {
		$('.secondary-percentage-label').addClass('hide-percentage');
	}
});

$(document).ready(function () {
	$(document).on('mousedown', '.resizer-area', function () {
		$(this).addClass('isResizing');
	});
	$(document).on('mouseup', function () {
		$('.resizer-area').removeClass('isResizing');
	});
});

$(document).on('click', '.section-menu.with-submenu', function (e) {
	$(this).parent().toggleClass('hover-active');
	e.stopPropagation();
});

$(document).ready(function () {
	'use strict';
	var $ripple = $('.js-ripple');
	$ripple.on('click.ui.ripple', function (e) {
		var $this = $(this);
		var $offset = $this.parent().offset();
		var $circle = $this.find('.c-ripple__circle');

		var x = e.pageX - $offset.left;
		var y = e.pageY - $offset.top;

		$circle.css({
			top: y + 'px',
			left: x + 'px',
		});

		$this.addClass('is-active');
	});

	$ripple.on('animationend webkitAnimationEnd oanimationend MSAnimationEnd', function () {
		$(this).removeClass('is-active');
	});
});

export function formatNumberToKMB(value, identifier = '') {
	if (value == 0 && identifier == 'heatmap') {
		return 0;
	}
	if (value >= 1e9) {
		return (value / 1e9).toFixed(2) + 'B';
	} else if (value >= 1e6) {
		return (value / 1e6).toFixed(2) + 'M';
	} else if (value >= 1e3) {
		return (value / 1e3).toFixed(2) + 'K';
	} else {
		return (value / 1).toFixed(2);
	}
}

export function formatNumberToKMBNotFloat(value) {
	if (value >= 1e9) {
		return (value / 1e9).toFixed(2) + 'B';
	} else if (value >= 1e6) {
		return (value / 1e6).toFixed(2) + 'M';
	} else if (value >= 1e3) {
		return (value / 1e3).toFixed(2) + 'K';
	} else {
		return value / 1;
	}
}

//search-bar
$(document).on('click', function (e) {
	if (!$(e.target).closest('.custom-search-filter').length) {
		$('.search-result-box').removeClass('active');
		$('.topbar-search').val('');
	}
});

$(document).on('click', function (e) {
	if ($(e.target).closest('.searched-box').length) {
		$('.search-result-box').removeClass('active');
		$('.topbar-search').val('');
	}
});

$(document).on('click', '.search_menu_wrapper', function (e) {
	e.stopPropagation();
	if (!$(e.target).is('.topbar-search')) {
		$(this).toggleClass('active');
	}
});

$(document).on('click', 'body', function (e) {
	if (!$(e.target).is('.topbar-search')) {
		$('.search_menu_wrapper.active').removeClass('active');
	}
});

$(document).on('click', '.custom_extra_menu_wrapper', function (e) {
	e.stopPropagation();
	if (!$(e.target).is('.custom_extra_menu')) {
		$(this).toggleClass('active');
	}
});

$(document).on('click', 'body', function (e) {
	if (!$(e.target).is('.custom_extra_menu')) {
		$('.custom_extra_menu_wrapper.active').removeClass('active');
	}
});

$(document).on('click', '.user-btn', function (e) {
	e.stopPropagation();
	if (!$(e.target).is('.profile-box')) {
		$(this).toggleClass('profile-open');
	}
});

$(document).on('click', 'body', function (e) {
	if (!$(e.target).is('.profile-box')) {
		$('.user-btn.profile-open').removeClass('profile-open');
	}
});

$(document).on('click', '.group-apply-btn', function (e) {
	$('.user-btn.profile-open').removeClass('profile-open');
});

$(document).on('click', '.search_menu_wrapper', function (e) {
	$('.custom_extra_menu_wrapper.active').removeClass('active');
	$('.user-btn.profile-open').removeClass('profile-open');
	$('.menu-popup-box.hover-active').removeClass('hover-active');
});

$(document).on('click', '.custom_extra_menu_wrapper', function (e) {
	$('.search_menu_wrapper.active').removeClass('active');
	$('.user-btn.profile-open').removeClass('profile-open');
	$('.menu-popup-box.hover-active').removeClass('hover-active');
});
$(document).on('click', '.menu-popup-box,.section-menu.with-submenu', function (e) {
	$('.search_menu_wrapper.active').removeClass('active');
	$('.user-btn.profile-open').removeClass('profile-open');
	$('.custom_extra_menu_wrapper.active').removeClass('active');
});
$(document).on('click', '.user-btn', function (e) {
	$('.search_menu_wrapper.active').removeClass('active');
	$('.custom_extra_menu_wrapper.active').removeClass('active');
	$('.menu-popup-box.hover-active').removeClass('hover-active');
});

$(document).ready(function () {
	function handleWindowResize() {
		if ($(window)?.width() < 570) {
			$('.custom_right_box').addClass('header_show');
		}
	}
	handleWindowResize();
	$(window).on('resize', handleWindowResize);
});

export const getCookieValue = (name) => {
	const cookies = document.cookie.split(';');
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();
		if (cookie.startsWith(name + '=')) {
			return cookie.substring(name.length + 1);
		}
	}
	return null;
};

export function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

export const formatSelectedDateRange = (startDate, endDate) => {
	const currentYear = new Date().getFullYear();

	const parseDate = (dateStr) => {
		const [day, month, year] = dateStr.split('/').map(Number);
		return new Date(year, month - 1, day);
	};

	const start = parseDate(startDate);
	const end = parseDate(endDate);

	const isCurrentYear = start.getFullYear() === currentYear && end.getFullYear() === currentYear;

	const options = {
		day: 'numeric',
		month: 'long',
	};

	if (!isCurrentYear) {
		options.year = 'numeric';
	}

	const formattedStart = start.toLocaleDateString('en-GB', options);
	const formattedEnd = end.toLocaleDateString('en-GB', options);

	if (startDate === endDate) {
		return formattedStart;
	}

	return `${formattedStart} to ${formattedEnd}`;
};

export const formatDateMonthRange = (startDate, endDate) => {
	const start = moment(startDate, 'DD/MM/YYYY');
	const end = moment(endDate, 'DD/MM/YYYY');

	if (start.isSame(end, 'day')) {
		return start.format('DD MMM');
	}

	return `${start.format('DD MMM')} - ${end.format('DD MMM')}`;
};

export const abbreviateNumber = (value) => {
	const suffixes = ['', 'k', 'M', 'B'];
	let newValue = Number(value);
	let suffixNum = 0;
	while (newValue >= 1000 && suffixNum < suffixes.length - 1) {
		newValue /= 1000;
		suffixNum++;
	}
	return `${parseFloat(newValue.toFixed(1))}${suffixes[suffixNum]}`;
};

export const getFormattedMonthRange = (monthRange) => {
	if (monthRange?.length === 2) {
		const startDate = moment(monthRange[0]?.toDate?.() || monthRange[0])
			.startOf('month')
			.format('DD/MM/YYYY');
		const endDate = moment(monthRange[1]?.toDate?.() || monthRange[1])
			.endOf('month')
			.format('DD/MM/YYYY');
		return `${startDate}-${endDate}`;
	}
	return '';
};

// helper: add a placement class to the tippy-box
export const setPlacementClass = (instance) => {
	const box = instance?.popper?.querySelector?.('.tippy-box');
	if (!box) return;

	box.classList.remove('pos-top', 'pos-bottom', 'pos-left', 'pos-right');

	const placement = instance?.popperInstance?.state?.placement || instance?.props?.placement || '';

	if (placement.startsWith('top')) box.classList.add('pos-top');
	else if (placement.startsWith('bottom')) box.classList.add('pos-bottom');
	else if (placement.startsWith('left')) box.classList.add('pos-left');
	else if (placement.startsWith('right')) box.classList.add('pos-right');
};

//dynamic column width
export const calculateColumnWidth = (longestContent, pixelsPerChar = 7, min = 80, extra = 0) => {
	const charLength = (longestContent ?? '').toString().length;
	const finalLength = charLength * pixelsPerChar + 44 + extra;
	const width = Math.max(finalLength, min);
	return Math.round(width);
};
