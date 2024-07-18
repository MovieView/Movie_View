import Image from 'next/image';
import Link from 'next/link';
import MovieLikeButton from '../like/MovieLikeButton';

interface Props {
  movieId: number;
  movieTitle: string;
  posterPath: string;
}

export default function MovieItem({ movieId, movieTitle, posterPath }: Props) {
  return (
    <div>
      <Link href={`/movies/${movieId}`} className='cursor-pointer'>
        <Image
          className='w-full max-w-sm lg:h-auto h-64 rounded-lg shadow-lg mb-3'
          src={`https://image.tmdb.org/t/p/original/${posterPath}`}
          alt={`${movieTitle} Poster`}
          width={500}
          height={500}
          loading="lazy"
        />
      </Link>
      <div className='flex justify-between items-center'>
        <div className='flex-grow text-xs hover:text-gray-500 cursor-pointer'>
          <Link href={`/movies/${movieId}`}>
            {movieTitle}
          </Link>
        </div>
        <MovieLikeButton type={'list'} movieId={Number(movieId)} movieTitle={movieTitle} posterPath={posterPath} />
      </div>
    </div>
  );
};
