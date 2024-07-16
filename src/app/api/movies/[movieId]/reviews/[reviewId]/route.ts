import { getDBConnection } from '@/lib/db';
import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { formatUserId } from '@/utils/authUtils';
import { IReviewData } from '@/models/review.model';
import { PoolConnection } from 'mysql2/promise';

// 대댓글 조회
const MAX_RESULT = 8;
const PAGE = 1;

export async function GET(
  req: Request,
  { params }: { params: { reviewId: string } }
) {
  let connection: PoolConnection | undefined;
  try {
    const { searchParams } = new URL(req.url);
    const maxResults = searchParams.get('maxResults') ?? MAX_RESULT;
    const page = searchParams.get('page') ?? PAGE;

    connection = await getDBConnection();
    const comments = await getComments(
      params.reviewId,
      Number(maxResults),
      Number(page),
      connection
    );

    const count = await commentsCount(params.reviewId, connection);
    const result = {
      comments,
      pagination: {
        currentPage: +page,
        totalCount: count ? count.totalCount : 0,
      },
    };

    connection.release();
    return new Response(JSON.stringify(result), {
      status: 200,
    });
  } catch (err) {
    connection?.release();
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { reviewId: string } }
) {
  const session = await getServerSession(authOptions);

  const { provider, uid } = session ?? {};
  if (!provider || !uid) {
    return new Response('Authentication Error', { status: 401 });
  }

  const userId = formatUserId(provider, uid);
  if (!userId) {
    return new Response('Authentication Error', { status: 401 });
  }

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection();
    await connection.beginTransaction();

    const review = await getReviewById(
      params.reviewId, 
      userId, 
      connection
    );

    if (!review) {
      await connection.rollback();
      connection.release();

      return new Response(
        JSON.stringify({ message: 'Review does not exist.' }),
        {
          status: 404,
        }
      );
    }

    await deleteReview(params.reviewId, userId, connection);
    await connection.commit();
    connection.release();

    return new Response(
      JSON.stringify({ message: 'Review has been deleted.' }),
      {
        status: 200,
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

export async function PUT(
  req: Request,
  { params }: { params: { reviewId: string } }
) {
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

    const review = await getReviewById(params.reviewId, userId, connection);

    if (!review) {
      await connection.rollback();
      connection.release();

      return new Response(
        JSON.stringify({ message: 'Review does not exist.' }),
        {
          status: 404,
        }
      );
    }

    const data: IReviewData = await req.json();

    await updateReview(
      params.reviewId, 
      userId, 
      data, 
      connection
    );

    await connection.commit();
    connection.release();

    return new Response(
      JSON.stringify({ message: 'Review has been updated.' }),
      {
        status: 200,
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

async function getReviewById(reviewId: string, userId: string, connection: PoolConnection) {
  const sql = `SELECT * FROM reviews WHERE id=UNHEX(?) AND social_accounts_uid=? `;
  const values: Array<string | number> = [reviewId, userId];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    return result[0];
  } catch (err) {
    throw err;
  }
}

async function deleteReview(reviewId: string, userId: string, connection: PoolConnection) {
  const sql = `DELETE FROM reviews WHERE id=UNHEX(?) AND social_accounts_uid=? `;
  const values: Array<string | number> = [reviewId, userId];

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

async function updateReview(
  reviewId: string,
  userId: string,
  data: IReviewData,
  connection: PoolConnection
) {
  const sql = `UPDATE reviews SET title=?, rating=?, content=? WHERE id=UNHEX(?) AND social_accounts_uid=? `;
  const values: Array<string | number> = [
    data.title,
    data.rating,
    data.content,
    reviewId,
    userId,
  ];

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

async function getComments(
  reviewId: string,
  maxResults: number, 
  page: number,
  connection: PoolConnection
) {
  const offset = maxResults * (page - 1);
  const values: Array<number | string> = [reviewId, offset, maxResults];
  const sql = `SELECT HEX(rc.id) AS id, rc.content, s.uid AS userId,
                REPLACE(JSON_EXTRACT(s.extra_data, '$.filepath'), '"', '') AS filePath,
                REPLACE(JSON_EXTRACT(s.extra_data, '$.username'), '"', '') AS nickname, 
                rc.created_at AS createdAt, rc.updated_at AS updatedAt
                FROM reviews_comments AS rc
                LEFT JOIN users AS u ON u.id = rc.users_id
                LEFT JOIN social_accounts AS s ON rc.users_id = s.users_id
                WHERE HEX(rc.reviews_id) = ?
                ORDER BY createdAt
                LIMIT ?, ?`;

  try {
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
}

async function commentsCount(reviewId: string, connection: PoolConnection) {
  const sql = `SELECT COUNT(*) AS totalCount FROM reviews_comments WHERE HEX(reviews_id)=?`;
  const values = [reviewId];

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      sql,
      values
    );
    return result[0];
  } catch (err) {
    throw err;
  }
}