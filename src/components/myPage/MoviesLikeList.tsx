'use client'
import { useMoviesLike } from '@/hooks/useMoviesLikeList';
import React, { useEffect, useRef } from 'react';
import MovieItem from './MovieItem';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import Spinner from '../common/Spinner';

export default function MoviesLikeList() {
  const { 
    isMobile,
    isLoading, 
    isError, 
    currentPage, 
    currentMovies,
    pageNumbers,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    handleClickPage 
  } = useMoviesLike();
    
  const pageEnd = useRef<HTMLLIElement | null>(null);

  useEffect(() => { 
    if (isMobile) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          handleNextPage();
        }
      });

      pageEnd.current && observer.observe(pageEnd.current);
      return () => observer.disconnect();
    }
  }, [handleNextPage, isMobile]);
  
  if (isLoading) {
    return <Spinner size='lg' item={true} />;
  }
  
  if (isError) {
    return <div>Error loading movies</div>;
  }

  return (
    <div className='w-full sm:w-11/12 lg:w-9/12 mx-auto p-2 sm:p-4 mt-5'>
      <h1 className='text-xl sm:text-2xl font-bold mb-5'>내가 좋아요한 영화</h1>
      { currentMovies.length !== 0
        ?
        <>
          <ul className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4'>
            {currentMovies.map((movie) => (
              <li 
                key={movie.movies_id} 
                ref={pageEnd}
              >
                <MovieItem movieId={movie.movies_id} movieTitle={movie.movie_title} posterPath={movie.poster_path} />
              </li>
            ))}
          </ul>
          
          <div className='hidden md:flex justify-center items-center mt-4 space-x-1 sm:space-x-3'>
            <button 
              onClick={handlePreviousPage} 
              disabled={currentPage === 1}
              className='text-3xl bg-first text-white rounded-full disabled:bg-gray-300'
            >
              <MdNavigateBefore />
            </button>
            <span className='flex space-x-3'>
              {pageNumbers.map((v, i) => (
                  v === currentPage
                ? <div className='underline' key={i}>{v}</div> 
                : <div 
                    key={i}
                    onClick={() => handleClickPage(v)}
                    className='hover:text-gray-500 cursor-pointer' 
                  >
                    {v}
                  </div>
              ))}
            </span>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage >= totalPages}
              className='text-3xl bg-first text-white rounded-full w-fit disabled:bg-gray-300'  
            >
              <MdNavigateNext />
            </button>
          </div>
        </>
        :
        <div>좋아요 한 영화가 없습니다.</div>
      }
    </div>
  );
};
