/** @format */

import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import useUserApi from "../../hooks/useUserApi";
import { useFormik } from "formik";
import { UpdateProfileSchema } from "../../schemas/UserSchema";

const PercentageInfoModal = (props) => {
    const [updateErrorMassage, setUpdateErrorMassage] = useState("");

    const handleCancel = () => {
        props.onHide();
    };

    return (
        <Modal
            {...props}
            size="xl-down"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="modal fade basic-modal-wrap popup-modal-wrap info-modal"
        >
            <Modal.Body>
                <div className="form-wrap modal-form account-info-modal">
                    <h3 className="info-title">Calculation Information</h3>
                    <div className="content-container info-line">
                        <hr />
                        <div
                            className="row"
                            style={{
                                borderBottom: "1px solid lightgrey",
                                paddingBottom: "10px",
                            }}
                        >
                            <div className="col-xxl-4 col-xl-4 col-md-4 col-sm-6 col-6 info-modal-label">
                                Revenue (%)
                            </div>
                            <div className="col-xxl-8 col-xl-8 col-md-8 col-sm-6 col-6 info-modal-value">
                                <span style={{ marginRight: "7px" }}>Up</span>: 120%
                                <br />
                                <span>Down</span>: 80%
                            </div>
                        </div>

                        <div
                            className="row"
                            style={{
                                paddingTop: "10px",
                                borderBottom: "1px solid lightgrey",
                                paddingBottom: "10px",
                            }}
                        >
                            <div className="col-xxl-4 col-xl-4 col-md-4 col-sm-6 col-6 info-modal-label">
                                eCPM (%)
                            </div>
                            <div className="col-xxl-8 col-xl-8 col-md-8 col-sm-6 col-6 info-modal-value">
                                <span style={{ marginRight: "7px" }}>Up</span>: 120%
                                <br />
                                <span>Down: 80%</span>
                            </div>
                        </div>
                        <div
                            className="row"
                            style={{
                                paddingTop: "10px",
                            }}
                        >
                            <div className="col-xxl-4 col-xl-4 col-md-4 col-sm-6 col-6 info-modal-label">
                                Impressions (%)
                            </div>
                            <div className="col-xxl-8 col-xl-8 col-md-8 col-sm-6 col-6 info-modal-value">
                                <span style={{ marginRight: "7px" }}>Up</span>: 120%
                                <br />
                                <span>Down: 80%</span>
                            </div>
                        </div>

                        {/* <p>
                      <b>Note</b>: When optimization is enabled, this value is
                      updated automatically by AdMob based on the ad network's
                      historical eCPM data.
                    </p>
                    <p>Effective cost per thousand impressions.</p> */}
                    </div>

                    <button
                        type="button"
                        className="d-content-btn float-right"
                        onClick={handleCancel}
                        style={{ marginLeft: "-2px", marginTop: "40px" }}
                    >
                        Close
                    </button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default PercentageInfoModal;
