/** @format */
import React from "react";
import Modal from "react-bootstrap/Modal";
import ErrorIcon from "../../../assets/images/error-icon.png"

const AnalyticsErrorModal = (props) => {
    const handleCancel = () => {
        props.onHide();
    };

    return (
        <Modal
            {...props}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            size={"xs"}
            className="modal fade basic-modal-wrap "
        >
            <Modal.Body>
                <div className="form-wrap modal-form">

                    <div className="analytics-modal-content">
                        <div className="analytics-modal-header">
                            <img src={ErrorIcon} loading="lazy" />
                        </div>
                        <div className="analytics-modal-body text-center">
                            <p>{props?.errormsg}</p>
                        </div>
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

export default AnalyticsErrorModal;
