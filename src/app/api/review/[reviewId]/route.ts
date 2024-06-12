import { dbConnection as db } from '@/lib/db';
import { IReviewData } from '../route';
import { FieldPacket, RowDataPacket } from 'mysql2';

const USER_ID = 2;

// id별 리뷰 삭제
export async function DELETE(
  _req: Request,
  { params }: { params: { reviewId: number } }
) {
  try {
    // TODO: userId 받아오기 구현 필요
    const userId = USER_ID;

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

// id별 리뷰 수정
export async function PUT(
  req: Request,
  { params }: { params: { reviewId: number } }
) {
  try {
    // TODO: userId 받아오기 구현 필요
    const userId = USER_ID;

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

async function getReviewById(reviewId: number, userId: number) {
  const sql = `SELECT * FROM reviews WHERE id=UNHEX(?) AND users_id=? `;
  const values: Array<string | number> = [reviewId, userId];
  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await db
      .promise()
      .execute(sql, values);
    return result[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function deleteReview(reviewId: number, userId: number) {
  const sql = `DELETE FROM reviews WHERE id=UNHEX(?) AND users_id=? `;
  const values: Array<string | number> = [reviewId, userId];

  try {
    const [result] = await db.promise().query(sql, values);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function updateReview(
  reviewId: number,
  userId: number,
  data: IReviewData
) {
  const sql = `UPDATE reviews SET title=?, rating=?, content=? WHERE id=UNHEX(?) AND users_id=? `;
  const values: Array<string | number> = [
    data.title,
    data.rating,
    data.content,
    reviewId,
    userId,
  ];

  try {
    const [result] = await db.promise().query(sql, values);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
