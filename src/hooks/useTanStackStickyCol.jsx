import { useEffect } from 'react';

const useTanStackStickyColumns = ({ table, tableSelector, columnIds, dataDeps = [] }) => {
   useEffect(() => {
      if (!table || !columnIds?.length) return;

      // Calculate left offsets for sticky columns
      let leftOffsets = [];
      let acc = 0;
      columnIds.forEach((colId, idx) => {
         const col = table.getAllLeafColumns().find(c => c.id === colId || c.accessorKey === colId);
         const width = col?.getSize?.() || 0;
         leftOffsets[idx] = acc;
         acc += width;
      });

      // Apply sticky styles to header and body cells
      columnIds.forEach((colId, idx) => {
         // Header
         const headerCell = document.querySelector(
            `${tableSelector} th[data-column-id='${colId}']`
         );
         if (headerCell) {
            headerCell.style.position = 'sticky';
            headerCell.style.left = `${leftOffsets[idx]}px`;
            headerCell.style.background = '#fff';
            headerCell.style.zIndex = 2;
         }
         // Body cells
         const bodyCells = document.querySelectorAll(
            `${tableSelector} td[data-column-id='${colId}']`
         );
         bodyCells.forEach(cell => {
            cell.style.position = 'sticky';
            cell.style.left = `${leftOffsets[idx]}px`;
            cell.style.background = '#fff';
            cell.style.zIndex = 1;
         });
      });

      // Add right border to the last sticky column
      const lastColId = columnIds[columnIds.length - 1];
      if (lastColId) {
         const lastHeader = document.querySelector(
            `${tableSelector} th[data-column-id='${lastColId}']`
         );
         if (lastHeader) lastHeader.style.borderRight = '1px solid #e5e7eb';
         const lastBodyCells = document.querySelectorAll(
            `${tableSelector} td[data-column-id='${lastColId}']`
         );
         lastBodyCells.forEach(cell => {
            cell.style.borderRight = '1px solid #e5e7eb';
         });
      }

      // Cleanup: remove sticky styles on unmount or deps change
      return () => {
         columnIds.forEach((colId) => {
            const headerCell = document.querySelector(
               `${tableSelector} th[data-column-id='${colId}']`
            );
            if (headerCell) {
               headerCell.style.position = '';
               headerCell.style.left = '';
               headerCell.style.background = '';
               headerCell.style.zIndex = '';
               headerCell.style.borderRight = '';
            }
            const bodyCells = document.querySelectorAll(
               `${tableSelector} td[data-column-id='${colId}']`
            );
            bodyCells.forEach(cell => {
               cell.style.position = '';
               cell.style.left = '';
               cell.style.background = '';
               cell.style.zIndex = '';
               cell.style.borderRight = '';
            });
         });
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [table, tableSelector, JSON.stringify(columnIds), ...dataDeps]);
};

export default useTanStackStickyColumns;