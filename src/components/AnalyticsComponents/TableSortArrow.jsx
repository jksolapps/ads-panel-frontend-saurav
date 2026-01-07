
import React from 'react';
import { ReactComponent as TableSortDownArrow } from "../../assets/images/arrow-dwon.svg";
import { ReactComponent as TableSortUpArrow } from "../../assets/images/arrow-up.svg";

const TableSortArrow = ({ direction }) => {
    if (!direction) {
        return <TableSortUpArrow className="coutry-table-sort" style={{ opacity: '0.5', cursor: 'pointer' }} />; // Default state when not sorted
    }
    if (direction === 'ascending') {
        return <TableSortUpArrow className="coutry-table-sort" style={{ cursor: 'pointer' }} />; // Up arrow for ascending order
    }
    if (direction === 'descending') {
        return <TableSortDownArrow className="coutry-table-sort" style={{ cursor: 'pointer' }} />; // Down arrow for descending order
    }
    return null;
};

export default TableSortArrow