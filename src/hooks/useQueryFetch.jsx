/** @format */

// useQueryFetch.js
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../utils/axiosInstance';
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

export function useQueryFetch(key, endpoint, formData = {}, options = {}) {
	const queryKey = Array.isArray(key) ? key : [key];
	return useQuery({
		queryKey,
		queryFn: async () => {
			const config = {
				header: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
					'cache-control': 'no-cache',
					Pragma: 'no-cache',
				},
			};
			const response = await axiosInstance.post(`${SERVER_BASE_URL}${endpoint}`, formData, config);
			return response.data;
		},
		refetchOnWindowFocus: false,
		...options,
	});
}
