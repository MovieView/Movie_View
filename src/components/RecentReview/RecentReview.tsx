import { IoIosArrowForward } from 'react-icons/io';
import { IoIosArrowBack } from 'react-icons/io';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import RecentReviewItem, { IRecentReview } from './RecentReviewItem';

interface Props {
  reviews: IRecentReview[];
}

export type ReviewItemType = 'small' | 'big';

const RecentReview = ({ reviews }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [leftBtnVisible, setLeftBtnVisible] = useState(false);
  const [rightBtnVisible, setRightBtnVisible] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(3);

  const handleResize = useCallback(() => {
    if (window.innerWidth <= 768) {
      setItemsPerView(1);
    } else if (window.innerWidth <= 1280) {
      setItemsPerView(2);
    } else {
      setItemsPerView(3);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex === Math.ceil(reviews.length / itemsPerView) - 1) return;
    setCurrentIndex((prev) => prev + 1);
  };

  const transformValue = useMemo(() => {
    if (typeof window !== 'undefined') {
      return itemsPerView !== 1
        ? currentIndex * -(100 + (12 / ((window.innerWidth * 70) / 100)) * 100)
        : currentIndex * -(100 + (12 / ((window.innerWidth * 90) / 100)) * 100);
    }
  }, [currentIndex, itemsPerView]);

  useEffect(() => {
    setLeftBtnVisible(currentIndex > 0);
    setRightBtnVisible(
      currentIndex < Math.ceil(reviews.length / itemsPerView) - 1
    );
  }, [currentIndex, itemsPerView, reviews.length]);

  return (
    <div className='mx-auto w-full mb-12 '>
      <div className='flex justify-between mb-4 items-center mx-auto md:w-[70%] w-[90%]'>
        <h2 className='font-bold text-2xl'>지금 뜨는 코멘트</h2>
        <Link
          href={'/recentReview?filter=like'}
          className='text-gray-500 flex items-center'
        >
          더보기
          <IoIosArrowForward />
        </Link>
      </div>

      <div className='relative mx-auto md:w-[70%] w-[90%]'>
        <div className='overflow-hidden'>
          <div
            className='flex gap-x-3'
            style={{
              transform: `translateX(${transformValue}%)`,
              transition: 'transform 0.5s ease-in-out',
            }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className='flex-shrink-0 xl:w-[calc((100%-24px)/3)] md:w-[calc((100%-12px)/2)] w-full'
              >
                <Link href={'/recentReview?filter=like'}>
                  <RecentReviewItem review={review} type={'small'} />
                </Link>
              </div>
            ))}
          </div>

          {leftBtnVisible && (
            <button
              onClick={handlePrev}
              className='absolute -left-5 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-buttonShadow flex justify-center items-center'
            >
              <IoIosArrowBack size={25} />
            </button>
          )}
          {rightBtnVisible && (
            <button
              onClick={handleNext}
              className='absolute -right-5 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-buttonShadow flex justify-center items-center'
            >
              <IoIosArrowForward size={25} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentReview;
