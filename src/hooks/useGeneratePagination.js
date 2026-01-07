/** @format */

function useGeneratePagination(totalPages) {
	const paginationLinks = [];
	const totalPagesIndex = Math.ceil(totalPages);
	for (let i = 0; i < totalPagesIndex; i++) {
		paginationLinks.push(i);
	}
	return paginationLinks;
}

export default useGeneratePagination;
