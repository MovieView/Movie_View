import { IReview, useReview } from '@/hooks/useReview';
import { IoIosArrowForward } from 'react-icons/io';
import { IoIosArrowBack } from 'react-icons/io';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import RecentReviewItem, { IRecentReview } from './RecentReviewItem';

// const reviews: IRecentReview[] = [
//   {
//     id: '1',
//     movieId: 1,
//     userId: 'userId',
//     rating: 1,
//     title: 'title',
//     content: `googoodgoodgoodgoodgoodgoodgoodgood
//     goodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgood
//     goodgoodgoodgoodgoodgoodgoodgoodgood`,
//     createdAt: `2024.07.07.12:00`,
//     updatedAt: `2024.07.07.12:00`,
//     nickname: 'elsa',
//     filePath: null,
//     likes: 3,
//     liked: 1,
//     movieTitle: '슈퍼배드',
//     posterPath: '/plNOSbqkSuGEK2i15A5btAXtB7t.jpg',
//   },
//   {
//     id: '2',
//     movieId: 2,
//     userId: 'userId2',
//     rating: 2,
//     title: 'title22',
//     content: `good222`,
//     createdAt: `2024.07.01.12:00`,
//     updatedAt: `2024.07.01.12:00`,
//     nickname: 'elsa222',
//     filePath: null,
//     likes: 3,
//     liked: 1,
//     movieTitle: '슈퍼배드',
//     posterPath: '/plNOSbqkSuGEK2i15A5btAXtB7t.jpg',
//   },
//   {
//     id: '3',
//     movieId: 3,
//     userId: 'userId3',
//     rating: 3,
//     title: 'title33',
//     content: `good333`,
//     createdAt: `2024.07.01.12:00`,
//     updatedAt: `2024.07.01.12:00`,
//     nickname: 'elsa333',
//     filePath: null,
//     likes: 3,
//     liked: 1,
//     movieTitle: '슈퍼배드',
//     posterPath: '/plNOSbqkSuGEK2i15A5btAXtB7t.jpg',
//   },
//   {
//     id: '4',
//     movieId: 4,
//     userId: 'userId4',
//     rating: 4,
//     title: 'title44',
//     content: `good44`,
//     createdAt: `2024.07.01.12:00`,
//     updatedAt: `2024.07.01.12:00`,
//     nickname: 'elsa44',
//     filePath: null,
//     likes: 3,
//     liked: 1,
//     movieTitle: '슈퍼배드',
//     posterPath: '/plNOSbqkSuGEK2i15A5btAXtB7t.jpg',
//   },
//   {
//     id: '5',
//     movieId: 5,
//     userId: 'userId5',
//     rating: 5,
//     title: 'title55',
//     content: `good55`,
//     createdAt: `2024.07.01.12:00`,
//     updatedAt: `2024.07.01.12:00`,
//     nickname: 'elsa55',
//     filePath: null,
//     likes: 3,
//     liked: 1,
//     movieTitle: '슈퍼배드',
//     posterPath: '/plNOSbqkSuGEK2i15A5btAXtB7t.jpg',
//   },
//   {
//     id: '6',
//     movieId: 6,
//     userId: 'userId6',
//     rating: 6,
//     title: 'title66',
//     content: `good66`,
//     createdAt: `2024.07.01.12:00`,
//     updatedAt: `2024.07.01.12:00`,
//     nickname: 'elsa6',
//     filePath: null,
//     likes: 3,
//     liked: 1,
//     movieTitle: '슈퍼배드',
//     posterPath: '/plNOSbqkSuGEK2i15A5btAXtB7t.jpg',
//   },
// ];

interface Props {
  reviews: IReview[];
}

const RecentReview = ({ reviews }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [leftBtnVisible, setLeftBtnVisible] = useState(false);
  const [rightBtnVisible, setrightBtnVisible] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setItemsPerView(1);
      } else if (window.innerWidth <= 1280) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
  };
  const handleNext = () => {
    if (currentIndex === Math.ceil(reviews.length / itemsPerView) - 1) return;
    setCurrentIndex((prev) => prev + 1);
  };

  const transformValue = useMemo(() => {
    console.log(itemsPerView);
    if (typeof window !== 'undefined') {
      return itemsPerView !== 1
        ? currentIndex * -(100 + (12 / ((window.innerWidth * 70) / 100)) * 100)
        : currentIndex * -(100 + (12 / ((window.innerWidth * 90) / 100)) * 100);
    }
  }, [currentIndex, itemsPerView]);

  useEffect(() => {
    if (currentIndex === 0) {
      setLeftBtnVisible(false);
      setrightBtnVisible(true);
    } else if (currentIndex === Math.ceil(reviews.length / itemsPerView - 1)) {
      setLeftBtnVisible(true);
      setrightBtnVisible(false);
    } else {
      setLeftBtnVisible(true);
      setrightBtnVisible(true);
    }
  }, [currentIndex, itemsPerView]);

  return (
    <div className='mx-auto w-full mb-12 '>
      <div className='flex justify-between mb-4 items-center mx-auto md:w-[70%] w-[90%]'>
        <h2 className='font-bold text-2xl'>지금 뜨는 코멘트</h2>
        <Link href={''} className='text-gray-500 flex items-center'>
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
                <RecentReviewItem review={review} />
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
