/** @format */
//React Icon
import { ReactComponent as EmptyTableIcon } from '../../assets/images/empty-table-icon.svg';
const CustomNoDataComponent = () => {
  return (
    <div className='particle-table-placeholder noData'>
      <EmptyTableIcon />
      <div className='empty-table-text'>No data to display</div>
    </div>
  );
};

export default CustomNoDataComponent;
