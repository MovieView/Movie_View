export interface ILike {
  liked: number;
  likes: number;
}

export interface MoviesLikeResponse {
  movies: { 
    movies_id: number; 
    movie_title: string;
    poster_path: string;
  }[];
  totalCount: number;
}