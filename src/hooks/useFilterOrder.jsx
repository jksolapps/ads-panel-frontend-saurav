import React, { useEffect, useState } from "react";

const useFilterOrder = ({ allFilterNames, filterStates, renderComponent }) => {
   const [selectedFilterOrder, setSelectedFilterOrder] = useState([]);
   useEffect(() => {
      const selectedNow = Object.entries(filterStates)
         .filter(([_, isSelected]) => isSelected)
         .map(([key]) => key);
      setSelectedFilterOrder((prevOrder) => {
         const stillSelected = prevOrder.filter((name) => selectedNow.includes(name));
         selectedNow.forEach((filter) => {
            if (!stillSelected.includes(filter)) {
               stillSelected.push(filter);
            }
         });
         return stillSelected;
      });
   }, [JSON.stringify(filterStates)]);

   const selectedFilters = selectedFilterOrder.filter((name) => filterStates[name]);
   const remainingFilters = allFilterNames.filter((name) => !selectedFilters.includes(name));
   const dynamicFilterOrder = [...selectedFilters, ...remainingFilters];
   const renderedComponents = dynamicFilterOrder?.map((filterName, index) =>
      <React.Fragment key={filterName + index}>
         {renderComponent(filterName)}
      </React.Fragment>
   );
   return renderedComponents
}

export default useFilterOrder