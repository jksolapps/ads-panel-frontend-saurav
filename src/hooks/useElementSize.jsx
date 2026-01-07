import { useEffect, useState } from "react";

export function useElementSize(ref) {
   const [size, setSize] = useState({ width: 0, height: 0 });

   useEffect(() => {
      if (!ref.current) return;
      const el = ref.current;

      // Initial measure
      setSize({ width: el.clientWidth, height: el.clientHeight });

      // Observe changes
      const ro = new ResizeObserver((entries) => {
         for (const entry of entries) {
            const cr = entry.contentRect;
            setSize({ width: Math.round(cr.width), height: Math.round(cr.height) });
         }
      });
      ro.observe(el);
      return () => ro.disconnect();
   }, [ref]);

   return size;
}
