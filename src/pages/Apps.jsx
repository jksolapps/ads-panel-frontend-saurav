/** @format */

import AppContentBox from '../components/AppComponents/AppContentBox';
import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import TopBar from '../components/TopBar';

const Apps = () => {
	return (
		<>
			<Helmet>
				<title>All Apps</title>
			</Helmet>
			<div className='main-wrapper new_parent_wrap'>
				<Sidebar />
				<div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
					<TopBar />
					<AppContentBox />
				</div>
			</div>
		</>
	);
};

export default Apps;
