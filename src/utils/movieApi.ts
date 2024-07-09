import { API_URL } from "@/constants";
import { Credits, Movie } from "@/models/movie.model";

export async function fetchMovie(movieId: string): Promise<Movie | null> {
  try {
    const response = await fetch(
      `${API_URL}/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=ko-KR`
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

export async function fetchMovieCredits(
  movieId: string
): Promise<Credits | null> {
  try {
    const response = await fetch(
      `${API_URL}/${movieId}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=ko-KR`
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