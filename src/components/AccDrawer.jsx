/** @format */

import React from 'react';
import { MdClose } from 'react-icons/md';

const AccDrawer = ({ isSwitched, setIsSwitched, allSelectAccount }) => {
  return (
    <div
      className={
        isSwitched ? 'account-switch-box active' : 'account-switch-box'
      }
    >
      <div className='account-switch'>
        <MdClose
          className='switch-close'
          onClick={() => setIsSwitched(false)}
        />
        <h6>Select Admob Account</h6>
        <div className='manage-account-wrap'>
          {allSelectAccount.length === 0 ? (
            <div className='no-data'>Account not found</div>
          ) : (
            allSelectAccount.map((acc, index) => {
              return (
                <div
                  key={index}
                  className='manage-account'
                  //onClick={(e) => handleAccSubmit(e, acc?.id)}
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
      </div>
    </div>
  );
};

export default AccDrawer;
