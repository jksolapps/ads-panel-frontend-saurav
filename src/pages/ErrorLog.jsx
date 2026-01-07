/** @format */

import React from 'react';
import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import ErrorLogBox from '../components/ErrorLogComponents/ErrorLogBox';
import TopBar from '../components/TopBar';
const ErrorLog = () => {
	return (
		<>
			<Helmet>
				<title>Error Log</title>
			</Helmet>
			<div className='main-wrapper new_parent_wrap'>
				<Sidebar />
				<div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
					<TopBar />
					<ErrorLogBox />
				</div>
			</div>
		</>
	);
};

export default ErrorLog;
