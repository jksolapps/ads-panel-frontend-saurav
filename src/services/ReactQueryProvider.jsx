/** @format */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000,
			gcTime: 60 * 1000,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: false,
			retry: 1,
		},
	},
});

// Create persister once
const persister = createAsyncStoragePersister({
	storage: window.localStorage,
});

persistQueryClient({
	queryClient,
	persister,
	maxAge: 5 * 60 * 1000,
});

export default function ReactQueryProvider({ children }) {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
