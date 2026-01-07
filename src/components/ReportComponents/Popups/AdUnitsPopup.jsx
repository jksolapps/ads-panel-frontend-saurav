/** @format */

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MdClose, MdSearch, MdExpandMore } from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';

import { ReportContext } from '../../../context/ReportContext';
import EmptyListBox from '../../GeneralComponents/EmptyListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const AdUnitsPopup = ({
	filterPopupData,
	setPageNumber,
	setIsReportLoaderVisible = () => {},
	setCurrentUnitPage,
	setDisabled,
	filterData,
}) => {
	const { unitValue, setUnitValue, popupFlags, setPopupFlags, setReportSelectedFilter } =
		useContext(ReportContext);

	const [allUnitData, setAllUnitData] = useState([]);
	const [searchText, setSearchText] = useState('');

	const reportlocation = useLocation();
	const navigate = useNavigate();

	const safeArray = (v) => (Array.isArray(v) ? v : []);

	const isPlaceholderUnit = (u) =>
		u &&
		(u.unit_auto_id == null || String(u.unit_auto_id).trim() === '') &&
		(!u.unit_display_name || String(u.unit_display_name).trim() === '') &&
		(u.ad_unit_id == null || String(u.ad_unit_id).trim() === '');

	const isRealUnitRow = (u) =>
		Boolean(
			u &&
				!isPlaceholderUnit(u) &&
				u.unit_auto_id != null &&
				String(u.unit_auto_id).trim() !== '' &&
				u.unit_display_name != null &&
				String(u.unit_display_name).trim() !== ''
		);

	const sanitizeSelectedList = (list) => safeArray(list).filter((x) => x && !isPlaceholderUnit(x));

	const readSessionSelected = () => {
		try {
			const raw = sessionStorage.getItem('unit_filter');
			const parsed = raw ? JSON.parse(raw) : [];
			return sanitizeSelectedList(parsed);
		} catch {
			return [];
		}
	};

	// supports both:
	const makeSelectedSet = (preselected) => {
		const list = sanitizeSelectedList(preselected);
		return new Set(
			list.map((x) => {
				const name = x?.name ?? x?.unit_display_name ?? '';
				const adUnit = x?.adUnit ?? x?.ad_unit_id ?? '';
				return `${String(name)}__${String(adUnit)}`;
			})
		);
	};

	useEffect(() => {
		if (!filterPopupData) return;

		const fromProps = sanitizeSelectedList(filterData);
		const fromSession = readSessionSelected();
		const fromContext = sanitizeSelectedList(unitValue);

		const preselected =
			fromProps.length > 0 ? fromProps : fromSession.length > 0 ? fromSession : fromContext;

		const selectedSet = makeSelectedSet(preselected);

		const next = safeArray(filterPopupData).map((app) => ({
			...app,
			ad_units: safeArray(app?.ad_units)
				.filter(isRealUnitRow)
				.map((u) => {
					const key = `${String(u?.unit_display_name ?? '')}__${String(u?.ad_unit_id ?? '')}`;
					return { ...u, unit_checked: selectedSet.has(key) };
				}),
		}));

		setAllUnitData(next);
	}, [filterPopupData]);

	const filteredData = useMemo(() => {
		const q = (searchText || '').trim().toLowerCase();
		if (!q) return allUnitData;

		return safeArray(allUnitData).map((app) => ({
			...app,
			ad_units: safeArray(app?.ad_units).filter((u) => {
				const unitName = String(u?.unit_display_name || '').toLowerCase();
				const appName = String(u?.app_name || '').toLowerCase();
				return unitName.includes(q) || appName.includes(q);
			}),
		}));
	}, [allUnitData, searchText]);

	// ----------------------------
	// SELECTED UNITS (derived from allUnitData)
	// ----------------------------
	const checkedUnit = useMemo(() => {
		return safeArray(allUnitData).flatMap((app) =>
			safeArray(app?.ad_units).filter((u) => isRealUnitRow(u) && u.unit_checked)
		);
	}, [allUnitData]);

	const groupedCheckedUnit = useMemo(() => {
		return checkedUnit.reduce((acc, curr) => {
			const idx = acc.findIndex((x) => x.app_name === curr.app_name);
			if (idx !== -1) acc[idx].units.push(curr);
			else acc.push({ app_name: curr.app_name, app_platform: curr.app_platform, units: [curr] });
			return acc;
		}, []);
	}, [checkedUnit]);

	// ----------------------------
	// TOGGLES (simple)
	// ----------------------------
	const toggleUnitChecked = useCallback((app_auto_id, unit_auto_id) => {
		setAllUnitData((prev) =>
			safeArray(prev).map((app) => {
				if (app?.app_auto_id !== app_auto_id) return app;
				return {
					...app,
					ad_units: safeArray(app?.ad_units).map((u) =>
						u?.unit_auto_id === unit_auto_id ? { ...u, unit_checked: !u.unit_checked } : u
					),
				};
			})
		);
	}, []);

	const isAppChecked = useCallback(
		(app) => safeArray(app?.ad_units).some((u) => u?.unit_checked),
		[]
	);

	const toggleAppAllUnits = useCallback(
		(app_auto_id) => {
			setAllUnitData((prev) =>
				safeArray(prev).map((app) => {
					if (app?.app_auto_id !== app_auto_id) return app;
					const nextChecked = !isAppChecked(app);
					return {
						...app,
						ad_units: safeArray(app?.ad_units).map((u) => ({ ...u, unit_checked: nextChecked })),
					};
				})
			);
		},
		[isAppChecked]
	);

	const areAllCheckedInFilteredView = useMemo(() => {
		const list = safeArray(filteredData);
		let anyUnit = false;

		for (const app of list) {
			const units = safeArray(app?.ad_units);
			if (units.length > 0) anyUnit = true;
			if (units.some((u) => !u?.unit_checked)) return false;
		}
		return anyUnit;
	}, [filteredData]);

	const handleSelectAllInAllApps = useCallback(
		(e) => {
			const checked = e.target.checked;

			// apply only to currently visible units in filtered list (same UX you had)
			const visibleByApp = new Map(
				safeArray(filteredData).map((app) => [
					app?.app_auto_id,
					new Set(safeArray(app?.ad_units).map((u) => u?.unit_auto_id)),
				])
			);

			setAllUnitData((prev) =>
				safeArray(prev).map((app) => {
					const visibleSet = visibleByApp.get(app?.app_auto_id);
					if (!visibleSet) return app;

					return {
						...app,
						ad_units: safeArray(app?.ad_units).map((u) =>
							visibleSet.has(u?.unit_auto_id) ? { ...u, unit_checked: checked } : u
						),
					};
				})
			);
		},
		[filteredData]
	);

	// ----------------------------
	// UI handlers
	// ----------------------------
	const handleSearch = (e) => setSearchText(e.target.value || '');

	const handleClear = () => {
		setSearchText('');
		navigate(reportlocation.pathname, { replace: true, state: null });

		// clear checks locally
		setAllUnitData((prev) =>
			safeArray(prev).map((app) => ({
				...app,
				ad_units: safeArray(app?.ad_units).map((u) => ({ ...u, unit_checked: false })),
			}))
		);
	};

	const handleClose = (unit) => {
		toggleUnitChecked(unit?.app_auto_id, unit?.unit_auto_id);
	};

	const handleApply = (e, close) => {
		e.preventDefault();

		const finalSelected = checkedUnit;
		setReportSelectedFilter('AdUnitsPopup');
		setSearchText('');
		setIsReportLoaderVisible(true);
		setPageNumber(1);
		setUnitValue(finalSelected.length > 0 ? finalSelected : []);
		setPopupFlags(!popupFlags);
		setCurrentUnitPage(1);
		sessionStorage.setItem('unit_filter', JSON.stringify(finalSelected));
		close();
	};

	const unitePresent = unitValue?.[0]?.unit_checked;

	return (
		<Popover className='check-wrapper app-select-popup adunit-filter-popup'>
			<PopoverTrigger>
				<a
					className={unitePresent ? 'popover_filter filter-btn btn-active' : 'popover_filter filter-btn'}
				>
					<span>Ad Unit</span>
					{unitePresent && (
						<ul className='selected-item'>
							<li className='selected-item-value'>:</li>

							{sanitizeSelectedList(unitValue)
								.map((item) => item?.unit_display_name)
								.slice(0, 2)
								.map((item, index) => (
									<li className='selected-item-value' key={index}>
										{String(item || '').slice(0, 8)}
									</li>
								))}

							{unitValue?.length > 2 && <span>+{unitValue?.length - 2} more </span>}
						</ul>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className='checkbox_popover full-and-multi-filter ad-unit-filter' id='Lorems'>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Ad Unit</span>
							<a className='close-filter' onClick={close}>
								<MdClose className='material-icons' />
							</a>
						</div>

						<div className='check-boxes-inner'>
							<div className='left-check-box box2'>
								<div className='search-input'>
									<div className='box'>
										<input
											className='input search-btn-input focus-border'
											id='searchInput11'
											onChange={handleSearch}
											value={searchText}
											required
											placeholder='Search'
											autoComplete='off'
										/>
										<a className='clear-icon-btn i-btn' onClick={() => setSearchText('')}>
											<IoCloseOutline className='material-icons' />
										</a>
										<a className='search-icon-btn i-btn'>
											<MdSearch className='material-icons' />
										</a>
										<div className='border-active'></div>
									</div>
								</div>

								<div className='all-select-row'>
									<form onSubmit={(e) => handleApply(e, close)}>
										{safeArray(filteredData)?.length === 0 ? (
											<div className='noResult'>
												<p>No Result Found</p>
											</div>
										) : (
											<>
												<div className='box-check'>
													<label>
														<input
															type='checkbox'
															className='ckkBox val'
															checked={areAllCheckedInFilteredView}
															onChange={handleSelectAllInAllApps}
														/>
														<span className='search-title group-search'>Select All</span>
													</label>
												</div>

												{safeArray(filteredData)?.map((app, appIndex) => {
													if (!safeArray(app?.ad_units)?.length) return null;

													return (
														<div
															className={
																searchText?.length > 0
																	? 'box-check select-dropdown active'
																	: 'box-check select-dropdown'
															}
															key={appIndex}
														>
															<div
																className='group-input-flex ad-unit-input-field'
																style={{ padding: '6px 12px', alignItems: 'center' }}
															>
																<div className='group-filter-input'>
																	<input
																		type='checkbox'
																		style={{ marginTop: '2px' }}
																		className='ckkBox val'
																		checked={isAppChecked(app)}
																		onChange={() => toggleAppAllUnits(app?.app_auto_id)}
																	/>
																</div>

																<label>
																	<div>
																		<span className='search-title'>{app?.app_display_name}</span>
																		<div className='secondary-label'>
																			Free |{' '}
																			{(app?.app_platform == 1 && 'IOS') || (app?.app_platform == 2 && 'Android')}
																		</div>
																	</div>
																</label>

																<a className='arrow-btn' style={{ margin: '-10px -6px 0px' }}>
																	<MdExpandMore className='material-icons' />
																</a>
															</div>

															<div className='select-dropdown-box'>
																{safeArray(app?.ad_units).map((item, unitIndex) => (
																	<div className='box-check' key={unitIndex}>
																		<label style={{ padding: '0px 50px' }}>
																			<input
																				type='checkbox'
																				name={item?.unit_auto_id}
																				value={item?.unit_display_name}
																				className='ckkBox val'
																				checked={!!item?.unit_checked}
																				onChange={() => toggleUnitChecked(app?.app_auto_id, item?.unit_auto_id)}
																			/>
																			<span className='search-title'>{item?.unit_display_name}</span>
																		</label>
																	</div>
																))}
															</div>
														</div>
													);
												})}
											</>
										)}

										<div className='apply-btn-wrap text-right'>
											<button type='submit' className='apply-btn' onClick={() => setDisabled(true)}>
												Apply
											</button>
										</div>
									</form>
								</div>
							</div>

							<div className='right-result-box box2'>
								<div className='none-selected-text'>
									<span></span>
									<a className='custom-clear-all' onClick={handleClear}>
										Clear all
									</a>
								</div>

								<div className='right-result-row'>
									{safeArray(groupedCheckedUnit)?.length === 0 && <EmptyListBox />}

									{safeArray(groupedCheckedUnit)?.length > 0 &&
										groupedCheckedUnit?.map((app, appIndex) => (
											<div
												className={
													searchText?.length > 0 || groupedCheckedUnit?.length > 0
														? 'box-check select-dropdown active'
														: 'box-check select-dropdown'
												}
												key={appIndex}
											>
												<label className='filter-adunitbox-label' style={{ marginBottom: '5px' }}>
													<span>
														<span className='search-title filter-adunitbox-span'>{app?.app_name}</span>
														<div className='secondary-label'>
															Free | {(app?.app_platform == 1 && 'IOS') || (app?.app_platform == 2 && 'Android')}
														</div>
													</span>
												</label>

												<a className='arrow-btn'>
													<MdExpandMore className='material-icons' />
												</a>

												<ul className='select-dropdown-box'>
													{safeArray(app?.units)?.map((item, unitIndex) => (
														<div
															className=' adunit-filter-children'
															key={unitIndex}
															onClick={() => handleClose(item)}
														>
															<li
																className='search-title'
																style={{
																	marginLeft: '24px',
																	fontSize: '12px',
																	display: 'flex',
																	alignItems: 'center',
																}}
															>
																<IoCloseOutline
																	className='material-icons'
																	style={{
																		fontSize: '18px',
																		cursor: 'pointer',
																		marginRight: '6px',
																		width: '24px',
																	}}
																/>
																<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
																	{item?.unit_display_name}
																</div>
															</li>
														</div>
													))}
												</ul>
											</div>
										))}
								</div>
							</div>
						</div>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default AdUnitsPopup;
