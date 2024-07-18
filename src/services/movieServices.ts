import { API_URL } from '@/constants';
import { Like } from '@/models/likes.model';
import { Credits, Movie, SimilarMovieInfo } from '@/models/movie.model';
import { FieldPacket, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";


export interface LikeMovieQueryResult extends Like, RowDataPacket {}
export interface IMovieLike {
  id: string;
  movies_id: string;
  movie_title: string;
  poster_path: string;
  social_accounts_uid: string | undefined;
}

export async function addMovieId(
  movieId: number,
  movieTitle: string,
  posterPath: string,
  connection: PoolConnection
) {
  const sql = `INSERT IGNORE INTO movies (id, title, poster_path) VALUES (?,?,?)`;
  const values = [movieId, movieTitle, posterPath];

  try {
    const [result] = await connection.execute(sql, values);
    return (result as ResultSetHeader).affectedRows;
  } catch (err) {
    throw err;
  }
}

export async function fetchMovie(movieId: string): Promise<Movie | null> {
  try {
    const response = await fetch(
      `${API_URL}/${movieId}?api_key=${process.env.TMDB_API_KEY}&language=ko-KR`
    );

    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
}

export async function fetchMovieCredits(movieId: string): Promise<Credits | null> {
  try {
    const response = await fetch(
      `${API_URL}/${movieId}/credits?api_key=${process.env.TMDB_API_KEY}&language=ko-KR`
    );
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
}

export async function fetchSimilarMovies(
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
      return null;
    }
  } catch (error) {
    throw error;
  }
}

export const getMovieIdUsingReviewId = async (
  reviewId: string,
  connection: PoolConnection
) => {
  const sql = `
    SELECT movies_id
    FROM movie_view.reviews
    WHERE HEX(id) = ?;
  `;

  try {
    const [result] = await connection.execute<RowDataPacket[]>(sql, [reviewId]);
    if (result.length === 0) {
      return null;
    }

    if (!result[0].movies_id) {
      return null;
    }

    return result[0].movies_id;
  } catch (err) {
    throw err;
  }
}

export async function getMovieLike(
  reviewId: string,
  social_accounts_uid: string,
  connection: PoolConnection
): Promise<LikeMovieQueryResult> {
  const sql = `
    SELECT 
    COALESCE(SUM(CASE WHEN social_accounts_uid = ? THEN 1 ELSE 0 END), 0) AS liked,
    COUNT(*) AS likes
    FROM movie_view.movies_likes
    WHERE movies_id = ?;
  `;

  try {
    const [result] = await connection
      .execute<LikeMovieQueryResult[]>(sql, [social_accounts_uid, reviewId]);
    
    return result[0];
  } catch (err) {
    throw err;
  }
}

export async function getUserMoviesLike(userId: string, connection: PoolConnection) {
  const values: Array<string | number> = [userId];
  const sql = `
    SELECT movies_id, movie_title, poster_path FROM movie_view.movies_likes
    WHERE social_accounts_uid = ?
    ORDER BY created_at DESC;
  `;

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

export async function getUserMoviesLikeCount(userId: string, connection: PoolConnection) {
  const sql = `SELECT COUNT(*) AS totalCount FROM movie_view.movies_likes WHERE social_accounts_uid = ?`;
  const values = [userId];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(sql, values);
    return result[0];
  } catch (err) {
    throw err;
  }
}

export async function postMovieLike(like: IMovieLike, connection: PoolConnection) {
  const sql = `
    INSERT IGNORE INTO movie_view.movies_likes (id, movies_id, movie_title, poster_path, social_accounts_uid )
    VALUES ( UNHEX(?), ?, ?, ?, ? );
  `;

  try {
    const [result] = await connection
      .execute(sql, [like.id, like.movies_id, like.movie_title, like.poster_path, like.social_accounts_uid ]);

    return result;
  } catch (err) {
    throw err;
  }
}

export async function deleteMovieLike(
  movieId: string, 
  social_accounts_uid: string,
  connection: PoolConnection
) {
  const sql = `DELETE FROM movie_view.movies_likes WHERE movies_id=? AND social_accounts_uid=?;`;
  try {
    const [result] = await connection
      .execute(sql, [movieId, social_accounts_uid]);

    return result;
  } catch (err) {
    throw err;
  }
}