import { authOptions } from '@/lib/authOptions';
import { getDBConnection } from '@/lib/db';
import { formatUserId } from '@/utils/formatUserId';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { getServerSession } from 'next-auth';

const MAX_RESULT = 8;
const PAGE = 1;
const SORT = 'latest';

export async function GET(
  req: Request,
  { params }: { params: { movieId: number } }
) {
  const { searchParams } = new URL(req.url);
  let maxResults = searchParams.get('maxResults') ?? MAX_RESULT;
  let page = searchParams.get('page') ?? PAGE;
  let sort = searchParams.get('sort') ?? SORT;
  const session = await getServerSession(authOptions);

  const { provider, uid } = session ?? {};
  if (!provider || !uid) {
    return new Response('Authentication Error', { status: 401 });
  }

  const userId = formatUserId(provider, uid);
  if (!userId) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection();
    const reviews = await getReviews(
      params.movieId,
      Number(maxResults),
      Number(page),
      sort,
      userId,
      connection
    );

    const count = await reviewsCount(
      params.movieId, 
      connection
    );
    const result = {
      reviews,
      pagination: {
        currentPage: +page,
        totalCount: count ? count.totalCount : 0,
      },
    };
    return Response.json(result);
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

async function getReviews(
  movieId: number,
  maxResults: number,
  page: number,
  sort: string,
  userId: string | null,
  connection: PoolConnection
) {
  const offset = maxResults * (page - 1);
  const values: Array<string | number> = [movieId, offset, maxResults];
  let liked = ``;
  if (userId) {
    liked = `, (SELECT COUNT(*) FROM movie_view.reviews_likes AS rl WHERE HEX(rl.reviews_id) = HEX(r.id) AND rl.social_accounts_uid = ?) > 0 AS liked`;
    values.unshift(userId);
  }

  const orderBy =
    sort === 'like' ? 'likes DESC, createdAt DESC' : 'createdAt DESC';
  const sql = `SELECT HEX(r.id) AS id, r.movies_id AS movieId, r.social_accounts_uid AS userId, r.rating, r.title, 
                r.content, r.created_at AS createdAt, r.updated_at AS updatedAt,
                REPLACE(JSON_EXTRACT(s.extra_data, '$.username'), '"', '') AS nickname, 
                REPLACE(JSON_EXTRACT(s.extra_data, '$.filepath'), '"', '') AS filePath,
                (SELECT COUNT(*) FROM reviews_likes AS rl WHERE HEX(rl.reviews_id) = HEX(r.id)) AS likes,
                (SELECT COUNT(*) FROM reviews_comments AS rc WHERE HEX(rc.reviews_id) = HEX(r.id)) AS commentsCount
                ${liked}
                FROM reviews AS r
                LEFT JOIN social_accounts AS s ON r.social_accounts_uid = s.uid
                WHERE r.movies_id=?
                ORDER BY ${orderBy}
                LIMIT ?, ?`;

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

async function reviewsCount(movieId: number, connection: PoolConnection) {
  const sql = `SELECT COUNT(*) AS totalCount FROM reviews WHERE movies_id=?`;
  const values = [movieId];

  try {
    connection = await getDBConnection();
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    return result[0];
  } catch (err) {
    throw err;
  }
}
