/** @format */
/** @format */

import React from 'react';
import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import CampaignBox from '../components/Campaign/CampaignBox';
import TopBar from '../components/TopBar';

const Campaign = () => {
	return (
		<>
			<Helmet>
				<title>Campaign</title>
			</Helmet>
			<div className='main-wrapper new_parent_wrap general-wrapper'>
				<Sidebar />
				<div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
					<TopBar />
					<CampaignBox />
				</div>
			</div>
		</>
	);
};

export default Campaign;
