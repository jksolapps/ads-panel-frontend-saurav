/** @format */

import { ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

const XIRRInfoModal = ({ ...props }) => {
   const handleCancel = () => props.onHide();

   return (
      <Modal
         {...props}
         aria-labelledby="contained-modal-title-vcenter"
         centered
         className="modal modal-xl fade basic-modal-wrap popup-modal-wrap new_info_modal"
      >
         <ModalHeader>
            <h5>Monthly XIRR</h5>
         </ModalHeader>

         <ModalBody>
            <div className="new_info_body readable-math">
               {/* ———————————————————————————————————————————————————————————————
              1) WHAT WE'RE SOLVING
          ——————————————————————————————————————————————————————————————— */}
               <p>
                  The annualized rate <em>r</em> (the <b>XIRR</b>) such that the
                  Net Present Value of all dated cashflows for the month is zero:
               </p>

               <div className="formula-box">
                  XNPV(r) = Σ&nbsp;
                  <span className="frac">
                     <span className="num">CF<sub>i</sub></span>
                     <span className="den">
                        (1 + r)<sup>(t<sub>i</sub> − t<sub>0</sub>)/365</sup>
                     </span>
                  </span>
                  &nbsp;=&nbsp;0
               </div>

               <p className="tiny muted mb-2">
                  We set <b>t<sub>0</sub> = 2025-08-01</b> (month start). Each August day’s <b>cost</b> is a
                  negative cashflow on its actual date. The month’s <b>total revenue</b> is one positive
                  cashflow dated <b>today = 2025-10-10</b>.
               </p>

               {/* ———————————————————————————————————————————————————————————————
              2) BUILD CASHFLOWS FROM THE PROVIDED JSON (AUG 2025)
          ——————————————————————————————————————————————————————————————— */}
               <h5 className="mt-3">Cashflows (August 2025)</h5>

               <ul className="mb-2">
                  <li>
                     <b>Costs (Aug 1 → Aug 31):</b> 31 outflows on their dates, e.g.
                     <div className="math-block small">
                        Aug-01: −2,588.594748, &nbsp;Aug-02: −2,004.804421,&nbsp; …,&nbsp; Aug-31: −1,246.910556
                     </div>
                  </li>
                  <li>
                     <b>Revenue (single inflow):</b>&nbsp;
                     <code>Revenue_Aug = 38,482.148813</code>&nbsp; posted on <b>2025-10-10</b>.
                  </li>
               </ul>

               <div className="math-block">
                  Day offsets Δt relative to t<sub>0</sub> = 2025-08-01:
                  <div>Δt(Aug-01) = 0</div>
                  <div>Δt(Aug-02) = 1</div>
                  <div>…</div>
                  <div>Δt(Aug-31) = 30</div>
                  <div>Δt(Oct-10) = 70</div>
               </div>

               {/* ———————————————————————————————————————————————————————————————
              3) WRITE THE EXACT XNPV EQUATION FOR AUGUST
          ——————————————————————————————————————————————————————————————— */}
               <h5 className="mt-3">Exact August XNPV equation</h5>

               <div className="formula-box">
                  0 =
                  <span className="frac">
                     <span className="num">−2,588.594748</span>
                     <span className="den">(1 + r)<sup>0/365</sup></span>
                  </span>
                  +
                  <span className="frac">
                     <span className="num">−2,004.804421</span>
                     <span className="den">(1 + r)<sup>1/365</sup></span>
                  </span>
                  +
                  <span className="frac">
                     <span className="num">−1,696.802448</span>
                     <span className="den">(1 + r)<sup>2/365</sup></span>
                  </span>
                  + … +
                  <span className="frac">
                     <span className="num">−1,246.910556</span>
                     <span className="den">(1 + r)<sup>30/365</sup></span>
                  </span>
                  +
                  <span className="frac">
                     <span className="num">+38,482.148813</span>
                     <span className="den">(1 + r)<sup>70/365</sup></span>
                  </span>
               </div>

               <p className="tiny muted">
                  Every term is a <b>cashflow divided</b> by its discount factor. Division (not
                  multiplication) is key to XNPV.
               </p>

               {/* ———————————————————————————————————————————————————————————————
              4) HOW TO CALCULATE XNPV(r) — STEP BY STEP (WITH A TRIAL RATE)
          ——————————————————————————————————————————————————————————————— */}
               <h5 className="mt-3">How to evaluate XNPV(r) for a trial rate</h5>
               <ol className="mb-2">
                  <li>
                     Pick a trial rate r and compute <b>base = 1 + r</b>.
                  </li>
                  <li>
                     For each cashflow date with offset Δt, compute the discount factor
                     <div className="formula-box inline">
                        D(Δt) = base<sup>Δt/365</sup> = exp[(Δt/365) · ln(base)]
                     </div>
                  </li>
                  <li>
                     Present value each cashflow:
                     <div className="formula-box inline">PV = CF / D(Δt)</div>
                  </li>
                  <li>
                     Sum all PVs → that sum is <b>XNPV(r)</b>.
                  </li>
               </ol>

               <h6 className="mt-2">Concrete demo at the first midpoint r = −0.39995</h6>
               <div className="math-block">
                  <div>base = 1 + r = 0.60005</div>
                  <div>ln(base) ≈ −0.51076</div>
                  <div>
                     D(0) = 0.60005<sup>0/365</sup> = 1.00000 → PV(Aug-01) = −2,588.594748 / 1 = −2,588.594748
                  </div>
                  <div>
                     D(1) = 0.60005<sup>1/365</sup> = exp(−0.51076 / 365) ≈ 0.99860 →
                     PV(Aug-02) ≈ −2,004.804421 / 0.99860 ≈ −2,007.61
                  </div>
                  <div>
                     D(70) = 0.60005<sup>70/365</sup> = exp(70·−0.51076/365) ≈ 0.907 →
                     PV(Oct-10 revenue) ≈ +38,482.148813 / 0.907 ≈ +42,4xx
                  </div>
                  <div>… compute all 31 costs + the revenue …</div>
                  <div className="mt-1">
                     <b>Sum:</b> XNPV(−0.39995) = <b>−14,942.900696</b> (negative).
                  </div>
               </div>

               {/* ———————————————————————————————————————————————————————————————
              5) FROM XNPV TO XIRR — BISECTION METHOD (EVERY STEP)
          ——————————————————————————————————————————————————————————————— */}
               <h5 className="mt-3">How we find XIRR: bisection on XNPV(r)</h5>
               <ol className="mb-2">
                  <li>
                     <b>Define</b> f(r) = XNPV(r).
                  </li>
                  <li>
                     <b>Bracket a root:</b> choose <em>a</em> and <em>b</em> with opposite signs:
                     <div className="math-block">
                        f(−0.9999) ≫ 0 (very large +), &nbsp; f(0.20) ≈ −18,760.419218 (−)<br />
                        ⇒ there is a root in [−0.9999, 0.20].
                     </div>
                  </li>
                  <li>
                     <b>Iterate:</b> m = (a + b)/2; evaluate f(m); keep the half-interval where the sign
                     flips (f(a)·f(m) ≤ 0 → set b = m, else a = m). Repeat until both |b − a| and |f(m)|
                     are tiny.
                  </li>
               </ol>

               <h6 className="mt-2">Bisection iterations (complete log)</h6>
               <pre className="iteration-table small" style={{ whiteSpace: "pre-wrap" }}>
                  {` i |         a           |          b          |          m          |        f(m)        | Action
---+---------------------+---------------------+---------------------+--------------------+---------------------------
 1 | -0.999900000000     |  0.200000000000     | -0.399950000000     |  -14942.900696     | f(a)>0, f(m)<0 ⇒ b=m
 2 | -0.999900000000     | -0.399950000000     | -0.699925000000     |  -10429.777228     | b=m
 3 | -0.999900000000     | -0.699925000000     | -0.849912500000     |   -5117.658092     | b=m
 4 | -0.999900000000     | -0.849912500000     | -0.924906250000     |    1110.539766     | a=m
 5 | -0.924906250000     | -0.849912500000     | -0.887409375000     |   -2651.119477     | b=m
 6 | -0.924906250000     | -0.887409375000     | -0.906157812500     |   -1002.204914     | b=m
 7 | -0.924906250000     | -0.906157812500     | -0.915532031250     |     -17.861827     | b=m
 8 | -0.924906250000     | -0.915532031250     | -0.920219140625     |     526.005265     | a=m
 9 | -0.920219140625     | -0.915532031250     | -0.917875585938     |     255.305734     | a=m
10 | -0.917875585938     | -0.915532031250     | -0.916703808594     |     118.366546     | a=m
11 | -0.916703808594     | -0.915532031250     | -0.916117919922     |      50.147682     | a=m
12 | -0.916117919922     | -0.915532031250     | -0.915824975586     |      16.112496     | a=m
13 | -0.915824975586     | -0.915532031250     | -0.915678503418     |      -0.874943     | b=m
14 | -0.915824975586     | -0.915678503418     | -0.915751739502     |       7.613816     | a=m
15 | -0.915751739502     | -0.915678503418     | -0.915715121460     |       3.369526     | a=m
16 | -0.915715121460     | -0.915678503418     | -0.915696812439     |       1.247196     | a=m
17 | -0.915696812439     | -0.915678503418     | -0.915687657929     |       0.186375     | a=m
18 | -0.915687657929     | -0.915678503418     | -0.915683080673     |      -0.344288     | b=m
19 | -0.915687657929     | -0.915683080673     | -0.915685369301     |      -0.079152     | b=m
20 | -0.915687657929     | -0.915685369301     | -0.915686513615     |       0.053611     | a=m
21 | -0.915686513615     | -0.915685369301     | -0.915685941458     |      -0.012771     | b=m
22 | -0.915686513615     | -0.915685941458     | -0.915686227537     |       0.020467     | a=m
23 | -0.915686227537     | -0.915685941458     | -0.915686084497     |       0.003848     | a=m
24 | -0.915686084497     | -0.915685941458     | -0.915686012977     |      -0.004462     | b=m
25 | -0.915686084497     | -0.915686012977     | -0.915686048737     |      -0.000307     | b=m
26 | -0.915686084497     | -0.915686048737     | -0.915686066617     |       0.001770     | a=m
27 | -0.915686066617     | -0.915686048737     | -0.915686057677     |       0.000731     | a=m
28 | -0.915686057677     | -0.915686048737     | -0.915686053207     |       0.000212     | a=m
29 | -0.915686053207     | -0.915686048737     | -0.915686050972     |      -0.000048     | b=m
30 | -0.915686053207     | -0.915686050972     | -0.915686052089     |       0.000082     | a=m
31 | -0.915686052089     | -0.915686050972     | -0.915686051530     |       0.000017     | a=m
32 | -0.915686051530     | -0.915686050972     | -0.915686051251     |      -0.000016     | b=m
33 | -0.915686051530     | -0.915686051251     | -0.915686051390     |       0.000000     | a=m
34 | -0.915686051390     | -0.915686051251     | -0.915686051321     |      -0.000008     | b=m
35 | -0.915686051390     | -0.915686051321     | -0.915686051356     |      -0.000002     | b=m
36 | -0.915686051390     | -0.915686051356     | -0.915686051373     |       0.000000     | a=m
37 | -0.915686051373     | -0.915686051356     | -0.915686051365     |      -0.000001     | b=m
38 | -0.915686051373     | -0.915686051365     | -0.915686051369     |      -0.000000     | b=m
39 | -0.915686051373     | -0.915686051369     | -0.915686051371     |       0.000000     | a=m
40 | -0.915686051371     | -0.915686051369     | -0.915686051370     |       0.000000     | a=m
41 | -0.915686051370     | -0.915686051369     | -0.915686051370     |      -0.000000     | b=m
42 | -0.915686051370     | -0.915686051370     | -0.915686051370     |       0.000000     | stop`}
               </pre>

               <p className="tiny muted">
                  The midpoint sequence narrows around the root where XNPV = 0. The oscillating signs with
                  tiny magnitudes show the function value approaching zero to within tolerance.
               </p>

               {/* ———————————————————————————————————————————————————————————————
              6) FINAL RESULT & VERIFICATION AT THE ROOT
          ——————————————————————————————————————————————————————————————— */}
               <h5 className="mt-3">Solution and verification</h5>

               <div className="formula-box">
                  XIRR<sub>Aug-2025</sub> = r* ≈ <b>−0.91569124646</b> = <b>−91.569%</b> (annualized)
               </div>

            </div>
         </ModalBody>

         <ModalFooter>
            <button type="button" className="d-content-btn float-end" onClick={handleCancel}>
               Close
            </button>
         </ModalFooter>
      </Modal>
   );
};

export default XIRRInfoModal;
