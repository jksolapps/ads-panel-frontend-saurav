/** @format */

import ResponsivePagination from 'react-responsive-pagination';

const PaginationWithLength = ({uniqueIdentifier = "", pageNumber, setPageNumber, totalPages, setIsLoaderVisible }) => {

   function handlePageChange(page) {
      setPageNumber(page);
      if (pageNumber !== page) {
         if (uniqueIdentifier=== "user_country") return;
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

export default PaginationWithLength;
