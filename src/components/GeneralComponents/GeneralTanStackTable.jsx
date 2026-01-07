/** @format */

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getPaginationRowModel,
	flexRender,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { IoMdArrowDown, IoMdArrowUp } from 'react-icons/io';
import ResponsivePagination from 'react-responsive-pagination';
import CustomNoDataComponent from '../DataTableComponents/CustomNoDataComponent';
import { DataContext } from '../../context/DataContext';

function filterColumnsByOmit(cols = []) {
	return cols
		.map((c) => {
			if (Array.isArray(c.columns) && c.columns.length) {
				const kids = filterColumnsByOmit(c.columns);
				if (!kids.length) return null;
				return { ...c, columns: kids };
			}
			const omit = Boolean(c?.meta?.omit ?? c?.columnDef?.meta?.omit);
			return omit ? null : c;
		})
		.filter(Boolean);
}

function getLeafColumns(cols = [], out = []) {
	for (const c of cols) {
		if (c?.columns?.length) getLeafColumns(c.columns, out);
		else out.push(c);
	}
	return out;
}

function leafSignature(cols) {
	const leaves = getLeafColumns(cols);
	return leaves.map((c) => `${c.id ?? c.accessorKey}:${c.size ?? ''}:${c.minSize ?? ''}`).join('|');
}

function resolvePaginationType(pagination) {
	if (!pagination) return 'none';
	if (pagination.type) return pagination.type;
	if (pagination.mode === 'manual') return 'server';
	if (pagination.mode === 'client') return 'client';
	return 'none';
}

function resolveSortingType({ sorting, enableSorting, onSortingChange }) {
	if (!enableSorting) return 'none';
	if (sorting?.type) return sorting.type;
	if (typeof onSortingChange === 'function') return 'server';
	return 'client';
}

const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 1499;

