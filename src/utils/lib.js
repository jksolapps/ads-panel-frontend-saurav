
export function xnpv(rate, cashflows, baseDate) {
   const baseMs = +baseDate;
   let v = 0;
   for (const { date, amount } of cashflows) {
      const days = (Number(date) - baseMs) / 86400000;
      v += amount / Math.pow(1 + rate, days / 365);
   }
   return v;
}

export function bracketXirr(cashflows, baseDate, initLow = -0.9999, initHigh = 0.2) {
   let low = initLow, high = initHigh;
   let fLow = xnpv(low, cashflows, baseDate);
   let fHigh = xnpv(high, cashflows, baseDate);

   const MAX_HIGH = 100;
   const GROW = 2.0;

   let iter = 0;
   while (fLow * fHigh > 0 && high < MAX_HIGH && iter < 200) {
      if (fLow > 0 && fHigh > 0) {
         high = high * GROW + 0.01;
         fHigh = xnpv(high, cashflows, baseDate);
      } else {
         const nextLow = Math.max(low - 0.2, -0.999999);
         if (nextLow === low) break;
         low = nextLow;
         fLow = xnpv(low, cashflows, baseDate);
      }
      iter++;
   }
   if (fLow * fHigh > 0) return null;
   return { low, high, fLow, fHigh };
}

export function xirr(cashflows, baseDate, tolRate = 1e-10, tolXnpv = 1e-10) {
   const bracket = bracketXirr(cashflows, baseDate);
   if (!bracket) return NaN;

   let { low: a, high: b, fLow: fa, fHigh: fb } = bracket;
   const maxIter = Math.ceil(Math.log2((b - a) / Math.max(tolRate, 1e-16))) + 4;

   for (let i = 0; i < maxIter; i++) {
      const m = (a + b) / 2;
      const fm = xnpv(m, cashflows, baseDate);
      if (Math.abs(fm) < tolXnpv || Math.abs(b - a) < tolRate) return m;
      if (fa * fm <= 0) { b = m; fb = fm; } else { a = m; fa = fm; }
   }
   return (a + b) / 2;
}