/** @format */

import ResponsivePagination from 'react-responsive-pagination';
const CustomAnalyticsPagination = ({
	pageNumber,
	paginationList,
	setPageNumber,
	setIsLoaderVisible,
}) => {
	function handlePageChange(page) {
		setPageNumber(page);
		if (page !== pageNumber) {
			setIsLoaderVisible(true);
			setTimeout(() => {
				setIsLoaderVisible(false);
			}, 400);
		}
	}
	return (
		<>
			{paginationList > 1 && (
				<ResponsivePagination
					className='custom_pagination'
					total={paginationList}
					current={pageNumber}
					onPageChange={(page) => handlePageChange(page)}
					maxWidth={10}
					previousLabel='Prev'
					nextLabel='Next'
				/>
			)}
		</>
	);
};

export default CustomAnalyticsPagination;
