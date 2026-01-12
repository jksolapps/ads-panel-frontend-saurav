/** @format */

import { useQueryFetch } from '../hooks/useQueryFetch';
import { createContext, useContext, useMemo } from 'react';
import { useGroupSettings } from './GroupSettingsContext';
import { DataContext } from './DataContext';

const AppListContext = createContext();

export const AppListProvider = ({ children }) => {
	const { userData, isLoggedIn: loginRef } = useContext(DataContext);
	const { selectedGroup } = useGroupSettings();

	const userId = userData.user_id || localStorage.getItem('id');
	const token = userData.user_token || localStorage.getItem('token');

	const isLoggedIn = !!loginRef || (!!userId && !!token);

	const formData = useMemo(() => {
		if (!isLoggedIn) return null;
		const fd = new FormData();
		fd.append('user_id', userId);
		fd.append('user_token', token);
		if (selectedGroup?.length > 0) {
			fd.append('gg_id', selectedGroup);
		}
		return fd;
	}, [userId, token, isLoggedIn, selectedGroup]);

	const FIVE_MIN = 1000 * 60 * 5;

	const { data: appList } = useQueryFetch(
		['global-app-list', isLoggedIn, userData, selectedGroup],
		'apps-list',
		formData,
		{
			enabled: isLoggedIn,
			staleTime: FIVE_MIN,
			refetchOnMount: 'ifStale',
		}
	);

	const { data: settingAppList } = useQueryFetch(
		['setting-apps-list', isLoggedIn, userData, selectedGroup],
		'setting-apps-list',
		formData,
		{
			enabled: isLoggedIn,
			staleTime: FIVE_MIN,
			refetchOnMount: 'ifStale',
		}
	);

	const groupFormData = useMemo(() => {
		if (!isLoggedIn) return null;
		const fd = new FormData();
		fd.append('user_id', userId);
		fd.append('user_token', token);
		if (selectedGroup?.length > 0) {
			fd.append('gg_id', selectedGroup);
		}
		return fd;
	}, [userId, token, isLoggedIn, selectedGroup]);

	const { data: campaignFilter } = useQueryFetch(
		['global-campaign-list', isLoggedIn, selectedGroup],
		'campaign-filter-data',
		groupFormData,
		{
			enabled: isLoggedIn,
			staleTime: FIVE_MIN,
			refetchOnMount: 'ifStale',
			gcTime: Infinity,
		}
	);

	const value = {
		appList,
		campaignFilter,
		settingAppList
	};
	return <AppListContext.Provider value={value}>{children}</AppListContext.Provider>;
};

export const useAppList = () => {
	const ctx = useContext(AppListContext);
	if (!ctx) {
		throw new Error('useAppList must be used within an AppListProvider');
	}
	return ctx;
};
