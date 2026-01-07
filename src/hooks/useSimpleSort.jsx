/** @format */

import { useCallback } from 'react';

const useSimpleSort = ({
	uniqueIdentifier,
	mainData,
	setMainData,
	setIsLoaderVisible,
	setPageNumber,
	setSortToggle,
}) => {
	const sortData = useCallback((data, key, sortDirection) => {
		return data?.sort((a, b) => {
			return sortDirection === 'desc' ? a[key] - b[key] : b[key] - a[key];
		});
	}, []);
	const sortDataByApps = useCallback((data, key, isBool) => {
		return data?.sort((a, b) => {
			if (a[key] < b[key]) return isBool ? -1 : 1;
			if (a[key] > b[key]) return isBool ? 1 : -1;
			return 0;
		});
	}, []);

	const customSort = useCallback(
		(column, sortDirection) => {
			if (uniqueIdentifier == 'day_wise_campaign') {
				setSortToggle('outer_sort');
			}
			const selector = column?.sortKey;
			const key = column?.sortValue;
			const isBool = sortDirection == 'desc';

			setIsLoaderVisible(true);
			setTimeout(() => {
				setIsLoaderVisible(false);
			}, 200);
			setPageNumber(1);

			let sortedData = [];
			if (key === 'APP' || key === 'CAMPAIGN_NAME') {
				sortedData = sortDataByApps(mainData, selector, isBool);
			} else {
				sortedData = sortData(mainData, selector, sortDirection);
			}

			setMainData(sortedData);
		},
		[sortData, mainData]
	);

	return { customSort };
};

export default useSimpleSort;
