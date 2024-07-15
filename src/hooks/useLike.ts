import { Like } from '@/models/likes.model';
import { useMutation,  useQuery,  useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export const useLike = (reviewId: string) => {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);

  const { 
    data: likes, 
    isLoading, 
    isError 
  } = useQuery<Like>({ 
    queryKey: ['reviews_like', reviewId], 
    queryFn: async () => {
      const response = await fetch(`/api/like/${reviewId}`);
      if (!response.ok) {
          throw new Error('Failed to fetch likes');
      }
      return response.json();
    },
    enabled, 
  });

  const addLikeMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/like/${reviewId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews_like', reviewId]});
    },
  });

  const deleteLikeMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/like/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews_like', reviewId]});
    },
  });

  const likeToggle = async (liked: number | undefined) => {
    try {
      if (liked) {
        await deleteLikeMutation.mutateAsync(reviewId);
      } else {
        await addLikeMutation.mutateAsync(reviewId);
      }
      setEnabled(prevEnabled => !prevEnabled); 
    } catch (error) {
      throw new Error('Failed to like');
    }
  };

  return { likes, likeToggle, isLoading, isError };
}