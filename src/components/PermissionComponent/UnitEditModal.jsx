/** @format */

import React, { useContext } from "react";
import { DataContext } from "../../context/DataContext";
import useApi from "../../hooks/useApi";
import Modal from "react-bootstrap/Modal";
import { useFormik } from "formik";
import Select from "react-select";
import makeAnimated from "react-select/animated";
// import { PermissionUpdateSchema } from '../../schemas/UserSchema';

const UnitEditModal = (props) => {
  const { addPermissionFlag, setAddPermissionFlag } = useContext(DataContext);
  const animatedComponents = makeAnimated();
  let appSelectOptions = {};
  let multiSelectOptions = {};

  if (props?.editdata?.all_ad_unit_ids?.length > 0) {
    multiSelectOptions = props?.editdata?.all_ad_unit_ids?.map((options) => {
      return { value: options.au_auto_id, label: options.au_display_name };
    });
  }
  if (multiSelectOptions?.length > 0) {
    multiSelectOptions?.unshift({ value: "all", label: "All" });
  }
  let multiInitialSelect = {};
  if (props?.editdata?.is_all_au_permission === "true") {
    multiInitialSelect = [{ value: "all", label: "All" }];
  } else {
    multiInitialSelect = props?.editdata?.selected_ad_units?.map((options) => {
      return { value: options?.au_auto_id, label: options?.au_display_name };
    });
  }
  const { values, errors, touched, setFieldValue, resetForm, handleSubmit } = useFormik({
    initialValues: {
      appSelectOptions:
        {
          value: props?.editdata?.app_auto_id,
          label: props?.editdata?.selected_app_display_name,
        } || "",
      multiSelectOptions: multiInitialSelect || "",
    },
    enableReinitialize: true,
    // validationSchema: PermissionUpdateSchema,
    onSubmit: (values) => {
      handleUpdatePermissionData(values);
    },
  });

  const selectedOptions = Array?.isArray(values?.multiSelectOptions)
    ? values?.multiSelectOptions
    : values?.multiSelectOptions
    ? [values?.multiSelectOptions] // Convert to array if it's not already an array
    : [];

  const handleUpdatePermissionData = async (values) => {
    props.onHide();
    resetForm();
    // Ad-units List
    const multiVal = selectedOptions
      ?.map((val) => {
        if (val.value === "all") {
          return props?.editdata?.all_ad_unit_ids?.map((adunit) => adunit?.au_auto_id);
        }
        return val?.value;
      })
      .flat();
    const updatePermissionParams = JSON.stringify({
      user_id: localStorage.getItem("id"),
      user_token: localStorage.getItem("token"),
      app_auto_id: values?.appSelectOptions?.value,
      user_unique_id: props?.editdata?.user_unique_id,
      permission_au_auto_id: multiVal || [],
      is_all_au_permission: selectedOptions?.length > 0 && selectedOptions?.some((item) => item.value === "all") ? "true" : "false",
    });

    const updatePermissionFormData = new FormData();
    updatePermissionFormData.append("json_data", updatePermissionParams);

    const permissionResponse = await useApi("add-update-app-permission", updatePermissionFormData);
    if (permissionResponse?.status === 200) {
      setAddPermissionFlag(!addPermissionFlag);
    }
  };

  const handleCancel = () => {
    props.onHide();
    resetForm();
  };
  return (
    <Modal {...props} aria-labelledby="contained-modal-title-vcenter" centered size={"lg"} className="modal fade basic-modal-wrap popup-modal-wrap">
      <Modal.Body>
        <div className="form-wrap modal-form">
          <h3>Edit Units</h3>
          <div className="ad-units-box user-table-box">
            <form onSubmit={handleSubmit} noValidate className="add-permission-form">
              <div className="input-box react-select">
                <Select value={values?.appSelectOptions || []} options={appSelectOptions || []} isDisabled />
              </div>
              <div className="input-box react-select">
                <Select
                  classNamePrefix="setting-select"
                  placeholder={<div className="select-placeholder">Select Ad Unit</div>}
                  value={selectedOptions || []}
                  isMulti={selectedOptions?.length > 0 ? (selectedOptions?.some((option) => option?.value === "all") ? false : true) : true}
                  options={multiSelectOptions?.length > 0 ? multiSelectOptions : []}
                  onChange={(option) => {
                    if (option?.some && option?.some((opt) => opt?.value === "all")) {
                      setFieldValue("multiSelectOptions", [option?.find((opt) => opt?.value === "all")]);
                    } else {
                      setFieldValue("multiSelectOptions", option);
                    }
                  }}
                />
              </div>
              {touched.multiSelectOptions && errors.multiSelectOptions && <div className="formErrors">{errors.multiSelectOptions}</div>}

              <button type="submit" className="mt-4 d-content-btn bg-btn float-right">
                Update
              </button>
              <button type="button" className="mt-4 d-content-btn float-right" onClick={handleCancel}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default UnitEditModal;
