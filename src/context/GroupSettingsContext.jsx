/** @format */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryFetch } from '../hooks/useQueryFetch';
import { DataContext } from './DataContext';

const GroupSettingsContext = createContext(null);

export const GroupSettingsProvider = ({ children }) => {
	const { userData, isLoggedIn: loginRef } = useContext(DataContext);

	const [selectedGroup, setSelectedGroup] = useState(() => {
		const mainGroupLocal = JSON.parse(localStorage.getItem('main_app_group')) || null;
		const mainGroup = mainGroupLocal?.map((item) => item.gg_id)?.join(',');
		return mainGroup;
	});
	const [groupName, setGroupName] = useState(() => {
		const mainGroupNameLocal = JSON.parse(localStorage.getItem('main_app_group')) || null;
		const mainGroupName = mainGroupNameLocal?.map((item) => item.gg_name)?.join(',');
		return mainGroupName;
	});

	const userId = userData.user_id || localStorage.getItem('id');
	const token = userData.user_token || localStorage.getItem('token');

	const isLoggedIn = !!loginRef || (!!userId && !!token);

	const formData = useMemo(() => {
		if (!isLoggedIn) return null;
		const fd = new FormData();
		fd.append('user_id', userId);
		fd.append('user_token', token);
		return fd;
	}, [userId, token, isLoggedIn]);

	const query = useQueryFetch(['group_select'], 'list-global-group', formData, {
		enabled: isLoggedIn,
	});

	const groupList = isLoggedIn ? query.data?.info || [] : [];

	const value = useMemo(
		() => ({
			groupList,
			selectedGroup,
			setSelectedGroup,
			groupName,
			setGroupName,
			...query,
			isEnabled: isLoggedIn,
		}),
		[groupList, selectedGroup, query, isLoggedIn]
	);

	return <GroupSettingsContext.Provider value={value}>{children}</GroupSettingsContext.Provider>;
};

export const useGroupSettings = () => {
	const ctx = useContext(GroupSettingsContext);
	if (!ctx) {
		throw new Error('useGroupSettings must be used within GroupSettingsProvider');
	}
	return ctx;
};
