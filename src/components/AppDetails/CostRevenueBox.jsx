/** @format */
'use client';

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { Spinner } from 'react-bootstrap';
import { MdClose } from 'react-icons/md';

import { DataContext } from '../../context/DataContext';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import { indianNumberFormat } from '../../utils/helper';

import CostRevenueGraph from './CostRevenueGraph';
import CustomNoDataComponent from '../DataTableComponents/CustomNoDataComponent';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';
import { useTanStackTableHover } from '../../hooks/useTanStackTableHover';

/* ------------------------------ main ------------------------------ */

const CostRevenueBox = ({ appId }) => {
	const { isDarkMode } = useContext(DataContext);

	/* ------------------------------ state ------------------------------ */

	const [tableData, setTableData] = useState([]);
	const [searchData, setSearchData] = useState([]);
	const [graphData, setGraphData] = useState([]);

	const [isLoading, setIsLoading] = useState(false);
	const [searchText, setSearchText] = useState('');

	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const itemsPerPage = 50;

	const [viewMode, setViewMode] = useState('day');
	const [country, setCountry] = useState([]);

	const timeoutRef = useRef(null);

	/* ------------------------- month range ------------------------- */

	const finalMonthRange = useMemo(() => {
		const startDate = '01/01/2017';
		const endDate = moment().endOf('month').format('DD/MM/YYYY');
		return `${startDate}-${endDate}`;
	}, []);

	/* ----------------------------- API ----------------------------- */

	const formData = useMemo(() => {
		const fd = new FormData();
		fd.append('user_id', localStorage.getItem('id'));
		fd.append('user_token', localStorage.getItem('token'));
		fd.append('group_by', viewMode);

		if (appId) fd.append('app_auto_id', appId);
		if (finalMonthRange) fd.append('analytics_date_range', finalMonthRange);
		if (country?.length) fd.append('country', country);

		return fd;
	}, [appId, finalMonthRange, viewMode, country]);

	const { data, isSuccess, isFetching } = useQueryFetch(
		['app-cost-revenue-graph-table', appId, finalMonthRange, viewMode, country],
		'get-app-cost-revenue-graph',
		formData,
		{
			enabled: !!appId,
			staleTime: 1000 * 60 * 5,
			refetchOnMount: 'ifStale',
		}
	);

	useEffect(() => {
		setIsLoading(isFetching);
	}, [isFetching]);

	useEffect(() => {
		if (!data || !isSuccess) return;
		if (data?.status_code !== 1) return;

		setGraphData(data.graphData || []);
		setTableData(data.graphData || []);
		setSearchData(data.graphData || []);
		setTotalPages(Math.ceil(data?.graphData?.length / itemsPerPage));
		setCurrentPage(1);
		setIsLoading(false);
	}, [data, isSuccess]);

	/* ------------------------------ search ------------------------------ */

	const handleFilterData = (rows, query) => {
		const q = String(query || '')
			.toLowerCase()
			.trim();
		if (!q) return rows;

		return rows.filter((r) =>
			String(r.grp || '')
				.toLowerCase()
				.includes(q)
		);
	};

	const handleSearch = (e) => {
		const value = e.target.value;
		setSearchText(value);

		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		timeoutRef.current = setTimeout(() => {
			setTableData(handleFilterData(searchData, value));
			setCurrentPage(1);
		}, 600);
	};

	const handleSearchClose = () => {
		setSearchText('');
		setTableData(searchData);
		setCurrentPage(1);
	};

	/* ------------------------------ columns ------------------------------ */

	const columns = useMemo(
		() => [
			{
				id: 'increment_id',
				accessorKey: 'increment_id',
				header: 'Id',
				size: 70,
				enableSorting: false,
				meta: { alignMent: 'center' },
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'grp',
				header: 'Date',
				enableSorting: true,
				cell: (info) => {
					const v = info.getValue();
					if (viewMode === 'month') return moment(v, 'YYYY-MM').format('MMM YYYY');
					if (viewMode === 'week') return moment(v, 'YYYYWW').format('YYYY[W]WW');
					return v;
				},
			},
			{
				accessorKey: 'revenue',
				header: 'Revenue',
				enableSorting: true,
				meta: { alignMent: 'right', isDynamic: true },
				cell: (info) => `$${indianNumberFormat(Number(info.getValue() || 0).toFixed(2))}`,
			},
			{
				accessorKey: 'cost',
				header: 'Cost',
				enableSorting: true,
				meta: { alignMent: 'right', isDynamic: true },
				cell: (info) => `$${indianNumberFormat(Number(info.getValue() || 0).toFixed(2))}`,
			},
		],
		[currentPage, viewMode]
	);

	useTanStackTableHover([tableData], '.single_app_cost_rev_table');

	/* ------------------------------ render ------------------------------ */

	return (
		<div className='user_country_graph_wrap cost_rev_box'>
			{isLoading && (
				<div className='shimmer-spinner overlay-spinner'>
					<Spinner animation='border' variant='secondary' />
				</div>
			)}

			<CostRevenueGraph
				isDarkMode={isDarkMode}
				graphData={graphData}
				viewMode={viewMode}
				setViewMode={setViewMode}
				country={country}
				setCountry={setCountry}
			/>

			<div className='graph_table_wrap single_app_report_table'>
				<div className='box-wrapper table-container'>
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
						data={tableData}
						columns={columns}
						height={35 * 5 + 110}
						rowHeight={34}
						className='single_app_cost_rev_table'
						enableSorting
						stickyColumns={0}
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
												pageSize: itemsPerPage,
												pageCount: totalPages,
										  })
										: updater;
								setCurrentPage(next.pageIndex + 1);
							},
						}}
						defaultSortColumn='grp'
						defaultSortDirection='desc'
					/>
				</div>
			</div>
		</div>
	);
};

export default CostRevenueBox;
