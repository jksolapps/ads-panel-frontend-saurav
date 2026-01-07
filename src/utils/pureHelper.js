/** @format */

export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const toDateYMD = (value) => {
	if (!value) return null;
	const s = String(value).trim();
	if (!s) return null;
	const datePart = s.includes(' ') ? s.split(' ')[0] : s;
	const parts = datePart.split('-');
	if (parts.length !== 3) return null;
	const [y, m, d] = parts.map((p) => parseInt(p, 10));
	if (!y || !m || !d) return null;
	return new Date(y, m - 1, d);
};
export const toDateDMY = (value) => {
	if (!value) return null;
	const s = String(value).trim();
	if (!s) return null;
	const parts = s.split('/');
	if (parts.length !== 3) return null;
	const [d, m, y] = parts.map((p) => parseInt(p, 10));
	if (!y || !m || !d) return null;
	return new Date(y, m - 1, d);
};
export const startOfDay = (d) => {
	if (!(d instanceof Date)) return null;
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
export const formatYMD = (d) => {
	if (!d) return null;
	const dd = String(d.getDate()).padStart(2, '0');
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const yy = d.getFullYear();
	return `${yy}-${mm}-${dd}`;
};
export const diffDaysDates = (start, end) => {
	if (!start || !end) return 0;
	const a = startOfDay(start);
	const b = startOfDay(end);
	if (!a || !b) return 0;
	return Math.floor((b.getTime() - a.getTime()) / MS_PER_DAY);
};
export const diffDaysYMD = (startStr, endStr) => {
	const s = toDateYMD(startStr);
	const e = toDateYMD(endStr);
	return diffDaysDates(s, e);
};
export const todayYMD = () => formatYMD(new Date());

export function safeJsonParse(str) {
	try {
		return str ? JSON.parse(str) : null;
	} catch {
		return null;
	}
}
export const dynamicColumnWidthCal = ({
	value,
	charWidth = 9,
	minWidth = 80,
	maxWidth = 500,
	padding = 50,
}) => {
	if (value == null) return minWidth;

	const str = String(value);
	const width = str.length * charWidth + padding;
	return Math.min(Math.max(width, minWidth), maxWidth);
};

export const toNum = (v) => {
	if (v === null || v === undefined) return 0;
	if (typeof v === 'number') return Number.isFinite(v) ? v : 0;

	let s = String(v).trim();
	if (!s) return 0;

	let neg = false;
	if (s.startsWith('(') && s.endsWith(')')) {
		neg = true;
		s = s.slice(1, -1);
	}

	s = s.replace(/[$,%\s]/g, '').replace(/,/g, '');
	const n = parseFloat(s);
	if (!Number.isFinite(n)) return 0;
	return neg ? -n : n;
};
