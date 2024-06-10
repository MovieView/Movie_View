import { useMutation,  useQuery,  useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export interface ILike {
  liked: number;
  likes: number;
}

export const useLike = (reviewId: string) => {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);

  // 좋아요 목록을 가져오는 쿼리
  const { 
    data: likes, 
    isLoading, 
    isError 
  } = useQuery<ILike>({ 
    queryKey: ['reviews_like', reviewId], 
    queryFn: async () => {
      const response = await fetch(`/api/like/${reviewId}`);
      if (!response.ok) {
          throw new Error('Failed to fetch likes');
      }
      return response.json();
    },
    enabled, // 초기에는 실행하지 않음
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
      // 좋아요 추가 후 해당 리뷰의 좋아요만 다시 가져오기
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
      // 좋아요 삭제 후 해당 리뷰의 좋아요만 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ['reviews_like', reviewId]});
    },
  });

  const likeToggle = async (liked: number | undefined) => {
    try {
      if (liked) {
        // 좋아요 취소
        await deleteLikeMutation.mutateAsync(reviewId);
      } else {
        // 좋아요 추가
        await addLikeMutation.mutateAsync(reviewId);
      }
      setEnabled(prevEnabled => !prevEnabled); // 좋아요 추가/취소 후 쿼리 활성화
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return { likes, likeToggle, isLoading, isError };
}