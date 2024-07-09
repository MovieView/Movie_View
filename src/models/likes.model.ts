export interface ILike {
  liked: number;
  likes: number;
}

export interface IMovie {
  movies_id: number; 
  movie_title: string;
  poster_path: string;
}

export interface MoviesLikeResponse {
  movies: IMovie[];
  totalCount: number;
}