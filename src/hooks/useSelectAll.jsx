const useSelectAll = ({
  allItemData,
  filterItemData,
  setAllItemData,
  setAllFilterData,
  key = 'item_checked',
  uniqueId = 'id',
  setCheckedItems,
}) => {
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

    const filteredIds = new Set(updatedSearchAll.map((app) => app[uniqueId]));
    const updatedItemAll = allItemData.map((app) => {
      if (filteredIds.has(app[uniqueId])) {
        return { ...app, [key]: isChecked ? isChecked : false };
      }
      return app;
    });
    setAllItemData(updatedItemAll);

    // Optionally sync an external "checked items" list (e.g. checkedAccount)
    if (typeof setCheckedItems === 'function') {
      const newlyChecked = updatedItemAll.filter((item) => item[key]);
      setCheckedItems(newlyChecked);
    }
  };

  return { areAllCheckedIn, handleSelectAll };
};

export default useSelectAll;