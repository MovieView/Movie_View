import { MoviesLikeResponse } from '@/models/likes.model';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const getMoviesLike = async () => {
  const response = await fetch(
    `/api/user/movies`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
};

export const useMoviesLike = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allMovies, setAllMovies] = useState<MoviesLikeResponse>({ 
    movies: [],
    totalCount: 0
  });
  
  const moviesPerPage = isMobile ? 6 : 5;
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data, isLoading, isError } = useQuery<MoviesLikeResponse, Error>({
    queryKey: ['myMoviesLikes'],
    queryFn: getMoviesLike
  });

  useEffect(() => {
    if (data) {
      setAllMovies(data);
    }
  }, [data]);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(allMovies?.totalCount / moviesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalCount = allMovies.totalCount;
  const totalPages = Math.ceil(totalCount / moviesPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const indexOfLastMovie = currentPage * moviesPerPage;
  let indexOfFirstMovie = 0;
  isMobile ? indexOfFirstMovie = 0: indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies =  allMovies.movies.slice(indexOfFirstMovie, indexOfLastMovie);

  const handleClickPage = (clickPage: number) => {
    if (clickPage >= 1 && clickPage <= totalPages) {
      setCurrentPage(clickPage);
    }
  };
  

  return {
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
  };
}