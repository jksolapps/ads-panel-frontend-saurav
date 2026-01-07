import React from "react";
import DataTable from "react-data-table-component";

const DisapproveContentBox = () => {
  const columns = [
    {
      name: "Id",
      selector: (row) => row["increment_id"],
      // cell: (app) => <span>{app?.increment_id}</span>,
      sortable: false,
      width: "70px",
    },
    {
      name: "App",
      selector: (row) => row["app_display_name"],
      // cell: (app) => (
      //   <Link
      //     to={"/app-details/" + app?.app_auto_id}
      //     className="app-item"
      //     onClick={() => localStorage.setItem("app_auto_id", app?.app_auto_id)}
      //   >
      //     <div className="app-img">
      //       <img
      //         alt=""
      //         aria-hidden="true"
      //         className="app-icon"
      //         src={app.app_icon}
      //       />
      //     </div>
      //     <div className="label-container">
      //       <span className="primary-label" title={app.app_display_name}>
      //         {app.app_display_name}
      //       </span>
      //       <span className="secondary-label">
      //         {(app?.app_platform == "1" && "IOS") ||
      //           (app?.app_platform == "2" && "Android")}
      //       </span>
      //     </div>
      //   </Link>
      // ),
      sortable: true,
    },
    {
      name: "App ID",
      selector: (row) => row["app_admob_app_id"],
      // cell: (app) => (
      //   <div
      //     className="copy-text"
      //     onClick={() => handleCopyText(app?.app_admob_app_id)}
      //   >
      //     <div className="copy">
      //       <button
      //         className="copy-btn"
      //         data-toggle="tooltip"
      //         data-placement="bottom"
      //       >
      //         <MdOutlineContentCopy className="material-icons" />
      //         <span
      //           className="text"
      //           dangerouslySetInnerHTML={{
      //             __html: app?.app_admob_app_id,
      //           }}
      //         ></span>
      //       </button>
      //       {app?.app_admob_app_id == copyMessage && (
      //         <div className="copyMessage"> Copied </div>
      //       )}
      //     </div>
      //   </div>
      // ),
      sortable: true,
    },
    {
      name: "Approval status",
      selector: (row) => row["app_approval_state"],
      // cell: (app) => (
      //   <div
      //     className="getting-item"
      //     dangerouslySetInnerHTML={{
      //       __html: app?.app_approval_state,
      //     }}
      //   ></div>
      // ),
      sortable: true,
    },
    {
      name: "Shops",
      selector: (row) => row["app_platform"],
      // cell: (app) => (
      //   <>
      //     {app.app_platform == 2 ? (
      //       <div>Google Play</div>
      //     ) : (
      //       <div>App Store</div>
      //     )}
      //   </>
      // ),
      sortable: true,
    },
    {
      name: "Package name or store ID",
      selector: (row) => row["app_store_id"],
      // cell: (app) => (
      //   <span className="text" title={app?.app_store_id}>
      //     {app?.app_store_id}
      //   </span>
      // ),
      width: "400px",
      sortable: true,
    },
    {
      name: "Ad units",
      selector: (row) => row["total_ad_units"],
      // cell: (app) => (
      //   <span className="app-units">
      //     {(app?.total_ad_units).split(" ")[0]} active
      //   </span>
      // ),
      sortable: true,
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

  return (
    <div>
      {/* {appList?.aaData?.length === undefined ? (
        <div className="shimmer-spinner">
          <Spinner animation="border" variant="secondary" />
        </div>
      ) : ( */}
      <>
        <div className="table-container ad-units-box user-table-box policy-content">
          <DataTable
            columns={columns}
            data={Data}
          // data={appList?.aaData}
          // pagination
          // paginationPerPage={10}
          // paginationServer
          // progressPending={false}
          // onChangePage={handlePageChange}
          // paginationComponent={() => (
          //   <CustomPaginationComponent
          //     pageNumber={appPageNumber}
          //     paginationList={appPaginationList}
          //     setPageNumber={setAppPageNumber}
          //   />
          // )}
          // progressComponent={<CustomLoadingIndicator />}
          // noDataComponent={<CustomNoDataComponent />}
          // onSort={customSort}
          // sortServer
          // sortIcon={<TableSortArrow />}
          />
        </div>
      </>
      {/* )} */}
    </div>
  );
};

export default DisapproveContentBox;
