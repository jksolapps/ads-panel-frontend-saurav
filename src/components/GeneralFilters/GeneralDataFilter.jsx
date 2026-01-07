/** @format */
/** @format */

import React, { useState, useEffect } from "react";
import { MdClose, MdSearch } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";
import { IoIosCloseCircleOutline } from "react-icons/io";
import useSelectAll from "../../hooks/useSelectAll";
import EmptyListBox from "../GeneralComponents/EmptyListBox";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/Popover";
const GeneralDataFilter = ({
  uniqueIdentifier,
  className = "",
  filterPopupData,
  finalSelectData,
  setFinalSelectData,
  setIsLoaderVisible = () => {},
  fetchFlag = false,
  setFetchFlag = () => {},
  filterName,
}) => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [checkedItem, setCheckedItem] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (filterPopupData?.length > 0) {
      const initialAppData = filterPopupData.map((v, index) => {
        return {
          ...v,
          item_checked: false,
        };
      });
      const localData = JSON.parse(
        sessionStorage.getItem(`${uniqueIdentifier}_filter`)
      );
      initialAppData.forEach((item) => {
        const isChecked = localData?.some((ele) => ele.item_id == item.item_id);
        item.item_checked = isChecked;
      });
      setFinalSelectData(initialAppData?.filter((item) => item.item_checked));
      setAllData(initialAppData);
      setFilteredData(initialAppData);
    } else {
      setFilteredData([]);
      setAllData([]);
    }
  }, [filterPopupData]);

  useEffect(() => {
    setCheckedItem(allData?.filter((item) => item.item_checked));
  }, [allData, filteredData]);

  const handleCheckboxChange = (app, index) => {
    const updatedFilteredData = filteredData.map((item) =>
      item?.item_id === app?.item_id
        ? { ...item, item_checked: !item.item_checked }
        : item
    );
    setFilteredData(updatedFilteredData);
    setCheckedItem(updatedFilteredData?.filter((item) => item.item_checked));
    const updatedAllData = allData.map((item) =>
      item.item_id === updatedFilteredData[index].item_id
        ? { ...updatedFilteredData[index] }
        : { ...item }
    );
    setAllData(updatedAllData);
  };
  const handleApply = (e, close) => {
    e.preventDefault();
    setSearchText("");
    setFilteredData(allData);
    setIsLoaderVisible(true);
    setFinalSelectData(checkedItem);
    sessionStorage.setItem(
      uniqueIdentifier + "_filter",
      JSON.stringify(checkedItem)
    );
    setFetchFlag(!fetchFlag);
    close();
  };
  const handleClose = (item) => {
    const updatedApp = allData?.map((app) =>
      app.item_id === item.item_id
        ? { ...app, item_checked: !app.item_checked }
        : app
    );
    setAllData(updatedApp);
    setFilteredData(updatedApp);
  };
  const handleClear = () => {
    const resetData = filteredData?.map((v) => ({
      ...v,
      item_checked: false,
    }));
    const resetDataForAll = allData?.map((v) => ({
      ...v,
      item_checked: false,
    }));
    setAllData(resetDataForAll);
    setFilteredData(resetData);
  };
  const handleSearch = (e) => {
    const searchText = e.target.value.toLowerCase();
    const originalText = e.target.value;
    setSearchText(originalText);
    const updatedFilteredData = allData.filter((item) =>
      item.item_name.toLowerCase().includes(searchText)
    );

    setFilteredData(updatedFilteredData);
  };

  //Select all
  const { areAllCheckedIn, handleSelectAll } = useSelectAll({
    allItemData: allData,
    filterItemData: filteredData,
    setAllItemData: setAllData,
    setAllFilterData: setFilteredData,
    uniqueId: "item_id",
  });

  return (
    <Popover
      className={`check-wrapper column-filter general_data_filter ${className}`}
    >
      <PopoverTrigger>
        <a
          className={
            finalSelectData?.length > 0
              ? "popover_filter filter-btn btn-active"
              : "popover_filter filter-btn"
          }
        >
          <span>{filterName}</span>
          {finalSelectData?.length > 0 ? (
            <>
              <ul className="selected-item">
                <li className="selected-item-value">:</li>
                {finalSelectData
                  ?.map((item) => {
                    return item?.item_name || item?.name;
                  })
                  ?.slice(0, 2)
                  ?.map((item, index) => (
                    <li className="selected-item-value" key={index}>
                      {item}{" "}
                    </li>
                  ))}
                {finalSelectData?.length > 2 && (
                  <span>+{finalSelectData?.length - 2} more </span>
                )}
              </ul>
            </>
          ) : null}
        </a>
      </PopoverTrigger>

      <PopoverContent>
        {({ close }) => (
          <div className="checkbox_popover full-and-multi-filter " id="Lorems">
            <div className="filter-title-box">
              <span className="predicate-field-label">{filterName}</span>
              <a className="close-filter" onClick={close}>
                <MdClose className="material-icons" />
              </a>
            </div>
            <div className="check-boxes-inner">
              <div className="left-check-box box2 campaign-left-box">
                <div className="search-input">
                  <div className="box">
                    <input
                      className="input search-btn-input focus-border"
                      onChange={handleSearch}
                      value={searchText}
                      required
                      placeholder="Search"
                      autoComplete="off"
                    />
                    <a
                      className="clear-icon-btn i-btn"
                      onClick={() => {
                        setSearchText("");
                        setFilteredData(allData);
                      }}
                    >
                      <IoCloseOutline className="material-icons" />
                    </a>
                    <a className="search-icon-btn i-btn">
                      <MdSearch className="material-icons" />
                    </a>
                    <div className="border-active"></div>
                  </div>
                </div>
                <div className="all-select-row">
                  <form onSubmit={(e) => handleApply(e, close)}>
                    {filteredData?.length === 0 ? (
                      <div className="noResult">
                        <p>No Result Found</p>
                      </div>
                    ) : (
                      <>
                        <div className="box-check">
                          <label>
                            <input
                              type="checkbox"
                              className="ckkBox val"
                              checked={areAllCheckedIn()}
                              onChange={(event) => handleSelectAll(event)}
                            />
                            <span className="search-title">Select All</span>
                          </label>
                        </div>
                        {filteredData?.map((app, index) => (
                          <div className="box-check" key={index}>
                            <label>
                              <input
                                type="checkbox"
                                name={app?.item_id}
                                value={app?.item_name}
                                className="ckkBox val"
                                checked={app.item_checked || ""}
                                onChange={() =>
                                  handleCheckboxChange(app, index)
                                }
                              />
                              <div className="label-container">
                                <div className="primary-label-wrap">
                                  <div
                                    title={app?.item_name}
                                    className="primary-label"
                                  >
                                    {app?.item_name || app?.name}
                                  </div>
                                </div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </>
                    )}
                    <div className="apply-btn-wrap text-right">
                      <button type="submit" className="apply-btn">
                        Apply
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="right-result-box box2">
                <div className="none-selected-text">
                  <span></span>
                  <a className="custom-clear-all" onClick={handleClear}>
                    Clear all
                  </a>
                </div>
                <div className="right-result-row">
                  {checkedItem?.length === 0 && <EmptyListBox />}
                  {checkedItem?.map((item, index) => (
                    <div
                      className="result-box"
                      key={index}
                      onClick={() => handleClose(item)}
                    >
                      <span>
                        <span>{item?.item_name}</span>
                      </span>
                      <a className="result-cancel-btn i-btn">
                        <IoIosCloseCircleOutline className="material-icons" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default GeneralDataFilter;
