import { db } from '@/app/db/db';
import { ReviewLike } from '../route';

export const POST = async (
  req: Request,
  { params }: { params: { reviewId: number } }
) => {
  try {
    const users_id = 2;
    if (!users_id) {
      return new Response('Authentication Error', { status: 401 });
    }


    const like: ReviewLike = {
      id: Math.floor(Math.random() * 100),
      reviews_id: params.reviewId,
      users_id: users_id,
    };

    console.log(like);

    const result = await postLike(like);
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Internal server error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export const DELETE = async (
  req: Request,
  { params }: { params: { reviewId: number } }
) => {
  try {
    const userId = 2;
    const result = await deleteLike(params.reviewId, userId);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Internal server error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

async function postLike(
  like : ReviewLike
) {
  const sql = `INSERT INTO movie_view.reviews_likes 
               VALUES ( ${like.id}, ${like.reviews_id}, ${like.users_id});`;
  
  try {
    const [result] = await db.promise().query(sql);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function deleteLike(
  reviewId: number,
  userId: number
) {
  const sql = `DELETE FROM movie_view.reviews_likes WHERE reviews_id =${reviewId} AND users_id=${userId};`;
  
  try {
    const [result] = await db.promise().query(sql);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}