import { useLike } from '@/hooks/useLike';
import { AiFillLike, AiOutlineLike } from 'react-icons/ai';

interface IProps {
  userId?: null | string;
  reviewId: string;
  liked: number;
  likesCount: number;
}

const LikeButton = ({ userId, reviewId, liked, likesCount }: IProps) => {
  const { likes, likeToggle, isLoading, isError } = useLike(reviewId);

  return (
    <>
      {isError ? (
        <span>Error loading likes</span>
      ) : userId ? (
        <button
          onClick={() => likeToggle(likes ? Number(likes.liked) : liked)}
          className='bg-transparent text-md inline-flex items-center gap-1 border px-2 rounded-lg hover:bg-[#D6E6F2] transition ease-linear duration-300 w-fit'
          disabled={isLoading}
        >
          <div>
            {(likes ? Number(likes.liked) : liked) ? (
              <AiFillLike />
            ) : (
              <AiOutlineLike />
            )}
          </div>
          {likes ? likes.likes : likesCount}
        </button>
      ) : (
        <button
          className='bg-transparent text-md inline-flex items-center gap-1 border px-2 rounded-lg transition ease-linear duration-300 w-fit'
          disabled={true}
        >
          <div>
            <AiOutlineLike />
          </div>
          {likesCount}
        </button>
      )}
    </>
  );
};

export default LikeButton;
