


const useSelectAll = ({ allItemData, filterItemData, setAllItemData, setAllFilterData, key = 'item_checked', uniqueId = 'id' }) => {
   const areAllCheckedIn = () => {
      return filterItemData?.every((app) => app[key]);
   };
   const handleSelectAll = (event) => {
      const isChecked = event.target.checked;

      const updatedSearchAll = filterItemData?.map((app) => ({
         ...app,
         [key]: isChecked,
      }));
      setAllFilterData(updatedSearchAll);
      const filteredIds = new Set(updatedSearchAll.map(app => app[uniqueId]));
      const updatedItemAll = allItemData.map(app => {
         if (filteredIds.has(app[uniqueId])) {
            return { ...app, [key]: isChecked ? isChecked : false };
         }
         return app;
      });
      setAllItemData(updatedItemAll);
   };

   return { areAllCheckedIn, handleSelectAll }
}

export default useSelectAll;