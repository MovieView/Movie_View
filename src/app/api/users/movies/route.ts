import { authOptions } from '@/lib/authOptions';
import { getDBConnection } from '@/lib/db';
import { getUserMoviesLike, getUserMoviesLikeCount } from '@/services/movieServices';
import { formatUserId } from '@/utils/authUtils';
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

    const movies = await getUserMoviesLike(social_accounts_uid, connection);
    const count = await getUserMoviesLikeCount(social_accounts_uid, connection);
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