/** @format */

import React from "react";
import { ModalHeader } from "react-bootstrap";

import Modal from "react-bootstrap/Modal";
import { RxCross2 } from "react-icons/rx";

const ServerInfoModal = (props) => {
  const handleCancel = () => {
    props.onHide();
  };
  return (
    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size={"lg"}
      className="modal fade basic-modal-wrap server-info-height"
      style={{ zIndex: "999999" }}
    >
      <ModalHeader style={{ padding: "15px" }}>
        <h5
          className="server-info-head"
          style={{ textAlign: "center", marginBottom: "unset" }}
        >
          Server Info
        </h5>
        <RxCross2 onClick={handleCancel} className="cross-btn-modal" />
      </ModalHeader>
      <Modal.Body className="server-modal-body">
        <div className="">
          <div
            className="data-container font-size-server"
            style={{ height: "582px" }}
          >
            {Object.entries(props?.serverdata)?.map(([key, value]) => (
              <div className="data-item" key={key}>
                <dl className="d-flex" style={{ marginBottom: "unset" }}>
                  <dt
                    className="data-label label-server-width"
                    style={{ marginBottom: "unset" }}
                  >
                    {key} :
                  </dt>
                  {/* <dd className="">{":"}</dd> */}
                  <dd className="">{value}</dd>
                </dl>
              </div>
            ))}
          </div>
        </div>
        <div className="close-btn-modal">
          <button
            type="button"
            className="mt-3 d-content-btn float-right"
            onClick={handleCancel}
          >
            close
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ServerInfoModal;
