/** @format */

import React, { useRef, useState, useEffect, useContext } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useUserApi from '../hooks/useUserApi';
import { LoginUserSchema } from '../schemas/UserSchema';
import { getCookieValue } from '../utils/helper';
import Profile from '../assets/images/login-icon.webp';
import { notifyError } from '../hooks/toastUtils';
import { MdOutlineMailOutline } from 'react-icons/md';
import { loadModels } from '../hooks/useFaceRecognition';

const Login = () => {
	const navigate = useNavigate();
	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			navigate('/');
		}
		(async () => {
			await loadModels();
		})();
	}, [navigate]);

	const [isLoading, setIsLoading] = useState(false);

	const prevUserLocal = getCookieValue('prev_user');
	const prevUser = prevUserLocal?.replaceAll('%40', '@');

	const { values, errors, touched, handleChange, handleSubmit } = useFormik({
		initialValues: { email: prevUser || '' },
		validationSchema: LoginUserSchema,
		onSubmit: async (values, actions) => {
			await handleLoginUser(values, actions);
		},
	});

	const handleLoginUser = async (values, actions) => {
		setIsLoading(true);
		const formData = new FormData();
		formData.append('user_email', values.email);

		const response = await useUserApi('web-login-otp', formData);
		if (response?.status_code === 1) {
			localStorage.setItem('isOTPSent', true);
			localStorage.setItem("isPercentageCheck", true);
			localStorage.setItem('email', values.email);
			navigate('/otp-verification');
			actions.resetForm();
		} else {
			notifyError(response?.msg?.split('</b>')[1] || 'Login failed.');
		}
		setIsLoading(false);
	};

	return (
		<>
			<ToastContainer />
			<Helmet>
				<title>Login</title>
				<link rel='preload' href={Profile} as='image' />
			</Helmet>
			<section>
				<div className='login-wrapper'>
					<div className='login-box custom_login_wrap'>
						<div className='logo login-logo'>
							<img src={Profile} alt='logo' width='80' height='80' />
							<h4>Welcome Back</h4>
							<p>Choose your preferred login method</p>
						</div>
						<div className='form-wrap modal-form'>
							<form onSubmit={handleSubmit} noValidate>
								<label>Email Address</label>
								<div className='input-box'>
									<input
										placeholder='Enter your email'
										type='email'
										name='email'
										value={values.email}
										onChange={handleChange}
										className={`input ${prevUser ? 'input-active text-add' : ''}`}
									/>
									<div className='input-border'></div>
									<div className='blue-border'></div>
								</div>
								{touched.email && errors.email && <div className='formErrors'>{errors.email}</div>}
								<button type='submit' className='login_otp_btn'>
									{isLoading ? (
										<Spinner animation='border' size='sm' />
									) : (
										<>
											<MdOutlineMailOutline size={16} style={{ marginRight: 8 }} /> <span>Send OTP</span>
										</>
									)}
								</button>
							</form>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

export default Login;
