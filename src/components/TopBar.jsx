/** @format */

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import MainLogo from '../assets/images/login-icon.webp';
import { MdMenu } from 'react-icons/md';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DataContext } from '../context/DataContext';
import useUserApi from '../hooks/useUserApi';
import useApi from '../hooks/useApi';
import Swal from 'sweetalert2';
import AppInfoBoxSearchBox from './GeneralComponents/AppInfoBoxSearchBox';
import { IoSearch } from 'react-icons/io5';
import SidebarProfile from './GeneralComponents/SidebarProfile';

const TopBar = () => {
	const navigate = useNavigate();
	const { id } = useParams();

	const { appTab, setIsSearched, setGuideStart, setIsGuideVisible, setIsAppLoaderVisible } =
		useContext(DataContext);

	const getLogoutIconHtml = useCallback(() => {
		return `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M255.15 468.625H63.787c-11.737 0-21.262-9.526-21.262-21.262V64.638c0-11.737 9.526-21.262 21.262-21.262H255.15c11.758 0 21.262-9.504 21.262-21.262S266.908.85 255.15.85H63.787C28.619.85 0 29.47 0 64.638v382.724c0 35.168 28.619 63.787 63.787 63.787H255.15c11.758 0 21.262-9.504 21.262-21.262 0-11.758-9.504-21.262-21.262-21.262z" fill="#9a9a9a" opacity="1" data-original="#9a9a9a"></path><path d="M505.664 240.861 376.388 113.286c-8.335-8.25-21.815-8.143-30.065.213s-8.165 21.815.213 30.065l92.385 91.173H191.362c-11.758 0-21.262 9.504-21.262 21.262 0 11.758 9.504 21.263 21.262 21.263h247.559l-92.385 91.173c-8.377 8.25-8.441 21.709-.213 30.065a21.255 21.255 0 0 0 15.139 6.336c5.401 0 10.801-2.041 14.926-6.124l129.276-127.575A21.303 21.303 0 0 0 512 255.998c0-5.696-2.275-11.118-6.336-15.137z" fill="#9a9a9a" opacity="1" data-original="#9a9a9a"></path></g></svg>`;
	}, []);

	const handleSignOut = useCallback(async () => {
		try {
			const logoutData = new FormData();
			logoutData.append('user_id', localStorage.getItem('id'));
			logoutData.append('user_token', localStorage.getItem('token'));
			const response = await useUserApi('web-logout', logoutData);
			return response.status_code;
		} catch (error) {
			return 0;
		}
	}, []);

	const handleAlert = useCallback(() => {
		Swal.fire({
			title: 'Are you sure you want to logout?',
			width: 450,
			iconHtml: getLogoutIconHtml(),
			focusConfirm: false,
			showCancelButton: true,
			confirmButtonColor: '#1967d2',
			cancelButtonColor: '#5f6368',
			confirmButtonText: 'Yes',
			customClass: {
				popup: 'custom_logout_modal',
			},
			allowOutsideClick: () => !Swal.isLoading(),
			preConfirm: async () => {
				const confirmButton = Swal.getConfirmButton();
				confirmButton.innerHTML = `<div class="logout_spinner"></div>`;

				const apiStatus = await handleSignOut();
				if (apiStatus === 1) {
					(function clearLocalStorageExcept() {
						const preserveKeys = new Set([
							'isSwitchBoxlocal',
							'isPercentageCheck',
							'dashboard_view_type',
							'isAppInsightsPercentageCheck',
							'theme',
							'id',
							'main_app_group',
						]);

						for (let i = localStorage.length - 1; i >= 0; i--) {
							const key = localStorage.key(i);
							if (!preserveKeys.has(key)) localStorage.removeItem(key);
						}
					})();

					sessionStorage.clear();
					setGuideStart(false);
					setIsGuideVisible(false);
					navigate('/login');
				} else {
					Swal.showValidationMessage('Please try again');
				}
			},
		});
	}, [getLogoutIconHtml, handleSignOut, navigate, setGuideStart, setIsGuideVisible]);

	//search
	const [searchFlag, setSearchFlag] = useState(true); // kept naming / meaning
	const [searchText, setSearchText] = useState('');
	const [searchData, setSearchData] = useState([]);

	const searchWrapRef = useRef(null);
	const debounceTimerRef = useRef(null);

	const fetchSearchData = useCallback(async (searchQuery) => {
		setSearchText(searchQuery);

		const searchFormData = new FormData();
		searchFormData.append('user_id', localStorage.getItem('id'));
		searchFormData.append('user_token', localStorage.getItem('token'));
		searchFormData.append('search', searchQuery);

		const response = await useApi('search-from-header', searchFormData);

		if (response?.data?.status_code === 1) {
			setSearchFlag(false);
		}
		setSearchData(response?.data);
	}, []);

	const debouncedFetchData = useCallback(
		(value) => {
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = setTimeout(() => {
				fetchSearchData(value);
			}, 500);
		},
		[fetchSearchData]
	);

	const handleMainSearch = useCallback(
		(e) => {
			setIsSearched(true);
			const value = e?.target?.value ?? '';
			setSearchFlag(true);
			debouncedFetchData(value);
		},
		[debouncedFetchData, setIsSearched]
	);

	useEffect(() => {
		const handleOutsideClick = (event) => {
			const wrap = searchWrapRef.current;
			if (wrap && !wrap.contains(event.target)) {
				setSearchText('');
			}
		};

		document.addEventListener('click', handleOutsideClick);
		return () => document.removeEventListener('click', handleOutsideClick);
	}, []);

	// cleanup debounce timer
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
		};
	}, []);

	const isResultBoxActive = useMemo(() => searchText?.length > 0, [searchText]);

	return (
		<div className='app-bar-menu custom_top_bar'>
			<div className='logo-menu-box'>
				<div className='menu-btn'>
					<MdMenu className='menu_icon' />
				</div>
				<Link to='/' className='main_logo'>
					<img src={MainLogo} alt='logo' />
				</Link>
			</div>

			<div ref={searchWrapRef} className='custom-search-filter topBar-search'>
				<form autoComplete='off'>
					<IoSearch className='top_search_icon' />
					<input
						id='search-bar'
						className='topbar-search'
						type='search'
						onChange={handleMainSearch}
						placeholder='Search app name here... '
					/>
				</form>

				<div className={isResultBoxActive ? 'search-result-box active' : 'search-result-box'}>
					{searchFlag ? (
						<div className='searched-box searched-app small-box'>Searching...</div>
					) : searchData?.apps?.length === 0 ? (
						<div className='searched-box searched-app small-box'> No Result Found</div>
					) : (
						<>
							{searchData?.apps?.length > 0 && (
								<div
									className={`searched-box searched-app ${
										searchData?.apps?.length > 6 ? 'search-header' : ''
									} `}
								>
									{searchData?.apps?.map((app, index) => (
										<AppInfoBoxSearchBox
											key={index}
											app_auto_id={app?.app_auto_id}
											app_icon={app?.app_icon}
											app_platform={app?.app_platform}
											app_display_name={app?.app_display_name}
											app_console_name={app?.app_console_name}
											app_store_id={app?.app_store_id}
											setSearchText={setSearchText}
											setSearchFlag={setSearchFlag}
											setIsAppLoaderVisible={setIsAppLoaderVisible}
											appTab={appTab}
											paramsId={id}
											appId={app?.app_auto_id}
										/>
									))}
								</div>
							)}
						</>
					)}
				</div>
			</div>

			{/* Your current TopBar uses SidebarProfile (kept) */}
			<SidebarProfile handleAlert={handleAlert} />
		</div>
	);
};

export default TopBar;
