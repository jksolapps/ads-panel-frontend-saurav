/** @format */

import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { IoCheckmarkCircle, IoEyeOffOutline } from 'react-icons/io5';

const AnalyticOmitModal = ({ columns, onApply, ...props }) => {

   const [localColumns, setLocalColumns] = useState([]);
   useEffect(() => {
      setLocalColumns(columns);
   }, [columns]);

   const handleToggle = (columnName) => {
      setLocalColumns((prev) =>
         prev.map((col) =>
            col.title === columnName ? { ...col, omit: !col.omit } : col
         )
      );
   };

   const handleApply = () => {
      onApply(localColumns);
      props.onHide();
   };

   const handleCancel = () => {
      props.onHide();
      setLocalColumns(columns || []);
   };

   return (
      <Modal
         {...props}
         aria-labelledby='contained-modal-title-vcenter'
         centered
         className='modal fade basic-modal-wrap popup-modal-wrap omit_column_modal'
         onExited={() => setLocalColumns(columns || [])}
      >
         <Modal.Body>
            <div className='form-wrap modal-form'>
               <h3>Column Visibility</h3>
               <div className="omit_modal_switch_box">
                  {localColumns?.map((column, index) => {
                     return (
                        <label
                           key={index}
                           className={`custom_switch_label ${column.omit ? 'omitted' : ''}`}
                           htmlFor={`column-switch-${index}`}
                        >
                           <span>{column.title}</span>
                           <input
                              type="checkbox"
                              id={`column-switch-${index}`}
                              checked={!column.omit}
                              onChange={() => handleToggle(column.title)}
                           />
                           {column.omit ? (
                              <IoEyeOffOutline className='omit_eye_icon' />
                           ) : (
                              <IoCheckmarkCircle className='omit_check_icon' />
                           )}
                        </label>
                     );
                  })}
               </div>

               <button
                  type='button'
                  className='mt-3 d-content-btn bg-btn float-right apply_btn'
                  onClick={handleApply}
               >
                  Apply
               </button>
               <button
                  type='button'
                  className='mt-3 d-content-btn float-right close_btn'
                  onClick={handleCancel}
               >
                  Close
               </button>
            </div>
         </Modal.Body>
      </Modal>
   );
};

export default AnalyticOmitModal;
