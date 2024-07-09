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
    isPending: isRecentReviewsPending,
    isFetching: isRecentReviewsFetching,
    data: recentReviews,
    refetch: recentReviewsRefetch,
  } = useQuery({
    queryKey: ['reviews', 'recent'],
    queryFn: () => getRecentReviews(1, 'like'),
    staleTime: 5000,
  });

  return {
    recentReviews,
    isRecentReviewsPending,
    isRecentReviewsError,
    isRecentReviewsFetching,
    recentReviewsRefetch,
  };
};

export const useInfiniteRecentReviews = (filter: string) => {
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['recent', 'reviews'],
    queryFn: ({ pageParam }) => getRecentReviews(pageParam, filter),
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
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch,
  };
};
