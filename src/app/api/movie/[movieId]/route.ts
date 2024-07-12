import { API_URL } from '@/constants';
import { Credits, Movie, SimilarMovieInfo } from '@/models/movie.model';

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
    console.error('Internal server error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

async function fetchMovie(movieId: string): Promise<Movie | null> {
  try {
    const response = await fetch(
      `${API_URL}/${movieId}?api_key=${process.env.TMDB_API_KEY}&language=ko-KR`
    );

    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      console.error('Error fetching movie:', data.status_message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching movie:', error);
    throw error;
  }
}

async function fetchMovieCredits(movieId: string): Promise<Credits | null> {
  try {
    const response = await fetch(
      `${API_URL}/${movieId}/credits?api_key=${process.env.TMDB_API_KEY}&language=ko-KR`
    );
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      console.error('Error fetching movie credits:', data.status_message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    throw error;
  }
}

async function fetchSimilarMovies(
  movieId: string
): Promise<SimilarMovieInfo | null> {
  try {
    const response = await fetch(
      `${API_URL}/${movieId}/similar?api_key=${process.env.TMDB_API_KEY}&language=ko-KR`
    );
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      console.error('Error fetching similar movie:', data.status_message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching similar movie:', error);
    throw error;
  }
}
