/** @format */
/** @format */

import Sidebar from '../components/Sidebar';
import { Helmet } from 'react-helmet-async';
import HeatmapBox from '../components/HeatMap/HeatmapBox';
import TopBar from '../components/TopBar';
import { useState } from 'react';

const HeatMap = () => {
	const [heatmapApp, setHeatmapApp] = useState(() => {
		const stored = sessionStorage.getItem('heatmap_app_filter');
		return stored ? JSON.parse(stored) : [];
	});

	const finalSelectedApp = heatmapApp?.map((item) => item.app_display_name).join(',');

	return (
		<>
			<Helmet>
				<title>{`${finalSelectedApp.length > 0 ? finalSelectedApp + ' |' : ''}`} Heatmap</title>
			</Helmet>
			<div className='main-wrapper new_parent_wrap'>
				<Sidebar />
				<div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
					<TopBar />
					<HeatmapBox heatmapApp={heatmapApp} setHeatmapApp={setHeatmapApp} />
				</div>
			</div>
		</>
	);
};

export default HeatMap;
