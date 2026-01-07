import { useContext } from 'react';
import Select from 'react-select';
import { DataContext } from '../../context/DataContext';

export const PageLengthSelector = ({ itemsPerPage, setItemsPerPage, totalCount }) => {

   const { isDarkMode } = useContext(DataContext)
   const options = [
      { value: 250, label: '250' },
      { value: 500, label: '500' },
      { value: 1000, label: '1000' },
      { value: 1500, label: '1500' },
      { value: 'all', label: 'All' },
   ];

   const selectedOption = options.find(
      (opt) => (opt.value === 'all' && itemsPerPage === totalCount) || opt.value === itemsPerPage
   );

   return (
      <div className="page-length-selector" style={{ minWidth: 180, zIndex: 1 }}>
         <label style={{ marginRight: 8 }}>Show per page:</label>
         <Select
            options={options}
            value={selectedOption}
            onChange={(selected) =>
               setItemsPerPage(selected.value === 'all' ? totalCount : selected.value)
            }
            classNamePrefix={'general_select'}
            isSearchable={false}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
               control: (base) => ({
                  ...base,
                  minHeight: 32,
                  height: 32,
                  width: 65,
                  fontSize: 14,
               }),
               dropdownIndicator: (base) => ({
                  ...base,
                  display: 'none',
               }),
               indicatorSeparator: (base) => ({
                  ...base,
                  display: 'none',
               }),
               option: (base, state) => ({
                  ...base,
                  fontSize: 14,
                  backgroundColor: state.isSelected
                     ? (isDarkMode ? "#04b488" : '#e8f0fe')
                     : 'transparent',
                  color: isDarkMode ? "#fff" : '#333',
                  '&:hover': {
                     backgroundColor: isDarkMode ? "#303233" : '#f4f4f4',
                  },
               }),
               menuPortal: (base) => ({ ...base, width: 66, zIndex: 9999 }),
            }}
         />
      </div>
   );
};
