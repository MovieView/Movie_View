import React, { FormEvent, useState } from 'react';
import CommentForm from './CommentForm';
import { CommentContent } from '@/models/comment.model';

interface IProps {
  reviewId: string;
  onSubmit: (reviewId: string, content: string) => void;
  setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
  updateCommentCount: (value: number) => void;
  commentCount: number;
}

export default function CommentFormContainer({
  reviewId,
  onSubmit,
  setIsFormOpen,
  text,
  updateCommentCount,
  commentCount,
}: IProps) {
  const [commentData, setCommentData] = useState<CommentContent>({
    content: '',
  });

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCommentData({
      content: '',
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newComment = {
      reviewId,
      content: commentData.content.trim(),
    };

    if (newComment.content.length === 0) {
      window.alert('답글은 최소 한 글자 이상 입력해 주세요.');
      return;
    }

    onSubmit(newComment.reviewId, newComment.content);

    setCommentData({
      content: '',
    });

    updateCommentCount(commentCount + 1);

    setIsFormOpen(false);
  };

  return (
    <CommentForm
      handleCloseForm={handleCloseForm}
      comment={commentData}
      setComment={setCommentData}
      onSubmit={handleSubmit}
      text={text}
    />
  );
}
