import { API_URL } from '@/constants';
import { MovieDetail, SimilarMovieInfo } from '@/models/movie.model';
import { useQuery } from '@tanstack/react-query';

const getMovieAndCredits = async (movieId: string) => {
  const response = await fetch(`/api/movie/${movieId}`, {
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

// export async function getSimilarMovies(
//   movieId: string
// ): Promise<SimilarMovieInfo | null> {
//   try {
//     const response = await fetch(
//       `${API_URL}/${movieId}/similar?api_key=${process.env.TMDB_API_KEY}&language=ko-KR`
//     );
//     const data = await response.json();
//     if (response.ok) {
//       return data;
//     } else {
//       console.error('Error fetching similar movie:', data.status_message);
//       return null;
//     }
//   } catch (error) {
//     console.error('Error fetching similar movie:', error);
//     throw error;
//   }
// }

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
