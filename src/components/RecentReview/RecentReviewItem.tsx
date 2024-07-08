import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import LikeButton from '../Like/LikeButton';

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
}

const RecentReviewItem = ({ review }: Props) => {
  return (
    <div className='border rounded-xl px-4 py-2 flex flex-col gap-3 h-52'>
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

      <div className='flex gap-2 flex-grow overflow-hidden'>
        <div className='w-18 h-24 flex-shrink-0'>
          <img
            className='w-full h-full object-cover'
            src={`https://image.tmdb.org/t/p/original/${review.posterPath}`}
            alt={review.movieTitle}
          />
        </div>

        <div className='w-4/5 overflow-hidden'>
          <p className='font-bold'>{review.title}</p>
          <p className='break-words line-clamp-3'>{review.content}</p>
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
