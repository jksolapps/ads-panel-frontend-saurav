/** @format */

import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { IoCheckmarkCircle, IoEyeOffOutline } from "react-icons/io5";

const COLUMN_TITLE_MAP = {
  AD_COST: "Cost",
  ESTIMATED_EARNINGS: "Earnings",
  ROAS: "Actual ROAS",
  CUMULATIVE_EARNINGS: "Cumulative Earnings",
  CUMULATIVE_ROAS: "Cumulative ROAS",
  PROFIT: "Profit",
  IMPRESSION_RPM: "eCPM",
  AD_REQUESTS: "Requests",
  MATCH_RATE: "Match rate (%)",
  IMPRESSIONS: "Impressions",
  ACTIVE_USER: "Active users",
  ARPU: "ARPU",
  ARPDAU: "ARPDAU",
  DAU_AV: "DAU AV",
  AV_RATE: "AV Rate",
  IMPR_PER_USER: "Impression/User",
  SHOW_RATE: "Show rate (%)",
  CLICKS: "Clicks",
  IMPRESSION_CTR: "CTR (%)",
};

const ColumnOmitModal = ({
  columns = [],
  appInfo,
  isOnlyMonthYearSelected,
  onApply,
  ...props
}) => {
  const [localColumns, setLocalColumns] = useState([]);

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const handleToggle = (sortValue) => {
    setLocalColumns((prev) =>
      prev.map((col) =>
        col.sortValue === sortValue ? { ...col, omit: !col.omit } : col
      )
    );
  };

  const handleApply = () => {
    onApply(localColumns);
    props.onHide();
  };

  const handleCancel = () => {
    setLocalColumns(columns);
    props.onHide();
  };

  return (
    <Modal
      {...props}
      centered
      className="modal fade basic-modal-wrap popup-modal-wrap omit_column_modal"
      onExited={() => setLocalColumns(columns)}
    >
      <Modal.Body>
        <div className="form-wrap modal-form">
          <h3>Column Visibility</h3>

          <div className="omit_modal_switch_box">
            {localColumns
              .filter((col) => {
                // Hide dimension columns
                if (
                  col.sortValue?.startsWith("FirstColumn") ||
                  col.sortValue?.startsWith("ExtraColumn")
                ) {
                  return false;
                }

                // Preserve your business rules
                if (
                  appInfo?.app_info?.is_app_property === "0" ||
                  !isOnlyMonthYearSelected
                ) {
                  return ![
                    "AD_COST",
                    "ROAS",
                    "PROFIT",
                    "CUMULATIVE_EARNINGS",
                    "CUMULATIVE_ROAS",
                  ].includes(col.sortValue);
                }

                return true;
              })
              .map((col) => (
                <label
                  key={col.sortValue}
                  className={`custom_switch_label ${col.omit ? "omitted" : ""}`}
                >
                  <span>{COLUMN_TITLE_MAP[col.sortValue]}</span>

                  <input
                    type="checkbox"
                    checked={!col.omit}
                    onChange={() => handleToggle(col.sortValue)}
                  />

                  {col.omit ? (
                    <IoEyeOffOutline className="omit_eye_icon" />
                  ) : (
                    <IoCheckmarkCircle className="omit_check_icon" />
                  )}
                </label>
              ))}
          </div>

          <button
            type="button"
            className="mt-3 d-content-btn bg-btn float-right apply_btn"
            onClick={handleApply}
          >
            Apply
          </button>

          <button
            type="button"
            className="mt-3 d-content-btn float-right close_btn"
            onClick={handleCancel}
          >
            Close
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ColumnOmitModal;
