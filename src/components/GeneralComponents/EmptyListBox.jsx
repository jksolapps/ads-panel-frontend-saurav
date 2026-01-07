import { ReactComponent as EmptyListIcon } from '../../assets/images/empty_list.svg';

const EmptyListBox = () => {
   return (
      <div className='empty_list_box'>
         <EmptyListIcon />
         <div className='empty_list_title'>No item selected</div>
      </div>
   )
}

export default EmptyListBox