import { useQuery } from '@tanstack/react-query';

const getRecentReviews = async () => {
  const response = await fetch(`/api/recentreview`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

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
    queryFn: getRecentReviews,
  });

  return { recentReviews, isRecentReviewsLoading, isRecentReviewsError };
};
