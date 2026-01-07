import { useEffect, useRef, useState } from 'react';

const useStickyResizableColumns = ({
   tableSelector,
   columnIds = [],
   columnWidths = {},
   tableToggleResize,
   mainData = [],
   isZ_Index = false,
   uniqueSelector = ''
}) => {
   const tableRef = useRef(null);
   const [isResizing, setIsResizing] = useState(false);
   const [startX, setStartX] = useState(0);
   const [startWidth, setStartWidth] = useState(0);
   const [currentColumnId, setCurrentColumnId] = useState(null);

   const getColumnOffset = (idIndexMap, index, widthMap) => {
      return idIndexMap.slice(0, index).reduce((sum, id) => {
         const el = document.querySelector(`${uniqueSelector} .rdt_TableCol[data-column-id="${id}"]`);
         return sum + (el?.offsetWidth || widthMap[id] || widthMap.default || 100);
      }, 0);
   };

   const updateStickyPositions = () => {
      const idIndexMap = columnIds;
      columnIds.forEach((id, index) => {
         const offsetLeft = getColumnOffset(idIndexMap, index, columnWidths);

         const header = document.querySelector(`${uniqueSelector} .rdt_TableCol[data-column-id="${id}"]`);
         if (header) {
            header.style.position = "sticky";
            header.style.left = `${offsetLeft}px`;
            header.style.backgroundColor = "#fff";
            if (isZ_Index) {
               header.style.setProperty('z-index', `${columnIds.length - index + 1}`, 'important');
            }
         }

         const cells = document.querySelectorAll(`${uniqueSelector} .rdt_TableCell[data-column-id="${id}"]`);
         cells.forEach(cell => {
            cell.style.position = "sticky";
            cell.style.left = `${offsetLeft}px`;
            if (isZ_Index) {
               cell.style.setProperty('z-index', `${columnIds.length - index + 1}`, 'important');
            }
         });
      });
   };

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
               setIsResizing(true);
               setStartX(e.clientX);
               setStartWidth(elementWidth);
               setCurrentColumnId(columnId);
            }
         }
      };

      const onMouseMove = (e) => {
         if (!isResizing || !currentColumnId) return;

         let newWidth = startWidth + (e.clientX - startX);
         const minColumnWidth = columnWidths[currentColumnId] || columnWidths.default || 100;
         newWidth = Math.max(newWidth, minColumnWidth);

         const header = tableRef.current.querySelector(
            `${tableSelector} .rdt_TableCol[data-column-id='${currentColumnId}']`
         );
         const cells = tableRef.current.querySelectorAll(
            `${tableSelector} .rdt_TableCell[data-column-id='${currentColumnId}']`
         );

         if (header) {
            header.style.setProperty('width', `${newWidth}px`, 'important');
            header.style.setProperty('min-width', `${newWidth}px`, 'important');
            header.style.setProperty('max-width', `${newWidth}px`, 'important');
         }

         cells.forEach((cell) => {
            cell.style.setProperty('width', `${newWidth}px`, 'important');
            cell.style.setProperty('min-width', `${newWidth}px`, 'important');
            cell.style.setProperty('max-width', `${newWidth}px`, 'important');
         });

         // Do not call updateStickyPositions here – only at mouseUp
      };

      const onMouseUp = () => {
         if (isResizing) {
            setIsResizing(false);
            setCurrentColumnId(null);
            updateStickyPositions(); // ✅ only reflow at the end
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
      };
   }, [isResizing, startX, startWidth, currentColumnId, tableSelector, mainData]);

   useEffect(() => {
      updateStickyPositions();
   }, [mainData]);

   return tableRef;
};

export default useStickyResizableColumns;
