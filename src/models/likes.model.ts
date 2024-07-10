export interface Like {
  liked: number;
  likes: number;
}

export interface Movie {
  movies_id: number; 
  movie_title: string;
  poster_path: string;
}

export interface MoviesLikeResponse {
  movies: Movie[];
  totalCount: number;
}