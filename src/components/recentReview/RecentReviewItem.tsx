import { FaStar } from 'react-icons/fa';
import LikeButton from '../like/LikeButton';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ReviewItemType } from '../recentReview/RecentReview';
import { debounce } from '../review/ReviewItem';
import Link from 'next/link';

export interface IRecentReview {
  id: string;
  movieId: number;
  userId: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  nickname: string;
  filePath: string | null;
  likes: number;
  liked: number;
  movieTitle: string;
  posterPath: string;
}

interface Props {
  review: IRecentReview;
  type: ReviewItemType;
}

const RecentReviewItem = ({ review, type }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBtn, setShowBtn] = useState(false);
  const textRef = useRef<HTMLDivElement | null>(null);
  const maxLine = type === 'small' ? 3 : 6;

  const toggleMore = () => {
    setIsExpanded((prev) => !prev);
  };

  const computeLine = useCallback(() => {
    if (textRef.current) {
      const element = textRef.current;
      const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
      const maxHeight = lineHeight * maxLine;
      if (element.scrollHeight > maxHeight) {
        setShowBtn(true);
      } else {
        setShowBtn(false);
      }
    }
  }, [maxLine]);

  useEffect(() => {
    window.addEventListener('resize', debounce(computeLine, 200));

    return () => {
      window.removeEventListener('resize', debounce(computeLine, 200));
    };
  }, [computeLine]);

  useEffect(() => {
    computeLine();
  }, [review]);

  const lineClassName = () => {
    if (type === 'small') {
      return 'break-words line-clamp-3';
    } else if (type === 'big' && !isExpanded) {
      return `line-clamp-6`;
    } else {
      return ``;
    }
  };

  return (
    <div className='border rounded-xl px-4 py-2 flex flex-col gap-3'>
      <div className='flex justify-between'>
        <div className='flex items-center'>
          <div className='overflow-hidden shrink-0 mr-2 w-5 h-5 rounded-full'>
            {review.filePath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className='w-full h-full object-cover'
                src={review.filePath}
                alt={review.nickname}
              />
            ) : (
              <div className='bg-second w-full h-full '></div>
            )}
          </div>
          <p>{review.nickname}</p>
        </div>

        <div className='flex items-center gap-1 '>
          <FaStar className='text-amber-400' />
          <span>{review.rating}점</span>
        </div>
      </div>

      <div className='flex gap-2'>
        <div className='w-20 h-24 flex-shrink-0'>
          <Link href={`/movies/${review.movieId}`}>
          {
            // eslint-disable-next-line @next/next/no-img-element
            review.posterPath ? (
              <img
                className='w-full h-full object-cover'
                src={`https://image.tmdb.org/t/p/original/${review.posterPath}`}
                alt={`"${review.movieTitle}"`}
              />
            ) : (
              <div className='w-full h-full bg-second' />
            )
          }
          </Link>
        </div>

        <div className='w-4/5'>
          <p className='font-bold'>{review.title}</p>
          <p className={lineClassName()} ref={textRef}>
            {review.content}
          </p>
          {type !== 'small' && showBtn && (
            <button onClick={toggleMore} className='text-gray-500'>
              {isExpanded ? '접기' : '더보기'}
            </button>
          )}
        </div>
      </div>

      <hr />
      <LikeButton
        reviewId={review.id}
        liked={review.liked}
        likesCount={review.likes}
      />
    </div>
  );
};

export default RecentReviewItem;
