import { 
  QueryClient, 
  useInfiniteQuery, 
  useQueryClient 
} from "@tanstack/react-query";
import React from "react";


const useMovieSearch = () => {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [queryClient, setQueryClient] = React.useState<QueryClient>(useQueryClient());

  const { 
    data, 
    hasNextPage,
    fetchNextPage,
    isError,
    isLoading,
    isLoadingError,
    isFetchingNextPage,
    isPending,
    isRefetching,
    isRefetchError,
    isSuccess,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['movies'],
    queryFn: async ({ pageParam = 1 }) => {
      let url : string = `/api/movies?page=${pageParam}`;
      if (searchQuery) {
        url += `&title=${searchQuery}`;
      }
      const response : Response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage : any) : number | undefined => {
      if (lastPage.page < lastPage.total_pages && lastPage.page < 10) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage : any) : number | undefined => {
      if (firstPage.page > 1) {
        return firstPage.page - 1;
      }
      return undefined;
    },
    maxPages: 100,
    staleTime: Infinity
  }, queryClient);

  return {
    searchQuery,
    setSearchQuery,
    queryClient,
    data,
    hasNextPage,
    fetchNextPage,
    isError,
    isLoading,
    isLoadingError,
    isFetchingNextPage,
    isPending,
    isRefetching,
    isRefetchError,
    isSuccess,
    refetch,
  }
};

export default useMovieSearch;