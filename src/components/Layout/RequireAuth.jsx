/** @format */

import { useLocation, Navigate, Outlet } from 'react-router-dom';
import Shepherd from 'shepherd.js';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';
import UserGuideModal from '../UserGuideModal';

const RequireAuth = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [guideModalShow, setGuideModalShow] = useState(false);
	const { setTab, setAccModalShow, guideStart, setGuideStart, isGuideVisible, setIsGuideVisible } =
		useContext(DataContext);

	useEffect(() => {
		const tour = new Shepherd.Tour({
			defaultStepOptions: {
				cancelIcon: {
					enabled: true,
				},
			},
			useModalOverlay: true,
		});

		tour.addStep({
			id: 'step1',
			text: 'Click on setting to open account tab',
			title: 'Settings',
			scrollTo: {
				behavior: 'smooth',
				block: 'center',
			},
			attachTo: {
				element: '#settingsElement',
				on: 'bottom',
			},
			buttons: [
				{
					text: 'Skip',
					action: function () {
						const tour = this;
						tour.hide();
					},
				},
				{
					text: 'Next',
					action: function () {
						const tour = this;
						tour.next();
						navigate('/settings');
					},
				},
			],
		});

		tour.addStep({
			id: 'step2',
			text: 'Click on account tab',
			title: 'Account',
			attachTo: {
				element: '#AccountTour',
				on: 'bottom',
			},
			beforeShowPromise: function () {
				return new Promise(function (resolve) {
					document.querySelector('#settingsElement').click();
					resolve();
				});
			},
			buttons: [
				{
					text: 'Skip',
					action: function () {
						const tour = this;
						tour.hide();
					},
				},
				{
					text: 'Next',
					action: function () {
						const tour = this;
						tour.next();
						setTab({
							personalTab: false,
							accountTab: true,
							userTab: false,
							permissionTab: false,
							cron: false,
						});
					},
				},
			],
		});

		tour.addStep({
			id: 'step3',
			text: 'Click on add account and add your AdMob account',
			title: 'Add Account',
			attachTo: {
				element: '#AddAccountButton',
				on: 'bottom',
			},
			beforeShowPromise: function () {
				return new Promise(function (resolve) {
					document.querySelector('#AccountTour').click();
					resolve();
				});
			},
			buttons: [
				{
					text: 'Skip',
					action: function () {
						const tour = this;
						tour.hide();
					},
				},
				{
					text: 'Add',
					action: function () {
						const tour = this;
						tour.next();
						setGuideStart(false);
						setAccModalShow(true);
					},
				},
			],
		});

		if (guideStart) tour.start();
		return () => {
			tour.complete();
		};
	}, [guideStart]);

	useEffect(() => {
		const hasVisitedBefore = localStorage.getItem('visited');
		if (!hasVisitedBefore) {
			setGuideModalShow(true);
			localStorage.setItem('visited', 'true');
		}
	}, []);

	const token = localStorage.getItem('token');
	return token ? (
		<>
			<Outlet />
			{isGuideVisible ? (
				<UserGuideModal
					show={guideModalShow}
					onHide={() => {
						setGuideModalShow(false);
						setIsGuideVisible(false);
					}}
				/>
			) : null}
		</>
	) : (
		<Navigate to='/login' state={{ from: location }} replace />
	);
};
export default RequireAuth;
