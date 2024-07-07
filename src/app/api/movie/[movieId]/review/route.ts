import { authOPtions } from '@/lib/authOptions';
import { dbConnectionPoolAsync } from '@/lib/db';
import { formatUserId } from '@/utils/formatUserId';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';

const MAX_RESULT = 8;
const PAGE = 1;
const SORT = 'latest';

export async function GET(
  req: Request,
  { params }: { params: { movieId: number } }
) {
  try {
    const { searchParams } = new URL(req.url);
    let maxResults = searchParams.get('maxResults') ?? MAX_RESULT;
    let page = searchParams.get('page') ?? PAGE;
    let sort = searchParams.get('sort') ?? SORT;
    const session = await getServerSession(authOPtions);
    if (!session?.provider && !session?.uid) {
      return;
    }

    const userId = formatUserId(session.provider, session.uid);

    if (!userId) {
      return;
    }

    const reviews = await getReviews(
      params.movieId,
      Number(maxResults),
      Number(page),
      sort,
      userId
    );

    const count = await reviewsCount(params.movieId);
    const result = {
      reviews,
      pagination: {
        currentPage: +page,
        totalCount: count ? count.totalCount : 0,
      },
    };
    return Response.json(result);
  } catch (err) {
    console.error(err);
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
  userId: string | null
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
                REPLACE(JSON_EXTRACT(s.extra_data, '$.filePath'), '"', '') AS filePath,
                (SELECT COUNT(*) FROM reviews_likes AS rl WHERE HEX(rl.reviews_id) = HEX(r.id)) AS likes,
                (SELECT COUNT(*) FROM reviews_comments AS rc WHERE HEX(rc.reviews_id) = HEX(r.id)) AS commentsCount
                ${liked}
                FROM reviews AS r
                LEFT JOIN social_accounts AS s ON r.social_accounts_uid = s.uid
                WHERE r.movies_id=?
                ORDER BY ${orderBy}
                LIMIT ?, ?`;

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

async function reviewsCount(movieId: number) {
  const sql = `SELECT COUNT(*) AS totalCount FROM reviews WHERE movies_id=?`;
  const values = [movieId];
  try {
    const connection = await dbConnectionPoolAsync.getConnection();
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    connection.release();
    return result[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}
