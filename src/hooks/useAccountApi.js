/** @format */

import { axiosInstance } from '../utils/axiosInstance';
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

const useAccountApi = async (endpoint, response) => {
	const headerConfig = {
		header: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
			'cache-control': 'no-cache',
			Pragma: 'no-cache',
		},
	};
	try {
		const result = await axiosInstance.post(`${SERVER_BASE_URL}${endpoint}`, response, headerConfig);
		return result?.data;
	} catch (error) {
		throw new Error(error);
	}
};

export default useAccountApi;
