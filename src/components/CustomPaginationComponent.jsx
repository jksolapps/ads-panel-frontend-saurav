/** @format */

import ResponsivePagination from 'react-responsive-pagination';

const CustomPaginationComponent = ({
	pageNumber,
	paginationList,
	setPageNumber,
	setIsLoaderVisible,
}) => {
	function handlePageChange(page) {
		setPageNumber(page);
		if (pageNumber !== page) {
			setIsLoaderVisible(true);
		}
	}
	return (
		<>
			{paginationList?.length > 1 && (
				<ResponsivePagination
					className='custom_pagination'
					total={paginationList?.length}
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

export default CustomPaginationComponent;
