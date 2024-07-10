import { formatDate } from '@/utils/formatDate';
import { formatUserId } from '@/utils/formatUserId';
import { useSession } from 'next-auth/react';
import React, { FormEvent, useEffect, useState } from 'react';
import CommentForm from './CommentForm';
import ReviewDropDownMenu from '../review/ReviewDropDownMenu';
import { Comment, CommentContent } from '@/models/comment.model';
import { useComment } from '@/hooks/useComment';

interface Props {
  reviewId: string;
  comment: Comment;
  onUpdate: (reviewId: string, commentId: string, content: string) => void;
}

export default function CommentItem({ reviewId, comment, onUpdate }: Props) {
  const { data: session } = useSession();
  const userId = session && formatUserId(session?.provider, session?.uid);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [CommentData, setCommentData] = useState<CommentContent>(comment);
  const { deleteMyComment } = useComment(reviewId);

  const handleDeleteComment = (reviewId: string, commentId: string) => {
    deleteMyComment(reviewId, commentId);
  };

  const handleCloseForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    setIsFormOpen(true);

    const newComment = {
      content: CommentData.content.trim(),
    };

    if (newComment.content.length === 0) {
      window.alert('답글은 최소 한 글자 이상 입력해 주세요.');
      return;
    }

    onUpdate(reviewId, comment.id, newComment.content);

    setIsFormOpen(false);
  };

  useEffect(() => {
    setCommentData({ ...comment });
  }, [comment]);
  return (
    <>
      <div className='flex p-4 border max-w-3xl rounded-xl mx-auto shadow-sm relative'>
        <div className='overflow-hidden shrink-0 mr-2 w-7 h-7 rounded-full'>
          {comment.filePath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className='w-full h-full object-cover'
              src={comment.filePath}
              alt={comment.nickname}
            />
          ) : (
            <div className='bg-second w-full h-full '></div>
          )}
        </div>

        <div
          className='flex flex-col gap-1'
          style={{ width: 'calc(100% - 1.75rem)' }}
        >
          {isFormOpen ? (
            <CommentForm
              handleCloseForm={handleCloseForm}
              comment={CommentData}
              setComment={setCommentData}
              onSubmit={handleUpdate}
              text='답글 수정'
            />
          ) : (
            <div>
              {userId && userId === comment.userId && !isFormOpen && (
                <ReviewDropDownMenu
                  handleEdit={handleCloseForm}
                  reviewId={reviewId}
                  commentId={comment.id}
                  onDeleteComment={handleDeleteComment}
                />
              )}
              <pre className={`break-words whitespace-pre-wrap`}>
                {comment.content}
              </pre>
            </div>
          )}

          <div className='flex gap-2 mt-2 '>
            <span className='mr-2 text-sm'>
              {comment.nickname ? comment.nickname : '알 수 없음'}
            </span>
            <span className='text-gray-400 text-sm'>
              {formatDate(comment.createdAt)}
            </span>
            {comment.createdAt !== comment.updatedAt && (
              <span className='text-gray-400 text-sm'>(수정됨)</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
