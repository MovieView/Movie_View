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
}