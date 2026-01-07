import React, { useEffect, useState } from "react";
import Profile from "../../assets/images/profile.png";
import { MdHelpOutline } from "react-icons/md";
import { GrFilter } from "react-icons/gr";
import DataTable from "react-data-table-component";
import { MdDownload, MdTableChart } from "react-icons/md";
import { RiArrowDownSFill } from "react-icons/ri";

const IssuesContentBox = (props) => {
  const columns = [
    {
      name: "App",
      selector: (row) => row["increment_id"],
      sortable: false,
      width: "100px",
      cell: (row) => (
        <div
          className="custom-column"
          onDoubleClick={() => handleAccEdit(row?.admob_pub_id)}
        >
          {row.increment_id}
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row) => row["admob_email"],
      sortable: true,
      cell: (row) => (
        <div
          className="custom-column"
          onDoubleClick={() => handleAccEdit(row?.admob_pub_id)}
        >
          -
        </div>
      ),
    },
    {
      name: "Issues",
      selector: (row) => row["admob_email"],
      sortable: true,
      cell: (row) => (
        <div
          className="custom-column"
          onDoubleClick={() => handleAccEdit(row?.admob_pub_id)}
        >
          {row.admob_email}
        </div>
      ),
    },
    {
      name: "Add request last 7 days",
      selector: (row) => row["admob_pub_id"],
      sortable: true,
      cell: (row) => (
        <div
          className="custom-column"
          onDoubleClick={() => handleAccEdit(row?.admob_pub_id)}
        >
          {row.admob_pub_id}
        </div>
      ),
    },
    {
      name: "Data reported",
      selector: (row) => row["admob_updated_at"],
      cell: (row) => (
        <div
          className="custom-column"
          onDoubleClick={() => handleAccEdit(row?.admob_pub_id)}
        >
          {row.admob_updated_at}
        </div>
      ),
      sortable: true,
      width: "300px",
    },
    {
      name: "Action",
      selector: (row) => row["admob_pub_id"],
      width: "200px",
      cell: (account) => {
        return (
          <button
            className="d-content-btn table-btn bg-btn d-inline-block float-none ml-0"
            onDoubleClick={() => handleAccEdit(account?.admob_pub_id)}
          >
            edit
          </button>
        );
      },
      sortable: false,
    },
  ];

  const Data = [
    {
      app: "app",
      status: "status",
      Issues: "Issues",
      Ad_request: "AdRequest",
      date_reported: "date_reported",
      action: "action",
    },
  ];
  const [isSwitch, setIsSwitch] = useState(true);

  // const exportToCSV = () => {
  //   const modifiedData = tableNewData.aaData?.map(
  //     ({ app_icon, ...rest }) => rest
  //   );
  //   const csv = Papa.unparse(modifiedData);
  //   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  //   FileSaver.saveAs(blob, `report.csv`);
  // };

  useEffect(() => {
    const numb = document.querySelector(".numb");
    let counter = 0;
    setInterval(() => {
      if (counter == 100) {
        clearInterval();
      } else {
        counter += 1;
        numb.textContent = counter + "%";
      }
    }, 80);
  });

  return (
    <div className="policy">
      <div className="main-box-row info-box-wrap policy-content">
        <div className="box-wrapper">
          <div className="box two-column">
            <div className="column">
              <div className="apps-affected">
                <div className="title-stats">
                  <div className="stats-header">Total</div>
                  <div className="stats-number">1</div>
                  <div className="stats-footer">Apps affected</div>
                </div>
                <div className="stats">
                  <div className="badge  bg-danger-subtle text-danger stats-badge Must-fix-font">
                    Must fix
                  </div>
                  <div className="tooltip-row tooltip-margin">
                    <MdHelpOutline className="help_icon" />
                    <div className="tooltip-box">
                      <div className="content-container">
                        <h4>Estimated earnings</h4>
                        <p>
                          Your earnings accrued so far. This amount is an
                          estimate that is subject to change when your earnings
                          are verified for accuracy at the end of every month.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="stats-number">0%</div>
                  <div className="stats-footer">Apps affected</div>
                </div>
                <div className="stats">
                  <div className="stats-header">
                    Disable ad serving
                    <div className="tooltip-row tooltip-margin">
                      <MdHelpOutline className="help_icon" />
                      <div className="tooltip-box">
                        <div className="content-container">
                          <h4>Estimated earnings</h4>
                          <p>
                            Your earnings accrued so far. This amount is an
                            estimate that is subject to change when your
                            earnings are verified for accuracy at the end of
                            every month.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="stats-flex">
                    <div className="box-bar">
                      <div className="top-circular">
                        <svg
                          className="circular-progress"
                          width="90"
                          height="90"
                          viewBox="0 0 90 90"
                        >
                          <circle className="bg"></circle>
                          <circle className="fg"></circle>
                        </svg>
                      </div>
                    </div>
                    <div className="stats-details">
                      <div className="numb stats-number">1%</div>
                      <div className="stats-footer">Apps affected</div>
                    </div>
                  </div>
                </div>
                <div className="stats">
                  <div className="class 2">
                    <div className="stats-header">
                      Restricted ad serving
                      <div className="tooltip-row tooltip-margin">
                        <MdHelpOutline className="help_icon" />
                        <div className="tooltip-box">
                          <div className="content-container">
                            <h4>Estimated earnings</h4>
                            <p>
                              Your earnings accrued so far. This amount is an
                              estimate that is subject to change when your
                              earnings are verified for accuracy at the end of
                              every month.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="stats-flex">
                      <div className="box-bar">
                        <div className="top-circular">
                          <svg
                            className="circular-progress"
                            width="90"
                            height="90"
                            viewBox="0 0 90 90"
                          >
                            <circle className="bg"></circle>
                            <circle className="fg"></circle>
                          </svg>
                        </div>
                      </div>
                      <div className="stats-details">
                        <div className="numb stats-number">99%</div>
                        <div className="stats-footer">99k ad requests</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="column">
              <div className="ad-requests">
                <div className="stats-header">
                  Regular ad serving
                  <div className="tooltip-row tooltip-margin">
                    <MdHelpOutline className="help_icon" />
                    <div className="tooltip-box">
                      <div className="content-container">
                        <h4>Estimated earnings</h4>
                        <p>
                          Your earnings accrued so far. This amount is an
                          estimate that is subject to change when your earnings
                          are verified for accuracy at the end of every month.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="stats-flex">
                  <div className="box-bar">
                    <div className="top-circular">
                      <svg
                        className="circular-progress"
                        width="90"
                        height="90"
                        viewBox="0 0 90 90"
                      >
                        <circle className="bg"></circle>
                        <circle className="fg"></circle>
                      </svg>
                    </div>
                  </div>
                  <div className="stats-details">
                    <div className="numb stats-number">1%</div>
                    <div className="stats-footer">1K ad requests</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="box two-column d-flex ">
            <div className="me-auto second-row">
              <div className="policy-pg-filter">
                <GrFilter />
                <div className="filter-area">Add Filter</div>
              </div>
            </div>
            <div className="more-button policy-csv">
              <div className="policy-download-btn">Download CSV</div>
              <RiArrowDownSFill className="down-arrow" />
              <div className="more-box w-250">
                <a>
                  <span className="material-icons">
                    <MdTableChart />
                  </span>
                  {!isSwitch ? "Hide Table" : "Show Table"}
                  <label className="switch" htmlFor="checkbox">
                    <input
                      type="checkbox"
                      id="checkbox"
                      value={isSwitch}
                      onChange={() => setIsSwitch(!isSwitch)}
                    />
                    <div className="slider round"></div>
                  </label>
                </a>
                <div className="border-box">
                  <a
                  // onClick={exportToCSV}
                  >
                    <span className="material-icons">
                      <MdDownload />
                    </span>
                    Download CSV
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="box">
            <DataTable
              columns={columns}
              data={Data}
            // data={AccountList?.aaData}
            // className='account-table-wrap'
            // pagination
            // paginationPerPage={10}
            // paginationServer
            // progressPending={false}
            // onChangePage={handlePageChange}
            // paginationComponent={() => (
            //   <CustomPaginationComponent
            //     pageNumber={accPageNumber}
            //     paginationList={accPaginationList}
            //     setPageNumber={setAccPageNumber}
            //   />
            // )}
            // progressComponent={<CustomLoadingIndicator />}
            // noDataComponent={<CustomNoDataComponent />}
            // onSort={customSort}
            // sortServer
            // sortIcon={<TableSortArrow />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuesContentBox;
