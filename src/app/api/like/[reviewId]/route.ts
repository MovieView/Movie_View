import { authOptions } from '@/lib/authOptions';
import { dbConnectionPoolAsync } from '@/lib/db';
import { formatUserId } from '@/utils/formatUserId';
import { RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';

interface LikeQueryResult extends RowDataPacket {
  liked: number;
  likes: number;
}

interface ILike {
  id: string;
  reviews_id: string;
  social_accounts_uid: string | undefined;
}

export const GET = async (
  req: Request,
  { params }: { params: { reviewId: string } }
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.provider && !session?.uid) {
      return;
    }
    const social_accounts_uid = formatUserId(session.provider, session.uid);

    if (!social_accounts_uid) {
      return new Response('Authentication Error', { status: 401 });
    }

    const result = await getLike(params.reviewId, social_accounts_uid);

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
    const session = await getServerSession(authOptions);
    if (!session?.provider && !session?.uid) {
      return;
    }
    const social_accounts_uid = formatUserId(session.provider, session.uid);

    if (!social_accounts_uid) {
      return new Response('Authentication Error', { status: 401 });
    }

    const like = {
      id: uuidv4().replace(/-/g, ''),
      reviews_id: params.reviewId,
      social_accounts_uid: social_accounts_uid,
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
    const session = await getServerSession(authOptions);
    if (!session?.provider && !session?.uid) {
      return;
    }
    const social_accounts_uid = formatUserId(session.provider, session.uid);

    const result = await deleteLike(params.reviewId, social_accounts_uid as string);
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
  social_accounts_uid: string
): Promise<LikeQueryResult> {
  let connection;
  const sql = `SELECT 
                COALESCE(SUM(CASE WHEN social_accounts_uid = ? THEN 1 ELSE 0 END), 0) AS liked,
                COUNT(*) AS likes
              FROM movie_view.reviews_likes
              WHERE HEX(reviews_id) = ?;`;

  try {
    connection = await dbConnectionPoolAsync.getConnection();

    const [result] = await connection
      .execute<LikeQueryResult[]>(sql, [social_accounts_uid, reviewId]);

    return result[0];
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function postLike(like: ILike) {
  let connection;
  const sql = `INSERT IGNORE INTO movie_view.reviews_likes (id, reviews_id, social_accounts_uid)
             VALUES ( UNHEX(?), UNHEX(?), ? );`;

  try {
    connection = await dbConnectionPoolAsync.getConnection();

    const [result] = await connection
      .execute(sql, [like.id, like.reviews_id, like.social_accounts_uid]);

    return result;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function deleteLike(reviewId: string, social_accounts_uid: string) {
  let connection;
  const sql = `DELETE FROM movie_view.reviews_likes WHERE reviews_id=UNHEX(?) AND social_accounts_uid=?;`;

  try {
    connection = await dbConnectionPoolAsync.getConnection();

    const [result] = await connection
      .execute(sql, [reviewId, social_accounts_uid]);

    return result;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
