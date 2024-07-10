import { Like } from '@/models/likes.model';
import { useMutation,  useQuery,  useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export const useMovieLike = (
  movieId: number, 
  movieTitle: string, 
  posterPath: string, 
  isEnabled: boolean
) => {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(isEnabled);

  const { 
    data: like, 
    isLoading, 
    isError 
  } = useQuery<Like>({ 
    queryKey: ['movies_like', movieId], 
    queryFn: async () => {
      const response = await fetch(`/api/movie/like/${movieId}`);
      if (!response.ok) {
          throw new Error('Failed to fetch likes');
      }
      return response.json();
    },
    enabled: enabled,
  });

  const addLikeMutation = useMutation({
    mutationFn: async (movieId: number) => {
      const response = await fetch(`/api/movie/like/${movieId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieTitle, posterPath }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies_like', movieId]});
    },
  });

  const deleteLikeMutation = useMutation({
    mutationFn: async (movieId: number) => {
      const response = await fetch(`/api/movie/like/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies_like', movieId]});
    },
  });

  const likeToggle = async (liked: number | undefined) => {
    try {
      if (liked) {
        await deleteLikeMutation.mutateAsync(movieId);
      } else {
        await addLikeMutation.mutateAsync(movieId);
      }
      setEnabled(prevEnabled => !prevEnabled); // 좋아요 추가/취소 후 쿼리 활성화
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return { 
    like, 
    likeToggle, 
    isLoading, 
    isError, 
  };
}