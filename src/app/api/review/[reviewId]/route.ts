import { dbConnectionPoolAsync } from '@/lib/db';
import { IReviewData } from '../route';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOPtions } from '@/lib/authOptions';
import { formatUserId } from '@/utils/formatUserId';

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
