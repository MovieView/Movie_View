import React, { FormEvent, useState } from 'react';
import CommentForm from './CommentForm';
import { CommentContent } from '@/models/comment.model';
import { useComment } from '@/hooks/useComment';

interface Props {
  reviewId: string;
  setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
}

export default function CommentFormContainer({
  reviewId,
  setIsFormOpen,
  text,
}: Props) {
  const [commentData, setCommentData] = useState<CommentContent>({
    content: '',
  });

  const { addMyComment, increaseCommentCount } = useComment(reviewId);

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

    addMyComment(newComment.reviewId, newComment.content);

    setCommentData({
      content: '',
    });

    increaseCommentCount();

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
