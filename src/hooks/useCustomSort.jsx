/** @format */

import moment from 'moment';
import { useCallback } from 'react';

const useCustomSort = ({ setIsTableLoaderVisible, mainData, setMainData, setPageNumber }) => {
	const sortByDate = useCallback((data, key, sortDirection) => {
		return data?.sort((a, b) => {
			const dateA = moment(a[key], 'YYYYMMDD');
			const dateB = moment(b[key], 'YYYYMMDD');

			return sortDirection === 'desc' ? dateA - dateB : dateB - dateA;
		});
	}, []);
	const sortDataByApps = useCallback((data, key, sortDirection) => {
		return data?.sort((a, b) => {
			if (a[key] < b[key]) return sortDirection ? -1 : 1;
			if (a[key] > b[key]) return sortDirection ? 1 : -1;
			return 0;
		});
	}, []);

	const sortData = useCallback((data, key, sortDirection) => {
		return data?.sort((a, b) => {
			return sortDirection === 'desc' ? a[key] - b[key] : b[key] - a[key];
		});
	}, []);

	const sortDataByEngagementTime = useCallback((data, sortDirection) => {
		return data.sort((a, b) => {
			const engagementTimeA = parseFloat(a.userEngagementDuration) / parseInt(a.activeUsers);
			const engagementTimeB = parseFloat(b.userEngagementDuration) / parseInt(b.activeUsers);
			if (sortDirection === 'asc') {
				return engagementTimeB - engagementTimeA;
			} else {
				return engagementTimeA - engagementTimeB;
			}
		});
	}, []);

	const customSort = useCallback(
		(column, sortDirection) => {
			const key = column?.sortValue;
			const selector = column?.sortKey;
			const bool = sortDirection === 'desc';

			setIsTableLoaderVisible(true);
			setPageNumber(1);

			let sortedData = [];
			if (key === 'DATE') {
				sortedData = sortByDate(mainData, selector, sortDirection);
			} else if (key === 'AVG_ENGAGEMENT') {
				sortedData = sortDataByEngagementTime(mainData, sortDirection);
			} else if (key === 'APP' || key === 'CAMPAIGN_NAME') {
				sortedData = sortDataByApps(mainData, selector, bool);
			} else {
				sortedData = sortData(mainData, selector, sortDirection);
			}
			setMainData(sortedData);
			setTimeout(() => {
				setIsTableLoaderVisible(false);
			}, 500);
		},
		[sortByDate, sortData, sortDataByApps, mainData]
	);

	return { customSort };
};

export default useCustomSort;
