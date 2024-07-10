'use client';
import { useMovieLike } from '@/hooks/useMovieLike';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface Props {
  type: 'one' | 'list';
  movieId: number;
  movieTitle: string;
  posterPath: string;
}

const MovieLikeButton = ({
  type,
  movieId,
  movieTitle,
  posterPath
}: Props) => {
  let isEnabled = false;
  let firstLike = 1;
  if(type === 'one') {
    isEnabled = true;
    firstLike = 0;
  }

  const { like, likeToggle, isLoading, isError } = useMovieLike(movieId, movieTitle, posterPath, isEnabled);

  return (
    <>
      { isError ? (
        <span className='text-sm'>Error loading likes</span>
      ) : (
        <button
          onClick={() => likeToggle(like ? Number(like?.liked) : 1)}
          className={ 
            type === 'one'
            ? 'bg-transparent text-md inline-flex items-center gap-1 border px-2 rounded-lg w-fit space-x-1.5'
            : 'bg-transparent text-sm inline-flex items-center gap-1 border px-2 rounded-full w-fit h-8 hover:bg-third transition space-x-1.5'
          }
          disabled={isLoading}
        >
          <div className='text-red-500'>
            {(like ? Number(like?.liked) : firstLike) ? (
              <FaHeart />
            ) : (
              <FaRegHeart />
            )}
          </div>
          { type === 'one' && <div>{like ? like?.likes : 0}</div> }
        </button>
      )}
    </>
  );
};

export default MovieLikeButton;
