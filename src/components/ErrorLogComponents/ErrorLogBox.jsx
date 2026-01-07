/** @format */

import moment from 'moment/moment';
import React, { useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { TbMinus, TbPlus } from 'react-icons/tb';
import { useQueryFetch } from '../../hooks/useQueryFetch';
import Footer from '../Footer';
import GeneralTanStackTable from '../GeneralComponents/GeneralTanStackTable';

const PAGE_LENGTH = 15;

const ErrorLogBox = () => {
	const [errorLogData, setErrorLogData] = useState([]);
	const [errorLoader, setErrorLoader] = useState(true);

	// server sorting fields (backend expects these)
	const [columnName, setColumnName] = useState('created_at');
	const [columnOrder, setColumnOrder] = useState('DESC');

	// server paging
	const [pageIndex, setPageIndex] = useState(0);
	const [pageCount, setPageCount] = useState(1);

	// overlay loader (when sorting/paging changes)
	const [overlayLoader, setOverlayLoader] = useState(false);

	// expand (single row at a time)
	const [expandedRowId, setExpandedRowId] = useState(null);

	// TanStack sorting state (single column)
	const [sorting, setSorting] = useState([{ id: 'created_at', desc: true }]);

	const formData = useMemo(() => {
		const fd = new FormData();
		fd.append('user_id', localStorage.getItem('id'));
		fd.append('user_token', localStorage.getItem('token'));
		fd.append('sorting_column', columnName);
		fd.append('sorting_order', columnOrder);
		fd.append('start', PAGE_LENGTH * pageIndex);
		fd.append('length', PAGE_LENGTH);
		return fd;
	}, [columnName, columnOrder, pageIndex]);

	const {
		data: apiResponse,
		isSuccess: apiSuccess,
		isFetching,
		isPlaceholderData,
	} = useQueryFetch(
		['error-log-table', pageIndex, columnName, columnOrder],
		'get-error-log',
		formData,
		{
			staleTime: 60 * 1000,
			refetchOnMount: 'ifStale',
			placeholderData: (prev) => prev,
		}
	);

	useEffect(() => {
		if (!apiResponse || !apiSuccess) return;

		if (apiResponse?.status_code == 1) {
			const list = apiResponse?.error_list || [];
			setErrorLogData(list);

			const totalRecords = Number(apiResponse?.total_error_records || 0);
			const pages = Math.max(1, Math.ceil(totalRecords / PAGE_LENGTH));
			setPageCount(pages);

			setErrorLoader(false);
			setOverlayLoader(false);

			// close expanded row on new data
			setExpandedRowId(null);
		}
	}, [apiResponse, apiSuccess]);

	const getRowId = (row, index) => {
		// stable id for expansion
		if (row?.error_id != null) return String(row.error_id);
		if (row?.id != null) return String(row.id);
		// fallback
		return `${row?.created_at || 'row'}_${index}`;
	};

	const toggleExpand = (row, index) => {
		const id = getRowId(row, index);
		setExpandedRowId((prev) => (String(prev) === String(id) ? null : id));
	};

	const renderExpandedRow = ({ row }) => {
		const r = row.original;
		return (
			<div className='error_expand_box'>
				<p>
					<strong>Cron URL:</strong> {r?.cron_url}
				</p>
				<p>
					<strong>Parameter :</strong> {r?.url_parameters}
				</p>
				<p>
					<strong>Error Message:</strong> {r?.error_message}
				</p>
			</div>
		);
	};

	const columns = useMemo(
		() => [
			{
				id: 'expander',
				header: '',
				enableSorting: false,
				size: 60,
				cell: ({ row }) => {
					const r = row.original;
					const idx = row.index;
					const id = getRowId(r, idx);
					const isOpen = String(expandedRowId) === String(id);

					return (
						<div
							className='custom-column'
							style={{ cursor: 'pointer', textAlign: 'center', lineHeight: '31px' }}
							onClick={(e) => {
								e.stopPropagation();
								toggleExpand(r, idx);
							}}
							title={isOpen ? 'Collapse' : 'Expand'}
						>
							<span className='custom_expand_btn'>{isOpen ? <TbMinus /> : <TbPlus />}</span>
						</div>
					);
				},
			},
			{
				id: 'sr',
				header: 'Id',
				enableSorting: false,
				size: 100,
				meta: { alignMent: 'left' },
				cell: ({ row }) => (
					<div className='custom-column'>{pageIndex * PAGE_LENGTH + row.index + 1}</div>
				),
			},
			{
				accessorKey: 'created_at',
				id: 'created_at',
				header: 'Date',
				enableSorting: true,
				meta: { isDynamic: true, alignMent: 'center' },
				size: 220,
				cell: ({ row }) => {
					const finalDate = moment(row.original?.created_at).format('DD-MM-YYYY HH:mm:ss A');
					return <div className='custom-column'>{finalDate}</div>;
				},
			},
			{
				accessorKey: 'cron_url',
				id: 'cron_url',
				header: 'Cron Url',
				enableSorting: true,
				meta: { isDynamic: true, alignMent: 'center' },
				size: 500,
				cell: ({ row }) => <div className='custom-column'>{row.original?.cron_url}</div>,
			},
		],
		[expandedRowId, pageIndex]
	);

	const showMainLoader = errorLoader && !isPlaceholderData && isFetching;
	const showOverlayLoader = overlayLoader || (isPlaceholderData && isFetching);

	return (
		<div className='right-box-wrap'>
			<div className='table-box-wrap main-box-wrapper pdglr24 report-table-box error_table_box'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='popup-full-wrapper reports-popup-box active'>
						<div className='popup-full-box form-box-wrap form-wizard'>
							<div className='top-bar'>
								<h1 className='title'>Error Logs</h1>
							</div>

							<div className='popup-box-wrapper report-table-popup-box'>
								<div className='box-wrapper table-container' style={{ zIndex: '8' }}>
									{showOverlayLoader && (
										<div className='shimmer-spinner overlay-spinner'>
											<Spinner animation='border' variant='secondary' />
										</div>
									)}

									{showMainLoader ? (
										<div className='shimmer-spinner'>
											<Spinner animation='border' variant='secondary' />
										</div>
									) : (
										<GeneralTanStackTable
											data={errorLogData || []}
											columns={columns}
											variant='normal'
											className='table_without_virtualization error_tan_stack_table'
											rowHeight={48}
											height={48 * 14 + 40}
											stickyColumns={0}
											enableResize={false}
											enableSorting
											getRowId={getRowId}
											expandedRowId={expandedRowId}
											renderExpandedRow={renderExpandedRow}
											sorting={{
												type: 'server',
												state: sorting,
												onChange: (updater) => {
													const next = typeof updater === 'function' ? updater(sorting) : updater;
													const first = next?.[0];

													const nextSorting = first ? [first] : [{ id: 'created_at', desc: true }];
													setSorting(nextSorting);

													setColumnName(first?.id || 'created_at');
													setColumnOrder(first?.desc ? 'DESC' : 'ASC');

													setExpandedRowId(null);
													setPageIndex(0);
													setOverlayLoader(true);
												},
											}}
											// Pagination (server)
											pagination={{
												type: 'server',
												pageIndex,
												pageSize: PAGE_LENGTH,
												pageCount,
												onPageChange: (nextIndex) => {
													setExpandedRowId(null);
													setOverlayLoader(true);
													setPageIndex(nextIndex);
												},
											}}
										/>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				<Footer />
			</div>
		</div>
	);
};

export default ErrorLogBox;
