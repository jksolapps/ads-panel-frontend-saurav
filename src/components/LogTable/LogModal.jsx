/** @format */

import { ModalHeader } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { RxCross2 } from "react-icons/rx";
import { useState } from "react";

const LogModal = ({ modalInfo, ...props }) => {
   const [fullImageUrl, setFullImageUrl] = useState(null);
   const handleCancel = () => {
      props.onHide();
   };

   return (
      <>
         <Modal
            {...props}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            size={"xs"}
            className="modal fade basic-modal-wrap log_extra_modal"
            style={{ zIndex: "999999" }}
         >
            <ModalHeader style={{ padding: "15px" }}>
               <h5
                  className="ip-head"
                  style={{ textAlign: "center", marginBottom: "unset" }}
               >
                  Extra Details
               </h5>
               <RxCross2 onClick={handleCancel} className="cross-btn-modal" />
            </ModalHeader>
            <Modal.Body>
               <div className="form-wrap modal-form log_json_structure">
                  <div className="data-container" style={{ maxHeight: "400px", height: "auto" }}>
                     {(() => {
                        const data = modalInfo?.log_extra_data ? JSON.parse(modalInfo?.log_extra_data) : '';
                        return Object.entries(data)
                           .filter(([key, value]) => !(
                              Array.isArray(value) && value.length === 0
                           ))
                           .flatMap(([key, value]) => (
                              key === 'request_info' && typeof value === 'object' && value !== null
                                 ? Object.entries(value)
                                    .filter(([subKey, subValue]) => !(
                                       Array.isArray(subValue) && subValue.length === 0
                                    ))
                                    .map(([subKey, subValue]) => (
                                       <div className="data-item" key={subKey} style={{ marginBottom: "5px" }}>
                                          <div className="data-label label-server-width" style={{ fontWeight: "bold", marginBottom: "5px" }}>
                                             {(() => {
                                                if (subKey === 'match_status') return 'Status';
                                                const label = subKey.replace(/_/g, " ");
                                                return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
                                             })()} :
                                          </div>
                                          <div className="data-value" style={{ marginLeft: "0px" }}>
                                             {typeof subValue === 'object' ? JSON.stringify(subValue, null, 2) : subValue}
                                          </div>
                                       </div>
                                    ))
                                 : [
                                    <div className="data-item" key={key} style={{ marginBottom: "5px", ...(key === 'face_image' ? { alignItems: 'center' } : {}) }}>
                                       <div className="data-label label-server-width" style={{ fontWeight: "bold", marginBottom: "5px" }}>
                                          {(() => {
                                             if (key === 'match_status') return 'Status';
                                             const label = key.replace(/_/g, " ");
                                             return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
                                          })()} :
                                       </div>
                                       <div className="data-value" style={{ marginLeft: "0px" }}>
                                          {key === 'face_image' ? (
                                             <img
                                                src={import.meta.env.VITE_IMAGE_BASE_URL + value}
                                                alt="face"
                                                className="log-modal-thumb-img"
                                                onClick={() => setFullImageUrl(import.meta.env.VITE_IMAGE_BASE_URL + value)}
                                             />
                                          ) : (
                                             typeof value === 'object' ? JSON.stringify(value, null, 2) : value
                                          )}
                                       </div>
                                    </div>
                                 ]
                           ));
                     })()}
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
         </Modal >
         {fullImageUrl && (
            <div
               className="full-image-overlay"
               onClick={() => setFullImageUrl(null)}
            >
               <img
                  src={fullImageUrl}
                  alt="Full view"
                  className="full-image-modal-img"
                  onClick={e => e.stopPropagation()}
               />
               <button
                  className="full-image-modal-close"
                  onClick={() => setFullImageUrl(null)}
                  aria-label="Close full view"
               >
                  &times;
               </button>
            </div>
         )}
      </>
   );
};

export default LogModal;
