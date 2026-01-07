/** @format */

import React from 'react';
import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import AnalyticsBox from "../components/AnalyticsComponents/AnalyticsBox";
import TopBar from '../components/TopBar';

const AnalyticsMain = () => {
	return (
		<>
			<Helmet>
				<title>Analytics</title>
			</Helmet>
			<div className='main-wrapper new_parent_wrap'>
				<Sidebar />
				<div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
					<TopBar />
					<AnalyticsBox />
				</div>
			</div>
		</>
	);
};

export default AnalyticsMain;
