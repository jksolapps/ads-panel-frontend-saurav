/** @format */

import { useContext, useState } from 'react';
import Tippy from '@tippyjs/react';
import { DataContext } from '../../context/DataContext';
import { ReactComponent as ProfileIcon } from '../../assets/images/user_profile.svg';
import ThemeToggle from './ThemeToggle';
import { TbSettings, TbSettingsDollar } from 'react-icons/tb';
import GroupSelectBox from '../GroupSettings/GroupSelectBox';
import { MdErrorOutline } from 'react-icons/md';
import { IoGitCompareOutline } from 'react-icons/io5';
import { PiSignOutBold } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';

const SidebarProfile = ({ handleAlert }) => {
	const { role, isDarkMode, setIsDarkMode, profileImage } = useContext(DataContext);
	const [profileOpen, setProfileOpen] = useState(false);
	const [groupMenuOpen, setGroupMenuOpen] = useState(false);
	const navigate = useNavigate();

	const name = localStorage.getItem('name') || '';
	const firstName = name.split(' ')[0] || '';
	const email = localStorage.getItem('email') || '';

	const isMobile = typeof window !== 'undefined' && window.innerWidth <= 569;
	const tippyOffset = isMobile ? [185, 0] : [2, 30];

	return (
		<div className='notification-user-box'>
			<Tippy
				interactive={true}
				visible={profileOpen}
				onClickOutside={(instance, event) => {
					const target = event.target;
					if (target.closest('.group_select_item_box') || target.closest('.group_select_menu')) {
						return;
					}
					setProfileOpen(false);
					setGroupMenuOpen(false);
				}}
				placement='right'
				appendTo={() => document.body}
				offset={tippyOffset}
				className='side_bar_tippy'
				content={
					<div className='profile-box tippy_content_submenu'>
						<div className='button-box'>
							<div className='img-box profile_photo'>
								{profileImage ? (
									<img
										src={profileImage}
										alt='Profile'
										className='profile-avatar'
										style={{
											width: 36,
											height: 36,
											borderRadius: '50%',
											objectFit: 'cover',
											transform: 'scaleX(-1)',
										}}
									/>
								) : (
									<ProfileIcon />
								)}
							</div>
							<div className='text-box'>
								<h2>{name}</h2>
								<div>{email}</div>
							</div>
							<div className='custom_theme_toggle'>
								<ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
							</div>
						</div>

						<div className='user-main-box'>
							<div className='popup-footer'>
								<div onClick={() => navigate('/settings')} className='sign-btn'>
									<TbSettings className='sidebar_icon user-icon' />
									Admob Settings
								</div>
							</div>

							{role == 1 && (
								<div className='popup-footer'>
									<div onClick={() => navigate('/analytics-settings')} className='sign-btn'>
										<TbSettingsDollar className='sidebar_icon user-icon' />
										Analytics Settings
									</div>
								</div>
							)}

							<GroupSelectBox
								groupMenuOpen={groupMenuOpen}
								setGroupMenuOpen={setGroupMenuOpen}
								closeProfileMenu={() => setProfileOpen(false)}
							/>

							{role == 1 && (
								<>
									<div className='popup-footer'>
										<div onClick={() => navigate('/error-logs')} className='sign-btn'>
											<MdErrorOutline className='sidebar_icon user-icon' />
											Error Logs
										</div>
									</div>
									<div className='popup-footer'>
										<div onClick={() => navigate('/logs')} className='sign-btn'>
											<IoGitCompareOutline className='sidebar_icon user-icon' />
											Logs
										</div>
									</div>
								</>
							)}

							<div className='popup-footer'>
								<div onClick={handleAlert} className='sign-btn'>
									<PiSignOutBold className='sidebar_icon user-icon' />
									Logout
								</div>
							</div>
						</div>
					</div>
				}
			>
				{/* trigger */}
				<div
					className={`user-btn`}
					onClick={(e) => {
						e.stopPropagation();
						setProfileOpen((prev) => !prev);
					}}
				>
					<>
						{profileImage ? (
							<img
								src={profileImage}
								alt='Profile'
								className='profile-avatar'
								style={{
									width: 35,
									height: 35,
									borderRadius: '50%',
									objectFit: 'cover',
									transform: 'scaleX(-1)',
								}}
							/>
						) : (
							<ProfileIcon style={{ width: 35, height: 35 }} />
						)}
						<p
							style={{
								fontSize: 11,
								textAlign: 'center',
								marginBottom: 0,
							}}
							className='profile_name'
						>
							{firstName}
						</p>
					</>
				</div>
			</Tippy>
		</div>
	);
};

export default SidebarProfile;
