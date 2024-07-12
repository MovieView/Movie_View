import { useComment } from '@/hooks/useComment';
import React, { useEffect, useRef } from 'react';
import ReviewError from '../review/ReviewError';
import CommentItem from './CommentItem';
import CommentFormContainer from './CommentFormContainer';
import { IComment } from '@/models/comment.model';
import Spinner from '../common/Spinner';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

interface IProps {
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
}: IProps) {
  const pageEnd = useRef<HTMLDivElement | null>(null);
  const {
    comments,
    fetchNextPage,
    isLoading,
    error,
    hasNextPage,
    isFetching,
    setEnabled,
    updateMyComment,
  } = useComment(reviewId);

  useIntersectionObserver(
    pageEnd,
    ([entry]) => {
      if (entry.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    { threshold: 1 },
    isOpen
  );

  useEffect(() => {
    if (isOpen) {
      setEnabled(true);
    }
  }, [isOpen, setEnabled]);

  if (error) {
    return <ReviewError />;
  }

  return (
    <>
      {isCommentFormOpen && (
        <CommentFormContainer
          reviewId={reviewId}
          setIsFormOpen={setIsCommentFormOpen}
          text='답글 등록'
        />
      )}

      {isOpen && (
        <>
          {isLoading ? (
            <Spinner size='xs' />
          ) : (
            <div>
              <ul className='flex flex-col gap-4'>
                {comments?.pages.flatMap((group: any, i: number) => (
                  <React.Fragment key={i}>
                    {group.comments.map((comment: IComment) => (
                      <li key={comment.id}>
                        <CommentItem
                          reviewId={reviewId}
                          onUpdate={updateMyComment}
                          comment={comment}
                        />
                      </li>
                    ))}
                  </React.Fragment>
                ))}
              </ul>

              {hasNextPage && (
                <div ref={pageEnd}>{isFetching && <Spinner size='xs' />}</div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
