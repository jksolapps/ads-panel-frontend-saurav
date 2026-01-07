/** @format */

import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ReportContext } from '../context/ReportContext';
import { SITE_NAME } from '../utils/helper';

const Footer = () => {
	const year = new Date().getFullYear();

	// const { setDimensionValue } = useContext(ReportContext);
	// let location = useLocation();
	// useEffect(() => {
	//   setDimensionValue([
	//     {
	//       id: "APP",
	//       name: "Apps",
	//       dimension_checked: true,
	//       dimension_id: 1,
	//       key: "app_display_name",
	//       pin_key: true,
	//       data_column_id: 1
	//     },
	//     {
	//       id: "DATE",
	//       name: "Date",
	//       dimension_checked: true,
	//       dimension_id: 2,
	//       key: "report_date",
	//       pin_key: false,
	//       data_column_id: 2
	//     },
	//     {
	//       id: "DAY",
	//       name: "Day",
	//       dimension_checked: false,
	//       key: "report_date",
	//       pin_key: false,
	//       dimension_id: 3,
	//       data_column_id: 3
	//     },
	//     {
	//       id: "AD_UNIT",
	//       name: "Ad Unit",
	//       dimension_checked: false,
	//       key: "au_display_name",
	//       pin_key: false,
	//       data_column_id: 4
	//     },
	//     {
	//       id: "FORMAT",
	//       name: "Format",
	//       dimension_checked: false,
	//       key: "au_format",
	//       pin_key: false,
	//       data_column_id: 5
	//     },
	//     {
	//       id: "COUNTRY",
	//       name: "Country",
	//       dimension_checked: false,
	//       key: "country_name",
	//       pin_key: false,
	//       data_column_id: 6
	//     },
	//     {
	//       id: "APP_VERSION_NAME",
	//       name: "App Version",
	//       dimension_checked: false,
	//       key: "app_version",
	//       pin_key: false,
	//       data_column_id: 7
	//     }
	//   ]);
	// }, [location]);

	return (
		// <footer className="footer-wrap">
		//   <span className="footer-copyright">
		//     © {year} {""}
		//     <a href="https://jksol.com/" target="_blank" className="site-name">
		//       {SITE_NAME}
		//     </a>
		//   </span>
		// </footer>
		null
	);
};

export default Footer;
