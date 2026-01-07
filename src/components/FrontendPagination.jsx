/** @format */

import ResponsivePagination from 'react-responsive-pagination';

const FrontendPagination = ({ pageNumber, totalPages, setPageNumber, setIsLoaderVisible }) => {

	function handlePageChange(page) {
		setPageNumber(page);
		if (pageNumber !== page) {
			setIsLoaderVisible(true);
			setTimeout(() => {
				setIsLoaderVisible(false);
			}, 400);
		}
	}
	return (
		<>
			{totalPages > 1 && (
				<ResponsivePagination
					className='custom_pagination'
					total={totalPages}
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

export default FrontendPagination;
