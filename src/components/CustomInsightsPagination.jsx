/** @format */

import ResponsivePagination from "react-responsive-pagination";
const CustomInsightsPagination = ({ pageNumber, paginationList, setPageNumber, setIsLoaderVisible, itemsPerPage, setItemsPerPage, rowCount, columns, footerTotals }) => {
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
    <div className="custom-pagination-wrapper">
      {/* <div className="table-footer">
        {columns.map((column, index) => (
          <div
            key={index}
            className="table-footer-cell"
            style={{
              width: column.width || column.minWidth || "auto",
              textAlign: column.right ? "right" : column.center ? "center" : "left",
            }}
          >
            {index === 0 ? "Total" : index === 1 || column.name === "D1 Retention" ? "" : footerTotals[column.selector?.name] || "0"}
          </div>
        ))}
      </div> */}

      {paginationList > 1 && (
        <ResponsivePagination
          className="custom_pagination"
          total={paginationList}
          current={pageNumber}
          onPageChange={(page) => handlePageChange(page)}
          maxWidth={10}
          previousLabel="Prev"
          nextLabel="Next"
        />
      )}
    </div>
  );
};

export default CustomInsightsPagination;
