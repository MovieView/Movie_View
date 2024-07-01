import { dbConnectionPoolAsync } from '@/lib/db';
import { IReviewData } from '../route';
import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOPtions } from '@/lib/authOptions';
import { formatUserId } from '@/utils/formatUserId';
import { v4 as uuidv4 } from 'uuid';

export interface IComment {
  content: string;
}

// 대댓글 조회
const MAX_RESULT = 8;
const PAGE = 1;

export async function GET(
  req: Request,
  { params }: { params: { reviewId: number } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const maxResults = searchParams.get('maxResults') ?? MAX_RESULT;
    const page = searchParams.get('page') ?? PAGE;

    const comments = await getComments(
      params.reviewId,
      Number(maxResults),
      Number(page)
    );

    return new Response(JSON.stringify(comments), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

// 대댓글 추가
export async function POST(
  req: Request,
  { params }: { params: { reviewId: number } }
) {
  try {
    const session = await getServerSession(authOPtions);

    const { provider, uid } = session ?? {};

    if (!provider || !uid) {
      return new Response('Authentication Error', { status: 401 });
    }

    const formattedUid = formatUserId(provider, uid);

    if (!formattedUid) {
      return new Response(JSON.stringify({ message: 'Authentication Error' }), {
        status: 401,
      });
    }

    const user = await getUser(formattedUid);

    if (!user) {
      return new Response(JSON.stringify({ message: 'User does not exist.' }), {
        status: 404,
      });
    }

    // 대댓글 내용 받아오기
    const data: IComment = await req.json();

    // 대댓글 내용 DB 저장
    await addComment(params.reviewId, user.userId, data.content);

    return new Response(
      JSON.stringify({ message: 'Comment has been created.' }),
      {
        status: 201,
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { reviewId: number } }
) {
  try {
    const session = await getServerSession(authOPtions);

    if (!session?.provider && !session?.uid) {
      return;
    }

    const userId = formatUserId(session.provider, session.uid);

    if (!userId) {
      return new Response('Authentication Error', { status: 401 });
    }

    const review = await getReviewById(params.reviewId, userId);

    if (!review) {
      return new Response(
        JSON.stringify({ message: 'Review does not exist.' }),
        {
          status: 404,
        }
      );
    }

    await deleteReview(params.reviewId, userId);

    return new Response(
      JSON.stringify({ message: 'Review has been deleted.' }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { reviewId: number } }
) {
  try {
    const session = await getServerSession(authOPtions);
    if (!session?.provider && !session?.uid) {
      return;
    }

    const userId = formatUserId(session.provider, session.uid);

    if (!userId) {
      return new Response('Authentication Error', { status: 401 });
    }

    const review = await getReviewById(params.reviewId, userId);

    if (!review) {
      return new Response(
        JSON.stringify({ message: 'Review does not exist.' }),
        {
          status: 404,
        }
      );
    }

    const data: IReviewData = await req.json();

    await updateReview(params.reviewId, userId, data);

    return new Response(
      JSON.stringify({ message: 'Review has been updated.' }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

async function getReviewById(reviewId: number, userId: string) {
  const sql = `SELECT * FROM reviews WHERE id=UNHEX(?) AND social_accounts_uid=? `;
  const values: Array<string | number> = [reviewId, userId];
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

async function deleteReview(reviewId: number, userId: string) {
  const sql = `DELETE FROM reviews WHERE id=UNHEX(?) AND social_accounts_uid=? `;
  const values: Array<string | number> = [reviewId, userId];

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

async function updateReview(
  reviewId: number,
  userId: string,
  data: IReviewData
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
    const connection = await dbConnectionPoolAsync.getConnection();
    const [result] = await connection.execute(sql, values);
    connection.release();
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getComments(reviewId: number, maxResults: number, page: number) {
  const offset = maxResults * (page - 1);
  const values: Array<number> = [reviewId, offset, maxResults];
  const sql = `SELECT HEX(rc.id) AS id, u.nickname, rc.created_at AS createdAt, rc.updated_at AS updatedAt
                FROM reviews_comments AS rc
                LEFT JOIN users AS u ON u.id = rc.users_id
                WHERE HEX(rc.reviews_id) = ?
                ORDER BY createdAt
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

async function addComment(reviewId: number, userId: string, content: string) {
  const id = uuidv4().replace(/-/g, '');
  const sql = `INSERT INTO reviews_comments (id, users_id, reviews_id, content) VALUES(UNHEX(?), ?, UNHEX(?), ?)`;
  const values = [id, userId, reviewId, content];

  try {
    const connection = await dbConnectionPoolAsync.getConnection();
    const [result] = await connection.execute(sql, values);
    connection.release();
    return (result as ResultSetHeader).affectedRows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getUser(uid: string) {
  const sql = `SELECT users_id AS userId, uid FROM social_accounts WHERE uid=?`;
  const values = [uid];

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
