/** @format */

import { useContext, useEffect, useRef, useState } from 'react';
import ResponsivePagination from 'react-responsive-pagination';
import { ReportContext } from '../context/ReportContext';
import { DataContext } from '../context/DataContext';
const CustomReportPagination = ({
	Data,
	pageNumber,
	paginationList,
	setPageNumber,
	syncTableRefScroll,
	finalMatrix,
	dimensionMatrix,
	setIsLoaderVisible,
}) => {
	function handlePageChange(page) {
		setPageNumber(page);
		// setToggleResize(true)
		setIsLoaderVisible(true);
		setTimeout(() => {
			setIsLoaderVisible(false);
		}, 400);
	}

	return (
		<>
			{paginationList > 1 && (
				<ResponsivePagination
					className='custom_pagination'
					total={paginationList}
					current={pageNumber}
					onPageChange={(page) => handlePageChange(page)}
					maxWidth={150}
					previousLabel='Prev'
					nextLabel='Next'
				/>
			)}
		</>
	);
};

export default CustomReportPagination;
