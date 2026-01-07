/** @format */

import React from 'react';
import { Spinner } from 'react-bootstrap';

const MainLoader = () => {
  return (
    <div className='shimmer-spinner main-loader'>
      <Spinner animation='border' variant='secondary' />
    </div>
  );
};

export default MainLoader;
