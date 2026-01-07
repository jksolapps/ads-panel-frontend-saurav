/** @format */

import { useMemo, useState } from 'react';
import AccountPageAppBox from '../GeneralComponents/AccountPageAppBox';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoChevronForward } from 'react-icons/io5';
import EmptyListBox from '../GeneralComponents/EmptyListBox';

const normalize = (s) =>
	String(s || '')
		.toLowerCase()
		.trim();

const GroupAppsSelectorV1 = ({ apps = [], selectedApps = [], onChangeSelected }) => {
	const [search, setSearch] = useState('');

	const selectedIds = useMemo(() => new Set((selectedApps || []).map((a) => a?.id)), [selectedApps]);

	const filteredAvailableApps = useMemo(() => {
		const q = normalize(search);
		return (apps || [])
			.filter((a) => !selectedIds.has(a.id))
			.filter((a) => {
				if (!q) return true;
				const hay = normalize(
					`${a.app_display_name} ${a.app_console_name} ${a.app_store_id} ${a.app_platform}`
				);
				return hay.includes(q);
			});
	}, [apps, search, selectedIds]);

	const toggleOne = (app) => {
		const cur = selectedApps || [];
		const exists = cur.some((x) => x.id === app.id);
		const next = exists ? cur.filter((x) => x.id !== app.id) : [...cur, app];
		onChangeSelected(next);
	};

	const removeOne = (appId) => {
		onChangeSelected((selectedApps || []).filter((x) => x.id !== appId));
	};

	const selectAllFiltered = () => {
		const cur = selectedApps || [];
		const map = new Map(cur.map((a) => [a.id, a]));
		for (const a of filteredAvailableApps) map.set(a.id, a);
		onChangeSelected(Array.from(map.values()));
	};

	const clearAll = () => onChangeSelected([]);

	return (
		<div className='gg_select_wrap'>
			<h6>Select App</h6>
			<div className='ggSelector ggSelector--v1'>
				<div className='ggSelector__toolbar'>
					<div className='ggSelector__searchWrap'>
						<input
							type='text'
							className='ggSelector__search'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder='Search...'
						/>
					</div>

					<div className='ggSelector__actions'>
						<button
							type='button'
							className='ggBtn ggBtn--ghost'
							onClick={selectAllFiltered}
							disabled={filteredAvailableApps.length === 0}
						>
							Select all
						</button>
						<button
							type='button'
							className='ggBtn ggBtn--ghost'
							onClick={clearAll}
							disabled={(selectedApps || []).length === 0}
						>
							Clear
						</button>
					</div>
				</div>
				<div className='ggSelector__grid'>
					<div className='ggPanel'>
						<div className='ggPanel__head'>
							<h6>Available Apps</h6>
							<span className='ggPanel__count'>({filteredAvailableApps.length})</span>
						</div>

						<div className='ggPanel__body'>
							{filteredAvailableApps.length === 0 ? (
								<div className='ggEmpty'>No apps found.</div>
							) : (
								filteredAvailableApps.map((app) => (
									<div
										key={app.id}
										className='ggRow ggRow--clickable'
										onClick={() => toggleOne(app)}
										role='button'
										tabIndex={0}
									>
										<div className='ggRow__content'>
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
								))
							)}
						</div>
					</div>
					<div className='ggSelector_arrow'>
						<IoChevronForward color='#0d6efd' />
					</div>
					<div className='ggPanel ggPanel--selected'>
						<div className='ggPanel__head'>
							<h6>Selected Apps</h6>
							<span className='ggPanel__count'>({(selectedApps || []).length})</span>
						</div>

						<div className='ggPanel__body'>
							{(selectedApps || []).length === 0 ? (
								<EmptyListBox />
							) : (
								(selectedApps || []).map((app) => (
									<div key={app.id} className='ggRow' onClick={() => removeOne(app.id)}>
										<div className='ggRow__content'>
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
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GroupAppsSelectorV1;
