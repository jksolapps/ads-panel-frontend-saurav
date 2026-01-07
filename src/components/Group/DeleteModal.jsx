/** @format */

import React, { useContext, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { DataContext } from "../../context/DataContext";
import useApi from "../../hooks/useApi";
import { ReactComponent as DeleteIcon } from "../../assets/images/delete-icon.svg";

const DeleteModal = (props) => {
  const { addGroupFlag, setAddGroupFlag } = useContext(DataContext);
  const [addUserErrorMassage, setAddUserErrorMassage] = useState("");

  const handleCancel = () => {
    props.onHide();
    setAddUserErrorMassage("");
  };

  const handleUnitDelete = async () => {
    const formData = new FormData();
    formData.append("user_id", localStorage.getItem("id"));
    formData.append("user_token", localStorage.getItem("token"));
    formData.append("group_id", props?.deleteid);
    const response = await useApi("delete-group", formData);
    if (response?.data?.status_code === 1) {
      props.onHide();
      setAddGroupFlag(!addGroupFlag);
    }
  };
  return (
    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="modal fade basic-modal-wrap popup-modal-wrap"
    >
      <Modal.Body>
        <div className="delete-modal-header">
          <div className="delete-wrap">
            <DeleteIcon className="custom-delete-icon" />
          </div>
          <br></br>
          <h3 className="h33"> Are you sure </h3>
          <div className="delete">you want to delete the Group ?</div>
        </div>

        <div className="close-btn-modal">
          <button
            type="button"
            className="mt-3 d-content-btn float-right"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="mt-3 d-content-btn bg-btn float-right"
            onClick={handleUnitDelete}
          >
            Confirm
          </button>
        </div>
        {addUserErrorMassage ? (
          <div className="backError">{addUserErrorMassage} !!</div>
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default DeleteModal;
