/** @format */

import React from 'react';
import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import RetentionBox from '../components/UserRetention/RetentionBox';
import TopBar from '../components/TopBar';

const Retention = () => {
	return (
		<>
			<Helmet>
				<title>Retention</title>
			</Helmet>
			<div className='main-wrapper new_parent_wrap'>
				<Sidebar />
				<div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
					<TopBar />
					<RetentionBox />
				</div>
			</div>
		</>
	);
};

export default Retention;
