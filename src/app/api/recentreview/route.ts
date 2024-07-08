import { authOptions } from '@/lib/authOptions';
import { dbConnectionPoolAsync } from '@/lib/db';
import { formatUserId } from '@/utils/formatUserId';
import { getServerSession } from 'next-auth';

async function getRecentReviews(filter: string, userId: string | undefined) {
  let liked = ``,
    orderBy = ``;
  const values: Array<string> = [];
  if (typeof userId !== `undefined`) {
    liked = `(SELECT COUNT(*) FROM movie_view.reviews_likes AS rl WHERE HEX(rl.reviews_id) = HEX(r.id) AND rl.social_accounts_uid = ?) > 0 AS liked, `;
    values.unshift(userId);
  }

  if (filter === 'liked') {
    orderBy = `likes DESC`;
  } else {
    orderBy = `r.created_at DESC`;
  }

  const sql = `SELECT HEX(r.id) AS id, r.movies_id AS movieId, r.social_accounts_uid AS userId, r.rating, r.title, 
    r.content, r.created_at AS createdAt, r.updated_at AS updatedAt,
    REPLACE(JSON_EXTRACT(s.extra_data, '$.username'), '"', '') AS nickname, 
    REPLACE(JSON_EXTRACT(s.extra_data, '$.filePath'), '"', '') AS filePath,
    (SELECT COUNT(*) FROM reviews_likes AS rl WHERE HEX(rl.reviews_id) = HEX(r.id)) AS likes,
    ${liked}
    m.title AS movieTitle, m.poster_path AS posterPath
    FROM reviews AS r
    LEFT JOIN social_accounts AS s ON r.social_accounts_uid = s.uid
    LEFT JOIN movies AS m ON r.movies_id = m.id
    WHERE r.created_at BETWEEN DATE_ADD(NOW(), INTERVAL -1 WEEK) AND NOW() 
    ORDER BY ${orderBy}
    LIMIT 6`;

  try {
    const connection = await dbConnectionPoolAsync.getConnection();
    const [result] = await connection.execute(sql, values);
    connection.release();
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let filter = searchParams.get('filter') ?? 'liked';

    const session = await getServerSession(authOptions);
    if (!session?.provider && !session?.uid) {
      return;
    }

    let userId = formatUserId(session.provider, session.uid);

    const reviews = await getRecentReviews(filter, userId);
    return Response.json(reviews);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
