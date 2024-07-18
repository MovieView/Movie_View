import { IReviewData } from "@/models/review.model";
import { FieldPacket, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";


interface ReviewData {
  movieId: number;
  title: string;
  rating: number;
  content: string;
  movieTitle: string;
  posterPath: string;
}

const LIMIT = 10;

export async function addReview(
  userId: string, 
  data: ReviewData, 
  connection: PoolConnection
) {
  const id = uuidv4().replace(/-/g, '');
  const sql = `
    INSERT INTO reviews (id, movies_id, social_accounts_uid, rating, title, content) 
    VALUES(UNHEX(?), ?, ?, ?, ?, ?)
  `;
  const values = [
    id,
    data.movieId,
    userId,
    data.rating,
    data.title,
    data.content,
  ];
  
  try {
    const [result] = await connection.execute(sql, values);
    return (result as ResultSetHeader).affectedRows;
  } catch (err) {
    throw err;
  }
}

export async function deleteReview(
  reviewId: string, 
  userId: string, 
  connection: PoolConnection
) {
  const sql = `DELETE FROM reviews WHERE id=UNHEX(?) AND social_accounts_uid=? `;
  const values: Array<string | number> = [reviewId, userId];

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

export async function getReviewById(
  reviewId: string, 
  userId: string, 
  connection: PoolConnection
) {
  const sql = `SELECT * FROM reviews WHERE id=UNHEX(?) AND social_accounts_uid=? `;
  const values: Array<string | number> = [reviewId, userId];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    return result[0];
  } catch (err) {
    throw err;
  }
}

export async function getReviews(
  movieId: number,
  maxResults: number,
  page: number,
  sort: string,
  userId: string | null,
  connection: PoolConnection
) {
  const offset = maxResults * (page - 1);
  const values: Array<string | number> = [movieId, offset, maxResults];
  let liked = ``;
  if (userId) {
    liked = `, (SELECT COUNT(*) FROM movie_view.reviews_likes AS rl WHERE HEX(rl.reviews_id) = HEX(r.id) AND rl.social_accounts_uid = ?) > 0 AS liked`;
    values.unshift(userId);
  }

  const orderBy =
    sort === 'like' ? 'likes DESC, createdAt DESC' : 'createdAt DESC';
  const sql = `SELECT HEX(r.id) AS id, r.movies_id AS movieId, r.social_accounts_uid AS userId, r.rating, r.title, 
                r.content, r.created_at AS createdAt, r.updated_at AS updatedAt,
                REPLACE(JSON_EXTRACT(s.extra_data, '$.username'), '"', '') AS nickname, 
                REPLACE(JSON_EXTRACT(s.extra_data, '$.filepath'), '"', '') AS filePath,
                (SELECT COUNT(*) FROM reviews_likes AS rl WHERE HEX(rl.reviews_id) = HEX(r.id)) AS likes,
                (SELECT COUNT(*) FROM reviews_comments AS rc WHERE HEX(rc.reviews_id) = HEX(r.id)) AS commentsCount
                ${liked}
                FROM reviews AS r
                LEFT JOIN social_accounts AS s ON r.social_accounts_uid = s.uid
                WHERE r.movies_id=?
                ORDER BY ${orderBy}
                LIMIT ?, ?`;

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

export async function getMovieReviewsCount(movieId: number, connection: PoolConnection) {
  const sql = `SELECT COUNT(*) AS totalCount FROM reviews WHERE movies_id=?`;
  const values = [movieId];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    return result[0];
  } catch (err) {
    throw err;
  }
}

export async function getRecentReviews(
  filter: string,
  userId: string | undefined,
  page: number,
  connection: PoolConnection
) {
  let liked = ``,
    orderBy = ``;
  const offset = LIMIT * (page - 1);
  const values: Array<string | number> = [offset, LIMIT];

  if (typeof userId !== `undefined`) {
    liked = `(SELECT COUNT(*) FROM movie_view.reviews_likes AS rl WHERE HEX(rl.reviews_id) = HEX(r.id) AND rl.social_accounts_uid = ?) > 0 AS liked, `;
    values.unshift(userId);
  }

  if (filter === 'like') {
    orderBy = `likes DESC`;
  } else {
    orderBy = `r.created_at DESC`;
  }

  const sql = `
    SELECT HEX(r.id) AS id, r.movies_id AS movieId, r.social_accounts_uid AS userId, r.rating, r.title, 
    r.content, r.created_at AS createdAt, r.updated_at AS updatedAt,
    REPLACE(JSON_EXTRACT(s.extra_data, '$.username'), '"', '') AS nickname, 
    REPLACE(JSON_EXTRACT(s.extra_data, '$.filepath'), '"', '') AS filePath,
    (SELECT COUNT(*) FROM reviews_likes AS rl WHERE HEX(rl.reviews_id) = HEX(r.id)) AS likes,
    ${liked}
    m.title AS movieTitle, m.poster_path AS posterPath
    FROM reviews AS r
    LEFT JOIN social_accounts AS s ON r.social_accounts_uid = s.uid
    LEFT JOIN movies AS m ON r.movies_id = m.id
    WHERE r.created_at BETWEEN DATE_ADD(NOW(), INTERVAL -1 WEEK) AND NOW() 
    ORDER BY ${orderBy}
    LIMIT ?, ?`;

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

export async function getRecentReviewsCount(connection: PoolConnection) {
  const sql = `
    SELECT COUNT(*) AS totalCount FROM reviews 
    WHERE created_at BETWEEN DATE_ADD(NOW(), INTERVAL -1 WEEK) AND NOW()
  `;

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql
    );
    return result[0];
  } catch (err) {
    throw err;
  }
}

export async function updateReview(
  reviewId: string,
  userId: string,
  data: IReviewData,
  connection: PoolConnection
) {
  const sql = `UPDATE reviews SET title=?, rating=?, content=? WHERE id=UNHEX(?) AND social_accounts_uid=? `;
  const values: Array<string | number> = [
    data.title,
    data.rating,
    data.content,
    reviewId,
    userId,
  ];

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}