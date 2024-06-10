import { db } from '@/app/db/db';

export interface ReviewLike {
  id: number;
  reviews_id: number;
  users_id: number;
};

export interface ILike {
  id?: number;
  reviews_id: number;
  liked_count: number;
  liked: number;
}

export const GET = async() => {
  try {
    const userId = 2;
    const result = await getLikes(userId);
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

async function getLikes(userId: number): Promise<ILike[]> {
  const sql = ` SELECT 
                  CONVERT(reviews_id, UNSIGNED) AS reviews_id, 
                  COUNT(*) AS liked_count,
                  SUM(users_id = ${userId}) > 0 AS liked
                FROM 
                  movie_view.reviews_likes
                GROUP BY 
                  reviews_id;`;
  
  try {
    const [result] = await db.promise().query(sql);
    return result as ILike[];
  } catch (err) {
    console.error(err);
    throw err;
  }
}