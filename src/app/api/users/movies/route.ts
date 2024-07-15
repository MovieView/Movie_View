import { authOptions } from '@/lib/authOptions';
import { getDBConnection } from '@/lib/db';
import { formatUserId } from '@/utils/formatUserId';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { getServerSession } from 'next-auth';

export async function GET(
  req: Request,
) {
  const session = await getServerSession(authOptions);
  if (!session?.provider && !session?.uid) {
    return;
  }

  const social_accounts_uid = formatUserId(session.provider, session.uid);
  if (!social_accounts_uid) {
    return new Response('Authentication Error', { status: 401 });
  }

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection() as PoolConnection;

    const movies = await getMoviesLike(social_accounts_uid, connection);
    const count = await getMoviesLikeCount(social_accounts_uid, connection);
    const result = {
      movies,
      totalCount: count ? count.totalCount : 0,
    };

    connection.release();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    connection?.release();
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

async function getMoviesLike(userId: string, connection: PoolConnection) {
  const values: Array<string | number> = [userId];
  const sql = `SELECT movies_id, movie_title, poster_path FROM movie_view.movies_likes
                WHERE social_accounts_uid = ?
                ORDER BY created_at DESC;`;

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

async function getMoviesLikeCount(userId: string, connection: PoolConnection) {
  const sql = `SELECT COUNT(*) AS totalCount FROM movie_view.movies_likes WHERE social_accounts_uid = ?`;
  const values = [userId];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(sql, values);
    return result[0];
  } catch (err) {
    throw err;
  }
}