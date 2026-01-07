/** @format */

import React, { useContext, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';

const SelectAccountModal = (props) => {
  const navigate = useNavigate();

  const { setAccSelectValue } = useContext(DataContext);
  const initialAccData = [
    {
      id: 1,
      name: 'MCC account 1',
      account_id: '123456789',
      account_handler: 'manager',
      item_checked: false,
    },
    {
      id: 2,
      name: 'MCC account 2',
      account_id: '123456789',
      account_handler: 'manager',
      item_checked: false,
    },
    {
      id: 3,
      name: 'MCC account 3',
      account_id: '123456789',
      account_handler: 'manager',
      item_checked: false,
    },
    {
      id: 4,
      name: 'MCC account 4',
      account_id: '123456789',
      account_handler: 'manager',
      item_checked: false,
    },
    {
      id: 5,
      name: 'MCC account 5',
      account_id: '123456789',
      account_handler: 'manager',
      item_checked: false,
    },
  ];
  const [allSelectAccount, setSelectAccount] = useState(initialAccData);

  const handleAccSubmit = (e, id) => {
    e.preventDefault();
    setAccSelectValue(id);
    localStorage.setItem('acc', true);
    navigate('/');
  };

  //Search
  const [accSearch, setAccSearch] = useState('');
  const handleAccSearch = (e) => {
    e.preventDefault();
    setAccSearch(e.target.value);
    setSelectAccount(
      initialAccData.filter(
        (item) =>
          item.name.toLowerCase().includes(e.target.value) ||
          item.account_id.toLowerCase().includes(e.target.value)
      )
    );
  };

  return (
    <Modal
      {...props}
      centered
      className='modal fade basic-modal-wrap popup-modal-wrap acc-select-modal'
    >
      <Modal.Header>
        <h3>Select AdMob Account</h3>
      </Modal.Header>
      <Modal.Body>
        <div className='search-bar custom-search-filter'>
          <input
            type='text'
            value={accSearch}
            placeholder='Search AdMob Account'
            onChange={(e) => handleAccSearch(e)}
          />
        </div>
        <div className='manage-account-wrap'>
          {allSelectAccount.length === 0 ? (
            <div className='no-data'>Account not found</div>
          ) : (
            allSelectAccount.map((acc, index) => {
              return (
                <div
                  key={index}
                  className='manage-account'
                  onClick={(e) => handleAccSubmit(e, acc?.id)}
                >
                  <div className='acc-list-box'>
                    <div className='acc-list-box-name'>
                      <span>{acc?.name}</span>
                      <span>{acc?.account_handler}</span>
                    </div>
                    <div className='acc_id'>{acc?.account_id}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SelectAccountModal;
