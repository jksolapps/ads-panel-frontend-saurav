/** @format */

import React from 'react';
import ReportContentBox from '../components/ReportComponents/ReportContentBox';
import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import TopBar from '../components/TopBar';

const Reports = () => {
	return (
		<>
			<Helmet>
				<title>Reports</title>
			</Helmet>
			<div className='main-wrapper new_parent_wrap'>
				<Sidebar />
				<div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
					<TopBar />
					<ReportContentBox />
				</div>
			</div>
		</>
	);
};

export default Reports;
