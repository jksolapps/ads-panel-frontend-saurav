/** @format */
'use client';

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { Spinner } from 'react-bootstrap';
import { MdClose } from 'react-icons/md';
import Tippy from '@tippyjs/react';

import { DataContext } from '../../context/DataContext';
import { useQueryFetch } from '../../hooks/useQueryFetch';

import { formatNumberToKMBNotFloat, indianNumberFormat } from '../../utils/helper';

import UserGeographyChart from './UserGeographyChart';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import { useTanStackTableHover } from '../../hooks/useTanStackTableHover';

/* -------------------------------- utils -------------------------------- */

const ConditionalTippy = ({ value, content, children }) => {
	const numericValue = Number(value) || 0;
	if (numericValue < 1000) return children;
	return (
		<Tippy content={content} placement='top' arrow duration={0} className='new_custom_tooltip'>
			{children}
		</Tippy>
	);
};

const formatDateShortOrFull = (dateStr) => {
	const parsed = moment(dateStr, 'YYYY-MM-DD', true);
	const m = parsed.isValid() ? parsed : moment(dateStr);
	const isCurrentYear = m.year() === moment().year();
	return m.format(isCurrentYear ? 'DD MMM' : 'DD MMM YYYY');
};

/* ----------------------------- main comp ----------------------------- */

