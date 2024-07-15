import { authOptions } from '@/lib/authOptions';
import { getDBConnection } from '@/lib/db';
import { formatUserId } from '@/utils/formatUserId';
import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';

interface ReviewData {
  movieId: number;
  title: string;
  rating: number;
  content: string;
  movieTitle: string;
  posterPath: string;
}

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

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
  
    const { provider, uid } = session ?? {};
    if (!provider || !uid) {
      return new Response('Authentication Error', { status: 401 });
    }
  
    const userId = formatUserId(provider, uid);
    if (!userId) {
      return new Response(JSON.stringify({ message: 'Authentication Error' }), {
        status: 401,
      });
    }
  
    let connection: PoolConnection | undefined;
    try {
      connection = await getDBConnection();
      await connection.beginTransaction();
  
      const data: ReviewData = await req.json();
      await addMovieId(
        data.movieId, 
        data.movieTitle, 
        data.posterPath, 
        connection
      );
      const review = await addReview(
        userId, 
        data, 
        connection
      );
  
      await connection.commit();
      connection.release();
  
      if (!review) {
        return new Response(JSON.stringify({ message: 'Bad Request' }), {
          status: 400,
        });
      }
  
      return new Response(
        JSON.stringify({ message: 'Review has been created.' }),
        {
          status: 201,
        }
      );
    } catch (err) {
      await connection?.rollback();
      connection?.release();
  
      return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
        status: 500,
      });
    }
  }
  
  async function addReview(userId: string, data: ReviewData, connection: PoolConnection) {
    const id = uuidv4().replace(/-/g, '');
    const sql = `INSERT INTO reviews (id, movies_id, social_accounts_uid, rating, title, content) VALUES(UNHEX(?), ?, ?, ?, ?, ?)`;
    const values = [
      id,
      data.movieId,
      userId,
      data.rating,
      data.title,
      data.content,
    ];
  
    try {
      const [result] = await connection.execute(sql, values);
      return (result as ResultSetHeader).affectedRows;
    } catch (err) {
      throw err;
    }
  }
  
  async function addMovieId(
    movieId: number,
    movieTitle: string,
    posterPath: string,
    connection: PoolConnection
  ) {
    const sql = `INSERT IGNORE INTO movies (id, title, poster_path) VALUES (?,?,?)`;
    const values = [movieId, movieTitle, posterPath];
  
    try {
      const [result] = await connection.execute(sql, values);
      return (result as ResultSetHeader).affectedRows;
    } catch (err) {
      throw err;
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