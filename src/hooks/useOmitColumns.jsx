/** @format */

import { useEffect } from 'react';

const useOmitColumns = ({
	columns,
	tableSelector,
	tableDimension,
	finalDimension,
	setColumns,
	isDataFetched,
}) => {
	useEffect(() => {
		const updatedColumns = columns?.map((column) => {
			const dimensionItem = tableDimension.find((item) => item.sortValue == column.sortValue);
			if (dimensionItem) {
				return {
					...column,
					omit: !dimensionItem?.item_checked,
				};
			}
			return column;
		});

		const finalUpdatedColumns = updatedColumns.map((column) => {
			if (finalDimension.includes(column.sortValue)) {
				return {
					...column,
					omit: false,
				};
			} else {
				return {
					...column,
				};
			}
		});

		finalUpdatedColumns.forEach((column, index) => {
			const nonOmittedColumns = finalUpdatedColumns.filter((item) => !item.omit && item.fixed);
			const lastNonOmittedIndex = finalUpdatedColumns.findIndex(
				(item) => item === nonOmittedColumns[nonOmittedColumns.length - 1]
			);
			const isLastColumn = index === lastNonOmittedIndex;

			if (!column.omit) {
				column.style = {
					...column.style,
					borderRight: isLastColumn ? '1px solid rgb(0 0 0 / 18%)' : 'none',
				};
				setTimeout(() => {
					const headerCell = document.querySelector(
						`${tableSelector} .rdt_TableCol[data-column-id="${index + 1}"]`
					);
					if (headerCell) {
						headerCell.style.borderRight = isLastColumn ? '1px solid rgb(0 0 0 / 18%)' : 'none';
					}
				}, 100);
			} else {
				if (column.style) {
					column.style = {
						...column.style,
						borderRight: undefined,
					};
				}
				setTimeout(() => {
					const headerCell = document.querySelector(
						`${tableSelector} .rdt_TableCol[data-column-id="${index + 1}"]`
					);
					if (headerCell) {
						headerCell.style.borderRight = '';
					}
				}, 100);
			}
		});

		setColumns(finalUpdatedColumns);
	}, [tableDimension, isDataFetched]);
};

export default useOmitColumns;
