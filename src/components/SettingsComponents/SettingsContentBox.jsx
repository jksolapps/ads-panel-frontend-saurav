/** @format */

import React, { useContext, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import AccountContentBox from '../AccountComponents/AccountContentBox';
import Footer from '../Footer';
import PermissionContentBox from '../PermissionComponent/PermissionContentBox';
import UserContentBox from '../UserComponents/UserContentBox';
import PersonalContentBox from './PersonalContentBox';
import GroupContentBox from '../Group/GroupContentBox';
import IpContentBox from '../IpComponents/IpContentBox';

const SettingsContentBox = () => {
	const { role, tab, setTab } = useContext(DataContext);

	return (
		<div className={`right-box-wrap custom-setting-wrap`}>
			<div className='table-box-wrap main-box-wrapper pdglr24'>
				<div className='userBoxWrap user-section-wrapper'>
					{/* <div className="button-top-wrap">
            <h1 className="title">Settings</h1>
          </div> */}
					<div className='tab-container ad-units-box user-table-box'>
						<div className='tab-top-bar'>
							<div
								onClick={() => {
									setTab({
										personalTab: true,
										accountTab: false,
										userTab: false,
										permissionTab: false,
										cron: false,
									});
								}}
								className={`tab-item ${tab.personalTab && 'tab-active'} `}
							>
								Personal
							</div>
							<div
								id='AccountTour'
								onClick={() => {
									setTab({
										personalTab: false,
										accountTab: true,
										userTab: false,
										permissionTab: false,
										cron: false,
									});
								}}
								className={`tab-item ${tab.accountTab && 'tab-active'} `}
							>
								AdMob Account
							</div>
							{role == 1 && (
								<div
									onClick={() => {
										setTab({
											personalTab: false,
											accountTab: false,
											userTab: true,
											permissionTab: false,
											cron: false,
										});
									}}
									className={`tab-item ${tab.userTab && 'tab-active'}`}
								>
									Users
								</div>
							)}
							{role == 1 && (
								<div
									onClick={() => {
										setTab({
											personalTab: false,
											accountTab: false,
											userTab: false,
											permissionTab: true,
											cron: false,
										});
									}}
									className={`tab-item ${tab.permissionTab && 'tab-active'}`}
								>
									Permission
								</div>
							)}
							{role == 1 && (
								<div
									onClick={() => {
										setTab({
											personalTab: false,
											accountTab: false,
											userTab: false,
											permissionTab: false,
											groupTab: true,
											cron: false,
										});
									}}
									className={`tab-item ${tab.groupTab && 'tab-active'}`}
								>
									Group
								</div>
							)}
							{role == 1 && (
								<div
									onClick={() => {
										setTab({
											personalTab: false,
											accountTab: false,
											userTab: false,
											permissionTab: false,
											groupTab: false,
											IpTab: true,
											cron: false,
										});
									}}
									className={`tab-item ${tab.IpTab && 'tab-active'}`}
								>
									IP
								</div>
							)}
						</div>
						<div className='tab-content'>
							{tab.personalTab && <PersonalContentBox />}
							{tab.accountTab && <AccountContentBox />}
							{tab.userTab && role == 1 && <UserContentBox />}
							{tab.permissionTab && role == 1 && <PermissionContentBox />}
							{tab.groupTab && role == 1 && <GroupContentBox />}
							{tab.IpTab && role == 1 && <IpContentBox />}
						</div>
					</div>
				</div>
				<Footer />
			</div>
		</div>
	);
};

export default SettingsContentBox;
