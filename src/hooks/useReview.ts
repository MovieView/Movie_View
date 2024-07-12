import { IReview, IReviewFormData } from '@/models/review.model';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const MAX_RESULT = 10;
const getReviews = async (movieId: number, page = 1, sort: string) => {
  const response = await fetch(
    `/api/movie/${movieId}/review?maxResults=${MAX_RESULT}&page=${page}&sort=${sort}`,
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

const updateReview = async ({
  reviewId,
  title,
  rating,
  content,
}: IReviewFormData & { reviewId: string }) => {
  const response = await fetch(`/api/review/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reviewId, title, rating, content }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete the review');
  }

  return response.json();
};

const createReview = async ({
  movieId,
  title,
  rating,
  content,
  movieTitle,
  posterPath,
}: IReviewFormData & {
  movieId: number;
  movieTitle: string;
  posterPath: string;
}) => {
  const response = await fetch(`/api/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      movieId,
      title,
      rating,
      content,
      movieTitle,
      posterPath,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to add the review');
  }

  return response.json();
};

const deleteReview = async (reviewId: string) => {
  const response = await fetch(`/api/review/${reviewId}`, {
    method: 'DELETE',
    body: JSON.stringify({ reviewId }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete the review');
  }

  return reviewId;
};

export function useReview(
  movieId: number,
  sort: string,
  movieTitle: string,
  posterPath: string
) {
  const queryClient = useQueryClient();
  const [isEmpty, setIsEmpty] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const {
    data: reviews,
    fetchNextPage,
    isLoading,
    error,
    hasNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['reviews', movieId, sort],
    queryFn: ({ pageParam = 1 }) => getReviews(movieId, pageParam, sort),
    getNextPageParam: (lastPage, _pages) => {
      if (
        lastPage.pagination.totalCount >
        lastPage.pagination.currentPage * MAX_RESULT
      ) {
        return lastPage.pagination.currentPage + 1;
      } else {
        return undefined;
      }
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    enabled,
  });

  const deleteReviewMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: (reviewId) => {
      queryClient.setQueryData(['reviews', movieId, sort], (oldData: any) => {
        if (!oldData) {
          return oldData;
        }

        const newPages = oldData.pages.map((group: any) => ({
          ...group,
          reviews: group.reviews.filter(
            (item: IReview) => item.id !== reviewId
          ),
        }));

        return {
          ...oldData,
          pages: newPages,
        };
      });

      const newReviewList = reviews?.pages
        .flatMap((group: any) => group.reviews)
        .filter((item) => item.id !== reviewId);

      if (newReviewList) {
        setIsEmpty(newReviewList.length === 0);
      }
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: updateReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', movieId, sort] });
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', movieId, sort] });
    },
  });

  const addMyReview = (
    movieId: number,
    title: string,
    rating: number,
    content: string
  ) => {
    addReviewMutation.mutate({
      movieId,
      title,
      rating,
      content,
      movieTitle,
      posterPath,
    });
  };

  const deleteMyReview = (reviewId: string) => {
    deleteReviewMutation.mutate(reviewId);
  };

  const updateMyReview = (
    reviewId: string,
    title: string,
    rating: number,
    content: string
  ) => {
    updateReviewMutation.mutate({ reviewId, title, rating, content });
  };

  useEffect(() => {
    if (reviews && reviews.pages.length > 0) {
      const all = reviews.pages.flatMap((group: any) => group.reviews);
      setIsEmpty(all.length === 0);
    }
  }, [reviews]);

  return {
    reviews,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isEmpty,
    updateMyReview,
    deleteMyReview,
    addMyReview,
    setEnabled,
  };
}
