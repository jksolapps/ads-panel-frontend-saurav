/** @format */

import { useContext, useEffect, useRef, useState } from "react";
import { ReportContext } from "../context/ReportContext";
import {
  displayNumber,
  formatTooltipValue,
  formatValue,
  indianNumberFormat,
} from "../utils/helper";

const CustomAccountPagination = ({
  setPageNumber,
  totalRecords,
  rowCount,
  totalDateLength,
  summaryDateWise,
  syncTableRefScroll,
  currentDate,
  datesInArray,
  selectedStartDate,
  selectedEndDate,
  lastDateInDashFormat,
  startDateInDashFormat,
  checkMark,
  totalLength,
  classNameForWidthSting,
  classNameForWidth,
  percentageInfo
}) => {
  const {
    accountType,

  } = useContext(ReportContext);
  const [columnWidth, setColumnWidth] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  function handlePageChange(page) {
    setPageNumber(page);
    // if (pageNumber !== page) {
    //   setIsLoaderVisible(true);
    // }
  }
  const scrollRef = useRef(null);

  const getScrollX = () => {
    if (scrollRef?.current) {
      syncTableRefScroll(scrollRef?.current?.scrollLeft);
    }
  };

  //checking acct type
  let typeIndex = [];
  typeIndex = accountType?.map((value) => value?.type_auto_id);
  useEffect(() => {
    const columnElement = document?.querySelector(
      '.rdt_TableCell[data-column-id="7"]'
    );
    if (columnElement) {
      const newWidth = columnElement?.clientWidth;
      setColumnWidth(newWidth);
    }
  }, [columnWidth]);

  const dateObjects = summaryDateWise.map((obj) => {
    const dateString = Object.keys(obj)[0];
    const [day, month, year] = dateString.split("/");
    return { date: new Date(year, month - 1, day), data: obj[dateString] };
  });

  // Sort the array based on dates (from present date to last date)
  dateObjects.sort((a, b) => b.date - a.date);

  // Reconstruct the sorted array
  const sortedSummaryDateWise = dateObjects.map((item) => {
    const dateString = `${item.date.getDate()}/${item.date.getMonth() + 1
      }/${item.date.getFullYear()}`;
    return { [dateString]: item.data };
  });

  useEffect(() => {
    const elements = document?.querySelectorAll(".total_calculation");
    elements?.forEach((element) => {
      const childDivs = element.querySelectorAll("div");

      // Ensure there are at least three child divs
      // Ensure there are at least three child divs
      if (childDivs?.length >= 3) {
        const firstDiv = childDivs[0];
        const secondDiv = childDivs[1];
        const thirdDiv = childDivs[2];

        if (typeIndex?.length === 0 || typeIndex === undefined) {
          // Apply default behavior if typeIndex is not provided
          firstDiv?.classList?.add("revenue");
          secondDiv?.classList?.add("ecpm");
          thirdDiv?.classList?.add("impressions");
        } else {
          firstDiv?.classList?.add("revenue");
          secondDiv?.classList?.add("ecpm");
          thirdDiv?.classList?.add("impressions");
        }
      } else {
        if (typeIndex?.length === 1) {
          if (typeIndex?.includes("1")) {
            childDivs[0]?.classList?.add("revenue");
          }
          if (typeIndex?.includes("3")) {
            childDivs[0]?.classList?.add("impressions");
          }
        } else {
          childDivs[0]?.classList?.add("revenue");
        }
      }
    });
  }, [summaryDateWise, totalRecords, typeIndex]);
  useEffect(() => {
    const elements = document?.querySelectorAll(".last-month-summary");

    elements?.forEach((element) => {
      const childDivs = element.querySelectorAll("div");

      // Ensure there are at least three child divs
      // Ensure there are at least three child divs
      if (childDivs?.length >= 3) {
        const firstDiv = childDivs[0];
        const secondDiv = childDivs[1];
        const thirdDiv = childDivs[2];

        if (typeIndex?.length === 0 || typeIndex === undefined) {
          // Apply default behavior if typeIndex is not provided
          firstDiv?.classList?.add("revenue");
          secondDiv?.classList?.add("ecpm");
          thirdDiv?.classList?.add("impressions");
        } else {
          firstDiv?.classList?.add("revenue");
          secondDiv?.classList?.add("ecpm");
          thirdDiv?.classList?.add("impressions");
        }
      } else {
        if (typeIndex?.length === 1) {
          if (typeIndex?.includes("1")) {
            childDivs[0]?.classList?.add("revenue");
          }
          if (typeIndex?.includes("3")) {
            childDivs[0]?.classList?.add("impressions");
          }
        } else {
          childDivs[0]?.classList?.add("revenue");
        }
      }
    });
  }, [summaryDateWise, totalRecords, typeIndex]);
  useEffect(() => {
    const elements = document?.querySelectorAll(".this-month-summary");

    elements?.forEach((element) => {
      const childDivs = element.querySelectorAll("div");

      // Ensure there are at least three child divs
      // Ensure there are at least three child divs
      if (childDivs?.length >= 3) {
        const firstDiv = childDivs[0];
        const secondDiv = childDivs[1];
        const thirdDiv = childDivs[2];

        if (typeIndex?.length === 0 || typeIndex === undefined) {
          // Apply default behavior if typeIndex is not provided
          firstDiv?.classList?.add("revenue");
          secondDiv?.classList?.add("ecpm");
          thirdDiv?.classList?.add("impressions");
        } else {
          firstDiv?.classList?.add("revenue");
          secondDiv?.classList?.add("ecpm");
          thirdDiv?.classList?.add("impressions");
        }
      } else {
        if (typeIndex?.length === 1) {
          if (typeIndex?.includes("1")) {
            childDivs[0]?.classList?.add("revenue");
          }
          if (typeIndex?.includes("3")) {
            childDivs[0]?.classList?.add("impressions");
          }
        } else {
          childDivs[0]?.classList?.add("revenue");
        }
      }
    });
  }, [summaryDateWise, totalRecords, typeIndex]);
  useEffect(() => {
    const elements = document?.querySelectorAll(".datewise-summary");

    elements?.forEach((element) => {
      const childDivs = element.querySelectorAll("div");
      // Ensure there are at least three child divs
      // Ensure there are at least three child divs
      if (childDivs?.length >= 3) {
        const firstDiv = childDivs[0];
        const secondDiv = childDivs[1];
        const thirdDiv = childDivs[2];

        if (typeIndex?.length === 0 || typeIndex === undefined) {
          // Apply default behavior if typeIndex is not provided
          firstDiv?.classList?.add("revenue");
          secondDiv?.classList?.add("ecpm");
          thirdDiv?.classList?.add("impressions");
        } else {
          firstDiv?.classList?.add("revenue");
          secondDiv?.classList?.add("ecpm");
          thirdDiv?.classList?.add("impressions");
        }
      } else {
        if (typeIndex?.length === 1) {
          if (typeIndex?.includes("1")) {
            childDivs[0]?.classList?.add("revenue");
          }
          if (typeIndex?.includes("3")) {
            childDivs[0]?.classList?.add("impressions");
          }
        } else {
          childDivs[0]?.classList?.add("revenue");
        }
      }
    });
  }, [summaryDateWise, totalRecords, typeIndex]);


  let cssClass = "";
  let percentageValue = 0;
  const impressionData = totalRecords[1]?.Impressions;
  const revenueData = totalRecords[0]?.Revenue;
  const currentImpressionValue = impressionData?.this_month;
  const previousImpressionValue = impressionData?.last_month;

  const currentrevenueDataValue = revenueData?.this_month;
  const previousrevenueDataValue = revenueData?.last_month;
  if (typeIndex?.includes("3")) {

    if (previousImpressionValue !== 0 && previousImpressionValue !== null) {
      percentageValue = ((currentImpressionValue) / Math.abs(previousImpressionValue)) * 100;
    } else {
      percentageValue = currentImpressionValue === 0 ? 0 : 100;
    }
    if (
      currentImpressionValue - previousImpressionValue >= 5000 ||
      currentImpressionValue - previousImpressionValue <= -5000
    ) {
      if (percentageValue >= 50) {
        cssClass += " impression-increase";
      }
    }
  } else if (typeIndex?.includes("1")) {

    if (previousrevenueDataValue !== 0 && previousrevenueDataValue !== null) {
      percentageValue = ((currentrevenueDataValue) / Math.abs(previousrevenueDataValue)) * 100;
    } else {
      percentageValue = currentrevenueDataValue === 0 ? 0 : 100;
    }
    if (
      currentrevenueDataValue - previousrevenueDataValue >= 10 ||
      currentrevenueDataValue - previousrevenueDataValue <= -10
    ) {
      if (percentageValue >= 10) {
        cssClass += " revenue-increase";
      }
    }
  }
  return (
    <>
      {rowCount !== 1 && (
        <div className={`${classNameForWidthSting} custom-account-pagination`}>
        </div>
      )}
    </>
  );
};

export default CustomAccountPagination;
