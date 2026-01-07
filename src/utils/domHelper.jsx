/** @format */
import Profile from '../assets/images/login-icon.webp';

export function splitGroups(groupName) {
	if (!groupName || typeof groupName !== 'string') return [];
	return groupName
		.split(',')
		.map((g) => g.trim())
		.filter(Boolean);
}

export function makeGroupLogo(groupName) {
	const safe = typeof groupName === 'string' ? groupName : '';

	const groups = safe
		.split(',')
		.map((g) => g.trim())
		.filter(Boolean);

	const firstChar = (s) => {
		const m = (s || '').match(/[A-Za-z0-9]/);
		return m ? m[0].toUpperCase() : '';
	};

	const first3Chars = (s) => (s || '').trim().slice(0, 3).toUpperCase();

	let mainText = '';
	let remainingCount = null;

	if (groups.length === 0) {
		mainText = '';
	} else if (groups.length === 1) {
		const words = groups[0].split(/\s+/).filter(Boolean);
		// 1 group + 1 word
		if (words.length === 1) {
			mainText = first3Chars(words[0]);
		} else {
			// 1 group + multi words
			mainText = words
				.slice(0, 3)
				.map((w) => firstChar(w))
				.join('');
		}
	} else {
		// >3 groups
		mainText = <img src={Profile} alt='logo' />;
		remainingCount = groups.length;
	}

	return {
		element: (
			<div className='group-logo-wrap'>
				<h3 className='group-logo-text'>
					{mainText}
					{remainingCount ? <span className='group-count'> {remainingCount}</span> : null}
				</h3>
			</div>
		),
		count: mainText?.length,
	};
}
