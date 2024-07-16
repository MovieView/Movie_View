import { API_URL } from '@/constants';
import { MovieDetail, SimilarMovieInfo } from '@/models/movie.model';
import { useQuery } from '@tanstack/react-query';

const getMovieAndCredits = async (movieId: string) => {
  const response = await fetch(`/api/movies/${movieId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
};

export const useMovieDetail = (movieId: string) => {
  const { data, isLoading, isError } = useQuery<MovieDetail, Error>({
    queryKey: ['movieDetail', movieId],
    queryFn: () => getMovieAndCredits(movieId),
  });

  const movie = data?.movie;
  const credits = data?.credits;
  const similarMovies = data?.similarMovies;

  return {
    movie,
    credits,
    isLoading,
    isError,
    similarMovies,
  };
};
