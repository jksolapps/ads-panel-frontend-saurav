/** @format */

import React from 'react';
import ResponsivePagination from 'react-responsive-pagination';

const CustomUnitPagination = ({
  setCurrentUnitPage,
  currentUnitPage,
  totalUnitPage,
}) => {

  function handlePageChange(page) {
    setCurrentUnitPage(page);
  }
  return (
    <>
      {totalUnitPage > 1 && (
        <ResponsivePagination
          className='custom_pagination'
          total={totalUnitPage}
          current={currentUnitPage}
          onPageChange={(page) => handlePageChange(page)}
          maxWidth={150}
          previousLabel='Prev'
          nextLabel='Next'
        />
      )}
    </>
  );
};

export default CustomUnitPagination;
