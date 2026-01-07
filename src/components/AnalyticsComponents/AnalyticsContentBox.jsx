/** @format */

import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';
import { DataContext } from '../../context/DataContext';
import AnalyticsSettings from './AnalyticsSettings';
import AnalyticsAccount from './AnalyticsAccount';
import AnalyticsCampaign from './AnalyticsCampaign';
import AnalyticsActivityTab from './AnalyticsActivityTab';

const AnalyticsDimensionBox = () => {
	const { analyticstab, setAnalyticsTab } = useContext(DataContext);
	return (
		<>
			<Helmet>
				<title>Settings</title>
			</Helmet>
			<div className='main-wrapper new_parent_wrap'>
				<Sidebar />
				<div className={`custom_right_box ${window.innerWidth < 570 ? 'header_show' : ''}`}>
					<TopBar />
					<div className='right-box-wrap custom-setting-wrap anlaytics-setting-box'>
						<div className='table-box-wrap main-box-wrapper pdglr24'>
							<div className='userBoxWrap user-section-wrapper'>
								<div className='tab-container ad-units-box user-table-box'>
									<div className='tab-top-bar'>
										<div
											onClick={() => {
												setAnalyticsTab(() => {
													const tabActiveState = {
														account: true,
														property: false,
														campaign: false,
														activity: false,
													};
													sessionStorage.setItem('analytics_tab_state', JSON.stringify(tabActiveState));
													return tabActiveState;
												});
											}}
											className={`tab-item ${analyticstab.account && 'tab-active'} `}
										>
											Account
										</div>

										<div
											onClick={() => {
												setAnalyticsTab(() => {
													const tabActiveState = {
														account: false,
														property: true,
														campaign: false,
														activity: false,
													};
													sessionStorage.setItem('analytics_tab_state', JSON.stringify(tabActiveState));
													return tabActiveState;
												});
											}}
											className={`tab-item ${analyticstab.property && 'tab-active'} `}
										>
											Property
										</div>
										<div
											onClick={() => {
												setAnalyticsTab(() => {
													const tabActiveState = {
														account: false,
														property: false,
														campaign: true,
														activity: false,
													};
													sessionStorage.setItem('analytics_tab_state', JSON.stringify(tabActiveState));
													return tabActiveState;
												});
											}}
											className={`tab-item ${analyticstab.campaign && 'tab-active'} `}
										>
											Campaign
										</div>
										<div
											onClick={() => {
												setAnalyticsTab(() => {
													const tabActiveState = {
														account: false,
														property: false,
														campaign: false,
														activity: true,
													};
													sessionStorage.setItem('analytics_tab_state', JSON.stringify(tabActiveState));
													return tabActiveState;
												});
											}}
											className={`tab-item ${analyticstab.activity && 'tab-active'} `}
										>
											Activity
										</div>
									</div>

									<div className='tab-content'>
										{analyticstab.account && <AnalyticsAccount />}
										{analyticstab.property && <AnalyticsSettings />}
										{analyticstab.campaign && <AnalyticsCampaign />}
										{analyticstab.activity && <AnalyticsActivityTab />}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default AnalyticsDimensionBox;
