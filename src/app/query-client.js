import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is considered fresh for 1 minute.
            // After 1 minute, it becomes stale and will be refetched on window focus or reconnect.
            staleTime: 1000 * 60 * 1,
            gcTime: 1000 * 60 * 10, // Keep unused data in cache for 10 minutes (renamed from cacheTime in v5)
            refetchOnWindowFocus: true,
            retry: 1,
        },
    },
});
