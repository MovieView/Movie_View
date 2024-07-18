import { FieldPacket, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";


export async function addComment(
  reviewId: string, 
  userId: string, 
  content: string,
  connection: PoolConnection
) {
  const id = uuidv4().replace(/-/g, '');
  const sql = `INSERT INTO reviews_comments (id, users_id, reviews_id, content) VALUES(UNHEX(?), ?, UNHEX(?), ?)`;
  const values = [id, userId, reviewId, content];

  try {
    const [result] = await connection.execute(sql, values);
    return (result as ResultSetHeader).affectedRows;
  } catch (err) {
    throw err;
  }
}

export async function deleteCommentById(
  commentId: number, 
  userId: number, 
  connection: PoolConnection
) {
  const values: Array<string | number> = [commentId, userId];
  const sql = `DELETE FROM reviews_comments WHERE id=UNHEX(?) AND users_id=?`;

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

export async function updateCommentById(
  commentId: number,
  userId: number,
  content: string,
  connection: PoolConnection
) {
  const sql = `UPDATE reviews_comments SET content=? WHERE id=UNHEX(?) AND users_id=? `;
  const values: Array<string | number> = [content, commentId, userId];

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

export async function getComments(
  reviewId: string,
  maxResults: number, 
  page: number,
  connection: PoolConnection
) {
  const offset = maxResults * (page - 1);
  const values: Array<number | string> = [reviewId, offset, maxResults];
  const sql = `SELECT HEX(rc.id) AS id, rc.content, s.uid AS userId,
                REPLACE(JSON_EXTRACT(s.extra_data, '$.filepath'), '"', '') AS filePath,
                REPLACE(JSON_EXTRACT(s.extra_data, '$.username'), '"', '') AS nickname, 
                rc.created_at AS createdAt, rc.updated_at AS updatedAt
                FROM reviews_comments AS rc
                LEFT JOIN users AS u ON u.id = rc.users_id
                LEFT JOIN social_accounts AS s ON rc.users_id = s.users_id
                WHERE HEX(rc.reviews_id) = ?
                ORDER BY createdAt
                LIMIT ?, ?`;

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}
  
export async function getReviewCommentsCount(reviewId: string, connection: PoolConnection) {
  const sql = `SELECT COUNT(*) AS totalCount FROM reviews_comments WHERE HEX(reviews_id)=?`;
  const values = [reviewId];

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

export async function getReviewWriterSocialAccountsUID(
  reviewId: string,
  connection: PoolConnection
) {
  const sql = `
    SELECT social_accounts_uid
    FROM movie_view.reviews
    WHERE HEX(id) = ?;
  `;

  try {
    const [result] = await connection.execute<RowDataPacket[]>(sql, [reviewId]);
    if (result.length === 0) {
      return null;
    }

    if (!result[0].social_accounts_uid) {
      return null;
    }

    return result[0].social_accounts_uid;
  } catch (err) {
    throw err;
  }
}