/** @format */

import axios from 'axios';
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

export const axiosInstance = axios.create({
	baseURL: SERVER_BASE_URL,
});

axiosInstance.interceptors.response.use(
	(response) => {
		if (response?.data?.status_code == 2 || response?.data?.msg == 'Unauthorised User.') {
			localStorage.clear();
			sessionStorage.clear();
			window.location.href = '/login';
		}
		return response;
	},
	async (error) => {
		return Promise.reject(error);
	}
);
