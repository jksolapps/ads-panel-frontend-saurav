import { useEffect } from 'react';

export function useTableHover(deps = null, uniqueIdentifier = "") {
   useEffect(() => {
      const table = document.querySelector(`${uniqueIdentifier} .rdt_Table`);
      if (!table) return;

      function handleMouseOver(e) {
         const cell = e.target.closest(`${uniqueIdentifier} .rdt_TableCell`);
         if (!cell) return;

         const row = cell.parentNode;
         const cells = Array.from(row.children);
         const cellIndex = cells.indexOf(cell);
         if (cellIndex === -1) return;

         // Highlight column cells in body
         document
            .querySelectorAll(`${uniqueIdentifier} .rdt_TableRow`)
            .forEach(row => {
               const targetCell = row.children[cellIndex];
               if (targetCell) targetCell.classList.add('hovered_column');
            });

         // Highlight header cell
         const headerRow = document.querySelector(`${uniqueIdentifier} .rdt_TableHeadRow`);
         if (headerRow) {
            const headerCell = headerRow.children[cellIndex];
            if (headerCell) headerCell.classList.add('hovered_column');
         }
      }

      function handleMouseOut() {
         document
            .querySelectorAll(`${uniqueIdentifier} .hovered_column`)
            .forEach(cell => {
               cell.classList.remove('hovered_column');
            });
      }

      table.addEventListener('mouseover', handleMouseOver);
      table.addEventListener('mouseout', handleMouseOut);

      return () => {
         table.removeEventListener('mouseover', handleMouseOver);
         table.removeEventListener('mouseout', handleMouseOut);
      };
   }, [deps]);
}
