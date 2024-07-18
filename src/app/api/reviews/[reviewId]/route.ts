import { getDBConnection } from '@/lib/db';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { formatUserId } from '@/utils/authUtils';
import { ICommentContent } from '@/models/comment.model';
import { IReviewData } from '@/models/review.model';
import { PoolConnection } from 'mysql2/promise';
import { addComment, getComments } from '@/services/reviewCommentServices';
import { deleteReview, getReviewById, updateReview } from '@/services/reviewServices';
import { getUserIDBySocialAccountsUID } from '@/services/userServices';

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

export async function POST(
  req: Request,
  { params }: { params: { reviewId: string } }
) {
  const session = await getServerSession(authOptions);

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

  let connection: PoolConnection | undefined;
  try {
    connection = await getDBConnection();
    await connection.beginTransaction();

    const user = await getUserIDBySocialAccountsUID(formattedUid, connection);
    if (!user) {
      return new Response(JSON.stringify({ message: 'User does not exist.' }), {
        status: 404,
      });
    }

    const data: ICommentContent = await req.json();

    await addComment(
      params.reviewId, 
      user.userId, 
      data.content,
      connection
    );

    await connection.commit();
    connection.release();

    return new Response(
      JSON.stringify({ message: 'Comment has been created.' }),
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