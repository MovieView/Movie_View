import { useMovieLike } from '@/hooks/useMovieLike';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface IProps {
  movieId: number;
  movieTitle: string;
  posterPath: string;
}

const MyPageMovieLikeButton = ({
  movieId,
  movieTitle,
  posterPath
}: IProps) => {
  const { like, likeToggle, isLoading, isError } = useMovieLike(movieId, movieTitle, posterPath, false);
 
  const handleClick = async () => {
    await likeToggle(like? Number(like?.liked) : 1);
  };

  return (
    <>
      {isError ? (
        <span>Error loading likes</span>
      ) : (
        <button
          onClick={handleClick}
          className='bg-transparent text-sm inline-flex items-center gap-1 border px-2 rounded-full w-fit h-8 hover:bg-third transition space-x-1.5'
          disabled={isLoading}
        >
          <div className='text-red-500'>
            {(like? Number(like?.liked) : 1) ? (
              <FaHeart />
            ) : (
              <FaRegHeart />
            )}
          </div>
        </button>
      )}
    </>
  );
};

export default MyPageMovieLikeButton;
