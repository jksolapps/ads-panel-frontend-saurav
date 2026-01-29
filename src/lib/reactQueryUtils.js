export const flushAllCachesExcept = (queryClient, excludePrefixes = []) => {
  const excludeSet = new Set(excludePrefixes);

  queryClient
    .getQueryCache()
    .findAll()
    .forEach((query) => {
      const queryKey = query.queryKey;

      if (Array.isArray(queryKey) && excludeSet.has(queryKey[0])) {
        return;
      }

      queryClient.removeQueries({
        queryKey,
        exact: true,
      });
    });
};
