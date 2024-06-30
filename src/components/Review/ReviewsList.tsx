'use client';
import { IReview, useReview } from '@/hooks/useReview';
import ReviewItem from './ReviewItem';
import React, { useEffect, useRef, useState } from 'react';
import ReviewEmpty from './ReviewEmpty';
import ReviewLoadingSpinner from './ReviewLoadingSpinner';
import ReviewButton from './ReviewButton';
import ReviewFakeForm from './ReviewFakeForm';
import ReviewFormContainer from './ReviewFormContainer';
import ReviewError from './ReviewError';

export interface IReviewFormData {
  title: string;
  rating: number;
  content: string;
}

interface IProps {
  movieId: number;
}

const sortOptions = [
  { id: 'like', value: '인기순' },
  { id: 'latest', value: '최신순' },
];

export default function ReviewsList({ movieId }: IProps) {
  const [sort, setSort] = useState<string>('latest');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
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
  } = useReview(movieId, sort);

  const pageEnd = useRef<HTMLDivElement | null>(null);

  const handleSort = (value: string) => {
    setSort(value);
  };

  const handleDeleteReview = (reviewId: string) => {
    deleteMyReview(reviewId);
  };

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

  if (error) {
    return <ReviewError />;
  }

  return (
    <div className='p-2 my-10'>
      <div className='w-full max-w-3xl mx-auto'>
        {!isFormOpen && <ReviewFakeForm setIsFormOpen={setIsFormOpen} />}

        {isFormOpen && (
          <ReviewFormContainer
            movieId={movieId}
            onSubmit={addMyReview}
            setIsFormOpen={setIsFormOpen}
            text='리뷰 등록'
          />
        )}
      </div>

      {isLoading ? (
        <ReviewLoadingSpinner />
      ) : (
        <>
          {isEmpty && <ReviewEmpty />}

          {!isEmpty && (
            <>
              <div
                className={`flex justify-end gap-2 mb-3 w-full max-w-3xl mx-auto`}
              >
                {sortOptions.map((item) => (
                  <ReviewButton
                    key={item.value}
                    text={item.value}
                    state={sort === item.id}
                    onClick={() => handleSort(item.id)}
                  />
                ))}
              </div>

              <ul className='flex flex-col gap-4'>
                {reviews?.pages.flatMap((group: any, i: number) => (
                  <React.Fragment key={i}>
                    {group.reviews.map((review: IReview) => (
                      <li key={review.id}>
                        <ReviewItem
                          review={review}
                          onUpdate={updateMyReview}
                          onDelete={handleDeleteReview}
                        />
                      </li>
                    ))}
                  </React.Fragment>
                ))}
              </ul>
            </>
          )}

          <div ref={pageEnd}>{isFetching && <ReviewLoadingSpinner />}</div>
        </>
      )}
    </div>
  );
}
