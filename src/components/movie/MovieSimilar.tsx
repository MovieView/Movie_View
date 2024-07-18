'use client';

import { SimilarMovie } from '@/models/movie.model';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

interface MovieSimilarProps {
  similarMovies: SimilarMovie[];
}
interface MovieCardProps {
  movie: SimilarMovie;
}
const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <Link href={`/movies/${movie.id}`}>
      {movie.poster_path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
          className='w-full h-full object-cover rounded-md'
          alt={movie.title}
        />
      ) : (
        <div className='bg-slate-500 w-full h-full rounded-md flex items-center justify-center'>
          {movie.title}
        </div>
      )}
    </Link>
  );
};

const MovieSimilar = ({ similarMovies }: MovieSimilarProps) => {
  const [leftBtnVisible, setLeftBtnVisible] = useState(false);
  const [rightBtnVisible, setRightBtnVisible] = useState(true);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const handlePrev = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -sliderRef.current.clientWidth - 12,
        behavior: 'smooth',
      });
    }
  };

  const handleNext = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: sliderRef.current.clientWidth + 12,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const handleScroll = () => {
        if (sliderRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
          setLeftBtnVisible(scrollLeft > 0);
          setRightBtnVisible(scrollLeft + 10 < scrollWidth - clientWidth);
        }
      };
      slider.addEventListener('scroll', handleScroll);
      return () => {
        slider.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <div className='mx-auto max-w-5xl mt-6 lg:px-8 px-6'>
      <div className='font-bold text-lg mb-3'>비슷한 영화</div>

      <div className='relative px-3 py-3 rounded'>
        <div className='flex gap-3 overflow-x-auto' ref={sliderRef}>
          {similarMovies.map((movie) => (
            <div
              className='flex-shrink-0 w-[calc((100%-36px)/4)] md:w-[calc((100%-48px)/5)] xl:w-[calc((100%-108px)/10)]'
              key={movie.id}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        {leftBtnVisible && (
          <button
            onClick={handlePrev}
            className='absolute -left-5 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-buttonShadow flex justify-center items-center'
          >
            <IoIosArrowBack size={25} />
          </button>
        )}
        {rightBtnVisible && (
          <button
            onClick={handleNext}
            className='absolute -right-5 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-buttonShadow flex justify-center items-center'
          >
            <IoIosArrowForward size={25} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieSimilar;
