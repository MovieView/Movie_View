'use client';

import { useReview } from '@/hooks/useReview';
import ReviewItem from '../review/ReviewItem';
import React, { useEffect, useRef, useState } from 'react';
import ReviewEmpty from './ReviewEmpty';
import ReviewButton from './ReviewButton';
import ReviewFakeForm from './ReviewFakeForm';
import ReviewFormContainer from './ReviewFormContainer';
import ReviewError from './ReviewError';
import { IReview } from '@/models/review.model';
import Spinner from '../common/Spinner';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

interface IProps {
  movieId: number;
  movieTitle: string;
  posterPath: string;
}

export const sortOptions = [
  { id: 'like', value: '인기순' },
  { id: 'latest', value: '최신순' },
];

export default function ReviewsList({
  movieId,
  movieTitle,
  posterPath,
}: IProps) {
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
    setEnabled,
  } = useReview(movieId, sort, movieTitle, posterPath);

  const pageEnd = useRef<HTMLDivElement | null>(null);
  const reviewRef = useRef<HTMLDivElement | null>(null);

  const handleSort = (value: string) => {
    setSort(value);
  };

  useIntersectionObserver(
    pageEnd,
    ([entry]) => {
      if (entry.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    { threshold: 1 },
    true
  );

  useIntersectionObserver(
    reviewRef,
    ([entry]) => {
      if (entry.isIntersecting) {
        setEnabled(true);
      }
    },
    { threshold: 1 },
    true
  );

  if (error) {
    return <ReviewError />;
  }

  return (
    <div className='p-2 my-10'>
      <div ref={reviewRef} className='w-full max-w-3xl mx-auto'>
        {!isFormOpen && <ReviewFakeForm setIsFormOpen={setIsFormOpen} />}

        {isFormOpen && (
          <ReviewFormContainer
            movieId={movieId}
            sort={sort}
            setIsFormOpen={setIsFormOpen}
            text='리뷰 등록'
            movieTitle={movieTitle}
            posterPath={posterPath}
          />
        )}
      </div>

      {isLoading ? (
        <Spinner size='xs' />
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
                          sort={sort}
                          movieId={movieId}
                          movieTitle={movieTitle}
                          posterPath={posterPath}
                        />
                      </li>
                    ))}
                  </React.Fragment>
                ))}
              </ul>
            </>
          )}

          {hasNextPage && (
            <div ref={pageEnd}>{isFetching && <Spinner size='xs' />}</div>
          )}
        </>
      )}
    </div>
  );
}
