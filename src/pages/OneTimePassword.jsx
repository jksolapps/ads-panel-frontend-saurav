/** @format */

import React, { useContext, useRef, useState, useEffect } from 'react';
import useUserApi from '../hooks/useUserApi';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { DataContext } from '../context/DataContext';
import { Helmet } from 'react-helmet-async';
import Profile from '../assets/images/login-icon.webp';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import { ReactComponent as EmailVerify } from '../assets/images/email-verification.svg';
import { BsCameraFill } from 'react-icons/bs';
import {
	loadModels,
	stopCamera,
	detectFaceDescriptor,
	captureImageFromVideo,
	startCamera,
} from '../hooks/useFaceRecognition';
import useAppsApi from '../hooks/useAppsApi';
import { useQueryClient } from '@tanstack/react-query';
import { useGroupSettings } from '../context/GroupSettingsContext';

const OneTimePassword = () => {
	const queryClient = useQueryClient();
	const { setSelectedGroup, setGroupName } = useGroupSettings();
	const [errorMassage, setErrorMassage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [resendLoader, setResendLoader] = useState(false);

	const { setAuth, roleFlag, setRoleFlag, setProfileImage, setUserData, setIsLoggedIn } =
		useContext(DataContext);
	const navigate = useNavigate();
	const inputRefs = useRef([]);
	const userEmail = localStorage.getItem('email');

	//face login
	const [isFaceLoading, setIsFaceLoading] = useState(false);
	const videoRef = useRef(null);
	const streamRef = useRef(null);
	const retryTimeoutRef = useRef(null);
	const attemptCountRef = useRef(0);

	const handleFaceRecognition = async () => {
		try {
			if (!videoRef.current) return null;
			const video = videoRef.current;
			await new Promise((resolve) => {
				if (video.readyState >= 2) return resolve();
				video.onloadeddata = () => resolve();
			});

			const descriptor = await detectFaceDescriptor(videoRef);
			const imageBase64 = await captureImageFromVideo(videoRef);
			const formData = new FormData();
			formData.append('user_email', userEmail);
			formData.append('user_face_descriptor', JSON.stringify(descriptor));
			formData.append('user_face', imageBase64);
			const loginResponse = await useAppsApi('web-login-face', formData);

			if (loginResponse.status_code == 1) {
				stopCamera(streamRef, videoRef);
				document.cookie = `prev_user=${loginResponse?.info?.user_email}; path=/`;

				const prevUserId = localStorage.getItem('id');
				const currentUserId = loginResponse?.info?.user_id;
				if (prevUserId && prevUserId !== currentUserId) {
					localStorage.removeItem('main_app_group');
					setSelectedGroup(null);
					setGroupName(null);
				}

				localStorage.setItem('id', loginResponse?.info?.user_id);
				localStorage.setItem('token', loginResponse?.info?.user_token);
				localStorage.setItem('email', loginResponse?.info?.user_email);
				localStorage.setItem('name', loginResponse?.info?.user_name);
				localStorage.setItem('role', loginResponse?.info?.user_role);
				localStorage.setItem('profile', loginResponse?.info?.user_face);

				setUserData({
					user_id: loginResponse?.info?.user_id,
					user_token: loginResponse?.info?.user_token,
				});
				setIsLoggedIn(true);

				setProfileImage(() => {
					const profileFace = loginResponse?.info?.user_face;
					return profileFace ? import.meta.env.VITE_IMAGE_BASE_URL + profileFace : null;
				});
				setRoleFlag(!roleFlag);
				setAuth(true);
				queryClient.invalidateQueries({ queryKey: ['global_group'] });
				navigate('/');
				return true;
			} else if (loginResponse.status_code == 0) {
				return false;
			}
		} catch (err) {
			if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
				stopCamera(streamRef, videoRef);
				return false;
			}
		} finally {
		}
	};
	// Background auto-retry for face login
	useEffect(() => {
		let cancelled = false;
		const token = localStorage.getItem('token');
		if (token) return;
		const init = async () => {
			setIsFaceLoading(true);
			await new Promise((r) => setTimeout(r, 50));

			try {
				await loadModels();
				await startCamera(videoRef, streamRef);
				if (videoRef.current) {
					await new Promise((resolve) => {
						if (videoRef.current.readyState >= 2) return resolve();
						videoRef.current.onloadeddata = () => resolve();
					});
				}
			} catch (_) {}

			const attempt = async () => {
				if (cancelled) return;
				if (localStorage.getItem('token')) return;
				if (attemptCountRef.current >= 5) {
					stopCamera(streamRef, videoRef);
					setIsFaceLoading(false);
					return;
				}
				try {
					const ok = await handleFaceRecognition();
					if (!cancelled && !ok && !localStorage.getItem('token')) {
						attemptCountRef.current += 1;
						retryTimeoutRef.current = setTimeout(attempt, 700);
					}
				} catch (_) {
					setIsFaceLoading(false);
					if (!cancelled && !localStorage.getItem('token')) {
						attemptCountRef.current += 1;
						retryTimeoutRef.current = setTimeout(attempt, 700);
					}
				}
			};
			attemptCountRef.current = 0;
			attempt();
		};
		init();
		return () => {
			cancelled = true;
			if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
			stopCamera(streamRef, videoRef);
		};
	}, []);

	const notifySuccess = () =>
		toast.success('OTP has been sent to your email, Please check your inbox.', {
			position: 'top-right',
			autoClose: 2000,
			hideProgressBar: false,
			closeOnClick: false,
			pauseOnHover: true,
			draggable: true,
			progress: false,
			theme: 'light',
		});

	const notifyError = (errorMsg) =>
		toast.error(errorMsg, {
			position: 'top-right',
			autoClose: 2000,
			hideProgressBar: false,
			closeOnClick: false,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: 'light',
		});

	const handleLoginUser = async (values, action) => {
		try {
			setIsLoading(true);
			const finalOTP = Object.values(values).join('');
			const formData = new FormData();
			formData.append('user_email', userEmail);
			formData.append('user_otp', finalOTP);
			const response = await useUserApi('verify-otp', formData);
			if (response.status_code === 1) {
				document.cookie = `prev_user=${response?.info?.user_email}; path=/`;
				const prevUserId = localStorage.getItem('id');
				const currentUserId = response?.info?.user_id;

				if (prevUserId && prevUserId !== currentUserId) {
					localStorage.removeItem('main_app_group');
					setSelectedGroup(null);
					setGroupName(null);
				}

				localStorage.setItem('id', response?.info?.user_id);
				localStorage.setItem('token', response?.info?.user_token);
				localStorage.setItem('name', response?.info?.user_name);
				localStorage.setItem('role', response?.info?.user_role);
				localStorage.setItem('profile', response?.info?.user_face);

				setUserData({
					user_id: response?.info?.user_id,
					user_token: response?.info?.user_token,
				});
				setIsLoggedIn(true);
				setProfileImage(() => {
					const profileFace = response?.info?.user_face;
					return profileFace ? import.meta.env.VITE_IMAGE_BASE_URL + profileFace : null;
				});

				setRoleFlag(!roleFlag);
				setAuth(true);
				action.resetForm();
				queryClient.invalidateQueries({ queryKey: ['global_group'] });
				navigate('/');
			}
			if (response?.status_code === 0) {
				notifyError(response?.msg.split('</b>')[1]);
				action.resetForm();
				inputRefs.current[0]?.focus();
			}
			if (response?.status_code === 9) {
				notifyError('Please Enter OTP.');
				action.resetForm();
				inputRefs.current[0]?.focus();
			}
		} catch (error) {
			setIsLoading(false);
			throw new Error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendOTP = async () => {
		try {
			setResendLoader(true);
			const formData = new FormData();
			formData.append('user_email', userEmail);
			const response = await useUserApi('web-login-otp', formData);
			if (response.status_code === 1) {
				setErrorMassage('');
				notifySuccess();
				setTimer(60);
			}
		} catch (error) {
			setResendLoader(false);
			throw new Error(error);
		} finally {
			setResendLoader(false);
		}
	};

	const { values, handleSubmit, setFieldValue, setValues } = useFormik({
		enableReinitialize: true,
		initialValues: {
			digit0: '',
			digit1: '',
			digit2: '',
			digit3: '',
			digit4: '',
			digit5: '',
		},
		onSubmit: (values, action) => {
			handleLoginUser(values, action);
		},
	});

	useEffect(() => {
		inputRefs.current[0]?.focus();
	}, []);

	const checkAndSubmit = () => {
		const allDigitsFilled = Array.from({ length: 6 }).every(
			(_, index) => values[`digit${index}`]?.length === 1 && /\d/.test(values[`digit${index}`])
		);
		if (allDigitsFilled && !isLoading) {
			handleSubmit();
		}
	};

	useEffect(() => {
		const timeout = setTimeout(checkAndSubmit, 100);
		return () => clearTimeout(timeout);
	}, [values, isLoading]);

	const handlePaste = (e) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData('text').trim();
		if (/^\d{1,6}$/.test(pastedData)) {
			const digits = pastedData.split('').slice(0, 6);
			const newValues = { ...values };
			digits.forEach((digit, i) => {
				if (i < 6) {
					newValues[`digit${i}`] = digit;
				}
			});
			setValues(newValues);
			inputRefs.current[Math.min(digits.length - 1, 5)]?.focus();
		} else {
			notifyError('Please paste a valid OTP (numbers only).');
			setValues({
				digit0: '',
				digit1: '',
				digit2: '',
				digit3: '',
				digit4: '',
				digit5: '',
			});
			inputRefs.current[0]?.focus();
		}
	};

	const handleInputChange = (e, index) => {
		const value = e.target.value.trim();
		if (/^\d{0,6}$/.test(value)) {
			if (value.length > 1) {
				const digits = value.split('').slice(0, 6);
				const newValues = { ...values };
				digits.forEach((digit, i) => {
					if (i < 6) {
						newValues[`digit${i}`] = digit;
					}
				});
				setValues(newValues);
				inputRefs.current[Math.min(digits.length - 1, 5)]?.focus();
			} else {
				setFieldValue(`digit${index}`, value);
				if (value && index < 5) {
					inputRefs.current[index + 1]?.focus();
				}
			}
		} else if (value === '') {
			setFieldValue(`digit${index}`, '');
		}
	};

	// Resend OTP timer
	const [timer, setTimer] = useState(() => {
		const savedTimer = localStorage.getItem('otpTimer');
		return savedTimer ? parseInt(savedTimer, 10) : 60;
	});

	useEffect(() => {
		if (timer <= 0) return;

		const interval = setInterval(() => {
			setTimer((prevTimer) => {
				if (prevTimer <= 1) {
					clearInterval(interval);
					localStorage.setItem('otpTimer', 0);
					return 0;
				}
				const newTimer = prevTimer - 1;
				localStorage.setItem('otpTimer', newTimer);
				return newTimer;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [timer]);

	const timerUI = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(
		2,
		'0'
	)}`;

	useEffect(() => {
		const token = localStorage.getItem('token');
		const isOTPSent = localStorage.getItem('isOTPSent');

		if (token) {
			navigate('/');
		}
		if (!isOTPSent) {
			navigate('/login');
		}
	}, [navigate]);

	useEffect(() => {
		const currentTitle = 'OTP Verification';
		const pushHistoryStack = () => {
			for (let i = 0; i < 10; i++) {
				window.history.pushState({ page: 'otp-verification' }, currentTitle, window.location.pathname);
			}
		};
		pushHistoryStack();
		const handlePopState = (event) => {
			event.preventDefault();
			pushHistoryStack();
			document.title = currentTitle;
			navigate(window.location.pathname, { replace: true });
		};
		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}, [navigate]);

	return (
		<>
			<section>
				<ToastContainer />
				<Helmet>
					<title>OTP Verification</title>
					<link rel='preload' href={Profile} as='image' />
				</Helmet>
				<div className='login-wrapper otp_verification_wrapper'>
					<div className='login-box'>
						<div className='logo login-logo'>
							<EmailVerify />
						</div>
						{isFaceLoading && (
							<div className='custom_camera_indicator'>
								<BsCameraFill />
							</div>
						)}
						<h1 className='title-text'>Verify Your Email Address</h1>
						<div className='sub-text'> to continue to JKSOL Ads</div>
						<div className='form-wrap modal-form'>
							<div className='custom_video_box'>
								<video
									ref={videoRef}
									autoPlay
									muted
									playsInline
									className='face-video'
									style={{
										transform: 'scaleX(-1)',
										width: '1px',
										height: '1px',
									}}
								/>
							</div>
							<form onSubmit={handleSubmit} noValidate autoComplete='off'>
								<div className='input-box input_otp_box'>
									{Array.from({ length: 6 }).map((_, index) => (
										<input
											key={index}
											type='text'
											inputMode='numeric'
											pattern='[0-9]*'
											value={values[`digit${index}`] || ''}
											className='otp-input'
											name={`digit${index}`}
											onChange={(e) => handleInputChange(e, index)}
											onKeyDown={(e) => {
												if (e.key === 'Backspace') {
													if (!values[`digit${index}`] || e.target.value.length === 0) {
														e.preventDefault();
														setFieldValue(`digit${index}`, '');
														if (index > 0) {
															inputRefs.current[index - 1]?.focus();
														}
													}
												}
											}}
											onPaste={(e) => handlePaste(e, index)}
											maxLength={6}
											ref={(el) => (inputRefs.current[index] = el)}
											autoComplete='one-time-code'
											aria-label={`OTP digit ${index + 1}`}
											disabled={isLoading}
										/>
									))}
								</div>
								<div className='email_change_link'>
									Want to change your email address? <Link to={'/login'}>Change here</Link>
								</div>

								<div className='otp_button_wrap'>
									<button type='submit' disabled={isLoading}>
										{isLoading ? <Spinner /> : 'Submit'}
									</button>
									<button
										type='button'
										className={`${timer > 0 ? 'timer_on' : 'timer_off'} resend_time_btn`}
										onClick={handleResendOTP}
										disabled={timer > 0 || isLoading}
									>
										{resendLoader ? <Spinner /> : timer > 0 ? timerUI : 'Resend OTP'}
									</button>
								</div>
							</form>
							{errorMassage ? <div className='backError'>{errorMassage}</div> : null}
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

export default OneTimePassword;