function GeneralTanStackTable({
	data = [],
	columns = [],
	onTableDataState,
	rowHeight = 50,
	height = isSmallScreen ? 50 * 12 : 50 * 15,
	stickyColumns = 3,
	stickyColumnIds = [],
	enableSorting = true,
	initialSorting = [],
	onSortingChange,
	onRowDoubleClick,
	variant = 'sticky',
	defaultSortColumn,
	defaultSortDirection = 'desc',

	enableResize = true,
	columnResizeMode = 'onChange',
	initialColumnSizing = {},
	onColumnSizingChange,

	enableVirtualization = true,
	overscan = 8,

	sorting,
	pagination = { mode: 'none' },

	getRowId,
	className = '',
	style,
	expandedRowId = null,
	isRowExpanded,
	renderExpandedRow,
	expandedRowClassName = 'expanded_row',
}) {
	const { isDarkMode } = useContext(DataContext);

	/* columns (omit-aware) */
	const didApplyDefaultSortRef = useRef(false);
	const userSortedRef = useRef(false);

	// visible columns after omit
	const visibleColumns = useMemo(() => filterColumnsByOmit(columns), [columns]);
	const leaves = useMemo(() => getLeafColumns(visibleColumns), [visibleColumns]);

	// original leaves BEFORE omit
	const allLeaves = useMemo(() => getLeafColumns(columns), [columns]);

	const sig = useMemo(() => leafSignature(visibleColumns), [visibleColumns]);

	const sortingType = resolveSortingType({
		sorting,
		enableSorting,
		onSortingChange,
	});
	const [internalSorting, setInternalSorting] = useState(initialSorting);

	// controlled sorting
	const controlledSorting = sorting?.state;
	const sortingState = controlledSorting ?? internalSorting;

	const sortingChangeHandler =
		sorting?.onChange ||
		onSortingChange ||
		((updater) => {
			setInternalSorting((old) => (typeof updater === 'function' ? updater(old) : updater));
		});

	const paginationType = resolvePaginationType(pagination);
	const isPaginated = paginationType !== 'none';

	const [internalPagination, setInternalPagination] = useState(() => ({
		pageIndex: pagination?.pageIndex ?? 0,
		pageSize: pagination?.pageSize ?? 25,
	}));

	const isPaginationControlled =
		typeof pagination?.pageIndex === 'number' && typeof pagination?.pageSize === 'number';

	const paginationState = isPaginated
		? isPaginationControlled
			? {
					pageIndex: pagination.pageIndex,
					pageSize: pagination.pageSize,
			  }
			: internalPagination
		: undefined;

	const paginationChangeHandler =
		pagination?.onPaginationChange ||
		((updater) => {
			setInternalPagination((old) => (typeof updater === 'function' ? updater(old) : updater));
		});

	const [internalColumnSizing, setInternalColumnSizing] = useState(initialColumnSizing);
	const columnSizing = onColumnSizingChange ? undefined : internalColumnSizing;

	/* table */
	const table = useReactTable({
		data,
		columns: visibleColumns,
		defaultColumn: { minSize: 50, size: 120 },
		getRowId,
		state: {
			sorting: sortingState,
			columnSizing: columnSizing ?? internalColumnSizing,
			...(isPaginated ? { pagination: paginationState } : {}),
		},

		// Sorting behavior
		enableSorting: enableSorting && sortingType !== 'none',
		enableSortingRemoval: false,
		manualSorting: sortingType === 'server',
		getSortedRowModel: enableSorting && sortingType === 'client' ? getSortedRowModel() : undefined,

		onSortingChange: (updater) => {
			userSortedRef.current = true;

			if (!controlledSorting) {
				setInternalSorting((old) => (typeof updater === 'function' ? updater(old) : updater));
			}
			sortingChangeHandler?.(updater);
		},

		// Pagination behavior
		getPaginationRowModel: paginationType === 'client' ? getPaginationRowModel() : undefined,
		manualPagination: paginationType === 'server',
		pageCount: paginationType === 'server' ? pagination?.pageCount ?? -1 : undefined,
		onPaginationChange: (updater) => {
			if (!isPaginationControlled) {
				setInternalPagination((old) => (typeof updater === 'function' ? updater(old) : updater));
			}
			paginationChangeHandler?.(updater);
		},

		columnResizeMode,
		getCoreRowModel: getCoreRowModel(),
		onColumnSizingChange: (updater) => {
			if (onColumnSizingChange) return onColumnSizingChange(updater);
			setInternalColumnSizing((old) => (typeof updater === 'function' ? updater(old) : updater));
		},
	});

	// table data state
	useEffect(() => {
		if (onTableDataState) onTableDataState(table.getRowCount() > 0);
	}, [table.getRowCount()]);

	// default sorting
	useEffect(() => {
		if (!enableSorting) return;
		if (sortingType === 'none') return;
		if (!defaultSortColumn) return;
		if (userSortedRef.current) return;

		const current = table.getState().sorting ?? sortingState ?? [];
		if (Array.isArray(current) && current.length > 0) return;
		if (didApplyDefaultSortRef.current) return;

		didApplyDefaultSortRef.current = true;

		const target = leaves.find((c) => {
			const id = c.id ?? c.accessorKey;
			return id === defaultSortColumn || c.accessorKey === defaultSortColumn;
		});
		if (!target) return;

		const id = target.id ?? target.accessorKey;
		const next = [{ id, desc: String(defaultSortDirection).toLowerCase() === 'desc' }];

		table.setSorting(next);

		if (sortingType === 'server') {
			sortingChangeHandler?.(next);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [enableSorting, sortingType, defaultSortColumn, defaultSortDirection, leaves, sig]);

	/* container width */
	const scrollRef = useRef(null);
	const [containerW, setContainerW] = useState(0);

	useEffect(() => {
		if (!scrollRef.current) return;
		const el = scrollRef.current;

		const ro = new ResizeObserver(([entry]) => {
			const w = entry.contentRect?.width ?? el.clientWidth ?? 0;
			setContainerW(w);
		});

		ro.observe(el);
		setContainerW(el.clientWidth ?? 0);
		return () => ro.disconnect();
	}, []);

	// initial sizing (from leaves)
	useEffect(() => {
		const next = {};
		for (const c of leaves) {
			const id = c.id ?? c.accessorKey;
			const explicit = typeof c.size === 'number' ? c.size : undefined;
			next[id] = explicit ?? internalColumnSizing?.[id] ?? c.minSize ?? 120;
		}
		setInternalColumnSizing(next);
		table.setColumnSizing(next);
	}, [sig]);

	// dynamic column sizing
	useEffect(() => {
		if (!containerW) return;

		const visibleLeaves = table.getVisibleLeafColumns();

		const dynamicLeaves = visibleLeaves.filter(
			(c) => c.columnDef?.meta?.isDynamic && c.columnDef?.meta?.autoResize !== false
		);
		const fixedLeaves = visibleLeaves.filter((c) => !c.columnDef?.meta?.isDynamic);

		const sizingState = table.getState().columnSizing;
		const fixedTotal = fixedLeaves.reduce((sum, c) => {
			const fromState = sizingState?.[c.id];
			const fromDef = typeof c.columnDef?.size === 'number' ? c.columnDef.size : undefined;
			const size = fromState ?? fromDef ?? 120;
			return sum + size;
		}, 0);

		const dynCount = dynamicLeaves.length;
		if (dynCount === 0) return;

		const remaining = Math.max(0, containerW - fixedTotal);
		const minEach = 100;
		const target = Math.max(minEach, remaining / dynCount);

		const next = { ...table.getState().columnSizing };

		for (const c of dynamicLeaves) {
			const contentSize =
				typeof c.columnDef?.size === 'number' ? c.columnDef.size : next[c.id] ?? minEach;
			next[c.id] = Math.max(contentSize, target);
		}

		setInternalColumnSizing(next);
		table.setColumnSizing(next);
	}, [containerW, sig]);

	const currentRowModel = table.getRowModel();
	const rowCount = currentRowModel.rows.length;

	const effectiveVirtualization =
		enableVirtualization &&
		typeof renderExpandedRow !== 'function' &&
		expandedRowId == null &&
		typeof isRowExpanded !== 'function';

	/* virtualization */
	const rowVirtualizer = useVirtualizer(
		effectiveVirtualization
			? {
					count: rowCount,
					getScrollElement: () => scrollRef.current,
					estimateSize: () => rowHeight,
					overscan,
			  }
			: {
					count: 0,
					getScrollElement: () => scrollRef.current,
					estimateSize: () => rowHeight,
					overscan,
			  }
	);

	// TanStack visible leaf cols (actual rendered order)
	const leafCols = table.getVisibleLeafColumns();

	const stickyLeafIds = useMemo(() => {
		if (Array.isArray(stickyColumnIds) && stickyColumnIds.length) {
			const visibleSet = new Set(leafCols.map((c) => c.id));
			return stickyColumnIds.filter((id) => visibleSet.has(id));
		}

		const n = Number(stickyColumns) || 0;
		if (n <= 0) return [];

		const baseIds = allLeaves
			.slice(0, n)
			.map((c) => c.id ?? c.accessorKey)
			.filter(Boolean);

		const visibleSet = new Set(leafCols.map((c) => c.id));

		return baseIds.filter((id) => visibleSet.has(id));
	}, [stickyColumnIds, stickyColumns, allLeaves, leafCols]);

	const lastStickyLeafId = stickyLeafIds[stickyLeafIds.length - 1] || null;

	const colVars = useMemo(() => {
		const vars = {};
		let left = 0;

		leafCols.forEach((col) => {
			const size = col.getSize();
			vars[`--col-${col.id}-size`] = size;

			if (stickyLeafIds.includes(col.id)) {
				vars[`--col-${col.id}-left`] = left;
				left += size;
			}
		});

		table
			.getFlatHeaders()
			.filter((h) => !h.isPlaceholder)
			.forEach((h) => {
				const size = h.getSize();
				vars[`--header-${h.id}-size`] = size;

				if (stickyLeafIds.includes(h.column.id)) {
					vars[`--header-${h.id}-left`] = vars[`--col-${h.column.id}-left`] ?? 0;
				}
			});

		return vars;
	}, [leafCols, stickyLeafIds, table.getState().columnSizing]);

	const noData = !Array.isArray(data) || data.length === 0 || rowCount === 0;

	if (noData) {
		return (
			<div
				className={className + ' custom_tan_stack_table'}
				style={{
					height,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: isDarkMode ? '#252728' : '#fff',
					...style,
				}}
				ref={scrollRef}
			>
				<CustomNoDataComponent />
			</div>
		);
	}

	const renderSortIcon = (col) => {
		if (!enableSorting || sortingType === 'none' || !col.getCanSort()) return null;
		const dir = col.getIsSorted();
		const align = col.columnDef.meta?.alignMent;
		const iconStyle =
			align === 'right'
				? { color: isDarkMode ? 'fff' : '#4B5563' }
				: { color: isDarkMode ? 'fff' : '#4B5563' };
		if (dir === 'asc') return <IoMdArrowUp size={18} style={iconStyle} />;
		if (dir === 'desc') return <IoMdArrowDown size={18} style={iconStyle} />;
		return <IoMdArrowDown size={18} style={{ opacity: 0, transition: 'opacity 0.15s' }} />;
	};

	const scrollStyle = { overflow: 'auto', height };
	const totalPages =
		paginationType === 'server' ? pagination?.pageCount ?? 1 : table.getPageCount?.() ?? 1;

	const getResolvedRowId = (row) => {
		try {
			if (typeof getRowId === 'function') return getRowId(row.original, row.index);
		} catch (_) {}
		return row.id ?? row.original?.id;
	};

	const isExpanded = (row) => {
		if (typeof isRowExpanded === 'function') return !!isRowExpanded(row.original, row);
		if (expandedRowId == null) return false;
		return String(getResolvedRowId(row)) === String(expandedRowId);
	};

	return (
		<>
			<div
				style={{ ...scrollStyle, ...style }}
				className={
					className + (!effectiveVirtualization ? ' normal_table' : '') + ' custom_tan_stack_table'
				}
				ref={scrollRef}
			>
				<table
					key={sig}
					style={{
						width: table.getTotalSize(),
						...colVars,
						display: 'block',
						borderCollapse: 'collapse',
						background: isDarkMode ? '#252728' : '#fff',
					}}
					className={variant === 'normal' ? 'simple_table' : 'sticky_table'}
				>
					<thead
						className='table_head'
						style={{
							position: 'sticky',
							top: 0,
							zIndex: 5,
							background: '#fff',
						}}
					>
						{table.getHeaderGroups().map((hg) => (
							<tr key={hg.id}>
								<th>
									{hg.headers.map((header) => {
										if (header.isPlaceholder) return null;

										const colSize = header.getSize();
										const align = header.column.columnDef.meta?.alignMent;
										const isSticky = stickyLeafIds.includes(header.column.id);
										const isEdge = header.column.id === lastStickyLeafId;

										const canSort = enableSorting && sortingType !== 'none' && header.column.getCanSort?.();

										const headerClassName =
											'table_head_cell ' + (header.column.columnDef.meta?.headerClassName || '');

										return (
											<div
												key={header.id}
												className={`${headerClassName} ${isSticky ? 'sticky_cell' : ''}`}
												data-column-id={header.column.id}
												style={{
													width: `calc(var(--header-${header.id}-size, ${colSize}px) * 1px)`,
													minWidth: `calc(var(--header-${header.id}-size, ${colSize}px) * 1px)`,
													maxWidth: `calc(var(--header-${header.id}-size, ${colSize}px) * 1px)`,
													position: isSticky ? 'sticky' : 'relative',
													left: isSticky ? `calc(var(--header-${header.id}-left, 0px) * 1px)` : undefined,
													background: '#fff',
													zIndex: isSticky ? 6 : 5,
													textAlign: align || 'left',
													cursor: canSort ? 'pointer' : 'default',
													borderBottom: '1px solid #e5e7eb',
													borderRight: isSticky && isEdge ? '1px solid rgba(0,0,0,0.08)' : undefined,
												}}
												onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
											>
												<span
													style={{
														display: 'flex',
														alignItems: 'center',
														height: '100%',
														justifyContent: align === 'right' ? 'end' : align === 'left' ? 'left' : 'center',
														flexDirection: align === 'right' ? 'row-reverse' : '',
														gap: '6px',
														userSelect: 'none',
														padding: variant === 'normal' ? '12px 10px 12px' : '8px 10px 10px',
														overflow: 'hidden',
													}}
												>
													{flexRender(header.column.columnDef.header, header.getContext())}
													{renderSortIcon(header.column)}
												</span>

												{enableResize && header.column.getCanResize?.() && (
													<div
														onDoubleClick={() => header.column.resetSize?.()}
														onMouseDown={header.getResizeHandler()}
														onTouchStart={header.getResizeHandler()}
														className='resizer-area'
														style={{
															position: 'absolute',
															right: 0,
															top: 0,
															height: '100%',
															width: 6,
															cursor: 'col-resize',
															zIndex: 7,
														}}
														onClick={(e) => e.stopPropagation()}
													/>
												)}
											</div>
										);
									})}
								</th>
							</tr>
						))}
					</thead>

					<tbody>
						{effectiveVirtualization ? (
							<tr>
								<td colSpan={table.getVisibleLeafColumns().length} style={{ padding: 0, border: 'none' }}>
									<div
										style={{
											position: 'relative',
											width: '100%',
											height: `${rowVirtualizer?.getTotalSize() ?? rowCount * rowHeight}px`,
										}}
									>
										{rowVirtualizer?.getVirtualItems().map((vRow) => {
											const row = currentRowModel.rows[vRow.index];
											return (
												<div
													key={row.id}
													className='table_raw'
													style={{
														position: 'absolute',
														top: vRow.start,
														left: 0,
														width: '100%',
														height: `${vRow.size}px`,
														display: 'flex',
														borderBottom: '1px solid #e5e7eb',
														boxSizing: 'border-box',
														...(onRowDoubleClick && { cursor: 'pointer' }),
													}}
													onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row.original)}
												>
													{row.getVisibleCells().map((cell) => {
														const colSize = cell.column.getSize();
														const align = cell.column?.columnDef?.meta?.alignMent;
														const isSticky = stickyLeafIds.includes(cell.column.id);
														const isEdge = cell.column.id === lastStickyLeafId;

														return (
															<div
																key={cell.id}
																data-column-id={cell.column.id}
																className='table_cell'
																style={{
																	alignSelf: 'center',
																	width: `calc(var(--col-${cell.column.id}-size, ${colSize}px) * 1px)`,
																	minWidth: `calc(var(--col-${cell.column.id}-size, ${colSize}px) * 1px)`,
																	maxWidth: `calc(var(--col-${cell.column.id}-size, ${colSize}px) * 1px)`,
																	textAlign: align || 'left',
																	padding: '8px 10px',
																	boxSizing: 'border-box',
																	position: isSticky ? 'sticky' : 'relative',
																	left: isSticky ? `calc(var(--col-${cell.column.id}-left, 0px) * 1px)` : undefined,
																	background: isSticky ? '#fff' : 'transparent',
																	zIndex: isSticky ? 3 : 1,
																	borderRight: isSticky && isEdge ? '1px solid rgba(0,0,0,0.08)' : undefined,
																	height: rowHeight - 1,
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: align || 'center',
																	overflow: 'hidden',
																}}
															>
																{flexRender(cell.column.columnDef.cell, cell.getContext())}
															</div>
														);
													})}
												</div>
											);
										})}
									</div>
								</td>
							</tr>
						) : (
							currentRowModel.rows.map((row) => {
								const expanded = isExpanded(row);
								return (
									<React.Fragment key={row.id}>
										<tr
											style={{
												height: rowHeight,
												borderBottom: isDarkMode ? '1px solid #2e2e29' : '1px solid #e5e7eb',
												display: 'flex',
											}}
											onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row.original)}
										>
											{row.getVisibleCells().map((cell) => {
												const colSize = Math.ceil(cell.column.getSize());
												const align = cell.column.columnDef.meta?.alignMent;
												const isSticky = stickyLeafIds.includes(cell.column.id);
												const isEdge = cell.column.id === lastStickyLeafId;

												return (
													<td
														key={cell.id}
														style={{
															width: `calc(var(--col-${cell.column.id}-size, ${colSize}px) * 1px)`,
															minWidth: `calc(var(--col-${cell.column.id}-size, ${colSize}px) * 1px)`,
															maxWidth: `calc(var(--col-${cell.column.id}-size, ${colSize}px) * 1px)`,
															position: isSticky ? 'sticky' : 'relative',
															left: isSticky ? `calc(var(--col-${cell.column.id}-left, 0px) * 1px)` : undefined,
															background: isSticky ? (isDarkMode ? '#252728' : '#fff') : 'transparent',
															zIndex: isSticky ? 3 : 1,
															borderRight: isSticky && isEdge ? '1px solid rgba(0,0,0, 0.08)' : undefined,
															textAlign: align || 'left',
															padding: '4px 8px',
															boxSizing: 'border-box',
														}}
													>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</td>
												);
											})}
										</tr>

										{expanded && typeof renderExpandedRow === 'function' && (
											<tr className={expandedRowClassName}>
												<td
													colSpan={table.getVisibleLeafColumns().length}
													style={{
														padding: 0,
														borderBottom: '1px solid #e5e7eb',
													}}
												>
													<div
														style={{
															width: table.getTotalSize(),
															minWidth: table.getTotalSize(),
														}}
													>
														{renderExpandedRow({ row })}
													</div>
												</td>
											</tr>
										)}
									</React.Fragment>
								);
							})
						)}
					</tbody>
				</table>
			</div>

			{isPaginated && pagination?.pageCount > 1 && (
				<div
					style={{
						position: 'sticky',
						bottom: 0,
						background: isDarkMode ? '#252728' : '#fff',
						borderTop: '1px solid #e5e7eb',
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 4,
					}}
				>
					<ResponsivePagination
						current={(table.getState().pagination?.pageIndex ?? 0) + 1}
						total={totalPages}
						onPageChange={(page) => {
							const nextIndex = page - 1;
							if (typeof pagination?.onPageChange === 'function') {
								pagination.onPageChange(nextIndex);
								return;
							}
							table.setPageIndex(nextIndex);
						}}
						className='custom_pagination'
						maxWidth={10}
						previousLabel='Prev'
						nextLabel='Next'
					/>
				</div>
			)}
		</>
	);
}

export default GeneralTanStackTable;