const UserCountryBox = ({ appId, overviewSelect }) => {
	const { isDarkMode } = useContext(DataContext);

	const [userCountryData, setUserCountryData] = useState([]);
	const [searchData, setSearchData] = useState([]);
	const [graphData, setGraphData] = useState([]);
	const [tableLoader, setTableLoader] = useState(false);

	const [searchText, setSearchText] = useState('');
	const timeoutRef = useRef(null);

	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const itemsPerPage = 100;

	const [idOmit, setIdOmit] = useState(window.innerWidth < 767);

	/* ---------------------------- resize omit ---------------------------- */

	useEffect(() => {
		const handleResize = () => setIdOmit(window.innerWidth < 767);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	/* ----------------------------- API fetch ----------------------------- */

	const formData = new FormData();
	formData.append('user_id', localStorage.getItem('id'));
	formData.append('user_token', localStorage.getItem('token'));
	formData.append('type', overviewSelect);
	formData.append('app_auto_id', appId);

	const { data: apiResponse, isSuccess } = useQueryFetch(
		['country-box', appId, overviewSelect],
		'get-app-info-countries',
		formData,
		{
			enabled: !!appId,
			staleTime: 1000 * 60 * 5,
			refetchOnMount: 'ifStale',
		}
	);

	/* -------------------------- format API data -------------------------- */

	const formatAPIData = (data = []) => {
		const map = new Map();
		data.forEach(({ arc_country, arc_install_date, total_users }) => {
			const country = arc_country || '(not set)';
			if (!map.has(country)) {
				map.set(country, { total: 0, days: new Map() });
			}

			const c = map.get(country);
			const users = Number(total_users || 0);

			c.total += users;
			c.days.set(arc_install_date, (c.days.get(arc_install_date) || 0) + users);
		});

		const result = Array.from(map, ([arc_country, { total, days }]) => ({
			arc_country,
			total_users: total,
			day_wise_user: Array.from(days, ([arc_install_date, total_users]) => ({
				arc_install_date,
				total_users,
			})),
		}));

		result.sort((a, b) => b.total_users - a.total_users);
		return result.map((item, index) => ({
			increment_id: index + 1,
			...item,
		}));
	};

	/* ------------------------------ effects ------------------------------ */

	useEffect(() => {
		if (!apiResponse || !isSuccess) return;

		const formatted = formatAPIData(apiResponse.data);

		setUserCountryData(formatted);
		setSearchData(formatted);
		setGraphData(apiResponse.data);
		setTableLoader(false);
		setCurrentPage(1);
		setTotalPages(Math.ceil(formatted?.length / itemsPerPage));
	}, [apiResponse, isSuccess]);

	/* ------------------------------ search ------------------------------- */

	const handleFilterData = (data, query) => {
		const q = query.toLowerCase().trim();
		return data.filter((i) => i.arc_country?.toLowerCase().includes(q));
	};

	const handleSearch = (e) => {
		const value = e.target.value;
		setSearchText(value);

		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		timeoutRef.current = setTimeout(() => {
			setUserCountryData(handleFilterData(searchData, value));
			setCurrentPage(1);
		}, 600);
	};

	const handleSearchClose = () => {
		setSearchText('');
		setUserCountryData(searchData);
		setCurrentPage(1);
	};

	const columns = useMemo(() => {
		const uniqueDates = [
			...new Set(userCountryData.flatMap((r) => r.day_wise_user.map((d) => d.arc_install_date))),
		].sort((a, b) => new Date(b) - new Date(a));

		const dateTotals = Object.fromEntries(
			uniqueDates.map((date) => [
				date,
				userCountryData.reduce((sum, r) => {
					const d = r.day_wise_user.find((x) => x.arc_install_date === date);
					return sum + (d?.total_users || 0);
				}, 0),
			])
		);

		const allUsersTotal = userCountryData.reduce((s, r) => s + (r.total_users || 0), 0);

		return [
			{
				id: 'index',
				accessorKey: 'increment_id',
				header: 'Id',
				size: 70,
				enableSorting: false,
				meta: { alignMent: 'center', omit: idOmit },
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'arc_country',
				header: 'Country',
				size: 120,
				enableSorting: true,
				cell: (info) => info.getValue() || '-',
			},
			{
				accessorKey: 'total_users',
				header: () => (
					<div>
						Total
						<div className='user_total_count'>{formatNumberToKMBNotFloat(allUsersTotal)}</div>
					</div>
				),
				size: 110,
				enableSorting: true,
				meta: { alignMent: 'center' },
				cell: (info) => (
					<ConditionalTippy
						value={info.getValue()}
						content={<div>{indianNumberFormat(info.getValue())}</div>}
					>
						<div> {formatNumberToKMBNotFloat(info.getValue())}</div>
					</ConditionalTippy>
				),
			},
			...uniqueDates.map((date) => ({
				id: date,
				header: () => (
					<div>
						{formatDateShortOrFull(date)}
						<div className='user_total_count'>{formatNumberToKMBNotFloat(dateTotals[date])}</div>
					</div>
				),
				accessorFn: (row) =>
					row.day_wise_user.find((d) => d.arc_install_date === date)?.total_users || 0,
				enableSorting: true,
				size: 110,
				meta: { alignMent: 'center', isDynamic: true },
				cell: (info) => (
					<ConditionalTippy
						value={info.getValue()}
						content={<div>{indianNumberFormat(info.getValue())}</div>}
					>
						<div> {formatNumberToKMBNotFloat(info.getValue())}</div>
					</ConditionalTippy>
				),
			})),
		];
	}, [userCountryData, idOmit, currentPage]);

	useTanStackTableHover([userCountryData], '.single_app_user_country_table');

	return (
		<div className='user_country_graph_wrap'>
			<UserGeographyChart data={graphData} isDarkMode={isDarkMode} />

			<div className='graph_table_wrap single_app_report_table'>
				<div className='box-wrapper table-container'>
					{tableLoader && (
						<div className='shimmer-spinner overlay-spinner'>
							<Spinner animation='border' variant='secondary' />
						</div>
					)}

					{/* search */}
					<div className='custom-search-filter single_app_search'>
						<div className='single_app_search_inner'>
							<input
								value={searchText}
								onChange={handleSearch}
								placeholder='Search...'
								autoComplete='off'
							/>
							{searchText && <MdClose className='search-close' onClick={handleSearchClose} />}
						</div>
					</div>

					{/* table */}
					<GeneralTanStackTable
						data={userCountryData}
						columns={columns}
						height={35 * 5.5 + 110}
						rowHeight={34}
						className='single_app_user_country_table'
						stickyColumns={3}
						enableSorting
						enableResize={false}
						variant='normal'
						enableVirtualization
						pagination={{
							mode: 'client',
							pageIndex: currentPage - 1,
							pageSize: itemsPerPage,
							pageCount: totalPages,
							onPaginationChange: (updater) => {
								const next =
									typeof updater === 'function'
										? updater({
												pageIndex: currentPage - 1,
												pageCount: totalPages,
												pageSize: itemsPerPage,
										  })
										: updater;
								setCurrentPage(next.pageIndex + 1);
							},
						}}
						defaultSortColumn='total_users'
						defaultSortDirection='desc'
					/>
				</div>
			</div>
		</div>
	);
};

export default UserCountryBox;
