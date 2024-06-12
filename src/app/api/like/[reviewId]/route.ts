import { dbConnection as db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

interface LikeQueryResult extends RowDataPacket {
  liked: number;
  likes: number;
}

interface ILike {
  id: string;
  reviews_id: string;
  users_id: number;
}

const users_id = 2;

export const GET = async (
  req: Request,
  { params }: { params: { reviewId: string } }
) => {
  try {
    if (!users_id) {
      return new Response('Authentication Error', { status: 401 });
    }

    const result = await getLike(params.reviewId, users_id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Internal server error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

export const POST = async (
  req: Request,
  { params }: { params: { reviewId: string } }
) => {
  try {
    if (!users_id) {
      return new Response('Authentication Error', { status: 401 });
    }

    const like = {
      id: uuidv4().replace(/-/g, ''),
      reviews_id: params.reviewId,
      users_id: users_id,
    };

    const result = await postLike(like);
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Internal server error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { reviewId: string } }
) => {
  try {
    const result = await deleteLike(params.reviewId, users_id);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Internal server error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

async function getLike(
  reviewId: string,
  userId: number
): Promise<LikeQueryResult> {
  const sql = `SELECT 
                COALESCE(SUM(CASE WHEN HEX(users_id) = ? THEN 1 ELSE 0 END), 0) AS liked,
                COUNT(*) AS likes
              FROM movie_view.reviews_likes
              WHERE HEX(reviews_id) = ?;`;

  try {
    const [result] = await db
      .promise()
      .execute<LikeQueryResult[]>(sql, [userId, reviewId]);
    return result[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function postLike(like: ILike) {
  const sql = `INSERT IGNORE INTO movie_view.reviews_likes (id, reviews_id, users_id)
             VALUES ( ?, UNHEX(?), ? );`;

  try {
    const [result] = await db
      .promise()
      .execute(sql, [like.id, like.reviews_id, like.users_id]);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function deleteLike(reviewId: string, userId: number) {
  const sql = `DELETE FROM movie_view.reviews_likes WHERE reviews_id=UNHEX(?) AND users_id=?;`;

  try {
    const [result] = await db.promise().execute(sql, [reviewId, userId]);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
