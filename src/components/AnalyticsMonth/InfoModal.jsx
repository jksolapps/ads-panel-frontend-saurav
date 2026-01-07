import Modal from "react-bootstrap/Modal";

const InfoModal = (props) => {
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
               <h3 className="info-title" style={{ marginBottom: 30 }}>Calculation Information</h3>
               <div className="content-container info-line">
                  <div
                     className="row"
                  >
                     <div className="col-xxl-4 col-xl-4 col-md-4 col-sm-6 col-6 info-modal-label">
                        Revenue
                     </div>
                     <div className="col-xxl-8 col-xl-8 col-md-8 col-sm-6 col-6 info-modal-value">
                        <span style={{ marginRight: "7px" }}>Difference</span>: $10
                        <br />
                        <span>Percentage</span>: 110%
                     </div>
                  </div>
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

export default InfoModal;
