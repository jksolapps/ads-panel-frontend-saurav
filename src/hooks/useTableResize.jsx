import { useEffect, useRef, useState } from 'react';

const useTableResize = ({ tableSelector, columnWidths, tableToggleResize, mainData = [] }) => {
	const tableRef = useRef(null);
	const [isResizing, setIsResizing] = useState(false);
	const [startX, setStartX] = useState(0);
	const [startWidth, setStartWidth] = useState(0);
	const [currentColumnId, setCurrentColumnId] = useState(null);
	const rafRef = useRef(null);
	// Add this state to store all columns' widths at the start of resizing
	const [allColumnWidths, setAllColumnWidths] = useState({});

	const resetColumnWidths = () => {
		const headers = tableRef?.current?.querySelectorAll(`.rdt_TableCol`);
		const cells = tableRef?.current?.querySelectorAll(`.rdt_TableCell`);
		headers?.forEach(header => {
			header.style.setProperty('width', '', 'important');
			header.style.setProperty('min-width', '', 'important');
			header.style.setProperty('max-width', '', 'important');
		});
		cells?.forEach(cell => {
			cell.style.setProperty('width', '', 'important');
			cell.style.setProperty('min-width', '', 'important');
			cell.style.setProperty('max-width', '', 'important');
		});
	};

	useEffect(() => {
		if (tableToggleResize) {
			resetColumnWidths();
		}
	}, [tableToggleResize]);

	useEffect(() => {
		const onMouseDown = (e) => {
			const resizerArea = e.target.closest('.resizer-area');
			if (resizerArea) {
				e.preventDefault();
				const columnId = resizerArea.parentElement?.getAttribute('data-column-id');
				const elementWidth = resizerArea.parentElement?.getBoundingClientRect().width;
				if (columnId && elementWidth) {
					// Record all current widths
					const headers = tableRef.current.querySelectorAll(`${tableSelector} .rdt_TableCol`);
					const widths = {};
					headers.forEach(header => {
						const id = header.getAttribute('data-column-id');
						widths[id] = header.getBoundingClientRect().width;
					});
					setAllColumnWidths(widths);

					setIsResizing(true);
					setStartX(e.clientX);
					setStartWidth(elementWidth);
					setCurrentColumnId(columnId);
				}
			}
		};

		const onMouseMove = (e) => {
			if (!isResizing || !currentColumnId) return;
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
			rafRef.current = requestAnimationFrame(() => {
				let newWidth = startWidth + (e.clientX - startX);
				const minColumnWidth = columnWidths[currentColumnId] || columnWidths.default;
				newWidth = Math.max(newWidth, minColumnWidth);

				// 1. Remove position sticky only from columns that have it
				const allHeaders = tableRef.current.querySelectorAll(`${tableSelector} .rdt_TableCol`);
				const allCells = tableRef.current.querySelectorAll(`${tableSelector} .rdt_TableCell`);

				allHeaders.forEach(header => {
					if (window.getComputedStyle(header).position === 'sticky') {
						header.dataset.wasSticky = 'true';
						header.style.setProperty('top', 'auto', 'important');
						header.style.setProperty('left', 'auto', 'important');
						header.style.setProperty('z-index', 'auto', 'important');
					}
				});
				allCells.forEach(cell => {
					if (window.getComputedStyle(cell).position === 'sticky') {
						cell.dataset.wasSticky = 'true';
						cell.style.setProperty('top', 'auto', 'important');
						cell.style.setProperty('left', 'auto', 'important');
						cell.style.setProperty('z-index', 'auto', 'important');
					}
				});

				// 2. Set widths for all columns (lock widths)
				allHeaders.forEach(header => {
					const id = header.getAttribute('data-column-id');
					let width = allColumnWidths[id] || header.getBoundingClientRect().width;
					if (id === currentColumnId) width = newWidth;
					header.style.setProperty('width', `${width}px`, 'important');
					header.style.setProperty('min-width', `${width}px`, 'important');
					header.style.setProperty('max-width', `${width}px`, 'important');
				});

				allCells.forEach(cell => {
					const id = cell.getAttribute('data-column-id');
					let width = allColumnWidths[id] || cell.getBoundingClientRect().width;
					if (id === currentColumnId) width = newWidth;
					cell.style.setProperty('width', `${width}px`, 'important');
					cell.style.setProperty('min-width', `${width}px`, 'important');
					cell.style.setProperty('max-width', `${width}px`, 'important');
				});
			})
		};

		const onMouseUp = () => {
			if (isResizing) {
				const allHeaders = tableRef.current.querySelectorAll(`${tableSelector} .rdt_TableCol`);
				const allCells = tableRef.current.querySelectorAll(`${tableSelector} .rdt_TableCell`);

				allHeaders.forEach(header => {
					if (header.dataset.wasSticky === 'true') {
						header.style.removeProperty('top');
						header.style.removeProperty('left');
						header.style.removeProperty('z-index');
						delete header.dataset.wasSticky;
					}
				});
				allCells.forEach(cell => {
					if (cell.dataset.wasSticky === 'true') {
						cell.style.removeProperty('top');
						cell.style.removeProperty('left');
						cell.style.removeProperty('z-index');
						delete cell.dataset.wasSticky;
					}
				});

				setIsResizing(false);
				setCurrentColumnId(null);
			}
		};
		const tableElement = document.querySelector(tableSelector);
		tableRef.current = tableElement;

		tableElement?.addEventListener('mousedown', onMouseDown);
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);

		return () => {
			tableElement?.removeEventListener('mousedown', onMouseDown);
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [isResizing, startX, startWidth, currentColumnId, tableSelector, mainData]);

	return tableRef;
};

export default useTableResize;