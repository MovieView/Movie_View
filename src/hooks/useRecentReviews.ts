import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

const LIMIT = 10;

const getRecentReviews = async (pageParam: number, filter: string) => {
  const response = await fetch(
    `/api/recentReview?page=${pageParam}&filter=${filter}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
};

export const useRecentReviews = () => {
  const {
    isError: isRecentReviewsError,
    isLoading: isRecentReviewsLoading,
    data: recentReviews,
  } = useQuery({
    queryKey: ['reviews', 'recent'],
    queryFn: () => getRecentReviews(1, 'like'),
  });

  return { recentReviews, isRecentReviewsLoading, isRecentReviewsError };
};

export const useInfiniteRecentReviews = (filter: string) => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['recent', 'reviews'],
    queryFn: ({ pageParam = 1 }) => getRecentReviews(pageParam, filter),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const isLast =
        Math.ceil(lastPage.pagination.totalCount / LIMIT) ===
        lastPage.pagination.currentPage;
      return isLast ? null : lastPage.pagination.currentPage + 1;
    },
  });

  return {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch,
  };
};
