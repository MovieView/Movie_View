import { useEffect, useState } from 'react';
import { ICommentData } from '@/models/comment.model';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

const MAX_RESULT = 5;
export const getComments = async (reviewId: string, page = 1) => {
  const response = await fetch(
    `/api/review/${reviewId}?maxResults=${MAX_RESULT}&page=${page}`,
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

const createComment = async ({
  reviewId,
  content,
}: Pick<ICommentData, 'reviewId' | 'content'>) => {
  const response = await fetch(`/api/review/${reviewId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reviewId, content }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete the comment');
  }

  return response.json();
};

export const updateComment = async ({
  reviewId,
  commentId,
  content,
}: ICommentData) => {
  const response = await fetch(`/api/review/${reviewId}/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ commentId, content }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete the comment');
  }

  return response.json();
};

const deleteComment = async ({
  reviewId,
  commentId,
}: Omit<ICommentData, 'content'>) => {
  const response = await fetch(`/api/review/${reviewId}/${commentId}`, {
    method: 'DELETE',
    body: JSON.stringify({ commentId }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete the comment');
  }

  return commentId;
};

export function useComment(reviewId: string) {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);
  const [commentCount, setCommentCount] = useState<number | null>(null);
  const {
    data: comments,
    fetchNextPage,
    isLoading,
    error,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['comments', reviewId],
    queryFn: ({ pageParam = 1 }) => getComments(reviewId, pageParam),
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
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', reviewId],
      });
      decreaseCommentCount();
    },
  });

  const deleteMyComment = (reviewId: string, commentId: string) => {
    deleteReviewMutation.mutate({ reviewId, commentId });
  };

  const updateCommentMutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', reviewId],
      });
    },
  });

  const updateMyComment = (
    reviewId: string,
    commentId: string,
    content: string
  ) => {
    updateCommentMutation.mutate({ reviewId, commentId, content });
  };

  const addCommentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', reviewId] });
      increaseCommentCount();
    },
  });

  const addMyComment = (reviewId: string, content: string) => {
    addCommentMutation.mutate({ reviewId, content });
  };

  const increaseCommentCount = () => {
    commentCount && setCommentCount(commentCount + 1);
  };

  const decreaseCommentCount = () => {
    commentCount && setCommentCount(commentCount - 1);
  };

  useEffect(() => {
    if (comments && comments.pages) {
      const total = comments.pages.flatMap((v) => v.pagination.totalCount);
      setCommentCount(total[0]);
    }
  }, [comments]);

  return {
    comments,
    fetchNextPage,
    isLoading,
    error,
    hasNextPage,
    isFetching,
    updateMyComment,
    deleteMyComment,
    addMyComment,
    setEnabled,
    isFetchingNextPage,
    commentCount,
  };
}
