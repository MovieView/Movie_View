import { authOptions } from '@/lib/authOptions';
import { dbConnectionPoolAsync } from '@/lib/db';
import { formatUserId } from '@/utils/formatUserId';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';

export async function GET(
  req: Request,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.provider && !session?.uid) {
      return;
    }
    const social_accounts_uid = formatUserId(session.provider, session.uid);

    if (!social_accounts_uid) {
      return new Response('Authentication Error', { status: 401 });
    }

    const movies = await getMoviesLike(social_accounts_uid);
    const count = await getMoviesLikeCount(social_accounts_uid);
    const result = {
      movies,
      totalCount: count ? count.totalCount : 0,
    };
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

async function getMoviesLike(userId: string) {
  const connection = await dbConnectionPoolAsync.getConnection();
  const values: Array<string | number> = [userId];
  const sql = `SELECT movies_id, movie_title, poster_path FROM movie_view.movies_likes
                WHERE social_accounts_uid = ?
                ORDER BY created_at DESC;`;

  try {
    const [result] = await connection.execute(sql, values);
    connection.release();
    return result;
  } catch (err) {
    connection.release();
    console.error(err);
    throw err;
  }
}

async function getMoviesLikeCount(userId: string) {
  const connection = await dbConnectionPoolAsync.getConnection();
  const sql = `SELECT COUNT(*) AS totalCount FROM movie_view.movies_likes WHERE social_accounts_uid = ?`;
  const values = [userId];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(sql, values);
    connection.release();
    return result[0];
  } catch (err) {
    connection.release();
    console.error(err);
    throw err;
  }
}