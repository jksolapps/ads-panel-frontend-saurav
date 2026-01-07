/** @format */
//React Icon
import { ReactComponent as EmptyTableIcon } from '../../assets/images/empty-table-icon.svg';
const CustomNoDataComponentAccount = () => {
  return (
    <div className='Account-Table account-no-data'>
      <div className='particle-table-placeholder noData table-container ad-units-box user-table-box '>
        <EmptyTableIcon />
        <div className='empty-table-text'>No data to display</div>
      </div>
    </div>
  );
};

export default CustomNoDataComponentAccount;
