// useStickyColumns.js
import { useEffect } from 'react';

const useStickyColumns = ({
  uniqueSelector = '',
  columnIds = [],
  mainLoader = false,
  innerLoader = false,
  isZ_Index = false,
  mainData = []
}) => {
  const updateStickyPositions = () => {
    const columnWidths = columnIds.map(id => {
      const columnCell = document.querySelector(
        `${uniqueSelector} .rdt_TableCell[data-column-id="${id}"]`
      );
      return columnCell?.offsetWidth || 0;
    });


    columnIds.forEach((id, index) => {
      const offset = columnWidths.slice(0, index).reduce((a, b) => a + b, 0);

      const columnHeader = document.querySelector(
        `${uniqueSelector} .rdt_TableCol[data-column-id="${id}"]`
      );
      if (columnHeader) {
        columnHeader.classList.add('custom_sticky_column');
        columnHeader.style.position = 'sticky';
        columnHeader.style.backgroundColor = '#fff';
        columnHeader.style.left = `${offset}px`;
        if (isZ_Index) {
          columnHeader.style.setProperty(
            'z-index',
            `${columnIds.length - id + 2}`,
            'important'
          );
        }
      }

      const columnCells = document.querySelectorAll(
        `${uniqueSelector} .rdt_TableCell[data-column-id="${id}"]`
      );
      columnCells.forEach(cell => {
        cell.classList.add('custom_sticky_column');
        cell.style.position = 'sticky';
        cell.style.left = `${offset}px`;
        if (isZ_Index) {
          cell.style.setProperty(
            'z-index',
            `${columnIds.length - id + 2}`,
            'important'
          );
        }
      });
    });

    // fix border for last visible column
    columnIds.forEach(id => {
      const columnCells = document.querySelectorAll(
        `${uniqueSelector} .rdt_TableCell[data-column-id="${id}"]`
      );
      columnCells.forEach(cell => (cell.style.borderRight = ''));
      const columnHeader = document.querySelector(
        `${uniqueSelector} .rdt_TableCol[data-column-id="${id}"]`
      );
      if (columnHeader) columnHeader.style.borderRight = '';
    });

    const lastVisibleColumnId = columnIds.slice().reverse().find(id => {
      const columnCells = document.querySelectorAll(
        `${uniqueSelector} .rdt_TableCell[data-column-id="${id}"]`
      );
      return columnCells.length > 0;
    });

    if (lastVisibleColumnId) {
      const lastCells = document.querySelectorAll(
        `${uniqueSelector} .rdt_TableCell[data-column-id="${lastVisibleColumnId}"]`
      );
      lastCells.forEach(cell => {
        cell.style.borderRight = '1px solid rgba(0,0,0,0.12)';
      });
      const lastHeader = document.querySelector(
        `${uniqueSelector} .rdt_TableCol[data-column-id="${lastVisibleColumnId}"]`
      );
      if (lastHeader) {
        lastHeader.style.borderRight = '1px solid rgba(0,0,0,0.12)';
      }
    }
  };

  useEffect(() => {
    updateStickyPositions();

    const timeout = setTimeout(() => {
      updateStickyPositions();
    }, 100);

    const table = document.querySelector(uniqueSelector);
    let observer;
    if (table) {
      observer = new MutationObserver(() => {
        updateStickyPositions();
      });
      observer.observe(table, { childList: true, subtree: true });
    }

    return () => {
      if (observer) observer.disconnect();
      clearTimeout(timeout);
    };
  }, [mainLoader, innerLoader, mainData, columnIds, uniqueSelector]);

  return updateStickyPositions;
};

export default useStickyColumns;
