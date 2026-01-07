/** @format */

import { useMemo, useState } from 'react';
import AccountPageAppBox from '../GeneralComponents/AccountPageAppBox';
import EmptyListBox from '../GeneralComponents/EmptyListBox';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoCloseOutline } from 'react-icons/io5';
import { MdSearch } from 'react-icons/md';

const normalize = (s) =>
	String(s || '')
		.toLowerCase()
		.trim();

const GroupAppsSelectorV2 = ({ apps = [], selectedApps = [], onChangeSelected }) => {
	const [search, setSearch] = useState('');

	const selectedIds = useMemo(() => new Set((selectedApps || []).map((a) => a?.id)), [selectedApps]);

	const filteredApps = useMemo(() => {
		const q = normalize(search);
		return (apps || []).filter((a) => {
			if (!q) return true;
			const hay = normalize(
				`${a.app_display_name} ${a.app_console_name} ${a.app_store_id} ${a.app_platform}`
			);
			return hay.includes(q);
		});
	}, [apps, search]);

	const isAllChecked = useMemo(() => {
		if (filteredApps.length === 0) return false;
		return filteredApps.every((a) => selectedIds.has(a.id));
	}, [filteredApps, selectedIds]);

	const isSomeChecked = useMemo(() => {
		return filteredApps.some((a) => selectedIds.has(a.id)) && !isAllChecked;
	}, [filteredApps, selectedIds, isAllChecked]);

	const toggleOne = (app) => {
		const cur = selectedApps || [];
		const exists = cur.some((x) => x.id === app.id);
		const next = exists ? cur.filter((x) => x.id !== app.id) : [...cur, app];
		onChangeSelected(next);
	};

	const clearAll = () => onChangeSelected([]);

	const selectAllFiltered = () => {
		const cur = selectedApps || [];
		const map = new Map(cur.map((a) => [a.id, a]));
		for (const a of filteredApps) map.set(a.id, a);
		onChangeSelected(Array.from(map.values()));
	};

	const unselectAllFiltered = () => {
		const filteredSet = new Set(filteredApps.map((a) => a.id));
		onChangeSelected((selectedApps || []).filter((a) => !filteredSet.has(a.id)));
	};

	const handleToggleSelectAll = () => {
		if (isAllChecked) unselectAllFiltered();
		else selectAllFiltered();
	};

	return (
		<div className='ggSelector ggSelector--v2'>
			<h6>Select App</h6>
			<div className='ggV2'>
				{/* Left */}
				<div className='ggV2__col ggV2__left'>
					<div className='ggV2__search'>
						<input
							type='text'
							className='ggV2__searchInput'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder='Search'
						/>
						{search ? (
							<a
								className='clear-icon-btn i-btn'
								onClick={() => {
									setSearch('');
								}}
							>
								<IoCloseOutline className='material-icons' />
							</a>
						) : (
							<a className='search-icon-btn i-btn'>
								<MdSearch className='material-icons' />
							</a>
						)}
					</div>

					<div className='ggV2__list'>
						{filteredApps?.length === 0 ? (
							<div className='noResult'>
								<p>No Result Found</p>
							</div>
						) : (
							<>
								<label className='ggV2__selectAll'>
									<input
										type='checkbox'
										checked={isAllChecked}
										ref={(el) => {
											if (el) el.indeterminate = isSomeChecked;
										}}
										onChange={handleToggleSelectAll}
									/>
									<span>Select All</span>
								</label>
								{filteredApps.map((app) => {
									const checked = selectedIds.has(app.id);
									return (
										<div
											key={app.id}
											className={`ggV2__row ${checked ? 'is-active' : ''}`}
											onClick={() => toggleOne(app)}
											role='button'
											tabIndex={0}
										>
											<input
												type='checkbox'
												className='ggV2__rowCheck'
												checked={checked}
												onChange={() => toggleOne(app)}
												onClick={(e) => e.stopPropagation()}
											/>
											<div className='ggV2__rowContent'>
												<AccountPageAppBox
													app_auto_id={app.app_auto_id}
													app_icon={app.app_icon}
													app_platform={app.app_platform}
													app_display_name={app.app_display_name}
													app_store_id={app.app_store_id}
													app_console_name={app.app_console_name}
													className='add-permission'
												/>
											</div>
										</div>
									);
								})}
							</>
						)}
					</div>
				</div>

				{/* Right */}
				<div className='ggV2__col ggV2__right'>
					<div className='ggV2__rightHead'>
						<button
							type='button'
							className='ggV2__clearAll'
							onClick={clearAll}
							disabled={(selectedApps || []).length === 0}
						>
							CLEAR ALL
						</button>
					</div>

					<div className='ggV2__list ggV2__selectedList'>
						{(selectedApps || []).map((app) => (
							<div key={app.id} className='ggV2__selectedRow' onClick={() => toggleOne(app)}>
								<div className='ggV2__rowContent'>
									<AccountPageAppBox
										app_auto_id={app.app_auto_id}
										app_icon={app.app_icon}
										app_platform={app.app_platform}
										app_display_name={app.app_display_name}
										app_store_id={app.app_store_id}
										app_console_name={app.app_console_name}
										className='add-permission'
									/>
								</div>
								<a className='result-cancel-btn gg_close'>
									<IoIosCloseCircleOutline className='material-icons' size={20} />
								</a>
							</div>
						))}

						{(selectedApps || []).length === 0 ? <EmptyListBox /> : null}
					</div>
				</div>
			</div>
		</div>
	);
};

export default GroupAppsSelectorV2;
