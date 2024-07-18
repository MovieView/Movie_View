import { fetchMovie, fetchMovieCredits, fetchSimilarMovies } from '@/services/movieServices';

export const GET = async (
  req: Request,
  { params }: { params: { movieId: string } }
) => {
  try {
    const movie = await fetchMovie(params.movieId);
    const credits = await fetchMovieCredits(params.movieId);
    const similarMovies = await fetchSimilarMovies(params.movieId);

    const results = {
      movie,
      credits,
      similarMovies,
    };

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
};