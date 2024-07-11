'use client';

import { SimilarMovie } from '@/models/movie.model';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { debounce } from '../review/ReviewItem';

interface MovieSimilarProps {
  similarMovies: SimilarMovie[];
}
interface MovieCardProps {
  movie: SimilarMovie;
}
const MovieCard = ({ movie }: MovieCardProps) => {
  const cardHeight = '150px';
  return (
    <div className='flex-shrink-0 w-[calc((100%-12px)/2)] md:w-[calc((100%-24px)/3)] xl:w-[calc((100%-60px)/5)] h-full'>
      <Link href={`/detail/${movie.id}`}>
        {movie.backdrop_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            className='w-full h-full object-cover rounded-md'
            alt={movie.title}
            style={{ minHeight: cardHeight }}
          />
        ) : (
          <div
            className='bg-slate-500 w-full rounded-md'
            style={{ minHeight: cardHeight }}
          ></div>
        )}
        <p className='text-center mt-3 text-slate-300'>{movie.title}</p>
      </Link>
    </div>
  );
};

const MovieSimilar = ({ similarMovies }: MovieSimilarProps) => {
  const [leftBtnVisible, setLeftBtnVisible] = useState(false);
  const [rightBtnVisible, setRightBtnVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(2);

  const handleResize = useCallback(() => {
    if (window.innerWidth <= 768) {
      setItemsPerView(2);
    } else if (window.innerWidth <= 1280) {
      setItemsPerView(3);
    } else {
      setItemsPerView(5);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', debounce(handleResize, 100));

    return () => {
      window.removeEventListener('resize', debounce(handleResize, 100));
    };
  }, [handleResize]);

  useEffect(() => {
    setLeftBtnVisible(currentIndex > 0);
    setRightBtnVisible(
      currentIndex < Math.ceil(similarMovies.length / itemsPerView) - 1
    );
  }, [currentIndex, itemsPerView, similarMovies.length]);

  const handleNext = () => {
    if (currentIndex === Math.ceil(similarMovies.length / itemsPerView) - 1)
      return;
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const transformValue = useMemo(() => {
    return currentIndex * -100;
  }, [currentIndex]);

  return (
    <div className='mx-auto max-w-5xl mt-6 lg:px-8 px-6'>
      <div className='font-bold text-lg mb-3'>비슷한 영화</div>

      <div className='relative bg-black px-3 py-3 rounded'>
        <div className='overflow-hidden'>
          <div
            className='flex gap-3'
            style={{
              transform: `translateX(${transformValue}%)`,
              transition: 'transform 1s ease-in-out',
            }}
          >
            {similarMovies.map((movie) => (
              <MovieCard movie={movie} key={movie.id} />
            ))}
          </div>
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
  );
};

export default MovieSimilar;
