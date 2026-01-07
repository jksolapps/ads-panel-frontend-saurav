/** @format */

import React, { useContext, useEffect, useState } from "react";
import { ModalHeader } from "react-bootstrap";

import Modal from "react-bootstrap/Modal";
import { RxCross2 } from "react-icons/rx";

const InfoModal = (props) => {
  const handleCancel = () => {
    props.onHide();
  };

  return (
    <Modal {...props} aria-labelledby="contained-modal-title-vcenter" centered size={"xs"} className="modal fade basic-modal-wrap info-modal-start" style={{ zIndex: "999999" }}>
      <ModalHeader style={{ padding: "15px" }}>
        <h5 className="ip-head" style={{ textAlign: "center", marginBottom: "unset" }}>
          IP INFO
        </h5>
        <RxCross2 onClick={handleCancel} className="cross-btn-modal" />
      </ModalHeader>
      <Modal.Body>
        <div className="form-wrap modal-form">
          <div className="data-container" style={{ height: "210px" }}>
            {Object.entries(props?.infodata)?.map(([key, value]) => (
              <div className="data-item" key={key}>
                <div className="data-label label-info-width">{key} :</div>
                <div className="">{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="close-btn-modal">
          <button type="button" className="mt-3 d-content-btn float-right" onClick={handleCancel}>
            close
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default InfoModal;
