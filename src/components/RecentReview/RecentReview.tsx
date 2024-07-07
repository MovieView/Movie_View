import { IReview } from '@/hooks/useReview';
import ReviewItem from '../Review/ReviewItem';
import { IoIosArrowForward } from 'react-icons/io';
import { IoIosArrowBack } from 'react-icons/io';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const reviews: IReview[] = [
  {
    id: '1',
    movieId: 1,
    userId: 'userId',
    rating: 1,
    title: 'title',
    content: `good goodgoodgoodgoodgood`,
    createdAt: `2024.07.07.12:00`,
    updatedAt: `2024.07.07.12:00`,
    nickname: 'elsa',
    filePath: null,
    likes: 3,
    liked: 1,
  },
  {
    id: '2',
    movieId: 2,
    userId: 'userId2',
    rating: 2,
    title: 'title22',
    content: `good222`,
    createdAt: `2024.07.01.12:00`,
    updatedAt: `2024.07.01.12:00`,
    nickname: 'elsa222',
    filePath: null,
    likes: 3,
    liked: 1,
  },
  {
    id: '3',
    movieId: 3,
    userId: 'userId3',
    rating: 3,
    title: 'title33',
    content: `good333`,
    createdAt: `2024.07.01.12:00`,
    updatedAt: `2024.07.01.12:00`,
    nickname: 'elsa333',
    filePath: null,
    likes: 3,
    liked: 1,
  },
  {
    id: '4',
    movieId: 4,
    userId: 'userId4',
    rating: 4,
    title: 'title44',
    content: `good44`,
    createdAt: `2024.07.01.12:00`,
    updatedAt: `2024.07.01.12:00`,
    nickname: 'elsa44',
    filePath: null,
    likes: 3,
    liked: 1,
  },
  {
    id: '5',
    movieId: 5,
    userId: 'userId5',
    rating: 5,
    title: 'title55',
    content: `good5555`,
    createdAt: `2024.07.01.12:00`,
    updatedAt: `2024.07.01.12:00`,
    nickname: 'elsa555',
    filePath: null,
    likes: 3,
    liked: 1,
  },
  {
    id: '6',
    movieId: 6,
    userId: 'userId6',
    rating: 6,
    title: 'title66',
    content: `good666`,
    createdAt: `2024.07.01.12:00`,
    updatedAt: `2024.07.01.12:00`,
    nickname: 'elsa666',
    filePath: null,
    likes: 3,
    liked: 1,
  },
];

const RecentReview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [leftBtnVisible, setLeftBtnVisible] = useState(false);
  const [rightBtnVisible, setrightBtnVisible] = useState(true);

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
  };
  const handleNext = () => {
    if (currentIndex === Math.ceil(reviews.length / 3) - 1) return;
    setCurrentIndex((prev) => prev + 1);
  };

  const transformValue = useMemo(() => {
    return currentIndex * -(100 + (12 / window.innerWidth) * 100);
  }, [currentIndex]);

  useEffect(() => {
    if (currentIndex === 0) {
      setLeftBtnVisible(false);
      setrightBtnVisible(true);
    } else if (currentIndex === Math.ceil(reviews.length / 3 - 1)) {
      setLeftBtnVisible(true);
      setrightBtnVisible(false);
    } else {
      setLeftBtnVisible(true);
      setrightBtnVisible(true);
    }
  }, [currentIndex]);

  return (
    <div className='mx-auto w-full relative mb-12 '>
      <div className='mx-auto md:w-[70%] overflow-scroll'>
        <div className='flex justify-between mb-4 items-center'>
          <h2 className='font-bold text-2xl'>지금 뜨는 코멘트</h2>
          <Link href={''} className='text-gray-500'>
            더보기
          </Link>
        </div>

        <div
          className='flex gap-3'
          style={{
            transform: `translateX(${transformValue}%)`,
            transition: 'transform 0.5s ease-in-out',
          }}
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className='flex-shrink-0 w-[calc((100%-24px)/3)]'
            >
              <ReviewItem
                review={review}
                onDelete={() => {}}
                onUpdate={() => {}}
              />
            </div>
          ))}
        </div>
      </div>
      {leftBtnVisible && (
        <button
          onClick={handlePrev}
          className='absolute left-60 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-buttonShadow flex justify-center items-center'
        >
          <IoIosArrowBack size={25} />
        </button>
      )}
      {rightBtnVisible && (
        <button
          onClick={handleNext}
          className='absolute right-60 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-buttonShadow flex justify-center items-center'
        >
          <IoIosArrowForward size={25} />
        </button>
      )}
    </div>
  );
};

export default RecentReview;
