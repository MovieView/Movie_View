'use client';

import Spinner from '@/components/common/Spinner';
import RecentReviewItem, {
  IRecentReview,
} from '@/components/recentReview/RecentReviewItem';
import ReviewButton from '@/components/review/ReviewButton';
import ReviewError from '@/components/review/ReviewError';
import { sortOptions } from '@/components/review/ReviewsList';
import { useInfiniteRecentReviews } from '@/hooks/useRecentReviews';
import { useEffect, useRef, useState } from 'react';

export default function RecentReview() {
  const [searchParams, setSearchParams] = useState<URLSearchParams>();
  const [filter, setFilter] = useState<string>('like');
  const moreRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { data, isPending, isError, hasNextPage, fetchNextPage, refetch } =
    useInfiniteRecentReviews(filter);

  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, []);

  useEffect(() => {
    setLoading(true);
    refetch().finally(() => setLoading(false));
  }, [refetch, filter]);

  useEffect(() => {
    if (!searchParams) return;
    const paramFilter = searchParams.get('filter');
    if (paramFilter !== null) {
      setFilter(paramFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
    });

    if (moreRef.current) observer.observe(moreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  const onClick = (id: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('filter', id);
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${params}`
    );
    setSearchParams(params);
  };

  if (isPending || loading) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <Spinner size='xs' />
      </div>
    );
  }

  if (!data || isError) return <ReviewError />;

  return (
    <div className='flex flex-col mx-auto md:w-[50%] w-[80%] mt-4 gap-4'>
      <h2 className='font-bold text-2xl'>지금 뜨는 코멘트</h2>

      <div className={`flex justify-start gap-2 mb-3 w-full max-w-3xl mx-auto`}>
        {sortOptions.map((item) => (
          <ReviewButton
            key={item.value}
            text={item.value}
            state={filter === item.id}
            onClick={() => onClick(item.id)}
          />
        ))}
      </div>

      <div className='flex flex-col gap-4'>
        {data.pages.map((page) =>
          page.reviews.map((review: IRecentReview) => (
            <RecentReviewItem key={review.id} review={review} type='big' />
          ))
        )}
      </div>

      <div ref={moreRef}>{hasNextPage && <Spinner size='xs' />}</div>
    </div>
  );
}
