/** @format */
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-multi-date-picker";

export default function GeneralMonthPicker({
   selectedMonths,
   setSelectedMonths,
   fetchFlags,
   setFetchFlags,
}) {
   const [tempMonths, setTempMonths] = useState([]);
   const [shouldCloseCalendar, setShouldCloseCalendar] = useState(false);

   const pickerRef = useRef();

   useEffect(() => {
      const savedRange = sessionStorage.getItem("selectedMonthRange");
      if (savedRange) {
         try {
            const parsed = JSON.parse(savedRange);
            setSelectedMonths(parsed);
            setTempMonths(parsed);
         } catch (err) {
            console.error("Failed to parse saved month range:", err);
         }
      } else if (!selectedMonths || selectedMonths.length === 0) {
         const startOfYear = moment().startOf("year").toDate();
         const currentMonth = moment().endOf("month").toDate();
         setSelectedMonths([startOfYear, currentMonth]);
         setTempMonths([startOfYear, currentMonth]);
         sessionStorage.setItem(
            "selectedMonthRange",
            JSON.stringify([startOfYear, currentMonth])
         );
      }
   }, []);

   useEffect(() => {
      const handleOutsideClick = (event) => {
         if (
            pickerRef.current &&
            !event.target.closest(".custom_month_picker")
         ) {
            setShouldCloseCalendar(true);
         } else {
            setShouldCloseCalendar(false);
         }
      };
      document.addEventListener("mousedown", handleOutsideClick);
      return () => {
         document.removeEventListener("mousedown", handleOutsideClick);
      };
   }, []);

   function MyPlugin() {
      return (
         <div className="bottom_btn_wrap">
            <div
               className="date-picker-apply apply-btn"
               onClick={handleApply}
               style={{ width: "100%", cursor: "pointer" }}
            >
               Apply
            </div>
         </div>
      );
   }

   const handleApply = () => {
      if (tempMonths.length === 2) {
         setSelectedMonths(tempMonths);
         sessionStorage.setItem("selectedMonthRange", JSON.stringify(tempMonths));
      }
      setFetchFlags(!fetchFlags);
      setShouldCloseCalendar(true);
   };

   return (
      <div className={`custom_month_picker_wrap ${selectedMonths?.length > 0 ? "date_selected" : ""}`}>
         <DatePicker
            ref={pickerRef}
            value={tempMonths}
            onChange={(date) => setTempMonths(date)}
            range
            onlyMonthPicker
            onOpen={() => setShouldCloseCalendar(false)}
            onClose={() => shouldCloseCalendar}
            format="MMM YYYY"
            className="custom_month_picker"
            placeholder="Select Month Range"
            plugins={[<MyPlugin position="bottom" />]}
            mapDays={({ date, today }) => {
               let props = {};
               if (date > today.endOf("month")) {
                  props.disabled = true;
                  props.style = { color: "#cccccc" };
               }
               return props;
            }}
         />
      </div>
   );
}
