/** @format */

import { useQueryClient } from '@tanstack/react-query';
import { useGroupSettings } from '../../context/GroupSettingsContext';
import { useQueryMutation } from '../../hooks/useQueryMutation';
import { useEffect, useMemo, useState } from 'react';
import Tippy from '@tippyjs/react';
import { TbSettingsCog } from 'react-icons/tb';
import { GrAppsRounded } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import { IoChevronForward } from 'react-icons/io5';

const GroupSelectBox = ({ setGroupMenuOpen, closeProfileMenu }) => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { groupList, setSelectedGroup, setGroupName } = useGroupSettings();
	const [visibleThree, setVisibleThree] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [groupOptions, setGroupOptions] = useState([]);
	const [allAppsOnlyChecked, setAllAppsOnlyChecked] = useState(true);

	const showThree = (e) => {
		e.stopPropagation();
		setVisibleThree(true);
		setGroupMenuOpen(true);
	};

	const hideThree = () => {
		setVisibleThree(false);
		setGroupMenuOpen(false);
	};

	const { mutate: updateGroup } = useQueryMutation(['group-update'], 'toggle-global-group-status', {
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['group_select'] });
			const raw = variables.get('gg_id');
			const gg_ids = !raw || raw === 'null' ? [] : raw.split(',').map((id) => id.trim());

			if (gg_ids.length === 0) {
				localStorage.removeItem('main_app_group');
				setSelectedGroup(null);
				setSelectedGroup(null);
				hideThree();
				return;
			}

			const selectedGroupPayload = groupOptions
				.filter((g) => gg_ids.includes(String(g.gg_id)))
				.map((g) => ({
					gg_id: String(g.gg_id),
					gg_name: g.gg_name,
				}));
			localStorage.setItem('main_app_group', JSON.stringify(selectedGroupPayload));
			const mainGroupName = selectedGroupPayload?.map((item) => item.gg_name)?.join(',') || null;

			setSelectedGroup(gg_ids.join(','));
			setGroupName(mainGroupName);
			hideThree();
		},
	});

	const userId = localStorage.getItem('id') || '';
	const token = localStorage.getItem('token') || '';

	useEffect(() => {
		const mainGroupLocal = JSON.parse(localStorage.getItem('main_app_group')) || null;
		const mainGroup = mainGroupLocal?.map((item) => item.gg_id)?.join(',');

		if (!groupList || groupList.length === 0) {
			setGroupOptions([]);
			setAllAppsOnlyChecked(true);
			return;
		}

		const selectedIds = (mainGroup || '')
			.split(',')
			.map((id) => id.trim())
			.filter(Boolean);

		const mapped = groupList.map((g) => ({
			...g,
			item_checked: selectedIds.includes(String(g.gg_id)),
		}));

		setGroupOptions(mapped);
	}, [groupList]);

	const filteredOptions = useMemo(() => {
		const lower = searchText.toLowerCase();
		if (!lower) return groupOptions;
		return groupOptions.filter((item) => item.gg_name?.toLowerCase().includes(lower));
	}, [groupOptions, searchText]);

	const isAllAppsSelected = useMemo(
		() =>
			groupOptions.length === 0 ? allAppsOnlyChecked : groupOptions.every((g) => !g.item_checked),
		[groupOptions, allAppsOnlyChecked]
	);

	const handleSelectAllLocal = () => {
		if (groupOptions.length === 0) {
			setAllAppsOnlyChecked((prev) => !prev);
			return;
		}
		const updated = groupOptions.map((g) => ({
			...g,
			item_checked: false,
		}));
		setGroupOptions(updated);
	};

	const handleCheckboxChange = (gg_id) => {
		const updated = groupOptions.map((g) =>
			g.gg_id === gg_id ? { ...g, item_checked: !g.item_checked } : g
		);
		setGroupOptions(updated);
	};

	const handleRowClick = (item) => {
		handleCheckboxChange(item.gg_id);
	};

	const handleSelectAll = () => {
		localStorage.removeItem('main_app_group');
		setSelectedGroup(null);
		setGroupName(null);
		hideThree();
		closeProfileMenu();
		const formData = new FormData();
		formData.append('user_id', userId);
		formData.append('user_token', token);
		formData.append('gg_id', null);

		updateGroup(formData);
	};

	const handleApply = () => {
		setGroupMenuOpen(false);
		const selectedGroups = groupOptions.filter((g) => g.item_checked);
		if (selectedGroups.length === 0) {
			handleSelectAll();
			return;
		}
		const gg_ids = selectedGroups.map((g) => g.gg_id).join(',');
		const formData = new FormData();
		formData.append('user_id', userId);
		formData.append('user_token', token);
		formData.append('gg_id', gg_ids);

		hideThree();
		closeProfileMenu();
		updateGroup(formData);
	};

	const hasGroups = groupOptions.length > 0;
	const hasSearch = searchText.trim().length > 0;
	const noFilteredResults = filteredOptions.length === 0;

	const isMobile = typeof window !== 'undefined' && window.innerWidth <= 569;
	const tippyOffset = isMobile ? [-5, 5] : [0, 10];
	const tippyPlacement = isMobile ? 'bottom-start' : 'right';

	return (
		<>
			<div className='popup-footer'>
				<div onClick={() => navigate('/group-settings')} className='sign-btn'>
					<GrAppsRounded className='sidebar_icon user-icon' />
					Group Settings
				</div>
			</div>

			<div className='popup-footer'>
				<Tippy
					content={
						<div className='tippy_content_submenu group_select_menu' onClick={(e) => e.stopPropagation()}>
							<div className='group_select_search'>
								<div className='box'>
									<input
										className='input search-btn-input focus-border'
										onChange={(e) => setSearchText(e.target.value)}
										value={searchText}
										placeholder='Search group'
										autoComplete='off'
									/>
									<div className='border-active'></div>
								</div>
							</div>

							<div className='group_select_list_wrap'>
								<div className='group_select_list all_group' onClick={handleSelectAllLocal}>
									<>
										<input
											type='checkbox'
											checked={isAllAppsSelected}
											onChange={(e) => {
												e.stopPropagation();
											}}
										/>
										<span>All Apps</span>
									</>
								</div>

								{hasGroups && hasSearch && noFilteredResults ? (
									<div className='noResult'>
										<p className='mb-0'>No Result Found</p>
									</div>
								) : (
									filteredOptions.map((item, idx) => (
										<div
											className='group_select_list'
											key={item.gg_id || idx}
											onClick={() => handleRowClick(item)}
										>
											<input
												type='checkbox'
												checked={!!item.item_checked}
												onChange={(e) => {
													e.stopPropagation();
													handleCheckboxChange(item.gg_id);
												}}
											/>
											<span>{item.gg_name}</span>
										</div>
									))
								)}
							</div>

							{/* Apply button */}
							<div className='group_select_footer apply-btn-wrap text-right'>
								<button type='button' className='group-apply-btn apply-btn' onClick={handleApply}>
									Apply
								</button>
							</div>
						</div>
					}
					placement={tippyPlacement}
					offset={tippyOffset}
					interactive={true}
					visible={visibleThree}
					onClickOutside={hideThree}
					appendTo={() => document.body}
					className='side_bar_tippy'
				>
					<div onClick={visibleThree ? hideThree : showThree} className='sign-btn group_select_item_box'>
						<div className='left'>
							<TbSettingsCog className='sidebar_icon user-icon' />
							Select Group
						</div>
						<IoChevronForward />
					</div>
				</Tippy>
			</div>
		</>
	);
};

export default GroupSelectBox;
