'use client';
import RecentReviewItem, {
  IRecentReview,
} from '@/components/RecentReview/RecentReviewItem';
import ReviewButton from '@/components/Review/ReviewButton';
import ReviewLoadingSpinner from '@/components/Review/ReviewLoadingSpinner';
import { sortOptions } from '@/components/Review/ReviewsList';
import { useInfiniteRecentReviews } from '@/hooks/useRecentReviews';
import { useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function RecentReview() {
  const searchParam = useSearchParams();
  const [filter, setFilter] = useState<string>('like');
  const moreRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    isLoading,
    isError,
    isFetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteRecentReviews(filter);

  useEffect(() => {
    refetch();
  }, [filter]);

  useEffect(() => {
    const param = searchParam.get('filter');
    if (param !== null) {
      setFilter(param);
    }
  }, [searchParam]);

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
  };

  if (isLoading || !data?.pages || isFetching) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <ReviewLoadingSpinner />
      </div>
    );
  }

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
            <RecentReviewItem key={review.id} review={review} />
          ))
        )}
      </div>

      <div ref={moreRef}>{hasNextPage && <ReviewLoadingSpinner />}</div>
    </div>
  );
}
