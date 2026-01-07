/** @format */
import Spinner from 'react-bootstrap/Spinner';
const CustomLoadingIndicator = () => {
  return (
    <div className='shimmer-spinner'>
      <Spinner animation='border' variant='secondary' />
    </div>
  );
};

export default CustomLoadingIndicator;
