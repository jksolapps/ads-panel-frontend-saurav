/** @format */

import React from "react";
import Select from 'react-select';
import Modal from "react-bootstrap/Modal";

const EditEstGraphModal = (props) => {
  const handleCancel = () => {
    props.onHide();
  };

  const customStyles = {
    option: (provided) => ({
      ...provided,
      color: 'black',
      borderColor: "black"
    }),
  };

  const performanceOption = [
    { value: '1', label: 'Est. earnings', name: 'est' },
    { value: '2', label: 'Observed eCPM', name: 'top_movers' },
    { value: '3', label: 'Requestrs', name: 'bottom_movers' },
    { value: '4', label: 'Match rate', name: 'bottom_movers' },
    { value: '5', label: 'Match Requests', name: 'bottom_movers' },
    { value: '6', label: 'Show Rate', name: 'bottom_movers' },
    { value: '7', label: 'Impressions', name: 'bottom_movers' },
    { value: '8', label: 'CTR', name: 'bottom_movers' },
  ];

  return (
    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size={"xs"}
      className="modal fade basic-modal-wrap edit-graph-modal"
    >
      <Modal.Body>
        <div className="graph-modal-content">
          <h4 style={{ marginBottom: "24px" }}>Edit chart</h4>
          <div className="mb-1" style={{ color: 'gray' }}>choose a metric</div>
          <div className="mb-1 input-field">
            <Select
              placeholder={
                <div className='select-placeholder '>Est. earnings</div>
              }
              //   value={performanceOption.name}
              options={performanceOption}
              //   onChange={(e) => handleChange(e)}
              className='overview-select home-est-graph'
              classNamePrefix={`custom-overview-select`}
              styles={customStyles}
              isSearchable={false}
              theme={(theme) => ({
                ...theme,
                borderRadius: 0,
                border: 0,
                fontSize: 14,
                colors: {
                  ...theme.colors,
                  primary25: '#eee',
                  primary: '#eee',
                },
              })}
            />
          </div>
          <div className="graph-modal-label" style={{ color: 'gray' }}>
            <div >
              Time-period comparisons are only available in non-hour
            </div>
            <div>
              charts with 1 metric and no dimension breakdown.
            </div>
          </div>
          <div className="" style={{ color: 'gray', marginBottom: '25px' }} >
            Add another metric
          </div>
          <p style={{ color: 'gray' }}>
            Dimension breakdown data is only available in charts with 1 metric.
          </p>
        </div>
        <div >
          <button type="submit" className="mt-3 d-content-btn bg-btn float-right">Update</button>
          <button
            type="button"
            className="mt-3 d-content-btn float-right"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default EditEstGraphModal;
