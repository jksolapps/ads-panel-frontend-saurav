import { useEffect, useState } from "react";

const useStickyOnScroll = ({ topSpace }) => {
   const [addClass, setAddClass] = useState(false);
   useEffect(() => {
      const rootElement = document.getElementById("root");
      const headerElement = document.querySelector(".app-bar-menu");

      if (!rootElement) return;


      const handleScroll = () => {
         const headerHeightExtra = headerElement?.offsetHeight || 0;
         const headerHeight = topSpace + headerHeightExtra;
         const scrollTop = rootElement.scrollTop;
         if (scrollTop > headerHeight) {
            setAddClass(true);
         } else {
            setAddClass(false);
         }
      };
      rootElement.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => {
         rootElement.removeEventListener("scroll", handleScroll);
      };
   }, []);

   return { addClass }
};

export default useStickyOnScroll;
