/** @format */

import React, { useContext, useEffect } from "react";
import { FaCaretDown } from "react-icons/fa";
import { RiArrowRightSFill } from "react-icons/ri";
import { ReportContext } from "../../../context/ReportContext";
import { IoAdd } from "react-icons/io5";

const FirstColumnFilter = ({
   uniqueIdentifier,
   setIsLoaderVisible,
   availableFilters,
   firstColumnDimension,
   setFirstColumnDimension,
   secondColumnDimension,
   setSecondColumnDimension,
   isOpen,
   setIsOpen,
   secondIsOpen,
   setSecondIsOpen,
   fetchFlag,
   setFetchFlag,
   isSingleAppSelected = true
}) => {
   const { setToggleResizeAnalytics } = useContext(ReportContext);

   const toggleDropdown = (e) => {
      if (!isSingleAppSelected) return
      e.stopPropagation();
      setIsOpen(!isOpen);
      setSecondIsOpen(false);
   };

   const togglePlus = (e) => {
      e.stopPropagation();
      setSecondIsOpen(!secondIsOpen);
      setIsOpen(false);
   };

   const handleFirstColumn = (filter) => {
      setFirstColumnDimension(filter.api_Value);
      sessionStorage.setItem(uniqueIdentifier + '_first_column', filter.api_Value)
      setIsLoaderVisible(true);
      setToggleResizeAnalytics(true);
      setIsOpen(false);
      setFetchFlag(!fetchFlag);
   };

   const handleSecondColumn = (filter) => {
      setSecondColumnDimension(filter.api_Value);
      sessionStorage.setItem(uniqueIdentifier + '_extra_column', filter.api_Value)
      // setIsLoaderVisible(true);
      setToggleResizeAnalytics(true);
      setSecondIsOpen(false);
      setFetchFlag(!fetchFlag);
   };

   const columnDropdown = availableFilters?.filter((filter) => {
      if (
         filter.api_Value === firstColumnDimension ||
         filter.api_Value === secondColumnDimension
      ) {
         return false;
      }
      return true;
   });

   useEffect(() => {
      const handleClickOutside = (event) => {
         const dimensionColumn = document.querySelector(".dimension-column");

         if (!dimensionColumn || !dimensionColumn.contains(event.target)) {
            setIsOpen(false);
            setSecondIsOpen(false);
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [setIsOpen]);

   //column name
   const firstColumnName = availableFilters?.find(
      (item) => item?.api_Value === firstColumnDimension
   )?.key;

   return (
      <div style={{ display: "inline-block" }} onClick={(e) => e.stopPropagation}>
         <span onClick={toggleDropdown}>
            <span
               className="report_column_title report-header-dimension"
               style={{ cursor: "pointer", marginRight: "5px" }}
            >
               {firstColumnName}
            </span>
            {(isSingleAppSelected) && <button
               style={{
                  backgroundColor: "white",
                  padding: "0px 0px",
                  cursor: "pointer",
                  fontSize: "14px",
                  borderRadius: "4px",
                  color: "black",
                  float: "none",
               }}
            >
               <FaCaretDown />
            </button>}
         </span>

         {(!secondColumnDimension && isSingleAppSelected) && (
            <button
               onClick={togglePlus}
               style={{
                  backgroundColor: "white",
                  padding: "0px 0px",
                  cursor: "pointer",
                  fontSize: "14px",
                  borderRadius: "4px",
                  color: "black",
                  float: "right",
               }}
            >
               <IoAdd className="custom_column_icon" />
            </button>
         )}

         {isOpen && (
            <div
               style={{
                  position: "absolute",
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
                  borderRadius: "6px",
                  zIndex: 1000,
                  marginTop: "8px",
               }}
               className="main-dimension-filter-box"
            >
               <div
                  className={`dimension-filter-box`}

                  onClick={(e) => {
                     e.stopPropagation();
                  }}
               >
                  <div
                     style={{ width: "170px" }}
                     onClick={(e) => {
                        e.stopPropagation();
                     }}
                  >
                     {columnDropdown?.length > 0 ? (
                        columnDropdown?.map((filter) => (
                           <div
                              key={filter.key}
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleFirstColumn(filter);
                              }}
                              className={`category-item`}
                              style={{
                                 fontWeight: "bold",
                                 cursor: "pointer",
                                 padding: "10px",
                              }}
                           >
                              <div
                                 className="category-list"
                                 style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                 }}
                              >
                                 <div>{filter.key}</div>
                                 {filter.value && (
                                    <div className="right-icon-arrow">
                                       <RiArrowRightSFill />
                                    </div>
                                 )}
                              </div>
                           </div>
                        ))
                     ) : (
                        <div style={{ padding: "10px", color: "#aaa" }}>
                           No results found
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}

         {secondIsOpen && (
            <div className="second-column-btn-inner">
               <div
                  className="dimension-filter-box"
                  onClick={(e) => {
                     e.stopPropagation();
                  }}
               >
                  <div
                     style={{ width: "170px" }}
                     onClick={(e) => {
                        e.stopPropagation();
                     }}
                  >
                     {columnDropdown?.length > 0 ? (
                        columnDropdown?.map((filter) => (
                           <div
                              key={filter.key}
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleSecondColumn(filter);
                              }}
                              className={`category-item ${!isSingleAppSelected ? 'disable_item' : ''}`}
                              style={{
                                 fontWeight: "bold",
                                 cursor: "pointer",
                                 padding: "10px",
                              }}
                           >
                              <div
                                 className={`category-list`}
                                 style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                 }}
                              >
                                 <div>{filter.key}</div>
                                 {filter.value && (
                                    <div className="right-icon-arrow">
                                       <RiArrowRightSFill />
                                    </div>
                                 )}
                              </div>
                           </div>
                        ))
                     ) : (
                        <div style={{ padding: "10px", color: "#aaa" }}>
                           No results found
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default FirstColumnFilter;
