import { useComment } from '@/hooks/useComment';
import React, { useEffect, useRef, useState } from 'react';
import ReviewLoadingSpinner from '../review/ReviewLoadingSpinner';
import ReviewError from '../review/ReviewError';
import CommentItem from './CommentItem';
import CommentFormContainer from './CommentFormContainer';

export interface ICommentFormData {
  content: string;
}

interface Props {
  reviewId: string;
  isOpen: boolean;
  isCommentFormOpen: boolean;
  setIsCommentFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CommentsList({
  reviewId,
  isOpen,
  isCommentFormOpen,
  setIsCommentFormOpen,
}: Props) {
  const pageEnd = useRef<HTMLDivElement | null>(null);
  const {
    comments,
    fetchNextPage,
    isLoading,
    error,
    hasNextPage,
    isFetching,
    setEnabled,
    addMyComment,
    deleteMyComment,
    updateMyComment,
  } = useComment(reviewId);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );
    pageEnd.current && observer.observe(pageEnd.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  useEffect(() => {
    isOpen ? setEnabled(true) : setEnabled(false);
  }, [isOpen, setEnabled]);

  if (error) {
    return <ReviewError />;
  }

  return (
    <>
      {isCommentFormOpen && (
        <CommentFormContainer
          reviewId={reviewId}
          onSubmit={addMyComment}
          setIsFormOpen={setIsCommentFormOpen}
          text='답글 등록'
        />
      )}

      {isLoading ? (
        <ReviewLoadingSpinner />
      ) : (
        <>
          {isOpen && (
            <>
              <div>
                <ul className='flex flex-col gap-4'>
                  {comments?.pages.flatMap((group: any, i: number) => (
                    <React.Fragment key={i}>
                      {group.comments.map((comment: any) => (
                        <li key={comment.id}>
                          <CommentItem
                            reviewId={reviewId}
                            onDeleteComment={deleteMyComment}
                            onUpdate={updateMyComment}
                            onAdd={addMyComment}
                            comment={comment}
                          />
                        </li>
                      ))}
                    </React.Fragment>
                  ))}
                </ul>
              </div>
            </>
          )}
        </>
      )}

      {hasNextPage && (
        <div ref={pageEnd}>{isFetching && <ReviewLoadingSpinner />}</div>
      )}
    </>
  );
}
