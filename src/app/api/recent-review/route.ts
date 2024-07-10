import { authOptions } from '@/lib/authOptions';
import { dbConnectionPoolAsync } from '@/lib/db';
import { formatUserId } from '@/utils/formatUserId';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';

const LIMIT = 10;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let filter = searchParams.get('filter') ?? 'like';
    let page = searchParams.get('page') ?? 1;
    let userId;

    const session = await getServerSession(authOptions);
    if (!session?.provider && !session?.uid) {
    } else {
      userId = formatUserId(session.provider, session.uid);
    }

    const reviews = await getRecentReviews(filter, userId, Number(page));

    const count = await recentReviewsCount();

    const result = {
      reviews,
      pagination: {
        currentPage: Number(page),
        totalCount: count ? count.totalCount : 0,
      },
    };
    return Response.json(result);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

async function getRecentReviews(
  filter: string,
  userId: string | undefined,
  page: number
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
    LIMIT ?, ?`;
  const connection = await dbConnectionPoolAsync.getConnection();
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

async function recentReviewsCount() {
  const sql = `SELECT COUNT(*) AS totalCount FROM reviews WHERE created_at BETWEEN DATE_ADD(NOW(), INTERVAL -1 WEEK) AND NOW()`;
  const connection = await dbConnectionPoolAsync.getConnection();
  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql
    );
    connection.release();
    return result[0];
  } catch (err) {
    connection.release();
    console.error(err);
    throw err;
  }
}
