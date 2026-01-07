/** @format */

import React, { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';
import useUserApi from '../../hooks/useUserApi';
import { ReactComponent as TableSortArrow } from '../../assets/images/arrow-dwon.svg';
import CustomPaginationComponent from '../CustomPaginationComponent';

const AppAccessModal = (props) => {
  const { addUserFlag, setAddUserFlag } = useContext(DataContext);

  const handleAddUser = async (values, action) => {
    const formData = new FormData();
    formData.append('user_id', localStorage.getItem('id'));
    formData.append('user_token', localStorage.getItem('token'));
    const response = await useUserApi('add-user', formData);

    if (response.status_code == 1) {
      props.onHide();
      setAddUserErrorMassage('');
      action.resetForm();
      setAddUserFlag(!addUserFlag);
    }
    if (response.status_code !== 1) {
      setAddUserErrorMassage(response?.msg);
    }
  };

  const accessedAppList = [
    {
      increment_id: 1,
      app_display_name: 'Gallery Lock',
      app_icon:
        'https://play-lh.googleusercontent.com/I0ZPFKiJIQjeGm5kbnLozn2qvKv7vrWoRdsc5PjkQ_aBVOl-12lmMGkkfYyBskz7bA',
      app_auto_id: '2',
      app_platform: '2',
      app_store_id: 'com.keepsafe.galleryvault.gallerylock',
    },
    {
      increment_id: 2,
      app_display_name: 'Flyer Ads, Poster Maker',
      app_icon:
        'https://play-lh.googleusercontent.com/MKUVs51IjsRq-x9BB3aUcSStc-g7BWUy80noFNaUcodtTD6wUPwXQEDSMbnu6MdN1g',
      app_auto_id: '1',
      app_platform: '2',
      app_store_id: 'com.advertisement.template.poster.maker.marketing',
    },
  ];

  const columns = [
    {
      name: 'Id',
      selector: (row) => row['increment_id'],
      sortable: true,
      sortValue: 'increment_id',
      cell: (row) => <div className=''>{row?.increment_id}</div>,
      width: '90px',
    },
    {
      name: 'Apps',
      selector: (row) => row['app_display_name'],
      cell: (app) => (
        <Link
          to={'/app-details/' + app?.app_auto_id}
          className='access-ap-single'
        >
          <div className='app-img'>
            <img
              alt=''
              aria-hidden='true'
              className='app-icon'
              src={app?.app_icon}
              loading="lazy"
            />
          </div>
          <div className='label-container'>
            <span className='primary-label' title={app?.app_display_name}>
              {app?.app_display_name}
            </span>
            <span className='secondary-label' title={app?.app_store_id}>
              {app?.app_store_id}
            </span>
          </div>
        </Link>
      ),
      sortable: true,
      sortValue: 'app_display_name',
    },
  ];

  return (
    <Modal
      {...props}
      aria-labelledby='contained-modal-title-vcenter'
      centered
      size={'lg'}
      className='modal fade basic-modal-wrap popup-modal-wrap'
    >
      <Modal.Body>
        <div className='form-wrap modal-form'>
          <h3 className='mb-3'>Accessed app list</h3>
          <>
            <div className='table-container ad-units-box user-table-box'>
              <DataTable
                columns={columns}
                data={accessedAppList}
                className='accessed-app-list'
                pagination={false}
                //paginationPerPage={10}
                //paginationServer
                progressPending={false}
                // onChangePage={handlePageChange}
                // paginationComponent={() => (
                //   <CustomPaginationComponent
                //   // pageNumber={usersPageNumber}
                //   // paginationList={usersPaginationList}
                //   // setPageNumber={setUsersPageNumber}
                //   />
                // )}
                // progressComponent={<CustomLoadingIndicator />}
                // noDataComponent={<CustomNoDataComponent />}
                //onSort={customSort}
                //sortServer
                sortIcon={<TableSortArrow />}
              />
            </div>
          </>
          <button
            type='button'
            className='mt-3 mx-0 d-content-btn float-right'
            onClick={() => {
              props.onHide();
            }}
          >
            Cancel
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AppAccessModal;
