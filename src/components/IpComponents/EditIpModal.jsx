/** @format */

import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../context/DataContext";
import useApi from "../../hooks/useApi";
import Modal from "react-bootstrap/Modal";
import { useFormik } from "formik";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import AccountPageAppBox from "../GeneralComponents/AccountPageAppBox";
import useUserApi from "../../hooks/useUserApi";
import { editIp } from "../../schemas/IpSchema";
// import { PermissionUpdateSchema } from '../../schemas/UserSchema';

const EditIpModal = (props) => {
  const { ipFlag, setIpFlag } = useContext(DataContext);
  const [addUserErrorMassage, setAddUserErrorMassage] = useState("");
  const animatedComponents = makeAnimated();

  const { values, errors, touched, setFieldValue, resetForm, handleSubmit, handleChange } = useFormik({
    initialValues: {
      auto_id: props?.editdata?.auto_id || "",
      role: props?.editdata?.ip_status == "Active" ? "1" : "0" || "",
      ip_comment: props?.editdata?.ip_comment || "",
    },
    enableReinitialize: true,
    validationSchema: editIp,
    onSubmit: (values) => {
      handleUpdatePermissionData(values);
    },
  });

  const handleUpdatePermissionData = async (values, action) => {
    const formData = new FormData();
    formData.append("user_id", localStorage.getItem("id"));
    formData.append("user_token", localStorage.getItem("token"));
    formData.append("ip_comment", values?.ip_comment);
    formData.append("auto_id", values?.auto_id);
    formData.append("ip_status", values?.role);
    const response = await useUserApi("update-ip-status", formData);
    if (response?.status_code == 1) {
      props.onHide();
      setAddUserErrorMassage("");
      resetForm();
      setIpFlag(!ipFlag);
    }
    if (response.status_code !== 1) {
      setAddUserErrorMassage(response?.msg);
    }
  };

  const handleCancel = () => {
    props.onHide();
    setAddUserErrorMassage("");
    resetForm();
  };

  const roleOptions = [
    { value: "1", label: "Active" },
    { value: "0", label: "Blocked" },
  ];

  return (
    <Modal {...props} aria-labelledby="contained-modal-title-vcenter" centered className="modal fade basic-modal-wrap popup-modal-wrap" style={{ zIndex: "999999" }}>
      <Modal.Body>
        <div className="form-wrap modal-form">
          <h3>Edit IP</h3>
          <form onSubmit={handleSubmit} noValidate>
            <div className="input-box react-select">
              <Select
                placeholder={<div className="select-placeholder">Role selection</div>}
                value={roleOptions.find((option) => option.value === values.role)}
                options={roleOptions}
                onChange={(option) => setFieldValue("role", option.value)}
                isSearchable={false}
                className="add-user-select"
                classNamePrefix="add-user-select"

                // menuIsOpen={true}
              />
            </div>
            {touched.role && errors.role && <div className="formErrors">{errors.role}</div>}
            <div className="input-box" style={{ zIndex: "0" }}>
              <input type="text" className={`input  ${values?.ip_comment?.length > 0 ? "text-add input-active" : ""} `} name="ip_comment" value={values?.ip_comment} onChange={handleChange} />
              <div className="input-label snByac">
                <span>IP comment</span>
              </div>
              <div className="input-border"></div>
              <div className="blue-border"></div>
            </div>
            {touched.ip_comment && errors.ip_comment && <div className="formErrors">{errors.ip_comment}</div>}
            <button type="submit" className="mt-3 d-content-btn bg-btn float-right">
              Update
            </button>
            <button type="button" className="mt-3 d-content-btn float-right" onClick={handleCancel}>
              Cancel
            </button>
          </form>
          {addUserErrorMassage ? <div className="backError">{addUserErrorMassage} !!</div> : null}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default EditIpModal;
