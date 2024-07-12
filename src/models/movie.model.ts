export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  title: string;
  release_date: string;
  runtime: number;
  genres: Genre[];
  poster_path: string;
  vote_average: number;
  overview: string;
  origin_country: string;
}

export interface Cast {
  id: number;
  name: string;
  profile_path: string;
}

export interface Credits {
  cast: Cast[];
}

export interface MovieDetail {
  movie: Movie;
  credits: Credits;
  similarMovies: SimilarMovieInfo;
}
export interface SimilarMovie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface SimilarMovieInfo {
  page: number;
  results: SimilarMovie[];
  total_pages: number;
  total_results: number;
}
