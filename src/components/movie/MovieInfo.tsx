'use client'
import { Genre } from '@/models/movie.model';
import ReviewsList from '../review/ReviewsList';
import Image from 'next/image';
import MovieLikeButton from '../like/MovieLikeButton';
import { useMovieDetail } from '@/hooks/useMovieDetail';
import { useState } from 'react';
import ErrorOMG from '@/app/detail/[movieId]/error';
import MovieCredits from './MovieCredits';

interface Props {
  movieId: string;
}

export default function MovieInfo({ movieId }: Props) {
  const { movie, credits, isLoading, isError } = useMovieDetail(movieId);
  const [imageLoaded, setImageLoaded] = useState(true);

  if(!isLoading) {
    if(!credits || !movie || isError) return <ErrorOMG />;
  }

  const handleImageLoad = () => {
    setImageLoaded(false);
  };

  if(movie && credits) {
    return (
      <div>
        <div className='mx-auto lg:mt-6 max-w-5xl p-3 lg:p-0 lg:max-w-5xl lg:grid lg:grid-cols-3 lg:gap-x-8 lg:px-8'>
          <div className='col-span-1 mb-4 lg:mb-0'>
            <Image
              className={ imageLoaded 
                ? 'w-3/4 lg:w-full max-w-sm lg:h-[28rem] h-96 rounded-lg shadow-lg animate-pulse flex space-x-4 bg-gray-300'
                : 'w-3/4 lg:w-full max-w-sm h-auto rounded-lg shadow-lg' }
              src={`https://image.tmdb.org/t/p/original/${movie?.poster_path}`}
              alt={movie?.title ? movie.title : 'not found'}
              width={500}
              height={500}
              loading="lazy"
              onLoad={handleImageLoad}
            />
          </div>

          <div className='col-span-2 space-y-6'>
            <div className='flex space-x-5 text-2xl lg:text-4xl mb-8'>
              <div className='font-bold'>{movie?.title}</div>
              <div><MovieLikeButton type={'one'} movieId={Number(movieId)} movieTitle={movie.title} posterPath={movie.poster_path} /></div>
            </div>

            <div className='flex flex-wrap space-x-10 text-m lg:text-lg'>
              <div className='font-bold'>장르</div>
              <div className='flex flex-wrap space-x-3'>
                {movie?.genres.map((genre: Genre) => (
                  <span key={genre.id}>{genre.name}</span>
                ))}
              </div>
            </div>

            <div className='flex flex-wrap space-x-10 text-m lg:text-lg'>
              <div className='font-bold'>개요</div>
              <div>
                {movie?.origin_country}, {movie?.runtime}분
              </div>
            </div>

            <div className='flex flex-wrap space-x-10 text-m lg:text-lg'>
              <div className='font-bold'>개봉</div>
              <div>{movie?.release_date}</div>
            </div>

            <div className='flex flex-wrap space-x-10 text-m lg:text-lg'>
              <div className='font-bold'>평점</div>
              <div>★ {movie?.vote_average.toFixed(1)}</div>
            </div>

            <div className='text-sm'>{movie?.overview}</div>
          </div>
        </div>
        <MovieCredits cast={credits.cast} />
        <ReviewsList
          movieId={Number(movieId)}
          movieTitle={movie.title}
          posterPath={movie.poster_path}
        />
      </div>
    );
  }
}