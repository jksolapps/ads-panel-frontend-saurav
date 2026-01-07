/** @format */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import AppInfoBoxSearchBox from './AppInfoBoxSearchBox';
import useApi from '../../hooks/useApi';
import { IoSearchOutline } from 'react-icons/io5';
import { useGroupSettings } from '../../context/GroupSettingsContext';

const SearchBar = ({ id, appTab, setIsAppLoaderVisible, setIsSearched }) => {
	const { selectedGroup } = useGroupSettings();
	const [searchText, setSearchText] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [apps, setApps] = useState([]);

	const containerRef = useRef(null);
	const debounceRef = useRef(null);
	const seqRef = useRef(0);
	const mountedRef = useRef(true);

	useEffect(() => {
		return () => {
			mountedRef.current = false;
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, []);

	const hardClose = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		seqRef.current++;
		setIsSearched?.(false);
		setSearchText('');
		setIsSearching(false);
		setApps([]);
		setIsOpen(false);
	};

	useEffect(() => {
		const onDocClick = (e) => {
			if (!containerRef.current?.contains(e.target)) hardClose();
		};
		document.addEventListener('mousedown', onDocClick);
		return () => document.removeEventListener('mousedown', onDocClick);
	}, []);

	const fetchSearch = async (value, seq) => {
		const form = new FormData();
		form.append('user_id', localStorage.getItem('id') || '');
		form.append('user_token', localStorage.getItem('token') || '');
		form.append('search', value);
		if (selectedGroup?.length > 0) {
			form.append('gg_id', selectedGroup);
		}

		const res = await useApi('search-from-header', form);
		if (!mountedRef.current || seq !== seqRef.current) return;
		setIsSearching(false);
		const ok = res?.data?.status_code === 1;
		setApps(ok ? res?.data?.apps || [] : []);
	};

	const onChange = (e) => {
		const value = e.target.value;
		setSearchText(value);
		setIsSearched?.(!!value.trim());

		if (debounceRef.current) clearTimeout(debounceRef.current);

		if (!value.trim()) {
			setIsOpen(false);
			setIsSearching(false);
			setApps([]);
			return;
		}

		setIsOpen(true);
		setIsSearching(true);
		const seq = ++seqRef.current;
		debounceRef.current = setTimeout(() => fetchSearch(value, seq), 350);
	};

	const visibleApps = useMemo(() => apps.slice(0, 50), [apps]);

	return (
		<div ref={containerRef} className='custom-search-filter topBar-search search_menu_box'>
			<form autoComplete='off' onSubmit={(e) => e.preventDefault()}>
				<IoSearchOutline className='top_search_icon' />
				<input
					id='search-bar'
					className='topbar-search'
					type='text'
					value={searchText}
					onChange={onChange}
					placeholder='Search app name here... '
					autoComplete='off'
					spellCheck={false}
				/>
			</form>

			<div
				className='search-result-box'
				style={{ display: isOpen && searchText.trim() ? 'block' : 'none' }}
				role='listbox'
			>
				{isSearching ? (
					<div className='searched-box searched-app small-box'>Searching...</div>
				) : apps.length === 0 ? (
					<div className='searched-box searched-app small-box'>No Result Found</div>
				) : (
					<>
						<div className={`searched-box searched-app ${visibleApps.length > 6 ? 'search-header' : ''}`}>
							{visibleApps.map((app, index) => (
								<AppInfoBoxSearchBox
									key={`${app?.app_auto_id || 'app'}-${index}`}
									app_auto_id={app?.app_auto_id}
									app_icon={app?.app_icon}
									app_platform={app?.app_platform}
									app_display_name={app?.app_display_name}
									app_console_name={app?.app_console_name}
									app_store_id={app?.app_store_id}
									setIsAppLoaderVisible={setIsAppLoaderVisible}
									appTab={appTab}
									paramsId={id}
									appId={app?.app_auto_id}
									onSelect={hardClose}
								/>
							))}
						</div>
						{apps.length > 50 && (
							<div className='searched-box searched-app small-box'>Showing 50 of {apps.length}</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default SearchBar;
