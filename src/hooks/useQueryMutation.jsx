/** @format */

import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../utils/axiosInstance';

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

export function useQueryMutation(key, endpoint, options = {}) {
	return useMutation({
		mutationKey: key,
		mutationFn: async (formData) => {
			const config = {
				header: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
					'cache-control': 'no-cache',
					Pragma: 'no-cache',
				},
			};
			const res = await axiosInstance.post(`${SERVER_BASE_URL}${endpoint}`, formData, config);
			return res.data;
		},
		staleTime: 1000 * 60 * 5,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		...options,
	});
}
