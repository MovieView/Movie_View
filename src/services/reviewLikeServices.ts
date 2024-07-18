import { Like } from "@/models/likes.model";
import { PoolConnection, RowDataPacket } from "mysql2/promise";


interface LikeQueryResult extends Like, RowDataPacket {}

interface ILike {
  id: string;
  reviews_id: string;
  social_accounts_uid: string | undefined;
}

export async function getLike(
  reviewId: string,
  social_accounts_uid: string,
  connection: PoolConnection
): Promise<Like> {
  const sql = `
    SELECT 
    COALESCE(SUM(CASE WHEN social_accounts_uid = ? THEN 1 ELSE 0 END), 0) AS liked,
    COUNT(*) AS likes
    FROM movie_view.reviews_likes
    WHERE HEX(reviews_id) = ?;
  `;

  try {
    const [result] = await connection
      .execute<LikeQueryResult[]>(sql, [social_accounts_uid, reviewId]);

    return result[0];
  } catch (err) {
    throw err;
  }
}

export async function postLike(like: ILike, connection: PoolConnection) {
  const sql = `
    INSERT IGNORE INTO movie_view.reviews_likes (id, reviews_id, social_accounts_uid)
    VALUES ( UNHEX(?), UNHEX(?), ? );
  `;

  try {
    const [result] = await connection
      .execute(sql, [like.id, like.reviews_id, like.social_accounts_uid]);
    
    return result;
  } catch (err) {
    throw err;
  }
}

export async function deleteLike(
  reviewId: string, 
  social_accounts_uid: string,
  connection: PoolConnection
) {
  const sql = `DELETE FROM movie_view.reviews_likes WHERE reviews_id=UNHEX(?) AND social_accounts_uid=?;`;

  try {
    const [result] = await connection
      .execute(sql, [reviewId, social_accounts_uid]);

    return result;
  } catch (err) {
    throw err;
  }
}