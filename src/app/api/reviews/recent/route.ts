import { authOptions } from '@/lib/authOptions';
import { getDBConnection } from '@/lib/db';
import { getRecentReviews, getRecentReviewsCount } from '@/services/reviewServices';
import { formatUserId } from '@/utils/authUtils';
import { PoolConnection } from 'mysql2/promise';
import { getServerSession } from 'next-auth';


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let filter = searchParams.get('filter') ?? 'like';
  let page = searchParams.get('page') ?? 1;
  let userId;

  const session = await getServerSession(authOptions);

  if (session?.provider && session?.uid) {
    userId = formatUserId(session.provider, session.uid);
  }

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection();
    const reviews = await getRecentReviews(
      filter,
      userId,
      Number(page),
      connection
    );
    const count = await getRecentReviewsCount(connection);

    const result = {
      reviews,
      pagination: {
        currentPage: Number(page),
        totalCount: count ? count.totalCount : 0,
      },
    };
    connection.release();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    connection?.release();
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}