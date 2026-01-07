/** @format */

import React, { useContext } from 'react';
import DataTable from 'react-data-table-component';
import { DataContext } from '../../context/DataContext';
import useApi from '../../hooks/useApi';
import Modal from 'react-bootstrap/Modal';
import { ReactComponent as TableSortArrow } from '../../assets/images/arrow-dwon.svg';

const UnitListModal = (props) => {
  const { addPermissionFlag, setAddPermissionFlag } = useContext(DataContext);

  const finalUnitList = props?.data?.filter((filterData) => {
    return filterData?.increment_id == props?.id;
  });

  const columns = [
    {
      name: 'Id',
      cell: (_, index) => <div>{index + 1}</div>,
      sortable: false,
      width: '70px',
    },
    {
      name: 'Ad Unit',
      selector: (row) => row['au_display_name'],
      width: '180px',
    },
    {
      name: 'Ad Unit Id',
      selector: (row) => row['au_id'],
      sortable: false,
    },
    {
      name: 'Action',
      selector: (row) => row['au_auto_id'],
      cell: (row) => (
        <button
          className='d-content-btn'
          onClick={() => handleUnitDelete(row.au_auto_id)}
        >
          Delete
        </button>
      ),
      sortable: false,
      width: '150px',
    },
  ];

  const handleUnitDelete = async (au_auto_id) => {
    const formData = new FormData();
    formData.append('user_id', localStorage.getItem('id'));
    formData.append('user_token', localStorage.getItem('token'));
    formData.append('au_auto_id', au_auto_id);
    formData.append('user_unique_id', props?.userid);
    const response = await useApi('remove-ad-unit-permission', formData);
    if (response.data.status_code === 1) {
      setAddPermissionFlag(!addPermissionFlag);
    }
    if (finalUnitList[0]?.ad_units?.length === 1) {
      props?.onHide();
    }
  };

  return (
    <Modal
      {...props}
      aria-labelledby='contained-modal-title-vcenter'
      centered
      size={'lg'}
      className='modal fade basic-modal-wrap popup-modal-wrap permission-unit-modal'
    >
      <Modal.Body>
        <div>
          <h3>Ad Units</h3>
          <div className='ad-units-box user-table-box'>
            <DataTable
              columns={columns}
              data={finalUnitList[0]?.ad_units}
              pagination={false}
              sortIcon={<TableSortArrow />}
            />
            <div className='permission-unit-button'>
              <button
                type='button'
                className='mt-3 d-content-btn float-right bg-btn'
                onClick={() => props?.onHide()}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default UnitListModal;
