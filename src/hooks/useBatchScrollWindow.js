import { useState, useCallback, useEffect, useRef } from "react";

export default function useBatchScrollWindow({
   data,
   visibleData,
   setVisibleData,
   topData,
   setTopData,
   batchSize = 50,
   scrollClassName,
}) {
   const smallBatch = 35;
   const [currentBatch, setCurrentBatch] = useState(1);

   // Refs to always have latest state in handler
   const visibleDataRef = useRef(visibleData);
   const topDataRef = useRef(topData);

   useEffect(() => { visibleDataRef.current = visibleData; }, [visibleData]);
   useEffect(() => { topDataRef.current = topData; }, [topData]);

   // Reset window if data changes
   useEffect(() => {
      setVisibleData(data.slice(0, batchSize));
      setTopData([]);
      setCurrentBatch(1);
      const tableElement = document.querySelector(`.${scrollClassName}`);
      if (tableElement) tableElement.scrollTop = 0;
   }, [data, batchSize, scrollClassName, setVisibleData, setTopData]);

   const handleScroll = useCallback(
      (event) => {
         const tableElement = event.target;
         const { scrollTop, scrollHeight, clientHeight } = tableElement;
         // Scroll to bottom: batching logic
         if (scrollHeight - scrollTop <= clientHeight * 1.2) {
            const nextBatchStart = currentBatch * batchSize;
            if (visibleDataRef.current.length >= smallBatch) {
               const newTopData = [...topDataRef.current, ...visibleDataRef.current.slice(0, smallBatch)];
               setTopData(newTopData);
               setVisibleData(prev => prev.slice(smallBatch));
            }
            if (nextBatchStart < data.length) {
               setVisibleData(prevData => [
                  ...prevData,
                  ...data.slice(nextBatchStart, nextBatchStart + batchSize),
               ]);
               setCurrentBatch(prevBatch => prevBatch + 1);
               tableElement.scrollTop = scrollHeight - clientHeight - (scrollHeight - clientHeight) * 0.2;
            }
         }
         // Scroll to top: batching logic
         if (scrollTop <= 5) {
            if (topDataRef.current.length >= smallBatch) {
               const newVisibleData = [...topDataRef.current.slice(-smallBatch), ...visibleDataRef.current];
               const newTopData = topDataRef.current.slice(0, topDataRef.current.length - smallBatch);
               setTopData(newTopData);
               setVisibleData(newVisibleData);
               setCurrentBatch(prevBatch => Math.max(prevBatch - 1, 0));
               tableElement.scrollTop = (scrollHeight - clientHeight) * 0.2;
            }
         }
      },
      [currentBatch, batchSize, data, setVisibleData, setTopData]
   );

   // Attach scroll handler to the element with the given class name
   useEffect(() => {
      if (!scrollClassName) return;
      const tableElement = document.querySelector(`.${scrollClassName}`);
      if (tableElement) {
         tableElement.addEventListener("scroll", handleScroll);
      }
      return () => {
         if (tableElement) {
            tableElement.removeEventListener("scroll", handleScroll);
         }
      };
   }, [handleScroll, scrollClassName]);
} 